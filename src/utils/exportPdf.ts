import React from 'react';
import { createRoot } from 'react-dom/client';
import { jsPDF } from 'jspdf';
import { BookProject, PageContent, CoverTheme } from '../types/flipbook';
import { COVER_THEMES } from '../constants/templates';
import { PageRenderer } from '../components/PageRenderer';
import { convertBookImagesToBase64 } from './imageUtils';
import { getLicenseInfo, recordExportHtml } from './licenseManager';

export interface PdfExportProgress {
  currentPage: number;
  totalPages: number;
  statusText: string;
}

interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

// Shared 1x1 canvas for resolving any modern CSS color (including Tailwind v4 oklch(), color-mix(), rgba(), etc.)
let colorProbeCtx: CanvasRenderingContext2D | null = null;
function getColorProbeCtx(): CanvasRenderingContext2D | null {
  if (!colorProbeCtx && typeof document !== 'undefined') {
    const c = document.createElement('canvas');
    c.width = 1;
    c.height = 1;
    colorProbeCtx = c.getContext('2d', { willReadFrequently: true });
  }
  return colorProbeCtx;
}

/**
 * Parses any CSS color string into RGBA [0..255, 0..255, 0..255, 0..1]
 */
function parseCssColor(cssColor: string | null | undefined): RgbaColor {
  if (!cssColor) return { r: 0, g: 0, b: 0, a: 0 };
  const trimmed = cssColor.trim();
  if (!trimmed || trimmed === 'transparent' || trimmed === 'none') {
    return { r: 0, g: 0, b: 0, a: 0 };
  }

  // Fast path for rgb() / rgba()
  const rgbMatch = trimmed.match(
    /^rgba?\(\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*[, ]\s*([\d.]+)(?:\s*[,/]\s*([\d.%]+))?\s*\)$/i
  );
  if (rgbMatch) {
    const r = Math.min(255, Math.max(0, Math.round(parseFloat(rgbMatch[1]))));
    const g = Math.min(255, Math.max(0, Math.round(parseFloat(rgbMatch[2]))));
    const b = Math.min(255, Math.max(0, Math.round(parseFloat(rgbMatch[3]))));
    let a = 1;
    if (rgbMatch[4] !== undefined) {
      const rawA = rgbMatch[4];
      a = rawA.endsWith('%') ? parseFloat(rawA) / 100 : parseFloat(rawA);
    }
    return { r, g, b, a: Math.min(1, Math.max(0, isNaN(a) ? 1 : a)) };
  }

  // Fast path for #hex
  if (trimmed.startsWith('#')) {
    const hex = trimmed.slice(1);
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
        a: 1,
      };
    }
    if (hex.length === 6 || hex.length === 8) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
      return { r, g, b, a };
    }
  }

  // Fallback via 1x1 canvas for oklch(), hsl(), named colors, etc.
  const ctx = getColorProbeCtx();
  if (ctx) {
    try {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = 'rgba(0,0,0,0)';
      ctx.fillStyle = trimmed;
      ctx.fillRect(0, 0, 1, 1);
      const data = ctx.getImageData(0, 0, 1, 1).data;
      return {
        r: data[0],
        g: data[1],
        b: data[2],
        a: +(data[3] / 255).toFixed(3),
      };
    } catch {
      // ignore
    }
  }

  return { r: 15, g: 23, b: 42, a: 1 };
}

/**
 * Alpha-blends a foreground RGBA color onto an opaque RGB background
 */
function blendOntoBg(fg: RgbaColor, bg: { r: number; g: number; b: number }, extraOpacity = 1): { r: number; g: number; b: number } {
  const alpha = Math.min(1, Math.max(0, fg.a * extraOpacity));
  return {
    r: Math.round(fg.r * alpha + bg.r * (1 - alpha)),
    g: Math.round(fg.g * alpha + bg.g * (1 - alpha)),
    b: Math.round(fg.b * alpha + bg.b * (1 - alpha)),
  };
}

/**
 * Sets PDF opacity state (GState) safely
 */
function setPdfOpacity(pdf: jsPDF, fillAlpha: number, strokeAlpha = fillAlpha) {
  try {
    const GStateCtor = (pdf as any).GState;
    if (GStateCtor) {
      pdf.setGState(
        new GStateCtor({
          opacity: Math.min(1, Math.max(0, +fillAlpha.toFixed(3))),
          'stroke-opacity': Math.min(1, Math.max(0, +strokeAlpha.toFixed(3))),
        })
      );
    }
  } catch {
    // Fallback if GState not supported
  }
}

/**
 * Extracts color stops from a CSS linear/radial gradient string
 */
function extractGradientColors(gradientCss: string): RgbaColor[] {
  if (!gradientCss || !gradientCss.includes('gradient')) return [];
  const colorRegex =
    /(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)|oklch\([^)]+\)|color\([^)]+\))/g;
  const matches = gradientCss.match(colorRegex) || [];
  const stops: RgbaColor[] = [];
  for (const m of matches) {
    const c = parseCssColor(m);
    stops.push(c);
  }
  return stops;
}

/**
 * Draws a smooth vector gradient inside a rectangle using thin vector bands
 */
