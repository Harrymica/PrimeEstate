'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    AlertCircle,
    ArrowLeft,
    Home,
    MapPin,
    Building2,
    ImageIcon,
    Plus,
    X,
    CheckCircle,
    Loader2,
    Upload,
    Trash2,
} from 'lucide-react';

interface ImagePreview {
    file: File;
    previewUrl: string;
}

export default function NewPropertyPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [units, setUnits] = useState('1');
    const [description, setDescription] = useState('');
    const [amenityInput, setAmenityInput] = useState('');
    const [amenities, setAmenities] = useState<string[]>([]);

    // Image state
    const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
    const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
    const [dragActive, setDragActive] = useState(false);

    function addAmenity() {
        const trimmed = amenityInput.trim();
        if (trimmed && !amenities.includes(trimmed)) {
            setAmenities([...amenities, trimmed]);
            setAmenityInput('');
        }
    }

    function removeAmenity(amenity: string) {
        setAmenities(amenities.filter((a) => a !== amenity));
    }

    function handleAmenityKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addAmenity();
        }
    }

    // ----- Image handling -----
    const handleFiles = useCallback((files: FileList | null) => {
        if (!files) return;

        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        const newPreviews: ImagePreview[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            if (!allowedTypes.includes(file.type)) {
                setError(`"${file.name}" is not a supported image format. Use JPEG, PNG, WebP, or GIF.`);
                continue;
            }

            if (file.size > maxSize) {
                setError(`"${file.name}" exceeds the 5MB size limit.`);
                continue;
            }

            // Check total limit (max 10 images)
            if (imagePreviews.length + newPreviews.length >= 10) {
                setError('Maximum 10 images allowed per property.');
                break;
            }

            const previewUrl = URL.createObjectURL(file);
            newPreviews.push({ file, previewUrl });
        }

        if (newPreviews.length > 0) {
            setImagePreviews((prev) => [...prev, ...newPreviews]);
            setError(null);
        }
    }, [imagePreviews.length]);

    function removeImage(index: number) {
        setImagePreviews((prev) => {
            const updated = [...prev];
            URL.revokeObjectURL(updated[index].previewUrl);
            updated.splice(index, 1);
            return updated;
        });
    }

    function handleDrag(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        handleFiles(e.dataTransfer.files);
    }

    async function uploadImages(): Promise<string[]> {
        if (imagePreviews.length === 0) return [];

        setUploadingImages(true);

        try {
            const formData = new FormData();
            imagePreviews.forEach((img) => {
                formData.append('files', img.file);
            });

            const res = await fetch('/api/properties/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to upload images');
            }

            return data.urls;
        } finally {
            setUploadingImages(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Step 1: Upload images first
            let imageUrls: string[] = [];
            if (imagePreviews.length > 0) {
                imageUrls = await uploadImages();
            }

            // Step 2: Create the property with image URLs
            const res = await fetch('/api/properties', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address,
                    city,
                    state,
                    postal_code: postalCode,
                    units: parseInt(units) || 1,
                    description,
                    amenities,
                    image_url: imageUrls,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to create property');
                return;
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/dashboard/landlord');
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    if (success) {
        return (
            <div className="p-4 md:p-8 max-w-2xl mx-auto">
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-12 pb-12 text-center">
                        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-green-900 mb-2">Property Added Successfully!</h2>
                        <p className="text-green-700 mb-4">
                            Your property has been listed and is now available for inspections.
                        </p>
                        <p className="text-sm text-green-600">Redirecting to your dashboard...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-6 md:mb-8">
                <Link
                    href="/dashboard/landlord"
                    className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Add New Property</h1>
                <p className="text-sm md:text-base text-slate-600 mt-1 md:mt-2">
                    Fill in the details below to list your property for inspections
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Alert */}
                {error && (
                    <div className="flex gap-2 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium">Error</p>
                            <p>{error}</p>
                        </div>
                    </div>
                )}

                {/* Property Address Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <MapPin className="h-5 w-5 text-blue-600" />
                            Property Address
                        </CardTitle>
                        <CardDescription>Enter the full address of your property</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="address" className="text-sm font-medium text-slate-700">
                                Street Address *
                            </label>
                            <Input
                                id="address"
                                type="text"
                                placeholder="e.g., 123 Main Street, Apt 4B"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required
                                className="text-slate-900"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="city" className="text-sm font-medium text-slate-700">
                                    City *
                                </label>
                                <Input
                                    id="city"
                                    type="text"
                                    placeholder="e.g., New York"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    required
                                    className="text-slate-900"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="state" className="text-sm font-medium text-slate-700">
                                    State *
                                </label>
                                <Input
                                    id="state"
                                    type="text"
                                    placeholder="e.g., NY"
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                    required
                                    className="text-slate-900"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="postalCode" className="text-sm font-medium text-slate-700">
                                    Postal Code *
                                </label>
                                <Input
                                    id="postalCode"
                                    type="text"
                                    placeholder="e.g., 10001"
                                    value={postalCode}
                                    onChange={(e) => setPostalCode(e.target.value)}
                                    required
                                    className="text-slate-900"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Property Details Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Building2 className="h-5 w-5 text-blue-600" />
                            Property Details
                        </CardTitle>
                        <CardDescription>Provide additional information about your property</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="units" className="text-sm font-medium text-slate-700">
                                Number of Units
                            </label>
                            <Input
                                id="units"
                                type="number"
                                min="1"
                                max="999"
                                placeholder="1"
                                value={units}
                                onChange={(e) => setUnits(e.target.value)}
                                className="max-w-[200px] text-slate-900"
                            />
                            <p className="text-xs text-slate-500">
                                How many rentable units does this property have?
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="description" className="text-sm font-medium text-slate-700">
                                Description
                            </label>
                            <textarea
                                id="description"
                                placeholder="Describe your property — location highlights, condition, nearby amenities, etc."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Property Images Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <ImageIcon className="h-5 w-5 text-blue-600" />
                            Property Images
                        </CardTitle>
                        <CardDescription>
                            Upload up to 10 images of your property (JPEG, PNG, WebP, GIF — max 5MB each)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Drop zone */}
                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`
                relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                transition-all duration-200 ease-in-out
                ${dragActive
                                    ? 'border-blue-500 bg-blue-50 scale-[1.01]'
                                    : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                                }
                ${imagePreviews.length >= 10 ? 'opacity-50 pointer-events-none' : ''}
              `}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                multiple
                                onChange={(e) => handleFiles(e.target.files)}
                                className="hidden"
                            />

                            <div className="flex flex-col items-center gap-3">
                                <div className={`rounded-full p-4 ${dragActive ? 'bg-blue-100' : 'bg-slate-100'}`}>
                                    <Upload className={`h-8 w-8 ${dragActive ? 'text-blue-600' : 'text-slate-400'}`} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-700">
                                        {dragActive ? 'Drop images here' : 'Drag & drop images here'}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        or click to browse · JPEG, PNG, WebP, GIF · Max 5MB each
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Image previews */}
                        {imagePreviews.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm font-medium text-slate-700">
                                        {imagePreviews.length} image{imagePreviews.length > 1 ? 's' : ''} selected
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            imagePreviews.forEach((img) => URL.revokeObjectURL(img.previewUrl));
                                            setImagePreviews([]);
                                        }}
                                        className="text-xs text-red-600 hover:text-red-700 transition"
                                    >
                                        Remove all
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {imagePreviews.map((img, index) => (
                                        <div
                                            key={img.previewUrl}
                                            className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100"
                                        >
                                            <Image
                                                src={img.previewUrl}
                                                alt={`Property image ${index + 1}`}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />

                                            {/* First image badge */}
                                            {index === 0 && (
                                                <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-semibold bg-blue-600 text-white rounded-full z-10">
                                                    Cover
                                                </span>
                                            )}

                                            {/* Remove button */}
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-150 z-10 cursor-pointer"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>

                                            {/* File size */}
                                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <p className="text-[10px] text-white truncate">{img.file.name}</p>
                                                <p className="text-[10px] text-white/70">
                                                    {(img.file.size / 1024).toFixed(0)} KB
                                                </p>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Add more button */}
                                    {imagePreviews.length < 10 && (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="aspect-square rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-400 flex flex-col items-center justify-center gap-1 transition cursor-pointer"
                                        >
                                            <Plus className="h-6 w-6 text-slate-400" />
                                            <span className="text-xs text-slate-500">Add more</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Amenities Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Home className="h-5 w-5 text-blue-600" />
                            Amenities
                        </CardTitle>
                        <CardDescription>
                            Add amenities that your property offers (e.g., parking, gym, laundry)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                placeholder="Type an amenity and press Enter"
                                value={amenityInput}
                                onChange={(e) => setAmenityInput(e.target.value)}
                                onKeyDown={handleAmenityKeyDown}
                                className="text-slate-900"
                            />
                            <Button type="button" variant="outline" onClick={addAmenity} className="flex-shrink-0">
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                            </Button>
                        </div>

                        {/* Quick-add common amenities */}
                        <div>
                            <p className="text-xs text-slate-500 mb-2">Quick add:</p>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    'Parking',
                                    'Gym',
                                    'Pool',
                                    'Laundry',
                                    'Elevator',
                                    'Security',
                                    'Garden',
                                    'Balcony',
                                    'Air Conditioning',
                                    'Pet Friendly',
                                    'Furnished',
                                    'Wi-Fi',
                                ].map((a) => (
                                    <button
                                        key={a}
                                        type="button"
                                        onClick={() => {
                                            if (!amenities.includes(a)) {
                                                setAmenities([...amenities, a]);
                                            }
                                        }}
                                        disabled={amenities.includes(a)}
                                        className={`px-3 py-1.5 text-xs rounded-full border transition cursor-pointer ${amenities.includes(a)
                                            ? 'bg-blue-100 text-blue-700 border-blue-200 opacity-50 cursor-not-allowed'
                                            : 'bg-white text-slate-700 border-slate-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'
                                            }`}
                                    >
                                        {a}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Selected amenities */}
                        {amenities.length > 0 && (
                            <div>
                                <p className="text-xs text-slate-500 mb-2">Selected ({amenities.length}):</p>
                                <div className="flex flex-wrap gap-2">
                                    {amenities.map((a) => (
                                        <span
                                            key={a}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-100 text-blue-800 rounded-full"
                                        >
                                            {a}
                                            <button
                                                type="button"
                                                onClick={() => removeAmenity(a)}
                                                className="hover:text-blue-950 transition cursor-pointer"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Submit Section */}
                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-4">
                    <Link href="/dashboard/landlord">
                        <Button type="button" variant="outline" className="w-full sm:w-auto">
                            Cancel
                        </Button>
                    </Link>
                    <Button type="submit" disabled={loading || uploadingImages} className="w-full sm:w-auto sm:min-w-[200px]">
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                {uploadingImages ? 'Uploading images...' : 'Creating property...'}
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Property
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
