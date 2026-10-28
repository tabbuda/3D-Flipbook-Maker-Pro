import { BookProject, SavedBookRecord } from '../types/flipbook';

const DB_NAME = 'FlipStudio_DB_v2';
const DB_VERSION = 1;
const STORE_BOOKS = 'books';
const STORE_PUBLISHED = 'published_books';

let dbInstance: IDBDatabase | null = null;

/**
 * Initializes and returns the IndexedDB instance
 */
export function openFlipbookDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser environment.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_BOOKS)) {
        const bookStore = db.createObjectStore(STORE_BOOKS, { keyPath: 'id' });
        bookStore.createIndex('lastModified', 'lastModified', { unique: false });
        bookStore.createIndex('title', 'title', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_PUBLISHED)) {
        const pubStore = db.createObjectStore(STORE_PUBLISHED, { keyPath: 'id' });
        pubStore.createIndex('publishedAt', 'publishedAt', { unique: false });
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB'));
    };
  });
}

/**
 * Saves a heavy book project (supports 500+ pages / 500MB without localStorage limits)
 */
export async function saveBookToIndexedDB(book: BookProject): Promise<SavedBookRecord> {
  const db = await openFlipbookDB();
  const now = Date.now();
  const bookId = book.id || `book-${now}`;

  // Extract cover image
  const frontCover = book.pages.find((p) => p.template === 'cover-front');
  const coverImage = frontCover?.imageUrl || undefined;

  const record: SavedBookRecord = {
    id: bookId,
    title: book.title || 'Untitled Publication',
    subtitle: book.subtitle,
    author: book.author,
    themeId: book.themeId,
    pageCount: book.pages.length,
    lastModified: now,
    createdAt: now,
    coverImage,
    project: {
      ...book,
      id: bookId,
    },
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_BOOKS], 'readwrite');
    const store = transaction.objectStore(STORE_BOOKS);
    const request = store.put(record);

    request.onsuccess = () => resolve(record);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Loads a book project by ID from IndexedDB
 */
export async function loadBookFromIndexedDB(id: string): Promise<BookProject | null> {
  const db = await openFlipbookDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_BOOKS], 'readonly');
    const store = transaction.objectStore(STORE_BOOKS);
    const request = store.get(id);

    request.onsuccess = () => {
      const record = request.result as SavedBookRecord | undefined;
      if (record && record.project) {
        resolve(record.project);
      } else {
        // Check published store as fallback
        const pubTx = db.transaction([STORE_PUBLISHED], 'readonly');
        const pubStore = pubTx.objectStore(STORE_PUBLISHED);
        const pubReq = pubStore.get(id);
        pubReq.onsuccess = () => {
          const pubRecord = pubReq.result;
          resolve(pubRecord?.project || null);
        };
        pubReq.onerror = () => resolve(null);
      }
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Publishes a book with a unique public share ID
 */
export async function publishBookToCloudStore(book: BookProject): Promise<{
  shareId: string;
  shareUrl: string;
  publishedAt: number;
}> {
  const db = await openFlipbookDB();
  const publishedAt = Date.now();
  const shareId = book.id || `share-${publishedAt}`;

  const publishRecord = {
    id: shareId,
    publishedAt,
    title: book.title,
    pageCount: book.pages.length,
    project: book,
  };

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction([STORE_PUBLISHED, STORE_BOOKS], 'readwrite');
    transaction.objectStore(STORE_PUBLISHED).put(publishRecord);
    transaction.objectStore(STORE_BOOKS).put({
      id: shareId,
      title: book.title,
      subtitle: book.subtitle,
      author: book.author,
      themeId: book.themeId,
      pageCount: book.pages.length,
      lastModified: publishedAt,
      coverImage: book.pages[0]?.imageUrl,
      project: book,
    });

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = `${baseUrl}/?read=${encodeURIComponent(shareId)}`;

  return {
    shareId,
    shareUrl,
    publishedAt,
  };
}

/**
 * Loads all saved books from IndexedDB
 */
export async function getAllBooksFromIndexedDB(): Promise<SavedBookRecord[]> {
  const db = await openFlipbookDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_BOOKS], 'readonly');
    const store = transaction.objectStore(STORE_BOOKS);
    const request = store.getAll();

    request.onsuccess = () => {
      const records = (request.result || []) as SavedBookRecord[];
      records.sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));
      resolve(records);
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Deletes a book from IndexedDB
 */
export async function deleteBookFromIndexedDB(id: string): Promise<void> {
  const db = await openFlipbookDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_BOOKS, STORE_PUBLISHED], 'readwrite');
    transaction.objectStore(STORE_BOOKS).delete(id);
    transaction.objectStore(STORE_PUBLISHED).delete(id);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}
