"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  placeholder?: string;
  fallback?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  placeholder = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEMyMi4wOTExIDIwIDI0IDE4LjA5MTEgMjQgMTZDMjQgMTMuOTA4OSAyMi4wOTExIDEyIDIwIDEyQzE3LjkwODkgMTIgMTYgMTMuOTA4OSAxNiAxNkMxNiAxOC4wOTExIDE3LjkwODkgMjAgMjAgMjBaIiBmaWxsPSIjOEM5Q0YwIi8+CjxwYXRoIGQ9Ik0yMCAyOEMxNi42ODYzIDI4IDE0IDI1LjMxMzcgMTQgMjJIMFYyMEMwIDE3Ljc5MDkgMS43OTA5IDE2IDQgMTZIMzZDMzguMjA5MSAxNiA0MCAxNy43OTA5IDQwIDIwVjIySDI2QzI2IDI1LjMxMzcgMjMuMzEzNyAyOCAyMCAyOFoiIGZpbGw9IiM4QzlDRjAiLz4KPC9zdmc+",
  fallback = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEMyMi4wOTExIDIwIDI0IDE4LjA5MTEgMjQgMTZDMjQgMTMuOTA4OSAyMi4wOTExIDEyIDIwIDEyQzE3LjkwODkgMTIgMTYgMTMuOTA4OSAxNiAxNkMxNiAxOC4wOTExIDE3LjkwODkgMjAgMjAgMjBaIiBmaWxsPSIjOEM5Q0YwIi8+CjxwYXRoIGQ9Ik0yMCAyOEMxNi42ODYzIDI4IDE0IDI1LjMxMzcgMTQgMjJIMFYyMEMwIDE3Ljc5MDkgMS43OTA5IDE2IDQgMTZIMzZDMzguMjA5MSAxNiA0MCAxNy43OTA5IDQwIDIwVjIySDI2QzI2IDI1LjMxMzcgMjMuMzEzNyAyOCAyMCAyOFoiIGZpbGw9IiM4QzlDRjAiLz4KPC9zdmc+"
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(placeholder);

  const loadImage = useCallback(() => {
    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    img.onerror = () => {
      setImageSrc(fallback);
      setHasError(true);
      setIsLoading(false);
    };
    img.src = src;
  }, [src, fallback]);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && isLoading) {
        loadImage();
      }
    });
  }, [isLoading, loadImage]);

  useEffect(() => {
    if (priority) {
      loadImage();
    }
  }, [priority, loadImage]);

  useEffect(() => {
    if (!priority) {
      const observer = new IntersectionObserver(handleIntersection, {
        rootMargin: "50px",
        threshold: 0.1,
      });

      if (typeof document !== 'undefined') {
        const imgElement = document.querySelector(`[data-src="${src}"]`);
        if (imgElement) {
          observer.observe(imgElement);
        }
      }

      return () => observer.disconnect();
    }
  }, [priority, src, handleIntersection]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gray-100 animate-pulse"
          />
        )}
      </AnimatePresence>

      <motion.img
        data-src={src}
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        loading={priority ? "eager" : "lazy"}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageSrc(fallback);
          setHasError(true);
          setIsLoading(false);
        }}
      />

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-500">
            <div className="text-2xl mb-2">📷</div>
            <div className="text-sm">Image unavailable</div>
          </div>
        </div>
      )}
    </div>
  );
}

// Avatar component with optimization
export function OptimizedAvatar({
  src,
  alt,
  size = "md",
  className = "",
}: {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={`${sizeClasses[size]} rounded-full ${className}`}
      fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM4QzlDRjAiLz4KPHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDEwQzEyLjA5MTEgMTAgMTQgOC4wOTExIDE0IDZDMTQgMy45MDg5IDEyLjA5MTEgMiAxMCAyQzcuOTA4OSAyIDYgMy45MDg5IDYgNkM2IDguMDkxMSA3LjkwODkgMTAgMTAgMTBaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTAgMThDNi42ODYzIDE4IDQgMTUuMzEzNyA0IDEySDBWMTBDMCA3Ljc5MDkgMS43OTA5IDYgNCA2SDE2QzE4LjIwOTEgNiAyMCA3Ljc5MDkgMjAgMTBWMTRIMTZDMjAgMTUuMzEzNyAxNy4zMTM3IDE4IDE0IDE4WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+"
    />
  );
} 