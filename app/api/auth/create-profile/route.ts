import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, email, fullName, role } = body;

        if (!userId || !email || !fullName || !role) {
            return NextResponse.json(
                { error: 'Missing required fields: userId, email, fullName, role' },
                { status: 400 }
            );
        }

        // Validate role
        if (!['tenant', 'landlord'].includes(role)) {
            return NextResponse.json(
                { error: 'Invalid role. Must be "tenant" or "landlord".' },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        // Check if profile already exists (e.g., created by a trigger)
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('id', userId)
            .single();

        if (existing) {
            // Update the existing row with proper values
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    email,
                    full_name: fullName,
                    role,
                })
                .eq('id', userId);

            if (updateError) {
                console.error('Error updating user profile:', updateError);
                return NextResponse.json(
                    { error: updateError.message },
                    { status: 500 }
                );
            }
        } else {
            // Insert a new profile row
            const { error: insertError } = await supabase
                .from('users')
                .insert({
                    id: userId,
                    email,
                    full_name: fullName,
                    role,
                    password_hash: '',
                });

            if (insertError) {
                console.error('Error creating user profile:', insertError);
                return NextResponse.json(
                    { error: insertError.message },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Unexpected error in create-profile:', err);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
