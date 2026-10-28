import React, { useState } from 'react';
import {
  BookProject,
  PageContent,
  PageTemplateType,
  PageBlock,
  PageBlockType,
} from '../types/flipbook';
import { COVER_THEMES, TEMPLATE_DESCRIPTIONS } from '../constants/templates';
import { createDefaultBlock } from '../constants/blockDefinitions';
import { BlockEditorCard } from './BlockEditorCard';
import { AddComponentModal } from './AddComponentModal';
import { ImageInputControl } from './ImageInputControl';
import {
  BookOpen,
  Palette,
  Layers,
  Download,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Check,
  Copy,
  FileCode,
  Type,
  Heading1,
  AlignLeft,
  LayoutGrid,
  Quote,
  Image as ImageIcon,
  Eraser,
  Wand2,
  CheckCircle2,
  FileText,
  Loader2,
  Upload,
  Undo2,
  Redo2,
  AlertTriangle,
  Crown,
} from 'lucide-react';
import { exportBookToPdf } from '../utils/exportPdf';
import { canExportHtml, recordExportHtml, getLicenseInfo } from '../utils/licenseManager';

interface StudioSidebarProps {
  book: BookProject;
  setBook: React.Dispatch<React.SetStateAction<BookProject>>;
  activePageIndex: number;
  setActivePageIndex: (index: number) => void;
  onExportHtml: () => void;
  onOpenPdfModal?: () => void;
  onOpenLicenseModal?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export const StudioSidebar: React.FC<StudioSidebarProps> = ({
  book,
  setBook,
  activePageIndex,
  setActivePageIndex,
  onExportHtml,
  onOpenPdfModal,
  onOpenLicenseModal,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}) => {
  const [activeTab, setActiveTab] = useState<'pages' | 'editor' | 'theme' | 'export'>('editor');
  const [showAddComponentModal, setShowAddComponentModal] = useState<boolean>(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [pdfProgressText, setPdfProgressText] = useState<string>('');

  const activePage = book.pages[activePageIndex] || book.pages[0];

  // Helper to ensure active page has its blocks array initialized
  const getPageBlocks = (page: PageContent): PageBlock[] => {
    if (page.blocks !== undefined) {
      return page.blocks;
    }
    // If blocks are not yet initialized, convert legacy fields to blocks
    const legacyBlocks: PageBlock[] = [];
    if (page.template === 'chapter-intro') {
      legacyBlocks.push(createDefaultBlock('chapter-header'));
      if (page.quoteText) {
        legacyBlocks.push({
          ...createDefaultBlock('quote-block'),
          quoteText: page.quoteText,
          quoteAuthor: page.quoteAuthor,
        });
      }
      if (page.paragraph1) {
        legacyBlocks.push({
          ...createDefaultBlock('paragraph'),
          paragraph1: page.paragraph1,
        });
      }
    } else if (page.template === 'key-points-grid') {
      legacyBlocks.push(createDefaultBlock('heading-2'));
      legacyBlocks.push(createDefaultBlock('grid-cards'));
    } else if (page.template === 'feature-list') {
      legacyBlocks.push(createDefaultBlock('heading-2'));
      legacyBlocks.push(createDefaultBlock('feature-cards'));
    } else if (page.template === 'story-article') {
      legacyBlocks.push(createDefaultBlock('heading-1'));
      legacyBlocks.push(createDefaultBlock('dropcap-paragraph'));
      legacyBlocks.push(createDefaultBlock('paragraph'));
    } else if (page.template === 'image-showcase') {
      legacyBlocks.push(createDefaultBlock('heading-2'));
      legacyBlocks.push(createDefaultBlock('image-block'));
      legacyBlocks.push(createDefaultBlock('paragraph'));
    } else if (page.template === 'author-bio') {
      legacyBlocks.push(createDefaultBlock('author-card'));
      legacyBlocks.push(createDefaultBlock('table-specs'));
    } else if (page.template === 'quote-highlight') {
      legacyBlocks.push(createDefaultBlock('quote-block'));
      legacyBlocks.push(createDefaultBlock('paragraph'));
    } else if (page.title || page.paragraph1) {
      if (page.title) {
        legacyBlocks.push({
          ...createDefaultBlock('heading-2'),
          title: page.title,
        });
      }
      if (page.paragraph1) {
        legacyBlocks.push({
          ...createDefaultBlock('paragraph'),
          paragraph1: page.paragraph1,
        });
      }
    }
    return legacyBlocks;
  };

  const currentBlocks = getPageBlocks(activePage);

  // Update whole active page
  const updateActivePage = (updates: Partial<PageContent>) => {
    setBook((prev) => {
      const newPages = [...prev.pages];
      newPages[activePageIndex] = {
        ...newPages[activePageIndex],
        ...updates,
      };

      // Sync root book properties if front cover is updated
      let newTitle = prev.title;
      let newAuthor = prev.author;
      let newSubtitle = prev.subtitle;
      let newCoverImageUrl = prev.coverImageUrl;
      if (activePageIndex === 0 || newPages[activePageIndex]?.template === 'cover-front') {
        if (updates.title !== undefined) newTitle = updates.title;
        if (updates.subtitle !== undefined) newSubtitle = updates.subtitle;
        if (updates.authorName !== undefined) newAuthor = updates.authorName;
        if (updates.imageUrl !== undefined) newCoverImageUrl = updates.imageUrl;
        if (updates.coverImageUrl !== undefined) newCoverImageUrl = updates.coverImageUrl;
      }

      return {
        ...prev,
        title: newTitle,
        author: newAuthor,
        subtitle: newSubtitle,
        coverImageUrl: newCoverImageUrl,
        pages: newPages,
      };
    });
  };

  // Block management
  const handleAddBlock = (type: PageBlockType) => {
    const newBlock = createDefaultBlock(type);
    const updatedBlocks = [...currentBlocks, newBlock];
    updateActivePage({ blocks: updatedBlocks });
  };

  const handleUpdateBlock = (index: number, updatedBlock: PageBlock) => {
    const updatedBlocks = [...currentBlocks];
    updatedBlocks[index] = updatedBlock;
    updateActivePage({ blocks: updatedBlocks });
  };

  const handleDeleteBlock = (index: number) => {
    const updatedBlocks = currentBlocks.filter((_, i) => i !== index);
    updateActivePage({ blocks: updatedBlocks });
  };

  const handleDuplicateBlock = (index: number) => {
    const blockToCopy = currentBlocks[index];
    if (!blockToCopy) return;
    const duplicated: PageBlock = {
      ...JSON.parse(JSON.stringify(blockToCopy)),
      id: `b-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    };
    const updatedBlocks = [...currentBlocks];
    updatedBlocks.splice(index + 1, 0, duplicated);
    updateActivePage({ blocks: updatedBlocks });
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentBlocks.length) return;
    const updatedBlocks = [...currentBlocks];
    const temp = updatedBlocks[index];
    updatedBlocks[index] = updatedBlocks[targetIndex];
    updatedBlocks[targetIndex] = temp;
    updateActivePage({ blocks: updatedBlocks });
  };

  const handleClearPageToBlank = () => {
    updateActivePage({
      blocks: [],
      title: '',
      subtitle: '',
      paragraph1: '',
      paragraph2: '',
      paragraph3: '',
      bulletItems: [],
      gridCards: [],
      quoteText: '',
      imageUrl: '',
    });
  };

  // Add new page to book
  const handleAddNewPage = (isStartBlank: boolean = true) => {
    const newPage: PageContent = {
      id: `p-${Date.now()}`,
      template: 'blank',
      headerTag: 'CUSTOM SECTION',
      blocks: isStartBlank
        ? []
        : [
            createDefaultBlock('chapter-header'),
            createDefaultBlock('heading-1'),
            createDefaultBlock('paragraph'),
          ],
    };

    setBook((prev) => {
      const lastIndex = prev.pages.length - 1;
      const isLastBackCover = prev.pages[lastIndex]?.template === 'cover-back';
      const insertAt = isLastBackCover ? lastIndex : prev.pages.length;
      const newPages = [...prev.pages];
      newPages.splice(insertAt, 0, newPage);
      return { ...prev, pages: newPages };
    });

    setActivePageIndex(book.pages.length - 1);
    setActiveTab('editor');
    setShowTemplatePicker(false);
  };

  // Delete page
  const handleDeletePage = (index: number) => {
    if (book.pages.length <= 2) {
      alert('A flipbook must contain at least 2 pages.');
      return;
    }
    setBook((prev) => {
      const newPages = prev.pages.filter((_, i) => i !== index);
      return { ...prev, pages: newPages };
    });
    setActivePageIndex(Math.max(0, index - 1));
  };

  // Move page in sequence
  const handleMovePage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= book.pages.length) return;
    setBook((prev) => {
      const newPages = [...prev.pages];
      const temp = newPages[index];
      newPages[index] = newPages[targetIndex];
      newPages[targetIndex] = temp;
      return { ...prev, pages: newPages };
    });
    setActivePageIndex(targetIndex);
  };

  // Export JSON
  const handleDownloadJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(book, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `${book.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-project.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && parsed.pages && Array.isArray(parsed.pages)) {
            setBook(parsed);
            setActivePageIndex(0);
            alert('Project successfully loaded!');
          }
        } catch {
          alert('Invalid JSON project file format.');
        }
      };
    }
  };

