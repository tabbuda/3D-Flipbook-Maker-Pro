import React, { useState, useEffect, useRef } from 'react';
import { BookProject, AppNavView, TemplatePreset, PageContent } from './types/flipbook';
import { INITIAL_BOOK_PROJECT } from './constants/templates';
import { FLIPBOOK_TEMPLATE_PRESETS } from './constants/presetTemplates';
import { StudioSidebar } from './components/StudioSidebar';
import { FlipbookPreview } from './components/FlipbookPreview';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { TemplateGallery } from './components/TemplateGallery';
import { MyBookshelf } from './components/MyBookshelf';
import { LiveTemplatePreviewModal } from './components/LiveTemplatePreviewModal';
import { ShareExportHub } from './components/ShareExportHub';
import { ImageUploadModal } from './components/ImageUploadModal';
import { PdfImportModal } from './components/PdfImportModal';
import { InstallAppModal } from './components/InstallAppModal';
import { LicenseActivationModal } from './components/LicenseActivationModal';
import { PageThumbnailStrip } from './components/PageThumbnailStrip';
import { DedicatedReaderView } from './components/DedicatedReaderView';
import { generateStandaloneFlipbookHtml, generateStandaloneFlipbookHtmlAsync } from './utils/exportHtml';
import { usePWAInstall } from './hooks/usePWAInstall';
import { loadActiveBook, saveActiveBook, getLibrary } from './utils/bookStorage';
import { loadBookFromIndexedDB, saveBookToIndexedDB } from './utils/indexedDbStorage';
import { canExportHtml, recordExportHtml } from './utils/licenseManager';

