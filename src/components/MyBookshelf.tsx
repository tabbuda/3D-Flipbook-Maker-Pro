import React, { useState, useEffect, useRef } from 'react';
import { BookProject, SavedBookRecord } from '../types/flipbook';
import {
  getLibrary,
  deleteBookFromLibrary,
  duplicateBook,
  exportBookAsFlipbookFile,
  importBookFromFlipbookFile,
  exportAllLibraryBackup,
  importAllLibraryBackup,
  formatTimeAgo,
  saveBookToLibrary,
} from '../utils/bookStorage';
import { INITIAL_BOOK_PROJECT } from '../constants/templates';
import {
  BookOpen,
  Plus,
  Download,
  Upload,
  Copy,
  Trash2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  HardDrive,
  FileCode,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FolderDown,
  FolderUp,
  FileText,
  Search,
  BookMarked,
  Info,
  Crown,
} from 'lucide-react';
import { getLicenseInfo, getPlanLimits, onLicenseChange } from '../utils/licenseManager';

interface MyBookshelfProps {
  onOpenBook: (book: BookProject) => void;
  onCreateNewBook: () => void;
  onBrowseTemplates: () => void;
  onOpenPdfModal?: () => void;
  onOpenLicenseModal?: () => void;
}

export const MyBookshelf: React.FC<MyBookshelfProps> = ({
  onOpenBook,
  onCreateNewBook,
  onBrowseTemplates,
  onOpenPdfModal,
  onOpenLicenseModal,
}) => {
  const [license, setLicense] = useState(() => getLicenseInfo());

  useEffect(() => {
    return onLicenseChange((info) => setLicense(info));
  }, []);

  const limits = getPlanLimits(license.tier);
  const isPro = license.tier === 'pro';

  const [books, setBooks] = useState<SavedBookRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  const refreshLibrary = () => {
    const list = getLibrary();
    setBooks(list);
  };

  useEffect(() => {
    refreshLibrary();
  }, []);

  const showNotify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Handle single .flipbook file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const importedBook = await importBookFromFlipbookFile(file);
      refreshLibrary();
      showNotify('success', `"${importedBook.title}" successfully restored into your library!`);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      showNotify('error', err?.message || 'Failed to import .flipbook file.');
    } finally {
      setIsImporting(false);
    }
  };

  // Handle master backup restore
  const handleBackupUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const result = await importAllLibraryBackup(file);
      refreshLibrary();
      showNotify('success', `Restored ${result.count} books from backup file!`);
      if (backupInputRef.current) backupInputRef.current.value = '';
    } catch (err: any) {
      showNotify('error', err?.message || 'Failed to restore master backup.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const cloned = duplicateBook(id);
    if (cloned) {
      refreshLibrary();
      showNotify('success', `Created copy of "${cloned.title}"!`);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteBookFromLibrary(id);
    setDeleteConfirmId(null);
    refreshLibrary();
    showNotify('success', 'Book removed from local storage.');
  };

  const handleExportSingle = (book: BookProject, e: React.MouseEvent) => {
    e.stopPropagation();
    exportBookAsFlipbookFile(book);
    showNotify('success', `Downloaded "${book.title}.flipbook" backup file!`);
  };

  const filteredBooks = books.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      b.title.toLowerCase().includes(q) ||
      b.subtitle?.toLowerCase().includes(q) ||
      b.author?.toLowerCase().includes(q)
    );
  });

  const handleCreateNewBookClick = () => {
    if (!isPro && books.length >= limits.maxBooks) {
      showNotify(
        'error',
        `Free Starter Plan allows up to ${limits.maxBooks} active books. Please delete an older book draft or upgrade to Pro.`
      );
      if (onOpenLicenseModal) onOpenLicenseModal();
      return;
    }
    onCreateNewBook();
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-100 text-slate-800 p-4 sm:p-6 lg:p-8 selection:bg-emerald-600 selection:text-white">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Toast Notification */}
        {notification && (
          <div
            className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center justify-between shadow-lg transition-all animate-in fade-in slide-in-from-top-2 ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-xs opacity-60 hover:opacity-100 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Top Header & Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
              <HardDrive className="w-3.5 h-3.5 text-emerald-700" />
              <span>Offline Device Storage & Bookshelf</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              My Bookshelf
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              All your publication drafts and saved books are stored locally on your device. Your data remains completely private and offline.
            </p>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Hidden inputs */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".flipbook,.json"
              className="hidden"
            />
            <input
              type="file"
              ref={backupInputRef}
              onChange={handleBackupUpload}
              accept=".flipbook-backup,.json"
              className="hidden"
            />

            {/* PDF to 3D Button */}
            {onOpenPdfModal && (
              <button
                onClick={onOpenPdfModal}
                className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02]"
                title="Convert PDF document to 3D Flipbook"
              >
                <FileText className="w-3.5 h-3.5 text-rose-600" />
                <span>Import PDF</span>
              </button>
            )}

            {/* Import Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="Open or restore a saved .flipbook file from your computer"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              <span>Import .flipbook</span>
            </button>

            {/* Backup All Button */}
            {books.length > 0 && (
              <button
                onClick={exportAllLibraryBackup}
                className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                title="Download single backup file containing all your books"
              >
                <FolderDown className="w-3.5 h-3.5 text-emerald-600" />
                <span>Backup All Books</span>
              </button>
            )}

            {/* New Book Button */}
            <button
              onClick={handleCreateNewBookClick}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition-all hover:scale-[1.02] flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Book</span>
            </button>
          </div>
        </div>

        {/* Plan Tier Status Banner */}
        {isPro ? (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-emerald-300 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Crown className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-emerald-950">PRO Lifetime Plan Active</span>
                  <span className="px-2 py-0.2 bg-emerald-600 text-white text-[9px] font-bold rounded-full uppercase">UNLIMITED</span>
                </div>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Unlimited publications, up to 150-page PDF conversion, and 100% white-label exports.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-white/80 px-3 py-1.5 rounded-xl border border-emerald-200">
              {books.length} Active Publications
            </span>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-amber-950">Free Starter Tier</span>
                  <span className="px-1.5 py-0.2 bg-amber-200 text-amber-900 text-[10px] font-mono font-bold rounded">
                    {books.length} / {limits.maxBooks} Books Used
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Free Starter lets you save up to {limits.maxBooks} projects locally. Upgrade to Pro for unlimited books & 150-page PDF conversions.
                </p>
              </div>
            </div>

            {onOpenLicenseModal && (
              <button
                type="button"
                onClick={onOpenLicenseModal}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 text-white font-bold text-xs shadow-xs transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <Crown className="w-3.5 h-3.5 text-amber-200" />
                <span>Upgrade to Pro Lifetime</span>
              </button>
            )}
          </div>
        )}

        {/* EXPLANATORY SAFETY BANNER (Explains format & persistence) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/70 to-slate-50 border border-emerald-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                How is your data kept secure?
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed max-w-3xl">
                • <strong>Auto-Saved Locally</strong>: Every edit is saved automatically to your browser’s local IndexedDB storage. You can close the tab or return anytime without losing progress.<br />
                • <strong>Portability & Backup</strong>: To transfer your work to another computer or device, click <strong>"Download .flipbook"</strong> to export a self-contained project backup file.
              </p>
            </div>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 text-xs font-bold text-emerald-700 hover:text-emerald-800 underline flex items-center gap-1 cursor-pointer"
          >
            <span>Restore Project File</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search Bar & Counter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by book title or author..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:border-emerald-500 shadow-xs"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Total Books: <span className="font-bold text-slate-800">{filteredBooks.length}</span>
          </div>
        </div>

        {/* BOOKS GRID */}
        {filteredBooks.length === 0 ? (
          /* Empty State */
          <div className="p-10 sm:p-14 rounded-3xl bg-white border border-slate-200 text-center space-y-5 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
              <BookOpen className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-slate-900">
                {searchQuery ? 'No matching books found' : 'Your Bookshelf is Empty'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {searchQuery
                  ? 'Please try a different search query or clear the search field.'
                  : 'You have not saved any publications yet. Start a new book or select from our curated templates.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={onCreateNewBook}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Start Blank Book</span>
              </button>

              <button
                onClick={onBrowseTemplates}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Browse 24+ Presets</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Upload .flipbook File</span>
              </button>
            </div>
          </div>
        ) : (
          /* Grid of Saved Books */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((item) => (
              <div
                key={item.id}
                onClick={() => onOpenBook(item.project)}
                className="group rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer relative"
              >
                {/* Book Card Top Banner / Preview Accent */}
                <div className="p-5 bg-gradient-to-br from-slate-50 to-emerald-50/30 border-b border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <BookMarked className="w-3 h-3" />
                      <span>{item.pageCount} Pages</span>
                    </span>

                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(item.lastModified)}</span>
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    {item.subtitle && (
                      <p className="text-xs text-slate-500 line-clamp-1">{item.subtitle}</p>
                    )}
                    {item.author && (
                      <p className="text-[11px] text-slate-400">By {item.author}</p>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-3.5 bg-slate-50 flex items-center justify-between gap-2 border-t border-slate-100">
                  {/* Primary Open Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenBook(item.project);
                    }}
                    className="flex-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Open in Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Backup / Export single file */}
                  <button
                    onClick={(e) => handleExportSingle(item.project, e)}
                    className="p-2 rounded-xl bg-white hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                    title="Download .flipbook backup file for this book"
                  >
                    <Download className="w-4 h-4 text-emerald-600" />
                  </button>

                  {/* Duplicate */}
                  <button
                    onClick={(e) => handleDuplicate(item.id, e)}
                    className="p-2 rounded-xl bg-white hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                    title="Duplicate / Clone this book"
                  >
                    <Copy className="w-4 h-4 text-slate-600" />
                  </button>

                  {/* Delete / Confirm */}
                  {deleteConfirmId === item.id ? (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold cursor-pointer"
                        title="Confirm Delete"
                      >
                        Yes
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(null);
                        }}
                        className="px-2 py-1 rounded-lg bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer"
                        title="Cancel"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(item.id);
                      }}
                      className="p-2 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete book from local bookshelf"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
