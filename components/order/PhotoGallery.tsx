"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  Expand,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoGalleryProps {
  photos: string[];
  title?: string;
  columns?: 2 | 3 | 4;
}

export function PhotoGallery({
  photos,
  title = "Photos",
  columns = 4,
}: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextPhoto();
      if (e.key === "ArrowLeft") prevPhoto();
      if (e.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex]);

  const nextPhoto = useCallback(() => {
    setSelectedIndex((prev) => (prev + 1) % photos.length);
    setImageLoading(true);
    setImageError(false);
  }, [photos.length]);

  const prevPhoto = useCallback(() => {
    setSelectedIndex((prev) => (prev - 1 + photos.length) % photos.length);
    setImageLoading(true);
    setImageError(false);
  }, [photos.length]);

  const openPhoto = useCallback((index: number) => {
    setSelectedIndex(index);
    setIsOpen(true);
    setImageLoading(true);
    setImageError(false);
  }, []);

  const downloadPhoto = useCallback(() => {
    const link = document.createElement("a");
    link.href = photos[selectedIndex];
    link.download = `photo-${selectedIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [photos, selectedIndex]);

  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 mx-auto mb-3 bg-gray-50 rounded-full flex items-center justify-center">
          <ZoomIn className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-sm text-gray-500">No photos available</p>
      </div>
    );
  }

  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  };

  return (
    <>
      {/* Gallery Grid */}
      <div className="space-y-4">
        {title && (
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-[#111111]">{title}</h3>
            <span className="text-xs text-gray-500">
              {photos.length} {photos.length === 1 ? "photo" : "photos"}
            </span>
          </div>
        )}

        <div className={cn("grid gap-3", gridCols[columns])}>
          {photos.map((photo, index) => (
            <button
              key={index}
              onClick={() => openPhoto(index)}
              className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 bg-gray-50 transition-all duration-200 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1742B1]/20"
              aria-label={`View photo ${index + 1}`}
            >
              <Image
                src={photo}
                alt={`Photo ${index + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="bg-white rounded-full p-2">
                    <Expand className="h-4 w-4 text-[#111111]" />
                  </div>
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Fullscreen Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[100vw] max-h-[100vh] w-screen h-screen p-0 bg-black/95 backdrop-blur-sm border-0">
          {/* Header Controls */}
          <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/60 to-transparent p-6">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center gap-4">
                <span className="text-white text-sm">
                  {selectedIndex + 1} of {photos.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={downloadPhoto}
                  className="p-2.5 rounded-lg hover:bg-white/10 text-white transition-colors"
                  aria-label="Download photo"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2.5 rounded-lg hover:bg-white/10 text-white transition-colors"
                  aria-label="Close gallery"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          {photos.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full hover:bg-white/10 text-white transition-all duration-200"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextPhoto}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full hover:bg-white/10 text-white transition-all duration-200"
                aria-label="Next photo"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Main Image Container - Full Screen */}
          <div className="relative w-full h-full flex items-center justify-center">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}

            {imageError ? (
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
                  <X className="h-6 w-6 text-white/40" />
                </div>
                <p className="text-white/40 text-sm">Failed to load image</p>
              </div>
            ) : (
              <img
                src={photos[selectedIndex]}
                alt={`Photo ${selectedIndex + 1}`}
                className="w-full h-full object-contain"
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageLoading(false);
                  setImageError(true);
                }}
              />
            )}
          </div>

          {/* Thumbnail Strip - More Elegant */}
          {photos.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/60 to-transparent">
              <div className="p-6">
                <div className="flex items-center justify-center gap-2 overflow-x-auto max-w-4xl mx-auto">
                  {photos.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedIndex(index);
                        setImageLoading(true);
                        setImageError(false);
                      }}
                      className={cn(
                        "relative w-14 h-14 rounded overflow-hidden border transition-all duration-200 flex-shrink-0",
                        selectedIndex === index
                          ? "border-white ring-2 ring-white/30"
                          : "border-white/20 hover:border-white/40 opacity-60 hover:opacity-100",
                      )}
                      aria-label={`Go to photo ${index + 1}`}
                    >
                      <Image
                        src={photo}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
