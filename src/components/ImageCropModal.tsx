import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Crop,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Check,
  X,
  RefreshCw,
  Move,
  Square,
  Smartphone,
  BookOpen,
  Image as ImageIcon,
} from 'lucide-react';

export interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedBase64: string) => void;
  title?: string;
  initialAspectRatio?: number | null; // e.g. 1 (square), 1/1.414 (A4 book cover), 4/3, 16/9, or null for Free
}

type AspectRatioPreset = {
  label: string;
  ratio: number | null; // width / height
  icon: React.ElementType;
};

const ASPECT_RATIOS: AspectRatioPreset[] = [
  { label: 'Freeform', ratio: null, icon: Move },
  { label: '1:1 Square', ratio: 1, icon: Square },
  { label: 'A4 Book (1:1.41)', ratio: 1 / 1.4142, icon: BookOpen },
  { label: '4:3 Classic', ratio: 4 / 3, icon: ImageIcon },
  { label: '16:9 Banner', ratio: 16 / 9, icon: Maximize2 },
  { label: '3:4 Portrait', ratio: 3 / 4, icon: Smartphone },
  { label: '9:16 Story', ratio: 9 / 16, icon: Smartphone },
];

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
  title = 'Crop & Adjust Image',
  initialAspectRatio = null,
}) => {
  const [selectedRatio, setSelectedRatio] = useState<number | null>(initialAspectRatio);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  // Crop rectangle state (in normalized percentages: 0 to 100)
  const [cropBox, setCropBox] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 5,
    y: 5,
    width: 90,
    height: 90,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const dragHandleRef = useRef<string | null>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; initialBox: typeof cropBox }>({
    mouseX: 0,
    mouseY: 0,
    initialBox: { x: 0, y: 0, width: 0, height: 0 },
  });

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset or adjust crop box when aspect ratio changes
  const applyAspectRatio = useCallback(
    (ratio: number | null) => {
      setSelectedRatio(ratio);
      if (!imageRef.current || !containerRef.current) return;

      const img = imageRef.current;
      const imgAspect = (img.naturalWidth || 400) / (img.naturalHeight || 400);

      if (ratio === null) {
        // Free ratio: default to 85% width & height centered
        setCropBox({ x: 7.5, y: 7.5, width: 85, height: 85 });
      } else {
        // Compute width & height percentage that fits inside 85% with target ratio
        let w = 80;
        let h = 80;
        const targetVisualRatio = ratio / imgAspect; // relative to rendered image dimensions

        if (targetVisualRatio > 1) {
          w = 85;
          h = Math.min(85, Math.max(20, 85 / targetVisualRatio));
        } else {
          h = 85;
          w = Math.min(85, Math.max(20, 85 * targetVisualRatio));
        }

        const x = Math.max(0, (100 - w) / 2);
        const y = Math.max(0, (100 - h) / 2);
        setCropBox({ x, y, width: w, height: h });
      }
    },
    []
  );

  // Initialize on modal open
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setIsProcessing(false);
      setCropBox({ x: 5, y: 5, width: 90, height: 90 });
    }
  }, [isOpen, imageSrc]);

  // Handle Drag / Resize logic
  const handlePointerDown = (handle: string, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = true;
    dragHandleRef.current = handle;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialBox: { ...cropBox },
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const deltaXPercent = ((moveEvent.clientX - dragStartRef.current.mouseX) / rect.width) * 100;
      const deltaYPercent = ((moveEvent.clientY - dragStartRef.current.mouseY) / rect.height) * 100;
      const init = dragStartRef.current.initialBox;

      const handleType = dragHandleRef.current;
      let newBox = { ...init };

      if (handleType === 'move') {
        newBox.x = Math.max(0, Math.min(100 - init.width, init.x + deltaXPercent));
        newBox.y = Math.max(0, Math.min(100 - init.height, init.y + deltaYPercent));
      } else if (handleType === 'se') {
        newBox.width = Math.max(10, Math.min(100 - init.x, init.width + deltaXPercent));
        if (selectedRatio && imageRef.current) {
          const imgAspect = imageRef.current.naturalWidth / imageRef.current.naturalHeight;
          const targetVisualRatio = selectedRatio / imgAspect;
          newBox.height = Math.max(10, Math.min(100 - init.y, newBox.width / targetVisualRatio));
        } else {
          newBox.height = Math.max(10, Math.min(100 - init.y, init.height + deltaYPercent));
        }
      } else if (handleType === 'nw') {
        const potentialW = Math.max(10, init.width - deltaXPercent);
        const potentialH = Math.max(10, init.height - deltaYPercent);
        const newX = init.x + (init.width - potentialW);
        const newY = init.y + (init.height - potentialH);
        if (newX >= 0) {
          newBox.x = newX;
          newBox.width = potentialW;
        }
        if (newY >= 0) {
          newBox.y = newY;
          newBox.height = potentialH;
        }
      } else if (handleType === 'ne') {
        newBox.width = Math.max(10, Math.min(100 - init.x, init.width + deltaXPercent));
        const potentialH = Math.max(10, init.height - deltaYPercent);
        const newY = init.y + (init.height - potentialH);
        if (newY >= 0) {
          newBox.y = newY;
          newBox.height = potentialH;
        }
      } else if (handleType === 'sw') {
        const potentialW = Math.max(10, init.width - deltaXPercent);
        const newX = init.x + (init.width - potentialW);
        if (newX >= 0) {
          newBox.x = newX;
          newBox.width = potentialW;
        }
        newBox.height = Math.max(10, Math.min(100 - init.y, init.height + deltaYPercent));
      } else if (handleType === 'n') {
        const potentialH = Math.max(10, init.height - deltaYPercent);
        const newY = init.y + (init.height - potentialH);
        if (newY >= 0) {
          newBox.y = newY;
          newBox.height = potentialH;
        }
      } else if (handleType === 's') {
        newBox.height = Math.max(10, Math.min(100 - init.y, init.height + deltaYPercent));
      } else if (handleType === 'w') {
        const potentialW = Math.max(10, init.width - deltaXPercent);
        const newX = init.x + (init.width - potentialW);
        if (newX >= 0) {
          newBox.x = newX;
          newBox.width = potentialW;
        }
      } else if (handleType === 'e') {
        newBox.width = Math.max(10, Math.min(100 - init.x, init.width + deltaXPercent));
      }

      setCropBox(newBox);
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
      dragHandleRef.current = null;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Perform Final High-Quality Canvas Crop
  const handleApplyCrop = async () => {
    setIsProcessing(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image for cropping'));
        img.src = imageSrc;
      });

      // Compute physical pixel coordinates
      const natW = img.naturalWidth;
      const natH = img.naturalHeight;

      const cropPixelX = (cropBox.x / 100) * natW;
      const cropPixelY = (cropBox.y / 100) * natH;
      const cropPixelW = Math.max(10, (cropBox.width / 100) * natW);
      const cropPixelH = Math.max(10, (cropBox.height / 100) * natH);

      const isRotated90or270 = rotation === 90 || rotation === 270;
      const canvasW = isRotated90or270 ? Math.round(cropPixelH) : Math.round(cropPixelW);
      const canvasH = isRotated90or270 ? Math.round(cropPixelW) : Math.round(cropPixelH);

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, canvasW);
      canvas.height = Math.max(1, canvasH);
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        onCropComplete(imageSrc);
        onClose();
        return;
      }

      // Draw cropped slice onto canvas
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Handle optional rotation if applied
      if (rotation !== 0) {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(
          img,
          cropPixelX,
          cropPixelY,
          cropPixelW,
          cropPixelH,
          -cropPixelW / 2,
          -cropPixelH / 2,
          cropPixelW,
          cropPixelH
        );
        ctx.restore();
      } else {
        ctx.drawImage(
          img,
          cropPixelX,
          cropPixelY,
          cropPixelW,
          cropPixelH,
          0,
          0,
          canvas.width,
          canvas.height
        );
      }

      // Preserve PNG transparency if source is PNG, else high-quality JPEG
      const isPng = imageSrc.startsWith('data:image/png') || imageSrc.toLowerCase().endsWith('.png');
      const croppedDataUrl = isPng
        ? canvas.toDataURL('image/png')
        : canvas.toDataURL('image/jpeg', 0.95);

      onCropComplete(croppedDataUrl);
      onClose();
    } catch (err) {
      console.error('Error cropping image:', err);
      onCropComplete(imageSrc);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !imageSrc || !mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150 select-none overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-neutral-100 max-h-[92vh] my-auto">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-neutral-100">{title}</h3>
              <p className="text-[11px] text-neutral-400">
                Drag handles to select crop box, choose aspect ratio, or zoom to fit
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Aspect Ratio Presets Bar */}
        <div className="px-4 py-2.5 bg-neutral-950 border-b border-neutral-800/80 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <span className="text-[11px] font-semibold text-neutral-400 mr-1 shrink-0">
            Ratio:
          </span>
          {ASPECT_RATIOS.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedRatio === item.ratio;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => applyAspectRatio(item.ratio)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/40'
                    : 'bg-neutral-800/90 text-neutral-300 hover:bg-neutral-700 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Crop Viewport Stage */}
        <div className="relative flex-1 min-h-[260px] sm:min-h-[360px] p-4 flex items-center justify-center bg-black/75 overflow-hidden select-none">
          <div
            ref={containerRef}
            className="relative max-w-full max-h-[50vh] inline-flex w-fit h-fit items-center justify-center rounded-lg overflow-hidden border border-neutral-800 shadow-2xl"
            style={{
              transform: `scale(${zoom})`,
              transition: 'transform 0.15s ease-out',
            }}
          >
            {/* The Image */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop target"
              className="max-h-[46vh] max-w-full object-contain pointer-events-none block select-none"
              style={{
                transform: `rotate(${rotation}deg)`,
              }}
            />

            {/* Dark Mask around crop box */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Top mask */}
              <div
                className="absolute top-0 inset-x-0 bg-black/60 backdrop-blur-[1px]"
                style={{ height: `${cropBox.y}%` }}
              />
              {/* Bottom mask */}
              <div
                className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-[1px]"
                style={{ height: `${100 - (cropBox.y + cropBox.height)}%` }}
              />
              {/* Left mask */}
              <div
                className="absolute inset-y-0 left-0 bg-black/60 backdrop-blur-[1px]"
                style={{
                  top: `${cropBox.y}%`,
                  height: `${cropBox.height}%`,
                  width: `${cropBox.x}%`,
                }}
              />
              {/* Right mask */}
              <div
                className="absolute inset-y-0 right-0 bg-black/60 backdrop-blur-[1px]"
                style={{
                  top: `${cropBox.y}%`,
                  height: `${cropBox.height}%`,
                  width: `${100 - (cropBox.x + cropBox.width)}%`,
                }}
              />
            </div>

            {/* Interactive Crop Box Overlay */}
            <div
              onPointerDown={(e) => handlePointerDown('move', e)}
              className="absolute border-2 border-emerald-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] cursor-move transition-shadow"
              style={{
                left: `${cropBox.x}%`,
                top: `${cropBox.y}%`,
                width: `${cropBox.width}%`,
                height: `${cropBox.height}%`,
              }}
            >
              {/* Grid rule of thirds lines */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                <div className="border-r border-b border-white/60" />
                <div className="border-r border-b border-white/60" />
                <div className="border-b border-white/60" />
                <div className="border-r border-b border-white/60" />
                <div className="border-r border-b border-white/60" />
                <div className="border-b border-white/60" />
                <div className="border-r border-b border-white/60" />
                <div className="border-r border-b border-white/60" />
                <div />
              </div>

              {/* 4 Corner Handles */}
              <div
                onPointerDown={(e) => handlePointerDown('nw', e)}
                className="absolute -top-2 -left-2 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full cursor-nwse-resize shadow-md"
              />
              <div
                onPointerDown={(e) => handlePointerDown('ne', e)}
                className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full cursor-nesw-resize shadow-md"
              />
              <div
                onPointerDown={(e) => handlePointerDown('sw', e)}
                className="absolute -bottom-2 -left-2 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full cursor-nesw-resize shadow-md"
              />
              <div
                onPointerDown={(e) => handlePointerDown('se', e)}
                className="absolute -bottom-2 -right-2 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full cursor-nwse-resize shadow-md"
              />

              {/* 4 Edge Midpoint Handles */}
              <div
                onPointerDown={(e) => handlePointerDown('n', e)}
                className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-2.5 bg-emerald-400 border border-white rounded-full cursor-ns-resize shadow-xs"
              />
              <div
                onPointerDown={(e) => handlePointerDown('s', e)}
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-2.5 bg-emerald-400 border border-white rounded-full cursor-ns-resize shadow-xs"
              />
              <div
                onPointerDown={(e) => handlePointerDown('w', e)}
                className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-2.5 h-6 bg-emerald-400 border border-white rounded-full cursor-ew-resize shadow-xs"
              />
              <div
                onPointerDown={(e) => handlePointerDown('e', e)}
                className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-2.5 h-6 bg-emerald-400 border border-white rounded-full cursor-ew-resize shadow-xs"
              />

              {/* Center Move Hint */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30 hover:opacity-90 transition-opacity">
                <Move className="w-5 h-5 text-white drop-shadow" />
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar: Zoom & Rotate Controls */}
        <div className="px-5 py-3 bg-neutral-950 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRotation((prev) => (prev + 90) % 360)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors cursor-pointer"
              title="Rotate 90° clockwise"
            >
              <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Rotate</span>
              {rotation > 0 && (
                <span className="ml-1 text-[10px] text-emerald-400 font-mono">
                  {rotation}°
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setRotation(0);
                applyAspectRatio(null);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors cursor-pointer"
              title="Reset Zoom & Crop"
            >
              <RefreshCw className="w-3.5 h-3.5 text-neutral-400" />
              <span>Reset</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <ZoomOut className="w-3.5 h-3.5 text-neutral-400" />
            <input
              type="range"
              min="0.8"
              max="2.5"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-28 sm:w-40 accent-emerald-500 cursor-pointer"
            />
            <ZoomIn className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-xs font-mono text-neutral-300 min-w-9">
              {Math.round(zoom * 100)}%
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-neutral-400 flex items-center gap-2">
            <span>Crop Area:</span>
            <span className="font-mono text-emerald-400 font-bold bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
              {Math.round(cropBox.width)}% × {Math.round(cropBox.height)}%
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleApplyCrop}
              className="flex items-center gap-2 px-5 sm:px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-900/40 transition-all cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Apply Crop & Save</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
