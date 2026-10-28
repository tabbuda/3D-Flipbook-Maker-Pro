import { BookProject } from '../types/flipbook';
import { COVER_THEMES } from '../constants/templates';
import { convertBookImagesToBase64 } from './imageUtils';
import { getLicenseInfo } from './licenseManager';
import pageFlipModuleRaw from 'page-flip/dist/js/page-flip.module.js?raw';

const INLINE_PAGE_FLIP_ENGINE = pageFlipModuleRaw.replace(
  /export\s*\{\s*x\s+as\s+PageFlip\s*\}\s*;?/,
  'window.PageFlip = x;'
);

export async function generateStandaloneFlipbookHtmlAsync(
  book: BookProject,
  initialPageIndex: number = 0,
  options?: { isPro?: boolean }
): Promise<string> {
  const base64Book = await convertBookImagesToBase64(book);
  return generateStandaloneFlipbookHtml(base64Book, initialPageIndex, options);
}

export function generateStandaloneFlipbookHtml(
  book: BookProject,
  initialPageIndex: number = 0,
  options?: { isPro?: boolean }
): string {
  const isPro = options?.isPro ?? (getLicenseInfo().tier === 'pro');
  const theme = COVER_THEMES[book.themeId] || COVER_THEMES['emerald-gold'];

  // Convert pages into JSON
  const bookJson = JSON.stringify(book, null, 2);
  const initialPage = Math.max(0, initialPageIndex || 0);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
    <title>${escapeHtml(book.title)} — 3D Digital Flipbook</title>
    <meta
      name="description"
      content="${escapeHtml(book.subtitle || book.title)} by ${escapeHtml(book.author)}"
    />

    <!-- Google Fonts: Plus Jakarta Sans -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,400&family=Cinzel:wght@600;700;900&display=swap"
      rel="stylesheet"
    />

    <style>
      :root {
        --bg-stage: #eef2ef;
        --bg-stage-gradient: radial-gradient(
          circle at 50% 45%,
          #f5f8f6 0%,
          #e4ebe7 100%
        );
        --page-bg: ${theme.pageBg || '#ffffff'};
        --text-main: ${theme.pageTextColor || '#0c241b'};
        --text-muted: #566861;
        --accent-green: ${theme.accentColor || '#0e6b4e'};
        --accent-green-dark: #073b2a;
        --accent-green-light: #e8f5f0;
        --gold-accent: ${theme.accentColor || '#c9a84e'};
        --border-subtle: ${theme.borderColor || '#e2ebe6'};
        --shadow-book:
          0 24px 50px -12px rgba(10, 32, 23, 0.22),
          0 10px 24px -8px rgba(0, 0, 0, 0.1);
        --book-radius: 8px;

        /* Dynamic A4 Standard Aspect Ratio (1 : 1.4142 / Width : Height) */
        --page-w: 400px;
        --page-h: 566px;
        --page-scale: 1;
        --anim-speed: 0.65s;

        /* Proportional Inner Content Sizing based on Page Scale */
        --title-size: calc(22px * var(--page-scale));
        --body-size: calc(12.5px * var(--page-scale));
        --icon-box-size: calc(24px * var(--page-scale));
        --icon-svg-size: calc(18px * var(--page-scale));
        --list-gap: calc(8px * var(--page-scale));
        --item-gap: calc(6px * var(--page-scale));
        --page-pad-v: calc(13px * var(--page-scale));
        --page-pad-h: calc(15px * var(--page-scale));
        --title-margin-b: calc(8px * var(--page-scale));
        --title-margin-t: calc(2px * var(--page-scale));
        --footer-size: calc(9px * var(--page-scale));
        --footer-pad-t: calc(5px * var(--page-scale));
        --footer-margin-t: calc(5px * var(--page-scale));

        /* Form Mockup Scaled Sizing */
        --mockup-pad: calc(12px * var(--page-scale));
        --mockup-radius: calc(8px * var(--page-scale));
        --mockup-margin-v: calc(7px * var(--page-scale));
        --mockup-font-size: calc(11px * var(--page-scale));
        --mockup-header-pad-b: calc(6px * var(--page-scale));
        --mockup-header-margin-b: calc(7px * var(--page-scale));
        --mockup-input-pad: calc(6px * var(--page-scale))
          calc(9px * var(--page-scale));
        --mockup-input-margin-b: calc(7px * var(--page-scale));
        --mockup-pill-w: calc(32px * var(--page-scale));
        --mockup-pill-h: calc(18px * var(--page-scale));
        --mockup-pill-dot: calc(13px * var(--page-scale));
        --mockup-pill-shift: calc(14px * var(--page-scale));
        --watermark-size: calc(240px * var(--page-scale));
        --watermark-offset: calc(-50px * var(--page-scale));
      }

      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        -webkit-tap-highlight-color: transparent;
      }

      html,
      body {
        width: 100%;
        height: 100%;
        min-height: 100%;
        overflow: hidden;
        background: #eef2ef !important;
        background-color: var(--bg-stage) !important;
        background-image: var(--bg-stage-gradient) !important;
        font-family:
          "Plus Jakarta Sans",
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          Roboto,
          sans-serif;
        color: var(--text-main);
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
      }

      :fullscreen,
      ::backdrop,
      :-webkit-full-screen,
      :-webkit-full-screen-ancestor,
      :-moz-full-screen,
      :-moz-full-screen-ancestor,
      :-ms-fullscreen,
      html:fullscreen,
      body:fullscreen,
      #flipbook-wrapper:fullscreen,
      #flipbook-wrapper:-webkit-full-screen {
        background: #eef2ef !important;
        background-color: #eef2ef !important;
        background-image: radial-gradient(
          circle at 50% 45%,
          #f5f8f6 0%,
          #e4ebe7 100%
        ) !important;
        width: 100vw !important;
        height: 100vh !important;
        overflow: hidden !important;
      }

      /* Stage Wrapper */
      #flipbook-wrapper {
        position: relative;
        width: 100vw;
        height: 100vh;
        height: 100dvh;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        padding: 20px;
        background: var(--bg-stage);
        background-image: var(--bg-stage-gradient);
      }

      #flipbook-wrapper.is-pseudo-fullscreen {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 999999 !important;
      }

      /* Top-Right Floating Controls */
      .top-floating-controls {
        position: absolute;
        top: 20px;
        right: 24px;
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 1000;
      }

      .float-icon-btn {
        background: rgba(255, 255, 255, 0.6);
        border: 1px solid rgba(14, 107, 78, 0.12);
        color: #1a2e26;
        width: 42px;
        height: 42px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        opacity: 0.9;
        outline: none;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      }

      .float-icon-btn:hover {
        opacity: 1;
        transform: scale(1.08);
        background: #ffffff;
        color: var(--accent-green);
        box-shadow: 0 4px 14px rgba(14, 107, 78, 0.15);
      }

      .float-icon-btn:active {
        transform: scale(0.95);
      }

      .float-icon-btn svg {
        width: 22px;
        height: 22px;
        stroke-width: 1.85;
      }

      /* Bottom Navigation Curved Arrows */
      .corner-nav-btn {
        position: absolute;
        bottom: 22px;
        background: rgba(255, 255, 255, 0.7);
        border: 1px solid rgba(14, 107, 78, 0.14);
        border-radius: 50%;
        color: #122920;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 1000;
        transition: all 0.2s ease;
        opacity: 0.9;
        outline: none;
        box-shadow: 0 4px 12px rgba(10, 32, 23, 0.08);
      }

      .corner-nav-btn:hover:not(:disabled) {
        opacity: 1;
        transform: scale(1.1);
        background: #ffffff;
        color: var(--accent-green);
        box-shadow: 0 6px 18px rgba(14, 107, 78, 0.2);
      }

      .corner-nav-btn:active:not(:disabled) {
        transform: scale(0.92);
      }

      .corner-nav-btn:disabled {
        opacity: 0.25;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }

      .corner-nav-btn svg {
        width: 28px;
        height: 28px;
        stroke-width: 2.2;
      }

      .corner-nav-btn.btn-prev-corner {
        left: 22px;
      }

      .corner-nav-btn.btn-next-corner {
        right: 22px;
      }

      /* Center Book Stage */
      .book-stage {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        position: relative;
        perspective: 2500px;
        touch-action: pan-y;
      }

      /* 3D Book Container */
      .flipbook-container {
        position: relative;
        width: calc(var(--page-w) * 2);
        height: var(--page-h);
        transform-style: preserve-3d;
        transition:
          transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1),
          width 0.3s ease,
          height 0.3s ease;
        border-radius: var(--book-radius);
        background: transparent;
        box-shadow: none;
      }

      .stf__item.--simple {
        box-shadow:
          0 16px 38px -10px rgba(0, 0, 0, 0.16),
          0 6px 16px -4px rgba(0, 0, 0, 0.08);
      }

      /* Desktop Book Position adjustment when closed on Cover or Back Cover */
      body:not(.is-mobile) .flipbook-container.is-cover-closed {
        transform: translateX(-25%);
        box-shadow: none !important;
      }

      body:not(.is-mobile) .flipbook-container.is-back-closed {
        transform: translateX(25%);
        box-shadow: none !important;
      }

      /* Precise single-page shadow when closed on front cover or back cover */
      .flipbook-container.is-cover-closed .book-leaf:first-child .leaf-face.face-front,
      .flipbook-container.is-cover-closed .book-leaf[data-leaf-index="0"] .leaf-face.face-front {
        box-shadow:
          0 18px 45px -10px rgba(0, 0, 0, 0.2),
          0 6px 18px -4px rgba(0, 0, 0, 0.1) !important;
      }

      .flipbook-container.is-back-closed .book-leaf:last-child .leaf-face.face-back,
      .flipbook-container.is-back-closed .book-leaf.flipped:last-child .leaf-face.face-back {
        box-shadow:
          0 18px 45px -10px rgba(0, 0, 0, 0.2),
          0 6px 18px -4px rgba(0, 0, 0, 0.1) !important;
      }

      .flipbook-container.is-cover-closed .book-spine-shadow,
      .flipbook-container.is-back-closed .book-spine-shadow {
        opacity: 0;
        pointer-events: none;
      }

      /* Mobile Single-Page Layout */
      body.is-mobile .flipbook-container {
        width: var(--page-w) !important;
        border-radius: 8px;
        transform: translateX(0);
        transition:
          transform var(--anim-speed) cubic-bezier(0.2, 0.8, 0.25, 1),
          width 0.3s ease,
          height 0.3s ease;
        box-shadow:
          0 14px 34px -8px rgba(0, 0, 0, 0.15),
          0 4px 12px -3px rgba(0, 0, 0, 0.06);
      }

      body.is-mobile .flipbook-container.is-cover-closed,
      .is-mobile .flipbook-container.is-cover-closed,
      .flipbook-container.is-mobile.is-cover-closed {
        transform: translateX(0) !important;
      }

      body.is-mobile .flipbook-container.is-back-closed,
      .is-mobile .flipbook-container.is-back-closed,
      .flipbook-container.is-mobile.is-back-closed {
        transform: translateX(0) !important;
      }

      /* Center Spine Shadow */
      .book-spine-shadow {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 50%;
        width: 32px;
        transform: translateX(-50%);
        background: linear-gradient(
          to right,
          rgba(0, 0, 0, 0) 0%,
          rgba(0, 0, 0, 0.04) 35%,
          rgba(0, 0, 0, 0.09) 50%,
          rgba(0, 0, 0, 0.04) 65%,
          rgba(0, 0, 0, 0) 100%
        );
        z-index: 2;
        pointer-events: none;
        transition: opacity 0.18s ease;
      }

      .flipbook-container.is-flipping-active .book-spine-shadow {
        opacity: 0 !important;
      }

      body.is-mobile .book-spine-shadow {
        display: none;
      }

      /* StPageFlip 3D Corner-Curl Engine Overrides */
      .stf__parent {
        position: relative !important;
        display: block !important;
        box-sizing: border-box !important;
        transform: translateZ(0);
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        user-select: none;
      }

      .stf__wrapper {
        position: relative !important;
        width: 100% !important;
        height: 100% !important;
        box-sizing: border-box !important;
        padding-bottom: 0 !important;
      }

      .stf__parent canvas {
        position: absolute !important;
        width: 100% !important;
        height: 100% !important;
        left: 0 !important;
        top: 0 !important;
        pointer-events: none;
      }

      .stf__block {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        height: 100% !important;
        box-sizing: border-box !important;
        perspective: 2200px !important;
      }

      .stf__item {
        display: none;
        position: absolute !important;
        transform-style: preserve-3d;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
        will-change: transform, clip-path;
      }

      .stf__outerShadow,
      .stf__innerShadow,
      .stf__hardShadow,
      .stf__hardInnerShadow {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        pointer-events: none !important;
        will-change: transform, opacity, clip-path;
      }

      /* 3D Leaf Sheet */
      .book-leaf {
        position: absolute;
        top: 0;
        right: 0;
        width: var(--page-w);
        height: 100%;
        transform-origin: left center;
        transform-style: preserve-3d;
        transition: transform var(--anim-speed) cubic-bezier(0.2, 0.8, 0.25, 1);
        will-change: transform;
        cursor: pointer;
        border-radius: var(--book-radius);
        box-shadow: none;
      }

      .book-leaf.flipped {
        transform: rotateY(-180deg);
      }

      .book-leaf.is-flipping {
        box-shadow:
          0 22px 40px -10px rgba(0, 0, 0, 0.25),
          0 8px 16px -4px rgba(0, 0, 0, 0.12);
        z-index: 100 !important;
      }

      body.is-mobile .book-leaf {
        left: 0;
        right: auto;
      }

      /* Leaf Front & Back Faces */
      .leaf-face {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
        overflow: hidden;
        background-color: var(--page-bg);
        box-sizing: border-box;
        padding: 0 !important;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .leaf-face.face-front {
        z-index: 2;
        border-top-right-radius: var(--book-radius);
        border-bottom-right-radius: var(--book-radius);
        background-image: linear-gradient(
          to left,
          #ffffff 0%,
          #fafcfb 80%,
          #f2f5f3 100%
        );
        box-shadow: inset 14px 0 18px -10px rgba(0, 0, 0, 0.05);
        border-left: 1px solid rgba(0, 0, 0, 0.04);
      }

      .leaf-face.face-left {
        z-index: 2;
        border-top-left-radius: var(--book-radius);
        border-bottom-left-radius: var(--book-radius);
        background-image: linear-gradient(
          to right,
          #ffffff 0%,
          #fafcfb 80%,
          #f2f5f3 100%
        );
        box-shadow: inset -14px 0 18px -10px rgba(0, 0, 0, 0.05);
        border-right: 1px solid rgba(0, 0, 0, 0.04);
      }

      .leaf-face.face-back {
        transform: rotateY(180deg);
        z-index: 1;
        border-top-left-radius: var(--book-radius);
        border-bottom-left-radius: var(--book-radius);
        background-image: linear-gradient(
          to right,
          #ffffff 0%,
          #fafcfb 80%,
          #f2f5f3 100%
        );
        box-shadow: inset -14px 0 18px -10px rgba(0, 0, 0, 0.05);
        border-right: 1px solid rgba(0, 0, 0, 0.04);
      }

      /* Mobile Face Overrides */
      body.is-mobile .leaf-face:not(.is-cover) {
        padding: 0 !important;
        border-radius: 8px !important;
        box-shadow: none !important;
        background-image: linear-gradient(
          135deg,
          #ffffff 0%,
          #fafcfb 100%
        ) !important;
        border: 1px solid rgba(0, 0, 0, 0.05);
      }

      /* Mobile Specific Cover Page Fixes */
      body.is-mobile .leaf-face.cover-front:not(.cover-front-image) {
        padding: calc(20px * var(--page-scale)) calc(16px * var(--page-scale)) !important;
        background: ${theme.bgGradient} !important;
        color: #ffffff !important;
        border: 2px solid rgba(201, 168, 78, 0.45) !important;
        border-radius: 8px !important;
        box-shadow: inset 0 0 28px rgba(0, 0, 0, 0.5) !important;
      }

      body.is-mobile .leaf-face.cover-front.cover-front-image {
        padding: 0 !important;
        background: #111111 !important;
        border: none !important;
        border-radius: 8px !important;
        box-shadow: none !important;
        overflow: hidden !important;
      }

      body.is-mobile .leaf-face.cover-back-outer {
        padding: calc(20px * var(--page-scale)) calc(16px * var(--page-scale)) !important;
        background: ${theme.bgGradient} !important;
        color: #ffffff !important;
        border: 2px solid rgba(201, 168, 78, 0.4) !important;
        border-radius: 8px !important;
        box-shadow: inset 0 0 28px rgba(0, 0, 0, 0.5) !important;
      }

      body.is-mobile .cover-container {
        padding: calc(16px * var(--page-scale)) calc(14px * var(--page-scale));
        border: 1px solid rgba(201, 168, 78, 0.35);
      }

      body.is-mobile .cover-edition-tag {
        font-size: calc(9.5px * var(--page-scale));
        padding-bottom: calc(6px * var(--page-scale));
        letter-spacing: 1.8px;
      }

      body.is-mobile .cover-emblem-icon {
        width: calc(48px * var(--page-scale));
        height: calc(48px * var(--page-scale));
        margin: 0 auto calc(12px * var(--page-scale));
      }

      body.is-mobile .cover-main-title {
        font-size: calc(26px * var(--page-scale));
        line-height: 1.15;
        margin-bottom: calc(8px * var(--page-scale));
      }

      body.is-mobile .cover-sub-title {
        font-size: calc(12px * var(--page-scale));
        line-height: 1.4;
        margin: 0 auto calc(14px * var(--page-scale));
      }

      body.is-mobile .cover-open-action {
        font-size: calc(11px * var(--page-scale));
        padding: calc(6px * var(--page-scale)) calc(14px * var(--page-scale));
      }

      body.is-mobile .cover-footer-meta {
        font-size: calc(9px * var(--page-scale));
        padding-top: calc(6px * var(--page-scale));
      }

      /* Dynamic 3D Turn Lighting Shadow Overlay */
      .leaf-lighting-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        opacity: 0;
        transition: opacity var(--anim-speed) ease;
        z-index: 20;
      }

      .face-front .leaf-lighting-overlay {
        background: linear-gradient(
          to right,
          rgba(0, 0, 0, 0.28) 0%,
          rgba(0, 0, 0, 0) 60%
        );
      }

      .face-back .leaf-lighting-overlay {
        background: linear-gradient(
          to left,
          rgba(0, 0, 0, 0.28) 0%,
          rgba(0, 0, 0, 0) 60%
        );
      }

      .book-leaf.is-flipping .leaf-lighting-overlay {
        opacity: 1;
      }

      /* Inner Content Container - Clean wrapper that holds modular templates */
      .page-content-wrapper {
        position: relative;
        z-index: 2;
        height: 100%;
        width: 100%;
        padding: var(--page-pad-v) var(--page-pad-h);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        box-sizing: border-box;
        overflow: hidden !important;
        font-size: var(--body-size);
      }

      /* Typography & Editorial Elements */
      .page-hero-title {
        font-family: "Plus Jakarta Sans", sans-serif;
        font-size: var(--title-size);
        font-weight: 800;
        color: #0b241c;
        letter-spacing: -0.6px;
        line-height: 1.16;
        margin-top: var(--title-margin-t);
        margin-bottom: var(--title-margin-b);
      }

      .feature-list {
        display: flex;
        flex-direction: column;
        gap: var(--list-gap);
        margin: auto 0;
      }

      .feature-item {
        display: flex;
        align-items: flex-start;
        gap: var(--item-gap);
      }

      .feature-icon-box {
        width: var(--icon-box-size);
        height: var(--icon-box-size);
        flex-shrink: 0;
        color: var(--accent-green);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: calc(1.5px * var(--page-scale));
      }

      .feature-icon-box svg {
        width: var(--icon-svg-size);
        height: var(--icon-svg-size);
        stroke-width: 1.9;
      }

      .feature-text {
        font-size: var(--body-size);
        line-height: 1.46;
        color: #3b4e46;
      }

      .feature-text strong {
        color: #0c221a;
        font-weight: 700;
      }

      .page-footer-tag {
        font-size: var(--footer-size);
        font-weight: 600;
        color: #8da198;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid #edf2ef;
        padding-top: var(--footer-pad-t);
        margin-top: var(--footer-margin-t);
      }

      /* Luxury Cover Page Styles */
      .leaf-face.cover-front:not(.cover-front-image) {
        background: ${theme.bgGradient};
        color: #ffffff;
        border: 2px solid ${theme.borderColor || 'rgba(201, 168, 78, 0.4)'};
        box-shadow:
          inset 0 0 40px rgba(0, 0, 0, 0.4),
          inset 3px 0 8px rgba(255, 255, 255, 0.15);
        padding: calc(34px * var(--page-scale)) calc(30px * var(--page-scale));
      }

      .leaf-face.cover-front.cover-front-image {
        padding: 0 !important;
        background: #111111 !important;
        overflow: hidden !important;
      }

      .leaf-face.cover-back-outer {
        background: ${theme.bgGradient};
        color: #ffffff;
        border: 2px solid ${theme.borderColor || 'rgba(201, 168, 78, 0.35)'};
        box-shadow:
          inset 0 0 40px rgba(0, 0, 0, 0.45),
          inset -3px 0 8px rgba(255, 255, 255, 0.1);
        padding: calc(34px * var(--page-scale)) calc(30px * var(--page-scale));
      }

      .leaf-face.cover-inside {
        background: ${theme.pageBg || '#fdfefe'};
        background-image: linear-gradient(
          to right,
          rgba(0, 0, 0, 0.03) 0%,
          transparent 15%,
          transparent 100%
        );
      }

      .cover-container {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        border: 1px solid ${theme.borderColor || 'rgba(201, 168, 78, 0.35)'};
        border-radius: 4px;
        padding: calc(22px * var(--page-scale)) calc(20px * var(--page-scale));
        position: relative;
      }

      .cover-corner-ornament {
        position: absolute;
        width: calc(14px * var(--page-scale));
        height: calc(14px * var(--page-scale));
        border: 2px solid var(--gold-accent);
      }
      .cover-corner-ornament.tl {
        top: -1px;
        left: -1px;
        border-right: none;
        border-bottom: none;
      }
      .cover-corner-ornament.tr {
        top: -1px;
        right: -1px;
        border-left: none;
        border-bottom: none;
      }
      .cover-corner-ornament.bl {
        bottom: -1px;
        left: -1px;
        border-right: none;
        border-top: none;
      }
      .cover-corner-ornament.br {
        bottom: -1px;
        right: -1px;
        border-left: none;
        border-top: none;
      }

      .cover-edition-tag {
        font-size: calc(10px * var(--page-scale));
        font-weight: 700;
        letter-spacing: 2.2px;
        text-transform: uppercase;
        color: var(--gold-accent);
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid ${theme.borderColor || 'rgba(201, 168, 78, 0.25)'};
        padding-bottom: calc(8px * var(--page-scale));
      }

      .cover-main-badge {
        margin: auto 0;
        text-align: center;
      }

      .cover-emblem-icon {
        width: calc(56px * var(--page-scale));
        height: calc(56px * var(--page-scale));
        margin: 0 auto calc(14px * var(--page-scale));
        border: 2px solid var(--gold-accent);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--gold-accent);
        background: rgba(201, 168, 78, 0.12);
        box-shadow: 0 0 20px rgba(201, 168, 78, 0.2);
      }

      .cover-emblem-icon svg {
        width: calc(30px * var(--page-scale));
        height: calc(30px * var(--page-scale));
        stroke-width: 1.8;
      }

      .cover-main-title {
        font-size: calc(30px * var(--page-scale));
        font-weight: 800;
        letter-spacing: -0.5px;
        line-height: 1.12;
        color: #ffffff;
        margin-bottom: calc(10px * var(--page-scale));
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
      }

      .cover-sub-title {
        font-size: calc(13px * var(--page-scale));
        font-weight: 500;
        color: #c0ded2;
        line-height: 1.45;
        max-width: 90%;
        margin: 0 auto calc(18px * var(--page-scale));
      }

      .cover-open-action {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: linear-gradient(
          135deg,
          var(--gold-accent) 0%,
          #e0c478 100%
        );
        color: #0c2b20;
        font-size: calc(11.5px * var(--page-scale));
        font-weight: 700;
        letter-spacing: 0.5px;
        padding: calc(7px * var(--page-scale)) calc(16px * var(--page-scale));
        border-radius: 30px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        cursor: pointer;
        transition: transform 0.2s ease;
      }

      .cover-open-action:hover {
        transform: scale(1.05);
      }

      .cover-footer-meta {
        font-size: calc(9.5px * var(--page-scale));
        color: #8fb9a7;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid ${theme.borderColor || 'rgba(201, 168, 78, 0.25)'};
        padding-top: calc(8px * var(--page-scale));
      }

      /* Back Cover Blurb */
      .back-cover-blurb {
        font-size: calc(12.5px * var(--page-scale));
        line-height: 1.55;
        color: #c7e5d8;
        margin: auto 0;
        text-align: center;
        padding: 0 10px;
      }

      .back-cover-barcode {
        background: #ffffff;
        padding: calc(8px * var(--page-scale));
        border-radius: 4px;
        width: calc(130px * var(--page-scale));
        margin: 0 auto calc(12px * var(--page-scale));
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .barcode-lines {
        width: 100%;
        height: calc(26px * var(--page-scale));
        background: repeating-linear-gradient(
          to right,
          #000 0,
          #000 2px,
          #fff 2px,
          #fff 4px,
          #000 4px,
          #000 7px,
          #fff 7px,
          #fff 8px,
          #000 8px,
          #000 11px
        );
      }

      .barcode-number {
        font-size: calc(7px * var(--page-scale));
        color: #111;
        font-family: monospace;
        letter-spacing: 1px;
        margin-top: 3px;
      }

      /* Editorial & Specialized Template Classes */
      .drop-cap-letter {
        float: left;
        font-family: "Playfair Display", serif;
        font-size: calc(44px * var(--page-scale));
        line-height: 0.85;
        font-weight: 800;
        padding-right: calc(8px * var(--page-scale));
        padding-top: calc(4px * var(--page-scale));
        color: var(--accent-green);
      }

      .chapter-number-tag {
        font-family: "Playfair Display", serif;
        font-size: calc(36px * var(--page-scale));
        font-weight: 900;
        color: var(--accent-green);
        line-height: 1;
        margin-bottom: calc(4px * var(--page-scale));
      }

      .editorial-blockquote {
        border-left: 3px solid var(--accent-green);
        padding-left: calc(12px * var(--page-scale));
        margin: calc(10px * var(--page-scale)) 0;
        font-style: italic;
        font-size: calc(12.5px * var(--page-scale));
        line-height: 1.5;
        color: #2c443b;
      }

      .editorial-cite {
        display: block;
        font-size: calc(10px * var(--page-scale));
        font-style: normal;
        font-weight: 700;
        color: var(--accent-green);
        margin-top: calc(4px * var(--page-scale));
      }

      .quote-highlight-container {
        margin: auto 0;
        text-align: center;
        padding: calc(10px * var(--page-scale));
      }

      .quote-symbol-icon {
        width: calc(36px * var(--page-scale));
        height: calc(36px * var(--page-scale));
        margin: 0 auto calc(12px * var(--page-scale));
        color: var(--accent-green);
        opacity: 0.6;
      }

      .quote-highlight-text {
        font-family: "Playfair Display", serif;
        font-size: calc(16px * var(--page-scale));
        font-style: italic;
        line-height: 1.55;
        color: #17382d;
        margin-bottom: calc(12px * var(--page-scale));
      }

      .bento-grid-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: calc(8px * var(--page-scale));
        margin: auto 0;
      }

      .bento-grid-card {
        background: rgba(125, 125, 125, 0.05);
        border: 1px solid rgba(0, 0, 0, 0.06);
        border-radius: calc(6px * var(--page-scale));
        padding: calc(8px * var(--page-scale));
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .bento-card-tag {
        font-size: calc(8px * var(--page-scale));
        font-family: monospace;
        font-weight: 700;
        color: #6d847a;
      }

      .bento-card-title {
        font-size: calc(11px * var(--page-scale));
        font-weight: 700;
        color: #0c241b;
        margin-top: 2px;
      }

      .bento-card-desc {
        font-size: calc(9.5px * var(--page-scale));
        color: #4b6157;
        line-height: 1.35;
        margin-top: 4px;
      }

      .bento-card-metric {
        font-size: calc(11px * var(--page-scale));
        font-weight: 800;
        color: var(--accent-green);
        font-family: monospace;
        margin-top: 6px;
      }

      .author-bio-container {
        margin: auto 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .author-avatar-img {
        width: calc(68px * var(--page-scale));
        height: calc(68px * var(--page-scale));
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid var(--accent-green);
        margin-bottom: calc(10px * var(--page-scale));
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      }

      .author-name-title {
        font-family: "Playfair Display", serif;
        font-size: calc(16px * var(--page-scale));
        font-weight: 700;
        color: #0b241c;
      }

      .author-bio-text {
        font-size: calc(11.5px * var(--page-scale));
        line-height: 1.5;
        color: #3b4e46;
        margin: calc(6px * var(--page-scale)) 0;
        max-width: 90%;
      }

      .image-showcase-img {
        width: 100%;
        height: calc(140px * var(--page-scale));
        object-fit: cover;
        border-radius: calc(6px * var(--page-scale));
        border: 1px solid rgba(0,0,0,0.08);
      }

      .image-showcase-caption {
        font-size: calc(9.5px * var(--page-scale));
        font-style: italic;
        color: #647b71;
        text-align: center;
        margin-top: calc(4px * var(--page-scale));
      }

      @media (max-width: 768px) {
        #flipbook-wrapper {
          padding: 8px;
        }
        .top-floating-controls {
          top: 12px;
          right: 12px;
          gap: 8px;
        }
        .float-icon-btn {
          width: 38px;
          height: 38px;
        }
        .float-icon-btn svg {
          width: 19px;
          height: 19px;
        }
        .corner-nav-btn {
          bottom: 12px;
          width: 44px;
          height: 44px;
        }
        .corner-nav-btn svg {
          width: 24px;
          height: 24px;
        }
        .corner-nav-btn.btn-prev-corner {
          left: 12px;
        }
        .corner-nav-btn.btn-next-corner {
          right: 12px;
        }
      }
    </style>
  </head>
  <body>
    <div id="flipbook-wrapper">
      <!-- Top-Right Floating Controls (Download, Fullscreen, Sound) -->
      <div class="top-floating-controls" id="top-controls">
        <button
          class="float-icon-btn"
          id="btn-download"
          title="Print / Download"
          onclick="triggerDownload()"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"
            ></path>
            <polyline points="8 14 12 18 16 14"></polyline>
            <line x1="12" y1="10" x2="12" y2="18"></line>
          </svg>
        </button>

        <button
          class="float-icon-btn"
          id="btn-fullscreen"
          title="Toggle Fullscreen"
          onclick="toggleFullscreen()"
        >
          <svg
            id="icon-fullscreen"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
            ></path>
          </svg>
        </button>

        <button
          class="float-icon-btn"
          id="btn-sound"
          title="Toggle Sound"
          onclick="toggleSound()"
        >
          <svg
            id="icon-sound"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
          </svg>
        </button>
      </div>

      <!-- Center 3D Book Stage -->
      <div class="book-stage" id="book-stage">
        <div class="flipbook-container" id="book-container">
          <div class="book-spine-shadow"></div>
        </div>
      </div>

      <!-- Bottom Navigation Curved Arrows & Center Page No. Input Box -->
      <button
        class="corner-nav-btn btn-prev-corner"
        id="btn-prev-corner"
        title="Previous Page (Left Arrow)"
        onclick="flipPrev()"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="9 14 4 9 9 4"></polyline>
          <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
        </svg>
      </button>

      <div
        id="page-jump-pill"
        title="Type page number and press Enter to jump"
        style="position:absolute;bottom:22px;left:50%;transform:translateX(-50%);z-index:1000;background:rgba(255,255,255,0.88);backdrop-filter:blur(8px);border:1px solid rgba(14,107,78,0.16);padding:5px 12px;border-radius:9999px;display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:#334155;box-shadow:0 4px 12px rgba(10,32,23,0.08);"
      >
        <span style="color:#64748b;font-size:11px;">Page</span>
        <input
          id="page-jump-input"
          type="number"
          min="1"
          value="1"
          onkeydown="handlePageJumpKey(event)"
          onblur="handlePageJumpBlur(this)"
          style="width:44px;padding:2px 4px;text-align:center;font-family:monospace;font-weight:700;font-size:12px;color:#0f172a;background:#f1f5f9;border:1px solid #cbd5e1;border-radius:6px;outline:none;-moz-appearance:textfield;"
        />
        <span id="page-jump-total" style="color:#64748b;font-size:11px;font-family:monospace;">/ 1</span>
      </div>

      <button
        class="corner-nav-btn btn-next-corner"
        id="btn-next-corner"
        title="Next Page (Right Arrow)"
        onclick="flipNext()"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="15 14 20 9 15 4"></polyline>
          <path d="M4 20v-7a4 4 0 0 1 4-4h12"></path>
        </svg>
      </button>

      ${
        !isPro
          ? `<!-- Free Starter Watermark Badge (Pro users get 100% white-label) -->
      <a
        href="https://tabrej6.gumroad.com/l/3d-flipbook-pro"
        target="_blank"
        rel="noopener noreferrer"
        id="badge-watermark"
        style="position:fixed;top:20px;left:24px;z-index:9999;background:rgba(15,23,42,0.88);backdrop-filter:blur(8px);border:1px solid rgba(16,185,129,0.35);padding:6px 14px;border-radius:9999px;display:flex;align-items:center;gap:6px;color:#ffffff;text-decoration:none;font-size:11px;font-family:system-ui,-apple-system,sans-serif;font-weight:700;box-shadow:0 4px 14px rgba(0,0,0,0.3);transition:transform 0.2s;"
        onmouseover="this.style.transform='scale(1.04)'"
        onmouseout="this.style.transform='scale(1)'"
        title="Created with FlipApp 3D — Get Lifetime Pro"
      >
        <span style="color:#fbbf24;font-size:13px;line-height:1;">⚡</span>
        <span>Created with FlipApp 3D</span>
        <span style="color:#34d399;font-size:10px;padding-left:4px;border-left:1px solid rgba(255,255,255,0.2);">Get Pro</span>
      </a>`
          : book.customBrandLogo || book.customBrandName
          ? `<!-- Pro Custom Brand Logo / Link -->
      <a
        href="${(book.customBrandUrl || '#').replace(/"/g, '&quot;')}"
        ${book.customBrandUrl ? 'target="_blank" rel="noopener noreferrer"' : ''}
        id="badge-custom-brand"
        style="position:fixed;top:20px;left:24px;z-index:9999;background:rgba(255,255,255,0.92);backdrop-filter:blur(8px);border:1px solid rgba(15,23,42,0.12);padding:5px 12px;border-radius:12px;display:flex;align-items:center;gap:8px;color:#0f172a;text-decoration:none;font-size:12px;font-family:system-ui,-apple-system,sans-serif;font-weight:700;box-shadow:0 4px 14px rgba(0,0,0,0.12);transition:transform 0.2s;"
        onmouseover="this.style.transform='scale(1.03)'"
        onmouseout="this.style.transform='scale(1)'"
      >
        ${
          book.customBrandLogo
            ? `<img src="${book.customBrandLogo.replace(/"/g, '&quot;')}" alt="Brand" style="height:22px;width:auto;max-width:90px;object-fit:contain;border-radius:4px;display:block;" />`
            : ''
        }
        ${
          book.customBrandName
            ? `<span>${book.customBrandName.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>`
            : ''
        }
      </a>`
          : ''
      }
    </div>

    <script>
      ${INLINE_PAGE_FLIP_ENGINE}
      (function () {
        var soundEnabled = ${book.soundEnabled !== false};
        var initialTargetPage = ${initialPage};
        var hasInitializedPage = false;
        var currentPageIndex = 0;
        var totalPagesCount = 0;
        var isAnimating = false;
        var audioCtx = null;
        var pageFlipInstance = null;
        var currentPageW = 400;
        var currentPageH = 566;
        var lastBuiltPageW = 0;
        var lastBuiltPageH = 0;
        var lastBuiltMobile = null;

        var bookProject = ${bookJson};

        // Procedural Web Audio Sound Synthesizer
        function playPageTurnSound() {
          if (!soundEnabled) return;
          try {
            if (!audioCtx) {
              var AudioContextClass =
                window.AudioContext || window.webkitAudioContext;
              if (AudioContextClass) audioCtx = new AudioContextClass();
            }
            if (!audioCtx) return;
            if (audioCtx.state === "suspended") audioCtx.resume();

            var duration = 0.15;
            var sampleRate = audioCtx.sampleRate;
            var bufferSize = Math.floor(sampleRate * duration);
            var buffer = audioCtx.createBuffer(1, bufferSize, sampleRate);
            var data = buffer.getChannelData(0);

            for (var i = 0; i < bufferSize; i++) {
              var progress = i / bufferSize;
              var envelope =
                Math.sin(progress * Math.PI) * Math.exp(-progress * 3.2);
              data[i] = (Math.random() * 2 - 1) * envelope * 0.19;
            }

            var noiseSource = audioCtx.createBufferSource();
            noiseSource.buffer = buffer;

            var biquad = audioCtx.createBiquadFilter();
            biquad.type = "bandpass";
            biquad.frequency.setValueAtTime(1200, audioCtx.currentTime);
            biquad.frequency.exponentialRampToValueAtTime(
              580,
              audioCtx.currentTime + duration
            );
            biquad.Q.value = 1.3;

            var gain = audioCtx.createGain();
            gain.gain.setValueAtTime(0.38, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(
              0.01,
              audioCtx.currentTime + duration
            );

            noiseSource.connect(biquad);
            biquad.connect(gain);
            gain.connect(audioCtx.destination);

            noiseSource.start();
          } catch (err) {}
        }

        // SVG Icon Provider
        function getIconSVG(name) {
          switch (name) {
            case "grid":
              return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="7" height="7" x="3" y="3" rx="1.5"></rect><rect width="7" height="7" x="14" y="3" rx="1.5"></rect><rect width="7" height="7" x="14" y="14" rx="1.5"></rect><rect width="7" height="7" x="3" y="14" rx="1.5"></rect></svg>';
            case "link":
              return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>';
            case "eye":
              return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
            case "book":
              return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path><path d="M6 6h10M6 10h10"></path></svg>';
            case "edit":
              return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>';
            case "play":
              return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>';
            case "lock":
              return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>';
            case "shield":
              return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg>';
            case "settings":
              return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>';
            case "share":
              return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>';
            case "code":
              return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>';
            case "cloud":
              return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path></svg>';
            case "chart":
              return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>';
            case "user":
              return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="8" r="5"></circle><path d="M20 21a8 8 0 0 0-16 0"></path></svg>';
            case "check":
              return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            case "star":
              return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';
            case "sparkle":
              return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"></path></svg>';
            default:
              return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';
          }
        }

        // Render Page Faces
        function buildFaceHTML(faceData, sideClass, pageIndex) {
          var rawHtml = buildFaceRawHTML(faceData, sideClass, pageIndex);
          if (
            !faceData ||
            faceData.template === "cover-front" ||
            faceData.template === "cover-back"
          ) {
            return rawHtml;
          }
          var isLeftPage = (pageIndex || 1) % 2 === 0;
          var circleOverlay = isLeftPage
            ? "<div style='position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:5;'><div style='position:absolute;width:56%;aspect-ratio:1/1;top:-16%;right:10%;border-radius:50%;border:1px solid rgba(15,23,42,0.25);pointer-events:none;'></div></div>"
            : "<div style='position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:5;'><div style='position:absolute;width:58%;aspect-ratio:1/1;bottom:-18%;right:-12%;border-radius:50%;border:1px solid rgba(15,23,42,0.25);pointer-events:none;'></div></div>";
          return rawHtml.replace(
            "<div class='page-content-wrapper'",
            circleOverlay + "<div class='page-content-wrapper'"
          );
        }

        function buildFaceRawHTML(faceData, sideClass, pageIndex) {
          if (!faceData) {
            return (
              "<div class='leaf-face " +
              sideClass +
              "'><div class='page-content-wrapper'></div></div>"
            );
          }

          // Render Block-based pages for exported standalone HTML
          function renderBlocksToHTML(blocks, sideClass, pIndex, hTag) {
            var bHtml = "<div class='leaf-face " + sideClass + "'><div class='page-content-wrapper'>";
            bHtml += "<div class='page-header-tag' style='display:flex;justify-content:space-between;border-bottom:1px solid #edf2ef;padding-bottom:calc(6px*var(--page-scale));font-size:calc(9px*var(--page-scale));font-weight:700;letter-spacing:1.5px;color:var(--accent-green);text-transform:uppercase;'><span>" + (hTag || bookProject.title) + "</span><span>Page " + (pIndex !== undefined ? pIndex : "") + "</span></div>";
            bHtml += "<div style='margin:auto 0;display:flex;flex-direction:column;gap:calc(9px*var(--page-scale));'>";

            blocks.forEach(function(b) {
              if (b.type === 'chapter-header') {
                bHtml += "<div style='text-align:" + (b.align || 'center') + ";border-bottom:2px solid var(--accent-green);padding-bottom:calc(6px*var(--page-scale));margin-bottom:calc(4px*var(--page-scale));'>";
                if (b.chapterNumber) bHtml += "<div style='font-size:calc(10px*var(--page-scale));font-weight:800;letter-spacing:2px;color:var(--accent-green);text-transform:uppercase;margin-bottom:2px;'>" + b.chapterNumber + "</div>";
                if (b.title) bHtml += "<h2 style='font-size:calc(22px*var(--page-scale));font-weight:800;color:#0b241c;letter-spacing:-0.5px;line-height:1.15;margin:0 0 2px 0;'>" + b.title + "</h2>";
                if (b.tag) bHtml += "<span style='font-size:calc(9.5px*var(--page-scale));font-weight:700;letter-spacing:1.5px;color:#799185;text-transform:uppercase;'>" + b.tag + "</span>";
                bHtml += "</div>";
              } else if (b.type === 'heading-1') {
                bHtml += "<h1 style='font-size:calc(24px*var(--page-scale));font-weight:800;color:#0b241c;line-height:1.15;letter-spacing:-0.5px;margin:0;text-align:" + (b.align || 'left') + ";'>" + (b.title || '') + "</h1>";
              } else if (b.type === 'heading-2') {
                bHtml += "<h2 style='font-size:calc(18px*var(--page-scale));font-weight:800;color:#0b241c;line-height:1.2;margin:0;text-align:" + (b.align || 'left') + ";'>" + (b.title || '') + "</h2>";
              } else if (b.type === 'heading-3') {
                bHtml += "<h3 style='font-size:calc(14px*var(--page-scale));font-weight:700;color:#183b2e;margin:0;text-align:" + (b.align || 'left') + ";'>" + (b.title || '') + "</h3>";
              } else if (b.type === 'subtitle') {
                bHtml += "<p style='font-size:calc(12px*var(--page-scale));font-style:italic;color:#5a6e66;margin:0;line-height:1.45;text-align:" + (b.align || 'left') + ";'>" + (b.subtitle || '') + "</p>";
              } else if (b.type === 'paragraph') {
                bHtml += "<p style='font-size:calc(11.5px*var(--page-scale));line-height:1.6;color:#33443e;margin:0;text-align:" + (b.align || 'left') + ";'>" + (b.paragraph1 || '') + "</p>";
              } else if (b.type === 'dropcap-paragraph') {
                var pText = b.paragraph1 || '';
                if (pText.length > 1) {
                  bHtml += "<p style='font-size:calc(11.5px*var(--page-scale));line-height:1.6;color:#33443e;margin:0;'><span class='drop-cap-letter'>" + pText[0] + "</span>" + pText.slice(1) + "</p>";
                } else {
                  bHtml += "<p style='font-size:calc(11.5px*var(--page-scale));line-height:1.6;color:#33443e;margin:0;'>" + pText + "</p>";
                }
              } else if (b.type === 'two-column-text') {
                bHtml += "<div style='display:grid;grid-template-columns:1fr 1fr;gap:calc(12px*var(--page-scale));font-size:calc(10.5px*var(--page-scale));line-height:1.55;color:#3b4e46;'>";
                bHtml += "<div>" + (b.paragraph1 || '') + "</div><div>" + (b.paragraph2 || '') + "</div></div>";
              } else if (b.type === 'quote-block') {
                bHtml += "<blockquote class='editorial-blockquote' style='margin:0;'>“" + (b.quoteText || '') + "”";
                if (b.quoteAuthor) {
                  bHtml += "<cite class='editorial-cite'>— " + b.quoteAuthor + (b.quoteRole ? ", " + b.quoteRole : "") + "</cite>";
                }
                bHtml += "</blockquote>";
              } else if (b.type === 'grid-cards') {
                bHtml += "<div>";
                if (b.title) bHtml += "<div style='font-size:calc(13px*var(--page-scale));font-weight:800;color:#0b241c;margin-bottom:calc(6px*var(--page-scale));'>" + b.title + "</div>";
                bHtml += "<div style='display:grid;grid-template-columns:repeat(2,1fr);gap:calc(7px*var(--page-scale));'>";
                (b.items || []).forEach(function(card) {
                  bHtml += "<div style='background:#f7faf8;border:1px solid #e1ece5;border-radius:6px;padding:calc(7px*var(--page-scale));'>";
                  if (card.tag) bHtml += "<div style='font-size:calc(8.5px*var(--page-scale));font-weight:800;color:var(--accent-green);letter-spacing:1px;text-transform:uppercase;'>" + card.tag + "</div>";
                  bHtml += "<div style='font-size:calc(11px*var(--page-scale));font-weight:700;color:#0c2b20;'>" + card.title + "</div>";
                  if (card.description) bHtml += "<div style='font-size:calc(9.5px*var(--page-scale));color:#556b61;line-height:1.35;margin-top:2px;'>" + card.description + "</div>";
                  if (card.highlight) bHtml += "<div style='font-size:calc(10.5px*var(--page-scale));font-weight:800;color:var(--accent-green);margin-top:3px;'>" + card.highlight + "</div>";
                  bHtml += "</div>";
                });
                bHtml += "</div></div>";
              } else if (b.type === 'feature-cards') {
                bHtml += "<div>";
                if (b.title) bHtml += "<div style='font-size:calc(13px*var(--page-scale));font-weight:800;color:#0b241c;margin-bottom:calc(6px*var(--page-scale));'>" + b.title + "</div>";
                bHtml += "<div style='display:flex;flex-direction:column;gap:calc(6px*var(--page-scale));'>";
                (b.items || []).forEach(function(item) {
                  bHtml += "<div style='display:flex;align-items:flex-start;gap:calc(8px*var(--page-scale));padding:calc(6px*var(--page-scale)) calc(8px*var(--page-scale));border-radius:6px;background:#f9fbf9;border:1px solid #e4ece7;'>";
                  bHtml += "<div style='width:6px;height:6px;border-radius:50%;background:var(--accent-green);margin-top:5px;'></div>";
                  bHtml += "<div style='flex:1;'><div style='font-size:calc(11.5px*var(--page-scale));font-weight:700;color:#0c2b20;'>" + item.title + "</div>";
                  if (item.description) bHtml += "<div style='font-size:calc(10px*var(--page-scale));color:#556b61;line-height:1.35;'>" + item.description + "</div>";
                  bHtml += "</div></div>";
                });
                bHtml += "</div></div>";
              } else if (b.type === 'checklist-block') {
                bHtml += "<div style='display:flex;flex-direction:column;gap:calc(5px*var(--page-scale));'>";
                (b.items || []).forEach(function(item) {
                  bHtml += "<div style='display:flex;align-items:center;gap:calc(8px*var(--page-scale));font-size:calc(11px*var(--page-scale));color:#253c33;'>";
                  bHtml += "<span style='color:var(--accent-green);font-weight:bold;'>✓</span><span>" + (item.title || '') + "</span></div>";
                });
                bHtml += "</div>";
              } else if (b.type === 'numbered-steps') {
                bHtml += "<div style='display:flex;flex-direction:column;gap:calc(6px*var(--page-scale));'>";
                (b.items || []).forEach(function(step, sIdx) {
                  bHtml += "<div style='display:flex;align-items:flex-start;gap:calc(8px*var(--page-scale));padding:calc(6px*var(--page-scale));border-radius:6px;background:#f8faf8;border:1px solid #e2ebe6;'>";
                  bHtml += "<div style='width:calc(18px*var(--page-scale));height:calc(18px*var(--page-scale));border-radius:50%;background:var(--accent-green);color:#fff;font-size:calc(9.5px*var(--page-scale));font-weight:bold;display:flex;align-items:center;justify-content:center;'>" + (sIdx + 1) + "</div>";
                  bHtml += "<div style='flex:1;'><div style='font-size:calc(11px*var(--page-scale));font-weight:700;color:#0c2b20;'>" + step.title + "</div>";
                  if (step.description) bHtml += "<div style='font-size:calc(9.5px*var(--page-scale));color:#5a6e66;'>" + step.description + "</div>";
                  bHtml += "</div></div>";
                });
                bHtml += "</div>";
              } else if (b.type === 'table-specs') {
                bHtml += "<div>";
                if (b.title) bHtml += "<div style='font-size:calc(12px*var(--page-scale));font-weight:800;color:#0b241c;margin-bottom:calc(4px*var(--page-scale));'>" + b.title + "</div>";
                bHtml += "<div style='border:1px solid #e1ece5;border-radius:6px;overflow:hidden;'>";
                (b.items || []).forEach(function(row, rIdx) {
                  bHtml += "<div style='display:flex;justify-content:space-between;padding:calc(5px*var(--page-scale)) calc(8px*var(--page-scale));font-size:calc(10.5px*var(--page-scale));background:" + (rIdx % 2 === 0 ? '#ffffff' : '#f8faf9') + ";border-bottom:1px solid #eef3f0;'>";
                  bHtml += "<span style='font-weight:700;color:#17382d;'>" + row.title + "</span><span style='color:#556b61;'>" + row.description + "</span></div>";
                });
                bHtml += "</div></div>";
              } else if (b.type === 'image-block') {
                if (b.imageUrl) {
                  var align = b.imageAlign || 'center';
                  var size = b.imageSize || 'full';
                  var widthVal = size === 'small' ? '33%' : size === 'medium' ? '50%' : size === 'large' ? '75%' : '100%';
                  var marginStyle = align === 'left' ? 'margin:0 auto 0 0;' : align === 'right' ? 'margin:0 0 0 auto;' : 'margin:0 auto;';
                  var floatStyle = b.imageFloat === 'left' ? 'float:left;margin-right:12px;margin-bottom:8px;max-width:50%;' : b.imageFloat === 'right' ? 'float:right;margin-left:12px;margin-bottom:8px;max-width:50%;' : '';
                  var fitMode = b.imageFit || 'contain';
                  var heightStyle = b.imageHeight && b.imageHeight !== 'auto' ? 'height:' + b.imageHeight + ';' : 'height:auto;max-height:calc(260px*var(--page-scale));';

                  bHtml += "<div style='width:100%;box-sizing:border-box;margin:calc(4px*var(--page-scale)) 0;" + floatStyle + "'>";
                  bHtml += "<div style='width:" + widthVal + ";" + marginStyle + "border-radius:6px;overflow:hidden;border:1px solid #d4dfd9;'>";
                  bHtml += "<img src='" + b.imageUrl + "' alt='Exhibit' style='width:100%;" + heightStyle + "object-fit:" + fitMode + ";display:block;' />";
                  if (b.imageCaption) bHtml += "<div style='font-size:calc(9px*var(--page-scale));font-style:italic;color:#6d8279;padding:2px 4px;text-align:center;background:rgba(0,0,0,0.02);'>" + b.imageCaption + "</div>";
                  bHtml += "</div></div>";
                }
              } else if (b.type === 'image-full-fit') {
                if (b.imageUrl) {
                  var vAlign = b.imageVerticalAlign || 'middle';
                  var hAlign = b.imageAlign || 'center';
                  var size = b.imageSize || 'full';
                  var widthVal = size === 'small' ? '45%' : size === 'medium' ? '65%' : size === 'large' ? '85%' : '98%';
                  var vJustify = vAlign === 'top' ? 'flex-start' : vAlign === 'bottom' ? 'flex-end' : 'center';
                  var hJustify = hAlign === 'left' ? 'flex-start' : hAlign === 'right' ? 'flex-end' : 'center';
                  var fitMode = b.imageFit || 'contain';

                  bHtml += "<div style='width:100%;height:100%;display:flex;flex-direction:column;align-items:" + hJustify + ";justify-content:" + vJustify + ";padding:1%;box-sizing:border-box;'>";
                  bHtml += "<div style='position:relative;display:flex;align-items:center;justify-content:center;width:" + widthVal + ";max-height:98%;border-radius:8px;overflow:hidden;border:1px solid rgba(0,0,0,0.1);box-shadow:0 2px 8px rgba(0,0,0,0.06);'>";
                  bHtml += "<img src='" + b.imageUrl + "' alt='Full Frame' style='max-width:100%;max-height:98%;width:auto;height:auto;object-fit:" + fitMode + ";display:block;border-radius:8px;' />";
                  bHtml += "</div>";
                  if (b.imageCaption) bHtml += "<div style='font-size:calc(9px*var(--page-scale));font-style:italic;color:#6d8279;margin-top:3px;text-align:center;'>" + b.imageCaption + "</div>";
                  bHtml += "</div>";
                }
              } else if (b.type === 'image-text-split') {
                bHtml += "<div style='display:grid;grid-template-columns:1fr 1.2fr;gap:calc(10px*var(--page-scale));align-items:center;'>";
                if (b.imageUrl) {
                  bHtml += "<div><img src='" + b.imageUrl + "' alt='Visual' style='width:100%;height:auto;max-height:calc(130px*var(--page-scale));object-fit:contain;border-radius:6px;border:1px solid #d4dfd9;display:block;' /></div>";
                }
                bHtml += "<div>";
                if (b.title) bHtml += "<div style='font-size:calc(12px*var(--page-scale));font-weight:800;color:#0b241c;margin-bottom:2px;'>" + b.title + "</div>";
                if (b.paragraph1) bHtml += "<p style='font-size:calc(10px*var(--page-scale));line-height:1.45;color:#3f544c;margin:0;'>" + b.paragraph1 + "</p>";
                bHtml += "</div></div>";
              } else if (b.type === 'author-card') {
                bHtml += "<div style='display:flex;align-items:center;gap:calc(10px*var(--page-scale));padding:calc(8px*var(--page-scale));border-radius:8px;background:#f6f9f7;border:1px solid #e0eae4;'>";
                if (b.authorAvatarUrl) {
                  bHtml += "<img src='" + b.authorAvatarUrl + "' alt='Avatar' style='width:calc(42px*var(--page-scale));height:calc(42px*var(--page-scale));border-radius:50%;object-fit:cover;border:2px solid var(--accent-green);' />";
                }
                bHtml += "<div style='flex:1;'><div style='font-size:calc(12px*var(--page-scale));font-weight:800;color:#0b241c;'>" + (b.authorName || '') + "</div>";
                if (b.authorBio) bHtml += "<div style='font-size:calc(9.5px*var(--page-scale));color:#556b61;line-height:1.35;'>" + b.authorBio + "</div>";
                if (b.authorSocials) bHtml += "<div style='font-size:calc(8.5px*var(--page-scale));font-weight:700;color:var(--accent-green);margin-top:2px;'>" + b.authorSocials + "</div>";
                bHtml += "</div></div>";
              } else if (b.type === 'callout-box') {
                bHtml += "<div style='padding:calc(8px*var(--page-scale)) calc(10px*var(--page-scale));border-radius:6px;background:rgba(18,74,54,0.06);border-left:3px solid var(--accent-green);'>";
                if (b.title) bHtml += "<div style='font-size:calc(10px*var(--page-scale));font-weight:800;color:var(--accent-green);letter-spacing:1px;text-transform:uppercase;margin-bottom:2px;'>" + b.title + "</div>";
                if (b.paragraph1) bHtml += "<div style='font-size:calc(10.5px*var(--page-scale));color:#284237;line-height:1.45;'>" + b.paragraph1 + "</div>";
                bHtml += "</div>";
              } else if (b.type === 'button-cta') {
                bHtml += "<div style='text-align:" + (b.align || 'center') + ";padding:calc(4px*var(--page-scale)) 0;'><a href='" + (b.buttonUrl || '#') + "' style='display:inline-block;padding:calc(6px*var(--page-scale)) calc(14px*var(--page-scale));border-radius:30px;background:var(--accent-green);color:#ffffff;font-size:calc(10.5px*var(--page-scale));font-weight:700;text-decoration:none;box-shadow:0 2px 6px rgba(0,0,0,0.15);'>" + (b.buttonText || 'Learn More') + " →</a></div>";
              } else if (b.type === 'divider-ornament') {
                bHtml += "<div style='display:flex;align-items:center;justify-content:center;gap:8px;opacity:0.4;margin:calc(4px*var(--page-scale)) 0;'><div style='height:1px;width:30px;background:var(--accent-green);'></div><span style='font-size:10px;color:var(--accent-green);'>✦</span><div style='height:1px;width:30px;background:var(--accent-green);'></div></div>";
              } else if (b.type === 'barcode-imprint') {
                bHtml += "<div style='text-align:center;padding:calc(6px*var(--page-scale));background:#ffffff;border:1px solid #e1ece5;border-radius:6px;margin:0 auto;width:calc(130px*var(--page-scale));'>";
                bHtml += "<div class='barcode-lines' style='width:100%;height:calc(22px*var(--page-scale));background:repeating-linear-gradient(to right,#000 0,#000 2px,#fff 2px,#fff 4px);'></div>";
                bHtml += "<div style='font-size:calc(8.5px*var(--page-scale));font-family:monospace;margin-top:2px;'>" + (b.isbn || 'ISBN 978-0-123456-78-9') + "</div>";
                bHtml += "</div>";
              }
            });

            bHtml += "</div>";
            bHtml += "<div class='page-footer-tag'><span>" + (bookProject.author || "Lumina Press") + "</span><span>Page " + (pIndex !== undefined ? pIndex : "") + "</span></div>";
            bHtml += "</div><div class='leaf-lighting-overlay'></div></div>";
            return bHtml;
          }

          // 1. Front Cover Page
          if (faceData.template === "cover-front") {
            if (faceData.isPdfPage && faceData.imageUrl) {
              return (
                "<div class='leaf-face " +
                sideClass +
                " cover-front cover-front-image is-cover' style='padding:0;background:#ffffff;'>" +
                "<div class='page-content-wrapper' style='padding:0;margin:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#ffffff;'>" +
                "<img src='" +
                faceData.imageUrl +
                "' alt='" +
                (faceData.title || bookProject.title) +
                "' style='width:100%;height:100%;object-fit:contain;display:block;' />" +
                "</div>" +
                "<div class='leaf-lighting-overlay'></div>" +
                "</div>"
              );
            }

            var coverImg = faceData.coverImageUrl || faceData.imageUrl || bookProject.coverImageUrl || "";
            if (coverImg) {
              return (
                "<div class='leaf-face " +
                sideClass +
                " cover-front cover-front-image is-cover' style='padding:0;overflow:hidden;position:relative;background:#111;cursor:pointer;'>" +
                "<img src='" +
                coverImg +
                "' alt='" +
                (faceData.title || bookProject.title) +
                "' style='width:100%;height:100%;object-fit:cover;display:block;position:absolute;top:0;left:0;' onerror='this.style.opacity=0;' />" +
                "<div style='position:absolute;inset:0;background:linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.65) 100%);display:flex;flex-direction:column;justify-content:space-between;padding:calc(24px*var(--page-scale));box-sizing:border-box;pointer-events:none;'>" +
                "<div style='display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.25);padding-bottom:calc(8px*var(--page-scale));'>" +
                "<span style='font-size:calc(10px*var(--page-scale));font-weight:700;letter-spacing:2px;color:rgba(255,255,255,0.9);text-transform:uppercase;'>" +
                (faceData.headerTag || "COLLECTOR'S EDITION") +
                "</span>" +
                "<span style='font-size:calc(9px*var(--page-scale));color:rgba(255,255,255,0.7);letter-spacing:1px;'>" +
                (bookProject.year || "2026") +
                "</span>" +
                "</div>" +
                "<div style='text-align:center;margin:auto 0;'>" +
                "<h1 style='font-size:calc(24px*var(--page-scale));font-family:Cinzel,serif;font-weight:700;color:#ffffff;text-shadow:0 4px 16px rgba(0,0,0,0.7);line-height:1.15;margin-bottom:calc(8px*var(--page-scale));text-transform:uppercase;'>" +
                (faceData.title || bookProject.title) +
                "</h1>" +
                "<p style='font-size:calc(13px*var(--page-scale));color:rgba(255,255,255,0.85);font-style:italic;font-family:Playfair Display,serif;margin-bottom:calc(16px*var(--page-scale));'>" +
                (faceData.subtitle || bookProject.subtitle) +
                "</p>" +
                "<div style='display:inline-flex;align-items:center;gap:6px;padding:calc(6px*var(--page-scale)) calc(16px*var(--page-scale));background:rgba(255,255,255,0.2);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.4);border-radius:9999px;color:#fff;font-size:calc(11px*var(--page-scale));font-weight:600;letter-spacing:1px;text-transform:uppercase;'>" +
                "<span>Tap or Click to Open</span>" +
                "<svg style='width:14px;height:14px;' viewBox='0 0 24 24' fill='none' stroke='currentColor'><polyline points='9 18 15 12 9 6'></polyline></svg>" +
                "</div>" +
                "</div>" +
                "<div style='display:flex;justify-content:space-between;align-items:center;border-top:1px solid rgba(255,255,255,0.25);padding-top:calc(8px*var(--page-scale));color:rgba(255,255,255,0.8);font-size:calc(10px*var(--page-scale));font-family:monospace;letter-spacing:1px;'>" +
                "<span>" +
                (faceData.footerNote || bookProject.author) +
                "</span>" +
                "<span>" +
                (bookProject.edition || "Volume I") +
                "</span>" +
                "</div>" +
                "</div>" +
                "<div class='leaf-lighting-overlay'></div>" +
                "</div>"
              );
            }

            return (
              "<div class='leaf-face " +
              sideClass +
              " cover-front is-cover'>" +
              "<div class='cover-container'>" +
              "<div class='cover-corner-ornament tl'></div>" +
              "<div class='cover-corner-ornament tr'></div>" +
              "<div class='cover-corner-ornament bl'></div>" +
              "<div class='cover-corner-ornament br'></div>" +
              "<div class='cover-edition-tag'>" +
              "<span>" +
              (faceData.headerTag || "COLLECTOR'S EDITION") +
              "</span>" +
              "<span>" + (bookProject.year || "2026 Release") + "</span>" +
              "</div>" +
              "<div class='cover-main-badge'>" +
              "<div class='cover-emblem-icon'>" +
              getIconSVG("book") +
              "</div>" +
              "<h1 class='cover-main-title'>" +
              (faceData.title || bookProject.title) +
              "</h1>" +
              "<p class='cover-sub-title'>" +
              (faceData.subtitle || bookProject.subtitle) +
              "</p>" +
              "<div class='cover-open-action'>" +
              "<span>Tap or Click to Open</span>" +
              "<svg style='width:16px;height:16px;' viewBox='0 0 24 24' fill='none' stroke='currentColor'><polyline points='9 18 15 12 9 6'></polyline></svg>" +
              "</div>" +
              "</div>" +
              "<div class='cover-footer-meta'>" +
              "<span>" +
              (faceData.footerNote || bookProject.author) +
              "</span>" +
              "<span>" + (bookProject.edition || "Volume I") + "</span>" +
              "</div>" +
              "</div>" +
              "<div class='leaf-lighting-overlay'></div>" +
              "</div>"
            );
          }

          // 2. Back Cover (Outer)
          if (faceData.template === "cover-back") {
            if (faceData.isPdfPage && faceData.imageUrl) {
              return (
                "<div class='leaf-face " +
                sideClass +
                " cover-back-outer is-cover' style='padding:0;background:#ffffff;'>" +
                "<div class='page-content-wrapper' style='padding:0;margin:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#ffffff;'>" +
                "<img src='" +
                faceData.imageUrl +
                "' alt='" +
                (faceData.title || "Back Cover") +
                "' style='width:100%;height:100%;object-fit:contain;display:block;' />" +
                "</div>" +
                "<div class='leaf-lighting-overlay'></div>" +
                "</div>"
              );
            }

            return (
              "<div class='leaf-face " +
              sideClass +
              " cover-back-outer is-cover'>" +
              "<div class='cover-container'>" +
              "<div class='cover-corner-ornament tl'></div>" +
              "<div class='cover-corner-ornament tr'></div>" +
              "<div class='cover-corner-ornament bl'></div>" +
              "<div class='cover-corner-ornament br'></div>" +
              "<div class='cover-edition-tag'><span>PUBLICATION COMPLETE</span><span>BACK COVER</span></div>" +
              "<div class='back-cover-blurb'>" +
              "<div style='font-size:calc(18px*var(--page-scale));font-weight:800;color:#fff;margin-bottom:10px;'>" +
              (faceData.title || bookProject.title) +
              "</div>" +
              "<p>" +
              (faceData.paragraph1 || "Engineered for high-fidelity digital publication previews with realistic page lighting, dual-mode layout, and responsive mobile gesture mechanics.") +
              "</p>" +
              "</div>" +
              "<div>" +
              "<div class='back-cover-barcode'>" +
              "<div class='barcode-lines'></div>" +
              "<div class='barcode-number'>" +
              (faceData.isbn || "ISBN 978-0-201-63361-0") +
              "</div>" +
              "</div>" +
              "<div class='cover-footer-meta'><span>" +
              (faceData.footerNote || "© 2025 All Rights Reserved") +
              "</span><span>Vanilla Engine</span></div>" +
              "</div>" +
              "</div>" +
              "<div class='leaf-lighting-overlay'></div>" +
              "</div>"
            );
          }

          // 3. PDF Page or Full-Bleed Image Page
          if (
            (faceData.isPdfPage && faceData.imageUrl) ||
            faceData.template === "pdf-page" ||
            faceData.template === "image-full-bleed"
          ) {
            return (
              "<div class='leaf-face " +
              sideClass +
              "' style='background:#ffffff;padding:0;'>" +
              "<div class='page-content-wrapper' style='padding:0;margin:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#ffffff;'>" +
              "<img src='" +
              faceData.imageUrl +
              "' alt='" +
              (faceData.title || "Page") +
              "' style='width:100%;height:100%;object-fit:contain;display:block;' />" +
              "</div>" +
              "<div class='leaf-lighting-overlay'></div>" +
              "</div>"
            );
          }

          // 4. Custom Modular Component Blocks
          if (
            faceData.blocks &&
            faceData.blocks.length > 0 &&
            faceData.template !== "cover-front" &&
            faceData.template !== "cover-back"
          ) {
            return renderBlocksToHTML(faceData.blocks, sideClass, pageIndex, faceData.headerTag);
          }

          // 5. Blank Endpaper / Inside Leaf Face
          if (
            faceData.template === "blank" ||
            (!faceData.imageUrl &&
              !faceData.title &&
              !faceData.paragraph1 &&
              (!faceData.bulletItems || faceData.bulletItems.length === 0) &&
              (!faceData.gridCards || faceData.gridCards.length === 0) &&
              faceData.template !== "cover-front" &&
              faceData.template !== "cover-back")
          ) {
            return (
              "<div class='leaf-face " +
              sideClass +
              "'>" +
              "<div class='page-content-wrapper' style='justify-content:space-between;align-items:center;text-align:center;'>" +
              "<div style='font-size:calc(9px*var(--page-scale));font-family:monospace;letter-spacing:2px;opacity:0.35;text-transform:uppercase;'>" +
              (faceData.headerTag || bookProject.title) +
              "</div>" +
              "<div style='margin:auto 0;opacity:0.2;display:flex;flex-direction:column;align-items:center;'>" +
              "<div style='width:calc(32px*var(--page-scale));height:calc(32px*var(--page-scale));color:var(--accent-green);'>" +
              getIconSVG("sparkle") +
              "</div>" +
              "</div>" +
              "<div style='font-size:calc(9px*var(--page-scale));font-family:monospace;letter-spacing:2px;opacity:0.35;text-transform:uppercase;'>" +
              (faceData.footerNote || bookProject.author) +
              "</div>" +
              "</div>" +
              "<div class='leaf-lighting-overlay'></div>" +
              "</div>"
            );
          }

          // 3. Table of Contents
          if (faceData.template === "table-of-contents") {
            var tocItemsHtml = "";
            (faceData.bulletItems || []).forEach(function (ch, idx) {
              tocItemsHtml +=
                "<div class='toc-item' style='display:flex;align-items:center;justify-content:space-between;padding:calc(7px*var(--page-scale)) calc(10px*var(--page-scale));border-radius:6px;background:#f7faf8;border:1px solid #e5eee8;margin-bottom:calc(6px*var(--page-scale));font-size:calc(12px*var(--page-scale));'>" +
                "<span style='font-weight:800;color:var(--accent-green);width:24px;'>" +
                (idx + 1 < 10 ? "0" + (idx + 1) : idx + 1) +
                "</span>" +
                "<span style='flex:1;font-weight:600;color:#17382d;'>" +
                ch.title +
                "</span>" +
                "<span style='font-weight:700;color:#799185;'>" +
                ch.description +
                "</span>" +
                "</div>";
            });

            return (
              "<div class='leaf-face " +
              sideClass +
              " cover-inside'>" +
              "<div class='page-content-wrapper'>" +
              "<div>" +
              "<div style='font-size:calc(22px*var(--page-scale));font-weight:800;color:#0b241c;margin-bottom:calc(14px*var(--page-scale));border-bottom:2px solid var(--accent-green);padding-bottom:calc(6px*var(--page-scale));display:flex;justify-content:space-between;align-items:baseline;'><span>" +
              (faceData.title || "Table of Contents") +
              "</span><span style='font-size:12px;color:var(--accent-green);font-weight:600;'>Interactive Index</span></div>" +
              "</div>" +
              "<div style='display:flex;flex-direction:column;margin:auto 0;'>" +
              tocItemsHtml +
              "</div>" +
              "<div class='page-footer-tag'><span>Inside Front Cover</span><span>Drag or click corner to flip</span></div>" +
              "</div>" +
              "<div class='leaf-lighting-overlay'></div>" +
              "</div>"
            );
          }

          // 4. Chapter Intro Page
          if (faceData.template === "chapter-intro") {
            var chHtml = "<div class='leaf-face " + sideClass + "'><div class='page-content-wrapper'>";
            chHtml += "<div class='page-header-tag' style='display:flex;justify-content:space-between;border-bottom:1px solid #edf2ef;padding-bottom:calc(6px*var(--page-scale));font-size:calc(9px*var(--page-scale));font-weight:700;letter-spacing:1.5px;color:var(--accent-green);text-transform:uppercase;'><span>" + (faceData.headerTag || bookProject.title) + "</span><span>Page " + (pageIndex !== undefined ? pageIndex : "") + "</span></div>";
            chHtml += "<div style='margin:auto 0;display:flex;flex-direction:column;gap:calc(8px*var(--page-scale));'>";
            if (faceData.chapterNumber) {
              chHtml += "<div class='chapter-number-tag'>" + faceData.chapterNumber + "</div>";
            }
            if (faceData.title) {
              chHtml += "<h2 class='page-hero-title' style='margin-bottom:2px;'>" + faceData.title + "</h2>";
            }
            if (faceData.subtitle) {
              chHtml += "<p style='font-size:calc(12px*var(--page-scale));color:#566861;margin-bottom:calc(6px*var(--page-scale));'>" + faceData.subtitle + "</p>";
            }
            if (faceData.quoteText) {
              chHtml += "<blockquote class='editorial-blockquote'>“" + faceData.quoteText + "”";
              if (faceData.quoteAuthor) {
                chHtml += "<cite class='editorial-cite'>— " + faceData.quoteAuthor + "</cite>";
              }
              chHtml += "</blockquote>";
            }
            if (faceData.paragraph1) {
              chHtml += "<p style='font-size:calc(12px*var(--page-scale));line-height:1.55;color:#3b4e46;'>" + faceData.paragraph1 + "</p>";
            }
            if (faceData.paragraph2) {
              chHtml += "<p style='font-size:calc(12px*var(--page-scale));line-height:1.55;color:#3b4e46;'>" + faceData.paragraph2 + "</p>";
            }
            chHtml += "</div>";
            chHtml += "<div class='page-footer-tag'><span>" + (bookProject.author || "Lumina Press") + "</span><span>Page " + (pageIndex !== undefined ? pageIndex : "") + "</span></div>";
            chHtml += "</div><div class='leaf-lighting-overlay'></div></div>";
            return chHtml;
          }

          // 5. Story / Editorial Leaf
          if (faceData.template === "story-article") {
            var stHtml = "<div class='leaf-face " + sideClass + "'><div class='page-content-wrapper'>";
            stHtml += "<div class='page-header-tag' style='display:flex;justify-content:space-between;border-bottom:1px solid #edf2ef;padding-bottom:calc(6px*var(--page-scale));font-size:calc(9px*var(--page-scale));font-weight:700;letter-spacing:1.5px;color:var(--accent-green);text-transform:uppercase;'><span>" + (faceData.headerTag || bookProject.title) + "</span><span>Page " + (pageIndex !== undefined ? pageIndex : "") + "</span></div>";
            stHtml += "<div style='margin:auto 0;display:flex;flex-direction:column;gap:calc(8px*var(--page-scale));'>";
            if (faceData.title) {
              stHtml += "<h2 class='page-hero-title' style='margin-bottom:calc(8px*var(--page-scale));'>" + faceData.title + "</h2>";
            }
            if (faceData.paragraph1) {
              var p1 = faceData.paragraph1;
              if (faceData.dropCap && p1.length > 1) {
                stHtml += "<p style='font-size:calc(12px*var(--page-scale));line-height:1.55;color:#3b4e46;'><span class='drop-cap-letter'>" + p1[0] + "</span>" + p1.slice(1) + "</p>";
              } else {
                stHtml += "<p style='font-size:calc(12px*var(--page-scale));line-height:1.55;color:#3b4e46;'>" + p1 + "</p>";
              }
            }
            if (faceData.paragraph2) {
              stHtml += "<p style='font-size:calc(12px*var(--page-scale));line-height:1.55;color:#3b4e46;'>" + faceData.paragraph2 + "</p>";
            }
            if (faceData.paragraph3) {
              stHtml += "<p style='font-size:calc(12px*var(--page-scale));line-height:1.55;color:#3b4e46;'>" + faceData.paragraph3 + "</p>";
            }
            stHtml += "</div>";
            stHtml += "<div class='page-footer-tag'><span>" + (bookProject.author || "Lumina Press") + "</span><span>Page " + (pageIndex !== undefined ? pageIndex : "") + "</span></div>";
            stHtml += "</div><div class='leaf-lighting-overlay'></div></div>";
            return stHtml;
          }

          // 6. Image Showcase
          if (faceData.template === "image-showcase") {
            var imgHtml = "<div class='leaf-face " + sideClass + "'><div class='page-content-wrapper'>";
            imgHtml += "<div class='page-header-tag' style='display:flex;justify-content:space-between;border-bottom:1px solid #edf2ef;padding-bottom:calc(6px*var(--page-scale));font-size:calc(9px*var(--page-scale));font-weight:700;letter-spacing:1.5px;color:var(--accent-green);text-transform:uppercase;'><span>" + (faceData.headerTag || bookProject.title) + "</span><span>Page " + (pageIndex !== undefined ? pageIndex : "") + "</span></div>";
            imgHtml += "<div style='margin:auto 0;display:flex;flex-direction:column;gap:calc(8px*var(--page-scale));'>";
            if (faceData.title) {
              imgHtml += "<h2 class='page-hero-title' style='margin-bottom:2px;'>" + faceData.title + "</h2>";
            }
            if (faceData.subtitle) {
              imgHtml += "<p style='font-size:calc(12px*var(--page-scale));color:#566861;margin-bottom:calc(4px*var(--page-scale));'>" + faceData.subtitle + "</p>";
            }
            if (faceData.imageUrl) {
              imgHtml += "<img class='image-showcase-img' src='" + faceData.imageUrl + "' alt='Visual Showcase' />";
              if (faceData.imageCaption) {
                imgHtml += "<div class='image-showcase-caption'>" + faceData.imageCaption + "</div>";
              }
            }
            if (faceData.paragraph1) {
              imgHtml += "<p style='font-size:calc(12px*var(--page-scale));line-height:1.5;color:#3b4e46;margin-top:calc(4px*var(--page-scale));'>" + faceData.paragraph1 + "</p>";
            }
            imgHtml += "</div>";
            imgHtml += "<div class='page-footer-tag'><span>" + (bookProject.author || "Lumina Press") + "</span><span>Page " + (pageIndex !== undefined ? pageIndex : "") + "</span></div>";
            imgHtml += "</div><div class='leaf-lighting-overlay'></div></div>";
            return imgHtml;
          }

          // 7. Image Text Split
          if (faceData.template === "image-text-split") {
            var spHtml = "<div class='leaf-face " + sideClass + "'><div class='page-content-wrapper'>";
            spHtml += "<div class='page-header-tag' style='display:flex;justify-content:space-between;border-bottom:1px solid #edf2ef;padding-bottom:calc(6px*var(--page-scale));font-size:calc(9px*var(--page-scale));font-weight:700;letter-spacing:1.5px;color:var(--accent-green);text-transform:uppercase;'><span>" + (faceData.headerTag || bookProject.title) + "</span><span>Page " + (pageIndex !== undefined ? pageIndex : "") + "</span></div>";
            spHtml += "<div style='margin:auto 0;display:flex;flex-direction:column;gap:calc(8px*var(--page-scale));'>";
            if (faceData.title) {
              spHtml += "<h2 class='page-hero-title' style='margin-bottom:2px;'>" + faceData.title + "</h2>";
            }
            if (faceData.subtitle) {
              spHtml += "<p style='font-size:calc(12px*var(--page-scale));color:#566861;margin-bottom:calc(4px*var(--page-scale));'>" + faceData.subtitle + "</p>";
            }
            if (faceData.imageUrl) {
              spHtml += "<img class='image-showcase-img' style='height:calc(110px*var(--page-scale));' src='" + faceData.imageUrl + "' alt='Visual Split' />";
            }
            if (faceData.paragraph1) {
              spHtml += "<p style='font-size:calc(11.5px*var(--page-scale));line-height:1.5;color:#3b4e46;'>" + faceData.paragraph1 + "</p>";
            }
            if (faceData.paragraph2) {
              spHtml += "<p style='font-size:calc(11.5px*var(--page-scale));line-height:1.5;color:#3b4e46;'>" + faceData.paragraph2 + "</p>";
            }
            spHtml += "</div>";
            spHtml += "<div class='page-footer-tag'><span>" + (bookProject.author || "Lumina Press") + "</span><span>Page " + (pageIndex !== undefined ? pageIndex : "") + "</span></div>";
            spHtml += "</div><div class='leaf-lighting-overlay'></div></div>";
            return spHtml;
          }

          // 8. Quote Highlight
          if (faceData.template === "quote-highlight") {
            var qHtml = "<div class='leaf-face " + sideClass + "'><div class='page-content-wrapper'>";
            qHtml += "<div class='page-header-tag' style='display:flex;justify-content:space-between;border-bottom:1px solid #edf2ef;padding-bottom:calc(6px*var(--page-scale));font-size:calc(9px*var(--page-scale));font-weight:700;letter-spacing:1.5px;color:var(--accent-green);text-transform:uppercase;'><span>" + (faceData.headerTag || "MEDITATIONS") + "</span><span>Page " + (pageIndex !== undefined ? pageIndex : "") + "</span></div>";
            qHtml += "<div class='quote-highlight-container'>";
            qHtml += "<div class='quote-symbol-icon'>" + getIconSVG("sparkle") + "</div>";
            qHtml += "<blockquote class='quote-highlight-text'>“" + (faceData.quoteText || "Simplicity is the ultimate sophistication.") + "”</blockquote>";
            if (faceData.quoteAuthor) {
              qHtml += "<div style='font-size:calc(12px*var(--page-scale));font-weight:800;letter-spacing:1px;color:var(--accent-green);text-transform:uppercase;'>" + faceData.quoteAuthor + "</div>";
            }
            if (faceData.quoteRole) {
              qHtml += "<div style='font-size:calc(10px*var(--page-scale));color:#6b8277;margin-top:2px;'>" + faceData.quoteRole + "</div>";
            }
            qHtml += "</div>";
            qHtml += "<div class='page-footer-tag'><span>" + (bookProject.author || "Lumina Press") + "</span><span>Page " + (pageIndex !== undefined ? pageIndex : "") + "</span></div>";
            qHtml += "</div><div class='leaf-lighting-overlay'></div></div>";
            return qHtml;
          }

          // 9. Key Points Grid
          if (faceData.template === "key-points-grid") {
            var gridCardsHtml = "";
            (faceData.gridCards || []).forEach(function (card) {
              gridCardsHtml += "<div class='bento-grid-card'>";
              gridCardsHtml += "<div><div class='bento-card-tag'>" + card.tag + "</div><div class='bento-card-title'>" + card.title + "</div><div class='bento-card-desc'>" + card.description + "</div></div>";
              if (card.highlight) {
                gridCardsHtml += "<div class='bento-card-metric'>" + card.highlight + "</div>";
              }
              gridCardsHtml += "</div>";
            });

            var kpHtml = "<div class='leaf-face " + sideClass + "'><div class='page-content-wrapper'>";
            kpHtml += "<div class='page-header-tag' style='display:flex;justify-content:space-between;border-bottom:1px solid #edf2ef;padding-bottom:calc(6px*var(--page-scale));font-size:calc(9px*var(--page-scale));font-weight:700;letter-spacing:1.5px;color:var(--accent-green);text-transform:uppercase;'><span>" + (faceData.headerTag || bookProject.title) + "</span><span>Page " + (pageIndex !== undefined ? pageIndex : "") + "</span></div>";
            kpHtml += "<div style='margin:auto 0;display:flex;flex-direction:column;gap:calc(6px*var(--page-scale));'>";
            if (faceData.title) {
              kpHtml += "<h2 class='page-hero-title' style='margin-bottom:2px;'>" + faceData.title + "</h2>";
            }
            if (faceData.subtitle) {
              kpHtml += "<p style='font-size:calc(11.5px*var(--page-scale));color:#566861;margin-bottom:calc(6px*var(--page-scale));'>" + faceData.subtitle + "</p>";
            }
            kpHtml += "<div class='bento-grid-container'>" + gridCardsHtml + "</div>";
            kpHtml += "</div>";
            kpHtml += "<div class='page-footer-tag'><span>" + (bookProject.author || "Lumina Press") + "</span><span>Page " + (pageIndex !== undefined ? pageIndex : "") + "</span></div>";
            kpHtml += "</div><div class='leaf-lighting-overlay'></div></div>";
            return kpHtml;
          }

          // 10. Author Bio / Author Profile
          if (faceData.template === "author-bio" || faceData.template === "author-profile") {
            var bioHtml = "<div class='leaf-face " + sideClass + "'><div class='page-content-wrapper'>";
            bioHtml += "<div class='page-header-tag' style='display:flex;justify-content:space-between;border-bottom:1px solid #edf2ef;padding-bottom:calc(6px*var(--page-scale));font-size:calc(9px*var(--page-scale));font-weight:700;letter-spacing:1.5px;color:var(--accent-green);text-transform:uppercase;'><span>" + (faceData.headerTag || "ABOUT THE AUTHOR") + "</span><span>Page " + (pageIndex !== undefined ? pageIndex : "") + "</span></div>";
            bioHtml += "<div class='author-bio-container'>";
            if (faceData.authorAvatarUrl) {
              bioHtml += "<img class='author-avatar-img' src='" + faceData.authorAvatarUrl + "' alt='Author' />";
            } else {
              bioHtml += "<div class='author-avatar-img' style='display:flex;align-items:center;justify-content:center;background:rgba(125,125,125,0.1);font-weight:bold;font-size:24px;color:var(--accent-green);'>" + (faceData.authorName || "A")[0] + "</div>";
            }
            bioHtml += "<div class='author-name-title'>" + (faceData.authorName || bookProject.author) + "</div>";
            bioHtml += "<p class='author-bio-text'>" + (faceData.authorBio || "Author & designer committed to crafting immersive virtual reading experiences.") + "</p>";
            if (faceData.authorSocials) {
              bioHtml += "<div style='font-size:calc(10px*var(--page-scale));font-family:monospace;color:#6d847a;'>" + faceData.authorSocials + "</div>";
            }
            bioHtml += "</div>";
            bioHtml += "<div class='page-footer-tag'><span>" + (bookProject.author || "Lumina Press") + "</span><span>Page " + (pageIndex !== undefined ? pageIndex : "") + "</span></div>";
            bioHtml += "</div><div class='leaf-lighting-overlay'></div></div>";
            return bioHtml;
          }

          // 11. Feature List & Standard Fallback Content Pages
          var html = "<div class='leaf-face " + sideClass + "'>";
          html += "<div class='page-content-wrapper'>";

          // Header
          html += "<div class='page-header-tag' style='display:flex;justify-content:space-between;border-bottom:1px solid #edf2ef;padding-bottom:calc(6px*var(--page-scale));font-size:calc(9px*var(--page-scale));font-weight:700;letter-spacing:1.5px;color:var(--accent-green);text-transform:uppercase;'><span>" + (faceData.headerTag || bookProject.title) + "</span><span>Page " + (pageIndex !== undefined ? pageIndex : "") + "</span></div>";

          html += "<div style='margin:auto 0;display:flex;flex-direction:column;gap:calc(8px*var(--page-scale));'>";
          if (faceData.title) {
            html += "<h2 class='page-hero-title'>" + faceData.title + "</h2>";
          }
          if (faceData.subtitle) {
            html += "<p style='font-size:calc(12px*var(--page-scale));color:#566861;margin-bottom:calc(8px*var(--page-scale));'>" + faceData.subtitle + "</p>";
          }

          // Feature list / Bullets / Paragraphs
          if (faceData.bulletItems && faceData.bulletItems.length > 0) {
            html += "<div class='feature-list'>";
            faceData.bulletItems.forEach(function (feat) {
              html += "<div class='feature-item'>";
              html +=
                "<div class='feature-icon-box'>" +
                getIconSVG("check") +
                "</div>";
              html +=
                "<div class='feature-text'><strong>" +
                feat.title +
                "</strong> " +
                feat.description +
                "</div>";
              html += "</div>";
            });
            html += "</div>";
          } else if (faceData.paragraph1 || faceData.paragraph2) {
            html += "<div style='margin:auto 0;font-size:calc(12.5px*var(--page-scale));line-height:1.55;color:#3b4e46;'>";
            if (faceData.paragraph1) html += "<p style='margin-bottom:8px;'>" + faceData.paragraph1 + "</p>";
            if (faceData.paragraph2) html += "<p>" + faceData.paragraph2 + "</p>";
            html += "</div>";
          }
          html += "</div>";

          // Footer
          html +=
            "<div class='page-footer-tag'><span>" +
            (bookProject.author || "Lumina Press") +
            "</span><span>Page " +
            (pageIndex !== undefined ? pageIndex : "") +
            "</span></div>";
          html += "</div>";
          html += "<div class='leaf-lighting-overlay'></div>";
          html += "</div>";

          return html;
        }

        // Construct 3D Corner-Curl Flipbook (StPageFlip + Mobile Portrait Bilateral Patch)
        function constructFlipbook() {
          var container = document.getElementById("book-container");
          if (!container || !window.PageFlip) return;

          if (pageFlipInstance) {
            try {
              pageFlipInstance.destroy();
            } catch (err) {}
            pageFlipInstance = null;
          }

          var isMobile = document.body.classList.contains("is-mobile");
          var rawPages = bookProject.pages || [];
          var pages = rawPages.slice();

          if (!isMobile) {
            // Ensure total page count on desktop 2-page spread is even so the last page
            // always closes as a solo Back Cover with nothing behind it on the right side
            if (pages.length > 1 && pages.length % 2 !== 0) {
              var lastBack = pages.pop();
              pages.push({
                id: "p-inside-back-blank",
                template: "blank",
                title: "",
                subtitle: "",
                headerTag: "",
                footerNote: "",
              });
              pages.push(lastBack);
            }
          }

          totalPagesCount = pages.length;
          if (totalPagesCount === 0) return;

          if (!hasInitializedPage && initialTargetPage > 0) {
            hasInitializedPage = true;
            currentPageIndex = Math.max(0, Math.min(totalPagesCount - 1, initialTargetPage));
          } else {
            currentPageIndex = Math.max(0, Math.min(totalPagesCount - 1, currentPageIndex));
          }

          var totalW = isMobile ? currentPageW : currentPageW * 2;
          container.style.width = totalW + "px";
          container.style.height = currentPageH + "px";
          container.innerHTML =
            '<div class="book-spine-shadow" id="book-spine-shadow"></div>' +
            '<div id="stf-mount" style="width:' +
            totalW +
            "px;height:" +
            currentPageH +
            'px;position:relative;"></div>';

          var mountEl = document.getElementById("stf-mount");
          var bookEl = document.createElement("div");
          bookEl.style.width = totalW + "px";
          bookEl.style.height = currentPageH + "px";
          bookEl.style.position = "relative";
          mountEl.appendChild(bookEl);

          var pageElements = [];
          for (var idx = 0; idx < pages.length; idx++) {
            var pageEl = document.createElement("div");
            pageEl.className = "flip-page-item";
            pageEl.dataset.density = "soft";
            pageEl.style.width = currentPageW + "px";
            pageEl.style.height = currentPageH + "px";
            pageEl.style.overflow = "hidden";

            var isLeftSpread = !isMobile && idx > 0 && idx % 2 === 1;
            var sideClass = isLeftSpread ? "face-left" : "face-front";
            pageEl.innerHTML = buildFaceHTML(pages[idx], sideClass, idx + 1);

            bookEl.appendChild(pageEl);
            pageElements.push(pageEl);
          }

          var pf = new window.PageFlip(bookEl, {
            width: currentPageW,
            height: currentPageH,
            size: "fixed",
            autoSize: false,
            minWidth: currentPageW,
            maxWidth: currentPageW,
            minHeight: currentPageH,
            maxHeight: currentPageH,
            maxShadowOpacity: 0.55,
            showCover: !isMobile,
            mobileScrollSupport: false,
            usePortrait: isMobile,
            startPage: currentPageIndex,
            drawShadow: true,
            flippingTime: 780,
            swipeDistance: 20,
            clickEventForward: true,
            useMouseEvents: true,
            showPageCorners: true,
            disableFlipByClick: false,
          });

          pf.loadFromHTML(pageElements);

          // Apply Soft Clip-Path Fix & Mobile Portrait Bilateral Corner-Curl Patch
          var render = pf.getRender();
          var pageCollection = pf.getPageCollection();
          var fc = pf.getFlipController();
          var ui = pf.getUI();

          // Ensure quick mobile touch taps (< 250ms) also trigger page flip
          if (ui && ui.distElement && ui.onTouchEnd) {
            ui.distElement.removeEventListener("touchend", ui.onTouchEnd);
            window.removeEventListener("touchend", ui.onTouchEnd);
            ui.onTouchEnd = function (t) {
              if (t.changedTouches.length > 0) {
                var e = t.changedTouches[0];
                var i = ui.getMousePos(e.clientX, e.clientY);
                var s = false;
                if (ui.touchPoint !== null) {
                  var dx = i.x - ui.touchPoint.point.x;
                  var dy = Math.abs(i.y - ui.touchPoint.point.y);
                  if (
                    Math.abs(dx) > ui.swipeDistance &&
                    dy < 2 * ui.swipeDistance &&
                    Date.now() - ui.touchPoint.time < ui.swipeTimeout
                  ) {
                    var corner =
                      ui.touchPoint.point.y < ui.app.getRender().getRect().height / 2
                        ? "top"
                        : "bottom";
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
            window.addEventListener("touchend", ui.onTouchEnd);
          }

          if (render && pageCollection && fc) {
            function patchPageGutterClip(pageObj) {
              if (!pageObj || pageObj.__gutterPatched) return;
              pageObj.__gutterPatched = true;
              pageObj.setDensity("soft");
              pageObj.setDrawingDensity("soft");

              var origDrawSoft = pageObj.drawSoft ? pageObj.drawSoft.bind(pageObj) : null;
              if (origDrawSoft) {
                pageObj.drawSoft = function (globalPos, baseStyle) {
                  if (!baseStyle) baseStyle = "";
                  if (
                    this !== this.render.flippingPage ||
                    this.render.getOrientation() === "portrait" ||
                    this.render.bottomPage === this.render.flippingPage
                  ) {
                    return origDrawSoft(globalPos, baseStyle);
                  }

                  var rect = this.render.getRect();
                  var pw = rect.pageWidth;
                  var dir = this.render.getDirection();
                  var gutterHidePx = Math.min(24, Math.round(pw * 0.055));
                  var cosA = Math.cos(this.state.angle);
                  var sinA = Math.sin(this.state.angle);

                  var polyPoints = "polygon( ";
                  for (var aIdx = 0; aIdx < this.state.area.length; aIdx++) {
                    var pt = this.state.area[aIdx];
                    if (pt !== null) {
                      var lx = dir === 1 ? -pt.x + this.state.position.x : pt.x - this.state.position.x;
                      var ly = pt.y - this.state.position.y;
                      var rx = lx * cosA + ly * sinA;
                      var ry = ly * cosA - lx * sinA;
                      rx = dir === 1 ? Math.max(gutterHidePx, rx) : Math.min(pw - gutterHidePx, rx);
                      polyPoints += rx.toFixed(1) + "px " + ry.toFixed(1) + "px, ";
                    }
                  }
                  polyPoints = polyPoints.slice(0, -2) + ")";

                  var transformCss =
                    this.render.isSafari() && this.state.angle === 0
                      ? "transform: translate(" + globalPos.x + "px, " + globalPos.y + "px);"
                      : "transform: translate3d(" +
                        globalPos.x +
                        "px, " +
                        globalPos.y +
                        "px, 0) rotate(" +
                        this.state.angle +
                        "rad);";

                  this.element.style.cssText =
                    baseStyle +
                    "transform-origin: 0 0; clip-path: " +
                    polyPoints +
                    "; -webkit-clip-path: " +
                    polyPoints +
                    ";" +
                    transformCss;
                };
              }
            }

            var allPages = pageCollection.getPages();
            for (var pIdx = 0; pIdx < allPages.length; pIdx++) {
              patchPageGutterClip(allPages[pIdx]);
            }

            if (render.drawOuterShadow) {
              var origDrawOuterShadow = render.drawOuterShadow.bind(render);
              render.drawOuterShadow = function () {
                origDrawOuterShadow();
                if (this.outerShadow) {
                  this.outerShadow.style.zIndex = String(this.getSettings().startZIndex + 4);
                }
              };
            }

            // Helper: Compute unpeeled polygon clip-path for the stationary page being lifted
            // so the peeled area behind First Cover (Page 2) and Last Cover is 100% clipped away
            function getUnpeeledClipPolygon(calc, direction) {
              if (!calc) return null;
              var pw = calc.pageWidth;
              var ph = calc.pageHeight;
              var topPt = calc.topIntersectPoint;
              var sidePt = calc.sideIntersectPoint;
              var botPt = calc.bottomIntersectPoint;

              var validCount = (topPt ? 1 : 0) + (sidePt ? 1 : 0) + (botPt ? 1 : 0);
              if (validCount < 2) {
                if (calc.position && calc.position.x < pw * 0.5) {
                  return "polygon(0px 0px, 0px 0px, 0px 0px)";
                }
                return null;
              }

              var pts = [{ x: 0, y: 0 }];
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

              var poly = [];
              for (var k = 0; k < pts.length; k++) {
                var p = pts[k];
                var clampedX = Math.max(0, Math.min(pw, p.x));
                var clampedY = Math.max(0, Math.min(ph, p.y));
                var cx = direction === 1 ? pw - clampedX : clampedX;
                var cy = clampedY;
                poly.push(cx.toFixed(1) + "px " + cy.toFixed(1) + "px");
              }
              return "polygon(" + poly.join(", ") + ")";
            }

            // 1. Keep boundsRect.left = 0 when flipping backward in portrait mode
            var origGetRect = render.getRect.bind(render);
            render.getRect = function () {
              if (this.boundsRect === null) this.calculateBoundsRect();
              if (this.orientation === "portrait" && this.direction === 1) {
                return Object.assign({}, this.boundsRect, { left: 0 });
              }
              return origGetRect();
            };

            // 2a. Clip leftPage to the unpeeled polygon during backward flip (direction === 1)
            //     so Page 2 (leftPage) never shows behind the closing Front Cover!
            var origDrawLeftPage = render.drawLeftPage.bind(render);
            render.drawLeftPage = function () {
              if (this.orientation === "portrait") return;
              if (this.leftPage === null) return;
              origDrawLeftPage();
              if (this.direction === 1 && this.flippingPage !== null && fc.getCalculation() !== null) {
                var clipPoly = getUnpeeledClipPolygon(fc.getCalculation(), 1);
                var el = this.leftPage.getElement();
                if (clipPoly && el) {
                  el.style.clipPath = clipPoly;
                  el.style.webkitClipPath = clipPoly;
                }
              }
            };

            // 2b. Clip rightPage to the unpeeled polygon during forward flip (direction === 0)
            //     and portrait backward flip so the inside-back page never shows behind the Last Cover!
            var origDrawRightPage = render.drawRightPage.bind(render);
            render.drawRightPage = function () {
              if (this.rightPage === null) return;
              if (this.orientation === "portrait" && this.direction === 1) {
                this.rightPage.simpleDraw(0);
                if (this.flippingPage !== null && fc.getCalculation() !== null) {
                  var clipPolyPortrait = getUnpeeledClipPolygon(fc.getCalculation(), 1);
                  var elPortrait = this.rightPage.getElement();
                  if (clipPolyPortrait && elPortrait) {
                    elPortrait.style.clipPath = clipPolyPortrait;
                    elPortrait.style.webkitClipPath = clipPolyPortrait;
                  }
                }
                return;
              }
              origDrawRightPage();
              if (this.direction === 0 && this.flippingPage !== null && fc.getCalculation() !== null) {
                var clipPolyRight = getUnpeeledClipPolygon(fc.getCalculation(), 0);
                var elRight = this.rightPage.getElement();
                if (clipPolyRight && elRight) {
                  elRight.style.clipPath = clipPolyRight;
                  elRight.style.webkitClipPath = clipPolyRight;
                }
              }
            };

            // 3. Always draw bottomPage with 'soft' polygon clip-path so next/prev page is ONLY revealed
            //    behind the peeled fold line (never unclipped on initial click)
            render.drawBottomPage = function () {
              if (this.bottomPage === null) return;
              if (this.bottomPage === this.flippingPage) return;
              var startZIndex = this.getSettings().startZIndex;
              var el = this.bottomPage.getElement();
              el.style.zIndex = String(startZIndex + 3);
              this.bottomPage.draw("soft");
            };

            // 4. Use a temporary copy for portrait BACK flip so current page curls from Left to Right
            var origGetFlippingPage = pageCollection.getFlippingPage.bind(pageCollection);
            pageCollection.getFlippingPage = function (direction) {
              if (this.render.getOrientation() === "portrait" && direction === 1) {
                return this.pages[this.currentSpreadIndex].newTemporaryCopy();
              }
              return origGetFlippingPage(direction);
            };

            // 5. Reset direction to 0 after flip finishes in portrait mode
            var origReset = fc.reset.bind(fc);
            fc.reset = function () {
              origReset();
              if (this.render.getOrientation() === "portrait") {
                this.render.setDirection(0);
              }
            };

            // 6. Accurate spread-based direction bounds check for both odd and even page counts
            fc.checkDirection = function (direction) {
              var spreads = pageCollection.getSpread();
              var cur = pageCollection.getCurrentSpreadIndex();
              return direction === 0 ? cur < spreads.length - 1 : cur > 0;
            };

            // 7. Detect Left half (direction 1 = Previous) vs Right half (direction 0 = Next) in portrait mode
            var origGetDirectionByPoint = fc.getDirectionByPoint.bind(fc);
            fc.getDirectionByPoint = function (touchPos) {
              if (this.render.getOrientation() === "portrait") {
                var b = this.render.boundsRect || this.getBoundsRect();
                var screenX = touchPos.x - b.pageWidth;
                return screenX <= b.pageWidth * 0.45 ? 1 : 0;
              }
              return origGetDirectionByPoint(touchPos);
            };

            // 8. Enable corner peel on ALL 4 corners in portrait mode
            var origIsPointOnCorners = fc.isPointOnCorners.bind(fc);
            fc.isPointOnCorners = function (globalPos) {
              if (this.render.getOrientation() === "portrait") {
                var b = this.render.boundsRect || this.getBoundsRect();
                var pw = b.pageWidth;
                var ph = b.height;
                var cornerArea = Math.min(pw, ph) * 0.22;
                var gx = globalPos.x;
                var gy = globalPos.y;
                if (gx < 0 || gx > pw || gy < 0 || gy > ph) return false;
                var nearLeft = gx <= cornerArea;
                var nearRight = gx >= pw - cornerArea;
                var nearTop = gy <= cornerArea;
                var nearBottom = gy >= ph - cornerArea;
                return (nearLeft || nearRight) && (nearTop || nearBottom);
              }
              return origIsPointOnCorners(globalPos);
            };

            // 9. Clean up any active corner-hover peel before starting a drag fold or click flip
            var origFold = fc.fold.bind(fc);
            fc.fold = function (globalPos) {
              if (this.state !== "user_fold" && this.calc !== null) {
                this.render.finishAnimation();
                this.reset();
              }
              origFold(globalPos);
            };

            var origFlip = fc.flip.bind(fc);
            fc.flip = function (globalPos) {
              if (this.state !== "user_fold" && this.calc !== null) {
                this.render.finishAnimation();
                this.reset();
              }
              origFlip(globalPos);
            };

            // 10. Smooth threshold completion on touch/mouse release for both Next (dir 0) & Prev (dir 1)
            //     Note: In PageFlipCalculator, pos.x is already in local mirrored coordinates
            //     (+pageWidth = unflipped start edge, -pageWidth = flipped target edge) for BOTH directions!
            var origStopMove = fc.stopMove.bind(fc);
            fc.stopMove = function () {
              if (this.calc === null) return;
              if (this.state === "user_fold") {
                var pos = this.calc.getPosition();
                var bounds = this.getBoundsRect();
                var targetY = this.calc.getCorner() === "bottom" ? bounds.height : 0;
                if (pos.x <= bounds.pageWidth * 0.65) {
                  this.animateFlippingTo(pos, { x: -bounds.pageWidth, y: targetY }, true);
                } else {
                  this.animateFlippingTo(pos, { x: bounds.pageWidth, y: targetY }, false);
                }
                return;
              }
              origStopMove();
            };

            // 11. Button-triggered flipPrev / flipNext in portrait mode also curl from Left/Right corners
            var origFlipPrev = fc.flipPrev.bind(fc);
            fc.flipPrev = function (corner) {
              if (!corner) corner = "bottom";
              if (this.render.getOrientation() === "portrait") {
                if (pageCollection.getCurrentSpreadIndex() <= 0) return;
                var b = this.render.boundsRect || this.getBoundsRect();
                this.flip({
                  x: 16,
                  y: corner === "top" ? 16 : b.height - 16,
                });
                return;
              }
              origFlipPrev(corner);
            };

            var origFlipNext = fc.flipNext.bind(fc);
            fc.flipNext = function (corner) {
              if (!corner) corner = "bottom";
              if (this.render.getOrientation() === "portrait") {
                var spreads = pageCollection.getSpread();
                if (pageCollection.getCurrentSpreadIndex() >= spreads.length - 1) return;
                var b = this.render.boundsRect || this.getBoundsRect();
                this.flip({
                  x: b.pageWidth - 16,
                  y: corner === "top" ? 16 : b.height - 16,
                });
                return;
              }
              origFlipNext(corner);
            };
          }

          pf.on("flip", function (e) {
            currentPageIndex = typeof e.data === "number" ? e.data : 0;
            updateNavButtons();
            updateBookCoverPosition();
          });

          pf.on("changeState", function (e) {
            var state = e.data;
            if (state === "flipping" || state === "user_fold") {
              isAnimating = true;
              updateBookCoverPosition();
              if (state === "flipping") {
                var now = Date.now();
                if (now - lastFlipTime > 250) {
                  lastFlipTime = now;
                  playPageTurnSound();
                }
              }
            } else if (state === "read") {
              isAnimating = false;
              updateBookCoverPosition();
            }
          });

          pageFlipInstance = pf;
          updateNavButtons();
          updateBookCoverPosition();
        }

        function isAtLastSpread() {
          if (!pageFlipInstance) return currentPageIndex >= totalPagesCount - 1;
          var pc = pageFlipInstance.getPageCollection();
          if (!pc) return currentPageIndex >= totalPagesCount - 1;
          return pc.getCurrentSpreadIndex() >= pc.getSpread().length - 1;
        }

        function updateBookCoverPosition() {
          var container = document.getElementById("book-container");
          if (!container) return;
          var isMobile = document.body.classList.contains("is-mobile");

          if (isAnimating) {
            container.classList.add("is-flipping-active");
          } else {
            container.classList.remove("is-flipping-active");
          }

          if (!isMobile && currentPageIndex === 0 && !isAnimating) {
            container.classList.add("is-cover-closed");
            container.classList.remove("is-back-closed");
          } else if (
            !isMobile &&
            totalPagesCount > 1 &&
            currentPageIndex >= totalPagesCount - 1 &&
            !isAnimating
          ) {
            container.classList.add("is-back-closed");
            container.classList.remove("is-cover-closed");
          } else {
            container.classList.remove("is-cover-closed", "is-back-closed");
          }
        }

        function updateNavButtons() {
          var prevBtn = document.getElementById("btn-prev-corner");
          var nextBtn = document.getElementById("btn-next-corner");
          if (prevBtn) prevBtn.disabled = currentPageIndex <= 0;
          if (nextBtn) nextBtn.disabled = isAtLastSpread();
          var jumpInput = document.getElementById("page-jump-input");
          var jumpTotal = document.getElementById("page-jump-total");
          if (jumpInput) {
            jumpInput.max = String(totalPagesCount);
            if (document.activeElement !== jumpInput) {
              jumpInput.value = String(currentPageIndex + 1);
            }
          }
          if (jumpTotal) {
            jumpTotal.textContent = "/ " + totalPagesCount;
          }
        }

        window.handlePageJumpKey = function (e) {
          e.stopPropagation();
          if (e.key === "Enter") {
            var inputEl = e.target;
            var parsed = parseInt(inputEl.value, 10);
            if (!isNaN(parsed)) {
              var targetIdx = Math.max(0, Math.min(totalPagesCount - 1, parsed - 1));
              inputEl.value = String(targetIdx + 1);
              window.goToLeaf(targetIdx);
            } else {
              inputEl.value = String(currentPageIndex + 1);
            }
            inputEl.blur();
          }
        };

        window.handlePageJumpBlur = function (inputEl) {
          var parsed = parseInt(inputEl.value, 10);
          if (!isNaN(parsed)) {
            var targetIdx = Math.max(0, Math.min(totalPagesCount - 1, parsed - 1));
            inputEl.value = String(targetIdx + 1);
            window.goToLeaf(targetIdx);
          } else {
            inputEl.value = String(currentPageIndex + 1);
          }
        };

        // Standard ISO 216 A4 Aspect Ratio
        var A4_RATIO = Math.SQRT2;

        function updateBookDimensions() {
          var wrapper = document.getElementById("flipbook-wrapper");
          if (!wrapper) return;

          var isFull = !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement ||
            wrapper.classList.contains("is-pseudo-fullscreen")
          );

          var vw = isFull
            ? window.innerWidth || wrapper.clientWidth || 800
            : wrapper.clientWidth || window.innerWidth || 800;
          var vh = isFull
            ? window.innerHeight || wrapper.clientHeight || 600
            : wrapper.clientHeight || window.innerHeight || 600;

          var isMobile = vw < 768 || (vw < 900 && vh > vw);

          if (isMobile) {
            document.body.classList.add("is-mobile");
          } else {
            document.body.classList.remove("is-mobile");
          }

          var pageW, pageH;
          if (isMobile) {
            var mobWPad = isFull ? 12 : 28;
            var mobHPad = isFull ? 48 : 96;
            var maxAvailW = Math.min(vw - mobWPad, isFull ? 960 : 520);
            var maxAvailH = vh - mobHPad;

            if (maxAvailW * A4_RATIO <= maxAvailH) {
              pageW = Math.max(240, maxAvailW);
              pageH = Math.round(pageW * A4_RATIO);
            } else {
              pageH = Math.max(340, maxAvailH);
              pageW = Math.round(pageH / A4_RATIO);
            }
          } else {
            var deskWPad = isFull ? 28 : 120;
            var deskHPad = isFull ? 32 : 90;
            var maxBookTotalW = Math.min(vw - deskWPad, isFull ? 2400 : 1560);
            var maxAvailHDesktop = vh - deskHPad;

            if ((maxBookTotalW / 2) * A4_RATIO <= maxAvailHDesktop) {
              pageW = Math.max(260, Math.floor(maxBookTotalW / 2));
              pageH = Math.round(pageW * A4_RATIO);
            } else {
              pageH = Math.max(360, Math.floor(maxAvailHDesktop));
              pageW = Math.round(pageH / A4_RATIO);
            }
          }

          pageW = Math.round(pageW);
          pageH = Math.round(pageH);
          currentPageW = pageW;
          currentPageH = pageH;

          var BASE_PAGE_W = 480;
          var scale = pageW / BASE_PAGE_W;

          document.documentElement.style.setProperty("--page-w", pageW + "px");
          document.documentElement.style.setProperty("--page-h", pageH + "px");
          document.documentElement.style.setProperty("--page-scale", scale.toFixed(4));
          document.documentElement.style.setProperty("--a4-scale", scale.toFixed(4));

          if (
            isMobile !== lastBuiltMobile ||
            Math.abs(pageW - lastBuiltPageW) >= 2 ||
            Math.abs(pageH - lastBuiltPageH) >= 2 ||
            !pageFlipInstance
          ) {
            lastBuiltMobile = isMobile;
            lastBuiltPageW = pageW;
            lastBuiltPageH = pageH;
            constructFlipbook();
          }
        }

        // Public Navigation Functions
        var lastFlipTime = 0;
        window.flipNext = function () {
          if (!pageFlipInstance) return;
          var now = Date.now();
          if (now - lastFlipTime < 280 || isAtLastSpread()) return;
          lastFlipTime = now;
          playPageTurnSound();
          pageFlipInstance.flipNext("bottom");
        };

        window.flipPrev = function () {
          if (!pageFlipInstance) return;
          var now = Date.now();
          if (now - lastFlipTime < 280 || currentPageIndex <= 0) return;
          lastFlipTime = now;
          playPageTurnSound();
          pageFlipInstance.flipPrev("bottom");
        };

        window.goToLeaf = function (targetIdx) {
          if (!pageFlipInstance) return;
          var clamped = Math.max(0, Math.min(totalPagesCount - 1, targetIdx));
          if (clamped === currentPageIndex) return;
          playPageTurnSound();
          pageFlipInstance.turnToPage(clamped);
          currentPageIndex = clamped;
          updateNavButtons();
          updateBookCoverPosition();
        };

        window.goToChapter = function (deskIdx, mobIdx) {
          var pageTarget = mobIdx !== undefined ? mobIdx : deskIdx;
          window.goToLeaf(pageTarget);
        };

        // Sound Toggle
        window.toggleSound = function () {
          soundEnabled = !soundEnabled;
          var btn = document.getElementById("btn-sound");
          var icon = document.getElementById("icon-sound");
          if (btn) {
            btn.style.opacity = soundEnabled ? "1" : "0.4";
            btn.title = soundEnabled ? "Mute Sound" : "Enable Sound";
          }
          if (icon) {
            if (soundEnabled) {
              icon.innerHTML =
                '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>';
            } else {
              icon.innerHTML =
                '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>';
            }
          }
        };

        // Fullscreen Toggle
        window.toggleFullscreen = function () {
          var wrapper = document.getElementById("flipbook-wrapper");
          if (!wrapper) return;
          var isNativeFull = !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement
          );
          var isPseudoFull = wrapper.classList.contains("is-pseudo-fullscreen");

          if (isNativeFull || isPseudoFull) {
            wrapper.classList.remove("is-pseudo-fullscreen");
            updateFullscreenIcon(false);
            if (isNativeFull) {
              var exit =
                document.exitFullscreen ||
                document.webkitExitFullscreen ||
                document.mozCancelFullScreen ||
                document.msExitFullscreen;
              if (exit) {
                try {
                  var exitRes = exit.call(document);
                  if (exitRes && typeof exitRes.catch === "function") {
                    exitRes.catch(function () {});
                  }
                } catch (err) {}
              }
            }
            setTimeout(updateBookDimensions, 60);
            setTimeout(updateBookDimensions, 240);
          } else {
            var activatePseudo = function () {
              wrapper.classList.add("is-pseudo-fullscreen");
              updateFullscreenIcon(true);
              setTimeout(updateBookDimensions, 60);
            };

            var req =
              wrapper.requestFullscreen ||
              wrapper.webkitRequestFullscreen ||
              wrapper.mozRequestFullScreen ||
              wrapper.msRequestFullscreen;
            if (req) {
              try {
                var reqRes = req.call(wrapper);
                if (reqRes && typeof reqRes.then === "function") {
                  reqRes
                    .then(function () {
                      wrapper.classList.remove("is-pseudo-fullscreen");
                      updateFullscreenIcon(true);
                      setTimeout(updateBookDimensions, 80);
                      setTimeout(updateBookDimensions, 240);
                    })
                    .catch(function () {
                      activatePseudo();
                    });
                } else {
                  updateFullscreenIcon(true);
                  setTimeout(updateBookDimensions, 80);
                }
              } catch (err) {
                activatePseudo();
              }
            } else {
              activatePseudo();
            }
          }
        };

        function updateFullscreenIcon(isFull) {
          var wrapper = document.getElementById("flipbook-wrapper");
          if (typeof isFull === "undefined") {
            isFull = !!(
              document.fullscreenElement ||
              document.webkitFullscreenElement ||
              document.mozFullScreenElement ||
              document.msFullscreenElement ||
              (wrapper && wrapper.classList.contains("is-pseudo-fullscreen"))
            );
          }
          var btn = document.getElementById("btn-fullscreen");
          if (btn) {
            btn.title = isFull ? "Minimize (Exit Fullscreen)" : "Maximize (Fullscreen)";
          }
          var icon = document.getElementById("icon-fullscreen");
          if (icon) {
            if (isFull) {
              icon.innerHTML =
                '<path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>';
            } else {
              icon.innerHTML =
                '<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>';
            }
          }
        }

        var fullscreenEvents = [
          "fullscreenchange",
          "webkitfullscreenchange",
          "mozfullscreenchange",
          "MSFullscreenChange",
        ];
        fullscreenEvents.forEach(function (evt) {
          document.addEventListener(evt, function () {
            var isNative = !!(
              document.fullscreenElement ||
              document.webkitFullscreenElement ||
              document.mozFullScreenElement ||
              document.msFullscreenElement
            );
            var wrapper = document.getElementById("flipbook-wrapper");
            if (!isNative && wrapper) {
              wrapper.classList.remove("is-pseudo-fullscreen");
            }
            updateFullscreenIcon(isNative);
            setTimeout(updateBookDimensions, 100);
          });
        });

        window.triggerDownload = function () {
          window.print();
        };

        // Keyboard Arrow Navigation & Escape Fullscreen Exit
        window.addEventListener("keydown", function (e) {
          if (e.key === "Escape") {
            var wrapper = document.getElementById("flipbook-wrapper");
            if (wrapper && wrapper.classList.contains("is-pseudo-fullscreen")) {
              wrapper.classList.remove("is-pseudo-fullscreen");
              updateFullscreenIcon(false);
              setTimeout(updateBookDimensions, 60);
            }
          }
          var target = e.target || document.activeElement;
          if (
            target &&
            (target.tagName === "INPUT" ||
              target.tagName === "TEXTAREA" ||
              target.tagName === "SELECT" ||
              target.isContentEditable)
          ) {
            return;
          }
          if (e.key === "ArrowRight" || e.key === "PageDown") {
            window.flipNext();
          } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
            window.flipPrev();
          }
        });

        // Mouse Wheel & Trackpad Page Turning
        var lastWheelTime = 0;
        window.addEventListener(
          "wheel",
          function (e) {
            e.preventDefault();
            var now = Date.now();
            if (now - lastWheelTime < 420) return;

            var delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
            if (Math.abs(delta) > 18) {
              lastWheelTime = now;
              if (delta > 0) {
                window.flipNext();
              } else {
                window.flipPrev();
              }
            }
          },
          { passive: false }
        );

        // Resize & Orientation Listeners
        var resizeTimer;
        window.addEventListener("resize", function () {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(updateBookDimensions, 120);
        });

        window.addEventListener("orientationchange", function () {
          setTimeout(updateBookDimensions, 200);
        });

        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", function () {
            updateBookDimensions();
          });
        } else {
          updateBookDimensions();
        }
      })();
    </script>
  </body>
</html>`;
}

function escapeHtml(str: string = ''): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
