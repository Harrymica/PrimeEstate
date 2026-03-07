import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth-helpers';

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { property_id, notes } = await request.json();

        if (!property_id) {
            return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
        }

        const supabase = await createClient();

        // Look up the property to get the landlord_id
        const { data: property, error: propError } = await supabase
            .from('properties')
            .select('landlord_id')
            .eq('id', property_id)
            .single();

        if (propError || !property) {
            return NextResponse.json({ error: 'Property not found' }, { status: 404 });
        }

        // inspections table: property_id, landlord_id, tenant_id, scheduled_date, status, notes
        const { data, error } = await supabase
            .from('inspections')
            .insert({
                property_id,
                landlord_id: property.landlord_id,
                tenant_id: user.id,
                status: 'pending',
                notes: notes || '',
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating inspection:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, inspection: data });
    } catch (err) {
        console.error('Unexpected error:', err);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
