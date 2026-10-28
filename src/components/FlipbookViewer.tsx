import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PageFlip } from 'page-flip';
import { NovelBook } from '../data/books';
import { PageRenderer } from './PageRenderer';
import { soundEngine } from '../utils/sound';

interface FlipbookViewerProps {
  book: NovelBook;
  viewMode: 'desktop' | 'mobile';
  curlPoseActive: boolean;
  onToggleCurlPose: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onDownloadBook: () => void;
  currentPageIndex: number;
  onPageChange: (index: number) => void;
}

export const FlipbookViewer: React.FC<FlipbookViewerProps> = ({
  book,
  viewMode,
  curlPoseActive,
  onToggleCurlPose,
  soundEnabled,
  onToggleSound,
  onDownloadBook,
  currentPageIndex,
  onPageChange,
}) => {
  const stageContainerRef = useRef<HTMLDivElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const pagesTemplateRef = useRef<HTMLDivElement | null>(null);
  const pageFlipRef = useRef<PageFlip | null>(null);

  const currentPageIndexRef = useRef<number>(currentPageIndex);
  currentPageIndexRef.current = currentPageIndex;

  const onPageChangeRef = useRef(onPageChange);
  onPageChangeRef.current = onPageChange;

  const [isFullscreen, setIsFullscreen] = useState(false);

  const isMobile = viewMode === 'mobile';

  // Compute responsive 1:1 native page dimensions (no CSS scale distortion so pointer tracking is 1:1)
  const [dimensions, setDimensions] = useState<{ pageW: number; pageH: number }>(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1280;
    if (isMobile) {
      const pw = Math.min(420, Math.max(310, w - 56));
      return { pageW: pw, pageH: Math.round(pw * 1.42) };
    }
    const maxSpreadW = Math.min(920, Math.max(640, w - 120));
    const pw = Math.round(maxSpreadW / 2);
    return { pageW: pw, pageH: Math.round(pw * 1.33) };
  });

  useEffect(() => {
    let resizeTimer: ReturnType<typeof setTimeout>;
    const updateDims = () => {
      const containerW = stageContainerRef.current?.clientWidth || window.innerWidth;
      if (isMobile) {
        const pw = Math.min(420, Math.max(310, containerW - 48));
        const ph = Math.min(600, Math.round(pw * 1.42));
        setDimensions((prev) =>
          Math.abs(prev.pageW - pw) > 8 ? { pageW: pw, pageH: ph } : prev
        );
      } else {
        const maxSpreadW = Math.min(920, Math.max(620, containerW - 110));
        const pw = Math.round(maxSpreadW / 2);
        const ph = Math.min(610, Math.round(pw * 1.33));
        setDimensions((prev) =>
          Math.abs(prev.pageW - pw) > 8 ? { pageW: pw, pageH: ph } : prev
        );
      }
    };
    updateDims();
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateDims, 150);
    };
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
    };
  }, [isMobile]);

  const pageWidth = dimensions.pageW;
  const pageHeight = dimensions.pageH;
  const totalBookWidth = isMobile ? pageWidth : pageWidth * 2;

  const handleJumpToPage = useCallback(
    (targetIdx: number) => {
      const pf = pageFlipRef.current;
      if (!pf) return;
      soundEngine.playPageFlip();
      try {
        pf.flip(targetIdx, isMobile ? 'bottom' : 'top');
      } catch {
        pf.turnToPage(targetIdx);
      }
    },
    [isMobile]
  );

  // Initialize real StPageFlip (page-flip) from pre-rendered React JSX template nodes (zero flushSync!)
  useEffect(() => {
    const host = hostRef.current;
    const templateContainer = pagesTemplateRef.current;
    if (!host || !templateContainer) return;

    if (pageFlipRef.current) {
      try {
        pageFlipRef.current.destroy();
      } catch {
        // Ignore cleanup errors
      }
      pageFlipRef.current = null;
    }

    host.innerHTML = '';

    const bookEl = document.createElement('div');
    bookEl.style.width = `${totalBookWidth}px`;
    bookEl.style.height = `${pageHeight}px`;
    host.appendChild(bookEl);

    // Clone the synchronously rendered React template nodes into bookEl
    const templatePages = templateContainer.querySelectorAll('.flip-page-template-item');
    templatePages.forEach((tplNode) => {
      const cloned = tplNode.cloneNode(true) as HTMLElement;
      cloned.classList.remove('flip-page-template-item');
      cloned.classList.add('flip-page-item');
      bookEl.appendChild(cloned);
    });

    const initialPage = Math.min(
      Math.max(0, currentPageIndexRef.current),
      book.pages.length - 1
    );

    const pf = new PageFlip(bookEl, {
      width: pageWidth,
      height: pageHeight,
      size: 'fixed',
      autoSize: false,
      minWidth: pageWidth,
      maxWidth: pageWidth,
      minHeight: pageHeight,
      maxHeight: pageHeight,
      maxShadowOpacity: 0.5,
      showCover: false,
      mobileScrollSupport: false,
      usePortrait: isMobile,
      startPage: initialPage,
      drawShadow: true,
      flippingTime: 850,
      swipeDistance: 24,
      showPageCorners: true,
      disableFlipByClick: false,
      clickEventForward: true,
    });

    pf.loadFromHTML(bookEl.querySelectorAll('.flip-page-item'));

    // Patch StPageFlip portrait mode so Previous Page (direction === 1)
    // folds from the Left corner while attached/hinged on the Right edge!
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const render = (pf as any).getRender?.();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pages = (pf as any).getPageCollection?.();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fc = (pf as any).getFlipController?.();

    if (render && pages && fc) {
      // 1. When folding Previous Page (direction === 1) in portrait mode,
      // shift virtual book boundsRect.left to 0 so the visible page [0..pageWidth]
      // is the Left half of the virtual spread (hinged on its Right edge at x = pageWidth,
      // folding from its Left corner at x = 0 toward the Right!)
      render.getRect = function () {
        if (this.boundsRect === null) this.calculateBoundsRect();
        if (this.orientation === 'portrait' && this.direction === 1) {
          return {
            ...this.boundsRect,
            left: 0,
          };
        }
        return this.boundsRect;
      };

      // 2. Keep the current page drawn at x = 0 during portrait Left-to-Right fold
      const origDrawRightPage = render.drawRightPage.bind(render);
      render.drawRightPage = function () {
        if (this.orientation === 'portrait' && this.direction === 1) {
          if (this.rightPage !== null) {
            this.rightPage.simpleDraw(0);
          }
          return;
        }
        origDrawRightPage();
      };

      // 3. Draw bottomPage (the Previous Page revealed under the lifted Left corner) in portrait mode too
      render.drawBottomPage = function () {
        if (this.bottomPage === null) return;
        const density =
          this.flippingPage != null ? this.flippingPage.getDrawingDensity() : null;
        this.bottomPage.getElement().style.zIndex = (
          this.getSettings().startZIndex + 3
        ).toString(10);
        this.bottomPage.draw(density);
      };

      // 4. Use a temporary copy of the current page for the curling flap when folding Left-to-Right in portrait mode
      const origGetFlippingPage = pages.getFlippingPage.bind(pages);
      pages.getFlippingPage = function (direction: number) {
        if (this.render.getOrientation() === 'portrait' && direction === 1) {
          const e = this.currentSpreadIndex;
          return this.pages[e].newTemporaryCopy();
        }
        return origGetFlippingPage(direction);
      };

      // 5. Reset direction to 0 whenever a flip finishes/resets so convertToBook in start() has a consistent baseline
      const origReset = fc.reset.bind(fc);
      fc.reset = function () {
        origReset();
        if (this.render.getOrientation() === 'portrait') {
          this.render.setDirection(0);
        }
      };

      // 6. Allow grabbing/clicking the Left 45% of the mobile page to fold Previous Page from Left to Right
      const origGetDirectionByPoint = fc.getDirectionByPoint.bind(fc);
      fc.getDirectionByPoint = function (bookPt: { x: number; y: number }) {
        if (this.render.getOrientation() === 'portrait') {
          const b = this.render.boundsRect || this.getBoundsRect();
          const screenX = bookPt.x - b.pageWidth;
          if (screenX <= b.pageWidth * 0.45) {
            return 1;
          }
          return 0;
        }
        return origGetDirectionByPoint(bookPt);
      };

      // 7. Enable corner peel preview on all 4 corners (including top-left & bottom-left) in portrait mode
      const origIsPointOnCorners = fc.isPointOnCorners.bind(fc);
      fc.isPointOnCorners = function (globalPt: { x: number; y: number }) {
        if (this.render.getOrientation() === 'portrait') {
          const b = this.render.boundsRect || this.getBoundsRect();
          const pw = b.pageWidth;
          const ph = b.height;
          const cornerRadius = Math.sqrt(pw * pw + ph * ph) / 5;
          return (
            globalPt.x > 0 &&
            globalPt.y > 0 &&
            globalPt.x < pw &&
            globalPt.y < ph &&
            (globalPt.x < cornerRadius || globalPt.x > pw - cornerRadius) &&
            (globalPt.y < cornerRadius || globalPt.y > ph - cornerRadius)
          );
        }
        return origIsPointOnCorners(globalPt);
      };

      // 8. In portrait mode, complete user drag flip if dragged past 45% of the mobile page width
      const origStopMove = fc.stopMove.bind(fc);
      fc.stopMove = function () {
        if (this.calc === null) return;
        if (this.render.getOrientation() === 'portrait' && this.state === 'user_fold') {
          const pos = this.calc.getPosition();
          const bounds = this.getBoundsRect();
          const targetY = this.calc.getCorner() === 'bottom' ? bounds.height : 0;
          if (pos.x <= bounds.pageWidth * 0.55) {
            this.animateFlippingTo(pos, { x: -bounds.pageWidth, y: targetY }, true);
          } else {
            this.animateFlippingTo(pos, { x: bounds.pageWidth, y: targetY }, false);
          }
          return;
        }
        origStopMove();
      };
    }

    try {
      pf.update();
    } catch {
      // Ignore
    }

    pf.on('flip', (e) => {
      const newPage = typeof e.data === 'number' ? e.data : 0;
      soundEngine.playPageFlip();
      onPageChangeRef.current(newPage);
    });

    pageFlipRef.current = pf;

    return () => {
      if (pageFlipRef.current) {
        try {
          pageFlipRef.current.destroy();
        } catch {
          // Ignore
        }
        pageFlipRef.current = null;
      }
    };
  }, [book, viewMode, isMobile, pageWidth, pageHeight, totalBookWidth]);

  // Synchronize external page jump requests (e.g. from footer Quick Jump buttons)
  useEffect(() => {
    const pf = pageFlipRef.current;
    if (!pf) return;
    try {
      const current = pf.getCurrentPageIndex();
      if (typeof current === 'number' && current !== currentPageIndex) {
        pf.flip(currentPageIndex, isMobile ? 'bottom' : 'top');
      }
    } catch {
      // Ignore if not yet ready
    }
  }, [currentPageIndex, isMobile]);

  // Trigger real StPageFlip mid-curl diagonal fold when "Hold Diagonal Curl Pose" is toggled!
  useEffect(() => {
    const pf = pageFlipRef.current as unknown as {
      getFlipController?: () => {
        start: (pt: { x: number; y: number }) => boolean;
        do: (pt: { x: number; y: number }) => void;
        stopMove: () => void;
        reset: () => void;
      };
      getRender?: () => {
        finishAnimation: () => void;
        setBottomPage: (p: null) => void;
        setFlippingPage: (p: null) => void;
        clearShadow: () => void;
      };
    } | null;

    if (!pf || !pf.getFlipController || !pf.getRender) return;

    const fc = pf.getFlipController();
    const render = pf.getRender();

    if (curlPoseActive) {
      try {
        render.finishAnimation();
        const startBookX = totalBookWidth - 12;
        const startBookY = 12;
        if (fc.start({ x: startBookX, y: startBookY })) {
          fc.do({
            x: isMobile ? Math.round(pageWidth * 0.14) : -Math.round(pageWidth * 0.13),
            y: Math.round(pageHeight * 0.64),
          });
        }
      } catch {
        // Ignore if on last page
      }
    } else {
      try {
        render.finishAnimation();
        render.setBottomPage(null);
        render.setFlippingPage(null);
        render.clearShadow();
        fc.reset();
      } catch {
        // Ignore
      }
    }
  }, [curlPoseActive, totalBookWidth, pageWidth, pageHeight, isMobile]);

  const handleFlipPrev = useCallback(() => {
    if (curlPoseActive) onToggleCurlPose();
    const pf = pageFlipRef.current;
    if (!pf) return;
    try {
      pf.flipPrev(isMobile ? 'bottom' : 'top');
    } catch {
      // Ignore
    }
  }, [curlPoseActive, onToggleCurlPose, isMobile]);

  const handleFlipNext = useCallback(() => {
    if (curlPoseActive) onToggleCurlPose();
    const pf = pageFlipRef.current;
    if (!pf) return;
    try {
      pf.flipNext(isMobile ? 'bottom' : 'top');
    } catch {
      // Ignore
    }
  }, [curlPoseActive, onToggleCurlPose, isMobile]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowRight') {
        handleFlipNext();
      } else if (e.key === 'ArrowLeft') {
        handleFlipPrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlipNext, handleFlipPrev]);

  const handleFullscreenToggle = () => {
    const el = stageContainerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Delegated click handler for interactive elements inside cloned StPageFlip pages (e.g. TOC jump)
  const handleHostClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const jumpBtn = target.closest('[data-jump-page]') as HTMLElement | null;
    if (jumpBtn) {
      e.stopPropagation();
      const idx = parseInt(jumpBtn.getAttribute('data-jump-page') || '0', 10);
      if (!isNaN(idx)) {
        handleJumpToPage(idx);
      }
    }
  };

  return (
    <div
      ref={stageContainerRef}
      className="relative w-full flex flex-col items-center justify-center py-4 sm:py-6 px-2 sm:px-6 bg-[#F6F5F0] overflow-hidden"
    >
      {/* Hidden Pre-Rendered React Page Templates (Eliminates createRoot / flushSync inside useEffect) */}
      <div ref={pagesTemplateRef} className="hidden" aria-hidden="true">
        {book.pages.map((pageData, idx) => (
          <div
            key={pageData.id}
            style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}
            className="flip-page-template-item w-full h-full overflow-hidden"
          >
            <PageRenderer
              page={pageData}
              side={isMobile ? 'mobile' : idx % 2 === 0 ? 'left' : 'right'}
              totalPages={book.pages.length}
              onJumpToPage={handleJumpToPage}
            />
          </div>
        ))}
      </div>

      <div className="relative flex items-center justify-center">
        {/* Exact Bottom-Left Curved Outline Arrow (Matches both Mobile & Desktop Screenshots) */}
        <button
          type="button"
          onClick={handleFlipPrev}
          aria-label="Previous Page"
          className={`group cursor-pointer p-2 transition-all active:scale-95 ${
            viewMode === 'desktop'
              ? 'mr-2.5 self-end mb-1'
              : 'absolute bottom-3 left-2.5 z-40'
          }`}
          title="Previous Page (Left Arrow)"
        >
          <svg
            width="30"
            height="24"
            viewBox="0 0 32 24"
            fill="none"
            className="text-[#111815] group-hover:text-[#28B47E] transition-colors"
          >
            <path
              d="M13 4L4 11.5L13 19V14.2C20.5 14.2 25.5 16.5 28.5 21C27.2 13.5 22.2 8.5 13 8.5V4Z"
              stroke="currentColor"
              strokeWidth="1.65"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Physical Book Binding & Layered Paper Stack Frame */}
        <div
          className={`relative rounded-[2px] ${
            viewMode === 'desktop'
              ? 'book-paper-stack-desktop'
              : 'book-paper-stack-mobile'
          }`}
        >
          {/* Floating Top-Right Toolbar Pill (Exact Match to Desktop_Formet_87ee662a.png) */}
          <div
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="absolute top-3.5 right-4 z-50 bg-white/95 backdrop-blur-xs rounded-[4px] px-2.5 py-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center gap-3.5 border border-[#ECEBE4]"
          >
            {/* 1. Cloud Download Icon */}
            <button
              type="button"
              onClick={onDownloadBook}
              className="text-[#111815] hover:text-[#28B47E] transition-colors cursor-pointer"
              title="Download Novel Edition"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6.5 18H5.5C3.567 18 2 16.433 2 14.5C2 12.697 3.362 11.212 5.115 11.02C5.67 7.606 8.63 5 12.2 5C16.176 5 19.4 8.224 19.4 12.2C19.4 12.31 19.397 12.42 19.39 12.528C20.865 12.976 21.94 14.348 21.94 15.97C21.94 17.958 20.328 19.57 18.34 19.57H17.5"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
                <path
                  d="M12 12V20M12 20L9.2 17.2M12 20L14.8 17.2"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* 2. Fullscreen / Minimize Corner Icon */}
            <button
              type="button"
              onClick={handleFullscreenToggle}
              className="text-[#111815] hover:text-[#28B47E] transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Reader'}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 9H9V4M20 9H15V4M4 15H9V20M20 15H15V20"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* 3. Speaker / Page Flip Audio Icon */}
            <button
              type="button"
              onClick={onToggleSound}
              className={`transition-colors cursor-pointer ${
                soundEnabled ? 'text-[#111815] hover:text-[#28B47E]' : 'text-[#9BA6A0]'
              }`}
              title={soundEnabled ? 'Mute Page Turn Sound' : 'Enable Page Turn Sound'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M11 5L6 9H2V15H6L11 19V5Z"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinejoin="round"
                />
                {soundEnabled ? (
                  <path
                    d="M15.54 8.46C16.4774 9.39764 17.004 10.6692 17.004 11.995C17.004 13.3208 16.4774 14.5924 15.54 15.53M18.5 5.5C20.2239 7.22386 21.1924 9.56192 21.1924 12C21.1924 14.4381 20.2239 16.7761 18.5 18.5"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d="M21 9L15 15M15 9L21 15"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Central Book Spine Binding Crease Overlay (Desktop 2-Page Spread) */}
          {viewMode === 'desktop' && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-12 z-30"
              style={{
                background:
                  'linear-gradient(90deg, rgba(15,20,18,0) 0%, rgba(15,20,18,0.05) 36%, rgba(15,20,18,0.18) 49%, rgba(15,20,18,0.25) 50%, rgba(255,255,255,0.45) 52%, rgba(15,20,18,0.04) 68%, rgba(15,20,18,0) 100%)',
              }}
            />
          )}

          {/* Host container with explicit 1:1 pixel dimensions for StPageFlip */}
          <div
            ref={hostRef}
            onClick={handleHostClick}
            style={{
              width: `${totalBookWidth}px`,
              height: `${pageHeight}px`,
            }}
            className="relative z-10 overflow-hidden bg-[#F2F1EB]"
          />
        </div>

        {/* Exact Bottom-Right Curved Outline Arrow (Matches both Mobile & Desktop Screenshots) */}
        <button
          type="button"
          onClick={handleFlipNext}
          aria-label="Next Page"
          className={`group cursor-pointer p-2 transition-all active:scale-95 ${
            viewMode === 'desktop'
              ? 'ml-2.5 self-end mb-1'
              : 'absolute bottom-3 right-2.5 z-40'
          }`}
          title="Next Page (Right Arrow)"
        >
          <svg
            width="30"
            height="24"
            viewBox="0 0 32 24"
            fill="none"
            className="text-[#111815] group-hover:text-[#28B47E] transition-colors"
          >
            <path
              d="M19 4L28 11.5L19 19V14.2C11.5 14.2 6.5 16.5 3.5 21C4.8 13.5 9.8 8.5 19 8.5V4Z"
              stroke="currentColor"
              strokeWidth="1.65"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
