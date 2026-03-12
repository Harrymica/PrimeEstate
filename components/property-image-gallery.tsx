'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, ZoomIn, Maximize2 } from 'lucide-react';

interface PropertyImageGalleryProps {
    images: string[];
    address: string;
}

export default function PropertyImageGallery({ images, address }: PropertyImageGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const mainImageRef = useRef<HTMLDivElement>(null);

    const minSwipeDistance = 50;

    // Navigate to specific image
    const goToImage = useCallback((index: number) => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex(index);
        setTimeout(() => setIsTransitioning(false), 300);
    }, [isTransitioning]);

    const goNext = useCallback(() => {
        goToImage((currentIndex + 1) % images.length);
    }, [currentIndex, images.length, goToImage]);

    const goPrev = useCallback(() => {
        goToImage((currentIndex - 1 + images.length) % images.length);
    }, [currentIndex, images.length, goToImage]);

    // Touch handlers for swipe
    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        if (Math.abs(distance) >= minSwipeDistance) {
            if (distance > 0) goNext();
            else goPrev();
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isLightboxOpen) {
                if (e.key === 'Escape') setIsLightboxOpen(false);
                if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev + 1) % images.length);
                if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isLightboxOpen, images.length]);

    // Prevent body scroll when lightbox is open
    useEffect(() => {
        if (isLightboxOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isLightboxOpen]);

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setIsLightboxOpen(true);
    };

    if (images.length === 0) return null;

    return (
        <>
            {/* ==================== MAIN GALLERY ==================== */}
            <div className="rounded-2xl overflow-hidden">
                {/* Mobile: Full-width swipeable carousel */}
                <div className="md:hidden relative">
                    <div
                        ref={mainImageRef}
                        className="relative h-72 sm:h-80 overflow-hidden"
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    >
                        {images.map((url, i) => (
                            <div
                                key={i}
                                className="absolute inset-0 transition-all duration-300 ease-in-out"
                                style={{
                                    transform: `translateX(${(i - currentIndex) * 100}%)`,
                                    opacity: i === currentIndex ? 1 : 0.5,
                                }}
                            >
                                <Image
                                    src={url}
                                    alt={`${address} - Photo ${i + 1}`}
                                    fill
                                    className="object-cover"
                                    priority={i === 0}
                                />
                            </div>
                        ))}

                        {/* Gradient overlay at bottom for dots */}
                        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                        {/* Tap to fullscreen */}
                        <button
                            onClick={() => openLightbox(currentIndex)}
                            className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white/80 hover:text-white transition z-10"
                        >
                            <Maximize2 className="w-4 h-4" />
                        </button>

                        {/* Image counter */}
                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs font-medium z-10">
                            {currentIndex + 1} / {images.length}
                        </div>

                        {/* Dot indicators */}
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
                            {images.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => goToImage(i)}
                                    className={`rounded-full transition-all duration-300 ${i === currentIndex
                                            ? 'w-6 h-2'
                                            : 'w-2 h-2 opacity-50'
                                        }`}
                                    style={{
                                        background: i === currentIndex
                                            ? '#D4A853'
                                            : 'rgba(255,255,255,0.7)',
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Mobile thumbnail strip */}
                    {images.length > 1 && (
                        <div className="flex gap-1.5 p-3 overflow-x-auto scrollbar-hide" style={{ background: '#1A3C2A' }}>
                            {images.map((url, i) => (
                                <button
                                    key={i}
                                    onClick={() => goToImage(i)}
                                    className={`relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden transition-all duration-200 ${i === currentIndex
                                            ? 'ring-2 ring-offset-1 scale-105'
                                            : 'opacity-50 hover:opacity-80'
                                        }`}
                                    style={{
                                        ringColor: '#D4A853',
                                        ringOffsetColor: '#1A3C2A',
                                    }}
                                >
                                    <Image
                                        src={url}
                                        alt={`Thumbnail ${i + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                    {i === currentIndex && (
                                        <div
                                            className="absolute inset-0 rounded-lg"
                                            style={{ border: '2px solid #D4A853' }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Desktop: Grid gallery with hover effects */}
                <div className="hidden md:block">
                    <div className={`grid gap-2 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                        {/* Main image */}
                        <div
                            className="relative h-[440px] group cursor-pointer overflow-hidden"
                            onClick={() => openLightbox(0)}
                        >
                            <Image
                                src={images[0]}
                                alt={address}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                priority
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
                                    <ZoomIn className="w-3.5 h-3.5" />
                                    View full size
                                </div>
                            </div>
                        </div>

                        {/* Side images grid */}
                        {images.length > 1 && (
                            <div className="grid grid-cols-2 gap-2">
                                {images.slice(1, 5).map((url, i) => (
                                    <div
                                        key={i}
                                        className="relative h-[216px] group cursor-pointer overflow-hidden"
                                        onClick={() => openLightbox(i + 1)}
                                    >
                                        <Image
                                            src={url}
                                            alt={`${address} - Photo ${i + 2}`}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

                                        {/* "Show all" overlay on last visible image */}
                                        {i === 3 && images.length > 5 && (
                                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center transition-colors group-hover:bg-black/60">
                                                <Maximize2 className="w-6 h-6 text-white mb-1" />
                                                <span className="text-white font-bold text-sm">
                                                    Show all {images.length} photos
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Fill empty slots if fewer than 5 images */}
                                {images.length < 5 &&
                                    Array.from({ length: Math.min(4, 5 - images.length) }).map((_, i) => (
                                        <div
                                            key={`empty-${i}`}
                                            className="h-[216px] flex items-center justify-center"
                                            style={{ background: '#1A3C2A' }}
                                        />
                                    ))}
                            </div>
                        )}
                    </div>

                    {/* Desktop thumbnail strip (for 5+ images) */}
                    {images.length > 5 && (
                        <div className="flex gap-2 mt-2 overflow-x-auto pb-1 scrollbar-hide">
                            {images.map((url, i) => (
                                <button
                                    key={i}
                                    onClick={() => openLightbox(i)}
                                    className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-200 ${i < 5 ? 'ring-1 ring-white/20' : ''
                                        } hover:ring-2 hover:opacity-100`}
                                    style={{ opacity: i < 5 ? 0.6 : 1 }}
                                >
                                    <Image
                                        src={url}
                                        alt={`Thumbnail ${i + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ==================== FULLSCREEN LIGHTBOX ==================== */}
            {isLightboxOpen && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.95)' }}
                    onClick={() => setIsLightboxOpen(false)}
                >
                    {/* Close button */}
                    <button
                        onClick={() => setIsLightboxOpen(false)}
                        className="absolute top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition z-50"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Counter */}
                    <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium z-50">
                        {lightboxIndex + 1} / {images.length}
                    </div>

                    {/* Previous button */}
                    {images.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
                            }}
                            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition z-50"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    )}

                    {/* Next button */}
                    {images.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setLightboxIndex((prev) => (prev + 1) % images.length);
                            }}
                            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition z-50"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    )}

                    {/* Main lightbox image */}
                    <div
                        className="relative w-full h-full max-w-5xl max-h-[80vh] mx-4 md:mx-12"
                        onClick={(e) => e.stopPropagation()}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={() => {
                            if (!touchStart || !touchEnd) return;
                            const distance = touchStart - touchEnd;
                            if (Math.abs(distance) >= minSwipeDistance) {
                                if (distance > 0) {
                                    setLightboxIndex((prev) => (prev + 1) % images.length);
                                } else {
                                    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
                                }
                            }
                        }}
                    >
                        <Image
                            src={images[lightboxIndex]}
                            alt={`${address} - Photo ${lightboxIndex + 1}`}
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>

                    {/* Lightbox thumbnail strip */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto scrollbar-hide z-50">
                        {images.map((url, i) => (
                            <button
                                key={i}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setLightboxIndex(i);
                                }}
                                className={`relative flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden transition-all duration-200 ${i === lightboxIndex
                                        ? 'ring-2 scale-110 opacity-100'
                                        : 'opacity-40 hover:opacity-70'
                                    }`}
                                style={{ ringColor: '#D4A853' }}
                            >
                                <Image
                                    src={url}
                                    alt={`Thumbnail ${i + 1}`}
                                    fill
                                    className="object-cover"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
