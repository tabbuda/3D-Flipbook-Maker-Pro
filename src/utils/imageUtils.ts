import { BookProject } from '../types/flipbook';
import { getCoverImageForTemplate } from '../components/CoverArtworkRenderer';

/**
 * Converts a File object to an optimized Base64 data URL string.
 */
export function fileToBase64(file: File, maxDim = 1920): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width <= maxDim && height <= maxDim && file.size < 800 * 1024) {
          resolve(e.target?.result as string);
          return;
        }

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const outputMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(outputMime, 0.88);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Converts any image URL (local path, http/https, or blob URL) to a Base64 data URL.
 */
export async function urlToBase64(url: string): Promise<string> {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('data:')) return url; // Already Base64

  // Strategy 1: Fetch and FileReader (works for same-origin, local assets, CORS-enabled remotes, and blob URLs)
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (response.ok) {
      const blob = await response.blob();
      return await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            resolve(url);
          }
        };
        reader.onerror = () => resolve(url);
        reader.readAsDataURL(blob);
      });
    }
  } catch (e) {
    // Fetch failed, try canvas strategy
  }

  // Strategy 2: Image element + Canvas (works for browser-cacheable images)
  try {
    return await new Promise<string>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width || 400;
          canvas.height = img.naturalHeight || img.height || 600;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
            if (dataUrl && dataUrl.startsWith('data:')) {
              resolve(dataUrl);
              return;
            }
          }
        } catch {
          // Canvas tainted or unavailable
        }
        resolve(url);
      };
      img.onerror = () => resolve(url);
      img.src = url;
    });
  } catch {
    return url;
  }
}

/**
 * Traverses all images in a BookProject (cover, pages, blocks, author avatars)
 * and asynchronously converts them to Base64 data URLs for 100% offline standalone portability.
 */
export async function convertBookImagesToBase64(book: BookProject): Promise<BookProject> {
  const cloned: BookProject = JSON.parse(JSON.stringify(book));

  // 1. Resolve & Convert Front Cover Image
  const frontCoverPage = cloned.pages.find((p) => p.template === 'cover-front') || cloned.pages[0];
  const resolvedCoverUrl =
    frontCoverPage?.coverImageUrl ||
    frontCoverPage?.imageUrl ||
    cloned.coverImageUrl ||
    getCoverImageForTemplate(cloned.themeId || cloned.id);

  if (resolvedCoverUrl) {
    const base64Cover = await urlToBase64(resolvedCoverUrl);
    if (frontCoverPage) {
      frontCoverPage.coverImageUrl = base64Cover;
      frontCoverPage.imageUrl = base64Cover;
    }
    cloned.coverImageUrl = base64Cover;
  }

  // 2. Convert all pages and modular blocks
  const pagePromises = cloned.pages.map(async (page) => {
    // Page direct images
    if (page.imageUrl && !page.imageUrl.startsWith('data:')) {
      page.imageUrl = await urlToBase64(page.imageUrl);
    }
    if (page.coverImageUrl && !page.coverImageUrl.startsWith('data:')) {
      page.coverImageUrl = await urlToBase64(page.coverImageUrl);
    }
    if (page.authorAvatarUrl && !page.authorAvatarUrl.startsWith('data:')) {
      page.authorAvatarUrl = await urlToBase64(page.authorAvatarUrl);
    }

    // Modular Blocks inside page
    if (page.blocks && Array.isArray(page.blocks)) {
      const blockPromises = page.blocks.map(async (block) => {
        if (block.imageUrl && !block.imageUrl.startsWith('data:')) {
          block.imageUrl = await urlToBase64(block.imageUrl);
        }
        if (block.imageUrl2 && !block.imageUrl2.startsWith('data:')) {
          block.imageUrl2 = await urlToBase64(block.imageUrl2);
        }
        if (block.authorAvatarUrl && !block.authorAvatarUrl.startsWith('data:')) {
          block.authorAvatarUrl = await urlToBase64(block.authorAvatarUrl);
        }
        if (block.items && Array.isArray(block.items)) {
          const itemPromises = block.items.map(async (it) => {
            if (it.imageUrl && !it.imageUrl.startsWith('data:')) {
              it.imageUrl = await urlToBase64(it.imageUrl);
            }
          });
          await Promise.all(itemPromises);
        }
      });
      await Promise.all(blockPromises);
    }
  });

  await Promise.all(pagePromises);
  return cloned;
}
