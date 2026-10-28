import React, { useState } from 'react';
import { BookProject, TemplatePreset } from '../types/flipbook';
import { FLIPBOOK_TEMPLATE_PRESETS } from '../constants/presetTemplates';
import { INITIAL_BOOK_PROJECT } from '../constants/templates';
import { FlipbookPreview } from './FlipbookPreview';
import { TemplateCardVisual } from './TemplateCardVisual';
import {
  Download,
  BookOpen,
  ArrowRight,
  Smartphone,
  Palette,
  Volume2,
  FileCode,
  ShieldCheck,
  ChevronDown,
  Layers,
  Check,
  UploadCloud,
  FileText,
  Crown,
  ExternalLink,
  Key,
  Sparkles,
  CheckCheck,
} from 'lucide-react';

interface HomePageProps {
  onStartCreating: () => void;
  onOpenTemplates: () => void;
  onOpenBookshelf?: () => void;
  onSelectTemplate: (project: BookProject) => void;
  onPreviewTemplate: (template: TemplatePreset) => void;
  onOpenUploadModal?: () => void;
  onOpenInstallModal?: () => void;
  onOpenPdfModal?: () => void;
  onOpenLicenseModal?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onStartCreating,
  onOpenTemplates,
  onOpenBookshelf,
  onSelectTemplate,
  onPreviewTemplate,
  onOpenUploadModal,
  onOpenInstallModal,
  onOpenPdfModal,
  onOpenLicenseModal,
}) => {
  // Live Demo Book Selector on Homepage
  const demoPresets = [
    {
      id: 'luxury-mag',
      label: '01 · Luxury Magazine',
      project: FLIPBOOK_TEMPLATE_PRESETS[0]?.project || INITIAL_BOOK_PROJECT,
    },
    {
      id: 'gourmet-menu',
      label: '02 · Gourmet Menu',
      project: FLIPBOOK_TEMPLATE_PRESETS[2]?.project || INITIAL_BOOK_PROJECT,
    },
    {
      id: 'tech-pitch',
      label: '03 · Tech Pitch Deck',
      project: FLIPBOOK_TEMPLATE_PRESETS[4]?.project || INITIAL_BOOK_PROJECT,
    },
    {
      id: 'kids-story',
      label: '04 · Storybook',
      project: FLIPBOOK_TEMPLATE_PRESETS[3]?.project || INITIAL_BOOK_PROJECT,
    },
    {
      id: 'newspaper',
      label: '05 · Broadsheet Press',
      project: FLIPBOOK_TEMPLATE_PRESETS[7]?.project || INITIAL_BOOK_PROJECT,
    },
  ];

  const [selectedDemoIndex, setSelectedDemoIndex] = useState<number>(0);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const activeDemoBook = demoPresets[selectedDemoIndex]?.project || INITIAL_BOOK_PROJECT;

  // Filter templates for the home gallery showcase
  const categoryFilters = [
    { id: 'all', label: 'All Presets' },
    { id: 'magazine', label: 'Magazines & Lookbooks' },
    { id: 'menu', label: 'Fine Dining & Menus' },
    { id: 'business', label: 'Pitch Decks & Reports' },
    { id: 'storybook', label: 'Storybooks & Comics' },
    { id: 'portfolio', label: 'Portfolios' },
  ];

  const filteredTemplates =
    activeCategoryFilter === 'all'
      ? FLIPBOOK_TEMPLATE_PRESETS.slice(0, 6)
      : FLIPBOOK_TEMPLATE_PRESETS.filter((t) => {
          if (activeCategoryFilter === 'magazine') return t.category === 'magazine' || t.category === 'lookbook';
          if (activeCategoryFilter === 'menu') return t.category === 'menu' || t.category === 'restaurant' || t.category === 'recipe';
          if (activeCategoryFilter === 'storybook') return t.category === 'storybook' || t.category === 'comic';
          if (activeCategoryFilter === 'business') return t.category === 'business' || t.category === 'pitch-deck' || t.category === 'handbook';
          if (activeCategoryFilter === 'portfolio') return t.category === 'portfolio' || t.category === 'photo-album';
          return true;
        }).slice(0, 6);

  const faqs = [
    {
      q: 'What is the best free PDF to 3D Flipbook converter without monthly fees?',
      a: 'FlipApp 3D (3D Flipbook Maker) is a free, client-side PDF to 3D flipbook converter and HTML5 digital publishing studio. Unlike traditional cloud platforms that charge $24 to $96 per month, FlipApp 3D lets you convert PDFs into realistic 3D page-turning books for free or unlock lifetime white-label rights with a single $19 one-time license.',
    },
    {
      q: 'Can I create and export 3D publications without creating an account?',
      a: 'Yes. FlipApp 3D operates on a strict client-side architecture. You never need to sign up, verify an email, or upload files to a remote cloud server. Open the studio directly in your browser, design or import your PDF, and export your standalone files immediately.',
    },
    {
      q: 'How does the Standalone Offline HTML5 export work?',
      a: 'Clicking "Export HTML" compiles your entire publication—including 3D page-turning physics, cover textures, embedded Base64 artwork, and Web Audio paper acoustics—into a single self-contained .html file. You can open it offline on any laptop or tablet, host it on your own domain, or embed it via iframe on WordPress, Shopify, Webflow, or Squarespace.',
    },
    {
      q: 'How do the Website iFrame Embed and QR Code features work without a cloud database?',
      a: 'Because FlipApp 3D never locks your books on a paid cloud server, you first export your standalone .html file and upload it to your own hosting (WordPress, Shopify, cPanel, GitHub Pages, or free Netlify Drop). Then paste your live link into the "Embed & QR" tab to generate a responsive <iframe> code and a 1000x1000px printable PNG QR code.',
    },
    {
      q: 'Are confidential PDF documents and company pitch decks kept 100% private?',
      a: '100% private. Every step of PDF vector page rendering and image encoding runs locally inside your browser using WebAssembly and HTML5 Canvas. Your proprietary documents never leave your device.',
    },
    {
      q: 'How does FlipApp 3D compare to Flipsnack, Issuu, and Heyzine?',
      a: 'Flipsnack, Issuu, and Heyzine require uploading documents to their cloud servers and paying $288 to $1,150+ per year to keep your embedded links active. FlipApp 3D processes files locally for complete privacy, generates self-contained .html files that never expire, and offers a $19 one-time Pro Lifetime license.',
    },
    {
      q: 'How does the 3D flipbook reader behave on mobile phones and tablets?',
      a: 'The engine automatically detects mobile viewports and activates a responsive single-leaf touch-swipe layout optimized for iOS Safari and Android Chrome. You can also install the studio as a standalone Progressive Web App (PWA) for full-screen offline reading.',
    },
    {
      q: 'What is included in the $19 Pro Creator and $49 Agency Lifetime Licenses?',
      a: 'The $19 Pro Creator Lifetime license unlocks unlimited bookshelf projects, up to 150 pages per PDF import, unlimited standalone HTML and vector PDF exports, 100% white-label watermark removal, and custom brand logo + website URL integration. The $49 Agency Commercial license adds full client commercial rights across up to 5 workstations.',
    },
  ];

  // High-Intent SEO / GEO / AEO Use Cases
  const industryUseCases = [
    {
      id: 'pdf-converter',
      code: '01 · PDF TO 3D BOOK',
      title: 'Free PDF to 3D Flipbook Converter',
      summary:
        'Transform static multi-page PDF documents, brochures, and manuals into interactive 3D books with realistic corner-curl physics and paper rustle audio in under 60 seconds.',
      keywords: 'Convert PDF to 3D Flipbook · Offline HTML5 · High-DPI Vector',
      actionLabel: 'Convert a PDF Now',
      onClick: () => (onOpenPdfModal ? onOpenPdfModal() : onStartCreating()),
    },
    {
      id: 'digital-catalog',
      code: '02 · E-COMMERCE & RETAIL',
      title: 'Interactive Digital Product Catalogs & Lookbooks',
      summary:
        'Publish seasonal fashion lookbooks, wholesale furniture catalogs, and jewelry collections. Embed directly onto Shopify, WooCommerce, Webflow, or WordPress without monthly plugin fees.',
      keywords: 'Digital Catalog Maker · Shopify Flipbook · Product Lookbook',
      actionLabel: 'Browse Catalog Templates',
      onClick: onOpenTemplates,
    },
    {
      id: 'qr-menu',
      code: '03 · HOSPITALITY & DINING',
      title: 'Restaurant, Cafe & Hotel 3D QR Code Menus',
      summary:
        'Replace flat, slow-loading PDF menus with a tactile 3D tasting menu or wine list. Export a self-hosted HTML file and generate a 1000×1000px print-ready QR code for table tents.',
      keywords: 'Interactive QR Menu · Digital Restaurant Menu · Wine List 3D',
      actionLabel: 'Open Menu Presets',
      onClick: onOpenTemplates,
    },
    {
      id: 'digital-magazine',
      code: '04 · EDITORIAL & PUBLISHING',
      title: 'Digital Magazines, Zines, Novels & Manga (RTL)',
      summary:
        'Combine 25+ modular editorial blocks—drop-cap articles, pull quotes, and photo spreads—with authentic hardcover foil shaders and Right-to-Left (RTL) reading support.',
      keywords: 'Online Magazine Maker · 3D eBook Creator · RTL Manga Reader',
      actionLabel: 'Launch Editorial Studio',
      onClick: onStartCreating,
    },
    {
      id: 'pitch-deck',
      code: '05 · ENTERPRISE & FINANCE',
      title: 'Confidential Investor Pitch Decks & Annual Reports',
      summary:
        'Because 100% of PDF parsing runs inside your local browser via WebAssembly, sensitive financial reports, NDA proposals, and board decks never touch an external cloud server.',
      keywords: 'Private Pitch Deck Flipbook · Zero-Cloud PDF · Annual Report',
      actionLabel: 'Import Confidential PDF',
      onClick: () => (onOpenPdfModal ? onOpenPdfModal() : onStartCreating()),
    },
    {
      id: 'flipsnack-alternative',
      code: '06 · SELF-HOSTED OWNERSHIP',
      title: 'The #1 Self-Hosted Flipsnack, Issuu & Heyzine Alternative',
      summary:
        'Stop paying $288–$1,150/year just to keep your publication links alive. Export a single self-contained .html file that you own and host on your own server forever.',
      keywords: 'Flipsnack Alternative · Issuu Alternative · No Monthly Fee',
      actionLabel: 'Compare Ownership Plans',
      onClick: () => {
        const el = document.getElementById('pricing');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      },
    },
  ];

  return (
    <div className="w-full h-full overflow-y-auto bg-[#FAFAFA] text-slate-900 scroll-smooth selection:bg-emerald-700 selection:text-white">
      {/* 1. EDITORIAL SAAS HERO SECTION */}
      <section className="relative overflow-hidden bg-white pt-10 sm:pt-16 lg:pt-20 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80">
        {/* Subtle Architectural Grid Background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* Unboxed Editorial Kicker */}
            <p className="text-[11px] sm:text-xs font-mono-code uppercase tracking-[0.18em] text-emerald-800 font-semibold">
              3D DIGITAL PUBLISHING ENGINE · ZERO CLOUD LOCK-IN · SELF-HOSTED HTML5
            </p>

            {/* Balanced Display Headline */}
            <h1
              className="font-extrabold text-slate-950 tracking-tight leading-[1.08]"
              style={{ fontSize: 'clamp(2.15rem, 4.5vw, 4rem)' }}
            >
              Turn Static PDFs &amp; Content Into{' '}
              <span className="font-serif-editorial italic font-normal text-emerald-800">
                Tactile 3D Publications
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Convert product catalogs, editorial magazines, restaurant menus, and investor pitch decks into interactive 3D flipbooks with double-sided sheet physics, procedural paper acoustics, and single-file offline HTML export.
            </p>

            {/* Primary & Secondary Action Hierarchy */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-xl mx-auto">
              <button
                onClick={onStartCreating}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-950 hover:bg-emerald-950 text-white text-sm font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2.5"
              >
                <span>Open 3D Studio Editor</span>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </button>

              {onOpenPdfModal && (
                <button
                  onClick={onOpenPdfModal}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Convert PDF to 3D Book</span>
                </button>
              )}

              <button
                onClick={onOpenTemplates}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold border border-slate-300 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Layers className="w-4 h-4 text-slate-600" />
                <span>24+ Templates</span>
              </button>
            </div>

            {/* Clean Quick-Utility Links */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-500">
              {onOpenBookshelf && (
                <button
                  onClick={onOpenBookshelf}
                  className="hover:text-slate-900 font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                  <span>My Saved Bookshelf</span>
                </button>
              )}
              <span className="text-slate-300 hidden sm:inline">·</span>
              {onOpenUploadModal && (
                <button
                  onClick={onOpenUploadModal}
                  className="hover:text-slate-900 font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Batch Image Importer</span>
                </button>
              )}
              <span className="text-slate-300 hidden sm:inline">·</span>
              {onOpenInstallModal && (
                <button
                  onClick={onOpenInstallModal}
                  className="hover:text-slate-900 font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Install Offline WebApp</span>
                </button>
              )}
              <span className="text-slate-300 hidden sm:inline">·</span>
              <a
                href="#pricing"
                className="hover:text-slate-900 font-medium transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Crown className="w-3.5 h-3.5 text-amber-600" />
                <span>Lifetime Deal ($19)</span>
              </a>
            </div>
          </div>

          {/* 4-Column Architectural Trust Bar */}
          <div className="mt-10 sm:mt-14 pt-8 border-t border-slate-200/80 grid grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono-code font-semibold text-emerald-800">
                <span>01</span>
                <span>·</span>
                <span>CLIENT-SIDE PRIVACY</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-900">Zero Cloud Upload</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                PDFs &amp; images render strictly inside your local browser sandbox.
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono-code font-semibold text-emerald-800">
                <span>02</span>
                <span>·</span>
                <span>TACTILE MECHANICS</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-900">60 FPS Page Physics</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Double-sided sheet curvature, spine shadows, and Web Audio paper sound.
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono-code font-semibold text-emerald-800">
                <span>03</span>
                <span>·</span>
                <span>SELF-CONTAINED EXPORT</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-900">Single-File .HTML &amp; .PDF</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Works 100% offline or embeds on WordPress, Shopify &amp; Webflow.
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono-code font-semibold text-emerald-800">
                <span>04</span>
                <span>·</span>
                <span>OWNERSHIP MODEL</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-900">No Monthly Subscriptions</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Start free or unlock white-label commercial rights with a one-time key.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE LIVE 3D FLIPBOOK SHOWCASE */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#F4F6F5] border-b border-slate-200">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header & Genre Switcher */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <p className="text-[11px] font-mono-code uppercase tracking-[0.16em] text-emerald-800 font-semibold">
                01 · INTERACTIVE 3D STAGE
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                Test the Live 3D Publication Engine
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Click or drag any page corner below—or switch publication genres to inspect real-time typography and paper acoustics.
              </p>
            </div>

            {/* Clean Genre Selector Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
              {demoPresets.map((preset, index) => (
                <button
                  key={preset.id}
                  onClick={() => setSelectedDemoIndex(index)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedDemoIndex === index
                      ? 'bg-slate-950 text-white shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Studio Browser Frame Around Live 3D Book */}
          <div className="rounded-2xl sm:rounded-3xl bg-slate-950 p-2 sm:p-3.5 shadow-2xl border border-slate-800">
            {/* Top Window Bar */}
            <div className="flex items-center justify-between px-3 pb-2.5 pt-1 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <span className="ml-2 font-mono-code text-[11px] text-slate-300 truncate max-w-[180px] sm:max-w-xs">
                  {activeDemoBook.title} — {activeDemoBook.pages.length} Pages
                </span>
              </div>

              <button
                onClick={() => onSelectTemplate(activeDemoBook)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-colors cursor-pointer"
              >
                <span>Edit This Book in Studio</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Interactive Flipbook Canvas */}
            <div className="w-full h-[430px] sm:h-[560px] lg:h-[620px] rounded-xl sm:rounded-2xl overflow-hidden relative bg-slate-100">
              <FlipbookPreview
                book={activeDemoBook}
                onExportHtml={() => {}}
                onEditPage={() => onSelectTemplate(activeDemoBook)}
                isMobileLayoutProp={false}
                readOnly={false}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. ASYMMETRIC BENTO CAPABILITIES GRID */}
      <section className="py-14 sm:py-22 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="max-w-2xl space-y-2">
            <p className="text-[11px] font-mono-code uppercase tracking-[0.16em] text-emerald-800 font-semibold">
              02 · PRODUCTION ARCHITECTURE
            </p>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Built for Publishers, Agencies &amp; Brands
            </h2>
            <p className="text-xs sm:text-base text-slate-600 leading-relaxed">
              Every tool required to convert static documents into high-converting interactive reading experiences without recurring cloud hosting fees.
            </p>
          </div>

          {/* Asymmetric Bento Grid (3 columns on lg) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Marquee Capability 01 (Spans 2 columns on lg) */}
            <div className="lg:col-span-2 p-6 sm:p-8 rounded-2xl bg-slate-950 text-white border border-slate-800 flex flex-col justify-between space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono-code text-emerald-400 font-semibold">
                  01 · STANDALONE PORTABILITY
                </span>
                <FileCode className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="space-y-2 max-w-xl">
                <h3 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
                  True Single-File Offline HTML5 &amp; Vector PDF Export
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Unlike SaaS platforms that hold your catalogs hostage behind a monthly paywall, FlipApp compiles your entire 3D book—images, cover gold-foil shaders, and Web Audio sound—into a single portable <code className="text-emerald-300 font-mono-code">.html</code> file you can host anywhere forever.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] font-mono-code text-slate-400">
                <span>✓ Base64 Asset Bundling</span>
                <span>·</span>
                <span>✓ Zero External Dependencies</span>
                <span>·</span>
                <span>✓ Instant Website &lt;iframe&gt; &amp; QR Code</span>
              </div>
            </div>

            {/* Capability 02 */}
            <div className="p-6 sm:p-7 rounded-2xl bg-[#FAFAFA] border border-slate-200/90 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono-code text-emerald-800 font-semibold">
                  02 · PRIVACY SANDBOX
                </span>
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-950">
                  100% Client-Side PDF Processing
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Import confidential pitch decks, financial reports, and internal handbooks with confidence. Files are parsed in-memory via WebAssembly and never touch an external server.
                </p>
              </div>
            </div>

            {/* Capability 03 */}
            <div className="p-6 sm:p-7 rounded-2xl bg-[#FAFAFA] border border-slate-200/90 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono-code text-emerald-800 font-semibold">
                  03 · ACOUSTICS &amp; PHYSICS
                </span>
                <Volume2 className="w-5 h-5 text-emerald-700" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-950">
                  Synthesized Paper Rustle &amp; Spine Shadows
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Procedural Web Audio API synthesis generates authentic paper friction acoustics synchronized with 3D leaf bending and dynamic spine lighting.
                </p>
              </div>
            </div>

            {/* Capability 04 (Spans 2 columns on lg) */}
            <div className="lg:col-span-2 p-6 sm:p-8 rounded-2xl bg-[#F4F6F5] border border-slate-200/90 flex flex-col justify-between space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono-code text-emerald-800 font-semibold">
                  04 · MODULAR EDITORIAL STUDIO &amp; WHITE-LABEL BRANDING
                </span>
                <Palette className="w-5 h-5 text-emerald-700" />
              </div>
              <div className="space-y-2 max-w-2xl">
                <h3 className="text-lg sm:text-xl font-bold text-slate-950">
                  24+ Publication Presets, 25+ Modular Blocks &amp; Custom Brand Logo
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Combine high-resolution PDF pages with editable editorial spreads—drop-cap articles, restaurant price tables, product grids, and luxury foil covers. Add your own company logo and clickable website link directly inside the reader bar.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={onOpenTemplates}
                  className="px-4 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>Browse 24+ Templates</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onStartCreating}
                  className="px-4 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Open Block Editor
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CURATED TEMPLATES GALLERY PREVIEW */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA] border-b border-slate-200">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <p className="text-[11px] font-mono-code uppercase tracking-[0.16em] text-emerald-800 font-semibold">
                03 · CURATED TEMPLATES
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                Ready-to-Publish 3D Book Presets
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
                Launch with a domain-specific layout or import your own PDF document in seconds.
              </p>
            </div>

            <button
              onClick={onOpenTemplates}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-800 hover:text-emerald-950 cursor-pointer"
            >
              <span>Explore All 24+ Templates</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Clean Category Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {categoryFilters.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryFilter(cat.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategoryFilter === cat.id
                    ? 'bg-slate-950 text-white shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Template Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <TemplateCardVisual
                key={template.id}
                template={template}
                onPreview={onPreviewTemplate}
                onSelect={(tpl) => onSelectTemplate(tpl.project)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. HIGH-INTENT INDUSTRY SOLUTIONS & USE CASES (SEO / GEO / AEO HUB) */}
      <section
        id="use-cases"
        aria-label="3D Flipbook Use Cases and Industry Solutions"
        className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200"
      >
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="max-w-3xl space-y-2">
            <p className="text-[11px] font-mono-code uppercase tracking-[0.16em] text-emerald-800 font-semibold">
              04 · INDUSTRY SOLUTIONS &amp; USE CASES
            </p>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              One 3D Publishing Engine for Every Document Format
            </h2>
            <p className="text-xs sm:text-base text-slate-600 leading-relaxed">
              Whether you are converting a 100-page wholesale PDF catalog, generating a table-tent QR restaurant menu, or replacing expensive Flipsnack and Issuu subscriptions, FlipApp 3D delivers instant self-hosted HTML5 output.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {industryUseCases.map((uc) => (
              <article
                key={uc.id}
                className="p-6 rounded-2xl bg-[#FAFAFA] border border-slate-200/90 hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <span className="text-[11px] font-mono-code font-semibold text-emerald-800 uppercase tracking-wider">
                    {uc.code}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-950 leading-snug">
                    {uc.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {uc.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/80 space-y-3">
                  <p className="text-[11px] font-mono-code text-slate-500">
                    {uc.keywords}
                  </p>
                  <button
                    onClick={uc.onClick}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-950 hover:text-emerald-800 transition-colors cursor-pointer"
                  >
                    <span>{uc.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 6. ARCHITECTURAL COMPARISON TABLE */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA] border-b border-slate-200">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="max-w-2xl space-y-2">
            <p className="text-[11px] font-mono-code uppercase tracking-[0.16em] text-emerald-800 font-semibold">
              05 · PLATFORM COMPARISON
            </p>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Why Publishers Switch to FlipApp 3D
            </h2>
            <p className="text-xs sm:text-base text-slate-600 leading-relaxed">
              Eliminate recurring $24–$96/month SaaS subscriptions while keeping 100% ownership of your exported HTML5 and PDF publications.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="p-4 sm:p-5 font-bold text-slate-900">Capability</th>
                  <th className="p-4 sm:p-5 font-extrabold text-emerald-950 bg-emerald-50/70 border-x border-emerald-200">
                    FlipApp 3D Studio
                  </th>
                  <th className="p-4 sm:p-5 font-semibold text-slate-600">Flipsnack / Issuu</th>
                  <th className="p-4 sm:p-5 font-semibold text-slate-600">Static PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70">
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-slate-900">
                    Standalone Offline HTML Export
                    <span className="block text-[11px] font-normal text-slate-500">Self-contained single file</span>
                  </td>
                  <td className="p-4 sm:p-5 bg-emerald-50/30 border-x border-emerald-100 font-bold text-emerald-800">
                    ✓ Included (100% Offline)
                  </td>
                  <td className="p-4 sm:p-5 text-slate-500">Cloud Lock-In Only</td>
                  <td className="p-4 sm:p-5 text-slate-500">Static Scroll Only</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-slate-900">
                    Licensing &amp; Cost Structure
                    <span className="block text-[11px] font-normal text-slate-500">Long-term ownership</span>
                  </td>
                  <td className="p-4 sm:p-5 bg-emerald-50/30 border-x border-emerald-100 font-bold text-emerald-800">
                    $0 Free / $19 One-Time Lifetime
                  </td>
                  <td className="p-4 sm:p-5 text-rose-700 font-medium">$288 – $1,150 / Year</td>
                  <td className="p-4 sm:p-5 text-slate-500">Free</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-slate-900">
                    Document Data Privacy
                    <span className="block text-[11px] font-normal text-slate-500">Where files are processed</span>
                  </td>
                  <td className="p-4 sm:p-5 bg-emerald-50/30 border-x border-emerald-100 font-bold text-emerald-800">
                    ✓ 100% Local Browser Sandbox
                  </td>
                  <td className="p-4 sm:p-5 text-slate-500">Uploaded to 3rd-Party Cloud</td>
                  <td className="p-4 sm:p-5 text-slate-600">Local File</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-slate-900">
                    White-Label Custom Brand Logo
                    <span className="block text-[11px] font-normal text-slate-500">Your own brand &amp; website link</span>
                  </td>
                  <td className="p-4 sm:p-5 bg-emerald-50/30 border-x border-emerald-100 font-bold text-emerald-800">
                    ✓ Included in Pro ($19)
                  </td>
                  <td className="p-4 sm:p-5 text-slate-500">Enterprise Tier ($79+/mo)</td>
                  <td className="p-4 sm:p-5 text-slate-500">None</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 7. 3-TIER GUMROAD LIFETIME PRICING SECTION */}
      <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#0B1310] text-white border-b border-slate-800">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <p className="text-[11px] font-mono-code uppercase tracking-[0.18em] text-emerald-400 font-semibold">
              06 · ONE-TIME LIFETIME LICENSING
            </p>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Pay Once. Own Forever.
            </h2>
            <p className="text-xs sm:text-base text-slate-300 leading-relaxed">
              Start free in the studio today, or unlock unlimited white-label HTML &amp; Vector PDF exports with a one-time Gumroad license key.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Tier 1: Free Starter */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 sm:p-7 flex flex-col justify-between">
              <div className="space-y-5">
                <div>
                  <span className="text-xs font-mono-code uppercase tracking-wider text-slate-400">
                    01 · Free Starter
                  </span>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white">$0</span>
                    <span className="text-xs text-slate-400">/ forever</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">
                    Full studio access to design and test your first 3D flipbook.
                  </p>
                </div>

                <ul className="space-y-3 text-xs sm:text-sm text-slate-300 border-t border-slate-800 pt-5">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Up to 3 Active Bookshelf Projects</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>1 Free PDF Import (up to 15 pages)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>1 Free Book Export (.HTML or .PDF)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Website &lt;iframe&gt; Embed &amp; QR Code</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-slate-500 text-xs">
                    <span>• Includes "Created with FlipApp 3D" badge</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={onStartCreating}
                className="mt-8 w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Start Free in Studio
              </button>
            </div>

            {/* Tier 2: Pro Creator Lifetime (Highlighted) */}
            <div className="rounded-2xl bg-gradient-to-b from-emerald-950/90 to-slate-900 border-2 border-emerald-500 p-6 sm:p-7 flex flex-col justify-between shadow-2xl relative">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono-code uppercase tracking-wider text-emerald-400 font-semibold">
                    02 · Pro Creator Lifetime
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono-code font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    MOST POPULAR
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white">$19</span>
                    <span className="text-sm text-slate-400 line-through font-semibold">$29</span>
                    <span className="text-xs text-emerald-300 font-mono-code">one-time</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1.5">
                    For creators, educators, authors &amp; businesses.
                  </p>
                </div>

                <ul className="space-y-3 text-xs sm:text-sm text-slate-100 border-t border-emerald-800/60 pt-5">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>Unlimited</strong> Books &amp; PDF Imports</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Up to <strong>150 Pages</strong> per PDF File</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>Unlimited</strong> Standalone .HTML &amp; Vector .PDF</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>100% White-Label</strong> (No Watermark Badge)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>Custom Brand Logo &amp; Website Link</strong></span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 space-y-2.5">
                <a
                  href="https://tabrej6.gumroad.com/l/3d-flipbook-pro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Crown className="w-4 h-4 text-slate-950" />
                  <span>Get Pro Lifetime License ($19)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                {onOpenLicenseModal && (
                  <button
                    onClick={onOpenLicenseModal}
                    className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>Already have a license key? Activate</span>
                  </button>
                )}
              </div>
            </div>

            {/* Tier 3: Agency & Commercial */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 sm:p-7 flex flex-col justify-between">
              <div className="space-y-5">
                <div>
                  <span className="text-xs font-mono-code uppercase tracking-wider text-amber-400">
                    03 · Agency Commercial
                  </span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white">$49</span>
                    <span className="text-xs text-slate-400 font-mono-code">one-time</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">
                    Create &amp; sell custom 3D flipbooks to unlimited clients.
                  </p>
                </div>

                <ul className="space-y-3 text-xs sm:text-sm text-slate-300 border-t border-slate-800 pt-5">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>Everything in Pro Creator Lifetime</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>Full Client Commercial Rights</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Client Custom Logo &amp; Domain Link</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Activate on up to 5 Agency Devices</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Priority Lifetime Engine Updates</span>
                  </li>
                </ul>
              </div>

              <a
                href="https://tabrej6.gumroad.com/l/3d-flipbook-pro"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Get Agency License ($49)</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-700" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FREQUENTLY ASKED QUESTIONS & AEO KNOWLEDGE GRAPH */}
      <section
        id="faq"
        itemScope
        itemType="https://schema.org/FAQPage"
        className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200"
      >
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-2">
            <p className="text-[11px] font-mono-code uppercase tracking-[0.16em] text-emerald-800 font-semibold">
              07 · TECHNICAL FAQ &amp; DIRECT ANSWERS
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Everything you need to know about converting PDFs to 3D flipbooks, self-hosting standalone HTML5 exports, and commercial licensing.
            </p>
          </div>

          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  itemScope
                  itemProp="mainEntity"
                  itemType="https://schema.org/Question"
                  className="py-4"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="w-full text-left flex items-center justify-between gap-4 font-bold text-slate-900 hover:text-emerald-800 text-sm sm:text-base cursor-pointer py-1"
                  >
                    <span itemProp="name">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-emerald-700' : ''
                      }`}
                    />
                  </button>

                  {/* Keep answer in DOM with sr-only when collapsed so Googlebot & AI Answer Engines index 100% of Q&A pairs */}
                  <div
                    itemScope
                    itemProp="acceptedAnswer"
                    itemType="https://schema.org/Answer"
                    className={isOpen ? 'pt-2.5 pb-1 block' : 'sr-only'}
                  >
                    <p itemProp="text" className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. QUIET ARCHITECTURAL FOOTER WITH CRAWLABLE SEO & LLM INDEX LINKS */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-950 text-slate-400 text-xs">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center text-white">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-white tracking-tight">FlipApp 3D Studio</span>
                <span className="text-slate-600">·</span>
                <span className="font-mono-code text-[11px] text-slate-400">3D Flipbook Maker &amp; PDF Converter</span>
              </div>
              <p className="text-[11px] text-slate-500">
                100% Private Local Browser Processing. Standalone Offline HTML5 &amp; Vector PDF Export. Zero Cloud Lock-In.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium">
              <button onClick={onStartCreating} className="hover:text-white transition-colors cursor-pointer">
                3D Studio
              </button>
              <button onClick={onOpenTemplates} className="hover:text-white transition-colors cursor-pointer">
                Templates (24+)
              </button>
              {onOpenPdfModal && (
                <button onClick={onOpenPdfModal} className="hover:text-white transition-colors cursor-pointer">
                  PDF to 3D Flipbook
                </button>
              )}
              {onOpenLicenseModal && (
                <button onClick={onOpenLicenseModal} className="hover:text-white transition-colors cursor-pointer">
                  Activate License Key
                </button>
              )}
              <a
                href="https://tabrej6.gumroad.com/l/3d-flipbook-pro"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Gumroad Pro ($19)
              </a>
            </div>
          </div>

          {/* Crawlable SEO Use-Cases & AI / LLM Discovery Links */}
          <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] text-slate-500">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              <a href="/?view=pdf-to-flipbook" className="hover:text-slate-300 transition-colors">
                PDF to 3D Flipbook Converter
              </a>
              <span>·</span>
              <a href="/?view=templates" className="hover:text-slate-300 transition-colors">
                Digital Catalog &amp; Lookbook Maker
              </a>
              <span>·</span>
              <a href="/?usecase=restaurant-qr-menu" className="hover:text-slate-300 transition-colors">
                3D QR Restaurant Menu
              </a>
              <span>·</span>
              <a href="/?usecase=flipsnack-alternative" className="hover:text-slate-300 transition-colors">
                Flipsnack &amp; Issuu Alternative
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono-code">
              <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors">
                Sitemap.xml
              </a>
              <span>·</span>
              <a href="/llms.txt" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors">
                LLMs.txt
              </a>
              <span>·</span>
              <a href="/llms-full.txt" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors">
                LLMs-Full.txt
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
