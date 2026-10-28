import React, { useState, useRef, useEffect } from 'react';
import { BookProject, CoverThemeId } from '../types/flipbook';
import { COVER_THEMES } from '../constants/templates';
import { inspectPdfFile, convertPdfToFlipbook, PdfMetadata } from '../utils/pdfToFlipbook';
import { getLicenseInfo, getPlanLimits, onLicenseChange, canImportPdf, recordPdfImport, onUsageChange } from '../utils/licenseManager';
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  ArrowRight,
  Sliders,
  Eye,
  FileCheck,
  Zap,
  BookOpen,
  Crown,
  ExternalLink,
} from 'lucide-react';

interface PdfImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (project: BookProject, mode: 'new' | 'append') => void;
  currentBookPageCount?: number;
  onOpenLicenseModal?: () => void;
}

export const PdfImportModal: React.FC<PdfImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
  currentBookPageCount = 0,
  onOpenLicenseModal,
}) => {
  const [license, setLicense] = useState(() => getLicenseInfo());
  const [importStatus, setImportStatus] = useState(() => canImportPdf());

  useEffect(() => {
    const unsubLicense = onLicenseChange((info) => {
      setLicense(info);
      setImportStatus(canImportPdf());
    });
    const unsubUsage = onUsageChange(() => {
      setImportStatus(canImportPdf());
    });
    return () => {
      unsubLicense();
      unsubUsage();
    };
  }, []);

  const limits = getPlanLimits(license.tier);
  const isPro = license.tier === 'pro';

  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<PdfMetadata | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Settings
  const [bookTitle, setBookTitle] = useState('');
  const [scaleQuality, setScaleQuality] = useState<number>(1.8);
  const [startPage, setStartPage] = useState<number>(1);
  const [endPage, setEndPage] = useState<number>(1);
  const [makeFirstPageCover, setMakeFirstPageCover] = useState(true);
  const [makeLastPageBackCover, setMakeLastPageBackCover] = useState(true);
  const [selectedThemeId, setSelectedThemeId] = useState<CoverThemeId>('emerald-gold');
  const [importMode, setImportMode] = useState<'new' | 'append'>('new');

  // Conversion Progress
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
    percent: number;
    statusText: string;
  }>({
    current: 0,
    total: 0,
    percent: 0,
    statusText: '',
  });

  const [renderedThumbnails, setRenderedThumbnails] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a valid .PDF document.');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setIsAnalyzing(true);
    setRenderedThumbnails([]);

    try {
      const meta = await inspectPdfFile(selectedFile);
      setMetadata(meta);
      setBookTitle(meta.title || selectedFile.name.replace(/\.pdf$/i, ''));
      setStartPage(1);
      const safeEnd = Math.min(meta.numPages, limits.maxPdfPages);
      setEndPage(safeEnd);
    } catch (err: any) {
      setError(err?.message || 'Failed to parse PDF metadata. File may be password protected or corrupted.');
      setFile(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleStartConversion = async () => {
    if (!file || !metadata) return;

    const requestedCount = endPage - startPage + 1;
    if (!isPro && requestedCount > limits.maxPdfPages) {
      setError(`Free Starter plan is limited to ${limits.maxPdfPages} pages per conversion. Please select up to ${limits.maxPdfPages} pages, or upgrade to Pro.`);
      return;
    }

    if (!isPro && !importStatus.allowed) {
      setError(importStatus.reason || 'Free plan limit reached. Upgrade to Pro for unlimited PDF conversions.');
      return;
    }

    setIsConverting(true);
    setError(null);

    try {
      const result = await convertPdfToFlipbook(file, {
        scale: scaleQuality,
        startPage,
        endPage,
        makeFirstPageCover,
        makeLastPageBackCover,
        title: bookTitle,
        themeId: selectedThemeId,
        onProgress: (p) => {
          setProgress(p);
        },
      });

      setRenderedThumbnails(result.thumbnails);
      // Wait a moment so user sees 100% completion
      setTimeout(() => {
        setIsConverting(false);
        recordPdfImport();
        onImportComplete(result.project, importMode);
        onClose();
      }, 500);
    } catch (err: any) {
      setError(err?.message || 'Conversion failed during page rendering.');
      setIsConverting(false);
    }
  };

  const resetSelection = () => {
    setFile(null);
    setMetadata(null);
    setError(null);
    setRenderedThumbnails([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-3xl max-h-[92vh] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-800">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shadow-md shadow-rose-900/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Convert PDF to 3D Flipbook
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                  Client-Side Engine
                </span>
              </div>
              <p className="text-xs text-slate-500">
                100% Private • No Server Upload • Real Double-Sided 3D Page Physics
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isConverting}
            className="w-8 h-8 rounded-xl bg-white hover:bg-slate-200 border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50/50">
          
          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Free Tier Limit Reached Screen */}
          {!isPro && !importStatus.allowed ? (
            <div className="p-6 sm:p-10 rounded-3xl bg-white border border-amber-300 shadow-md text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
                <Crown className="w-8 h-8 text-amber-600" />
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold uppercase tracking-wider">
                  Free Starter Limit: 1/1 PDF Imports Used
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  Free PDF Conversion Limit Reached
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  The Free Starter plan allows converting <strong>1 PDF</strong>. You have already used your 1 free conversion. Upgrade to Pro Lifetime to convert unlimited PDF documents, up to 150 pages per file, with 100% white-label exports!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href="https://tabrej6.gumroad.com/l/3d-flipbook-pro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <Crown className="w-4 h-4 text-slate-950" />
                  <span>Get Unlimited PDF Imports ($29)</span>
                  <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </a>

                {onOpenLicenseModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenLicenseModal();
                    }}
                    className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 transition-all cursor-pointer"
                  >
                    Redeem License Key
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Free Plan Status Banner */}
              {!isPro && !file && (
                <div className="p-3 px-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>Free Starter Plan: <strong>0 of 1 PDF Import Used</strong> (1 Free Conversion Available)</span>
                  </div>
                  {onOpenLicenseModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenLicenseModal();
                      }}
                      className="text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer shrink-0"
                    >
                      Upgrade to Unlimited
                    </button>
                  )}
                </div>
              )}

              {/* STEP 1: Upload or Drop PDF */}
              {!file && (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-3xl p-8 sm:p-12 text-center bg-white hover:bg-emerald-50/20 transition-all cursor-pointer group space-y-4 shadow-xs"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    accept=".pdf,application/pdf"
                    className="hidden"
                  />

                  <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-xs">
                    <Upload className="w-8 h-8" />
                  </div>

                  <div className="space-y-1.5 max-w-md mx-auto">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      Drag & Drop PDF document here
                    </h3>
                    <p className="text-xs text-slate-500">
                      Supports magazines, restaurant menus, product catalogs, portfolios, reports, and books.
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-700/20">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Browse Computer or Phone</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* STEP 2: PDF Inspect & Customization Settings */}
          {file && metadata && !isConverting && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* File Info Bar */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 shrink-0 font-bold text-xs">
                    PDF
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                      {file.name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • {metadata.numPages} Total Pages • {metadata.pageSize.width}x{metadata.pageSize.height}px
                    </p>
                  </div>
                </div>

                <button
                  onClick={resetSelection}
                  className="text-xs text-slate-500 hover:text-rose-600 underline font-semibold cursor-pointer shrink-0"
                >
                  Change File
                </button>
              </div>

              {/* Free Plan Page Limitation & Upgrade Notice */}
              {metadata.numPages > limits.maxPdfPages && !isPro && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-amber-950">
                        Free Starter Limit: {limits.maxPdfPages} Pages Max
                      </h5>
                      <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                        This PDF has <strong>{metadata.numPages} pages</strong>. Free Starter converts up to {limits.maxPdfPages} pages at a time. Upgrade to Pro to convert up to 150 pages with zero watermarks.
                      </p>
                    </div>
                  </div>

                  {onOpenLicenseModal && (
                    <button
                      type="button"
                      onClick={onOpenLicenseModal}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 text-white font-bold text-xs shadow-sm shadow-amber-600/20 transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
                    >
                      <Crown className="w-3.5 h-3.5 text-amber-200" />
                      <span>Unlock 150 Pages</span>
                    </button>
                  )}
                </div>
              )}

              {/* Settings Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Book Title */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Flipbook Title</span>
                  </label>
                  <input
                    type="text"
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    placeholder="Enter flipbook title..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                {/* Page Range Selector */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2.5 shadow-xs">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Page Range to Convert</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <span className="text-[10px] text-slate-500 block mb-1">From Page</span>
                      <input
                        type="number"
                        min={1}
                        max={metadata.numPages}
                        value={startPage}
                        onChange={(e) => setStartPage(Math.max(1, Math.min(metadata.numPages, parseInt(e.target.value) || 1)))}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 font-bold"
                      />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] text-slate-500 block mb-1">To Page</span>
                      <input
                        type="number"
                        min={startPage}
                        max={metadata.numPages}
                        value={endPage}
                        onChange={(e) => setEndPage(Math.max(startPage, Math.min(metadata.numPages, parseInt(e.target.value) || 1)))}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 font-bold"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Converting {endPage - startPage + 1} of {metadata.numPages} pages.
                  </p>
                </div>

                {/* Rendering Quality / Resolution */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2.5 shadow-xs">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Rendering Clarity / Resolution</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: 'Standard', scale: 1.4, desc: 'Faster' },
                      { label: 'HD Crisp', scale: 1.8, desc: 'Recommended' },
                      { label: 'Retina 2K', scale: 2.3, desc: 'Ultra Clean' },
                    ].map((opt) => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => setScaleQuality(opt.scale)}
                        className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                          scaleQuality === opt.scale
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <div className="text-xs font-bold">{opt.label}</div>
                        <div className="text-[9px] text-slate-500">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cover Detection Toggles */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs sm:col-span-2">
                  <span className="text-xs font-bold text-slate-700 block mb-1">
                    3D Hardcover Structure
                  </span>
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                      <input
                        type="checkbox"
                        checked={makeFirstPageCover}
                        onChange={(e) => setMakeFirstPageCover(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Make 1st Page as <strong>Front Hardcover</strong></span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                      <input
                        type="checkbox"
                        checked={makeLastPageBackCover}
                        onChange={(e) => setMakeLastPageBackCover(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Make Last Page as <strong>Back Cover</strong></span>
                    </label>
                  </div>
                </div>

                {/* Target Import Action (New Book vs Append) */}
                {currentBookPageCount > 0 && (
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs sm:col-span-2">
                    <span className="text-xs font-bold text-slate-700 block mb-1">
                      Where to put converted pages?
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setImportMode('new')}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          importMode === 'new'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <div className="text-xs font-bold">✨ Create as New 3D Book</div>
                        <div className="text-[10px] text-slate-500">Replaces active canvas with fresh project</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setImportMode('append')}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          importMode === 'append'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <div className="text-xs font-bold">➕ Append to Current Book</div>
                        <div className="text-[10px] text-slate-500">Adds {endPage - startPage + 1} pages to existing {currentBookPageCount} pages</div>
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* STEP 3: Active Converting Progress */}
          {isConverting && (
            <div className="p-8 sm:p-10 bg-white border border-slate-200 rounded-3xl text-center space-y-6 shadow-xs animate-in zoom-in-95">
              
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs animate-pulse">
                <Sparkles className="w-8 h-8" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-lg font-bold text-slate-900">
                  Converting PDF into 3D Flipbook Pages...
                </h3>
                <p className="text-xs text-slate-500">
                  {progress.statusText || 'Rendering high-resolution vector layers onto 3D dual-sided paper mesh...'}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 max-w-md mx-auto">
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-500">
                  <span>Page {progress.current} of {progress.total}</span>
                  <span className="font-bold text-emerald-700">{progress.percent}%</span>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            disabled={isConverting}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-200 border border-slate-200 text-slate-600 text-xs font-bold transition-all cursor-pointer"
          >
            Cancel
          </button>

          {file && metadata && !isConverting && (
            <button
              onClick={handleStartConversion}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition-all hover:scale-[1.02] flex items-center gap-2 cursor-pointer"
            >
              <span>Convert {endPage - startPage + 1} Pages to 3D Book</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
