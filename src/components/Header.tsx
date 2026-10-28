import React, { useState, useEffect } from 'react';
import { BookProject, AppNavView } from '../types/flipbook';
import {
  BookOpen,
  Smartphone,
  Monitor,
  LayoutGrid,
  Layers,
  Home,
  BookMarked,
  Download,
  FileText,
  Eye,
  Crown,
  Menu,
  X,
  PenTool,
} from 'lucide-react';
import { exportBookAsFlipbookFile } from '../utils/bookStorage';
import { getLicenseInfo, onLicenseChange } from '../utils/licenseManager';

interface HeaderProps {
  book: BookProject;
  activeNavView: AppNavView;
  setActiveNavView: (view: AppNavView) => void;
  isMobilePreviewMode: boolean;
  setIsMobilePreviewMode: (val: boolean) => void;
  mobileViewTab: 'editor' | 'preview';
  setMobileViewTab: (tab: 'editor' | 'preview') => void;
  onOpenShareModal?: () => void;
  onExportHtml?: () => void;
  onOpenInstallModal?: () => void;
  onOpenPdfModal?: () => void;
  onOpenLicenseModal?: () => void;
  isInstallable?: boolean;
  isInstalled?: boolean;
  libraryCount?: number;
  activePageIndex?: number;
}

