import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { PageFlip } from 'page-flip';
import { BookProject, StageBackdrop } from '../types/flipbook';
import { COVER_THEMES } from '../constants/templates';
import { PageRenderer } from './PageRenderer';
import { playPageTurnSound } from '../utils/audio';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

interface FlipbookPreviewProps {
  book: BookProject;
  activePageIndex?: number;
  onPageSelect?: (index: number) => void;
  isMobilePreviewMode?: boolean;
  onExportHtml?: () => void;
  onEditPage?: () => void;
  isMobileLayoutProp?: boolean;
  readOnly?: boolean;
  hideInternalControls?: boolean;
}

export const BASE_A4_WIDTH = 480;
export const BASE_A4_HEIGHT = 679; // Math.round(480 * Math.SQRT2)

export const FlipbookPreview: React.FC<FlipbookPreviewProps> = ({
  book,
  activePageIndex = 0,
  onPageSelect,
  isMobilePreviewMode = false,
  hideInternalControls = false,
}) => {
  const theme = COVER_THEMES[book.themeId] || COVER_THEMES['emerald-gold'];
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [pageJumpInput, setPageJumpInput] = useState<string>('1');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(book.soundEnabled !== false);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [autoPlayInterval] = useState<number>(5); // in seconds
  const [stageBackdrop] = useState<StageBackdrop>('studio');

  useEffect(() => {
    setPageJumpInput(String(currentPageIndex + 1));
  }, [currentPageIndex]);

  const [dims, setDims] = useState<{
    pageW: number;
    pageH: number;
    pageScale: number;
    isMobileLayout: boolean;
  }>({
    pageW: 400,
    pageH: 566,
    pageScale: 400 / BASE_A4_WIDTH,
    isMobileLayout: false,
  });

  const wrapperRef = useRef<HTMLDivElement>(null);
  const bookStageRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const pagesTemplateRef = useRef<HTMLDivElement>(null);
  const pageFlipRef = useRef<PageFlip | null>(null);

  const currentPageIndexRef = useRef<number>(0);
  const onPageSelectRef = useRef(onPageSelect);
  onPageSelectRef.current = onPageSelect;

  const soundEnabledRef = useRef<boolean>(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastFlipTimeRef = useRef<number>(0);

  // Dynamic page list:
  // On desktop: ensures Back Cover is always on the last even spread index (solo left page when closed)
  // On mobile: uses original pages directly for 1-to-1 single-page portrait navigation
  const pages = useMemo(() => {
    const list = [...(book.pages || [])];
    if (!dims.isMobileLayout) {
      if (list.length > 1 && list.length % 2 !== 0) {
        list.splice(list.length - 1, 0, {
          id: 'p-inside-back-blank',
          template: 'blank' as any,
          title: '',
          subtitle: '',
          headerTag: '',
          footerNote: '',
        });
      }
    }
    return list;
  }, [book.pages, dims.isMobileLayout]);

  const totalPages = pages.length;

  // Sound handler
  const triggerAudio = useCallback(() => {
    if (soundEnabledRef.current) {
      playPageTurnSound();
    }
  }, []);

  // Turn forward action
  const flipNext = useCallback(() => {
    const pf = pageFlipRef.current;
    if (!pf) return;
    const now = Date.now();
    if (now - lastFlipTimeRef.current < 320) return;

    if (currentPageIndexRef.current >= totalPages - 1) {
      if (isAutoPlaying) {
        lastFlipTimeRef.current = now;
        pf.turnToPage(0);
        currentPageIndexRef.current = 0;
        setCurrentPageIndex(0);
        onPageSelectRef.current?.(0);
      }
      return;
    }

    lastFlipTimeRef.current = now;
    triggerAudio();
    pf.flipNext('bottom');
  }, [totalPages, triggerAudio, isAutoPlaying]);

  // Turn backward action
  const flipPrev = useCallback(() => {
    const pf = pageFlipRef.current;
    if (!pf) return;
    const now = Date.now();
    if (now - lastFlipTimeRef.current < 320) return;
    if (currentPageIndexRef.current <= 0) return;

    lastFlipTimeRef.current = now;
    triggerAudio();
    pf.flipPrev('bottom');
  }, [triggerAudio]);

  // Direct jump to a specific page index (0-based)
  const goToPageIndex = useCallback(
    (targetPageIdx: number) => {
      const pf = pageFlipRef.current;
      if (!pf) return;
      const clamped = Math.max(0, Math.min(totalPages - 1, targetPageIdx));
      if (clamped !== currentPageIndexRef.current) {
        lastFlipTimeRef.current = Date.now();
        triggerAudio();
        pf.turnToPage(clamped);
        currentPageIndexRef.current = clamped;
        setCurrentPageIndex(clamped);
        const actualMaxIdx = Math.max(0, (book.pages?.length || totalPages) - 1);
        onPageSelectRef.current?.(Math.min(actualMaxIdx, clamped));
      }
    },
    [totalPages, book.pages?.length, triggerAudio]
  );

  // Auto-play slideshow effect
  useEffect(() => {
    if (!isAutoPlaying) {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      return;
    }

    autoPlayTimerRef.current = setInterval(() => {
      flipNext();
    }, autoPlayInterval * 1000);

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isAutoPlaying, autoPlayInterval, flipNext]);

  // Sync when user selects a page in the Studio left sidebar
  useEffect(() => {
    const pf = pageFlipRef.current;
    if (!pf || activePageIndex < 0) return;

    let targetIdx = activePageIndex;
    const actualTotal = book.pages?.length || totalPages;
    if (!dims.isMobileLayout && totalPages > actualTotal && activePageIndex === actualTotal - 1) {
      targetIdx = totalPages - 1;
    }
    targetIdx = Math.max(0, Math.min(totalPages - 1, targetIdx));

    // On desktop 2-page spread, if activePageIndex is already visible on the open spread, don't jump
    if (!dims.isMobileLayout && currentPageIndexRef.current > 0 && currentPageIndexRef.current < totalPages - 1) {
      const spreadLeft = currentPageIndexRef.current % 2 === 1 ? currentPageIndexRef.current : currentPageIndexRef.current - 1;
      const spreadRight = spreadLeft + 1;
      if (targetIdx === spreadLeft || targetIdx === spreadRight) {
        return;
      }
    }

    if (targetIdx !== currentPageIndexRef.current) {
      try {
        pf.turnToPage(targetIdx);
        currentPageIndexRef.current = targetIdx;
        setCurrentPageIndex(targetIdx);
      } catch {
        // ignore if not ready
      }
    }
  }, [activePageIndex, book.pages?.length, totalPages, dims.isMobileLayout]);

  const isFullscreenRef = useRef<boolean>(isFullscreen);
  isFullscreenRef.current = isFullscreen;
  const [isPseudoFullscreen, setIsPseudoFullscreen] = useState<boolean>(false);
  const isExitingFullscreenRef = useRef<boolean>(false);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const preFullscreenDimsRef = useRef<{
    pageW: number;
    pageH: number;
    pageScale: number;
    isMobileLayout: boolean;
  } | null>(null);

  const applyDimsToWrapper = useCallback(
    (targetDims: { pageW: number; pageH: number; pageScale: number; isMobileLayout: boolean }) => {
      const wrapper = wrapperRef.current;
      if (wrapper) {
        wrapper.style.setProperty('--page-w', `${targetDims.pageW}px`);
        wrapper.style.setProperty('--page-h', `${targetDims.pageH}px`);
        wrapper.style.setProperty('--page-scale', targetDims.pageScale.toFixed(4));
        wrapper.style.setProperty('--a4-scale', targetDims.pageScale.toFixed(4));
      }
      setDims((prev) => {
        if (
          Math.abs(prev.pageW - targetDims.pageW) < 2 &&
          Math.abs(prev.pageH - targetDims.pageH) < 2 &&
          prev.isMobileLayout === targetDims.isMobileLayout
        ) {
          return prev;
        }
        return targetDims;
      });
    },
    []
  );

  // Dynamic A4 Standard Sizing (1 : Math.SQRT2)
  const updateBookDimensions = useCallback(
    (overrideFs?: boolean | Event | UIEvent | ResizeObserverEntry[]) => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      // While exiting fullscreen, keep the restored pre-fullscreen dimensions locked
      // so transitional OS fullscreen exit frames never re-inflate the book.
      if (isExitingFullscreenRef.current && overrideFs !== true) {
        if (preFullscreenDimsRef.current) {
          applyDimsToWrapper(preFullscreenDimsRef.current);
        }
        return;
      }

      const activeFullscreen =
        typeof overrideFs === 'boolean' ? overrideFs : isFullscreenRef.current;

      const hostContainer = placeholderRef.current || wrapper.parentElement;
      const vw = activeFullscreen
        ? window.screen && document.fullscreenElement
          ? Math.max(window.innerWidth || 0, document.documentElement.clientWidth || 0)
          : window.innerWidth || document.documentElement.clientWidth || wrapper.clientWidth || 1024
        : (hostContainer && hostContainer.clientWidth > 40
            ? hostContainer.clientWidth
            : wrapper.clientWidth) ||
          window.innerWidth ||
          800;
      const vh = activeFullscreen
        ? window.screen && document.fullscreenElement
          ? Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0)
          : window.innerHeight || document.documentElement.clientHeight || wrapper.clientHeight || 768
        : (hostContainer && hostContainer.clientHeight > 40
            ? hostContainer.clientHeight
            : wrapper.clientHeight) ||
          window.innerHeight ||
          600;

      const isMobile = isMobilePreviewMode || vw < 768 || (vw < 900 && vh > vw);
      const A4_RATIO = Math.SQRT2;

      let pageW: number, pageH: number;
      if (isMobile) {
        const hPad = activeFullscreen ? 12 : 28;
        const vPad = activeFullscreen ? 44 : 84;
        const maxAvailW = Math.min(vw - hPad, activeFullscreen ? 820 : 600);
        const maxAvailH = vh - vPad;

        if (maxAvailW * A4_RATIO <= maxAvailH) {
          pageW = Math.max(220, maxAvailW);
          pageH = Math.round(pageW * A4_RATIO);
        } else {
          pageH = Math.max(310, maxAvailH);
          pageW = Math.round(pageH / A4_RATIO);
        }
      } else {
        const hPad = activeFullscreen ? 24 : 104;
        const vPad = activeFullscreen ? 28 : 92;
        const maxBookTotalW = Math.min(vw - hPad, activeFullscreen ? 2400 : 1680);
        const maxAvailHDesktop = vh - vPad;

        if ((maxBookTotalW / 2) * A4_RATIO <= maxAvailHDesktop) {
          pageW = Math.max(240, Math.floor(maxBookTotalW / 2));
          pageH = Math.round(pageW * A4_RATIO);
        } else {
          pageH = Math.max(340, Math.floor(maxAvailHDesktop));
          pageW = Math.round(pageH / A4_RATIO);
        }
      }

      // Apply zoom
      pageW = Math.round(pageW * zoomLevel);
      pageH = Math.round(pageH * zoomLevel);

      const scale = pageW / BASE_A4_WIDTH;
      const computedDims = { pageW, pageH, pageScale: scale, isMobileLayout: isMobile };

      if (!activeFullscreen && !isExitingFullscreenRef.current) {
        preFullscreenDimsRef.current = computedDims;
      }

      applyDimsToWrapper(computedDims);
    },
    [isMobilePreviewMode, zoomLevel, applyDimsToWrapper]
  );

  useEffect(() => {
    updateBookDimensions(isFullscreen);
    const t1 = setTimeout(() => updateBookDimensions(isFullscreen), 60);
    const t2 = setTimeout(() => updateBookDimensions(isFullscreen), 200);
    const t3 = setTimeout(() => updateBookDimensions(isFullscreen), 400);
    const observer = new ResizeObserver(() => updateBookDimensions());
    if (placeholderRef.current) {
      observer.observe(placeholderRef.current);
    }
    if (wrapperRef.current) {
      observer.observe(wrapperRef.current);
    }
    const handleWinResize = () => updateBookDimensions();
    window.addEventListener('resize', handleWinResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      observer.disconnect();
      window.removeEventListener('resize', handleWinResize);
    };
  }, [updateBookDimensions, isFullscreen]);

  // Initialize StPageFlip Engine + Mobile Portrait Bilateral Corner-Curl Patch
  useEffect(() => {
    const hostEl = mountRef.current;
    const templateEl = pagesTemplateRef.current;
    if (!hostEl || !templateEl || dims.pageW <= 0 || dims.pageH <= 0 || pages.length === 0) return;

    if (pageFlipRef.current) {
      try {
        pageFlipRef.current.destroy();
      } catch {
        // ignore cleanup error
      }
      pageFlipRef.current = null;
    }

    hostEl.innerHTML = '';

    const bookEl = document.createElement('div');
    const totalW = dims.isMobileLayout ? dims.pageW : dims.pageW * 2;
    bookEl.style.width = `${totalW}px`;
    bookEl.style.height = `${dims.pageH}px`;
    bookEl.style.position = 'relative';
    hostEl.appendChild(bookEl);

    const sourceItems = templateEl.querySelectorAll('.flip-page-template-item');
    const pageElements: HTMLElement[] = [];
    sourceItems.forEach((node) => {
      const clone = node.cloneNode(true) as HTMLElement;
      clone.style.width = `${dims.pageW}px`;
      clone.style.height = `${dims.pageH}px`;
      bookEl.appendChild(clone);
      pageElements.push(clone);
    });

    if (pageElements.length === 0) return;

    const safeStartPage = Math.max(0, Math.min(pageElements.length - 1, currentPageIndexRef.current));

    const pf = new PageFlip(bookEl, {
      width: dims.pageW,
      height: dims.pageH,
      size: 'fixed' as any,
      autoSize: false,
      minWidth: dims.pageW,
      maxWidth: dims.pageW,
      minHeight: dims.pageH,
      maxHeight: dims.pageH,
      maxShadowOpacity: 0.55,
      showCover: !dims.isMobileLayout,
      mobileScrollSupport: false,
      usePortrait: dims.isMobileLayout,
      startPage: safeStartPage,
      drawShadow: true,
      flippingTime: 780,
      swipeDistance: 20,
      clickEventForward: true,
      useMouseEvents: true,
      showPageCorners: true,
      disableFlipByClick: false,
    });

    pf.loadFromHTML(pageElements);

    // =========================================================================
    // BILATERAL MOBILE PORTRAIT CORNER-CURL PATCH & SOFT CLIP-PATH FIX
    // =========================================================================
    const render = pf.getRender() as any;
    const pageCollection = pf.getPageCollection() as any;
    const fc = pf.getFlipController() as any;
    const ui = pf.getUI() as any;

    // Ensure quick mobile touch taps (< 250ms) also trigger page flip
    if (ui && ui.distElement && ui.onTouchEnd) {
      ui.distElement.removeEventListener('touchend', ui.onTouchEnd);
      window.removeEventListener('touchend', ui.onTouchEnd);
      ui.onTouchEnd = function (t: TouchEvent) {
        if (t.changedTouches.length > 0) {
          const e = t.changedTouches[0];
          const i = ui.getMousePos(e.clientX, e.clientY);
          let s = false;
          if (ui.touchPoint !== null) {
            const dx = i.x - ui.touchPoint.point.x;
            const dy = Math.abs(i.y - ui.touchPoint.point.y);
            if (
              Math.abs(dx) > ui.swipeDistance &&
              dy < 2 * ui.swipeDistance &&
              Date.now() - ui.touchPoint.time < ui.swipeTimeout
            ) {
              const corner =
                ui.touchPoint.point.y < ui.app.getRender().getRect().height / 2
                  ? 'top'
                  : 'bottom';
              if (dx > 0) {
                ui.app.flipPrev(corner);
              } else {
                ui.app.flipNext(corner);
              }
              s = true;
            } else if (!ui.app.isUserTouch) {
              ui.app.startUserTouch(ui.touchPoint.point);
            }
            ui.touchPoint = null;
          }
          ui.app.userStop(i, s);
        }
      };
      window.addEventListener('touchend', ui.onTouchEnd);
    }

    if (render && pageCollection && fc) {
      // Force all pages (including covers) to 'soft' density so every page uses
      // smooth diagonal corner-curl clipping (drawSoft) instead of unclipped drawHard
      const patchPageGutterClip = (pageObj: any) => {
        if (!pageObj || pageObj.__gutterPatched) return;
        pageObj.__gutterPatched = true;
        pageObj.setDensity('soft');
        pageObj.setDrawingDensity('soft');

        const origDrawSoft = pageObj.drawSoft?.bind(pageObj);
        if (origDrawSoft) {
          pageObj.drawSoft = function (globalPos: { x: number; y: number }, baseStyle: string = '') {
            if (
              this !== this.render.flippingPage ||
              this.render.getOrientation() === 'portrait' ||
              this.render.bottomPage === this.render.flippingPage
            ) {
              return origDrawSoft(globalPos, baseStyle);
            }

            const rect = this.render.getRect();
            const pw = rect.pageWidth;
            const dir = this.render.getDirection();
            // Hide the 22px inner gutter strip of the flipping page while it is actively turning;
            // once the flip completes, simpleDraw() clears clip-path so 100% of the page shows.
            const gutterHidePx = Math.min(24, Math.round(pw * 0.055));
            const cosA = Math.cos(this.state.angle);
            const sinA = Math.sin(this.state.angle);

            let polyPoints = 'polygon( ';
            for (const pt of this.state.area) {
              if (pt !== null) {
                const local =
                  dir === 1
                    ? { x: -pt.x + this.state.position.x, y: pt.y - this.state.position.y }
                    : { x: pt.x - this.state.position.x, y: pt.y - this.state.position.y };
                let rx = local.x * cosA + local.y * sinA;
                const ry = local.y * cosA - local.x * sinA;
                rx = dir === 1 ? Math.max(gutterHidePx, rx) : Math.min(pw - gutterHidePx, rx);
                polyPoints += `${rx.toFixed(1)}px ${ry.toFixed(1)}px, `;
              }
            }
            polyPoints = polyPoints.slice(0, -2) + ')';

            const transformCss =
              this.render.isSafari() && this.state.angle === 0
                ? `transform: translate(${globalPos.x}px, ${globalPos.y}px);`
                : `transform: translate3d(${globalPos.x}px, ${globalPos.y}px, 0) rotate(${this.state.angle}rad);`;

            this.element.style.cssText =
              baseStyle +
              `transform-origin: 0 0; clip-path: ${polyPoints}; -webkit-clip-path: ${polyPoints};` +
              transformCss;
          };
        }
      };

      for (const p of pageCollection.getPages()) {
        patchPageGutterClip(p);
      }

      // Ensure outerShadow stays below flippingPage (zIndex + 4 instead of + 10)
      if (render.drawOuterShadow) {
        const origDrawOuterShadow = render.drawOuterShadow.bind(render);
        render.drawOuterShadow = function () {
          origDrawOuterShadow();
          if (this.outerShadow) {
            this.outerShadow.style.zIndex = `${this.getSettings().startZIndex + 4}`;
          }
        };
      }

      // Helper: Compute unpeeled polygon clip-path for the stationary page being lifted
      // so the peeled area behind First Cover (Page 2) and Last Cover is 100% clipped away
      const getUnpeeledClipPolygon = (calc: any, direction: number): string | null => {
        if (!calc) return null;
        const pw = calc.pageWidth;
        const ph = calc.pageHeight;
        const topPt = calc.topIntersectPoint;
        const sidePt = calc.sideIntersectPoint;
        const botPt = calc.bottomIntersectPoint;

        const validCount = (topPt ? 1 : 0) + (sidePt ? 1 : 0) + (botPt ? 1 : 0);
        if (validCount < 2) {
          if (calc.position && calc.position.x < pw * 0.5) {
            return 'polygon(0px 0px, 0px 0px, 0px 0px)';
          }
          return null;
        }

        const pts: Array<{ x: number; y: number }> = [{ x: 0, y: 0 }];
        if (topPt) {
          pts.push(topPt);
        } else {
          pts.push({ x: pw, y: 0 });
        }
        if (sidePt) {
          pts.push(sidePt);
        }
        if (botPt) {
          pts.push(botPt);
        } else {
          pts.push({ x: pw, y: ph });
        }
        pts.push({ x: 0, y: ph });

        const poly = pts
          .map((p) => {
            const clampedX = Math.max(0, Math.min(pw, p.x));
            const clampedY = Math.max(0, Math.min(ph, p.y));
            const cx = direction === 1 ? pw - clampedX : clampedX;
            const cy = clampedY;
            return `${cx.toFixed(1)}px ${cy.toFixed(1)}px`;
          })
          .join(', ');

        return `polygon(${poly})`;
      };

      // 1. Keep boundsRect.left = 0 when flipping backward in portrait mode
      const origGetRect = render.getRect.bind(render);
      render.getRect = function () {
        if (this.boundsRect === null) this.calculateBoundsRect();
        if (this.orientation === 'portrait' && this.direction === 1) {
          return {
            ...this.boundsRect,
            left: 0,
          };
        }
        return origGetRect();
      };

      // 2a. Clip leftPage to the unpeeled polygon during backward flip (direction === 1)
      //     so Page 2 (leftPage) never shows behind the closing Front Cover!
      const origDrawLeftPage = render.drawLeftPage.bind(render);
      render.drawLeftPage = function () {
        if (this.orientation === 'portrait') return;
        if (this.leftPage === null) return;
        origDrawLeftPage();
        if (this.direction === 1 && this.flippingPage !== null && fc.getCalculation() !== null) {
          const clipPoly = getUnpeeledClipPolygon(fc.getCalculation(), 1);
          const el = this.leftPage.getElement();
          if (clipPoly && el) {
            el.style.clipPath = clipPoly;
            (el.style as any).webkitClipPath = clipPoly;
          }
        }
      };

      // 2b. Clip rightPage to the unpeeled polygon during forward flip (direction === 0)
      //     and portrait backward flip so the inside-back page never shows behind the Last Cover!
      const origDrawRightPage = render.drawRightPage.bind(render);
      render.drawRightPage = function () {
        if (this.rightPage === null) return;
        if (this.orientation === 'portrait' && this.direction === 1) {
          this.rightPage.simpleDraw(0);
          if (this.flippingPage !== null && fc.getCalculation() !== null) {
            const clipPolyPortrait = getUnpeeledClipPolygon(fc.getCalculation(), 1);
            const elPortrait = this.rightPage.getElement();
            if (clipPolyPortrait && elPortrait) {
              elPortrait.style.clipPath = clipPolyPortrait;
              (elPortrait.style as any).webkitClipPath = clipPolyPortrait;
            }
          }
          return;
        }
        origDrawRightPage();
        if (this.direction === 0 && this.flippingPage !== null && fc.getCalculation() !== null) {
          const clipPolyRight = getUnpeeledClipPolygon(fc.getCalculation(), 0);
          const elRight = this.rightPage.getElement();
          if (clipPolyRight && elRight) {
            elRight.style.clipPath = clipPolyRight;
            (elRight.style as any).webkitClipPath = clipPolyRight;
          }
        }
      };

      // 3. Draw bottomPage with 'soft' polygon clip-path so next/prev page is ONLY revealed
      //    behind the peeled fold line (never unclipped on initial click)
      render.drawBottomPage = function () {
        if (this.bottomPage === null) return;
        if (this.bottomPage === this.flippingPage) return;
        const startZIndex = this.getSettings().startZIndex;
        const el = this.bottomPage.getElement();
        el.style.zIndex = `${startZIndex + 3}`;
        this.bottomPage.draw('soft');
      };

      // 4. Use a temporary copy for portrait BACK flip so current page curls from Left to Right
      const origGetFlippingPage = pageCollection.getFlippingPage.bind(pageCollection);
      pageCollection.getFlippingPage = function (direction: number) {
        if (this.render.getOrientation() === 'portrait' && direction === 1) {
          return this.pages[this.currentSpreadIndex].newTemporaryCopy();
        }
        return origGetFlippingPage(direction);
      };

      // 5. Reset direction to 0 after flip finishes in portrait mode
      const origReset = fc.reset.bind(fc);
      fc.reset = function () {
        origReset();
        if (this.render.getOrientation() === 'portrait') {
          this.render.setDirection(0);
        }
      };

      // 6. Accurate spread-based direction bounds check for both odd and even page counts
      fc.checkDirection = function (direction: number) {
        const spreads = pageCollection.getSpread();
        const cur = pageCollection.getCurrentSpreadIndex();
        return direction === 0 ? cur < spreads.length - 1 : cur > 0;
      };

      // 7. Detect Left half (direction 1 = Previous) vs Right half (direction 0 = Next) in portrait mode
      const origGetDirectionByPoint = fc.getDirectionByPoint.bind(fc);
      fc.getDirectionByPoint = function (touchPos: { x: number; y: number }) {
        if (this.render.getOrientation() === 'portrait') {
          const b = this.render.boundsRect || this.getBoundsRect();
          const screenX = touchPos.x - b.pageWidth;
          return screenX <= b.pageWidth * 0.45 ? 1 : 0;
        }
        return origGetDirectionByPoint(touchPos);
      };

      // 8. Enable corner peel on ALL 4 corners (top-left, bottom-left, top-right, bottom-right) in portrait mode
      const origIsPointOnCorners = fc.isPointOnCorners.bind(fc);
      fc.isPointOnCorners = function (globalPos: { x: number; y: number }) {
        if (this.render.getOrientation() === 'portrait') {
          const b = this.render.boundsRect || this.getBoundsRect();
          const pw = b.pageWidth;
          const ph = b.height;
          const cornerArea = Math.min(pw, ph) * 0.22;
          const gx = globalPos.x;
          const gy = globalPos.y;
          if (gx < 0 || gx > pw || gy < 0 || gy > ph) return false;
          const nearLeft = gx <= cornerArea;
          const nearRight = gx >= pw - cornerArea;
          const nearTop = gy <= cornerArea;
          const nearBottom = gy >= ph - cornerArea;
          return (nearLeft || nearRight) && (nearTop || nearBottom);
        }
        return origIsPointOnCorners(globalPos);
      };

      // 9. Clean up any active corner-hover peel before starting a drag fold or click flip
      const origFold = fc.fold.bind(fc);
      fc.fold = function (globalPos: { x: number; y: number }) {
        if (this.state !== 'user_fold' && this.calc !== null) {
          this.render.finishAnimation();
          this.reset();
        }
        origFold(globalPos);
      };

      const origFlip = fc.flip.bind(fc);
      fc.flip = function (globalPos: { x: number; y: number }) {
        if (this.state !== 'user_fold' && this.calc !== null) {
          this.render.finishAnimation();
          this.reset();
        }
        origFlip(globalPos);
      };

      // 10. Smooth threshold completion on touch/mouse release for both Next (dir 0) & Prev (dir 1)
      //     In PageFlipCalculator, pos.x is already in local mirrored coordinates
      //     (+pageWidth = unflipped start edge, -pageWidth = flipped target edge) for BOTH directions!
      const origStopMove = fc.stopMove.bind(fc);
      fc.stopMove = function () {
        if (this.calc === null) return;
        if (this.state === 'user_fold') {
          const pos = this.calc.getPosition();
          const bounds = this.getBoundsRect();
          const targetY = this.calc.getCorner() === 'bottom' ? bounds.height : 0;
          if (pos.x <= bounds.pageWidth * 0.65) {
            this.animateFlippingTo(pos, { x: -bounds.pageWidth, y: targetY }, true);
          } else {
            this.animateFlippingTo(pos, { x: bounds.pageWidth, y: targetY }, false);
          }
          return;
        }
        origStopMove();
      };

      // 11. Ensure button-triggered flipPrev / flipNext in portrait mode also curl from Left/Right corners
      const origFlipPrev = fc.flipPrev.bind(fc);
      fc.flipPrev = function (corner: 'top' | 'bottom' = 'bottom') {
        if (this.render.getOrientation() === 'portrait') {
          if (pageCollection.getCurrentSpreadIndex() <= 0) return;
          const b = this.render.boundsRect || this.getBoundsRect();
          this.flip({
            x: 16,
            y: corner === 'top' ? 16 : b.height - 16,
          });
          return;
        }
        origFlipPrev(corner);
      };

      const origFlipNext = fc.flipNext.bind(fc);
      fc.flipNext = function (corner: 'top' | 'bottom' = 'bottom') {
        if (this.render.getOrientation() === 'portrait') {
          const spreads = pageCollection.getSpread();
          if (pageCollection.getCurrentSpreadIndex() >= spreads.length - 1) return;
          const b = this.render.boundsRect || this.getBoundsRect();
          this.flip({
            x: b.pageWidth - 16,
            y: corner === 'top' ? 16 : b.height - 16,
          });
          return;
        }
        origFlipNext(corner);
      };
    }

    pf.on('flip', (e: any) => {
      const newPageIdx = typeof e.data === 'number' ? e.data : 0;
      currentPageIndexRef.current = newPageIdx;
      setCurrentPageIndex(newPageIdx);
      const actualMaxIdx = Math.max(0, (book.pages?.length || pages.length) - 1);
      onPageSelectRef.current?.(Math.min(actualMaxIdx, newPageIdx));
    });

    pf.on('changeState', (e: any) => {
      const state = e.data;
      if (state === 'flipping' || state === 'user_fold') {
        setIsFlipping(true);
        if (state === 'flipping') {
          const now = Date.now();
          if (now - lastFlipTimeRef.current > 250) {
            lastFlipTimeRef.current = now;
            if (soundEnabledRef.current) {
              playPageTurnSound();
            }
          }
        }
      } else if (state === 'read') {
        setIsFlipping(false);
      }
    });

    pageFlipRef.current = pf;

    return () => {
      try {
        pf.destroy();
      } catch {
        // ignore cleanup error
      }
      pageFlipRef.current = null;
    };
  }, [dims.pageW, dims.pageH, dims.isMobileLayout, pages.length, book.id, book.themeId]);

  // Live DOM synchronization when user edits page text/blocks/images in Studio without changing page count
  useEffect(() => {
    const hostEl = mountRef.current;
    const templateEl = pagesTemplateRef.current;
    if (!hostEl || !templateEl) return;

    const templatePages = templateEl.querySelectorAll('.flip-page-template-item');
    templatePages.forEach((tplNode, idx) => {
      const liveNodes = hostEl.querySelectorAll(`.flip-page-template-item[data-page-idx="${idx}"]`);
      liveNodes.forEach((liveNode) => {
        if (liveNode.innerHTML !== tplNode.innerHTML) {
          liveNode.innerHTML = tplNode.innerHTML;
        }
      });
    });
  }, [book, dims.pageScale, pages]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = (e.target || document.activeElement) as HTMLElement | null;
      if (target) {
        const tagName = target.tagName;
        if (
          tagName === 'INPUT' ||
          tagName === 'TEXTAREA' ||
          tagName === 'SELECT' ||
          tagName === 'BUTTON' ||
          target.isContentEditable ||
          target.closest('input') ||
          target.closest('textarea') ||
          target.closest('select') ||
          target.closest('[contenteditable="true"]') ||
          target.closest('aside') ||
          target.closest('[role="dialog"]') ||
          target.closest('.block-editor-card') ||
          target.closest('.studio-sidebar')
        ) {
          return;
        }
      }

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        flipNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        flipPrev();
      } else if (e.key === 'Home') {
        goToPageIndex(0);
      } else if (e.key === 'End') {
        goToPageIndex(totalPages - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flipNext, flipPrev, goToPageIndex, totalPages]);

  // Natural Wheel / Trackpad Page Flip
  const lastWheelTimeRef = useRef<number>(0);
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.closest('aside') ||
          target.closest('.studio-sidebar') ||
          target.closest('[role="dialog"]') ||
          target.closest('.modal-content') ||
          target.closest('.block-editor-card'))
      ) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const now = Date.now();
      if (now - lastWheelTimeRef.current < 420) {
        return;
      }

      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(delta) > 18) {
        lastWheelTimeRef.current = now;
        if (delta > 0) {
          flipNext();
        } else {
          flipPrev();
        }
      }
    };

    wrapper.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      wrapper.removeEventListener('wheel', handleWheel);
    };
  }, [flipNext, flipPrev]);

  const wasNativeFullscreenRef = useRef<boolean>(false);
  const exitLockTimerRef = useRef<NodeJS.Timeout | null>(null);

  const restoreToWebsiteContainer = useCallback(() => {
    if (exitLockTimerRef.current) {
      clearTimeout(exitLockTimerRef.current);
    }
    isExitingFullscreenRef.current = true;
    wasNativeFullscreenRef.current = false;
    isFullscreenRef.current = false;
    setIsFullscreen(false);
    setIsPseudoFullscreen(false);

    const wrapper = wrapperRef.current;
    const placeholder = placeholderRef.current;
    if (wrapper && placeholder && wrapper.parentElement !== placeholder) {
      placeholder.appendChild(wrapper);
    }

    if (preFullscreenDimsRef.current) {
      applyDimsToWrapper(preFullscreenDimsRef.current);
    } else {
      isExitingFullscreenRef.current = false;
      updateBookDimensions(false);
    }

    exitLockTimerRef.current = setTimeout(() => {
      isExitingFullscreenRef.current = false;
      updateBookDimensions(false);
    }, 620);
  }, [applyDimsToWrapper, updateBookDimensions]);

  useEffect(() => {
    return () => {
      if (exitLockTimerRef.current) {
        clearTimeout(exitLockTimerRef.current);
      }
      const wrapper = wrapperRef.current;
      const placeholder = placeholderRef.current;
      if (wrapper && placeholder && wrapper.parentElement !== placeholder) {
        placeholder.appendChild(wrapper);
      }
    };
  }, []);

  // Sync native fullscreen changes (e.g. pressing Esc) and Escape key for pseudo-fullscreen
  useEffect(() => {
    const handleFsChange = () => {
      const nativeFsEl =
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement;

      if (nativeFsEl) {
        if (exitLockTimerRef.current) {
          clearTimeout(exitLockTimerRef.current);
        }
        isExitingFullscreenRef.current = false;
        wasNativeFullscreenRef.current = true;
        isFullscreenRef.current = true;
        setIsPseudoFullscreen(false);
        setIsFullscreen(true);
        updateBookDimensions(true);
        setTimeout(() => updateBookDimensions(true), 80);
        setTimeout(() => updateBookDimensions(true), 220);
        setTimeout(() => updateBookDimensions(true), 420);
      } else if (wasNativeFullscreenRef.current || isFullscreenRef.current) {
        restoreToWebsiteContainer();
      }
    };

    const handleKeyEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreenRef.current) {
        restoreToWebsiteContainer();
      }
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    document.addEventListener('mozfullscreenchange', handleFsChange);
    document.addEventListener('MSFullscreenChange', handleFsChange);
    window.addEventListener('keydown', handleKeyEsc);

    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
      document.removeEventListener('mozfullscreenchange', handleFsChange);
      document.removeEventListener('MSFullscreenChange', handleFsChange);
      window.removeEventListener('keydown', handleKeyEsc);
    };
  }, [updateBookDimensions, restoreToWebsiteContainer]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('flipbook-fullscreen-active', isPseudoFullscreen);
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('flipbook-fullscreen-active');
      }
    };
  }, [isPseudoFullscreen]);

  // Maximize / Minimize Fullscreen Toggle
  const toggleFullscreen = useCallback(
    (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const nativeFsEl =
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement;

      // Minimize: return back inside the website container ("pahele jaisa")
      if (isFullscreenRef.current || isFullscreen || nativeFsEl) {
        restoreToWebsiteContainer();

        if (nativeFsEl) {
          const exitFn =
            document.exitFullscreen ||
            (document as any).webkitExitFullscreen ||
            (document as any).mozCancelFullScreen ||
            (document as any).msExitFullscreen;
          try {
            const p = exitFn?.call(document);
            if (p && typeof p.catch === 'function') {
              p.catch(() => {});
            }
          } catch {
            // ignore
          }
        }
      } else {
        // Maximize: Save current normal website dimensions first
        preFullscreenDimsRef.current = { ...dims };
        if (exitLockTimerRef.current) {
          clearTimeout(exitLockTimerRef.current);
        }
        isExitingFullscreenRef.current = false;

        const activateFallbackPortal = () => {
          if (wrapper.parentElement !== document.body) {
            document.body.appendChild(wrapper);
          }
          wasNativeFullscreenRef.current = false;
          isFullscreenRef.current = true;
          setIsPseudoFullscreen(true);
          setIsFullscreen(true);
          updateBookDimensions(true);
          setTimeout(() => updateBookDimensions(true), 60);
          setTimeout(() => updateBookDimensions(true), 200);
        };

        // Call native requestFullscreen SYNCHRONOUSLY FIRST on user click so the book
        // pops completely outside the website into true OS/Monitor Fullscreen.
        const reqFn =
          wrapper.requestFullscreen ||
          (wrapper as any).webkitRequestFullscreen ||
          (wrapper as any).mozRequestFullScreen ||
          (wrapper as any).msRequestFullscreen;

        if (reqFn) {
          try {
            const p = reqFn.call(wrapper);
            if (p && typeof p.then === 'function') {
              p.then(() => {
                wasNativeFullscreenRef.current = true;
                isFullscreenRef.current = true;
                setIsPseudoFullscreen(false);
                setIsFullscreen(true);
                updateBookDimensions(true);
                setTimeout(() => updateBookDimensions(true), 80);
                setTimeout(() => updateBookDimensions(true), 220);
                setTimeout(() => updateBookDimensions(true), 420);
              }).catch(() => {
                activateFallbackPortal();
              });
            } else {
              wasNativeFullscreenRef.current = true;
              isFullscreenRef.current = true;
              setIsPseudoFullscreen(false);
              setIsFullscreen(true);
              updateBookDimensions(true);
              setTimeout(() => updateBookDimensions(true), 100);
            }
          } catch {
            activateFallbackPortal();
          }
        } else {
          activateFallbackPortal();
        }
      }
    },
    [isFullscreen, dims, updateBookDimensions, restoreToWebsiteContainer]
  );

  // Backdrop gradient styles
  const getBackdropClass = () => {
    switch (stageBackdrop) {
      case 'dark':
        return 'bg-gradient-to-b from-slate-950 via-neutral-900 to-black';
      case 'wood':
        return 'bg-gradient-to-b from-[#2d1b14] via-[#1f120c] to-[#120a06]';
      case 'marble':
        return 'bg-gradient-to-b from-[#f8f9fa] via-[#e9ecef] to-[#dee2e6]';
      case 'linen':
        return 'bg-gradient-to-b from-[#2b303a] via-[#1e2229] to-[#12151a]';
      case 'studio':
      default:
        return 'bg-gradient-to-b from-slate-100 via-slate-200 to-slate-300';
    }
  };

  const isCoverClosed = !dims.isMobileLayout && currentPageIndex === 0 && !isFlipping;
  const isBackClosed =
    !dims.isMobileLayout &&
    totalPages > 1 &&
    currentPageIndex >= totalPages - 1 &&
    !isFlipping;

  return (
    <div ref={placeholderRef} className="w-full h-full relative overflow-hidden">
      <div
        id="flipbook-wrapper"
        ref={wrapperRef}
        className={`${isPseudoFullscreen ? 'is-pseudo-fullscreen' : ''} ${
          dims.isMobileLayout ? 'is-mobile' : ''
        } ${getBackdropClass()}`}
        style={
          isPseudoFullscreen
            ? {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100dvh',
                zIndex: 2147483647,
                margin: 0,
                borderRadius: 0,
              }
            : undefined
        }
      >
      {/* Hidden JSX Page Template Container (Cloned cleanly into StPageFlip without React 19 flushSync errors) */}
      <div ref={pagesTemplateRef} className="hidden" aria-hidden="true">
        {pages.map((page, idx) => {
          const isFrontCover = page?.template === 'cover-front';
          const isBackCover = page?.template === 'cover-back';
          const isCover = isFrontCover || isBackCover;
          const isLeftSpreadPage = !dims.isMobileLayout && idx > 0 && idx % 2 === 1;

          return (
            <div
              key={page?.id || `page-${idx}`}
              data-page-idx={idx}
              data-density="soft"
              className="flip-page-template-item relative overflow-hidden select-none"
              style={{
                width: `${dims.pageW}px`,
                height: `${dims.pageH}px`,
              }}
            >
              <div
                className={`flip-page-surface w-full h-full relative overflow-hidden select-none ${
                  isFrontCover
                    ? 'cover-front is-cover'
                    : isBackCover
                    ? 'cover-back-outer is-cover'
                    : ''
                }`}
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: isCover ? undefined : theme.pageBg || '#ffffff',
                  background: isCover ? theme.bgGradient : theme.pageBg || '#ffffff',
                  color: isCover ? theme.textColor || '#ffffff' : theme.pageTextColor,
                  border: isCover
                    ? `2px solid ${theme.borderColor || 'rgba(201,168,78,0.4)'}`
                    : '1px solid rgba(0, 0, 0, 0.05)',
                  borderRadius: dims.isMobileLayout
                    ? '8px'
                    : isFrontCover
                    ? '0 6px 6px 0'
                    : isBackCover
                    ? '6px 0 0 6px'
                    : isLeftSpreadPage
                    ? '6px 0 0 6px'
                    : '0 6px 6px 0',
                  boxShadow: isCover
                    ? 'inset 0 0 35px rgba(0, 0, 0, 0.45)'
                    : dims.isMobileLayout
                    ? 'inset 0 0 18px rgba(0, 0, 0, 0.03)'
                    : isLeftSpreadPage
                    ? 'inset -16px 0 22px -10px rgba(0, 0, 0, 0.08)'
                    : 'inset 16px 0 22px -10px rgba(0, 0, 0, 0.08)',
                }}
              >
                <div
                  className="a4-page-canvas"
                  style={{
                    width: `${BASE_A4_WIDTH}px`,
                    height: `${BASE_A4_HEIGHT}px`,
                    transform: `scale(${dims.pageScale})`,
                    transformOrigin: 'top left',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    overflow: 'hidden',
                  }}
                >
                  <PageRenderer
                    page={page}
                    theme={theme}
                    bookTitle={book.title}
                    bookAuthor={book.author}
                    pageNumber={idx + 1}
                    coverImageUrl={book.coverImageUrl}
                    onNavigateToPage={(num) => {
                      goToPageIndex(Math.max(0, num - 1));
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Brand Logo / Link Badge (Top-Left) */}
      {(book.customBrandLogo || book.customBrandName) && !hideInternalControls && (
        <a
          href={book.customBrandUrl || '#'}
          target={book.customBrandUrl ? '_blank' : undefined}
          rel={book.customBrandUrl ? 'noopener noreferrer' : undefined}
          onClick={(e) => {
            if (!book.customBrandUrl) e.preventDefault();
            e.stopPropagation();
          }}
          className="absolute top-4 left-4 z-30 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-md text-xs font-bold text-slate-900 hover:scale-[1.03] transition-transform"
          title={book.customBrandUrl ? `Visit ${book.customBrandName || book.customBrandUrl}` : book.customBrandName}
        >
          {book.customBrandLogo && (
            <img
              src={book.customBrandLogo}
              alt={book.customBrandName || 'Brand'}
              className="h-5 w-auto max-w-[85px] object-contain rounded"
            />
          )}
          {book.customBrandName && <span>{book.customBrandName}</span>}
        </a>
      )}

      {/* Top Floating Studio Toolbar */}
      {!hideInternalControls && (
        <div
          className="top-floating-controls"
          id="top-controls"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {/* Slideshow Presentation Mode Button */}
          <button
            type="button"
            className={`float-icon-btn ${isAutoPlaying ? 'bg-emerald-500 text-white!' : ''}`}
            title={isAutoPlaying ? 'Pause Presentation Slideshow' : 'Start Auto-Play Presentation'}
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          >
            {isAutoPlaying ? (
              <Pause className="w-4 h-4 text-emerald-600" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>

          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center bg-white/70 backdrop-blur-md rounded-full border border-slate-200/80 p-0.5 shadow-sm">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(0.7, +(z - 0.1).toFixed(1)))}
              className="p-2 text-slate-700 hover:text-emerald-700 hover:bg-white rounded-full transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono font-bold px-1.5 text-slate-700">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(1.3, +(z + 0.1).toFixed(1)))}
              className="p-2 text-slate-700 hover:text-emerald-700 hover:bg-white rounded-full transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Sound FX Toggle */}
          <button
            type="button"
            className="float-icon-btn"
            id="btn-sound"
            title={soundEnabled ? 'Mute Page Turn Sound' : 'Enable Page Turn Sound'}
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{ opacity: soundEnabled ? 1 : 0.4 }}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            className={`float-icon-btn ${
              isFullscreen ? 'bg-emerald-600! text-white! border-emerald-700! shadow-lg' : ''
            }`}
            id="btn-fullscreen"
            title={isFullscreen ? 'Minimize (Exit Fullscreen)' : 'Maximize (Fullscreen)'}
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* Auto-Play Active Badge */}
      {isAutoPlaying && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 border border-emerald-500/50 text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xl flex items-center gap-2 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Presentation Mode ({autoPlayInterval}s interval)</span>
        </div>
      )}

      {/* Center 3D Book Stage */}
      <div className="book-stage" id="book-stage" ref={bookStageRef}>
        <div
          className={`flipbook-container ${dims.isMobileLayout ? 'is-mobile' : ''} ${
            isCoverClosed ? 'is-cover-closed' : isBackClosed ? 'is-back-closed' : ''
          }`}
          id="book-container"
          style={{
            width: dims.isMobileLayout ? `${dims.pageW}px` : `${dims.pageW * 2}px`,
            height: `${dims.pageH}px`,
          }}
        >
          {/* Subtle physical book thickness block edges on open desktop spread */}
          {!dims.isMobileLayout && !isFlipping && currentPageIndex > 0 && currentPageIndex < totalPages - 1 && (
            <>
              <div
                className="absolute top-[2px] bottom-[2px] left-[-4px] w-[4px] rounded-l-[4px] pointer-events-none z-0"
                style={{
                  background: 'linear-gradient(to left, rgba(0,0,0,0.08), rgba(255,255,255,0.92))',
                  borderLeft: '1px solid rgba(0,0,0,0.06)',
                }}
              />
              <div
                className="absolute top-[2px] bottom-[2px] right-[-4px] w-[4px] rounded-r-[4px] pointer-events-none z-0"
                style={{
                  background: 'linear-gradient(to right, rgba(0,0,0,0.08), rgba(255,255,255,0.92))',
                  borderRight: '1px solid rgba(0,0,0,0.06)',
                }}
              />
            </>
          )}

          {/* Center Spine Shadow (hidden during active page flip so it never overlaps the turning leaf) */}
          {!dims.isMobileLayout && !isCoverClosed && !isBackClosed && !isFlipping && (
            <div className="book-spine-shadow" />
          )}

          {/* StPageFlip Mount Container */}
          <div
            ref={mountRef}
            className="w-full h-full relative"
            style={{
              width: dims.isMobileLayout ? `${dims.pageW}px` : `${dims.pageW * 2}px`,
              height: `${dims.pageH}px`,
            }}
          />
        </div>
      </div>

      {/* Bottom Navigation Curved Arrows & Center Page No. Input Box */}
      {!hideInternalControls && (
        <>
          <button
            className="corner-nav-btn btn-prev-corner"
            id="btn-prev-corner"
            title="Previous Page (Left Arrow)"
            onClick={flipPrev}
            disabled={currentPageIndex <= 0}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="9 14 4 9 9 4" />
              <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
            </svg>
          </button>

          {/* Center Jump-to-Page Number Input Box */}
          <div
            className="absolute bottom-[16px] sm:bottom-[22px] left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-md text-xs font-semibold text-slate-700"
            title="Type page number and press Enter to jump"
          >
            <span className="text-[11px] text-slate-500 leading-none">Page</span>
            <input
              type="text"
              inputMode="numeric"
              value={pageJumpInput}
              onChange={(e) => setPageJumpInput(e.target.value.replace(/[^0-9]/g, ''))}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Enter') {
                  const parsed = parseInt(pageJumpInput, 10);
                  if (!isNaN(parsed)) {
                    const targetIdx = Math.max(0, Math.min(totalPages - 1, parsed - 1));
                    setPageJumpInput(String(targetIdx + 1));
                    goToPageIndex(targetIdx);
                  } else {
                    setPageJumpInput(String(currentPageIndex + 1));
                  }
                  (e.target as HTMLInputElement).blur();
                }
              }}
              onBlur={() => {
                const parsed = parseInt(pageJumpInput, 10);
                if (!isNaN(parsed)) {
                  const targetIdx = Math.max(0, Math.min(totalPages - 1, parsed - 1));
                  setPageJumpInput(String(targetIdx + 1));
                  goToPageIndex(targetIdx);
                } else {
                  setPageJumpInput(String(currentPageIndex + 1));
                }
              }}
              className="w-10 h-6 px-1 py-0 text-center font-mono-code font-bold text-xs leading-6 text-slate-950 bg-slate-100 hover:bg-white focus:bg-white border border-slate-300 focus:border-emerald-600 rounded-md focus:outline-none transition-colors"
            />
            <span className="text-[11px] text-slate-500 font-mono-code leading-none">/ {totalPages}</span>
          </div>

          <button
            className="corner-nav-btn btn-next-corner"
            id="btn-next-corner"
            title="Next Page (Right Arrow)"
            onClick={flipNext}
            disabled={currentPageIndex >= totalPages - 1}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="15 14 20 9 15 4" />
              <path d="M4 20v-7a4 4 0 0 1 4-4h12" />
            </svg>
          </button>
        </>
      )}
      </div>
    </div>
  );
};