function drawVectorGradientRect(
  pdf: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  stops: RgbaColor[],
  baseBg: { r: number; g: number; b: number },
  opacity = 1
) {
  if (stops.length === 0 || w <= 0 || h <= 0) return;
  if (stops.length === 1) {
    const c = stops[0];
    const alpha = c.a * opacity;
    if (alpha <= 0.01) return;
    setPdfOpacity(pdf, alpha);
    pdf.setFillColor(c.r, c.g, c.b);
    pdf.rect(x, y, w, h, 'F');
    setPdfOpacity(pdf, 1, 1);
    return;
  }

  const steps = Math.min(40, Math.max(16, Math.round(h / 12)));
  const sliceH = h / steps;

  for (let i = 0; i < steps; i++) {
    const t = i / Math.max(1, steps - 1);
    const scaled = t * (stops.length - 1);
    const idx = Math.min(stops.length - 2, Math.floor(scaled));
    const localT = scaled - idx;
    const c1 = stops[idx];
    const c2 = stops[idx + 1];

    const r = Math.round(c1.r + (c2.r - c1.r) * localT);
    const g = Math.round(c1.g + (c2.g - c1.g) * localT);
    const b = Math.round(c1.b + (c2.b - c1.b) * localT);
    const a = (c1.a + (c2.a - c1.a) * localT) * opacity;

    if (a <= 0.01) continue;
    if (a < 0.98) {
      setPdfOpacity(pdf, a);
      pdf.setFillColor(r, g, b);
    } else {
      const blended = blendOntoBg({ r, g, b, a: 1 }, baseBg, 1);
      setPdfOpacity(pdf, 1);
      pdf.setFillColor(blended.r, blended.g, blended.b);
    }
    // Slight overlap (+0.35pt) prevents hairline seams between gradient bands
    pdf.rect(x, y + i * sliceH, w, sliceH + (i < steps - 1 ? 0.35 : 0), 'F');
  }
  setPdfOpacity(pdf, 1, 1);
}

/**
 * Sanitizes Unicode typography to clean WinAnsi / Latin-1 characters supported natively by standard PDF fonts
 */
function sanitizeVectorText(input: string): string {
  if (!input) return '';
  return input
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"')
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'")
    .replace(/[\u2014\u2015]/g, ' - ')
    .replace(/[\u2013\u2212]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/[\u2022\u2023\u25E6\u2043\u2219\u25AA\u25AB\u25B8\u25B9\u25C6\u25C7\u2726\u2727\u2756]/g, '\u00B7')
    .replace(/[\u2192\u2794\u279C\u27A1\u27F6]/g, '->')
    .replace(/[\u2190\u27F5]/g, '<-')
    .replace(/[\u2713\u2714\u2611]/g, 'v')
    .replace(/[\u2605\u2606\u2729\u272A]/g, '*')
    .replace(/\u20AC/g, 'EUR ')
    .replace(/\u20B9/g, 'Rs.')
    .replace(/\u00A0/g, ' ')
    // Strip zero-width characters and non-Latin1 emojis that standard PDF fonts cannot encode
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, '');
}

/**
 * Applies CSS text-transform rules to raw DOM text
 */
function applyTextTransform(text: string, transform: string): string {
  if (!transform || transform === 'none') return text;
  if (transform === 'uppercase') return text.toUpperCase();
  if (transform === 'lowercase') return text.toLowerCase();
  if (transform === 'capitalize') {
    return text.replace(/\b\w/g, (ch) => ch.toUpperCase());
  }
  return text;
}

/**
 * Maps CSS font-family, font-weight, and font-style to standard native PDF vector fonts
 */
function resolvePdfFont(
  fontFamily: string,
  fontWeight: string,
  fontStyle: string
): { family: 'helvetica' | 'times' | 'courier'; style: 'normal' | 'bold' | 'italic' | 'bolditalic' } {
  const famLower = (fontFamily || '').toLowerCase();
  let family: 'helvetica' | 'times' | 'courier' = 'helvetica';

  if (
    famLower.includes('serif') &&
    !famLower.includes('sans-serif')
  ) {
    family = 'times';
  } else if (
    famLower.includes('georgia') ||
    famLower.includes('playfair') ||
    famLower.includes('garamond') ||
    famLower.includes('times') ||
    famLower.includes('cormorant')
  ) {
    family = 'times';
  } else if (
    famLower.includes('mono') ||
    famLower.includes('courier') ||
    famLower.includes('jetbrains') ||
    famLower.includes('fira') ||
    famLower.includes('consolas')
  ) {
    family = 'courier';
  }

  const weightNum = parseInt(fontWeight, 10);
  const isBold =
    fontWeight === 'bold' ||
    fontWeight === 'bolder' ||
    (!isNaN(weightNum) && weightNum >= 600);
  const isItalic = fontStyle === 'italic' || fontStyle === 'oblique';

  const style: 'normal' | 'bold' | 'italic' | 'bolditalic' =
    isBold && isItalic
      ? 'bolditalic'
      : isBold
      ? 'bold'
      : isItalic
      ? 'italic'
      : 'normal';

  return { family, style };
}

