import React, { useState } from 'react';
import { PageBlockType } from '../types/flipbook';
import {
  COMPONENT_CATALOG,
  BLOCK_CATEGORIES,
} from '../constants/blockDefinitions';
import {
  X,
  Search,
  Bookmark,
  Heading1,
  Heading2,
  Heading3,
  Type,
  AlignLeft,
  Pilcrow,
  Columns2,
  Quote,
  LayoutGrid,
  Layers,
  CheckSquare,
  ListOrdered,
  Table,
  Image as ImageIcon,
  Sparkles,
  User,
  Info,
  MousePointerClick,
  Minus,
  QrCode,
  Plus,
  Maximize2,
} from 'lucide-react';

interface AddComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectComponent: (type: PageBlockType) => void;
  pageNumber?: number;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Bookmark,
  Heading1,
  Heading2,
  Heading3,
  Type,
  AlignLeft,
  Pilcrow,
  Columns2,
  Quote,
  LayoutGrid,
  Layers,
  CheckSquare,
  ListOrdered,
  Table,
  Image: ImageIcon,
  Maximize2,
  Sparkles,
  User,
  Info,
  MousePointerClick,
  Minus,
  QrCode,
};

export const AddComponentModal: React.FC<AddComponentModalProps> = ({
  isOpen,
  onClose,
  onSelectComponent,
  pageNumber,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const filteredComponents = COMPONENT_CATALOG.filter((comp) => {
    const matchesCategory =
      selectedCategory === 'all' || comp.category === selectedCategory;
    const matchesSearch =
      comp.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  Add Component to Page
                  {pageNumber !== undefined && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-normal">
                      Leaf #{pageNumber + 1}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500">
                  Select a layout building block to insert into your page
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Filter Tabs */}
        <div className="p-4 border-b border-slate-200 bg-white space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search components (e.g., heading, grid card, chapter, quote, image)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-xs"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {BLOCK_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Components Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-slate-50/50">
          {filteredComponents.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <p className="text-sm font-medium">No matching components found</p>
              <p className="text-xs text-slate-400 mt-1">
                Try searching for "heading", "card", "text", or "chapter"
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredComponents.map((comp) => {
                const IconComponent =
                  ICON_MAP[comp.icon] || AlignLeft;

                return (
                  <button
                    key={comp.type}
                    onClick={() => {
                      onSelectComponent(comp.type);
                      onClose();
                    }}
                    className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50/40 hover:border-emerald-400 hover:shadow-xs transition-all text-left group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 group-hover:bg-emerald-100 group-hover:border-emerald-300 flex items-center justify-center text-slate-600 group-hover:text-emerald-700 shrink-0 transition-colors">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-emerald-900 group-hover:underline">
                          {comp.label}
                        </span>
                        {comp.badge && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {comp.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {comp.description}
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 self-center text-emerald-600 transition-opacity">
                      <Plus className="w-4 h-4" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Click any block to insert at the end of the page</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors font-semibold shadow-xs cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
