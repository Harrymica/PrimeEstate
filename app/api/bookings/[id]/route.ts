import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Use admin client to bypass RLS — the join through
        // bookings → inspections → properties → users may fail with
        // normal client due to RLS blocking landlord's user row
        const supabase = createAdminClient();

        // Fetch booking with full join chain
        const { data: booking, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // Fetch inspection
        const { data: inspection } = await supabase
            .from('inspections')
            .select('*')
            .eq('id', booking.inspection_id)
            .single();

        let propertyData = null;
        let landlordData = null;

        if (inspection) {
            // Fetch property
            const { data: property } = await supabase
                .from('properties')
                .select('address, city, state, postal_code, units, landlord_id')
                .eq('id', inspection.property_id)
                .single();

            propertyData = property;

            if (property?.landlord_id) {
                // Fetch landlord user info
                const { data: landlord } = await supabase
                    .from('users')
                    .select('full_name, email, phone')
                    .eq('id', property.landlord_id)
                    .single();

                landlordData = landlord;
            }
        }

        // Assemble the response in the expected nested shape
        const result = {
            ...booking,
            inspections: inspection ? {
                ...inspection,
                properties: propertyData ? {
                    ...propertyData,
                    users: landlordData || { full_name: null, email: null, phone: null },
                } : null,
            } : null,
        };

        return NextResponse.json({ booking: result });
    } catch (err) {
        console.error('Error fetching booking:', err);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