/**
 * Computes effective cumulative opacity of an element up to the stage root
 */
function getEffectiveOpacity(el: Element | null, stopAt: Element): number {
  let opacity = 1;
  let curr: Element | null = el;
  while (curr && curr !== stopAt && curr !== document.body) {
    const style = window.getComputedStyle(curr);
    const op = parseFloat(style.opacity || '1');
    if (!isNaN(op)) opacity *= op;
    curr = curr.parentElement;
  }
  return Math.min(1, Math.max(0, opacity));
}

/**
 * Checks whether an element or any ancestor is hidden
 */
function isElementVisible(el: Element | null, stopAt: Element): boolean {
  let curr: Element | null = el;
  while (curr && curr !== stopAt && curr !== document.body) {
    const style = window.getComputedStyle(curr);
    if (
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      parseFloat(style.opacity || '1') <= 0.01
    ) {
      return false;
    }
    curr = curr.parentElement;
  }
  return true;
}

/**
 * Renders an <img> element onto an offscreen canvas respecting CSS object-fit and border-radius,
 * returning a cropped DataURL ready for pdf.addImage()
 */
async function rasterizeImgElement(
  imgEl: HTMLImageElement,
  boxWidthPx: number,
  boxHeightPx: number,
  computedStyle: CSSStyleDeclaration,
  effectiveOpacity: number,
  fallbackBgColor: { r: number; g: number; b: number }
): Promise<{ dataUrl: string; format: 'JPEG' | 'PNG' } | null> {
  if (!imgEl.src || boxWidthPx < 2 || boxHeightPx < 2) return null;

  const natW = imgEl.naturalWidth || imgEl.width || boxWidthPx;
  const natH = imgEl.naturalHeight || imgEl.height || boxHeightPx;
  if (natW <= 0 || natH <= 0) return null;

  const dpr = 2.5;
  const cw = Math.max(4, Math.round(boxWidthPx * dpr));
  const ch = Math.max(4, Math.round(boxHeightPx * dpr));

  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const borderRadiusPx = parseFloat(computedStyle.borderTopLeftRadius || '0') || 0;
  const hasRoundMask = borderRadiusPx > 1;
  const isSemiTransparent = effectiveOpacity < 0.98;

  // If image is semi-transparent (e.g., atmospheric background cover photo), composite over base background
  if (isSemiTransparent && !hasRoundMask) {
    ctx.fillStyle = `rgb(${fallbackBgColor.r}, ${fallbackBgColor.g}, ${fallbackBgColor.b})`;
    ctx.fillRect(0, 0, cw, ch);
  }

  if (hasRoundMask) {
    const r = Math.min(cw / 2, ch / 2, borderRadiusPx * dpr);
    ctx.beginPath();
    ctx.roundRect(0, 0, cw, ch, r);
    ctx.clip();
  }

  ctx.globalAlpha = effectiveOpacity;

  const objectFit = computedStyle.objectFit || 'fill';
  let dx = 0;
  let dy = 0;
  let dw = cw;
  let dh = ch;

  if (objectFit === 'cover') {
    const scale = Math.max(cw / natW, ch / natH);
    dw = natW * scale;
    dh = natH * scale;
    dx = (cw - dw) / 2;
    dy = (ch - dh) / 2;
  } else if (objectFit === 'contain' || objectFit === 'scale-down') {
    const scale = Math.min(cw / natW, ch / natH);
    dw = natW * scale;
    dh = natH * scale;
    dx = (cw - dw) / 2;
    dy = (ch - dh) / 2;
  }

  try {
    ctx.drawImage(imgEl, dx, dy, dw, dh);
    if (hasRoundMask || objectFit === 'contain') {
      return { dataUrl: canvas.toDataURL('image/png'), format: 'PNG' };
    }
    return { dataUrl: canvas.toDataURL('image/jpeg', 0.92), format: 'JPEG' };
  } catch {
    return null;
  }
}

/**
 * Renders an inline <svg> icon (e.g., Lucide icon) to a crisp transparent high-DPI PNG DataURL
 */
async function rasterizeSvgElement(
  svgEl: SVGSVGElement,
  boxWidthPx: number,
  boxHeightPx: number,
  computedStyle: CSSStyleDeclaration,
  effectiveOpacity: number
): Promise<string | null> {
  if (boxWidthPx < 2 || boxHeightPx < 2) return null;

  try {
    const clone = svgEl.cloneNode(true) as SVGSVGElement;
    const color = computedStyle.color || '#0f172a';
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width', `${boxWidthPx * 4}`);
    clone.setAttribute('height', `${boxHeightPx * 4}`);
    clone.style.color = color;

    // Replace currentColor with explicit resolved CSS color so standalone SVG blob renders accurately
    const serialized = new XMLSerializer()
      .serializeToString(clone)
      .replace(/currentColor/g, color);

    const svgBlob = new Blob([serialized], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject();
        img.src = url;
      });

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(8, Math.round(boxWidthPx * 4));
      canvas.height = Math.max(8, Math.round(boxHeightPx * 4));
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.globalAlpha = effectiveOpacity;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/png');
    } finally {
      URL.revokeObjectURL(url);
    }
  } catch {
    return null;
  }
}