export const Header: React.FC<HeaderProps> = ({
  book,
  activeNavView,
  setActiveNavView,
  isMobilePreviewMode,
  setIsMobilePreviewMode,
  mobileViewTab,
  setMobileViewTab,
  onOpenShareModal,
  onOpenPdfModal,
  onOpenLicenseModal,
  libraryCount = 0,
  activePageIndex = 0,
}) => {
  const [license, setLicense] = useState(() => getLicenseInfo());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    return onLicenseChange((newInfo) => {
      setLicense(newInfo);
    });
  }, []);

  const isPro = license.tier === 'pro';

  const handleNavSelect = (view: AppNavView) => {
    setActiveNavView(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="relative border-b border-slate-200/90 bg-white/95 backdrop-blur-md shrink-0 z-[2000] select-none text-slate-900">
      {/* ROW 1: Main Top Bar (Never crowded on Mobile or Desktop) */}
      <div className="h-14 sm:h-15 px-3 sm:px-5 lg:px-6 flex items-center justify-between gap-2 relative z-[2020] bg-white">
        {/* Left: Brand Lockup & Desktop Primary Navigation */}
        <div className="flex items-center gap-3 lg:gap-5 min-w-0 shrink-0">
          <button
            onClick={() => handleNavSelect('home')}
            className="flex items-center gap-2 sm:gap-2.5 hover:opacity-90 transition-opacity text-left cursor-pointer group shrink-0"
            title="FlipApp 3D Studio Home"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-950 flex items-center justify-center text-emerald-400 shadow-xs group-hover:bg-emerald-950 transition-colors shrink-0 border border-slate-800">
              <BookOpen className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm sm:text-base font-extrabold text-slate-950 tracking-tight">
                FlipApp
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono-code font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/80">
                3D
              </span>
            </div>
          </button>

          {/* Subtle Divider on Desktop */}
          <div className="hidden md:block h-4 w-px bg-slate-200 shrink-0" />

          {/* Desktop & Tablet Primary Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => handleNavSelect('home')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeNavView === 'home'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => handleNavSelect('templates')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeNavView === 'templates'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Templates</span>
            </button>

            <button
              onClick={() => handleNavSelect('studio')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeNavView === 'studio'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>3D Studio</span>
            </button>

            <button
              onClick={() => handleNavSelect('bookshelf')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeNavView === 'bookshelf'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
              title="Saved projects in browser storage"
            >
              <BookMarked className="w-3.5 h-3.5" />
              <span>My Books</span>
              {libraryCount > 0 && (
                <span
                  className={`ml-0.5 px-1.5 py-0.2 rounded text-[10px] font-mono-code font-medium ${
                    activeNavView === 'bookshelf'
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200/80 text-slate-700'
                  }`}
                >
                  {libraryCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Center (Desktop Only): Dual Spread vs Single Leaf Switcher */}
        {activeNavView === 'studio' && (
          <div className="hidden lg:flex items-center justify-center">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
              <button
                onClick={() => setIsMobilePreviewMode(false)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  !isMobilePreviewMode
                    ? 'bg-white text-slate-950 shadow-2xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Desktop Dual-Page Spread"
              >
                <Monitor className="w-3.5 h-3.5 text-emerald-700" />
                <span>Dual Spread</span>
              </button>
              <button
                onClick={() => setIsMobilePreviewMode(true)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  isMobilePreviewMode
                    ? 'bg-white text-slate-950 shadow-2xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Mobile Single-Leaf View"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
                <span>Single Leaf</span>
              </button>
            </div>
          </div>
        )}

        {/* Right Actions: Clean & Spacious on Mobile + Desktop */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Live Reader Mode View (Desktop/Tablet) */}
          {activeNavView === 'studio' && (
            <button
              onClick={() => setActiveNavView('reader')}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-950 text-xs font-semibold transition-colors cursor-pointer"
              title="Open distraction-free full-screen reader"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden md:inline">Reader</span>
            </button>
          )}

          {/* Quick .flipbook Backup Button when in Studio on XL screens */}
          {activeNavView === 'studio' && (
            <button
              onClick={() => exportBookAsFlipbookFile(book)}
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-950 text-xs font-semibold transition-colors cursor-pointer"
              title="Save .flipbook project backup file"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Backup</span>
            </button>
          )}

          {/* PDF to 3D Converter Button (sm+) */}
          {onOpenPdfModal && (
            <button
              onClick={onOpenPdfModal}
              className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 hover:text-slate-950 text-xs font-semibold transition-colors cursor-pointer"
              title="Convert any PDF document into an interactive 3D Flipbook"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-700" />
              <span>Import PDF</span>
            </button>
          )}

          {/* Pro Lifetime / License Status Button */}
          {onOpenLicenseModal && (
            <button
              onClick={onOpenLicenseModal}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                isPro
                  ? 'bg-emerald-50 border border-emerald-300 text-emerald-900 hover:bg-emerald-100'
                  : 'bg-slate-900 hover:bg-slate-800 text-white border border-slate-800'
              }`}
              title={isPro ? 'Pro Lifetime License Active' : 'Unlock Pro Lifetime or Activate Key'}
            >
              <Crown className={`w-3.5 h-3.5 shrink-0 ${isPro ? 'text-emerald-700' : 'text-amber-400'}`} />
              <span className="hidden sm:inline">{isPro ? 'Pro Active' : 'Pro Lifetime'}</span>
              <span className="sm:hidden">{isPro ? 'PRO' : 'Pro'}</span>
            </button>
          )}

          {/* Primary CTA: Export Book (HTML / PDF / Embed) */}
          {onOpenShareModal && (
            <button
              onClick={onOpenShareModal}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              title="Export Standalone HTML, Vector PDF, or Website Embed"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>Export</span>
            </button>
          )}

          {/* Mobile Menu Button (< md) */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
          </button>
        </div>
      </div>

      {/* ROW 2 (Mobile & Tablet < lg in Studio Mode ONLY): Dedicated Clean Studio Mode Bar */}
      {activeNavView === 'studio' && (
        <div className="lg:hidden px-3 py-1.5 bg-slate-100 border-t border-slate-200/80 flex items-center justify-between gap-2 relative z-[2020]">
          <div className="flex-1 grid grid-cols-2 bg-white p-0.5 rounded-lg border border-slate-200/90 shadow-2xs">
            <button
              type="button"
              onClick={() => setMobileViewTab('editor')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                mobileViewTab === 'editor'
                  ? 'bg-slate-950 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Edit Page ({activePageIndex + 1}/{book.pages.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileViewTab('preview')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                mobileViewTab === 'preview'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>3D Book View</span>
            </button>
          </div>

          {onOpenPdfModal && (
            <button
              type="button"
              onClick={onOpenPdfModal}
              className="sm:hidden px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 shadow-2xs shrink-0 cursor-pointer"
              title="Import PDF"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-700" />
              <span>PDF</span>
            </button>
          )}
        </div>
      )}

      {/* Mobile Dropdown Navigation Drawer & Backdrop (< md) */}
      {mobileMenuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-slate-950/35 backdrop-blur-[1px] z-[2005]"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="md:hidden absolute inset-x-0 top-full bg-white border-b border-slate-200 shadow-2xl z-[2020] p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleNavSelect('home')}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  activeNavView === 'home'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Home className="w-4 h-4 shrink-0" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => handleNavSelect('studio')}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  activeNavView === 'studio'
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-4 h-4 shrink-0" />
                <span>3D Studio</span>
              </button>

              <button
                onClick={() => handleNavSelect('templates')}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  activeNavView === 'templates'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <LayoutGrid className="w-4 h-4 shrink-0" />
                <span>Templates (24+)</span>
              </button>

              <button
                onClick={() => handleNavSelect('bookshelf')}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  activeNavView === 'bookshelf'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center gap-2">
                  <BookMarked className="w-4 h-4 shrink-0" />
                  <span>My Books</span>
                </span>
                {libraryCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono-code bg-emerald-100 text-emerald-900">
                    {libraryCount}
                  </span>
                )}
              </button>
            </div>

            <div className="pt-2.5 border-t border-slate-100 flex items-center gap-2.5">
              {onOpenPdfModal && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenPdfModal();
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Import PDF</span>
                </button>
              )}

              {activeNavView === 'studio' && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setActiveNavView('reader');
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Fullscreen Reader</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
};
