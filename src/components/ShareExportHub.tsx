import React, { useState, useEffect } from 'react';
import { BookProject } from '../types/flipbook';
import {
  Download,
  FileText,
  FileCode,
  CheckCircle2,
  ExternalLink,
  X,
  Zap,
  Crown,
  Loader2,
  Code2,
  QrCode,
  Copy,
  Check,
  Globe,
} from 'lucide-react';
import { getLicenseInfo, onLicenseChange, canExportHtml, onUsageChange } from '../utils/licenseManager';
import { exportBookToPdf, PdfExportProgress } from '../utils/exportPdf';

interface ShareExportHubProps {
  book: BookProject;
  isOpen: boolean;
  onClose: () => void;
  onExportHtml: () => void;
  onLoadProjectJson?: (project: BookProject) => void;
  onOpenInstallModal?: () => void;
  onOpenReader?: () => void;
  onOpenLicenseModal?: () => void;
}

type ExportTabType = 'html' | 'pdf' | 'embed';

export const ShareExportHub: React.FC<ShareExportHubProps> = ({
  book,
  isOpen,
  onClose,
  onExportHtml,
  onOpenLicenseModal,
}) => {
  const [license, setLicense] = useState(() => getLicenseInfo());
  const [exportStatus, setExportStatus] = useState(() => canExportHtml());
  const [activeTab, setActiveTab] = useState<ExportTabType>('html');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [pdfProgress, setPdfProgress] = useState<PdfExportProgress | null>(null);
  const [pdfSuccess, setPdfSuccess] = useState<boolean>(false);

  // Embed & QR Code generator state
  const slugName =
    book.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'flipbook';
  const [hostedUrl, setHostedUrl] = useState<string>(`https://yourwebsite.com/${slugName}.html`);
  const [embedHeight, setEmbedHeight] = useState<string>('640');
  const [copiedEmbed, setCopiedEmbed] = useState<boolean>(false);

  useEffect(() => {
    const unsubLicense = onLicenseChange((info) => {
      setLicense(info);
      setExportStatus(canExportHtml());
    });
    const unsubUsage = onUsageChange(() => {
      setExportStatus(canExportHtml());
    });
    return () => {
      unsubLicense();
      unsubUsage();
    };
  }, []);

  if (!isOpen) return null;

  const isPro = license.tier === 'pro';

  const iframeEmbedCode = `<iframe
  src="${hostedUrl.trim() || `https://yourwebsite.com/${slugName}.html`}"
  width="100%"
  height="${embedHeight}px"
  style="border:none; border-radius:14px; box-shadow:0 12px 32px rgba(0,0,0,0.14); overflow:hidden;"
  allowfullscreen
  loading="lazy"
  title="${book.title.replace(/"/g, '&quot;')}"