/**
 * Compiles a live rendered Page DOM tree into 100% Native Vector PDF instructions:
 * - Vector backgrounds, gradients, cards, borders, dividers, and circle geometry
 * - Embedded images (<img>) and crisp icons (<svg>) at their exact bounding boxes
 * - Real selectable, searchable, copyable vector text (pdf.text) at exact line coordinates
 * - Live clickable PDF links (pdf.link) for URLs, emails, buttons, and Table of Contents items
 */
async function compileDomPageToVectorPdf(
  pdf: jsPDF,
  pageNode: HTMLElement,
  page: PageContent,
  pageNumber: number,
  totalPages: number,
  theme: CoverTheme,
  stageWidth: number,
  stageHeight: number,
  pdfPageWidth: number,
  pdfPageHeight: number
): Promise<void> {
  const stageRect = pageNode.getBoundingClientRect();
  const scaleX = pdfPageWidth / stageWidth;
  const scaleY = pdfPageHeight / stageHeight;

  const isCover = page.template === 'cover-front' || page.template === 'cover-back';

  // 1. Base Page Vector Background
  const baseBgCss = isCover ? '#0b241c' : theme.pageBg || '#ffffff';
  const baseBgRgba = parseCssColor(baseBgCss);
  const baseBg = {
    r: baseBgRgba.a > 0 ? baseBgRgba.r : 255,
    g: baseBgRgba.a > 0 ? baseBgRgba.g : 255,
    b: baseBgRgba.a > 0 ? baseBgRgba.b : 255,
  };

  pdf.setFillColor(baseBg.r, baseBg.g, baseBg.b);
  pdf.rect(0, 0, pdfPageWidth, pdfPageHeight, 'F');

  if (isCover && theme.bgGradient) {
    const coverStops = extractGradientColors(theme.bgGradient);
    if (coverStops.length > 0) {
      drawVectorGradientRect(pdf, 0, 0, pdfPageWidth, pdfPageHeight, coverStops, baseBg, 1);
    }
  }

  // 2. Walk all visible HTMLElements in paint order for vector boxes, borders, barcodes, images & SVGs
  const allElements = Array.from(pageNode.querySelectorAll('*'));
  const linkAnnotations: Array<{
    x: number;
    y: number;
    w: number;
    h: number;
    url?: string;
    targetPage?: number;
  }> = [];

  for (const el of allElements) {
    if (!isElementVisible(el, pageNode)) continue;

    // Skip the subtle circle wrapper div since we draw it mathematically as a true vector circle
    if (el.getAttribute('data-pdf-ornament-circle') === 'true') {
      continue;
    }

    // Skip internal elements of an <svg> (the <svg> root itself handles the icon)
    if (el.tagName.toLowerCase() !== 'svg' && el.closest('svg')) {
      continue;
    }

    const rect = el.getBoundingClientRect();
    const rawX = (rect.left - stageRect.left) * scaleX;
    const rawY = (rect.top - stageRect.top) * scaleY;
    const rawW = rect.width * scaleX;
    const rawH = rect.height * scaleY;

    if (rawW < 0.5 || rawH < 0.5) continue;

    // Clip coordinates to page bounds
    const x = Math.max(0, rawX);
    const y = Math.max(0, rawY);
    const w = Math.min(pdfPageWidth - x, rawW - (x - rawX));
    const h = Math.min(pdfPageHeight - y, rawH - (y - rawY));
    if (w <= 0.5 || h <= 0.5) continue;

    const style = window.getComputedStyle(el);
    const effOpacity = getEffectiveOpacity(el, pageNode);
    const tagName = el.tagName.toLowerCase();

    // Collect interactive link regions (<a>, [data-pdf-link], [data-goto-page])
    if (tagName === 'a') {
      const href = (el as HTMLAnchorElement).getAttribute('href') || el.getAttribute('data-pdf-link');
      if (href && href.trim() && !href.startsWith('javascript:')) {
        linkAnnotations.push({ x, y, w, h, url: href.trim() });
      }
    } else if (el.hasAttribute('data-pdf-link')) {
      const linkUrl = el.getAttribute('data-pdf-link')?.trim();
      if (linkUrl) {
        linkAnnotations.push({ x, y, w, h, url: linkUrl });
      }
    }

    if (el.hasAttribute('data-goto-page')) {
      const rawTarget = parseInt(el.getAttribute('data-goto-page') || '1', 10);
      // Also check if the row text explicitly specifies "Page N"
      const textMatch = (el.textContent || '').match(/page\s+(\d+)/i);
      const parsedPage = textMatch ? parseInt(textMatch[1], 10) : rawTarget;
      const validPage = Math.min(totalPages, Math.max(1, isNaN(parsedPage) ? 1 : parsedPage));
      linkAnnotations.push({ x, y, w, h, targetPage: validPage });
    }

    // Handle <svg> icons
    if (tagName === 'svg') {
      const svgPng = await rasterizeSvgElement(
        el as SVGSVGElement,
        rect.width,
        rect.height,
        style,
        effOpacity
      );
      if (svgPng) {
        try {
          pdf.addImage(svgPng, 'PNG', rawX, rawY, rawW, rawH, undefined, 'FAST');
        } catch {
          // ignore icon error
        }
      }
      continue;
    }

    // Handle <img> elements
    if (tagName === 'img') {
      const imgResult = await rasterizeImgElement(
        el as HTMLImageElement,
        rect.width,
        rect.height,
        style,
        effOpacity,
        baseBg
      );
      if (imgResult) {
        try {
          pdf.addImage(
            imgResult.dataUrl,
            imgResult.format,
            rawX,
            rawY,
            rawW,
            rawH,
            undefined,
            'FAST'
          );
        } catch {
          // ignore image error
        }
      }
      continue;
    }

    // Handle CSS backgrounds & gradients on HTML containers
    const bgColor = parseCssColor(style.backgroundColor);
    const bgImage = style.backgroundImage || '';
    const borderRadiusPx = parseFloat(style.borderTopLeftRadius || '0') || 0;
    const radiusPt = Math.min(w / 2, h / 2, borderRadiusPx * scaleX);

    // Special case: procedural barcode repeating-linear-gradient on Back Cover
    if (bgImage.includes('repeating-linear-gradient')) {
      pdf.setFillColor(0, 0, 0);
      let bx = x;
      const pattern = [1.8, 1.5, 0.9, 1.8, 2.6, 1.4, 0.9, 2.2];
      let pIdx = 0;
      while (bx < x + w - 1) {
        const barW = Math.min(pattern[pIdx % pattern.length], x + w - bx);
        pdf.rect(bx, y, barW, h, 'F');
        bx += barW + pattern[(pIdx + 1) % pattern.length];
        pIdx += 2;
      }
    } else if (bgImage.includes('gradient(')) {
      const gradStops = extractGradientColors(bgImage);
      if (gradStops.length > 0) {
        drawVectorGradientRect(pdf, x, y, w, h, gradStops, baseBg, effOpacity);
      }
    } else if (bgColor.a * effOpacity > 0.01) {
      const finalAlpha = Math.min(1, Math.max(0, bgColor.a * effOpacity));
      setPdfOpacity(pdf, finalAlpha);
      pdf.setFillColor(bgColor.r, bgColor.g, bgColor.b);

      if (radiusPt >= Math.min(w, h) * 0.48 && Math.abs(w - h) < 3) {
        pdf.circle(x + w / 2, y + h / 2, Math.min(w, h) / 2, 'F');
      } else if (radiusPt > 0.6) {
        pdf.roundedRect(x, y, w, h, radiusPt, radiusPt, 'F');
      } else {
        pdf.rect(x, y, w, h, 'F');
      }
      setPdfOpacity(pdf, 1, 1);
    }

    // Handle CSS Borders (4-sided box border or individual side lines like border-b, border-t, border-l)
    const bt = parseFloat(style.borderTopWidth || '0') || 0;
    const br = parseFloat(style.borderRightWidth || '0') || 0;
    const bb = parseFloat(style.borderBottomWidth || '0') || 0;
    const bl = parseFloat(style.borderLeftWidth || '0') || 0;

    if (bt > 0 || br > 0 || bb > 0 || bl > 0) {
      const isUniformBoxBorder =
        bt > 0 &&
        Math.abs(bt - br) < 0.5 &&
        Math.abs(bt - bb) < 0.5 &&
        Math.abs(bt - bl) < 0.5 &&
        style.borderTopStyle !== 'none';

      if (isUniformBoxBorder) {
        const bColor = parseCssColor(style.borderTopColor);
        const strokeAlpha = Math.min(1, Math.max(0, bColor.a * effOpacity));
        if (strokeAlpha > 0.01) {
          setPdfOpacity(pdf, 1, strokeAlpha);
          pdf.setDrawColor(bColor.r, bColor.g, bColor.b);
          pdf.setLineWidth(Math.max(0.4, bt * scaleX * 0.75));

          if (style.borderTopStyle === 'dashed') {
            pdf.setLineDashPattern([3, 2.5], 0);
          } else if (style.borderTopStyle === 'dotted') {
            pdf.setLineDashPattern([1, 1.5], 0);
          } else {
            pdf.setLineDashPattern([], 0);
          }

          if (radiusPt >= Math.min(w, h) * 0.48 && Math.abs(w - h) < 3) {
            pdf.circle(x + w / 2, y + h / 2, Math.min(w, h) / 2, 'S');
          } else if (radiusPt > 0.6) {
            pdf.roundedRect(x, y, w, h, radiusPt, radiusPt, 'S');
          } else {
            pdf.rect(x, y, w, h, 'S');
          }
          pdf.setLineDashPattern([], 0);
          setPdfOpacity(pdf, 1, 1);
        }
      } else {
        // Individual side borders (e.g. header bottom line, blockquote left bar, corner ornaments)
        pdf.setLineDashPattern([], 0);
        if (bt > 0 && style.borderTopStyle !== 'none') {
          const c = parseCssColor(style.borderTopColor);
          if (c.a * effOpacity > 0.01) {
            setPdfOpacity(pdf, 1, c.a * effOpacity);
            pdf.setDrawColor(c.r, c.g, c.b);
            pdf.setLineWidth(Math.max(0.4, bt * scaleY * 0.75));
            pdf.line(x, y, x + w, y);
          }
        }
        if (bb > 0 && style.borderBottomStyle !== 'none') {
          const c = parseCssColor(style.borderBottomColor);
          if (c.a * effOpacity > 0.01) {
            setPdfOpacity(pdf, 1, c.a * effOpacity);
            pdf.setDrawColor(c.r, c.g, c.b);
            pdf.setLineWidth(Math.max(0.4, bb * scaleY * 0.75));
            pdf.line(x, y + h, x + w, y + h);
          }
        }
        if (bl > 0 && style.borderLeftStyle !== 'none') {
          const c = parseCssColor(style.borderLeftColor);
          if (c.a * effOpacity > 0.01) {
            setPdfOpacity(pdf, 1, c.a * effOpacity);
            pdf.setDrawColor(c.r, c.g, c.b);
            pdf.setLineWidth(Math.max(0.4, bl * scaleX * 0.75));
            pdf.line(x, y, x, y + h);
          }
        }
        if (br > 0 && style.borderRightStyle !== 'none') {
          const c = parseCssColor(style.borderRightColor);
          if (c.a * effOpacity > 0.01) {
            setPdfOpacity(pdf, 1, c.a * effOpacity);
            pdf.setDrawColor(c.r, c.g, c.b);
            pdf.setLineWidth(Math.max(0.4, br * scaleX * 0.75));
            pdf.line(x + w, y, x + w, y + h);
          }
        }
        setPdfOpacity(pdf, 1, 1);
      }
    }
  }

  // 3. Draw Subtle Interior Page Architectural Vector Circle Ornament (Left page = Top, Right page = Bottom-Right)
  if (!isCover) {
    const isLeftPage = pageNumber % 2 === 0;
    const isDarkPageBg = /^#(0|1|2)/i.test((theme.pageBg || '').trim());
    setPdfOpacity(pdf, 1, isDarkPageBg ? 0.22 : 0.25);
    if (isDarkPageBg) {
      pdf.setDrawColor(255, 255, 255);
    } else {
      pdf.setDrawColor(15, 23, 42);
    }
    pdf.setLineWidth(0.75);
    if (isLeftPage) {
      const r = (pdfPageWidth * 0.56) / 2;
      const cx = pdfPageWidth - pdfPageWidth * 0.1 - r;
      const cy = -pdfPageHeight * 0.16 + r;
      pdf.circle(cx, cy, r, 'S');
    } else {
      const r = (pdfPageWidth * 0.58) / 2;
      const cx = pdfPageWidth + pdfPageWidth * 0.12 - r;
      const cy = pdfPageHeight + pdfPageHeight * 0.18 - r;
      pdf.circle(cx, cy, r, 'S');
    }
    setPdfOpacity(pdf, 1, 1);
  }

  // 4. Walk all visible TEXT_NODEs and emit 100% Native Selectable Vector Text (pdf.text)
  const walker = document.createTreeWalker(pageNode, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  let currentNode: Node | null = walker.nextNode();

  while (currentNode) {
    const textNode = currentNode as Text;
    currentNode = walker.nextNode();

    const rawValue = textNode.nodeValue || '';
    if (!rawValue.trim()) continue;

    const parentEl = textNode.parentElement;
    if (!parentEl || !isElementVisible(parentEl, pageNode)) continue;
    if (parentEl.closest('svg, script, style')) continue;

    const style = window.getComputedStyle(parentEl);
    const fontSizePx = parseFloat(style.fontSize || '12') || 12;
    const fontSizePt = Math.max(5.5, fontSizePx * scaleX);
    const { family, style: fontStyle } = resolvePdfFont(
      style.fontFamily,
      style.fontWeight,
      style.fontStyle
    );

    const textColor = parseCssColor(style.color);
    const effOpacity = getEffectiveOpacity(parentEl, pageNode);
    const finalTextAlpha = Math.min(1, Math.max(0.05, textColor.a * effOpacity));

    const letterSpacingPx = parseFloat(style.letterSpacing || '0') || 0;
    const charSpacePt =
      letterSpacingPx > 0.2 ? Math.min(4, letterSpacingPx * scaleX * 0.85) : 0;

    // Group word tokens in this textNode into visual lines using Range.getBoundingClientRect()
    const wordRegex = /\S+/g;
    let match: RegExpExecArray | null;

    interface VisualTextSegment {
      text: string;
      left: number;
      top: number;
      right: number;
      bottom: number;
    }

    const segments: VisualTextSegment[] = [];
    const lineThreshold = Math.max(3.5, fontSizePx * 0.45);
    const maxWordGap = Math.max(fontSizePx * 1.6, 18);

    while ((match = wordRegex.exec(rawValue)) !== null) {
      const startIdx = match.index;
      const endIdx = startIdx + match[0].length;
      range.setStart(textNode, startIdx);
      range.setEnd(textNode, endIdx);
      const wordRect = range.getBoundingClientRect();
      if (wordRect.width <= 0 || wordRect.height <= 0) continue;

      const transformedWord = sanitizeVectorText(
        applyTextTransform(match[0], style.textTransform)
      );
      if (!transformedWord) continue;

      const lastSeg = segments[segments.length - 1];
      if (
        lastSeg &&
        Math.abs(wordRect.top - lastSeg.top) <= lineThreshold &&
        wordRect.left >= lastSeg.left - 2 &&
        wordRect.left - lastSeg.right <= maxWordGap
      ) {
        lastSeg.text += ' ' + transformedWord;
        lastSeg.right = Math.max(lastSeg.right, wordRect.right);
        lastSeg.bottom = Math.max(lastSeg.bottom, wordRect.bottom);
      } else {
        segments.push({
          text: transformedWord,
          left: wordRect.left,
          top: wordRect.top,
          right: wordRect.right,
          bottom: wordRect.bottom,
        });
      }
    }

    if (segments.length === 0) continue;

    pdf.setFont(family, fontStyle);
    pdf.setFontSize(fontSizePt);
    pdf.setTextColor(textColor.r, textColor.g, textColor.b);
    setPdfOpacity(pdf, finalTextAlpha, finalTextAlpha);

    for (const seg of segments) {
      const cleanLine = seg.text.trim();
      if (!cleanLine) continue;

      const xPt = (seg.left - stageRect.left) * scaleX;
      const boxHeightPt = (seg.bottom - seg.top) * scaleY;
      // Compute accurate baseline position inside the DOM line box
      const baselineOffsetPt =
        boxHeightPt > fontSizePt
          ? (boxHeightPt - fontSizePt) * 0.5 + fontSizePt * 0.8
          : boxHeightPt * 0.78;
      const yPt = (seg.top - stageRect.top) * scaleY + baselineOffsetPt;

      if (xPt < -20 || xPt > pdfPageWidth + 20 || yPt < -20 || yPt > pdfPageHeight + 20) {
        continue;
      }

      if (typeof (pdf as any).setCharSpace === 'function') {
        (pdf as any).setCharSpace(charSpacePt);
      }

      pdf.text(cleanLine, xPt, yPt);

      if (typeof (pdf as any).setCharSpace === 'function') {
        (pdf as any).setCharSpace(0);
      }

      // Auto-detect plain-text URLs or emails in this segment and attach a clickable PDF link
      const urlMatch = cleanLine.match(
        /(https?:\/\/[^\s,)]+|www\.[^\s,)]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i
      );
      if (urlMatch) {
        const rawTarget = urlMatch[1];
        const normalizedUrl = rawTarget.includes('@') && !rawTarget.startsWith('http')
          ? `mailto:${rawTarget}`
          : rawTarget.startsWith('www.')
          ? `https://${rawTarget}`
          : rawTarget;
        linkAnnotations.push({
          x: xPt,
          y: (seg.top - stageRect.top) * scaleY,
          w: Math.max(24, (seg.right - seg.left) * scaleX),
          h: Math.max(10, boxHeightPt),
          url: normalizedUrl,
        });
      }
    }

    setPdfOpacity(pdf, 1, 1);
  }

  // 5. Emit all interactive PDF link annotations (URLs, CTA buttons, and internal TOC page jumps)
  for (const lnk of linkAnnotations) {
    try {
      if (lnk.url) {
        const fullUrl =
          lnk.url.startsWith('http://') ||
          lnk.url.startsWith('https://') ||
          lnk.url.startsWith('mailto:') ||
          lnk.url.startsWith('tel:')
            ? lnk.url
            : `https://${lnk.url.replace(/^\/+/, '')}`;
        pdf.link(lnk.x, lnk.y, lnk.w, lnk.h, { url: fullUrl });
      } else if (typeof lnk.targetPage === 'number') {
        pdf.link(lnk.x, lnk.y, lnk.w, lnk.h, { pageNumber: lnk.targetPage });
      }
    } catch {
      // ignore invalid link annotation
    }
  }
}

