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
            return NextResponse.json({ error: 'Only landlords can add properties' }, { status: 403 });
        }

        const body = await request.json();
        const { address, city, state, postal_code, units, description, amenities, image_url } = body;

        // Validate required fields
        if (!address || !city || !state || !postal_code) {
            return NextResponse.json(
                { error: 'Address, city, state, and postal code are required' },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        const { data, error } = await supabase
            .from('properties')
            .insert({
                landlord_id: profile.id,
                address,
                city,
                state,
                postal_code,
                units: units || 1,
                description: description || '',
                amenities: amenities || [],
                image_url: image_url || [],
                is_available: true,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating property:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, property: data });
    } catch (err) {
        console.error('Unexpected error creating property:', err);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('properties')
            .select('*, users(full_name, email)')
            .eq('is_available', true)
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ properties: data });
    } catch (err) {
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
