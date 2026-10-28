import React, { useState, useRef } from 'react';
import {
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  X,
  Check,
  RefreshCw,
  Maximize2,
  HardDrive,
  Globe,
  Crop,
} from 'lucide-react';
import { ImageCropModal } from './ImageCropModal';

interface ImageInputControlProps {
  value?: string;
  onChange: (newValue: string) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  compact?: boolean;
}

/**
 * Optimizes an image file by resizing if larger than maxDim and encoding to high quality Base64
 */
const fileToBase64 = (file: File, maxDim = 1920): Promise<string> => {
  return new Promise((resolve, reject) => {
    // If SVG, read directly as text DataURL to keep vector crispness
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width <= maxDim && height <= maxDim && file.size < 800 * 1024) {
          // If already optimal size, return direct data URL
          resolve(e.target?.result as string);
          return;
        }

        // Scale down large images to keep flipbook performance lightning fast
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const outputMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(outputMime, 0.88);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const ImageInputControl: React.FC<ImageInputControlProps> = ({
  value = '',
  onChange,
  label = 'Image Source',
  placeholder = 'https://images.unsplash.com/... or upload file',
  helperText,
  compact = false,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>(
    value.startsWith('data:') ? 'upload' : value ? 'url' : 'upload'
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isBase64 = value.startsWith('data:');
  const hasImage = Boolean(value && value.trim().length > 0);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) return;

    setIsProcessing(true);
    try {
      const base64 = await fileToBase64(file);
      onChange(base64);
      setActiveTab('upload');
    } catch (err) {
      console.error('Failed to convert image to base64', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="space-y-1.5">
      {/* Label and Source Mode Toggle */}
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-semibold text-neutral-400">
          {label}
        </label>
        <div className="flex items-center bg-neutral-950 p-0.5 rounded border border-neutral-800 text-[10px]">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
              activeTab === 'upload'
                ? 'bg-neutral-800 text-emerald-400 font-semibold'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
            title="Upload image from computer/mobile (saved directly in flipbook as Base64)"
          >
            <HardDrive className="w-2.5 h-2.5" />
            <span>Local Upload</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
              activeTab === 'url'
                ? 'bg-neutral-800 text-emerald-400 font-semibold'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
            title="Paste web URL"
          >
            <Globe className="w-2.5 h-2.5" />
            <span>Web URL</span>
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Image Preview & Controls if Image Exists */}
      {hasImage ? (
        <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800 space-y-2">
          <div className="flex items-center gap-2.5">
            {/* Thumbnail */}
            <div className="relative w-14 h-14 rounded-md overflow-hidden bg-neutral-900 border border-neutral-700 shrink-0 flex items-center justify-center">
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {isBase64 && (
                <span className="absolute bottom-0 inset-x-0 bg-emerald-950/90 text-emerald-300 text-[8px] font-mono text-center font-bold py-0.2">
                  Base64
                </span>
              )}
            </div>

            {/* Meta & Actions */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="text-[11px] font-medium text-neutral-300 truncate">
                {isBase64 ? 'Local Image (Stored in Book)' : value}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsCropModalOpen(true)}
                  className="px-2 py-1 bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-700/80 rounded text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                  title="Crop, zoom, rotate or resize image"
                >
                  <Crop className="w-2.5 h-2.5 text-emerald-400" />
                  <span>Crop / Resize</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Upload className="w-2.5 h-2.5 text-emerald-400" />
                  <span>Replace File</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="px-2 py-1 bg-neutral-800 hover:bg-red-950/60 hover:text-red-300 hover:border-red-800 text-neutral-400 border border-neutral-700 rounded text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <X className="w-2.5 h-2.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Edit URL field if in URL tab */}
          {activeTab === 'url' && (
            <div className="pt-1.5 border-t border-neutral-900">
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-2 py-1 bg-neutral-900 border border-neutral-700 rounded text-neutral-100 text-[10px] font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}
        </div>
      ) : (
        /* Empty State / Upload & URL Input */
        <div className="space-y-1.5">
          {activeTab === 'upload' ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`p-3 rounded-lg border border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-950/20 text-emerald-300'
                  : 'border-neutral-700/80 bg-neutral-950/60 hover:bg-neutral-950 hover:border-emerald-500/50 text-neutral-400'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] py-1">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Converting image to Base64...</span>
                </div>
              ) : (
                <>
                  <div className="w-7 h-7 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-emerald-400">
                    <Upload className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-[11px] font-semibold text-neutral-200">
                    Click to Upload Image from Device
                  </div>
                  <div className="text-[9.5px] text-neutral-500">
                    Drag and drop file here • JPG, PNG, WEBP, SVG
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex gap-1.5">
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="flex-1 px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 text-[11px] font-mono focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-lg text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                title="Or choose local file"
              >
                <Upload className="w-3 h-3 text-emerald-400" />
                <span>Upload</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Helper caption */}
      {helperText && (
        <div className="text-[9.5px] text-neutral-500 leading-tight">
          {helperText}
        </div>
      )}

      {/* Image Cropper Modal */}
      {isCropModalOpen && value && (
        <ImageCropModal
          isOpen={isCropModalOpen}
          imageSrc={value}
          onClose={() => setIsCropModalOpen(false)}
          onCropComplete={(croppedBase64) => {
            onChange(croppedBase64);
            setIsCropModalOpen(false);
          }}
          title={`Crop & Adjust: ${label}`}
        />
      )}
    </div>
  );
};
