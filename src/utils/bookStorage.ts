import { BookProject, SavedBookRecord } from '../types/flipbook';
import { INITIAL_BOOK_PROJECT } from '../constants/templates';

const STORAGE_KEY_CURRENT_BOOK = 'flipbook_active_project';
const STORAGE_KEY_LIBRARY = 'flipbook_my_bookshelf';

/**
 * Safely saves the active book to browser localStorage (Autosave)
 * and keeps the library record updated.
 */
export function saveActiveBook(book: BookProject): void {
  try {
    const serialized = JSON.stringify(book);
    localStorage.setItem(STORAGE_KEY_CURRENT_BOOK, serialized);

    // Also update / insert into library
    saveBookToLibrary(book);
  } catch (err) {
    console.warn('Failed to autosave book to localStorage:', err);
  }
}

/**
 * Loads the active working book from localStorage
 */
export function loadActiveBook(): BookProject | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT_BOOK);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.id && Array.isArray(parsed.pages)) {
      return parsed as BookProject;
    }
  } catch (err) {
    console.warn('Failed to load active book from localStorage:', err);
  }
  return null;
}

/**
 * Retrieves all saved books from the user's local bookshelf
 */
export function getLibrary(): SavedBookRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LIBRARY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.sort((a, b) => b.lastModified - a.lastModified);
    }
  } catch (err) {
    console.warn('Failed to read bookshelf from localStorage:', err);
  }
  return [];
}

/**
 * Saves or updates a book in the library bookshelf
 */
export function saveBookToLibrary(book: BookProject): SavedBookRecord {
  const library = getLibrary();
  const now = Date.now();

  const existingIndex = library.findIndex((item) => item.id === book.id);

  // Extract cover image if available on front cover page
  const frontCoverPage = book.pages.find((p) => p.template === 'cover-front');
  const coverImage = frontCoverPage?.imageUrl || undefined;

  const record: SavedBookRecord = {
    id: book.id || `book-${now}`,
    title: book.title || 'Untitled Book',
    subtitle: book.subtitle,
    author: book.author,
    themeId: book.themeId,
    pageCount: book.pages.length,
    lastModified: now,
    createdAt: existingIndex >= 0 ? library[existingIndex].createdAt || now : now,
    coverImage,
    project: {
      ...book,
      id: book.id || `book-${now}`,
    },
  };

  if (existingIndex >= 0) {
    library[existingIndex] = record;
  } else {
    library.unshift(record);
  }

  try {
    localStorage.setItem(STORAGE_KEY_LIBRARY, JSON.stringify(library));
  } catch (err) {
    console.warn('Failed to update bookshelf storage:', err);
  }

  return record;
}

/**
 * Deletes a book from the local bookshelf
 */
export function deleteBookFromLibrary(id: string): void {
  const library = getLibrary().filter((item) => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY_LIBRARY, JSON.stringify(library));
  } catch (err) {
    console.warn('Failed to delete book from localStorage:', err);
  }
}

/**
 * Duplicates an existing book in the bookshelf
 */
export function duplicateBook(id: string): BookProject | null {
  const library = getLibrary();
  const source = library.find((item) => item.id === id);
  if (!source) return null;

  const now = Date.now();
  const clonedProject: BookProject = {
    ...JSON.parse(JSON.stringify(source.project)),
    id: `book-${now}-${Math.random().toString(36).substring(2, 6)}`,
    title: `${source.project.title} (Copy)`,
  };

  saveBookToLibrary(clonedProject);
  return clonedProject;
}

/**
 * Generates and triggers download of a single `.flipbook` portable project file
 */
export function exportBookAsFlipbookFile(book: BookProject): void {
  const payload = {
    format: 'flipbook-studio-project',
    version: '2.0',
    exportedAt: new Date().toISOString(),
    exportedTimestamp: Date.now(),
    book: {
      ...book,
      id: book.id || `book-${Date.now()}`,
    },
  };

  const fileName = `${(book.title || 'my-3d-flipbook')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'my-3d-book'}.flipbook`;

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Imports a `.flipbook` project file from disk
 */
export function importBookFromFlipbookFile(file: File): Promise<BookProject> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        let bookData: BookProject | null = null;

        // Support both wrapped format and direct BookProject JSON
        if (parsed.format === 'flipbook-studio-project' && parsed.book) {
          bookData = parsed.book;
        } else if (parsed.id && Array.isArray(parsed.pages)) {
          bookData = parsed;
        }

        if (!bookData || !Array.isArray(bookData.pages)) {
          throw new Error('Invalid .flipbook file structure.');
        }

        // Assign a fresh ID or preserve
        if (!bookData.id) {
          bookData.id = `book-${Date.now()}`;
        }

        // Save into local library automatically
        saveBookToLibrary(bookData);
        saveActiveBook(bookData);

        resolve(bookData);
      } catch (err: any) {
        reject(new Error(err?.message || 'Unable to parse .flipbook file.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
}

/**
 * Exports ALL books in user's library as a single master backup file
 */
export function exportAllLibraryBackup(): void {
  const library = getLibrary();
  const payload = {
    format: 'flipbook-studio-library-backup',
    version: '2.0',
    backupAt: new Date().toISOString(),
    totalBooks: library.length,
    books: library,
  };

  const fileName = `flipbook-library-all-books-backup-${new Date().toISOString().slice(0, 10)}.flipbook-backup`;
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Imports a master `.flipbook-backup` file
 */
export function importAllLibraryBackup(
  file: File
): Promise<{ count: number; imported: SavedBookRecord[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        if (!parsed.books || !Array.isArray(parsed.books)) {
          throw new Error('Invalid library backup file.');
        }

        let importedCount = 0;
        const importedRecords: SavedBookRecord[] = [];

        parsed.books.forEach((item: any) => {
          const project = item.project || (item.id && item.pages ? item : null);
          if (project && Array.isArray(project.pages)) {
            const saved = saveBookToLibrary(project);
            importedRecords.push(saved);
            importedCount++;
          }
        });

        resolve({ count: importedCount, imported: importedRecords });
      } catch (err: any) {
        reject(new Error(err?.message || 'Failed to restore library backup.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read backup file.'));
    reader.readAsText(file);
  });
}

/**
 * Formats a unix timestamp into user-friendly time string
 */
export function formatTimeAgo(ts: number): string {
  if (!ts) return 'Recently';
  const now = Date.now();
  const diffSec = Math.floor((now - ts) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hours ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} days ago`;

  const date = new Date(ts);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}