  const iframeEmbedCode = `<iframe src="my-3d-flipbook.html" width="100%" height="600" style="border:none; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.15);" allowfullscreen></iframe>`;

  const isCoverFront = activePageIndex === 0 || activePage.template === 'cover-front';
  const isCoverBack =
    activePageIndex === book.pages.length - 1 || activePage.template === 'cover-back';

  // Estimate page content height (A4 printable body budget ~ 530px)
  const estimateBlockHeight = (b: PageBlock): number => {
    switch (b.type) {
      case 'chapter-header':
        return 76;
      case 'heading-1':
        return 46;
      case 'heading-2':
        return 36;
      case 'heading-3':
        return 28;
      case 'subtitle':
        return 32;
      case 'paragraph':
      case 'dropcap-paragraph': {
        const len = (b.paragraph1 || '').length;
        return Math.max(42, Math.ceil(len / 56) * 19 + 14);
      }
      case 'two-column-text': {
        const maxCol = Math.max((b.paragraph1 || '').length, (b.paragraph2 || '').length);
        return Math.max(58, Math.ceil(maxCol / 28) * 18 + 16);
      }
      case 'quote-block': {
        const qLen = (b.quoteText || '').length;
        return Math.max(68, Math.ceil(qLen / 48) * 20 + 28);
      }
      case 'grid-cards': {
        const rows = Math.ceil(Math.max(1, (b.items || []).length) / 2);
        return (b.title ? 26 : 0) + rows * 84;
      }
      case 'feature-cards':
      case 'numbered-steps':
        return (b.title ? 24 : 0) + Math.max(1, (b.items || []).length) * 52;
      case 'checklist-block':
        return Math.max(1, (b.items || []).length) * 28 + 12;
      case 'table-specs':
        return (b.title ? 24 : 0) + Math.max(1, (b.items || []).length) * 30 + 12;
      case 'image-block':
        return b.imageSize === 'small' ? 115 : b.imageSize === 'medium' ? 155 : 210;
      case 'image-full-fit':
        return 440;
      case 'image-text-split':
        return 145;
      case 'author-card':
        return 92;
      case 'callout-box':
        return 78;
      case 'button-cta':
        return 46;
      case 'divider-ornament':
        return 26;
      case 'barcode-imprint':
        return 72;
      default:
        return 55;
    }
  };

