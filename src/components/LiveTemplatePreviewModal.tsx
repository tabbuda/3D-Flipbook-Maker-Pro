import React, { useState } from 'react';
import { TemplatePreset, BookProject } from '../types/flipbook';
import { FlipbookPreview } from './FlipbookPreview';
import { X, ArrowRight, Sparkles, Volume2, BookOpen } from 'lucide-react';

interface LiveTemplatePreviewModalProps {
  template: TemplatePreset | null;
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (project: BookProject) => void;
}

export const LiveTemplatePreviewModal: React.FC<LiveTemplatePreviewModalProps> = ({
  template,
  isOpen,
  onClose,
  onApplyTemplate,
}) => {
  const [activePageIndex, setActivePageIndex] = useState<number>(0);

  if (!isOpen || !template) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-6xl h-[95vh] sm:h-[92vh] max-h-[850px] bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-800">
        
        {/* Modal Top Bar - Fully Responsive Layout */}
        <div className="p-3 sm:p-4 border-b border-slate-200 bg-slate-50/90 shrink-0">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            
            {/* Left Title & Metadata */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h3 className="text-xs sm:text-base font-bold text-slate-900 truncate max-w-[160px] sm:max-w-md">
                    {template.title}
                  </h3>
                  <span className="hidden xs:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                    {template.categoryLabel}
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">
                  {template.pageCount} Pages • 3D Dual-Page Spread
                </p>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Desktop / Tablet Customize Button */}
              <button
                onClick={() => {
                  onApplyTemplate(template.project);
                  onClose();
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition-all hover:scale-105 cursor-pointer"
              >
                <span>Customize in Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                title="Close Preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Flipbook Stage Body */}
        <div className="flex-1 relative overflow-hidden bg-slate-100">
          <FlipbookPreview
            book={template.project}
            activePageIndex={activePageIndex}
            onPageSelect={setActivePageIndex}
            isMobilePreviewMode={false}
          />
        </div>

        {/* Modal Bottom Bar - Optimized for Mobile & Desktop */}
        <div className="p-2.5 sm:p-3 px-3 sm:px-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600 shrink-0">
          
          <div className="flex items-center justify-between w-full sm:w-auto gap-3 text-[11px] sm:text-xs">
            <span className="hidden sm:inline">💡 Click page edges or swipe to turn</span>
            <span className="flex items-center gap-1 text-slate-500">
              <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Real Paper Sound FX</span>
            </span>
            <span className="font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Page {activePageIndex + 1} / {template.project.pages.length}
            </span>
          </div>

          {/* Mobile Bottom Full-Width Customize CTA */}
          <div className="w-full sm:hidden pt-0.5">
            <button
              onClick={() => {
                onApplyTemplate(template.project);
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Customize in Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