export default function App() {
  // Initialize with last worked project from localStorage if exists
  const [book, setBookState] = useState<BookProject>(() => {
    return loadActiveBook() || INITIAL_BOOK_PROJECT;
  });

  // Undo / Redo History Stack for Studio Editor
  const [historyPast, setHistoryPast] = useState<BookProject[]>([]);
  const [historyFuture, setHistoryFuture] = useState<BookProject[]>([]);
  const lastHistoryPushRef = useRef<number>(0);

  // Wrapper around setBookState that records Undo history
  const setBook: React.Dispatch<React.SetStateAction<BookProject>> = React.useCallback(
    (updater) => {
      setBookState((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        if (next === prev) return prev;

        const now = Date.now();
        const isStructuralChange =
          next.pages.length !== prev.pages.length ||
          next.themeId !== prev.themeId ||
          next.pages.some(
            (p, idx) => (p.blocks?.length || 0) !== (prev.pages[idx]?.blocks?.length || 0)
          );

        // Always push snapshot on structural change or if > 450ms since last keystroke snapshot
        if (isStructuralChange || now - lastHistoryPushRef.current > 450) {
          const snapshot: BookProject = JSON.parse(JSON.stringify(prev));
          setHistoryPast((past) => [...past.slice(-39), snapshot]);
          setHistoryFuture([]);
          lastHistoryPushRef.current = now;
        }

        return next;
      });
    },
    []
  );

  // Reset book without pushing old book to history (e.g. when opening another project/template)
  const resetBookProject = React.useCallback((newBook: BookProject) => {
    setHistoryPast([]);
    setHistoryFuture([]);
    lastHistoryPushRef.current = 0;
    setBookState(newBook);
  }, []);

  const handleUndo = React.useCallback(() => {
    setHistoryPast((past) => {
      if (past.length === 0) return past;
      const previous = past[past.length - 1];
      setBookState((current) => {
        setHistoryFuture((future) => [JSON.parse(JSON.stringify(current)), ...future.slice(0, 39)]);
        return previous;
      });
      lastHistoryPushRef.current = 0;
      return past.slice(0, -1);
    });
  }, []);

  const handleRedo = React.useCallback(() => {
    setHistoryFuture((future) => {
      if (future.length === 0) return future;
      const next = future[0];
      setBookState((current) => {
        setHistoryPast((past) => [...past.slice(-39), JSON.parse(JSON.stringify(current))]);
        return next;
      });
      lastHistoryPushRef.current = 0;
      return future.slice(1);
    });
  }, []);

  const [activeNavView, setActiveNavView] = useState<AppNavView>('home');
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [isMobilePreviewMode, setIsMobilePreviewMode] = useState<boolean>(false);
  const [mobileViewTab, setMobileViewTab] = useState<'editor' | 'preview'>('preview');
  const [libraryCount, setLibraryCount] = useState<number>(() => getLibrary().length);

  // Global Keyboard Shortcuts for Undo (Ctrl+Z / Cmd+Z) & Redo (Ctrl+Y / Cmd+Shift+Z) in Studio
  useEffect(() => {
    if (activeNavView !== 'studio') return;

    const onKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      if (!isCtrlOrCmd) return;

      const key = e.key.toLowerCase();
      if (key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (key === 'y' || (key === 'z' && e.shiftKey)) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeNavView, handleUndo, handleRedo]);

  // PWA Install State & Utilities
  const { isInstallable, isInstalled, platform, promptInstall } = usePWAInstall();

  // Modals
  const [previewingTemplate, setPreviewingTemplate] = useState<TemplatePreset | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState<boolean>(false);

  // URL Deep-Linking, SEO View Routing (?view=templates | pdf-to-flipbook | studio) & Public Reader Detection (?read=book-id)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    const readId = params.get('read') || params.get('id');
    const pageParam = params.get('p') || params.get('page');

    // Handle Sitemap & Search Engine Deep-Linked Views first
    if (viewParam === 'templates') {
      setActiveNavView('templates');
      return;
    }
    if (viewParam === 'studio') {
      setActiveNavView('studio');
      return;
    }
    if (viewParam === 'bookshelf') {
      setActiveNavView('bookshelf');
      return;
    }
    if (viewParam === 'pdf-to-flipbook') {
      setActiveNavView('home');
      setIsPdfModalOpen(true);
      return;
    }

    const targetBookId = readId || viewParam;
    if (targetBookId) {
      // Attempt loading from IndexedDB
      loadBookFromIndexedDB(targetBookId).then((loaded) => {
        if (loaded) {
          resetBookProject(loaded);
          if (pageParam) {
            const pageNum = parseInt(pageParam, 10);
            if (!isNaN(pageNum)) setActivePageIndex(Math.max(0, pageNum - 1));
          }
          setActiveNavView('reader');
        } else {
          // If not in IndexedDB, check local library
          const lib = getLibrary();
          const found = lib.find((b) => b.id === targetBookId);
          if (found) {
            resetBookProject(found.project);
            setActiveNavView('reader');
          }
        }
      });
    }
  }, [resetBookProject]);

  // Dynamic SEO Title & Meta Description Synchronization per View / Use Case
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const usecase = params.get('usecase');

    let pageTitle = '3D Flipbook Maker (FlipApp 3D) | Free PDF to 3D Flipbook Converter';
    let pageDesc =
      'Free online 3D Flipbook Maker (FlipApp 3D). Convert PDF catalogs, magazines, brochures, menus, and lookbooks into realistic 3D page-turning flipbooks with sound and standalone offline HTML export.';

    if (activeNavView === 'templates') {
      pageTitle = '24+ Interactive 3D Flipbook Templates | Magazines, Menus & Catalogs — FlipApp 3D';
      pageDesc =
        'Browse 24+ ready-to-publish 3D flipbook templates including luxury magazines, fine-dining QR menus, product lookbooks, investor pitch decks, and storybooks.';
    } else if (activeNavView === 'studio') {
      pageTitle = `${book.title || 'Untitled Book'} — 3D Flipbook Studio Editor | FlipApp 3D`;
      pageDesc =
        'Design interactive 3D digital publications with double-sided page physics, hardcover foil shaders, Web Audio paper sound, and 1-click standalone HTML5 export.';
    } else if (activeNavView === 'bookshelf') {
      pageTitle = 'My Saved 3D Bookshelf | FlipApp 3D Digital Publishing Studio';
    } else if (usecase === 'flipsnack-alternative') {
      pageTitle = 'Best Free Flipsnack & Issuu Alternative (Standalone HTML5, No Monthly Fee) | FlipApp 3D';
      pageDesc =
        'Switch from expensive monthly cloud subscriptions to FlipApp 3D. Convert PDFs to self-hosted standalone HTML5 3D flipbooks with 100% client-side privacy and a $19 lifetime license.';
    } else if (usecase === 'digital-catalog-maker') {
      pageTitle = 'Interactive 3D Digital Catalog & Lookbook Maker for Shopify & WordPress | FlipApp 3D';
    } else if (usecase === 'restaurant-qr-menu') {
      pageTitle = '3D Interactive Restaurant QR Menu Maker (Standalone HTML & Print QR) | FlipApp 3D';
    } else if (usecase === 'digital-magazine-creator') {
      pageTitle = 'Online 3D Digital Magazine & eBook Creator (HTML5 & Vector PDF) | FlipApp 3D';
    } else if (usecase === 'pitch-deck-flipbook') {
      pageTitle = '100% Private Investor Pitch Deck to 3D Flipbook Converter (Zero Cloud) | FlipApp 3D';
    }

    document.title = pageTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', pageDesc);
    }
  }, [activeNavView, book.title]);

  // AUTOMATIC PERSISTENCE & AUTOSAVE (Debounced to avoid disk spam)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      saveActiveBook(book);
      saveBookToIndexedDB(book).catch(() => {});
      setLibraryCount(getLibrary().length);
    }, 600);

    return () => clearTimeout(timer);
  }, [book]);

  const [isExportingHtml, setIsExportingHtml] = useState<boolean>(false);

  // One-Click Standalone HTML Export & Download with automatic Base64 packaging
  const handleExportHtml = async () => {
    // Check Free Plan limit: only 1 free HTML export allowed!
    const exportCheck = canExportHtml();
    if (!exportCheck.allowed) {
      setIsLicenseModalOpen(true);
      return;
    }

    try {
      setIsExportingHtml(true);
      const htmlContent = await generateStandaloneFlipbookHtmlAsync(book, 0);
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${book.title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'flipbook'}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Track usage for free tier
      recordExportHtml();
    } catch (err) {
      console.error('Failed to export HTML with Base64:', err);
    } finally {
      setIsExportingHtml(false);
    }
  };

  // Load a template into the studio
  const handleSelectTemplate = (selectedProject: BookProject) => {
    // Deep clone to allow independent edits
    const cloned: BookProject = {
      ...JSON.parse(JSON.stringify(selectedProject)),
      id: `book-${Date.now()}`, // Fresh ID so it becomes user's own draft
    };
    resetBookProject(cloned);
    saveActiveBook(cloned);
    setLibraryCount(getLibrary().length);
    setActivePageIndex(0);
    setActiveNavView('studio');
  };

  // Load an existing draft from user's bookshelf
  const handleOpenBookFromShelf = (shelfBook: BookProject) => {
    resetBookProject(shelfBook);
    saveActiveBook(shelfBook);
    setActivePageIndex(0);
    setActiveNavView('studio');
  };

  // Create a clean blank book project
  const handleCreateBlank = () => {
    const blankBook: BookProject = {
      id: `book-${Date.now()}`,
      title: 'UNTITLED PUBLICATION',
      subtitle: 'Modern Digital Publication',
      author: 'Author Name',
      edition: 'First Edition',
      year: new Date().getFullYear().toString(),
      publisher: 'Studio Press',
      themeId: 'emerald-gold',
      soundEnabled: true,
      pageTurnSpeed: 'normal',
      pages: [
        {
          id: `p-cov-${Date.now()}`,
          template: 'cover-front',
          title: 'UNTITLED PUBLICATION',
          subtitle: 'Modern Digital Publication',
          headerTag: 'VOLUME I',
          footerNote: 'FIRST PRINTING',
        },
        {
          id: `p-ch1-${Date.now()}`,
          template: 'chapter-intro',
          chapterNumber: '01',
          title: 'Chapter One',
          subtitle: 'The Beginning',
          blocks: [
            {
              id: `b-ch-${Date.now()}`,
              type: 'chapter-header',
              chapterNumber: 'CHAPTER 01',
              title: 'The Beginning',
            },
            {
              id: `b-dp-${Date.now()}`,
              type: 'dropcap-paragraph',
              paragraph1:
                'Start writing your publication here. Add modular cards, images, quotes, or split column layouts using the sidebar editor.',
            },
          ],
        },
        {
          id: `p-img-${Date.now()}`,
          template: 'image-showcase',
          title: 'Visual Feature',
          imageUrl:
            'https://images.unsplash.com/photo-1507842229451-79b1be886a27?w=1000&auto=format&fit=crop&q=80',
          imageCaption: 'The silent beauty of modern editorial composition.',
          blocks: [
            {
              id: `b-img-${Date.now()}`,
              type: 'image-block',
              imageUrl:
                'https://images.unsplash.com/photo-1507842229451-79b1be886a27?w=1000&auto=format&fit=crop&q=80',
              imageCaption: 'The silent beauty of modern editorial composition.',
            },
          ],
        },
        {
          id: `p-back-${Date.now()}`,
          template: 'cover-back',
          title: 'UNTITLED PUBLICATION',
          subtitle: 'Thank you for reading.',
          footerNote: 'PRINTED WITH 3D FLIPBOOK ENGINE',
          isbn: '978-3-16-148410-0',
        },
      ],
    };

    resetBookProject(blankBook);
    saveActiveBook(blankBook);
    setLibraryCount(getLibrary().length);
    setActivePageIndex(0);
    setActiveNavView('studio');
  };

  // Batch Image upload -> Append as new pages
  const handleAddPagesFromImages = (
    imagePages: { url: string; title: string; caption?: string }[]
  ) => {
    const newPages: PageContent[] = imagePages.map((img, idx) => ({
      id: `p-uploaded-${Date.now()}-${idx}`,
      template: 'image-showcase',
      title: img.title || `Gallery Page ${idx + 1}`,
      imageUrl: img.url,
      imageCaption: img.caption || '',
      blocks: [
        {
          id: `b-uploaded-img-${Date.now()}-${idx}`,
          type: 'image-block',
          imageUrl: img.url,
          imageCaption: img.caption || '',
        },
      ],
    }));

    setBook((prev) => {
      // Insert right before back cover if back cover exists
      const pages = [...prev.pages];
      const backIndex = pages.findIndex((p) => p.template === 'cover-back');
      if (backIndex !== -1) {
        pages.splice(backIndex, 0, ...newPages);
      } else {
        pages.push(...newPages);
      }
      return { ...prev, pages };
    });

    setActiveNavView('studio');
  };

  // PDF to 3D Flipbook Import Handler
  const handlePdfImportComplete = (importedProject: BookProject, mode: 'new' | 'append') => {
    if (mode === 'new') {
      resetBookProject(importedProject);
      saveActiveBook(importedProject);
      setLibraryCount(getLibrary().length);
      setActivePageIndex(0);
    } else {
      // Append pages to current book
      setBook((prev) => {
        const pages = [...prev.pages];
        const backIndex = pages.findIndex((p) => p.template === 'cover-back');
        if (backIndex !== -1) {
          pages.splice(backIndex, 0, ...importedProject.pages);
        } else {
          pages.push(...importedProject.pages);
        }
        const updated = { ...prev, pages };
        saveActiveBook(updated);
        return updated;
      });
    }
    setActiveNavView('studio');
  };

  // Thumbnail Strip page reordering / actions
  const handleAddPage = () => {
    const newPageId = `p-${Date.now()}`;
    const newPage: PageContent = {
      id: newPageId,
      template: 'story-article',
      title: 'New Page',
      subtitle: 'Editorial section',
      paragraph1: 'Type your editorial text here. Customize with sidebar blocks.',
      blocks: [
        {
          id: `b-${Date.now()}-h`,
          type: 'chapter-header',
          title: 'New Page Section',
        },
        {
          id: `b-${Date.now()}-p`,
          type: 'dropcap-paragraph',
          paragraph1: 'Continue writing your publication content.',
        },
      ],
    };

    setBook((prev) => {
      const pages = [...prev.pages];
      // Insert before back cover if exists
      const backIndex = pages.findIndex((p) => p.template === 'cover-back');
      if (backIndex !== -1) {
        pages.splice(backIndex, 0, newPage);
      } else {
        pages.push(newPage);
      }
      return { ...prev, pages };
    });

    setActivePageIndex(book.pages.length > 0 ? book.pages.length - 1 : 0);
  };

  const handleDeletePage = (index: number) => {
    if (book.pages.length <= 2) {
      alert('A flipbook must have at least 2 pages.');
      return;
    }
    setBook((prev) => {
      const updated = prev.pages.filter((_, idx) => idx !== index);
      return { ...prev, pages: updated };
    });
    if (activePageIndex >= index && activePageIndex > 0) {
      setActivePageIndex(activePageIndex - 1);
    }
  };

  const handleDuplicatePage = (index: number) => {
    const target = book.pages[index];
    if (!target) return;
    const duplicated: PageContent = {
      ...JSON.parse(JSON.stringify(target)),
      id: `p-dup-${Date.now()}`,
      title: `${target.title || 'Page'} (Copy)`,
    };
    setBook((prev) => {
      const updated = [...prev.pages];
      updated.splice(index + 1, 0, duplicated);
      return { ...prev, pages: updated };
    });
    setActivePageIndex(index + 1);
  };

  return (
    <div className="w-screen h-screen h-[100dvh] flex flex-col bg-slate-100 overflow-hidden font-sans select-none text-slate-800">
      {/* Top Pro Studio Header */}
      <Header
        book={book}
        activeNavView={activeNavView}
        setActiveNavView={(view) => {
          setActiveNavView(view);
          if (view === 'bookshelf') {
            setLibraryCount(getLibrary().length);
          }
        }}
        isMobilePreviewMode={isMobilePreviewMode}
        setIsMobilePreviewMode={setIsMobilePreviewMode}
        mobileViewTab={mobileViewTab}
        setMobileViewTab={setMobileViewTab}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onExportHtml={handleExportHtml}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onOpenPdfModal={() => setIsPdfModalOpen(true)}
        onOpenLicenseModal={() => setIsLicenseModalOpen(true)}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        libraryCount={libraryCount}
        activePageIndex={activePageIndex}
      />

      {/* Main View Router */}
      {activeNavView === 'home' && (
        /* 1. Dedicated 3D Digital Flipbook Home Page */
        <div className="flex-1 overflow-hidden">
          <HomePage
            onStartCreating={() => setActiveNavView('studio')}
            onOpenTemplates={() => setActiveNavView('templates')}
            onOpenBookshelf={() => setActiveNavView('bookshelf')}
            onSelectTemplate={handleSelectTemplate}
            onPreviewTemplate={(tpl) => setPreviewingTemplate(tpl)}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            onOpenInstallModal={() => setIsInstallModalOpen(true)}
            onOpenPdfModal={() => setIsPdfModalOpen(true)}
            onOpenLicenseModal={() => setIsLicenseModalOpen(true)}
          />
        </div>
      )}

      {activeNavView === 'templates' && (
        /* 2. Templates Gallery (FlipApp Pro Gallery) */
        <div className="flex-1 overflow-hidden">
          <TemplateGallery
            onSelectTemplate={handleSelectTemplate}
            onPreviewTemplate={(tpl) => setPreviewingTemplate(tpl)}
            onCreateBlank={handleCreateBlank}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            onOpenPdfModal={() => setIsPdfModalOpen(true)}
          />
        </div>
      )}

      {activeNavView === 'bookshelf' && (
        /* 3. My Bookshelf / Saved Drafts Manager */
        <div className="flex-1 overflow-hidden">
          <MyBookshelf
            onOpenBook={handleOpenBookFromShelf}
            onCreateNewBook={handleCreateBlank}
            onBrowseTemplates={() => setActiveNavView('templates')}
            onOpenPdfModal={() => setIsPdfModalOpen(true)}
            onOpenLicenseModal={() => setIsLicenseModalOpen(true)}
          />
        </div>
      )}

      {activeNavView === 'studio' && (
        /* 4. Studio Editor & 3D Interactive Stage */
        <div className="flex-1 flex flex-col overflow-hidden relative bg-slate-100">
          <div className="flex-1 flex overflow-hidden relative">
            {/* Left Sidebar: Block Editor & Book Config */}
            <aside
              className={`
                w-full lg:w-[420px] xl:w-[440px] shrink-0 h-full z-20 transition-all duration-200
                ${
                  mobileViewTab === 'editor'
                    ? 'block'
                    : 'hidden lg:block'
                }
              `}
            >
              <StudioSidebar
                book={book}
                setBook={setBook}
                activePageIndex={activePageIndex}
                setActivePageIndex={setActivePageIndex}
                onExportHtml={handleExportHtml}
                onOpenPdfModal={() => setIsPdfModalOpen(true)}
                onOpenLicenseModal={() => setIsLicenseModalOpen(true)}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={historyPast.length > 0}
                canRedo={historyFuture.length > 0}
              />
            </aside>

            {/* Right Stage: Live 3D Interactive Flipbook */}
            <main
              className={`
                flex-1 h-full relative overflow-hidden flex flex-col
                ${
                  mobileViewTab === 'preview'
                    ? 'flex'
                    : 'hidden lg:flex'
                }
              `}
            >
              <div className="flex-1 relative overflow-hidden">
                <FlipbookPreview
                  book={book}
                  activePageIndex={activePageIndex}
                  onPageSelect={setActivePageIndex}
                  isMobilePreviewMode={isMobilePreviewMode}
                />
              </div>

              {/* Bottom Visual Page Thumbnail Ribbon */}
              <PageThumbnailStrip
                book={book}
                activePageIndex={activePageIndex}
                onSelectPage={setActivePageIndex}
                onAddPage={handleAddPage}
                onDeletePage={handleDeletePage}
                onDuplicatePage={handleDuplicatePage}
              />
            </main>
          </div>
        </div>
      )}

      {activeNavView === 'reader' && (
        /* 5. Dedicated Fullscreen 3D Flipbook Reader */
        <div className="flex-1 overflow-hidden fixed inset-0 z-40">
          <DedicatedReaderView
            book={book}
            initialPageIndex={activePageIndex}
            onExitReader={() => setActiveNavView('studio')}
            onOpenStudio={() => setActiveNavView('studio')}
            onOpenLicenseModal={() => setIsLicenseModalOpen(true)}
          />
        </div>
      )}

      {/* Modals */}
      <LiveTemplatePreviewModal
        template={previewingTemplate}
        isOpen={!!previewingTemplate}
        onClose={() => setPreviewingTemplate(null)}
        onApplyTemplate={handleSelectTemplate}
      />

      <ShareExportHub
        book={book}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onExportHtml={handleExportHtml}
        onLoadProjectJson={(loaded) => {
          setBook(loaded);
          saveActiveBook(loaded);
          setActivePageIndex(0);
        }}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onOpenReader={() => setActiveNavView('reader')}
        onOpenLicenseModal={() => setIsLicenseModalOpen(true)}
      />

      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        platform={platform}
        onPromptInstall={promptInstall}
      />

      <ImageUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onAddPagesFromImages={handleAddPagesFromImages}
      />

      <PdfImportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        onImportComplete={handlePdfImportComplete}
        onOpenLicenseModal={() => setIsLicenseModalOpen(true)}
        currentBookPageCount={book.pages.length}
      />

      <LicenseActivationModal
        isOpen={isLicenseModalOpen}
        onClose={() => setIsLicenseModalOpen(false)}
      />

      {/* Standalone HTML Packaging & Base64 Converter Overlay */}
      {isExportingHtml && (
        <div className="fixed inset-0 z-[100000] bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-white text-center animate-in fade-in duration-200">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border-2 border-emerald-500 flex items-center justify-center mb-4 shadow-lg shadow-emerald-900/40">
            <div className="w-7 h-7 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          </div>
          <h3 className="text-lg font-extrabold text-white mb-1.5">Packaging Standalone 3D Flipbook</h3>
          <p className="text-sm text-emerald-300 font-medium max-w-md mb-1">
            Converting cover artwork & page images into self-contained Base64 Data URLs...
          </p>
          <p className="text-xs text-slate-400">
            Your exported HTML will be 100% offline portable without any broken links.
          </p>
        </div>
      )}
    </div>
  );
}
