import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserProfile } from '@/lib/auth-helpers';

export async function POST(request: NextRequest) {
    try {
        const profile = await getCurrentUserProfile();

        if (!profile) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (profile.role !== 'landlord' && profile.role !== 'admin') {
            return NextResponse.json({ error: 'Only landlords can upload images' }, { status: 403 });
        }

        const formData = await request.formData();
        const files = formData.getAll('files') as unknown as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No files provided' }, { status: 400 });
        }

        // Validate files
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

        for (const file of files) {
            if (!allowedTypes.includes(file.type)) {
                return NextResponse.json(
                    { error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP, GIF` },
                    { status: 400 }
                );
            }
            if (file.size > maxSize) {
                return NextResponse.json(
                    { error: `File "${file.name}" exceeds 5MB limit` },
                    { status: 400 }
                );
            }
        }

        const supabase = await createClient();
        const uploadedUrls: string[] = [];

        for (const file of files) {
            // Create a unique filename: {landlord_id}/{timestamp}_{sanitized_name}
            const timestamp = Date.now();
            const sanitizedName = file.name
                .toLowerCase()
                .replace(/[^a-z0-9.]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');

            const filePath = `${profile.id}/${timestamp}_${sanitizedName}`;

            // Convert File to ArrayBuffer then to Buffer for upload
            const arrayBuffer = await file.arrayBuffer();
            const buffer = new Uint8Array(arrayBuffer);

            const { data, error } = await supabase.storage
                .from('property-images')
                .upload(filePath, buffer, {
                    contentType: file.type,
                    cacheControl: '3600',
                    upsert: false,
                });

            if (error) {
                console.error('Upload error for file:', file.name, error);
                return NextResponse.json(
                    { error: `Failed to upload "${file.name}": ${error.message}` },
                    { status: 500 }
                );
            }

            // Get the public URL
            const { data: urlData } = supabase.storage
                .from('property-images')
                .getPublicUrl(data.path);

            uploadedUrls.push(urlData.publicUrl);
        }

        return NextResponse.json({
            success: true,
            urls: uploadedUrls,
            count: uploadedUrls.length,
        });
    } catch (err) {
        console.error('Unexpected error in upload:', err);
        return NextResponse.json(
            { error: 'An unexpected error occurred during upload' },
            { status: 500 }
        );
    }
}