/**
 * Generates and downloads a complete multi-page A4 Native Vector Digital PDF
 * (selectable/searchable text + clickable links + vector shapes + embedded images)
 * for all pages in the BookProject.
 */
export async function exportBookToPdf(
  book: BookProject,
  onProgress?: (progress: PdfExportProgress) => void
): Promise<void> {
  const totalPages = book.pages.length;
  if (totalPages === 0) return;

  onProgress?.({
    currentPage: 0,
    totalPages,
    statusText: 'Preparing vector typography, links & images...',
  });

  // Convert external images to Base64 data URLs to prevent CORS canvas issues
  const safeBook = await convertBookImagesToBase64(book);
  const theme = COVER_THEMES[safeBook.themeId] || COVER_THEMES['emerald-gold'];

  // Create A4 portrait PDF in points (595.28 x 841.89 pt)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
    compress: true,
    putOnlyUsedFonts: true,
  });

  // Set native PDF document metadata
  pdf.setProperties({
    title: safeBook.title || 'Digital Flipbook',
    subject: safeBook.subtitle || 'Interactive Digital Publication',
    author: safeBook.author || 'Flipbook Studio',
    creator: `${safeBook.publisher || 'Flipbook Studio'} (Vector Digital PDF Engine)`,
    keywords: 'flipbook, vector pdf, digital book, publication',
  });

  const pdfPageWidth = pdf.internal.pageSize.getWidth();
  const pdfPageHeight = pdf.internal.pageSize.getHeight();

  // Create off-screen DOM staging container matching A4 aspect ratio (480 x 679 px)
  const stageWidth = 480;
  const stageHeight = 679;
  const hostEl = document.createElement('div');
  hostEl.style.position = 'fixed';
  hostEl.style.left = '-99999px';
  hostEl.style.top = '0';
  hostEl.style.width = `${stageWidth}px`;
  hostEl.style.height = `${stageHeight}px`;
  hostEl.style.overflow = 'hidden';
  hostEl.style.background = '#ffffff';
  hostEl.style.zIndex = '-1';
  document.body.appendChild(hostEl);

  try {
    for (let i = 0; i < totalPages; i++) {
      const page = safeBook.pages[i];
      const pageNumber = i + 1;

      onProgress?.({
        currentPage: pageNumber,
        totalPages,
        statusText: `Compiling Vector Page ${pageNumber} of ${totalPages}...`,
      });

      if (i > 0) {
        pdf.addPage('a4', 'portrait');
      }

      // Render exact PageRenderer inside the A4 container so we can extract exact layout & typography
      const pageNode = document.createElement('div');
      pageNode.style.width = `${stageWidth}px`;
      pageNode.style.height = `${stageHeight}px`;
      pageNode.style.position = 'relative';
      pageNode.style.overflow = 'hidden';
      pageNode.style.backgroundColor =
        page.template === 'cover-front' || page.template === 'cover-back'
          ? '#0b241c'
          : theme.pageBg || '#ffffff';

      hostEl.innerHTML = '';
      hostEl.appendChild(pageNode);

      const pageRoot = createRoot(pageNode);
      pageRoot.render(
        React.createElement(
          'div',
          {
            style: {
              width: `${stageWidth}px`,
              height: `${stageHeight}px`,
              position: 'relative',
              overflow: 'hidden',
              background:
                page.template === 'cover-front' || page.template === 'cover-back'
                  ? theme.bgGradient
                  : theme.pageBg || '#ffffff',
              color:
                page.template === 'cover-front' || page.template === 'cover-back'
                  ? '#ffffff'
                  : theme.pageTextColor || '#0f172a',
            },
          },
          React.createElement(PageRenderer, {
            page,
            theme,
            bookTitle: safeBook.title,
            bookAuthor: safeBook.author,
            pageNumber,
            coverImageUrl: safeBook.coverImageUrl,
          })
        )
      );

      // Wait for React render + any embedded images inside pageNode to finish loading
      await new Promise((r) => setTimeout(r, 90));
      const imgs = Array.from(pageNode.querySelectorAll('img'));
      await Promise.all(
        imgs.map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete) return resolve();
              img.onload = () => resolve();
              img.onerror = () => resolve();
            })
        )
      );

      // Compile the live DOM tree into native vector PDF primitives (text, links, shapes, images)
      await compileDomPageToVectorPdf(
        pdf,
        pageNode,
        page,
        pageNumber,
        totalPages,
        theme,
        stageWidth,
        stageHeight,
        pdfPageWidth,
        pdfPageHeight
      );

      // Apply Free Starter clickable watermark or Pro Custom Brand link
      const isProUser = getLicenseInfo().tier === 'pro';
      if (!isProUser) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7.5);
        pdf.setTextColor(16, 185, 129);
        const wmText = 'Created with FlipApp 3D — Get Lifetime Pro';
        const wmW = pdf.getTextWidth(wmText);
        const wmX = (pdfPageWidth - wmW) / 2;
        const wmY = pdfPageHeight - 8;
        pdf.text(wmText, wmX, wmY);
        pdf.link(wmX - 4, wmY - 8, wmW + 8, 12, {
          url: 'https://tabrej6.gumroad.com/l/3d-flipbook-pro',
        });
      } else if (safeBook.customBrandName) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7.5);
        pdf.setTextColor(100, 116, 139);
        const brandText = safeBook.customBrandName;
        const brandW = pdf.getTextWidth(brandText);
        const brandX = (pdfPageWidth - brandW) / 2;
        const brandY = pdfPageHeight - 8;
        pdf.text(brandText, brandX, brandY);
        if (safeBook.customBrandUrl) {
          pdf.link(brandX - 4, brandY - 8, brandW + 8, 12, {
            url: safeBook.customBrandUrl,
          });
        }
      }

      pageRoot.unmount();
    }

    onProgress?.({
      currentPage: totalPages,
      totalPages,
      statusText: 'Saving Vector Digital PDF...',
    });

    const fileName = `${
      safeBook.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'flipbook'
    }.pdf`;
    pdf.save(fileName);
    recordExportHtml();
  } finally {
    if (hostEl.parentNode) {
      hostEl.parentNode.removeChild(hostEl);
    }
  }
}
