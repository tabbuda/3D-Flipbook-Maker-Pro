import React, { useState, useEffect, useRef } from 'react';
import { BookProject } from '../types/flipbook';
import { FlipbookPreview } from './FlipbookPreview';
import {
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Play,
  Pause,
  Grid,
  Sparkles,
  Download,
  FileText,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { playFlipSound } from '../utils/audio';
import { generateStandaloneFlipbookHtml } from '../utils/exportHtml';
import { exportBookToPdf } from '../utils/exportPdf';
import { canExportHtml, recordExportHtml } from '../utils/licenseManager';

interface DedicatedReaderViewProps {
  book: BookProject;
  initialPageIndex?: number;
  onExitReader?: () => void;
  onOpenStudio?: () => void;
  onOpenLicenseModal?: () => void;
}

export const DedicatedReaderView: React.FC<DedicatedReaderViewProps> = ({
  book,
  initialPageIndex = 0,
  onExitReader,
  onOpenStudio,
  onOpenLicenseModal,
}) => {
  const [activePageIndex, setActivePageIndex] = useState<number>(initialPageIndex);
  const [pageInputStr, setPageInputStr] = useState<string>(String(initialPageIndex + 1));
  const [soundEnabled, setSoundEnabled] = useState<boolean>(book.soundEnabled ?? true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isPlayingAuto, setIsPlayingAuto] = useState<boolean>(false);
  const [autoPlayInterval] = useState<number>(5000);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [sliderVal, setSliderVal] = useState<number>(initialPageIndex);

  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayTimerRef = useRef<any>(null);

  const totalPages = book.pages.length;

  // Sync slider and page input with active page
  useEffect(() => {
    setSliderVal(activePageIndex);
    setPageInputStr(String(activePageIndex + 1));
  }, [activePageIndex]);

  // Handle Keyboard Arrow Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        handleNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrevPage();
      } else if (e.key === 'Home') {
        e.preventDefault();
        handleJumpToPage(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        handleJumpToPage(totalPages - 1);
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'Escape') {
        if (showThumbnails) setShowThumbnails(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePageIndex, totalPages, showThumbnails]);

  // Auto-play slideshow timer
  useEffect(() => {
    if (isPlayingAuto) {
      autoPlayTimerRef.current = setInterval(() => {
        setActivePageIndex((prev) => {
          if (prev >= totalPages - 2) {
            setIsPlayingAuto(false);
            return prev;
          }
          if (soundEnabled) playFlipSound('paper');
          return Math.min(totalPages - 1, prev + 2);
        });
      }, autoPlayInterval);
    } else {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    }

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isPlayingAuto, autoPlayInterval, totalPages, soundEnabled]);

  // Fullscreen state listener
  useEffect(() => {
    const handleFsChange = () => {
      const nativeFs = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(nativeFs);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  const handleNextPage = () => {
    if (activePageIndex < totalPages - 1) {
      const nextIdx = Math.min(totalPages - 1, activePageIndex + (activePageIndex === 0 ? 1 : 2));
      setActivePageIndex(nextIdx);
      if (soundEnabled) playFlipSound('paper');
    }
  };

  const handlePrevPage = () => {
    if (activePageIndex > 0) {
      const prevIdx = Math.max(0, activePageIndex - (activePageIndex === 1 ? 1 : 2));
      setActivePageIndex(prevIdx);
      if (soundEnabled) playFlipSound('paper');
    }
  };

  const handleJumpToPage = (index: number) => {
    const safeIdx = Math.max(0, Math.min(totalPages - 1, index));
    setActivePageIndex(safeIdx);
    if (soundEnabled) playFlipSound('paper');
  };

  const toggleFullscreen = () => {
    const innerBtn = containerRef.current?.querySelector(
      '#btn-fullscreen'
    ) as HTMLButtonElement | null;
    if (innerBtn) {
      innerBtn.click();
      setIsFullscreen((prev) => !prev);
      return;
    }

    const nativeFs = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );

    if (isFullscreen || nativeFs) {
      if (nativeFs) {
        const exitFn =
          document.exitFullscreen ||
          (document as any).webkitExitFullscreen ||
          (document as any).mozCancelFullScreen ||
          (document as any).msExitFullscreen;
        exitFn?.call(document)?.catch?.(() => {});
      }
      setIsFullscreen(false);
    } else {
      setIsFullscreen(true);
      const el = containerRef.current as any;
      const reqFn =
        el?.requestFullscreen ||
        el?.webkitRequestFullscreen ||
        el?.mozRequestFullScreen ||
        el?.msRequestFullscreen;
      if (reqFn) {
        try {
          const p = reqFn.call(el);
          if (p && typeof p.catch === 'function') {
            p.catch(() => setIsFullscreen(true));
          }
        } catch {
          setIsFullscreen(true);
        }
      }
    }
  };

  const handleDownloadPdf = async () => {
    if (isExportingPdf) return;
    const exportCheck = canExportHtml();
    if (!exportCheck.allowed) {
      if (onOpenLicenseModal) onOpenLicenseModal();
      return;
    }
    setIsExportingPdf(true);
    try {
      await exportBookToPdf(book);
      recordExportHtml();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadHtml = () => {
    const exportCheck = canExportHtml();
    if (!exportCheck.allowed) {
      if (onOpenLicenseModal) onOpenLicenseModal();
      return;
    }
    const htmlContent = generateStandaloneFlipbookHtml(book);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${book.title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'flipbook'}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    recordExportHtml();
  };

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen h-[100dvh] bg-slate-950 text-slate-100 flex flex-col overflow-hidden select-none font-sans"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at 50% 30%, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 1) 100%)',
      }}
    >
      {/* 1. TOP READER BAR */}
      <header className="h-14 shrink-0 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 flex items-center justify-between z-30 shadow-md">
        {/* Left: Book Meta & Back button */}
        <div className="flex items-center gap-3 min-w-0">
          {onExitReader && (
            <button
              onClick={onExitReader}
              title="Back to Studio / Bookshelf"
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}

          <div className="min-w-0">
            <h1 className="text-sm font-bold text-slate-100 truncate tracking-tight">
              {book.title || 'Untitled Publication'}
            </h1>
            <p className="text-[11px] text-slate-400 truncate hidden md:block">
              {book.subtitle || `${book.pages.length} Pages • 3D Digital Edition`}
            </p>
          </div>
        </div>

        {/* Center: Jump-to-Page Input Pill */}
        <div
          className="hidden sm:flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 px-3 py-1 rounded-full text-xs font-semibold text-emerald-400 shadow-inner"
          title="Type page number and press Enter to jump"
        >
          <span className="text-slate-400">Page</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={pageInputStr}
            onChange={(e) => setPageInputStr(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter') {
                const parsed = parseInt(pageInputStr, 10);
                if (!isNaN(parsed)) {
                  handleJumpToPage(parsed - 1);
                } else {
                  setPageInputStr(String(activePageIndex + 1));
                }
                (e.target as HTMLInputElement).blur();
              }
            }}
            onBlur={() => {
              const parsed = parseInt(pageInputStr, 10);
              if (!isNaN(parsed)) {
                handleJumpToPage(parsed - 1);
              } else {
                setPageInputStr(String(activePageIndex + 1));
              }
            }}
            className="w-11 px-1.5 py-0.5 text-center font-mono font-bold text-xs text-white bg-slate-900 border border-slate-600 focus:border-emerald-400 rounded-md focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-slate-400 font-mono">of {totalPages}</span>
        </div>

        {/* Right: Quick Export Actions (1. HTML, 2. PDF) */}
        <div className="flex items-center gap-2">
          {/* 1. Export HTML */}
          <button
            onClick={handleDownloadHtml}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-700/30 transition-all hover:scale-105 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export HTML</span>
          </button>

          {/* 2. Export PDF */}
          <button
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
          >
            {isExportingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            ) : (
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>{isExportingPdf ? 'PDF...' : 'Export PDF'}</span>
          </button>

          {/* Open in Editor / Create Your Own Flipbook CTA */}
          {onOpenStudio ? (
            <button
              onClick={onOpenStudio}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">Edit in Studio</span>
            </button>
          ) : (
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden lg:inline">Create 3D Flipbook</span>
            </a>
          )}
        </div>
      </header>

      {/* 2. MAIN 3D FLIPBOOK STAGE (with Zoom support) */}
      <main className="flex-1 relative overflow-hidden flex items-center justify-center">
        {/* Previous page arrow button overlay */}
        <button
          onClick={handlePrevPage}
          disabled={activePageIndex <= 0}
          title="Previous Page (Left Arrow)"
          className={`absolute left-2 sm:left-6 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-white flex items-center justify-center backdrop-blur-md shadow-xl transition-all hover:scale-110 cursor-pointer ${
            activePageIndex <= 0 ? 'opacity-20 pointer-events-none' : 'opacity-90 hover:opacity-100'
          }`}
        >
          <ChevronLeft className="w-6 h-6 text-emerald-400" />
        </button>

        {/* 3D Flipbook Viewer */}
        <div
          className="w-full h-full flex items-center justify-center transition-transform duration-200"
          style={
            zoomLevel !== 1
              ? {
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'center center',
                }
              : undefined
          }
        >
          <FlipbookPreview
            book={book}
            activePageIndex={activePageIndex}
            onPageSelect={setActivePageIndex}
            isMobilePreviewMode={false}
            hideInternalControls={true}
          />
        </div>

        {/* Next page arrow button overlay */}
        <button
          onClick={handleNextPage}
          disabled={activePageIndex >= totalPages - 1}
          title="Next Page (Right Arrow)"
          className={`absolute right-2 sm:right-6 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-white flex items-center justify-center backdrop-blur-md shadow-xl transition-all hover:scale-110 cursor-pointer ${
            activePageIndex >= totalPages - 1
              ? 'opacity-20 pointer-events-none'
              : 'opacity-90 hover:opacity-100'
          }`}
        >
          <ChevronRight className="w-6 h-6 text-emerald-400" />
        </button>
      </main>

      {/* 3. THUMBNAIL FILMSTRIP DRAWER (Collapsible) */}
      {showThumbnails && (
        <div className="h-28 shrink-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-2.5 flex items-center gap-3 overflow-x-auto z-30 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-2.5 h-full">
            {book.pages.map((p, idx) => {
              const isSelected =
                idx === activePageIndex ||
                (activePageIndex > 0 && idx === activePageIndex + 1 && idx % 2 === 0);

              return (
                <button
                  key={p.id || idx}
                  onClick={() => handleJumpToPage(idx)}
                  className={`h-full aspect-3/4 rounded-lg overflow-hidden border-2 transition-all shrink-0 relative bg-white flex items-center justify-center cursor-pointer shadow-md ${
                    isSelected
                      ? 'border-emerald-500 scale-105 shadow-emerald-500/30 ring-2 ring-emerald-400/50'
                      : 'border-slate-700 hover:border-slate-500 opacity-75 hover:opacity-100'
                  }`}
                >
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.title || `Page ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-[10px] font-bold text-slate-800 text-center p-1 leading-tight">
                      {p.template === 'cover-front'
                        ? 'Cover'
                        : p.template === 'cover-back'
                        ? 'Back'
                        : `P.${idx + 1}`}
                    </div>
                  )}

                  <span className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-[9px] font-mono px-1 rounded">
                    {idx === 0 ? 'C' : idx === totalPages - 1 ? 'B' : idx}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. BOTTOM FLOATING PRO READER TOOLBAR */}
      <footer className="h-16 shrink-0 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 px-3 sm:px-6 flex items-center justify-between z-30 shadow-2xl">
        {/* Left: Page Scrubber Slider (Crucial for 250-500 pages!) */}
        <div className="flex items-center gap-2.5 flex-1 max-w-xs sm:max-w-md mr-4">
          <button
            onClick={() => handleJumpToPage(0)}
            title="First Page"
            className="text-[11px] font-bold text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
          >
            1
          </button>

          <input
            type="range"
            min={0}
            max={totalPages - 1}
            value={sliderVal}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setSliderVal(val);
              handleJumpToPage(val);
            }}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />

          <button
            onClick={() => handleJumpToPage(totalPages - 1)}
            title="Last Page"
            className="text-[11px] font-bold text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
          >
            {totalPages}
          </button>
        </div>

        {/* Center/Right Control Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute Page Turn Sound' : 'Enable Page Turn Sound'}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Auto-Play Slideshow */}
          <button
            onClick={() => setIsPlayingAuto(!isPlayingAuto)}
            title={isPlayingAuto ? 'Pause Auto-Play' : 'Start Auto-Play (5s interval)'}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isPlayingAuto
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/40 animate-pulse'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {isPlayingAuto ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Thumbnails Drawer Toggle */}
          <button
            onClick={() => setShowThumbnails(!showThumbnails)}
            title="Show Page Thumbnails"
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              showThumbnails
                ? 'bg-emerald-600/30 border border-emerald-500/50 text-emerald-300'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>

          {/* Zoom In & Out */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-800/80 border border-slate-700/80 rounded-lg p-0.5">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.7, +(z - 0.15).toFixed(2)))}
              disabled={zoomLevel <= 0.7}
              title="Zoom Out"
              className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              title="Reset Zoom (100%)"
              className="px-1.5 text-[11px] font-mono font-bold text-slate-300 hover:text-white cursor-pointer"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.min(2.0, +(z + 0.15).toFixed(2)))}
              disabled={zoomLevel >= 2.0}
              title="Zoom In"
              className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen (F)' : 'Enter Fullscreen (F)'}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </footer>
    </div>
  );
};
