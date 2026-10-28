import React from 'react';
import { PageBlock } from '../types/flipbook';
import {
  Layers,
  Sparkles,
  Download,
  CheckCircle2,
  Bookmark,
  Quote as QuoteIcon,
  User,
  Info,
  ArrowRight,
  Star,
  Shield,
  Smartphone,
  Zap,
  Globe,
  Sliders,
  Flame,
  LayoutGrid,
  Terminal,
  Cpu,
  Gauge,
  Wine,
  Camera,
  Compass,
  Crosshair,
  Feather,
  Check,
  MessageSquare,
  TrendingUp,
  Award,
} from 'lucide-react';

interface PageBlockRendererProps {
  block: PageBlock;
  themeAccentColor?: string;
  themeTextColor?: string;
  themePageBg?: string;
  isCover?: boolean;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Layers,
  Sparkles,
  Download,
  Star,
  Shield,
  Smartphone,
  Zap,
  Globe,
  Sliders,
  Flame,
  Bookmark,
  CheckCircle2,
  LayoutGrid,
  Terminal,
  Cpu,
  Gauge,
  Wine,
  Camera,
  Compass,
  Crosshair,
  Feather,
  MessageSquare,
  TrendingUp,
  Award,
};

export const PageBlockRenderer: React.FC<PageBlockRendererProps> = ({
  block,
  themeAccentColor = '#c9a84e',
  themeTextColor = '#0c241b',
  isCover = false,
}) => {
  const accent = themeAccentColor;
  const textColor = isCover ? '#ffffff' : themeTextColor;

  switch (block.type) {
    case 'chapter-header':
      return (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full border inline-block"
              style={{
                borderColor: `${accent}40`,
                backgroundColor: `${accent}15`,
                color: accent,
              }}
            >
              {block.chapterNumber || 'CHAPTER'}
            </span>
            {block.tag && (
              <span className="text-[10px] tracking-wider uppercase opacity-70 font-semibold">
                {block.tag}
              </span>
            )}
          </div>
          {block.title && (
            <h2
              className="text-xl sm:text-2xl font-bold tracking-tight font-serif"
              style={{ color: textColor }}
            >
              {block.title}
            </h2>
          )}
          <div
            className="w-12 h-0.5 mt-2.5 rounded-full"
            style={{ backgroundColor: accent }}
          />
        </div>
      );

    case 'heading-1':
      return (
        <h1
          className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-serif my-2 text-${block.align || 'left'}`}
          style={{ color: textColor, lineHeight: 1.18 }}
        >
          {block.title || 'Page Heading 1'}
        </h1>
      );

    case 'heading-2':
      return (
        <h2
          className={`text-lg sm:text-xl font-bold tracking-tight font-serif mt-3 mb-1.5 text-${block.align || 'left'}`}
          style={{ color: textColor }}
        >
          {block.title || 'Section Heading 2'}
        </h2>
      );

    case 'heading-3':
      return (
        <h3
          className={`text-sm sm:text-base font-bold tracking-normal mt-2.5 mb-1 text-${block.align || 'left'}`}
          style={{ color: textColor }}
        >
          {block.title || 'Sub-heading 3'}
        </h3>
      );

    case 'subtitle':
      return (
        <p
          className={`text-xs sm:text-sm font-medium italic opacity-75 mb-3 text-${block.align || 'left'}`}
          style={{ color: textColor }}
        >
          {block.subtitle || 'Descriptive lead subtitle text'}
        </p>
      );

    case 'paragraph':
      return (
        <p
          className={`text-xs sm:text-[13px] leading-relaxed mb-3 opacity-90 text-${block.align || 'left'}`}
          style={{ color: textColor, lineHeight: 1.6 }}
        >
          {block.paragraph1 || ''}
        </p>
      );

    case 'dropcap-paragraph': {
      const text = block.paragraph1 || '';
      const firstChar = text.charAt(0);
      const restText = text.slice(1);

      return (
        <div className="mb-3.5">
          <p
            className="text-xs sm:text-[13px] leading-relaxed opacity-90"
            style={{ color: textColor, lineHeight: 1.65 }}
          >
            {firstChar && (
              <span
                className="float-left text-3xl sm:text-4xl font-serif font-bold leading-none pr-2 pt-0.5 select-none"
                style={{ color: accent }}
              >
                {firstChar}
              </span>
            )}
            {restText}
          </p>
        </div>
      );
    }

    case 'two-column-text':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3.5">
          <p
            className="text-[11.5px] sm:text-xs leading-relaxed opacity-85"
            style={{ color: textColor, lineHeight: 1.55 }}
          >
            {block.paragraph1}
          </p>
          <p
            className="text-[11.5px] sm:text-xs leading-relaxed opacity-85"
            style={{ color: textColor, lineHeight: 1.55 }}
          >
            {block.paragraph2}
          </p>
        </div>
      );

    case 'quote-block':
      return (
        <div
          className="my-3.5 p-3 sm:p-4 rounded-r-lg border-l-3 relative bg-black/5 dark:bg-white/5"
          style={{ borderLeftColor: accent }}
        >
          <QuoteIcon
            className="w-4 h-4 mb-1.5 opacity-60"
            style={{ color: accent }}
          />
          <blockquote
            className="text-xs sm:text-sm font-serif italic leading-snug mb-2 font-medium"
            style={{ color: textColor }}
          >
            "{block.quoteText || 'Quotation text goes here.'}"
          </blockquote>
          {(block.quoteAuthor || block.quoteRole) && (
            <div className="flex items-center gap-1.5 text-[11px] font-semibold">
              <span style={{ color: accent }}>— {block.quoteAuthor}</span>
              {block.quoteRole && (
                <span className="opacity-60 font-normal">
                  ({block.quoteRole})
                </span>
              )}
            </div>
          )}
        </div>
      );

    case 'grid-cards':
      return (
        <div className="my-3">
          {block.title && (
            <h4
              className="text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: accent }}
            >
              {block.title}
            </h4>
          )}
          <div className="grid grid-cols-2 gap-2">
            {(block.items || []).map((card, idx) => (
              <div
                key={card.id || idx}
                className="p-2.5 rounded-lg border flex flex-col justify-between"
                style={{
                  borderColor: `${accent}30`,
                  backgroundColor: `${accent}08`,
                }}
              >
                <div>
                  {card.tag && (
                    <span
                      className="text-[9px] font-bold tracking-widest uppercase block mb-0.5"
                      style={{ color: accent }}
                    >
                      {card.tag}
                    </span>
                  )}
                  <div
                    className="text-xs font-bold tracking-tight mb-1"
                    style={{ color: textColor }}
                  >
                    {card.title}
                  </div>
                  <p
                    className="text-[10.5px] leading-tight opacity-75 line-clamp-3"
                    style={{ color: textColor }}
                  >
                    {card.description}
                  </p>
                </div>
                {card.highlight && (
                  <div
                    className="text-[10px] font-extrabold tracking-wide mt-2 pt-1 border-t border-black/5"
                    style={{ color: accent }}
                  >
                    {card.highlight}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );

    case 'feature-cards':
      return (
        <div className="my-3 space-y-2">
          {block.title && (
            <h4
              className="text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: accent }}
            >
              {block.title}
            </h4>
          )}
          {(block.items || []).map((feat, idx) => {
            const IconComponent =
              feat.icon && ICON_MAP[feat.icon] ? ICON_MAP[feat.icon] : Sparkles;
            return (
              <div
                key={feat.id || idx}
                className="flex items-start gap-2.5 p-2.5 rounded-lg border bg-black/[0.02]"
                style={{ borderColor: `${accent}25` }}
              >
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    backgroundColor: `${accent}20`,
                    color: accent,
                  }}
                >
                  <IconComponent className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-xs font-bold tracking-tight mb-0.5"
                    style={{ color: textColor }}
                  >
                    {feat.title}
                  </div>
                  <p
                    className="text-[11px] leading-snug opacity-75"
                    style={{ color: textColor }}
                  >
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      );

    case 'checklist-block':
      return (
        <div className="my-3 space-y-2">
          {(block.items || []).map((item, idx) => (
            <div key={item.id || idx} className="flex items-start gap-2">
              <CheckCircle2
                className="w-4 h-4 shrink-0 mt-0.5"
                style={{ color: accent }}
              />
              <div className="text-xs leading-snug" style={{ color: textColor }}>
                <strong className="font-semibold block sm:inline">
                  {item.title}{' '}
                </strong>
                <span className="opacity-80">{item.description}</span>
              </div>
            </div>
          ))}
        </div>
      );

    case 'numbered-steps':
      return (
        <div className="my-3 space-y-2.5">
          {(block.items || []).map((step, idx) => (
            <div key={step.id || idx} className="flex items-start gap-2.5">
              <span
                className="w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5"
                style={{
                  backgroundColor: accent,
                  color: '#ffffff',
                }}
              >
                {step.tag || `0${idx + 1}`}
              </span>
              <div className="flex-1 min-w-0">
                <div
                  className="text-xs font-bold tracking-tight"
                  style={{ color: textColor }}
                >
                  {step.title}
                </div>
                <div
                  className="text-[11px] opacity-75 leading-tight mt-0.5"
                  style={{ color: textColor }}
                >
                  {step.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      );

    case 'table-specs':
      return (
        <div
          className="my-3 rounded-lg border overflow-hidden text-xs"
          style={{ borderColor: `${accent}30` }}
        >
          {block.title && (
            <div
              className="px-3 py-1.5 font-bold uppercase tracking-wider text-[10px]"
              style={{
                backgroundColor: `${accent}20`,
                color: accent,
              }}
            >
              {block.title}
            </div>
          )}
          <div className="divide-y divide-black/5">
            {(block.items || []).map((row, idx) => (
              <div
                key={row.id || idx}
                className="flex items-center justify-between px-3 py-1.5 text-[11px]"
              >
                <span className="opacity-70 font-medium">{row.title}</span>
                <span className="font-semibold text-right" style={{ color: textColor }}>
                  {row.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'image-block': {
      const align = block.imageAlign || 'center';
      const size = block.imageSize || 'full';
      const widthClass =
        size === 'small' ? 'w-1/3' :
        size === 'medium' ? 'w-1/2' :
        size === 'large' ? 'w-3/4' : 'w-full';
      const alignClass =
        align === 'left' ? 'mr-auto ml-0' :
        align === 'right' ? 'ml-auto mr-0' : 'mx-auto';
      const floatClass =
        block.imageFloat === 'left' ? 'float-left mr-3.5 mb-2.5 max-w-[50%]' :
        block.imageFloat === 'right' ? 'float-right ml-3.5 mb-2.5 max-w-[50%]' : '';
      const fitMode = block.imageFit || 'contain';
      const heightStyle =
        block.imageHeight && block.imageHeight !== 'auto'
          ? { height: block.imageHeight }
          : { height: 'auto', maxHeight: '420px' };

      return (
        <div className={`my-2.5 ${floatClass}`}>
          {block.imageUrl ? (
            <div
              className={`rounded-lg overflow-hidden border shadow-xs ${widthClass} ${alignClass}`}
              style={{ borderColor: `${accent}35` }}
            >
              <img
                src={block.imageUrl}
                alt={block.imageCaption || 'Featured'}
                className={`w-full h-auto block select-none`}
                style={{
                  objectFit: fitMode,
                  ...heightStyle,
                }}
                referrerPolicy="no-referrer"
              />
              {block.imageCaption && (
                <div className="p-1.5 text-[9.5px] italic opacity-75 bg-black/[0.03] text-center border-t border-black/5">
                  {block.imageCaption}
                </div>
              )}
            </div>
          ) : (
            <div
              className={`rounded-lg border-2 border-dashed flex flex-col items-center justify-center p-3 text-center ${widthClass} ${alignClass}`}
              style={{ borderColor: `${accent}40`, color: accent, minHeight: '110px' }}
            >
              <span className="text-xs font-semibold">Image Placeholder</span>
              <span className="text-[10px] opacity-70">Add Image URL in Editor</span>
            </div>
          )}
        </div>
      );
    }

    case 'image-full-fit': {
      const align = block.imageAlign || 'center';
      const vAlign = block.imageVerticalAlign || 'middle';
      const size = block.imageSize || 'full';
      const widthStyle =
        size === 'small' ? '45%' :
        size === 'medium' ? '65%' :
        size === 'large' ? '85%' : '98%';
      const vAlignClass =
        vAlign === 'top' ? 'justify-start pt-2' :
        vAlign === 'bottom' ? 'justify-end pb-2' : 'justify-center';
      const hAlignClass =
        align === 'left' ? 'items-start' :
        align === 'right' ? 'items-end' : 'items-center';
      const fitMode = block.imageFit || 'contain';

      return (
        <div className={`w-full h-full flex flex-col ${hAlignClass} ${vAlignClass} p-[1%] overflow-hidden`}>
          {block.imageUrl ? (
            <div className={`relative flex flex-col ${hAlignClass} max-h-full`} style={{ width: widthStyle }}>
              <div
                className="relative flex items-center justify-center max-w-full max-h-full m-auto rounded-lg overflow-hidden shadow-xs border"
                style={{ borderColor: `${accent}30` }}
              >
                <img
                  src={block.imageUrl}
                  alt={block.imageCaption || 'Full Artwork'}
                  className="max-w-full max-h-full block rounded-lg select-none pointer-events-none"
                  referrerPolicy="no-referrer"
                  style={{
                    maxHeight: block.imageHeight && block.imageHeight !== 'auto' ? block.imageHeight : '98%',
                    maxWidth: '100%',
                    objectFit: fitMode,
                  }}
                />
              </div>
              {block.imageCaption && (
                <div className="mt-1 text-[9.5px] italic opacity-70 text-center font-serif truncate max-w-[90%] mx-auto">
                  {block.imageCaption}
                </div>
              )}
            </div>
          ) : (
            <div
              className="w-[96%] h-[96%] rounded-lg border-2 border-dashed flex flex-col items-center justify-center p-4 text-center m-auto"
              style={{ borderColor: `${accent}40`, color: accent }}
            >
              <span className="text-xs font-semibold">Image (Without Crop) Placeholder</span>
              <span className="text-[10px] opacity-70">Fits proportional scale with preserved aspect ratio</span>
            </div>
          )}
        </div>
      );
    }

    case 'image-text-split':
      return (
        <div className="my-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-center">
          {block.imageUrl && (
            <div
              className="rounded-md overflow-hidden border flex items-center justify-center"
              style={{ borderColor: `${accent}30` }}
            >
              <img
                src={block.imageUrl}
                alt={block.title || 'Image'}
                className="w-full h-auto max-h-36 object-contain block"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
          <div>
            {block.title && (
              <h4
                className="text-xs font-bold mb-1 font-serif"
                style={{ color: textColor }}
              >
                {block.title}
              </h4>
            )}
            <p
              className="text-[11px] leading-relaxed opacity-85"
              style={{ color: textColor }}
            >
              {block.paragraph1}
            </p>
          </div>
        </div>
      );

    case 'author-card':
      return (
        <div
          className="my-3 p-3 rounded-lg border bg-black/[0.02] flex items-center gap-3"
          style={{ borderColor: `${accent}30` }}
        >
          {block.authorAvatarUrl ? (
            <img
              src={block.authorAvatarUrl}
              alt={block.authorName || 'Author'}
              className="w-11 h-11 rounded-full object-cover border-2 shrink-0"
              style={{ borderColor: accent }}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div
              className="w-11 h-11 rounded-full border-2 flex items-center justify-center shrink-0"
              style={{ borderColor: accent, color: accent }}
            >
              <User className="w-5 h-5" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold" style={{ color: textColor }}>
              {block.authorName || 'Author Name'}
            </div>
            {block.authorBio && (
              <p
                className="text-[10.5px] leading-tight opacity-75 line-clamp-2 my-0.5"
                style={{ color: textColor }}
              >
                {block.authorBio}
              </p>
            )}
            {block.authorSocials && (
              <span
                className="text-[9.5px] font-medium tracking-wide block"
                style={{ color: accent }}
              >
                {block.authorSocials}
              </span>
            )}
          </div>
        </div>
      );

    case 'callout-box':
      return (
        <div
          className="my-3 p-3 rounded-lg border flex items-start gap-2.5"
          style={{
            borderColor: `${accent}40`,
            backgroundColor: `${accent}10`,
          }}
        >
          <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: accent }} />
          <div className="flex-1 min-w-0">
            {block.title && (
              <div
                className="text-xs font-bold uppercase tracking-wider mb-1"
                style={{ color: accent }}
              >
                {block.title}
              </div>
            )}
            <p
              className="text-[11px] leading-relaxed opacity-90"
              style={{ color: textColor }}
            >
              {block.paragraph1}
            </p>
          </div>
        </div>
      );

    case 'button-cta':
      return (
        <div className="my-3 text-center">
          <a
            href={block.buttonLink || undefined}
            target={block.buttonLink ? '_blank' : undefined}
            rel={block.buttonLink ? 'noopener noreferrer' : undefined}
            data-pdf-link={block.buttonLink || ''}
            onClick={(e) => {
              if (!block.buttonLink) e.preventDefault();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm cursor-pointer no-underline"
            style={{
              backgroundColor: accent,
              color: '#ffffff',
            }}
          >
            <span>{block.buttonLabel || 'Explore More'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      );

    case 'divider-ornament':
      return (
        <div className="my-3 flex items-center justify-center gap-2 opacity-60">
          <div
            className="h-[1px] flex-1 max-w-[80px]"
            style={{ backgroundColor: accent }}
          />
          <Star className="w-3 h-3" style={{ color: accent }} />
          <div
            className="h-[1px] flex-1 max-w-[80px]"
            style={{ backgroundColor: accent }}
          />
        </div>
      );

    case 'barcode-imprint':
      return (
        <div className="my-3 text-center border-t border-black/5 pt-2">
          {/* Visual procedural barcode lines */}
          <div className="inline-flex items-center gap-[2px] h-6 px-3 py-1 bg-white border rounded">
            <div className="w-0.5 h-full bg-black" />
            <div className="w-1 h-full bg-black" />
            <div className="w-0.5 h-full bg-black" />
            <div className="w-1.5 h-full bg-black" />
            <div className="w-0.5 h-full bg-black" />
            <div className="w-2 h-full bg-black" />
            <div className="w-0.5 h-full bg-black" />
            <div className="w-1 h-full bg-black" />
            <div className="w-1.5 h-full bg-black" />
            <div className="w-0.5 h-full bg-black" />
            <div className="w-2 h-full bg-black" />
          </div>
          <div className="text-[9.5px] font-mono tracking-wider font-semibold opacity-70 mt-1">
            {block.isbn || 'ISBN 978-0-201-89683-1'}
          </div>
          {block.publisherName && (
            <div className="text-[9px] uppercase tracking-widest font-bold opacity-60 mt-0.5">
              {block.publisherName}
            </div>
          )}
        </div>
      );

    // ==========================================
    // 🌟 CREATIVE SPECIALIZED BLOCK RENDERERS
    // ==========================================

    case 'menu-course-item':
      return (
        <div className="my-3 py-2 border-b border-black/5 last:border-b-0">
          {block.courseCategory && (
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-[9px] font-extrabold uppercase tracking-[2px] px-2 py-0.5 rounded border inline-block"
                style={{
                  borderColor: `${accent}40`,
                  backgroundColor: `${accent}15`,
                  color: accent,
                }}
              >
                {block.courseCategory}
              </span>
            </div>
          )}
          <div className="flex items-baseline justify-between gap-2">
            <h4
              className="text-xs sm:text-sm font-bold font-serif tracking-tight"
              style={{ color: textColor }}
            >
              {block.title || 'Course Item Name'}
            </h4>
            {/* Dotted Leader Line */}
            <div
              className="flex-1 border-b border-dotted mx-1.5 opacity-30 self-center"
              style={{ borderColor: accent }}
            />
            <span
              className="text-xs sm:text-sm font-mono font-bold shrink-0"
              style={{ color: accent }}
            >
              {block.price || '$38'}
            </span>
          </div>
          {block.paragraph1 && (
            <p
              className="text-[11px] font-serif italic opacity-75 mt-0.5 leading-relaxed"
              style={{ color: textColor }}
            >
              {block.paragraph1}
            </p>
          )}
          {(block.sommelierNote || (block.dietaryTags && block.dietaryTags.length > 0)) && (
            <div className="flex flex-wrap items-center gap-2 mt-1.5 pt-1 border-t border-black/5">
              {block.sommelierNote && (
                <span
                  className="inline-flex items-center gap-1 text-[9.5px] font-medium opacity-80"
                  style={{ color: accent }}
                >
                  <Wine className="w-3 h-3" />
                  <span>{block.sommelierNote}</span>
                </span>
              )}
              {block.dietaryTags?.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[8.5px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-black/5 opacity-70"
                  style={{ color: textColor }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      );

    case 'code-terminal':
      return (
        <div className="my-3 rounded-lg overflow-hidden border border-slate-700 bg-[#0d1117] text-slate-200 shadow-md font-mono text-[11px]">
          {/* Terminal Window Header */}
          <div className="bg-[#161b22] px-3 py-1.5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
              <span className="text-[10px] text-slate-400 font-semibold ml-2">
                {block.codeLanguage || 'bash ~ system.sh'}
              </span>
            </div>
            <span
              className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded font-bold"
              style={{ backgroundColor: `${accent}25`, color: accent }}
            >
              LIVE
            </span>
          </div>
          {/* Code Content */}
          <div className="p-3 leading-relaxed overflow-hidden text-emerald-400">
            <div className="flex gap-2 text-slate-500 select-none pb-1">
              <span>$</span>
              <span className="text-slate-100 font-semibold truncate">
                {block.title || 'system --execute cluster_arbitration'}
              </span>
            </div>
            <pre className="text-cyan-300 font-mono text-[10px] whitespace-pre-wrap break-words">
              {block.codeSnippet ||
                `> Latency: 3.4ms | Throughput: 142k ops/sec\n> Neural weights synchronized (10,000 nodes)\n> Status: OPTIMAL [0 packet loss]`}
            </pre>
            {block.terminalOutput && (
              <div className="mt-2 pt-1.5 border-t border-slate-800 text-amber-300 text-[10px]">
                {block.terminalOutput}
              </div>
            )}
          </div>
        </div>
      );

    case 'stat-gauge-matrix':
      return (
        <div className="my-3">
          {block.title && (
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: accent }}>
                {block.title}
              </h4>
              {block.tag && (
                <span className="text-[9px] font-mono opacity-60 uppercase">{block.tag}</span>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            {(block.items || []).map((stat, idx) => (
              <div
                key={stat.id || idx}
                className="p-2.5 rounded-lg border flex flex-col justify-between"
                style={{
                  backgroundColor: `${accent}08`,
                  borderColor: `${accent}30`,
                }}
              >
                <div className="flex items-center justify-between gap-1">
                  <span
                    className="text-[9px] font-bold uppercase tracking-wider truncate opacity-70"
                    style={{ color: textColor }}
                  >
                    {stat.title}
                  </span>
                  {stat.badge && (
                    <span
                      className="text-[8px] font-bold px-1 rounded uppercase shrink-0"
                      style={{ backgroundColor: `${accent}25`, color: accent }}
                    >
                      {stat.badge}
                    </span>
                  )}
                </div>
                <div
                  className="text-base sm:text-lg font-black font-mono my-1 tracking-tight"
                  style={{ color: accent }}
                >
                  {stat.highlight || stat.description}
                </div>
                {stat.progress !== undefined && (
                  <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden mt-1">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, Math.max(0, stat.progress))}%`,
                        backgroundColor: accent,
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );

    case 'polaroid-gallery':
      return (
        <div className="my-3 flex flex-col sm:flex-row items-center justify-center gap-3 py-1">
          {/* Polaroid Card 1 */}
          <div className="bg-white p-2 pb-3.5 rounded shadow-md border border-black/10 -rotate-2 max-w-[170px] w-full text-center transition-transform hover:rotate-0">
            <div className="w-10 h-3 bg-amber-200/70 -mt-3.5 mx-auto mb-1 rounded-sm shadow-xs" />
            <img
              src={
                block.imageUrl ||
                'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80'
              }
              alt={block.title || 'Polaroid Memory'}
              className="w-full h-24 object-cover rounded-xs"
              referrerPolicy="no-referrer"
            />
            <p className="text-[11px] font-serif italic text-slate-800 mt-2 line-clamp-1 font-medium">
              {block.title || 'Lake Como Sunset'}
            </p>
          </div>

          {/* Polaroid Card 2 (if available or paired) */}
          {block.imageUrl2 && (
            <div className="bg-white p-2 pb-3.5 rounded shadow-md border border-black/10 rotate-2 max-w-[170px] w-full text-center transition-transform hover:rotate-0">
              <div className="w-10 h-3 bg-rose-200/70 -mt-3.5 mx-auto mb-1 rounded-sm shadow-xs" />
              <img
                src={block.imageUrl2}
                alt={block.subtitle || 'Polaroid Memory 2'}
                className="w-full h-24 object-cover rounded-xs"
                referrerPolicy="no-referrer"
              />
              <p className="text-[11px] font-serif italic text-slate-800 mt-2 line-clamp-1 font-medium">
                {block.subtitle || 'Vows by the Shore'}
              </p>
            </div>
          )}
        </div>
      );

    case 'comic-panel-grid':
      return (
        <div className="my-3 space-y-2">
          {/* Action Sound FX Header */}
          {block.soundFxBadge && (
            <div className="flex justify-center -mb-1">
              <span className="bg-yellow-400 text-black font-black text-[12px] tracking-wider uppercase px-3 py-0.5 rounded border-2 border-black rotate-[-3deg] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {block.soundFxBadge}
              </span>
            </div>
          )}
          {/* Comic Panel Box */}
          <div className="border-3 border-black rounded-lg overflow-hidden bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {block.imageUrl ? (
              <div className="relative">
                <img
                  src={block.imageUrl}
                  alt={block.title || 'Comic Panel'}
                  className="w-full h-32 sm:h-40 object-cover"
                  referrerPolicy="no-referrer"
                />
                {block.speechBubbleText && (
                  <div className="absolute bottom-2 left-2 right-2 bg-white text-black text-[10.5px] font-bold p-2 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <span className="text-yellow-600 mr-1">💬</span>
                    {block.speechBubbleText}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 text-black">
                {block.speechBubbleText && (
                  <div className="bg-yellow-50 p-2 rounded-lg border-2 border-black font-bold text-xs">
                    "{block.speechBubbleText}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );

    case 'blueprint-spec':
      return (
        <div
          className="my-3 p-3 rounded-lg border text-xs font-mono relative overflow-hidden"
          style={{
            backgroundColor: `${accent}0a`,
            borderColor: `${accent}40`,
          }}
        >
          {/* Blueprint Grid Lines Accent */}
          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-dashed border-current opacity-60">
            <span className="font-bold uppercase tracking-wider text-[9.5px]">
              {block.specCoordinates || 'COORDINATES: 48.8566° N, 2.3522° E'}
            </span>
            <span className="text-[9.5px] font-bold">{block.scaleRatio || 'SCALE: 1:100'}</span>
          </div>
          {block.title && (
            <h4 className="text-xs sm:text-sm font-bold tracking-tight mb-1" style={{ color: textColor }}>
              {block.title}
            </h4>
          )}
          {block.paragraph1 && (
            <p className="text-[11px] opacity-80 mb-2 leading-relaxed" style={{ color: textColor }}>
              {block.paragraph1}
            </p>
          )}
          {block.materialDetails && (
            <div
              className="p-1.5 rounded bg-black/5 dark:bg-white/5 text-[10px] font-semibold flex items-center gap-1.5"
              style={{ color: accent }}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>MATERIALS: {block.materialDetails}</span>
            </div>
          )}
        </div>
      );

    case 'poetry-calligraphy':
      return (
        <div className="my-4 text-center px-4 py-3 relative">
          <div className="flex items-center justify-center gap-2 mb-2 opacity-50">
            <Feather className="w-4 h-4" style={{ color: accent }} />
          </div>
          {block.title && (
            <h3
              className="text-sm sm:text-base font-serif italic font-bold mb-2 tracking-wide"
              style={{ color: accent }}
            >
              {block.title}
            </h3>
          )}
          <p
            className="text-xs sm:text-[13px] font-serif italic leading-relaxed whitespace-pre-line opacity-90 font-medium"
            style={{ color: textColor, lineHeight: 1.7 }}
          >
            {block.paragraph1 ||
              'In the quiet fold of twilight amber,\nWhere the whispering pine bows to the wind,\nWe find the words we never spoke,\nAnd every broken promise mended.'}
          </p>
          {block.authorName && (
            <div
              className="mt-3 text-[10.5px] font-serif tracking-widest uppercase opacity-70"
              style={{ color: accent }}
            >
              — {block.authorName} —
            </div>
          )}
        </div>
      );

    case 'specs-badge-grid':
      return (
        <div className="my-3 space-y-2">
          {block.title && (
            <h4
              className="text-xs font-black uppercase tracking-wider"
              style={{ color: accent }}
            >
              {block.title}
            </h4>
          )}
          <div className="grid grid-cols-3 gap-1.5">
            {(block.items || []).map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-2 rounded-lg border text-center flex flex-col justify-center"
                style={{
                  backgroundColor: `${accent}10`,
                  borderColor: `${accent}35`,
                }}
              >
                <div
                  className="text-xs sm:text-sm font-black font-mono tracking-tight"
                  style={{ color: accent }}
                >
                  {item.highlight || item.title}
                </div>
                <div
                  className="text-[9px] uppercase tracking-wider font-semibold opacity-70 mt-0.5"
                  style={{ color: textColor }}
                >
                  {item.tag || item.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'recipe-step-card':
      return (
        <div
          className="my-3 p-3.5 rounded-xl border text-xs space-y-2 relative overflow-hidden"
          style={{
            backgroundColor: `${accent}0a`,
            borderColor: `${accent}40`,
          }}
        >
          {/* Top Recipe Badges */}
          <div className="flex flex-wrap items-center justify-between gap-1 pb-1.5 border-b border-black/10 dark:border-white/10">
            <span className="font-serif font-bold italic text-xs" style={{ color: accent }}>
              🍳 {block.title || 'Artisan Culinary Preparation'}
            </span>
            <div className="flex items-center gap-1.5 text-[9.5px] font-mono font-semibold opacity-80">
              {block.prepTime && <span className="px-1.5 py-0.5 rounded bg-black/5">Prep: {block.prepTime}</span>}
              {block.cookTime && <span className="px-1.5 py-0.5 rounded bg-black/5">Cook: {block.cookTime}</span>}
              {block.servings && <span className="px-1.5 py-0.5 rounded bg-black/5">Serves {block.servings}</span>}
            </div>
          </div>

          {/* Ingredients list if present */}
          {block.ingredients && block.ingredients.length > 0 && (
            <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5 space-y-1">
              <div className="text-[9.5px] font-bold uppercase tracking-wider opacity-70">Ingredients:</div>
              <div className="grid grid-cols-2 gap-1 text-[10.5px]">
                {block.ingredients.map((ing, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
                    <span style={{ color: textColor }}>{ing}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step description */}
          {block.paragraph1 && (
            <p className="text-[11.5px] leading-relaxed opacity-90" style={{ color: textColor }}>
              {block.paragraph1}
            </p>
          )}

          {/* Chef Tip */}
          {block.chefTip && (
            <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-600 dark:text-amber-300 font-medium">
              💡 <strong>Chef’s Secret:</strong> {block.chefTip}
            </div>
          )}
        </div>
      );

    case 'product-catalog-grid':
      return (
        <div className="my-3 space-y-2">
          {block.title && (
            <div className="flex items-center justify-between pb-1 border-b border-black/10 dark:border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: accent }}>
                {block.title}
              </h4>
              <span className="text-[9.5px] font-mono opacity-60">PRICE & SPEC CATALOG</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            {(block.items || []).map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-2 rounded-lg border flex flex-col justify-between space-y-1.5 bg-black/5 dark:bg-white/5"
                style={{ borderColor: `${accent}30` }}
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title || 'Product'}
                    className="w-full h-20 object-cover rounded shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div>
                  <div className="flex items-center justify-between text-[8.5px] font-mono opacity-60">
                    <span>{item.sku || `SKU-0${idx + 1}`}</span>
                    <span className="text-emerald-500 font-bold">{item.status || 'In Stock'}</span>
                  </div>
                  <h5 className="text-[11px] font-bold mt-0.5 leading-tight" style={{ color: textColor }}>
                    {item.title}
                  </h5>
                  {item.description && (
                    <p className="text-[9.5px] opacity-75 line-clamp-2 mt-0.5" style={{ color: textColor }}>
                      {item.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-black/5 dark:border-white/5">
                  <span className="text-xs font-black font-mono" style={{ color: accent }}>
                    {item.price || '$149'}
                  </span>
                  <span className="text-[8.5px] uppercase font-bold px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10">
                    Order Link
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'travel-itinerary-step':
      return (
        <div
          className="my-3 p-3 rounded-xl border text-xs space-y-1.5 relative"
          style={{
            backgroundColor: `${accent}0a`,
            borderColor: `${accent}35`,
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="px-2 py-0.5 rounded font-mono font-bold text-[9.5px] tracking-wide"
              style={{ backgroundColor: accent, color: '#000' }}
            >
              📍 {block.itineraryTime || 'DAY 01 • 09:30 AM'}
            </span>
            <span className="text-[10px] font-medium opacity-70">
              {block.travelDuration || 'Walking: 15 min'}
            </span>
          </div>

          <h4 className="text-xs sm:text-sm font-bold font-serif" style={{ color: textColor }}>
            {block.title || block.itineraryLocation || 'Piazza del Duomo & Historic Vista'}
          </h4>

          {block.imageUrl && (
            <img
              src={block.imageUrl}
              alt={block.title || 'Travel Guide'}
              className="w-full h-24 sm:h-28 object-cover rounded-lg shadow-sm"
              referrerPolicy="no-referrer"
            />
          )}

          {block.paragraph1 && (
            <p className="text-[11px] opacity-85 leading-relaxed" style={{ color: textColor }}>
              {block.paragraph1}
            </p>
          )}

          {block.travelTips && (
            <div className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[10px] text-cyan-700 dark:text-cyan-300 font-medium">
              🗺️ <strong>Insider Tip:</strong> {block.travelTips}
            </div>
          )}
        </div>
      );

    case 'newspaper-headline-columns':
      return (
        <div className="my-3 space-y-2">
          {/* Newspaper Masthead / Subheader */}
          <div className="text-center pb-1 border-b-2 border-current">
            {block.newspaperSection && (
              <span className="text-[8.5px] font-mono tracking-[2px] uppercase opacity-70 font-bold">
                {block.newspaperSection} • {block.issueDate || 'MORNING DISPATCH'}
              </span>
            )}
            <h3 className="text-sm sm:text-base font-serif font-black tracking-tight uppercase leading-tight mt-0.5" style={{ color: textColor }}>
              {block.title || 'HISTORIC MILESTONE ANNOUNCED TODAY'}
            </h3>
            {block.byline && (
              <div className="text-[9px] font-serif italic opacity-70 mt-0.5">
                By {block.byline} — {block.dateline || 'SPECIAL CORRESPONDENT'}
              </div>
            )}
          </div>

          {/* Newspaper Column layout */}
          <div className="grid grid-cols-2 gap-2 text-[10.5px] font-serif leading-relaxed opacity-90 text-justify">
            <div>
              <p>
                <span
                  className="float-left text-2xl font-serif font-black leading-none pr-1 pt-0.5"
                  style={{ color: accent }}
                >
                  {block.paragraph1 ? block.paragraph1[0] : 'T'}
                </span>
                {block.paragraph1 ? block.paragraph1.slice(1) : ''}
              </p>
            </div>
            <div>
              <p>{block.paragraph2 || block.paragraph3 || 'Full analysis continues on page 4.'}</p>
            </div>
          </div>
        </div>
      );

    case 'presentation-pitch-slide':
      return (
        <div className="my-3 space-y-2">
          {block.title && (
            <div className="flex items-center justify-between pb-1 border-b border-black/10 dark:border-white/10">
              <h4 className="text-xs sm:text-sm font-black uppercase tracking-wide" style={{ color: accent }}>
                {block.title}
              </h4>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-black/10 dark:bg-white/10">
                PITCH DECK
              </span>
            </div>
          )}

          {/* Problem vs Solution split */}
          {(block.problemStatement || block.solutionStatement) && (
            <div className="grid grid-cols-2 gap-2 text-[10.5px]">
              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200">
                <div className="font-bold uppercase text-[9px] text-rose-500 mb-0.5">⚠️ The Problem:</div>
                {block.problemStatement}
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200">
                <div className="font-bold uppercase text-[9px] text-emerald-500 mb-0.5">✨ Our Solution:</div>
                {block.solutionStatement}
              </div>
            </div>
          )}

          {/* Market TAM/SAM Metrics */}
          {(block.marketSizeTAM || block.marketSizeSAM) && (
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-cyan-500/30 text-center">
                <div className="text-sm font-black font-mono text-cyan-500">{block.marketSizeTAM}</div>
                <div className="text-[8.5px] uppercase font-bold opacity-60">Total Addressable Market (TAM)</div>
              </div>
              <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-cyan-500/30 text-center">
                <div className="text-sm font-black font-mono text-cyan-500">{block.marketSizeSAM}</div>
                <div className="text-[8.5px] uppercase font-bold opacity-60">Serviceable Market (SAM)</div>
              </div>
            </div>
          )}
        </div>
      );

    case 'invitation-rsvp-card':
      return (
        <div
          className="my-3 p-4 rounded-xl border text-center space-y-2 relative overflow-hidden"
          style={{
            backgroundColor: `${accent}0a`,
            borderColor: `${accent}45`,
          }}
        >
          <div className="w-8 h-8 rounded-full border mx-auto flex items-center justify-center mb-1" style={{ borderColor: accent, color: accent }}>
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-serif italic font-bold" style={{ color: accent }}>
            {block.title || 'Cordially Requests the Honor of Your Presence'}
          </h4>
          <div className="text-xs space-y-1 font-serif">
            <div className="font-bold" style={{ color: textColor }}>{block.eventDate || 'Saturday, September 19, 2026'}</div>
            <div className="opacity-80" style={{ color: textColor }}>{block.eventTime || 'Reception at 6:00 PM'}</div>
            <div className="opacity-80 italic" style={{ color: textColor }}>{block.eventVenue || 'Villa del Balbianello, Lake Como, Italy'}</div>
          </div>
          {block.dressCode && (
            <div className="text-[9.5px] font-mono uppercase tracking-wider opacity-70">
              DRESS CODE: {block.dressCode}
            </div>
          )}
          <div
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full font-serif italic font-bold text-[11px] shadow-sm cursor-pointer hover:scale-105 transition-transform"
            style={{ backgroundColor: accent, color: '#000' }}
          >
            <span>RSVP Online</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      );

    case 'handbook-policy-card':
      return (
        <div
          className="my-3 p-3 rounded-lg border text-xs space-y-1.5 bg-black/5 dark:bg-white/5"
          style={{ borderColor: `${accent}35` }}
        >
          <div className="flex items-center justify-between pb-1 border-b border-black/10 dark:border-white/10">
            <span className="font-mono font-bold text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              {block.policyCode || 'SEC-POL-2026'}
            </span>
            <span className="text-[9px] font-mono text-emerald-500 font-bold flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>{block.complianceStatus || 'Mandatory Policy'}</span>
            </span>
          </div>
          <h4 className="text-xs font-bold" style={{ color: textColor }}>
            {block.title || 'Information Security & Access Protocols'}
          </h4>
          {block.paragraph1 && (
            <p className="text-[11px] opacity-80 leading-relaxed" style={{ color: textColor }}>
              {block.paragraph1}
            </p>
          )}
          {block.items && (
            <div className="space-y-1 pt-1">
              {block.items.map((item, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-[10px]">
                  <Check className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                  <span style={{ color: textColor }}><strong>{item.title}:</strong> {item.description}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
};
