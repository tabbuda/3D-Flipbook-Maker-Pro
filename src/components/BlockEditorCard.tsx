import React, { useState } from 'react';
import { PageBlock } from '../types/flipbook';
import { ImageInputControl } from './ImageInputControl';
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Copy,
  ChevronRight,
  Plus,
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
  Maximize2,
} from 'lucide-react';

interface BlockEditorCardProps {
  block: PageBlock;
  index: number;
  totalBlocks: number;
  onUpdate: (updatedBlock: PageBlock) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  'chapter-header': Bookmark,
  'heading-1': Heading1,
  'heading-2': Heading2,
  'heading-3': Heading3,
  subtitle: Type,
  paragraph: AlignLeft,
  'dropcap-paragraph': Pilcrow,
  'two-column-text': Columns2,
  'quote-block': Quote,
  'grid-cards': LayoutGrid,
  'feature-cards': Layers,
  'checklist-block': CheckSquare,
  'numbered-steps': ListOrdered,
  'table-specs': Table,
  'image-block': ImageIcon,
  'image-full-fit': Maximize2,
  'image-text-split': Sparkles,
  'author-card': User,
  'callout-box': Info,
  'button-cta': MousePointerClick,
  'divider-ornament': Minus,
  'barcode-imprint': QrCode,
};

const BLOCK_LABELS: Record<string, string> = {
  'chapter-header': 'Chapter Header & Tag',
  'heading-1': 'Heading 1 (Hero Title)',
  'heading-2': 'Heading 2 (Section Title)',
  'heading-3': 'Heading 3 (Sub-heading)',
  subtitle: 'Subtitle / Lead Text',
  paragraph: 'Standard Paragraph',
  'dropcap-paragraph': 'Drop-Cap Paragraph',
  'two-column-text': 'Two-Column Newspaper Text',
  'quote-block': 'Pull Quote & Citation',
  'grid-cards': '2x2 Key Points Grid',
  'feature-cards': 'Feature Highlight Cards',
  'checklist-block': 'Checkmark List',
  'numbered-steps': 'Numbered Steps List',
  'table-specs': 'Specifications Table',
  'image-block': 'Image Showcase',
  'image-full-fit': 'Image Without Crop (Full Fit)',
  'image-text-split': 'Side-by-Side Image & Text',
  'author-card': 'Author Bio & Profile',
  'callout-box': 'Callout / Highlight Box',
  'button-cta': 'Action Button / Link Pill',
  'divider-ornament': 'Decorative Divider',
  'barcode-imprint': 'Barcode & ISBN Imprint',
};