  const MAX_SAFE_PAGE_HEIGHT = 530;
  const estimatedPageHeight =
    !isCoverFront && !isCoverBack
      ? currentBlocks.reduce((acc, b) => acc + estimateBlockHeight(b), 0)
      : 0;
  const pageCapacityPercent = Math.min(
    999,
    Math.round((estimatedPageHeight / MAX_SAFE_PAGE_HEIGHT) * 100)
  );
  const isPageOverflowing = !isCoverFront && !isCoverBack && pageCapacityPercent > 100;

  // One-click helper to move the overflowing last block onto the next page
  const handleMoveLastBlockToNextPage = () => {
    if (currentBlocks.length === 0) return;
    const blockToMove = currentBlocks[currentBlocks.length - 1];
    const remainingBlocks = currentBlocks.slice(0, -1);

    setBook((prev) => {
      const pages = [...prev.pages];
      pages[activePageIndex] = {
        ...pages[activePageIndex],
        blocks: remainingBlocks,
      };

      const nextIdx = activePageIndex + 1;
      const nextPage = pages[nextIdx];

      if (nextPage && nextPage.template !== 'cover-back') {
        const nextBlocks = getPageBlocks(nextPage);
        pages[nextIdx] = {
          ...nextPage,
          blocks: [blockToMove, ...nextBlocks],
        };
      } else {
        // Insert a new page before back cover and place the moved block there
        const newPage: PageContent = {
          id: `p-${Date.now()}`,
          template: 'blank',
          headerTag: activePage.headerTag || prev.title,
          blocks: [blockToMove],
        };
        const insertAt = nextPage?.template === 'cover-back' ? nextIdx : pages.length;
        pages.splice(insertAt, 0, newPage);
      }

      return { ...prev, pages };
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-white border-r border-slate-200/90 text-slate-800 overflow-hidden select-none">
      {/* Studio Sidebar Header */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-[#FAFAFA] gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-md bg-slate-950 flex items-center justify-center text-emerald-400 shrink-0">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-bold text-slate-950 leading-tight truncate">
              {book.title || 'Untitled Publication'}
            </h2>
            <p className="text-[10px] font-mono-code text-slate-500 truncate">
              {book.pages.length} Pages · Studio Editor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Undo & Redo Controls */}
          {onUndo && (
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={onUndo}
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
                className="p-1.5 rounded-md text-slate-600 hover:text-slate-950 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onRedo}
                disabled={!canRedo}
                title="Redo (Ctrl+Y)"
                className="p-1.5 rounded-md text-slate-600 hover:text-slate-950 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            onClick={onExportHtml}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>HTML</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-100/80 p-1 gap-1">
        <button
          onClick={() => setActiveTab('editor')}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'editor'
              ? 'bg-slate-950 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-950'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>Content</span>
        </button>

        <button
          onClick={() => setActiveTab('pages')}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'pages'
              ? 'bg-slate-950 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-950'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Pages ({book.pages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('theme')}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'theme'
              ? 'bg-slate-950 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-950'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Style</span>
        </button>

        <button
          onClick={() => setActiveTab('export')}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'export'
              ? 'bg-slate-950 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-950'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>

      {/* Main Tab Body */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4">
        {/* ========================================================
            TAB 1: EDIT PAGE (The requested component-driven editor)
           ======================================================== */}
        {activeTab === 'editor' && (
          <div className="space-y-4">
            {/* Page Navigation & Leaf Selector Bar */}
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between gap-1.5">
                <button
                  type="button"
                  onClick={() => setActivePageIndex(Math.max(0, activePageIndex - 1))}
                  disabled={activePageIndex === 0}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xs cursor-pointer"
                  title="Previous Page"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Prev</span>
                </button>

                <select
                  value={activePageIndex}
                  onChange={(e) => setActivePageIndex(Number(e.target.value))}
                  className="text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 flex-1 max-w-[210px] truncate shadow-xs focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  {book.pages.map((p, idx) => {
                    const label =
                      idx === 0
                        ? 'Cover (Front)'
                        : idx === book.pages.length - 1
                        ? 'Cover (Back)'
                        : `Leaf ${idx + 1}: ${
                            p.title ||
                            (p.blocks && p.blocks[0]?.title) ||
                            TEMPLATE_DESCRIPTIONS[p.template]?.label ||
                            'Blank Page'
                          }`;
                    return (
                      <option key={p.id || idx} value={idx}>
                        {label}
                      </option>
                    );
                  })}
                </select>

                <button
                  type="button"
                  onClick={() =>
                    setActivePageIndex(Math.min(book.pages.length - 1, activePageIndex + 1))
                  }
                  disabled={activePageIndex >= book.pages.length - 1}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xs cursor-pointer"
                  title="Next Page"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Status Header & Controls */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-mono text-slate-500">
                    {isCoverFront
                      ? 'Front Cover'
                      : isCoverBack
                      ? 'Back Cover'
                      : `Page ${activePageIndex + 1}`}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
                    {currentBlocks.length === 0
                      ? 'Blank Page'
                      : `${currentBlocks.length} ${
                          currentBlocks.length === 1 ? 'Component' : 'Components'
                        }`}
                  </span>
                  {!isCoverFront && !isCoverBack && currentBlocks.length > 0 && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border ${
                        isPageOverflowing
                          ? 'bg-amber-100 border-amber-300 text-amber-900'
                          : 'bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                      title="Estimated vertical page space used"
                    >
                      {pageCapacityPercent}% Full
                    </span>
                  )}
                </div>

                {!isCoverFront && !isCoverBack && currentBlocks.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearPageToBlank}
                    className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                    title="Clear all components on this page"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    <span>Clear to Blank</span>
                  </button>
                )}
              </div>
            </div>

            {/* PAGE OVERFLOW WARNING BANNER */}
            {isPageOverflowing && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 space-y-2 shadow-2xs animate-in fade-in duration-150">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed">
                    <span className="font-bold text-amber-900">
                      Page Overflow Warning ({pageCapacityPercent}% Full):
                    </span>{' '}
                    This page has more content than a fixed A4 leaf can fit, so bottom text may get clipped.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleMoveLastBlockToNextPage}
                  className="w-full py-1.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span>Move Last Component to Next Page</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* FRONT COVER SPECIAL FIELDS */}
            {isCoverFront ? (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" />
                  <span>Hardcover Front Customizer</span>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Book Title
                  </label>
                  <input
                    type="text"
                    value={activePage.title || book.title}
                    onChange={(e) => updateActivePage({ title: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold text-sm focus:outline-none focus:border-emerald-500 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Book Subtitle
                  </label>
                  <input
                    type="text"
                    value={activePage.subtitle || book.subtitle}
                    onChange={(e) => updateActivePage({ subtitle: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-emerald-500 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Author / Creator Name
                  </label>
                  <input
                    type="text"
                    value={activePage.authorName || book.author}
                    onChange={(e) => updateActivePage({ authorName: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-emerald-500 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Top Edition Tag
                  </label>
                  <input
                    type="text"
                    value={activePage.headerTag || 'COLLECTOR’S FIRST EDITION'}
                    onChange={(e) => updateActivePage({ headerTag: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 text-xs uppercase tracking-wider focus:outline-none focus:border-emerald-500 shadow-xs"
                  />
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <ImageInputControl
                    value={activePage.imageUrl || activePage.coverImageUrl || book.coverImageUrl || ''}
                    onChange={(val) => {
                      updateActivePage({ imageUrl: val, coverImageUrl: val });
                    }}
                    label="Custom Cover Artwork / Photo (Optional)"
                    placeholder="https://... or upload custom cover image"
                    helperText="Upload a full cover artwork image or illustration directly from your device (stored as Base64)."
                  />
                </div>
              </div>
            ) : isCoverBack ? (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" />
                  <span>Hardcover Back Customizer</span>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Synopsis / Acclaim Statement
                  </label>
                  <textarea
                    rows={3}
                    value={activePage.paragraph1 || ''}
                    onChange={(e) => updateActivePage({ paragraph1: e.target.value })}
                    placeholder="Back cover editorial synopsis..."
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs italic focus:outline-none focus:border-emerald-500 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Critic Endorsement
                  </label>
                  <input
                    type="text"
                    value={activePage.authorName || ''}
                    onChange={(e) => updateActivePage({ authorName: e.target.value })}
                    placeholder="— Editorial Board, Digital Arts Quarterly"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-emerald-500 shadow-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      ISBN Code
                    </label>
                    <input
                      type="text"
                      value={activePage.isbn || ''}
                      onChange={(e) => updateActivePage({ isbn: e.target.value })}
                      placeholder="ISBN 978-0-123456-78-9"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs font-mono focus:outline-none focus:border-emerald-500 shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Publisher Imprint
                    </label>
                    <input
                      type="text"
                      value={activePage.publisherName || ''}
                      onChange={(e) => updateActivePage({ publisherName: e.target.value })}
                      placeholder="Lumina Press"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-emerald-500 shadow-xs"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* STANDARD INSIDE PAGES - COMPONENT SYSTEM */
              <div className="space-y-3">
                {/* Header Tag for the whole page */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Page Header Eyebrow Tag (Top of Leaf)
                  </label>
                  <input
                    type="text"
                    value={activePage.headerTag || ''}
                    onChange={(e) => updateActivePage({ headerTag: e.target.value })}
                    placeholder="e.g. CHAPTER 01 • ESSENTIALS"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs uppercase tracking-wider focus:outline-none focus:border-emerald-500 shadow-xs"
                  />
                </div>

                {/* BLANK STATE: When 0 components exist on page */}
                {currentBlocks.length === 0 ? (
                  <div className="p-6 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-center flex flex-col items-center justify-center space-y-4 my-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shadow-inner">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div className="max-w-xs space-y-1">
                      <h4 className="text-sm font-bold text-slate-900">This Page is Pure Blank</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Start assembling your page layout by adding titles, chapters, paragraphs, grid
                        cards, quotes, or images.
                      </p>
                    </div>

                    {/* Prominent "+ Add Component" Button */}
                    <button
                      type="button"
                      onClick={() => setShowAddComponentModal(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all transform hover:scale-[1.02] cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Component</span>
                    </button>

                    {/* Quick 1-Click Suggestions */}
                    <div className="pt-2 border-t border-slate-200 w-full">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-2">
                        Or quick insert:
                      </span>
                      <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px]">
                        <button
                          type="button"
                          onClick={() => handleAddBlock('chapter-header')}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 cursor-pointer shadow-xs"
                        >
                          + Chapter Name
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddBlock('heading-1')}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 cursor-pointer shadow-xs"
                        >
                          + Heading 1
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddBlock('paragraph')}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 cursor-pointer shadow-xs"
                        >
                          + Paragraph
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddBlock('grid-cards')}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 cursor-pointer shadow-xs"
                        >
                          + Grid Cards
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* LIST OF ADDED COMPONENTS */
                  <div className="space-y-3">
                    {/* Top "+ Add Component" Button */}
                    <button
                      type="button"
                      onClick={() => setShowAddComponentModal(true)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Component</span>
                    </button>

                    {/* Component Cards */}
                    <div className="space-y-2.5">
                      {currentBlocks.map((block, bIdx) => (
                        <BlockEditorCard
                          key={block.id || bIdx}
                          block={block}
                          index={bIdx}
                          totalBlocks={currentBlocks.length}
                          onUpdate={(updated) => handleUpdateBlock(bIdx, updated)}
                          onDelete={() => handleDeleteBlock(bIdx)}
                          onDuplicate={() => handleDuplicateBlock(bIdx)}
                          onMoveUp={() => handleMoveBlock(bIdx, 'up')}
                          onMoveDown={() => handleMoveBlock(bIdx, 'down')}
                        />
                      ))}
                    </div>

                    {/* Bottom Add Component Button */}
                    <button
                      type="button"
                      onClick={() => setShowAddComponentModal(true)}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/50 text-slate-600 hover:text-emerald-700 text-xs font-semibold transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Another Component</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 2: PAGES MANAGER (Manage & Reorder Leaves)
           ======================================================== */}
        {activeTab === 'pages' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Book Structure ({book.pages.length} Leaves)
              </span>
              <div className="flex items-center gap-1.5">
                {onOpenPdfModal && (
                  <button
                    type="button"
                    onClick={onOpenPdfModal}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors border border-rose-200 cursor-pointer"
                    title="Import pages from PDF"
                  >
                    <Upload className="w-3.5 h-3.5 text-rose-600" />
                    <span>PDF</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleAddNewPage(true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-colors border border-emerald-300 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Blank Leaf</span>
                </button>
              </div>
            </div>

            {/* Pages List */}
            <div className="space-y-1.5">
              {book.pages.map((p, idx) => {
                const isActive = idx === activePageIndex;
                const isCoverF = idx === 0;
                const isCoverB = idx === book.pages.length - 1;
                const pageBlocksCount = p.blocks?.length || 0;

                const displayTitle =
                  p.title ||
                  (p.blocks && p.blocks[0]?.title) ||
                  (isCoverF
                    ? 'Front Hardcover'
                    : isCoverB
                    ? 'Back Hardcover'
                    : pageBlocksCount === 0
                    ? 'Blank Leaf'
                    : `Leaf ${idx + 1}`);

                return (
                  <div
                    key={p.id || idx}
                    onClick={() => {
                      setActivePageIndex(idx);
                      setActiveTab('editor');
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-50/70 border-emerald-500 ring-1 ring-emerald-400/40 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold font-mono shrink-0 ${
                          isActive
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {isCoverF ? 'C' : isCoverB ? 'B' : idx + 1}
                      </span>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {displayTitle}
                        </h4>
                        <span className="text-[10px] text-slate-500">
                          {isCoverF
                            ? 'Front Cover'
                            : isCoverB
                            ? 'Back Cover'
                            : `${pageBlocksCount} ${
                                pageBlocksCount === 1 ? 'component' : 'components'
                              }`}
                        </span>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setActivePageIndex(idx);
                          setActiveTab('editor');
                        }}
                        className="px-2 py-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded border border-emerald-300 cursor-pointer"
                        title="Edit Page"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMovePage(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMovePage(idx, 'down')}
                        disabled={idx === book.pages.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      {!isCoverF && !isCoverB && (
                        <button
                          type="button"
                          onClick={() => handleDeletePage(idx)}
                          className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                          title="Delete Page"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: THEME & AESTHETICS (White-Label Brand + Cover Themes)
           ======================================================== */}
        {activeTab === 'theme' && (
          <div className="space-y-4">
            {/* Pro White-Label Custom Brand Logo & Link Card */}
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/70 via-white to-slate-50 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900">
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  <span>Custom Brand Logo &amp; Link</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                  WHITE-LABEL
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Display your own company logo, brand name, and clickable website link on the top-left of your 3D Flipbook &amp; exported HTML/PDF.
              </p>

              {getLicenseInfo().tier === 'pro' ? (
                <div className="space-y-2.5 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Brand / Company Name
                    </label>
                    <input
                      type="text"
                      value={book.customBrandName || ''}
                      onChange={(e) =>
                        setBook((prev) => ({ ...prev, customBrandName: e.target.value }))
                      }
                      placeholder="e.g. Acme Studio"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Brand Website Link (URL)
                    </label>
                    <input
                      type="url"
                      value={book.customBrandUrl || ''}
                      onChange={(e) =>
                        setBook((prev) => ({ ...prev, customBrandUrl: e.target.value }))
                      }
                      placeholder="https://yourwebsite.com"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <ImageInputControl
                      value={book.customBrandLogo || ''}
                      onChange={(val) =>
                        setBook((prev) => ({ ...prev, customBrandLogo: val }))
                      }
                      label="Brand Logo Image (PNG / SVG / JPG)"
                      placeholder="Upload or paste logo URL..."
                    />
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenLicenseModal && onOpenLicenseModal()}
                  className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all"
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>Unlock Custom Branding (Pro Lifetime)</span>
                </button>
              )}
            </div>

            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Luxury Cover Themes
            </span>
            <div className="grid grid-cols-1 gap-2.5">
              {Object.keys(COVER_THEMES).map((themeKey) => {
                const t = COVER_THEMES[themeKey];
                const isSelected = book.themeId === t.id;

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setBook((prev) => ({ ...prev, themeId: t.id }))}
                    className={`p-3 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-400 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg border shadow-xs flex items-center justify-center font-bold text-xs"
                        style={{
                          background: t.bgGradient,
                          borderColor: t.borderColor,
                          color: t.textColor,
                        }}
                      >
                        Aa
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{t.name}</span>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-emerald-600" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500">{t.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-black/20"
                        style={{ backgroundColor: t.accentColor }}
                        title="Accent Color"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: EXPORT (ONLY 2 OPTIONS: 1. HTML, 2. PDF)
           ======================================================== */}
        {activeTab === 'export' && (
          <div className="space-y-4 text-xs">
            {/* Option 1: HTML Export Card */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                  <FileCode className="w-4 h-4" />
                  <span>1. Export HTML</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-600 text-white uppercase">
                  3D FLIPBOOK
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                Downloads your interactive 3D flipbook with realistic page-turning physics, desktop & mobile support, and sound effects in a single <code className="font-bold">.html</code> file.
              </p>
              <button
                type="button"
                onClick={onExportHtml}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Standalone .HTML</span>
              </button>
            </div>

            {/* Option 2: PDF Export Card */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>2. Export PDF</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-slate-200 text-slate-800 uppercase">
                  ALL {book.pages.length} PAGES
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Compiles all {book.pages.length} pages of your book into a Native Vector Digital <code className="font-bold">.pdf</code> with selectable text, clickable links, and vector shapes.
              </p>
              <button
                type="button"
                disabled={isGeneratingPdf}
                onClick={async () => {
                  const exportCheck = canExportHtml();
                  if (!exportCheck.allowed) {
                    if (onOpenLicenseModal) {
                      onOpenLicenseModal();
                    }
                    return;
                  }
                  setIsGeneratingPdf(true);
                  setPdfProgressText('Preparing PDF...');
                  try {
                    await exportBookToPdf(book, (prog) => {
                      setPdfProgressText(`Page ${prog.currentPage}/${prog.totalPages}...`);
                    });
                    recordExportHtml();
                  } finally {
                    setIsGeneratingPdf(false);
                    setPdfProgressText('');
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Generating PDF ({pdfProgressText})</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Download Complete Book .PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ADD COMPONENT MODAL */}
      <AddComponentModal
        isOpen={showAddComponentModal}
        onClose={() => setShowAddComponentModal(false)}
        onSelectComponent={(type) => handleAddBlock(type)}
        pageNumber={activePageIndex}
      />
    </div>
  );
};
