import React from 'react';
import { TemplatePreset } from '../types/flipbook';
import { Sparkles, Eye, ArrowRight } from 'lucide-react';
import { CoverArtworkRenderer } from './CoverArtworkRenderer';

interface TemplateCardVisualProps {
  template: TemplatePreset;
  onPreview: (template: TemplatePreset) => void;
  onSelect: (template: TemplatePreset) => void;
}

export const TemplateCardVisual: React.FC<TemplateCardVisualProps> = ({
  template,
  onPreview,
  onSelect,
}) => {
  return (
    <div className="group flex flex-col bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl overflow-hidden transition-all duration-300 shadow-xs hover:shadow-xl hover:-translate-y-1">
      {/* 1. Tall Cinematic Cover Header (4:5 Aspect Ratio) */}
      <div className="relative aspect-[4/5] sm:aspect-[3/4] w-full overflow-hidden bg-slate-950">
        <CoverArtworkRenderer
          templateId={template.id}
          title={template.title}
          subtitle={template.description}
          author={template.project.author}
          headerTag={template.categoryLabel}
          coverImageUrl={template.coverImageUrl}
          isInteractiveCover={false}
        />

        {/* Top-Left Green Badge (e.g. FEATURED, NEW, PRO, POPULAR) */}
        {template.badge && (
          <div className="absolute top-3 left-3 z-20 px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider bg-emerald-600 text-white uppercase shadow-md flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            <span>{template.badge}</span>
          </div>
        )}

        {/* Quick Hover Action Overlay */}
        <div className="absolute inset-0 z-30 bg-slate-950/75 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2.5 p-4">
          <button
            onClick={() => onPreview(template)}
            className="w-full max-w-[180px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold border border-white/30 transition-all hover:scale-105 cursor-pointer shadow-md"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-300" />
            <span>Live 3D Preview</span>
          </button>

          <button
            onClick={() => onSelect(template)}
            className="w-full max-w-[180px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition-all hover:scale-105 cursor-pointer"
          >
            <span>Use Template</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Bottom Card Metadata & Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 bg-white">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-emerald-700 font-extrabold uppercase tracking-wider text-[11px]">
              {template.categoryLabel}
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
            {template.title}
          </h3>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {template.description}
          </p>
        </div>

        {/* Tag Pills */}
        <div className="flex flex-wrap gap-1 pt-1">
          {template.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/90 text-[10px] text-slate-600 font-medium whitespace-nowrap"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Action Row & Page Count */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            onClick={() => onPreview(template)}
            className="text-xs text-slate-600 hover:text-slate-950 font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-600" />
            <span>Preview</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">
              {template.pageCount} Pages
            </span>

            <button
              onClick={() => onSelect(template)}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-300 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
            >
              <span>Select</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