></iframe>`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=12&data=${encodeURIComponent(
    hostedUrl.trim() || `https://yourwebsite.com/${slugName}.html`
  )}`;

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(iframeEmbedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2500);
  };

  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    setPdfSuccess(false);
    setPdfProgress({
      currentPage: 0,
      totalPages: book.pages.length,
      statusText: 'Starting PDF compilation...',
    });

    try {
      await exportBookToPdf(book, (prog) => {
        setPdfProgress(prog);
      });
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150 text-slate-800">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                Export &amp; Publish Book
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                1. Interactive HTML • 2. Vector PDF • 3. Website Embed &amp; QR • {book.pages.length} Pages
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3-Option Selector Tabs: 1. HTML, 2. PDF, 3. Embed & QR */}
        <div className="p-2.5 bg-slate-100/90 border-b border-slate-200">
          <div className="grid grid-cols-3 gap-2">
            {/* Option 1: HTML */}
            <button
              onClick={() => setActiveTab('html')}
              className={`px-2.5 sm:px-3.5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'html'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-700/25'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <FileCode className="w-4 h-4 shrink-0" />
              <span className="truncate">1. HTML</span>
              <span
                className={`hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-extrabold tracking-wider shrink-0 ${
                  activeTab === 'html'
                    ? 'bg-amber-400 text-amber-950'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                3D FLIP
              </span>
            </button>

            {/* Option 2: PDF */}
            <button
              onClick={() => setActiveTab('pdf')}
              className={`px-2.5 sm:px-3.5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'pdf'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-700/25'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span className="truncate">2. PDF</span>
              <span
                className={`hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-extrabold tracking-wider shrink-0 ${
                  activeTab === 'pdf'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                VECTOR
              </span>
            </button>

            {/* Option 3: Website Embed & QR */}
            <button
              onClick={() => setActiveTab('embed')}
              className={`px-2.5 sm:px-3.5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'embed'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-700/25'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Code2 className="w-4 h-4 shrink-0" />
              <span className="truncate">3. Embed &amp; QR</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {/* OPTION 1: STANDALONE HTML */}
          {activeTab === 'html' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {!isPro && !exportStatus.allowed ? (
                <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/90 border-2 border-amber-300 relative overflow-hidden space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-200 text-amber-900 uppercase">
                        LIMIT REACHED
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">
                        1 of 1 Free HTML Export Used
                      </h4>
                    </div>
                    <span className="text-xs text-amber-900 font-bold bg-amber-100 px-2.5 py-1 rounded-md border border-amber-300 self-start sm:self-auto">
                      Free Plan Limit Reached
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-xl">
                    You have already downloaded your <strong>1 free standalone HTML export</strong>. Upgrade to{' '}
                    <strong>Pro Lifetime ($29)</strong> to download unlimited self-contained 3D flipbooks, 100% white-label with zero watermarks!
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <a
                      href="https://tabrej6.gumroad.com/l/3d-flipbook-pro"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-black text-sm shadow-md transition-all cursor-pointer group"
                    >
                      <Crown className="w-4 h-4 text-slate-950" />
                      <span>Unlock Unlimited Exports ($29)</span>
                      <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </a>

                    {onOpenLicenseModal && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenLicenseModal();
                        }}
                        className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold transition-all cursor-pointer"
                      >
                        Redeem Pro Key
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white border-2 border-emerald-400 relative overflow-hidden space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 uppercase shadow-xs flex items-center gap-1">
                        <Zap className="w-3 h-3 fill-amber-950 text-amber-950" />
                        INTERACTIVE 3D
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">
                        Standalone 3D Flipbook (.HTML)
                      </h4>
                    </div>
                    <span className="text-xs text-emerald-800 font-mono font-bold bg-emerald-100/80 px-2 py-0.5 rounded-md self-start sm:self-auto">
                      100% Offline Ready
                    </span>
                  </div>

                  {!isPro && (
                    <div className="p-2.5 px-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-amber-600" />
                        <span>
                          Free Starter: <strong>0 of 1 Export Used</strong> (1 Free Download Available)
                        </span>
                      </div>
                      {onOpenLicenseModal && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenLicenseModal();
                          }}
                          className="font-bold underline text-amber-800 hover:text-amber-950 cursor-pointer shrink-0"
                        >
                          Go Unlimited
                        </button>
                      )}
                    </div>
                  )}

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Downloads your complete book with realistic 3D corner-curl page flipping, desktop dual-page & mobile single-page physics, and page-turn sound effects inside a single{' '}
                    <code className="bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-bold text-xs">
                      .html
                    </code>{' '}
                    file.
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <button
                      onClick={onExportHtml}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-700/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Interactive .HTML</span>
                    </button>

                    {isPro ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-xs font-bold">
                        <Crown className="w-3.5 h-3.5 text-amber-600" />
                        <span>100% White-Label</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500">
                        Works on any browser, mobile & desktop without internet.
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* OPTION 2: FULL BOOK PDF EXPORT */}
          {activeTab === 'pdf' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {!isPro && !exportStatus.allowed ? (
                <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/90 border-2 border-amber-300 relative overflow-hidden space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-200 text-amber-900 uppercase">
                        LIMIT REACHED
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">
                        1 of 1 Free Book Export Used
                      </h4>
                    </div>
                    <span className="text-xs text-amber-900 font-bold bg-amber-100 px-2.5 py-1 rounded-md border border-amber-300 self-start sm:self-auto">
                      Free Plan Limit Reached
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-xl">
                    You have already downloaded your <strong>1 free book export</strong>. Upgrade to{' '}
                    <strong>Pro Lifetime ($29)</strong> to download unlimited Native Vector Digital PDFs and interactive 3D HTML flipbooks with 100% white-label branding!
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <a
                      href="https://tabrej6.gumroad.com/l/3d-flipbook-pro"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-black text-sm shadow-md transition-all cursor-pointer group"
                    >
                      <Crown className="w-4 h-4 text-slate-950" />
                      <span>Unlock Unlimited PDF & HTML Exports ($29)</span>
                      <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </a>

                    {onOpenLicenseModal && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenLicenseModal();
                        }}
                        className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold transition-all cursor-pointer"
                      >
                        Redeem Pro Key
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 border-2 border-slate-200 relative overflow-hidden space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-600 text-white uppercase shadow-xs">
                        VECTOR DIGITAL PDF
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">
                        Native Digital Book PDF ({book.pages.length} Pages)
                      </h4>
                    </div>
                    <span className="text-xs text-emerald-800 font-mono font-bold bg-emerald-100/80 px-2.5 py-0.5 rounded-md border border-emerald-200 self-start sm:self-auto">
                      Selectable Text + Links + Images
                    </span>
                  </div>

                  {!isPro && (
                    <div className="p-2.5 px-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-amber-600" />
                        <span>
                          Free Starter: <strong>0 of 1 Export Used</strong> (1 Free Download Available)
                        </span>
                      </div>
                      {onOpenLicenseModal && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenLicenseModal();
                          }}
                          className="font-bold underline text-amber-800 hover:text-amber-950 cursor-pointer shrink-0"
                        >
                          Go Unlimited
                        </button>
                      )}
                    </div>
                  )}

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Compiles all <strong>{book.pages.length} pages</strong> of your book into a true{' '}
                    <strong>Vector / Native Digital</strong>{' '}
                    <code className="bg-slate-100 text-slate-900 px-1.5 py-0.5 rounded font-bold text-xs">
                      .pdf
                    </code>{' '}
                    document with <strong>100% selectable &amp; searchable text</strong>,{' '}
                    <strong>clickable links &amp; Table of Contents navigation</strong>, razor-sharp vector borders/shapes, and embedded high-resolution images.
                  </p>

                  {/* Progress Indicator while generating PDF */}
                  {isGeneratingPdf && pdfProgress && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                          {pdfProgress.statusText}
                        </span>
                        <span className="font-mono">
                          {Math.round(
                            (pdfProgress.currentPage / Math.max(1, pdfProgress.totalPages)) * 100
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full h-2 bg-emerald-200/70 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 transition-all duration-200 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round(
                                (pdfProgress.currentPage / Math.max(1, pdfProgress.totalPages)) * 100
                              )
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {pdfSuccess && !isGeneratingPdf && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>All {book.pages.length} pages exported to Vector Digital PDF successfully!</span>
                    </div>
                  )}

                  <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      disabled={isGeneratingPdf}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-extrabold text-sm shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                      {isGeneratingPdf ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Compiling Vector PDF ({pdfProgress?.currentPage || 0}/{book.pages.length})...</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 text-emerald-400" />
                          <span>Download Vector Book (.PDF)</span>
                        </>
                      )}
                    </button>

                    <span className="text-[11px] text-slate-500">
                      Native A4 Vector PDF • Selectable Text • Active Hyperlinks
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* OPTION 3: WEBSITE EMBED & QR CODE GENERATOR */}
          {activeTab === 'embed' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-600 text-white uppercase">
                        WORDPRESS • SHOPIFY • ANY SITE
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">
                        Responsive Website Embed &amp; Print QR Code
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Zero-Cloud Self-Hosted Workflow: Own your flipbook 100% forever without paying recurring monthly server fees.
                    </p>
                  </div>
                </div>

                {/* 3-Step Self-Hosted Visual Guide */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-md bg-slate-950 text-white text-[10px] font-mono-code font-bold flex items-center justify-center shrink-0 mt-0.5">
                      01
                    </span>
                    <div className="text-[11px] leading-snug">
                      <p className="font-bold text-slate-900">Download .HTML File</p>
                      <p className="text-slate-500 mt-0.5">
                        Export your self-contained <code className="text-emerald-700 font-semibold">.html</code> book from Tab 1.
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-md bg-slate-950 text-white text-[10px] font-mono-code font-bold flex items-center justify-center shrink-0 mt-0.5">
                      02
                    </span>
                    <div className="text-[11px] leading-snug">
                      <p className="font-bold text-slate-900">Upload to Any Host</p>
                      <p className="text-slate-500 mt-0.5">
                        Upload to your domain, cPanel, WordPress, or free <span className="font-semibold text-slate-700">Netlify Drop</span>.
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-md bg-emerald-700 text-white text-[10px] font-mono-code font-bold flex items-center justify-center shrink-0 mt-0.5">
                      03
                    </span>
                    <div className="text-[11px] leading-snug">
                      <p className="font-bold text-slate-900">Paste Link Below</p>
                      <p className="text-slate-500 mt-0.5">
                        Get instant <code className="text-emerald-700 font-semibold">&lt;iframe&gt;</code> code &amp; 1000px Print QR.
                      </p>
                    </div>
                  </div>
                </div>

                {/* URL Input + Height Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Hosted Flipbook URL
                    </label>
                    <div className="relative">
                      <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={hostedUrl}
                        onChange={(e) => setHostedUrl(e.target.value)}
                        placeholder={`https://yourwebsite.com/${slugName}.html`}
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Embed Height
                    </label>
                    <select
                      value={embedHeight}
                      onChange={(e) => setEmbedHeight(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="520">Compact (520px)</option>
                      <option value="640">Standard (640px)</option>
                      <option value="760">Cinema Tall (760px)</option>
                    </select>
                  </div>
                </div>

                {/* Copyable Iframe Code + QR Code Side-by-Side */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch pt-1">
                  <div className="sm:col-span-2 flex flex-col justify-between bg-slate-900 text-slate-100 rounded-xl p-3.5 border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5" />
                        HTML &lt;iframe&gt; Embed Snippet
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyEmbed}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        {copiedEmbed ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Code</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed select-all bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                      {iframeEmbedCode}
                    </pre>
                  </div>

                  {/* QR Code Card */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col items-center justify-between text-center shadow-xs">
                    <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1 mb-2">
                      <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Mobile Scan QR</span>
                    </div>
                    <div className="w-28 h-28 rounded-lg border border-slate-200 p-1.5 bg-white flex items-center justify-center">
                      <img
                        src={qrImageUrl}
                        alt="Flipbook QR Code"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <a
                      href={qrImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={`${slugName}-qr.png`}
                      className="mt-2.5 w-full py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 border border-slate-200 text-[11px] font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Open / Save QR</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>1. Standalone HTML • 2. Vector PDF • 3. Website Embed &amp; QR</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold cursor-pointer shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