export const BlockEditorCard: React.FC<BlockEditorCardProps> = ({
  block,
  index,
  totalBlocks,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const IconComponent = ICON_MAP[block.type] || AlignLeft;
  const label = BLOCK_LABELS[block.type] || block.type;

  const handleChange = (field: keyof PageBlock, value: any) => {
    onUpdate({
      ...block,
      [field]: value,
    });
  };

  // Helper for array items (grid cards, features, checklist, etc.)
  const handleItemChange = (itemIndex: number, field: string, value: string) => {
    const updatedItems = [...(block.items || [])];
    if (updatedItems[itemIndex]) {
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        [field]: value,
      };
      handleChange('items', updatedItems);
    }
  };

  const handleAddItem = () => {
    const newItem = {
      id: `it-${Date.now()}`,
      title: 'New Point / Card',
      description: 'Detail description text goes here.',
      tag: `0${(block.items?.length || 0) + 1}`,
      highlight: 'Key Stat',
      icon: 'Sparkles',
    };
    handleChange('items', [...(block.items || []), newItem]);
  };

  const handleRemoveItem = (itemIndex: number) => {
    const updatedItems = (block.items || []).filter((_, i) => i !== itemIndex);
    handleChange('items', updatedItems);
  };

  return (
    <div className="rounded-xl border border-neutral-700/70 bg-neutral-900/90 shadow-sm overflow-hidden transition-all duration-200 hover:border-neutral-600">
      {/* Header bar */}
      <div className="p-3 bg-neutral-800/60 border-b border-neutral-700/50 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
        >
          <div className="w-7 h-7 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-emerald-400 shrink-0">
            <IconComponent className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-neutral-200 truncate flex items-center gap-1.5">
              <span>{label}</span>
              <span className="text-[10px] font-mono text-neutral-500 font-normal">
                #{index + 1}
              </span>
            </div>
          </div>
          <ChevronRight
            className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
              isExpanded ? 'rotate-90' : ''
            }`}
          />
        </button>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Move Up"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === totalBlocks - 1}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Move Down"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-emerald-400 hover:bg-neutral-700 transition-colors"
            title="Duplicate Block"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-neutral-700 transition-colors"
            title="Delete Block"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded Editor Body */}
      {isExpanded && (
        <div className="p-3.5 space-y-3 bg-neutral-900/60 text-xs">
          {/* Chapter Header Fields */}
          {block.type === 'chapter-header' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                    Chapter Number / Tag
                  </label>
                  <input
                    type="text"
                    value={block.chapterNumber || ''}
                    onChange={(e) => handleChange('chapterNumber', e.target.value)}
                    placeholder="CHAPTER 01"
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                    Eyebrow / Topic Tag
                  </label>
                  <input
                    type="text"
                    value={block.tag || ''}
                    onChange={(e) => handleChange('tag', e.target.value)}
                    placeholder="ESSENTIAL PRINCIPLES"
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                  Chapter Title
                </label>
                <input
                  type="text"
                  value={block.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="The Architecture of Spatial Design"
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </>
          )}

          {/* Headings 1, 2, 3 */}
          {(block.type === 'heading-1' ||
            block.type === 'heading-2' ||
            block.type === 'heading-3') && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-neutral-400">
                  {label} Text
                </label>
                <div className="flex items-center gap-1 text-[10px]">
                  {['left', 'center', 'right'].map((align) => (
                    <button
                      key={align}
                      type="button"
                      onClick={() => handleChange('align', align)}
                      className={`px-2 py-0.5 rounded capitalize ${
                        (block.align || 'left') === align
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                value={block.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Enter heading title..."
                className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>
          )}

          {/* Subtitle */}
          {block.type === 'subtitle' && (
            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                Subtitle Content
              </label>
              <textarea
                value={block.subtitle || ''}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                rows={2}
                placeholder="Enter descriptive lead subtitle..."
                className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {/* Paragraph / Dropcap */}
          {(block.type === 'paragraph' || block.type === 'dropcap-paragraph') && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-neutral-400">
                  Paragraph Text
                </label>
                {block.type === 'dropcap-paragraph' && (
                  <span className="text-[10px] text-emerald-400 font-mono">
                    ✦ First letter will be Drop-Capped
                  </span>
                )}
              </div>
              <textarea
                value={block.paragraph1 || ''}
                onChange={(e) => handleChange('paragraph1', e.target.value)}
                rows={4}
                placeholder="Write reading content here..."
                className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 leading-relaxed"
              />
            </div>
          )}

          {/* Two-Column Newspaper */}
          {block.type === 'two-column-text' && (
            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                  Left Column Paragraph
                </label>
                <textarea
                  value={block.paragraph1 || ''}
                  onChange={(e) => handleChange('paragraph1', e.target.value)}
                  rows={3}
                  placeholder="Column 1 text..."
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                  Right Column Paragraph
                </label>
                <textarea
                  value={block.paragraph2 || ''}
                  onChange={(e) => handleChange('paragraph2', e.target.value)}
                  rows={3}
                  placeholder="Column 2 text..."
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Quote Block */}
          {block.type === 'quote-block' && (
            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                  Quote Statement
                </label>
                <textarea
                  value={block.quoteText || ''}
                  onChange={(e) => handleChange('quoteText', e.target.value)}
                  rows={3}
                  placeholder="Inspirational quotation..."
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:border-emerald-500 italic"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                    Author / Citation
                  </label>
                  <input
                    type="text"
                    value={block.quoteAuthor || ''}
                    onChange={(e) => handleChange('quoteAuthor', e.target.value)}
                    placeholder="Jony Ive"
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                    Role / Title
                  </label>
                  <input
                    type="text"
                    value={block.quoteRole || ''}
                    onChange={(e) => handleChange('quoteRole', e.target.value)}
                    placeholder="Chief Design Officer"
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Grid Cards (2x2) */}
          {block.type === 'grid-cards' && (
            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                  Grid Section Header
                </label>
                <input
                  type="text"
                  value={block.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Framework Highlights"
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-neutral-400">
                    Grid Cards ({block.items?.length || 0})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded text-[10px] font-semibold hover:bg-emerald-500/30"
                  >
                    <Plus className="w-3 h-3" /> Add Card
                  </button>
                </div>

                {(block.items || []).map((card, cIdx) => (
                  <div
                    key={card.id || cIdx}
                    className="p-2.5 rounded-lg border border-neutral-800 bg-neutral-950/70 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={card.tag || ''}
                        onChange={(e) => handleItemChange(cIdx, 'tag', e.target.value)}
                        placeholder="Tag (e.g. 01 / SPEED)"
                        className="w-1/3 px-2 py-1 bg-neutral-900 border border-neutral-700 rounded text-[10px] text-emerald-400 font-mono"
                      />
                      <input
                        type="text"
                        value={card.highlight || ''}
                        onChange={(e) => handleItemChange(cIdx, 'highlight', e.target.value)}
                        placeholder="Highlight (e.g. 60 FPS)"
                        className="w-1/3 px-2 py-1 bg-neutral-900 border border-neutral-700 rounded text-[10px] text-emerald-400 font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(cIdx)}
                        className="p-1 text-neutral-500 hover:text-red-400"
                        title="Delete Card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={card.title || ''}
                      onChange={(e) => handleItemChange(cIdx, 'title', e.target.value)}
                      placeholder="Card Title"
                      className="w-full px-2 py-1 bg-neutral-900 border border-neutral-700 rounded text-neutral-100 font-semibold"
                    />
                    <textarea
                      value={card.description || ''}
                      onChange={(e) => handleItemChange(cIdx, 'description', e.target.value)}
                      rows={2}
                      placeholder="Card description..."
                      className="w-full px-2 py-1 bg-neutral-900 border border-neutral-700 rounded text-neutral-300 text-[11px]"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feature Highlight Cards & Checklist & Steps */}
          {(block.type === 'feature-cards' ||
            block.type === 'checklist-block' ||
            block.type === 'numbered-steps' ||
            block.type === 'table-specs') && (
            <div className="space-y-2.5">
              {block.type !== 'checklist-block' && (
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                    Section Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={block.title || ''}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="List Title"
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-neutral-400">
                    Items ({block.items?.length || 0})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded text-[10px] font-semibold hover:bg-emerald-500/30"
                  >
                    <Plus className="w-3 h-3" /> Add Item
                  </button>
                </div>

                {(block.items || []).map((item, itIdx) => (
                  <div
                    key={item.id || itIdx}
                    className="p-2 rounded-lg border border-neutral-800 bg-neutral-950/70 space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.title || ''}
                        onChange={(e) => handleItemChange(itIdx, 'title', e.target.value)}
                        placeholder="Item Title / Attribute"
                        className="flex-1 px-2 py-1 bg-neutral-900 border border-neutral-700 rounded text-neutral-100 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(itIdx)}
                        className="p-1 text-neutral-500 hover:text-red-400 shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={item.description || ''}
                      onChange={(e) => handleItemChange(itIdx, 'description', e.target.value)}
                      placeholder="Item description / Value"
                      className="w-full px-2 py-1 bg-neutral-900 border border-neutral-700 rounded text-neutral-300 text-[11px]"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Image Block */}
          {(block.type === 'image-block' ||
            block.type === 'image-full-fit' ||
            block.type === 'image-text-split') && (
            <div className="space-y-3">
              <ImageInputControl
                value={block.imageUrl || ''}
                onChange={(val) => handleChange('imageUrl', val)}
                label="Image Source (Device Upload or URL)"
                placeholder="https://images.unsplash.com/... or upload local file"
                helperText="Uploaded local files are converted into offline Base64 data URLs automatically."
              />

              {/* Caption */}
              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                  Caption / Alt Text
                </label>
                <input
                  type="text"
                  value={block.imageCaption || ''}
                  onChange={(e) => handleChange('imageCaption', e.target.value)}
                  placeholder="Artwork or photo description..."
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 text-[11px] focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Layout, Sizing & Alignment Controls */}
              <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-3">
                <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Image Layout & Positioning</span>
                  <span className="text-[9.5px] font-normal text-neutral-400 lowercase">
                    {block.imageFloat && block.imageFloat !== 'none' ? `Float ${block.imageFloat}` : 'Standard row'}
                  </span>
                </div>

                {/* Horizontal Alignment & Positioning */}
                <div className="space-y-1">
                  <label className="block text-[10.5px] font-semibold text-neutral-400">
                    Horizontal Alignment
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'left', label: 'Left' },
                      { id: 'center', label: 'Center' },
                      { id: 'right', label: 'Right' },
                    ].map((alignOption) => (
                      <button
                        key={alignOption.id}
                        type="button"
                        onClick={() => handleChange('imageAlign', alignOption.id)}
                        className={`py-1 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          (block.imageAlign || 'center') === alignOption.id
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                        }`}
                      >
                        {alignOption.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vertical Alignment */}
                <div className="space-y-1">
                  <label className="block text-[10.5px] font-semibold text-neutral-400">
                    Vertical Position
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'top', label: 'Top' },
                      { id: 'middle', label: 'Middle' },
                      { id: 'bottom', label: 'Bottom' },
                    ].map((vOption) => (
                      <button
                        key={vOption.id}
                        type="button"
                        onClick={() => handleChange('imageVerticalAlign', vOption.id)}
                        className={`py-1 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          (block.imageVerticalAlign || 'middle') === vOption.id
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                        }`}
                      >
                        {vOption.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Width / Size Scaling */}
                <div className="space-y-1">
                  <label className="block text-[10.5px] font-semibold text-neutral-400">
                    Width Scale
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'small', label: '33% Small' },
                      { id: 'medium', label: '50% Med' },
                      { id: 'large', label: '75% Large' },
                      { id: 'full', label: '100% Full' },
                    ].map((sz) => (
                      <button
                        key={sz.id}
                        type="button"
                        onClick={() => handleChange('imageSize', sz.id)}
                        className={`py-1 px-1.5 rounded-lg text-[10.5px] font-semibold transition-all cursor-pointer truncate ${
                          (block.imageSize || (block.type === 'image-full-fit' ? 'full' : 'full')) === sz.id
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                        }`}
                      >
                        {sz.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Height Presets */}
                <div className="space-y-1">
                  <label className="block text-[10.5px] font-semibold text-neutral-400">
                    Height Proportion
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'auto', label: 'Auto' },
                      { id: '130px', label: 'Compact' },
                      { id: '220px', label: 'Standard' },
                      { id: '340px', label: 'Tall' },
                    ].map((ht) => (
                      <button
                        key={ht.id}
                        type="button"
                        onClick={() => handleChange('imageHeight', ht.id)}
                        className={`py-1 px-1.5 rounded-lg text-[10.5px] font-semibold transition-all cursor-pointer truncate ${
                          (block.imageHeight || (block.type === 'image-full-fit' ? 'auto' : 'auto')) === ht.id
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                        }`}
                      >
                        {ht.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Fit & Float Options */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-800/80">
                  <div>
                    <label className="block text-[10.5px] font-semibold text-neutral-400 mb-1">
                      Fit Mode
                    </label>
                    <select
                      value={block.imageFit || (block.type === 'image-full-fit' ? 'contain' : 'cover')}
                      onChange={(e) => handleChange('imageFit', e.target.value)}
                      className="w-full px-2 py-1 bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-100 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="contain">Contain (No Crop)</option>
                      <option value="cover">Cover (Fill Frame)</option>
                      <option value="fill">Stretch Fill</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-semibold text-neutral-400 mb-1">
                      Float / Remaining Space
                    </label>
                    <select
                      value={block.imageFloat || 'none'}
                      onChange={(e) => handleChange('imageFloat', e.target.value)}
                      className="w-full px-2 py-1 bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-100 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="none">Standard Row (No Wrap)</option>
                      <option value="left">Float Left (Text on Right)</option>
                      <option value="right">Float Right (Text on Left)</option>
                    </select>
                  </div>
                </div>
              </div>

              {block.type === 'image-full-fit' && (
                <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-400">
                  ⚡ <strong>Auto-Fit Enabled:</strong> Fits 98% scale with preserved aspect ratio. You can also customize size and alignment above.
                </div>
              )}
              {block.type === 'image-text-split' && (
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                    Side Paragraph Text
                  </label>
                  <textarea
                    value={block.paragraph1 || ''}
                    onChange={(e) => handleChange('paragraph1', e.target.value)}
                    rows={3}
                    placeholder="Enter description alongside the image..."
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* Author Card */}
          {block.type === 'author-card' && (
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={block.authorName || ''}
                    onChange={(e) => handleChange('authorName', e.target.value)}
                    placeholder="Alexander Sterling"
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                    Socials / Website
                  </label>
                  <input
                    type="text"
                    value={block.authorSocials || ''}
                    onChange={(e) => handleChange('authorSocials', e.target.value)}
                    placeholder="@alexsterling"
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <ImageInputControl
                value={block.authorAvatarUrl || ''}
                onChange={(val) => handleChange('authorAvatarUrl', val)}
                label="Author Profile Photo (Upload or URL)"
                placeholder="https://... or upload avatar"
                helperText="Upload author portrait from device or paste image URL."
              />
              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                  Author Biography
                </label>
                <textarea
                  value={block.authorBio || ''}
                  onChange={(e) => handleChange('authorBio', e.target.value)}
                  rows={2}
                  placeholder="Short author biography..."
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Callout Box */}
          {block.type === 'callout-box' && (
            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                  Callout Title
                </label>
                <input
                  type="text"
                  value={block.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="PRO TIP / NOTICE"
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 uppercase tracking-wider font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                  Message Content
                </label>
                <textarea
                  value={block.paragraph1 || ''}
                  onChange={(e) => handleChange('paragraph1', e.target.value)}
                  rows={2}
                  placeholder="Important note or message..."
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Button CTA */}
          {block.type === 'button-cta' && (
            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                  Button Label
                </label>
                <input
                  type="text"
                  value={block.buttonLabel || ''}
                  onChange={(e) => handleChange('buttonLabel', e.target.value)}
                  placeholder="Explore Interactive Spread"
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:border-emerald-500 font-semibold"
                />
              </div>
            </div>
          )}

          {/* Barcode & ISBN */}
          {block.type === 'barcode-imprint' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                  ISBN Number
                </label>
                <input
                  type="text"
                  value={block.isbn || ''}
                  onChange={(e) => handleChange('isbn', e.target.value)}
                  placeholder="ISBN 978-0-201-89683-1"
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 font-mono text-[11px] focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                  Publisher Imprint
                </label>
                <input
                  type="text"
                  value={block.publisherName || ''}
                  onChange={(e) => handleChange('publisherName', e.target.value)}
                  placeholder="Lumina Press"
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 text-[11px] focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
