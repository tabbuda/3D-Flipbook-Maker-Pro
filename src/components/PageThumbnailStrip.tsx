import React, { useRef, useEffect } from 'react';
import { BookProject, PageContent } from '../types/flipbook';
import { COVER_THEMES } from '../constants/templates';
import { getCoverImageForTemplate } from './CoverArtworkRenderer';
import { Plus, Trash2, Copy, ArrowLeft, ArrowRight, BookOpen, Layers } from 'lucide-react';

interface PageThumbnailStripProps {
  book: BookProject;
  activePageIndex: number;
  onSelectPage: (index: number) => void;
  onAddPage: () => void;
  onDeletePage: (index: number) => void;
  onDuplicatePage: (index: number) => void;
}

export const PageThumbnailStrip: React.FC<PageThumbnailStripProps> = ({
  book,
  activePageIndex,
  onSelectPage,
  onAddPage,
  onDeletePage,
  onDuplicatePage,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = COVER_THEMES[book.themeId] || COVER_THEMES['emerald-gold'];

  // Auto-scroll active thumbnail into view
  useEffect(() => {
    if (!containerRef.current) return;
    const activeEl = containerRef.current.querySelector(`[data-page-index="${activePageIndex}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activePageIndex]);

  return (
    <div className="w-full bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-2 sm:p-2.5 flex items-center justify-between gap-3 shrink-0 select-none z-30">
      {/* Left Info */}
      <div className="hidden md:flex items-center gap-2 pl-2 text-xs text-slate-400 shrink-0">
        <Layers className="w-3.5 h-3.5 text-emerald-400" />
        <span className="font-mono">
          Page {activePageIndex + 1} / {book.pages.length}
        </span>
      </div>

      {/* Thumbnails Carousel */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center gap-2 overflow-x-auto py-1 px-1 scrollbar-none"
      >
        {book.pages.map((page, idx) => {
          const isActive = idx === activePageIndex;
          const isCoverFront = idx === 0 || page.template === 'cover-front';
          const isCoverBack = idx === book.pages.length - 1 || page.template === 'cover-back';

          const coverImg = isCoverFront
            ? page.coverImageUrl ||
              page.imageUrl ||
              book.coverImageUrl ||
              getCoverImageForTemplate((page as any).templateId || book.themeId || book.id)
            : null;

          const pageImg = !isCoverFront && !isCoverBack
            ? page.imageUrl || (page.blocks && page.blocks.find((b) => b.imageUrl)?.imageUrl)
            : null;

          return (
            <div
              key={page.id || idx}
              data-page-index={idx}
              onClick={() => onSelectPage(idx)}
              className={`group relative shrink-0 w-16 h-22 sm:w-18 sm:h-24 rounded-lg cursor-pointer transition-all duration-200 flex flex-col justify-between border overflow-hidden ${
                isActive
                  ? 'border-emerald-500 ring-2 ring-emerald-500/50 shadow-lg scale-105 z-10'
                  : 'border-slate-700/80 hover:border-slate-500 bg-slate-800/80 hover:bg-slate-800'
              }`}
              style={
                isCoverFront && coverImg
                  ? { backgroundColor: '#111' }
                  : isCoverFront || isCoverBack
                  ? {
                      background: theme.bgGradient,
                      borderColor: isActive ? '#10b981' : theme.borderColor,
                      color: theme.textColor,
                    }
                  : {
                      backgroundColor: theme.pageBg || '#ffffff',
                      color: theme.pageTextColor || '#0f172a',
                    }
              }
            >
              {isCoverFront && coverImg ? (
                /* Cover Page Thumbnail with Real Artwork */
                <div className="relative w-full h-full flex flex-col justify-between overflow-hidden">
                  <img
                    src={coverImg}
                    alt={page.title || book.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 flex flex-col justify-between p-1.5 z-1 pointer-events-none">
                    <div className="flex items-center justify-between text-[7px] font-mono leading-none">
                      <span
                        className={`px-1 py-0.5 rounded font-bold ${
                          isActive
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'bg-black/60 text-white/90'
                        }`}
                      >
                        Cover
                      </span>
                    </div>
                    <div className="text-center overflow-hidden px-0.5 pb-0.5">
                      <p className="text-[6.5px] font-bold text-white line-clamp-2 leading-tight drop-shadow-md">
                        {page.title || book.title}
                      </p>
                    </div>
                  </div>
                </div>
              ) : pageImg ? (
                /* Inside Image Page Thumbnail */
                <div className="relative w-full h-full flex flex-col justify-between overflow-hidden">
                  <img
                    src={pageImg}
                    alt={page.title || `Page ${idx + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80 flex flex-col justify-between p-1.5 z-1 pointer-events-none">
                    <div className="flex items-center justify-between text-[7px] font-mono leading-none">
                      <span
                        className={`px-1 py-0.5 rounded font-bold ${
                          isActive
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'bg-black/60 text-white/90'
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </div>
                    <div className="text-center overflow-hidden px-0.5 pb-0.5">
                      <p className="text-[6px] font-semibold text-white/90 line-clamp-1 leading-tight drop-shadow-md">
                        {page.title || `Page ${idx + 1}`}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Standard Content Page Thumbnail */
                <div className="p-1.5 w-full h-full flex flex-col justify-between">
                  {/* Mini Header / Page Number */}
                  <div className="flex items-center justify-between text-[7px] font-mono leading-none">
                    <span
                      className={`px-1 py-0.5 rounded font-bold ${
                        isActive
                          ? 'bg-emerald-600 text-white'
                          : isCoverFront || isCoverBack
                          ? 'bg-black/30 text-white'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {isCoverFront ? 'Cover' : isCoverBack ? 'Back' : `${idx + 1}`}
                    </span>
                  </div>

                  {/* Mini Mockup Content */}
                  <div className="my-auto text-center overflow-hidden px-0.5">
                    <p className="text-[6.5px] font-bold line-clamp-2 leading-tight">
                      {page.title || (page.blocks && page.blocks[0]?.title) || 'Page ' + (idx + 1)}
                    </p>
                    {page.subtitle && (
                      <p className="text-[5.5px] opacity-70 line-clamp-1 truncate">
                        {page.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Hover Quick Action Buttons */}
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 p-1 z-20">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicatePage(idx);
                  }}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white"
                  title="Duplicate Page"
                >
                  <Copy className="w-2.5 h-2.5" />
                </button>
                {!isCoverFront && !isCoverBack && book.pages.length > 2 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePage(idx);
                    }}
                    className="p-1 rounded bg-slate-800 hover:bg-red-900/80 text-slate-200 hover:text-red-300"
                    title="Delete Page"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Add Page Button */}
        <button
          type="button"
          onClick={onAddPage}
          className="shrink-0 w-16 h-22 sm:w-18 sm:h-24 rounded-lg border-2 border-dashed border-slate-700 hover:border-emerald-500/80 bg-slate-800/40 hover:bg-slate-800 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-emerald-400 transition-all cursor-pointer"
          title="Add New Leaf"
        >
          <Plus className="w-4 h-4" />
          <span className="text-[8px] font-bold uppercase tracking-wider">Add Page</span>
        </button>
      </div>
    </div>
  );
};
