import * as pdfjsLib from 'pdfjs-dist';
import { BookProject, PageContent } from '../types/flipbook';

// Set up PDF.js worker using unpkg or cloudflare cdn matching version
// Or fallback safely so it works smoothly in all browser environments
const PDFJS_VERSION = pdfjsLib.version || '4.10.38';
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.mjs`;
}

export interface PdfConversionOptions {
  scale?: number; // 1.5 for standard, 2.0 for high-res retina, 2.5 for Ultra
  maxPages?: number;
  startPage?: number;
  endPage?: number;
  makeFirstPageCover?: boolean;
  makeLastPageBackCover?: boolean;
  title?: string;
  themeId?: any;
  onProgress?: (progress: {
    current: number;
    total: number;
    percent: number;
    statusText: string;
  }) => void;
}

export interface PdfMetadata {
  numPages: number;
  title?: string;
  author?: string;
  creator?: string;
  pageSize: { width: number; height: number };
  aspectRatio: number;
  orientation: 'portrait' | 'landscape' | 'square';
  proportionalWidth: number;
  proportionalHeight: number;
}

/**
 * Quick analysis to read page count and metadata from a PDF file
 */
export async function inspectPdfFile(file: File): Promise<PdfMetadata> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@' + PDFJS_VERSION + '/cmaps/',
    cMapPacked: true,
  });

  const pdfDoc = await loadingTask.promise;
  let title = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
  let author = 'Author';

  try {
    const meta = await pdfDoc.getMetadata();
    const info = meta?.info as any;
    if (info?.Title && typeof info.Title === 'string' && info.Title.trim().length > 0) {
      title = info.Title.trim();
    }
    if (info?.Author && typeof info.Author === 'string' && info.Author.trim().length > 0) {
      author = info.Author.trim();
    }
  } catch (err) {
    // ignore metadata error
  }

  // Get first page dimension
  const firstPage = await pdfDoc.getPage(1);
  const viewport = firstPage.getViewport({ scale: 1.0 });

  const rawWidth = Math.round(viewport.width);
  const rawHeight = Math.round(viewport.height);
  const aspectRatio = rawWidth / rawHeight;

  let orientation: 'portrait' | 'landscape' | 'square' = 'portrait';
  let propWidth = 480;
  let propHeight = 679;

  if (aspectRatio > 1.05) {
    // Landscape: fix width to 680, calculate height proportionally
    orientation = 'landscape';
    propWidth = 680;
    propHeight = Math.round(propWidth / aspectRatio);
  } else if (aspectRatio < 0.95) {
    // Portrait: fix height to 679 (A4 standard height), calculate width proportionally
    orientation = 'portrait';
    propHeight = 679;
    propWidth = Math.round(propHeight * aspectRatio);
  } else {
    // Square
    orientation = 'square';
    propWidth = 560;
    propHeight = 560;
  }

  return {
    numPages: pdfDoc.numPages,
    title,
    author,
    pageSize: {
      width: rawWidth,
      height: rawHeight,
    },
    aspectRatio,
    orientation,
    proportionalWidth: propWidth,
    proportionalHeight: propHeight,
  };
}

/**
 * Converts a PDF file into a fully structured 3D BookProject
 */
export async function convertPdfToFlipbook(
  file: File,
  options: PdfConversionOptions = {}
): Promise<{ project: BookProject; thumbnails: string[] }> {
  const {
    scale = 1.75,
    startPage = 1,
    endPage,
    makeFirstPageCover = true,
    makeLastPageBackCover = true,
    title: customTitle,
    themeId = 'emerald-gold',
    onProgress,
  } = options;

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@' + PDFJS_VERSION + '/cmaps/',
    cMapPacked: true,
  });

  const pdfDoc = await loadingTask.promise;
  const totalDocPages = pdfDoc.numPages;

  const actualStart = Math.max(1, startPage);
  const actualEnd = Math.min(totalDocPages, endPage || totalDocPages);
  const pagesToConvert = actualEnd - actualStart + 1;

  let bookTitle = customTitle || file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
  let bookAuthor = 'Author';

  try {
    const meta = await pdfDoc.getMetadata();
    const info = meta?.info as any;
    if (!customTitle && info?.Title && typeof info.Title === 'string' && info.Title.trim().length > 0) {
      bookTitle = info.Title.trim();
    }
    if (info?.Author && typeof info.Author === 'string' && info.Author.trim().length > 0) {
      bookAuthor = info.Author.trim();
    }
  } catch (e) {
    // ignore
  }

  const generatedPages: PageContent[] = [];
  const thumbnails: string[] = [];

  // Get dimensions & aspect ratio from first page
  const samplePage = await pdfDoc.getPage(actualStart);
  const sampleViewport = samplePage.getViewport({ scale: 1.0 });
  const rawPageWidth = sampleViewport.width;
  const rawPageHeight = sampleViewport.height;
  const docAspectRatio = rawPageWidth / rawPageHeight;

  let docOrientation: 'portrait' | 'landscape' | 'square' = 'portrait';
  let basePageWidth = 480;
  let basePageHeight = 679;

  if (docAspectRatio > 1.05) {
    // Landscape: fix width to 680, calculate height proportionally
    docOrientation = 'landscape';
    basePageWidth = 680;
    basePageHeight = Math.round(basePageWidth / docAspectRatio);
  } else if (docAspectRatio < 0.95) {
    // Portrait: fix height to 679, calculate width proportionally
    docOrientation = 'portrait';
    basePageHeight = 679;
    basePageWidth = Math.round(basePageHeight * docAspectRatio);
  } else {
    // Square
    docOrientation = 'square';
    basePageWidth = 560;
    basePageHeight = 560;
  }

  for (let pageNum = actualStart; pageNum <= actualEnd; pageNum++) {
    const currentProgressIdx = pageNum - actualStart + 1;

    onProgress?.({
      current: currentProgressIdx,
      total: pagesToConvert,
      percent: Math.round((currentProgressIdx / pagesToConvert) * 100),
      statusText: `Rendering page ${pageNum} of ${totalDocPages} (${Math.round(
        (currentProgressIdx / pagesToConvert) * 100
      )}%)...`,
    });

    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    // Render page to off-screen canvas
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d', { alpha: false });

    if (!ctx) {
      throw new Error('Failed to create canvas rendering context');
    }

    // Fill white background first
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const renderContext: any = {
      canvasContext: ctx,
      viewport: viewport,
    };

    await page.render(renderContext).promise;

    // Export image as high quality JPEG/WebP dataUrl
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.92);
    thumbnails.push(imageDataUrl);

    const isFirst = pageNum === actualStart;
    const isLast = pageNum === actualEnd;

    // Determine page template type
    if (isFirst && makeFirstPageCover) {
      generatedPages.push({
        id: `p-cov-front-${Date.now()}-${pageNum}`,
        template: 'cover-front',
        title: bookTitle,
        subtitle: 'Digital Publication',
        headerTag: 'PDF CONVERTED EDITION',
        footerNote: `${totalDocPages} PAGES`,
        imageUrl: imageDataUrl,
        isPdfPage: true,
        aspectRatio: docAspectRatio,
        orientation: docOrientation,
        blocks: [],
      });
    } else if (isLast && makeLastPageBackCover && pagesToConvert > 2) {
      generatedPages.push({
        id: `p-cov-back-${Date.now()}-${pageNum}`,
        template: 'cover-back',
        title: bookTitle,
        subtitle: 'Thank you for reading.',
        footerNote: '3D INTERACTIVE FLIPBOOK',
        isbn: `PDF-${Date.now().toString().slice(-6)}`,
        imageUrl: imageDataUrl,
        isPdfPage: true,
        aspectRatio: docAspectRatio,
        orientation: docOrientation,
        blocks: [],
      });
    } else {
      // Clean, full-bleed PDF Page
      generatedPages.push({
        id: `p-pdf-${Date.now()}-${pageNum}`,
        template: 'pdf-page',
        title: `Page ${pageNum}`,
        imageUrl: imageDataUrl,
        imageCaption: `Page ${pageNum}`,
        isPdfPage: true,
        aspectRatio: docAspectRatio,
        orientation: docOrientation,
        blocks: [],
      });
    }
  }

  const newProject: BookProject = {
    id: `book-${Date.now()}`,
    title: bookTitle.toUpperCase(),
    subtitle: `${pagesToConvert}-Page Digital Edition`,
    author: bookAuthor,
    edition: 'Digital 3D Edition',
    year: new Date().getFullYear().toString(),
    publisher: 'FlipApp 3D Engine',
    themeId: themeId,
    soundEnabled: true,
    pageTurnSpeed: 'normal',
    pages: generatedPages,
    aspectRatio: docAspectRatio,
    orientation: docOrientation,
    pageWidth: basePageWidth,
    pageHeight: basePageHeight,
  };

  return {
    project: newProject,
    thumbnails,
  };
}
