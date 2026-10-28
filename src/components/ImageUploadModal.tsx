import React, { useState } from 'react';
import { PageContent } from '../types/flipbook';
import { Upload, Image as ImageIcon, X, Plus, Sparkles, Check, Crop } from 'lucide-react';
import { fileToBase64 } from '../utils/imageUtils';
import { ImageCropModal } from './ImageCropModal';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPagesFromImages: (pages: PageContent[]) => void;
}

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  onAddPagesFromImages,
}) => {
  const [images, setImages] = useState<{ id: string; url: string; title: string; caption: string }[]>(
    []
  );
  const [layoutMode, setLayoutMode] = useState<'showcase' | 'fit' | 'split'>('fit');
  const [croppingImageIndex, setCroppingImageIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files: File[] = Array.from(e.target.files);
      const converted = await Promise.all(
        files.map(async (file: File, i: number) => {
          const base64 = await fileToBase64(file);
          return {
            id: `img-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
            url: base64,
            title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
            caption: 'Photograph archival leaf.',
          };
        })
      );
      setImages((prev) => [...prev, ...converted]);
    }
  };

  const handleCropComplete = (croppedBase64: string) => {
    if (croppingImageIndex !== null) {
      setImages((prev) =>
        prev.map((item, idx) =>
          idx === croppingImageIndex ? { ...item, url: croppedBase64 } : item
        )
      );
      setCroppingImageIndex(null);
    }
  };

  const handleApply = () => {
    if (images.length === 0) return;

    const generatedPages: PageContent[] = images.map((img, idx) => {
      if (layoutMode === 'fit') {
        return {
          id: `p-img-${Date.now()}-${idx}`,
          template: 'image-showcase',
          headerTag: `GALLERY EXHIBIT • ${idx + 1}`,
          title: img.title,
          blocks: [
            {
              id: `b-img-${idx}`,
              type: 'image-full-fit',
              imageUrl: img.url,
              imageCaption: img.caption,
              imageFit: 'contain',
              imageAlign: 'center',
            },
          ],
        };
      }

      if (layoutMode === 'split') {
        return {
          id: `p-img-${Date.now()}-${idx}`,
          template: 'image-text-split',
          headerTag: `EXHIBIT ${idx + 1}`,
          title: img.title,
          blocks: [
            {
              id: `b-h-${idx}`,
              type: 'heading-2',
              title: img.title,
              align: 'left',
            },
            {
              id: `b-split-${idx}`,
              type: 'image-text-split',
              title: img.title,
              imageUrl: img.url,
              imageCaption: img.caption,
              imageAlign: 'center',
              paragraph1:
                'Captured in high definition, preserving tonal richness and delicate light gradations across the page spread.',
            },
          ],
        };
      }

      return {
        id: `p-img-${Date.now()}-${idx}`,
        template: 'image-showcase',
        headerTag: `GALLERY EXHIBIT • ${idx + 1}`,
        title: img.title,
        blocks: [
          {
            id: `b-h-${idx}`,
            type: 'heading-2',
            title: img.title,
            align: 'left',
          },
          {
            id: `b-img-${idx}`,
            type: 'image-block',
            imageUrl: img.url,
            imageCaption: img.caption,
            imageAlign: 'center',
          },
        ],
      };
    });

    onAddPagesFromImages(generatedPages);
    setImages([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-800">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Batch Upload Images to Flipbook</h3>
              <p className="text-xs text-slate-500">
                Convert photos into interactive 3D leaves (with Cropping & Resizing)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Dropzone */}
          <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all space-y-2 group shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 group-hover:bg-emerald-200 text-emerald-700 flex items-center justify-center transition-colors">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-900">
                Click or Drag & Drop Images Here
              </span>
              <p className="text-[11px] text-slate-500">
                PNG, JPG, WebP, SVG supported • Converted automatically to Base64
              </p>
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* Uploaded items list */}
          {images.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Selected Images ({images.length})</span>
                <button
                  type="button"
                  onClick={() => setImages([])}
                  className="text-[11px] text-red-600 hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1.5 bg-slate-50 rounded-xl border border-slate-200">
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    className="relative flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs group"
                  >
                    <img
                      src={img.url}
                      alt={img.title}
                      className="w-12 h-12 object-cover rounded shrink-0 border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{img.title}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <button
                          type="button"
                          onClick={() => setCroppingImageIndex(idx)}
                          className="px-1.5 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded text-[9.5px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Crop className="w-2.5 h-2.5" />
                          <span>Crop</span>
                        </button>
                        <span className="text-[10px] text-slate-400">Page {idx + 1}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Layout mode option */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Page Layout Template:</span>
                <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 gap-1">
                  <button
                    type="button"
                    onClick={() => setLayoutMode('fit')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-all ${
                      layoutMode === 'fit'
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Full Fit
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayoutMode('showcase')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-all ${
                      layoutMode === 'showcase'
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Showcase
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayoutMode('split')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-all ${
                      layoutMode === 'split'
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Side-by-Side
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={images.length === 0}
            onClick={handleApply}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:pointer-events-none text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Generate {images.length} Flipbook Pages</span>
          </button>
        </div>
      </div>

      {/* Interactive Crop Modal */}
      {croppingImageIndex !== null && images[croppingImageIndex] && (
        <ImageCropModal
          isOpen={croppingImageIndex !== null}
          imageSrc={images[croppingImageIndex].url}
          onClose={() => setCroppingImageIndex(null)}
          onCropComplete={handleCropComplete}
          title={`Crop: ${images[croppingImageIndex].title}`}
        />
      )}
    </div>
  );
};
