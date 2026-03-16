import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { inspectionId, bookingId, propertyAddress, amount } = await request.json();

        if (!bookingId || !amount) {
            return NextResponse.json(
                { error: 'Missing bookingId or amount' },
                { status: 400 }
            );
        }

        // Look up landlord_id from the inspection → property chain
        let landlordId: string | null = null;
        if (inspectionId) {
            const adminSupabase = createAdminClient();
            const { data: inspection } = await adminSupabase
                .from('inspections')
                .select('property_id')
                .eq('id', inspectionId)
                .single();

            if (inspection?.property_id) {
                const { data: property } = await adminSupabase
                    .from('properties')
                    .select('landlord_id')
                    .eq('id', inspection.property_id)
                    .single();

                landlordId = property?.landlord_id || null;
            }
        }

        const origin = request.headers.get('origin') || 'http://localhost:3000';

        // Generate a unique transaction reference
        const tx_ref = `PE-${bookingId}-${Date.now()}`;

        // Create Flutterwave payment link via their API
        const flutterwaveRes = await fetch('https://api.flutterwave.com/v3/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
            },
            body: JSON.stringify({
                tx_ref,
                amount,
                currency: 'USD',
                redirect_url: `${origin}/properties/book/success?tx_ref=${tx_ref}&booking_id=${bookingId}`,
                customer: {
                    email: user.email || '',
                    name: user.user_metadata?.full_name || user.email || '',
                },
                customizations: {
                    title: 'PrimeEstate',
                    description: propertyAddress
                        ? `Refundable inspection reservation for ${propertyAddress}`
                        : 'Refundable property inspection reservation fee',
                    logo: `${origin}/logo.png`,
                },
                meta: {
                    bookingId,
                    inspectionId: inspectionId || '',
                    userId: user.id,
                },
            }),
        });

        const flutterwaveData = await flutterwaveRes.json();

        if (flutterwaveData.status !== 'success') {
            console.error('Flutterwave error:', flutterwaveData);
            return NextResponse.json(
                { error: flutterwaveData.message || 'Failed to create payment link' },
                { status: 500 }
            );
        }

        // Save payment record with status pending, including landlord_id
        const supabase = await createClient();
        await supabase.from('payments').insert({
            booking_id: bookingId,
            tenant_id: user.id,
            landlord_id: landlordId,
            amount,
            currency: 'NGN',
            status: 'pending',
            flutterwave_tx_ref: tx_ref,
        });

        return NextResponse.json({ url: flutterwaveData.data.link });
    } catch (error) {
        console.error('Flutterwave checkout error:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
