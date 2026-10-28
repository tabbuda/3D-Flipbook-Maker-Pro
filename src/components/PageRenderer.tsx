import React from 'react';
import { PageContent, CoverTheme } from '../types/flipbook';
import { PageBlockRenderer } from './PageBlockRenderer';
import { CoverArtworkRenderer } from './CoverArtworkRenderer';
import {
  Sparkles,
  BookOpen,
  Quote,
  CheckCircle2,
  ChevronRight,
  Layers,
  Award,
  Globe,
  Star,
  Music,
  Shield,
  Smartphone,
  Download,
  Share2,
  Code,
  Cloud,
  BarChart,
  User,
  Check,
  Lock,
  Terminal,
  Cpu,
  Gauge,
  Wine,
  Feather,
  Flame,
  Zap,
  Compass,
} from 'lucide-react';

interface PageRendererProps {
  page?: PageContent;
  theme: CoverTheme;
  bookTitle: string;
  bookAuthor: string;
  pageNumber: number;
  coverImageUrl?: string;
  onNavigateToPage?: (pageNum: number) => void;
}

export const PageRenderer: React.FC<PageRendererProps> = ({
  page,
  theme,
  bookTitle,
  bookAuthor,
  pageNumber,
  coverImageUrl,
  onNavigateToPage,
}) => {
  if (!page) {
    return (
      <div className="page-content-wrapper flex items-center justify-center text-slate-300 font-serif italic text-sm">
        (End of Book)
      </div>
    );
  }

  // Helper: Subtle architectural thin circle ornament (Left page = Top circle, Right page = Bottom-Right circle)
  const isLeftPage = pageNumber % 2 === 0;
  const isDarkPageBg = /^#(0|1|2)/i.test((theme.pageBg || '').trim());
  const circleStrokeColor = isDarkPageBg
    ? 'rgba(255, 255, 255, 0.22)'
    : 'rgba(15, 23, 42, 0.25)';

  const renderSubtlePageGeometry = () => {
    if (page.template === 'cover-front' || page.template === 'cover-back') return null;
    return (
      <div
        data-pdf-ornament-circle="true"
        className="absolute inset-0 overflow-hidden pointer-events-none select-none z-[5]"
      >
        {isLeftPage ? (
          /* Left Page: Thin delicate circle at the top (clipped by top edge, matching screenshot) */
          <div
            data-pdf-ornament-circle="true"
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '56%',
              aspectRatio: '1 / 1',
              top: '-16%',
              right: '10%',
              border: `1px solid ${circleStrokeColor}`,
            }}
          />
        ) : (
          /* Right Page: Thin delicate circle at the bottom-right corner (clipped by bottom & right edges) */
          <div
            data-pdf-ornament-circle="true"
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '58%',
              aspectRatio: '1 / 1',
              bottom: '-18%',
              right: '-12%',
              border: `1px solid ${circleStrokeColor}`,
            }}
          />
        )}
      </div>
    );
  };

  // 0. FULL BLEED PDF / DOCUMENT PAGE RENDERING
  if (
    page.template === 'pdf-page' ||
    (page.isPdfPage && page.imageUrl && page.template !== 'cover-front' && page.template !== 'cover-back')
  ) {
    return (
      <div
        className="page-content-wrapper relative w-full h-full overflow-hidden flex items-center justify-center bg-white select-none"
        style={{
          backgroundColor: '#ffffff',
          padding: 0,
          margin: 0,
        }}
      >
        {renderSubtlePageGeometry()}
        {page.imageUrl ? (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-white">
            <img
              src={page.imageUrl}
              alt={page.title || `Page ${pageNumber}`}
              className="w-full h-full object-contain pointer-events-none select-none"
              referrerPolicy="no-referrer"
              loading="eager"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <span className="text-sm font-medium">Page {pageNumber}</span>
          </div>
        )}
      </div>
    );
  }

  // 0.1 BLANK INSIDE ENDPAPER or EMPTY BLOCKS (Never apply to covers or image pages)
  if (
    page.template !== 'cover-front' &&
    page.template !== 'cover-back' &&
    !page.imageUrl &&
    ((page.template as string) === 'blank' ||
      (page.blocks !== undefined && page.blocks.length === 0) ||
      (!page.blocks?.length &&
        !page.title &&
        !page.paragraph1 &&
        !page.bulletItems?.length &&
        !page.gridCards?.length))
  ) {
    return (
      <div
        className="page-content-wrapper flex flex-col justify-between items-center text-center relative overflow-hidden box-border h-full"
        style={{
          backgroundColor: theme.pageBg,
          color: theme.pageTextColor,
        }}
      >
        {renderSubtlePageGeometry()}
        <div className="text-[9px] uppercase tracking-widest opacity-35 font-mono relative z-10">
          {page.headerTag || bookTitle}
        </div>
        <div className="my-auto opacity-20 flex flex-col items-center relative z-10">
          <Sparkles className="w-8 h-8" style={{ color: theme.accentColor }} />
        </div>
        <div className="text-[9px] uppercase tracking-widest opacity-35 font-mono relative z-10">
          Page {pageNumber}
        </div>
      </div>
    );
  }

  // 1. DYNAMIC COMPONENT BLOCKS RENDERING (If page has blocks)
  if (page.blocks && page.blocks.length > 0 && page.template !== 'cover-front' && page.template !== 'cover-back') {
    return (
      <div
        className="page-content-wrapper relative overflow-hidden flex flex-col justify-between h-full select-none"
        style={{
          backgroundColor: theme.pageBg,
          color: theme.pageTextColor,
        }}
      >
        {renderSubtlePageGeometry()}

        {/* Header Tag */}
        <div
          className="flex justify-between items-center pb-1.5 mb-2 text-[9px] font-bold tracking-[1.5px] uppercase opacity-60 shrink-0 relative z-10"
          style={{
            borderBottom: `1px solid ${theme.borderColor || 'rgba(0,0,0,0.08)'}`,
            color: theme.accentColor || '#64748b',
          }}
        >
          <span className="truncate max-w-[70%]">{page.headerTag || bookTitle}</span>
          <span>Page {pageNumber}</span>
        </div>

        {/* Content Blocks */}
        <div className="flex-1 overflow-hidden flex flex-col justify-center space-y-1 relative z-10">
          {page.blocks.map((block) => (
            <PageBlockRenderer
              key={block.id}
              block={block}
              themeAccentColor={theme.accentColor}
              themeTextColor={theme.pageTextColor}
              themePageBg={theme.pageBg}
            />
          ))}
        </div>

        {/* Footer */}
        <div
          className="flex justify-between items-center pt-1.5 mt-2 text-[8.5px] tracking-wider uppercase opacity-40 font-mono shrink-0 border-t border-black/5 relative z-10"
          style={{ color: theme.pageTextColor }}
        >
          <span>{bookAuthor}</span>
          <span>• {pageNumber} •</span>
        </div>
      </div>
    );
  }

  // 2. FRONT COVER WITH DIVERSE THEME ARCHETYPES
  if (page.template === 'cover-front') {
    // If it's a PDF page converted with exact cover image and user hasn't switched to text
    if (page.isPdfPage && page.imageUrl) {
      return (
        <div
          className="page-content-wrapper relative w-full h-full overflow-hidden flex items-center justify-center bg-white select-none"
          style={{
            backgroundColor: '#ffffff',
            padding: 0,
            margin: 0,
          }}
        >
          <img
            src={page.imageUrl}
            alt={page.title || bookTitle}
            className="w-full h-full object-contain pointer-events-none select-none"
            referrerPolicy="no-referrer"
            loading="eager"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
            }}
          />
          {/* Realistic 3D Hardcover Spine Hinge Groove & Bevel */}
          <div
            className="absolute inset-y-0 left-0 w-[22px] pointer-events-none z-10"
            style={{
              background:
                'linear-gradient(to right, rgba(0,0,0,0.45) 0%, rgba(255,255,255,0.25) 18%, rgba(0,0,0,0.04) 40%, rgba(0,0,0,0.38) 68%, rgba(255,255,255,0.22) 82%, transparent 100%)',
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background:
                'linear-gradient(130deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.03) 28%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.14) 100%)',
              boxShadow:
                'inset 0 1.5px 1px rgba(255,255,255,0.4), inset -1.5px 0 2px rgba(0,0,0,0.15), inset 0 -2px 3px rgba(0,0,0,0.3)',
            }}
          />
        </div>
      );
    }

    // Resolve matched template ID to render the exact matching bespoke visual cover
    const bTitle = (page.title || bookTitle || '').toLowerCase();
    const matchedTemplateId =
      page.coverStyle ||
      (page as any).templateId ||
      (bTitle.includes('digital mastery') || bTitle.includes('art of digital') ? 'tpl-digital-mastery' :
       bTitle.includes('atelier') || bTitle.includes('couture') || bTitle.includes('lookbook') || bTitle.includes('fashion') ? 'tpl-vogue-fashion' :
       bTitle.includes('autonomous') || bTitle.includes('spatial systems') || bTitle.includes('whitepaper') || bTitle.includes('intelligence') ? 'tpl-ai-tech' :
       bTitle.includes('étoile') || bTitle.includes('bistro') || bTitle.includes('degustation') || bTitle.includes('gourmet') ? 'tpl-gourmet-menu' :
       bTitle.includes('urban sanctuaries') || bTitle.includes('monolithic') || bTitle.includes('architectural') || bTitle.includes('sanctuaries') ? 'tpl-architectural-digest' :
       bTitle.includes('whispering forest') || bTitle.includes('enchanted') || bTitle.includes('storybook') || bTitle.includes('fairy tale') ? 'tpl-mystic-storybook' :
       bTitle.includes('wild horizons') || bTitle.includes('expedition') || bTitle.includes('wildlife') || bTitle.includes('nomad') ? 'tpl-creative-agency' :
       bTitle.includes('eternal bloom') || bTitle.includes('wedding keepsake') || bTitle.includes('wedding') || bTitle.includes('sakura') ? 'tpl-sakura-wedding' :
       bTitle.includes('daily chronicle') || bTitle.includes('chronicle') || bTitle.includes('newspaper') || bTitle.includes('broadsheet') || bTitle.includes('gazette') ? 'tpl-vintage-newspaper' :
       bTitle.includes('nordic haven') || bTitle.includes('furniture') || bTitle.includes('living catalog') || bTitle.includes('scandi') ? 'tpl-scandi-catalog' :
       bTitle.includes('metropolis') || bTitle.includes('infrastructure') || bTitle.includes('corporate brochure') || bTitle.includes('building the future') ? 'tpl-corporate-brochure' :
       bTitle.includes('forno') || bTitle.includes('toscana') || bTitle.includes('artisan cookbook') || bTitle.includes('cookbook') || bTitle.includes('pasta') ? 'tpl-artisan-cookbook' :
       bTitle.includes('amalfi') || bTitle.includes('capri') || bTitle.includes('dolce vita') || bTitle.includes('travel guide') ? 'tpl-amalfi-guide' :
       bTitle.includes('nexus') || bTitle.includes('cognition') || bTitle.includes('pitch deck') || bTitle.includes('series a') ? 'tpl-venture-pitch' :
       bTitle.includes('veridian') || bTitle.includes('security & culture') || bTitle.includes('company handbook') || bTitle.includes('employee handbook') ? 'tpl-company-handbook' :
       bTitle.includes('balbianello') || bTitle.includes('summer gala') || bTitle.includes('royal invitation') || bTitle.includes('masquerade') ? 'tpl-royal-invitation' :
       bTitle.includes('philharmonic') || bTitle.includes('albert hall') || bTitle.includes('playbill') || bTitle.includes('mahler') || bTitle.includes('concert') ? 'tpl-theatre-playbill' :
       bTitle.includes('cyber blade') || bTitle.includes('shonen') || bTitle.includes('manga') ? 'tpl-manga-shonen' :
       bTitle.includes('apex') || bTitle.includes('gt-r') || bTitle.includes('hypercar') || bTitle.includes('supercar') ? 'tpl-supercar-apex' :
       theme.id === 'emerald-gold' ? 'tpl-digital-mastery' :
       theme.id === 'editorial-ivory' ? 'tpl-vogue-fashion' :
       theme.id === 'cyber-matrix' ? 'tpl-ai-tech' :
       theme.id === 'gourmet-bistro' ? 'tpl-gourmet-menu' :
       theme.id === 'nordic-sage' ? 'tpl-architectural-digest' :
       theme.id === 'vintage-leather' ? 'tpl-mystic-storybook' :
       theme.id === 'midnight-sapphire' ? 'tpl-creative-agency' :
       theme.id === 'sakura-blush' ? 'tpl-sakura-wedding' :
       theme.id === 'newspaper-broadsheet' ? 'tpl-vintage-newspaper' :
       theme.id === 'catalog-minimal' ? 'tpl-scandi-catalog' :
       theme.id === 'brochure-corporate' ? 'tpl-corporate-brochure' :
       theme.id === 'cookbook-rustic' || theme.id === 'cookbook-terracotta' ? 'tpl-artisan-cookbook' :
       theme.id === 'travel-mediterranean' ? 'tpl-amalfi-guide' :
       theme.id === 'deck-pitch' || theme.id === 'obsidian-neon' ? 'tpl-venture-pitch' :
       theme.id === 'handbook-slate' ? 'tpl-company-handbook' :
       theme.id === 'invitation-luxury' || theme.id === 'royal-gold' ? 'tpl-royal-invitation' :
       theme.id === 'booklet-theatre' ? 'tpl-theatre-playbill' :
       theme.id === 'manga-popart' ? 'tpl-manga-shonen' :
       theme.id === 'supercar-carbon' ? 'tpl-supercar-apex' :
       'tpl-digital-mastery');

    return (
      <div className="w-full h-full relative box-border overflow-hidden select-none">
        <CoverArtworkRenderer
          templateId={matchedTemplateId}
          title={page.title || bookTitle}
          subtitle={page.subtitle}
          author={page.footerNote || bookAuthor}
          headerTag={page.headerTag}
          footerNote={page.footerNote}
          coverImageUrl={page.imageUrl || page.coverImageUrl || coverImageUrl}
          isInteractiveCover={true}
        />
      </div>
    );
  }

  // 2. BACK COVER
  if (page.template === 'cover-back') {
    if (page.isPdfPage && page.imageUrl) {
      return (
        <div
          className="page-content-wrapper relative w-full h-full overflow-hidden flex items-center justify-center bg-white select-none"
          style={{
            backgroundColor: '#ffffff',
            padding: 0,
            margin: 0,
          }}
        >
          <img
            src={page.imageUrl}
            alt={page.title || 'Back Cover'}
            className="w-full h-full object-contain pointer-events-none select-none"
            referrerPolicy="no-referrer"
            loading="eager"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
            }}
          />
          {/* Right-side Spine Hinge Groove for Back Cover */}
          <div
            className="absolute inset-y-0 right-0 w-[22px] pointer-events-none z-10"
            style={{
              background:
                'linear-gradient(to left, rgba(0,0,0,0.45) 0%, rgba(255,255,255,0.25) 18%, rgba(0,0,0,0.04) 40%, rgba(0,0,0,0.38) 68%, rgba(255,255,255,0.22) 82%, transparent 100%)',
            }}
          />
        </div>
      );
    }

    return (
      <div className="w-full h-full p-5 md:p-7 flex flex-col justify-between items-center text-center relative box-border overflow-hidden select-none">
        {/* Right-side Spine Binding & French Groove on Back Cover */}
        <div
          className="absolute inset-y-0 right-0 w-[24px] pointer-events-none z-20"
          style={{
            background:
              'linear-gradient(to left, rgba(0,0,0,0.72) 0%, rgba(255,255,255,0.2) 18%, rgba(255,255,255,0.04) 38%, rgba(0,0,0,0.55) 68%, rgba(0,0,0,0.25) 76%, rgba(255,255,255,0.16) 84%, transparent 100%)',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            background:
              'linear-gradient(230deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 30%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.28) 100%)',
            boxShadow:
              'inset 0 1.5px 1px rgba(255,255,255,0.28), inset 1.5px 0 2px rgba(255,255,255,0.12), inset 0 -2px 3px rgba(0,0,0,0.55), inset 0 0 32px rgba(0,0,0,0.4)',
          }}
        />

        <div
          className="w-full h-full border rounded p-5 flex flex-col justify-between items-center relative z-10 box-border"
          style={{ borderColor: theme.borderColor }}
        >
          {/* 4 Corner Ornaments */}
          <div className="cover-corner-ornament tl" style={{ borderColor: theme.accentColor }} />
          <div className="cover-corner-ornament tr" style={{ borderColor: theme.accentColor }} />
          <div className="cover-corner-ornament bl" style={{ borderColor: theme.accentColor }} />
          <div className="cover-corner-ornament br" style={{ borderColor: theme.accentColor }} />

          <div
            className="text-[10px] tracking-[2.5px] font-bold uppercase"
            style={{ color: theme.accentColor }}
          >
            CRITICAL ACCLAIM & SYNOPSIS
          </div>

          <div className="my-auto py-2 max-w-[90%]">
            <Quote
              className="w-6 h-6 mx-auto mb-2 opacity-50"
              style={{ color: theme.accentColor }}
            />
            <p className="text-xs md:text-sm italic leading-relaxed mb-3 opacity-90 font-serif">
              {page.paragraph1 ||
                '“A landmark publication seamlessly blending historical physical craftsmanship with bleeding-edge digital interaction.”'}
            </p>
            <div
              className="text-[11px] font-bold tracking-wide"
              style={{ color: theme.accentColor }}
            >
              {page.authorName || '— Editorial Board, Digital Arts Quarterly'}
            </div>
          </div>

          {/* Barcode & ISBN */}
          <div className="w-full pt-2 flex flex-col items-center gap-1.5 border-t border-white/10">
            <div className="bg-white px-4 py-1.5 rounded shadow-sm flex flex-col items-center">
              <div
                className="w-28 h-5"
                style={{
                  background:
                    'repeating-linear-gradient(to right, #000 0, #000 2px, #fff 2px, #fff 4px, #000 4px, #000 6px, #fff 6px, #fff 8px, #000 8px, #000 11px)',
                }}
              />
              <span className="text-[8px] font-mono text-black font-semibold tracking-wider mt-0.5">
                {page.isbn || 'ISBN 978-0-123456-78-9'}
              </span>
            </div>

            <div className="text-[9px] opacity-60">
              {page.publisherName || 'Lumina Press International'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. INSIDE STANDARD PAGES - Clean, Modular Content Wrapper
  return (
    <div
      className="page-content-wrapper relative overflow-hidden"
      style={{
        backgroundColor: theme.pageBg,
        color: theme.pageTextColor,
      }}
    >
      {renderSubtlePageGeometry()}

      {/* Page Header */}
      <div
        className="flex justify-between items-center pb-2 mb-3 text-[9.5px] font-bold tracking-[1.5px] uppercase opacity-60 relative z-10"
        style={{
          borderBottom: `1px solid ${theme.borderColor || 'rgba(0,0,0,0.08)'}`,
          color: theme.accentColor || '#64748b',
        }}
      >
        <span className="truncate max-w-[70%]">{page.headerTag || bookTitle}</span>
        <span>Page {pageNumber}</span>
      </div>

      {/* Page Body Content */}
      <div className="flex-1 overflow-hidden flex flex-col justify-center relative z-10">
        {/* Title & Subtitle if present */}
        {page.title && (
          <h2
            className="text-lg md:text-xl font-bold font-serif leading-tight mb-1"
            style={{ color: theme.pageTextColor }}
          >
            {page.title}
          </h2>
        )}
        {page.subtitle && (
          <p
            className="text-xs mb-3 leading-relaxed opacity-75 font-medium"
            style={{ color: theme.pageTextColor }}
          >
            {page.subtitle}
          </p>
        )}

        {/* Template Specific Inner Layouts */}
        {page.template === 'table-of-contents' && (
          <div className="flex flex-col gap-1.5 my-auto overflow-hidden">
            {(page.bulletItems || []).map((item, idx) => (
              <div
                key={item.id || idx}
                data-goto-page={idx + 1}
                onClick={() => onNavigateToPage && onNavigateToPage(idx + 1)}
                className="toc-item flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer border hover:opacity-90"
                style={{
                  backgroundColor: 'rgba(125, 125, 125, 0.05)',
                  borderColor: theme.borderColor || 'rgba(0,0,0,0.06)',
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{
                      backgroundColor: theme.accentColor,
                      color: '#000000',
                    }}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: theme.pageTextColor }}>
                    {item.title}
                  </span>
                </div>
                <span className="text-[11px] font-mono opacity-60">
                  {item.description || `Page ${idx + 1}`}
                </span>
              </div>
            ))}
          </div>
        )}

        {page.template === 'chapter-intro' && (
          <div className="my-auto flex flex-col gap-2">
            {page.chapterNumber && (
              <div
                className="text-2xl md:text-3xl font-serif font-black"
                style={{ color: theme.accentColor }}
              >
                {page.chapterNumber}
              </div>
            )}
            {page.quoteText && (
              <blockquote
                className="border-l-2 pl-3 py-1 my-1 italic text-xs leading-relaxed opacity-90"
                style={{ borderColor: theme.accentColor }}
              >
                {page.quoteText}
                {page.quoteAuthor && (
                  <cite className="block text-[10px] not-italic font-bold mt-1 opacity-70">
                    — {page.quoteAuthor}
                  </cite>
                )}
              </blockquote>
            )}
            {page.paragraph1 && (
              <p className="text-xs leading-relaxed opacity-85">{page.paragraph1}</p>
            )}
          </div>
        )}

        {page.template === 'story-article' && (
          <div className="my-auto text-xs leading-relaxed flex flex-col gap-2 opacity-90 overflow-hidden">
            {page.paragraph1 && (
              <p>
                {page.dropCap ? (
                  <>
                    <span
                      className="float-left text-3xl font-serif font-bold leading-none pr-1.5 pt-0.5"
                      style={{ color: theme.accentColor }}
                    >
                      {page.paragraph1[0]}
                    </span>
                    {page.paragraph1.slice(1)}
                  </>
                ) : (
                  page.paragraph1
                )}
              </p>
            )}
            {page.paragraph2 && <p>{page.paragraph2}</p>}
            {page.paragraph3 && <p>{page.paragraph3}</p>}
          </div>
        )}

        {page.template === 'feature-list' && (
          <div className="flex flex-col gap-2 my-auto">
            {(page.bulletItems || []).map((item, idx) => (
              <div
                key={item.id || idx}
                className="flex items-start gap-2.5 p-2 rounded-lg border"
                style={{
                  backgroundColor: 'rgba(125, 125, 125, 0.04)',
                  borderColor: theme.borderColor || 'rgba(0,0,0,0.06)',
                }}
              >
                <div
                  className="w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    backgroundColor: theme.accentColor,
                    color: '#000000',
                  }}
                >
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold" style={{ color: theme.pageTextColor }}>
                    {item.title}
                  </h4>
                  <p className="text-[11px] leading-tight opacity-75 mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {page.template === 'image-showcase' && (
          <div className="my-auto flex flex-col gap-2">
            {page.imageUrl ? (
              <div
                className="w-full rounded-lg overflow-hidden shadow-xs border flex items-center justify-center bg-black/[0.02]"
                style={{ borderColor: theme.borderColor || 'rgba(0,0,0,0.1)' }}
              >
                <img
                  src={page.imageUrl}
                  alt={page.imageCaption || page.title || 'Page visual'}
                  referrerPolicy="no-referrer"
                  className="w-full h-auto max-h-56 object-contain block mx-auto"
                />
              </div>
            ) : (
              <div
                className="w-full h-36 md:h-44 rounded-lg flex flex-col items-center justify-center border border-dashed text-center p-3 opacity-60"
                style={{ borderColor: theme.borderColor || 'rgba(0,0,0,0.2)' }}
              >
                <Layers className="w-8 h-8 mb-1 opacity-50" />
                <span className="text-xs font-medium">Showcase Illustration</span>
              </div>
            )}
            {page.imageCaption && (
              <p className="text-[10px] italic text-center opacity-70">
                {page.imageCaption}
              </p>
            )}
            {page.paragraph1 && (
              <p className="text-xs leading-relaxed opacity-85 mt-1">{page.paragraph1}</p>
            )}
          </div>
        )}

        {page.template === 'quote-highlight' && (
          <div className="my-auto flex flex-col items-center justify-center text-center p-4">
            <Quote
              className="w-10 h-10 mb-2 opacity-40"
              style={{ color: theme.accentColor }}
            />
            <blockquote className="text-sm md:text-base font-serif italic leading-relaxed mb-3">
              “{page.quoteText || 'Design is not just what it looks like and feels like. Design is how it works.'}”
            </blockquote>
            {page.quoteAuthor && (
              <div
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: theme.accentColor }}
              >
                {page.quoteAuthor}
              </div>
            )}
            {page.quoteRole && (
              <div className="text-[10px] opacity-60">{page.quoteRole}</div>
            )}
          </div>
        )}

        {page.template === 'key-points-grid' && (
          <div className="grid grid-cols-2 gap-2 my-auto">
            {(page.gridCards || []).map((card, idx) => (
              <div
                key={card.id || idx}
                className="p-2.5 rounded-lg border flex flex-col justify-between"
                style={{
                  backgroundColor: 'rgba(125, 125, 125, 0.05)',
                  borderColor: theme.borderColor || 'rgba(0,0,0,0.06)',
                }}
              >
                <div>
                  <div className="text-[9px] font-mono font-bold uppercase opacity-60">
                    {card.tag}
                  </div>
                  <h4 className="text-xs font-bold mt-0.5" style={{ color: theme.pageTextColor }}>
                    {card.title}
                  </h4>
                  <p className="text-[10px] leading-tight mt-1 opacity-75" style={{ color: theme.pageTextColor }}>
                    {card.description}
                  </p>
                </div>
                {card.highlight && (
                  <div className="text-[11px] font-bold mt-2 font-mono" style={{ color: theme.accentColor }}>
                    {card.highlight}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {page.template === 'author-bio' && (
          <div className="my-auto flex flex-col items-center text-center p-2">
            {page.authorAvatarUrl ? (
              <img
                src={page.authorAvatarUrl}
                alt={page.authorName || 'Author'}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-full object-cover border-2 shadow mb-2"
                style={{ borderColor: theme.accentColor }}
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-2 font-bold font-serif text-lg border"
                style={{
                  backgroundColor: 'rgba(125, 125, 125, 0.1)',
                  borderColor: theme.accentColor,
                  color: theme.pageTextColor,
                }}
              >
                {(page.authorName || 'A')[0]}
              </div>
            )}

            <h3 className="text-sm font-bold font-serif" style={{ color: theme.pageTextColor }}>
              {page.authorName || bookAuthor}
            </h3>
            <p className="text-xs leading-relaxed my-2 max-w-[90%] opacity-85" style={{ color: theme.pageTextColor }}>
              {page.authorBio ||
                'Author & designer committed to crafting immersive virtual reading experiences.'}
            </p>
            {page.authorSocials && (
              <div className="text-[10px] font-mono opacity-60 mt-1">
                {page.authorSocials}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Page Footer */}
      <div
        className="flex justify-between items-center pt-2 mt-3 text-[10px] font-medium opacity-60 relative z-10"
        style={{
          borderTop: `1px solid ${theme.borderColor || 'rgba(0,0,0,0.08)'}`,
        }}
      >
        <span>{bookAuthor}</span>
        <span>Page {pageNumber}</span>
      </div>
    </div>
  );
};
