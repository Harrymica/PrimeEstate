import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        const { data: property, error } = await supabase
            .from('properties')
            .select('*, users(full_name, email)')
            .eq('id', id)
            .single();

        if (error || !property) {
            return NextResponse.json({ error: 'Property not found' }, { status: 404 });
        }

        return NextResponse.json({ property });
    } catch {
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}
