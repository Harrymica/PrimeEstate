import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth-helpers';

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { inspection_id, visit_date, notes } = await request.json();

        if (!inspection_id || !visit_date) {
            return NextResponse.json(
                { error: 'Inspection ID and visit date are required' },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        const { data, error } = await supabase
            .from('bookings')
            .insert({
                inspection_id,
                tenant_id: user.id,
                visit_date,
                status: 'pending',
                notes: notes || '',
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating booking:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, booking: data });
    } catch (err) {
        console.error('Unexpected error:', err);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
