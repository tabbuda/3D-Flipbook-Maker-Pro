import React, { useState, useMemo } from 'react';
import { TemplatePreset, BookProject } from '../types/flipbook';
import { FLIPBOOK_TEMPLATE_PRESETS } from '../constants/presetTemplates';
import { COVER_THEMES } from '../constants/templates';
import { TemplateCardVisual } from './TemplateCardVisual';
import {
  Search,
  Sparkles,
  BookOpen,
  Eye,
  ArrowRight,
  Plus,
  SlidersHorizontal,
  Layers,
  Check,
  Flame,
  LayoutGrid,
  FileText,
  Upload,
} from 'lucide-react';

interface TemplateGalleryProps {
  onSelectTemplate: (project: BookProject) => void;
  onPreviewTemplate: (template: TemplatePreset) => void;
  onCreateBlank: () => void;
  onOpenUploadModal: () => void;
  onOpenPdfModal?: () => void;
}

type CategoryFilter =
  | 'all'
  | 'magazine'
  | 'business'
  | 'restaurant'
  | 'creative'
  | 'storybook'
  | 'event'
  | 'comic'
  | 'automotive'
  | 'architecture'
  | 'poetry'
  | 'newspaper'
  | 'catalog'
  | 'brochure'
  | 'recipe'
  | 'travel'
  | 'handbook'
  | 'pitch-deck'
  | 'invitation'
  | 'theatre';

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  onSelectTemplate,
  onPreviewTemplate,
  onCreateBlank,
  onOpenUploadModal,
  onOpenPdfModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories: { id: CategoryFilter; label: string; icon: string; count: number }[] = useMemo(() => {
    const list: { id: CategoryFilter; label: string; icon: string }[] = [
      { id: 'all', label: 'All Templates', icon: '✨' },
      { id: 'magazine', label: 'Magazines & Editorial', icon: '👗' },
      { id: 'business', label: 'Business & Tech Reports', icon: '💼' },
      { id: 'restaurant', label: 'Fine Dining & Menus', icon: '🍷' },
      { id: 'newspaper', label: 'Newspapers & Broadsheets', icon: '📰' },
      { id: 'catalog', label: 'Product Catalogs & Design', icon: '🛋️' },
      { id: 'brochure', label: 'Corporate Brochures', icon: '🏢' },
      { id: 'recipe', label: 'Culinary & Cookbooks', icon: '🍳' },
      { id: 'travel', label: 'Travel & City Guides', icon: '🗺️' },
      { id: 'pitch-deck', label: 'Pitch Decks & Keynotes', icon: '🚀' },
      { id: 'handbook', label: 'Company Handbooks', icon: '📋' },
      { id: 'invitation', label: 'Luxury Gala & Weddings', icon: '💌' },
      { id: 'theatre', label: 'Concert & Theatre Booklets', icon: '🎭' },
      { id: 'comic', label: 'Manga & Comic Books', icon: '⚡' },
      { id: 'automotive', label: 'Supercars & Motorsport', icon: '🏎️' },
      { id: 'architecture', label: 'Architecture & Blueprints', icon: '📐' },
      { id: 'poetry', label: 'Poetry & Literature', icon: '🪶' },
      { id: 'storybook', label: 'Children & Fantasy', icon: '📚' },
      { id: 'event', label: 'Photo Albums & Milestones', icon: '📸' },
      { id: 'creative', label: 'Creative Portfolios', icon: '🎨' },
    ];

    return list.map((cat) => ({
      ...cat,
      count:
        cat.id === 'all'
          ? FLIPBOOK_TEMPLATE_PRESETS.length
          : FLIPBOOK_TEMPLATE_PRESETS.filter((t) => t.category === cat.id).length,
    }));
  }, []);

  const filteredTemplates = useMemo(() => {
    return FLIPBOOK_TEMPLATE_PRESETS.filter((tpl) => {
      const matchesCategory = selectedCategory === 'all' || tpl.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesSearch =
        tpl.title.toLowerCase().includes(q) ||
        tpl.description.toLowerCase().includes(q) ||
        tpl.categoryLabel.toLowerCase().includes(q) ||
        tpl.tags.some((tag) => tag.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="w-full h-full overflow-y-auto bg-[#FAFAFA] text-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Gallery Hero Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="space-y-1.5">
            <p className="text-[11px] font-mono-code uppercase tracking-[0.16em] text-emerald-800 font-semibold">
              24+ PRESET LAYOUTS · EDITORIAL &amp; COMMERCIAL
            </p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-950 tracking-tight">
              Curated Publication Templates
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              Select a handcrafted layout with responsive 3D page-turning, procedural audio,
              modular content blocks, and standalone HTML export.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onOpenPdfModal && (
              <button
                onClick={onOpenPdfModal}
                className="flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                title="Convert PDF to 3D Flipbook"
              >
                <FileText className="w-4 h-4 text-emerald-700" />
                <span>Import PDF</span>
              </button>
            )}

            <button
              onClick={onOpenUploadModal}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold transition-colors shadow-2xs cursor-pointer"
            >
              <Upload className="w-4 h-4 text-emerald-700" />
              <span>Batch Upload</span>
            </button>

            <button
              onClick={onCreateBlank}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-emerald-950 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Create Blank Book</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search templates by style, keyword, or industry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-xs transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-800"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="text-xs text-slate-500 font-mono">
              Showing <span className="text-slate-900 font-bold">{filteredTemplates.length}</span> of{' '}
              {FLIPBOOK_TEMPLATE_PRESETS.length} templates
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20 border border-emerald-500'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/90 hover:text-slate-950 shadow-xs'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isSelected ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No templates match your search</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your query or category filters, or create a custom book from scratch.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map((template) => (
              <TemplateCardVisual
                key={template.id}
                template={template}
                onPreview={onPreviewTemplate}
                onSelect={(tpl) => onSelectTemplate(tpl.project)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
