import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
    try {
        const { sessionId, bookingId } = await request.json();

        if (!sessionId) {
            return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

        // Retrieve the Checkout Session from Stripe to verify payment
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            // Use admin client to bypass RLS for updating
            const supabase = createAdminClient();

            // Update payment status to succeeded
            // Match by stripe_payment_intent_id (which stores the session ID)
            const { error: paymentError } = await supabase
                .from('payments')
                .update({
                    status: 'succeeded',
                    updated_at: new Date().toISOString(),
                })
                .eq('stripe_payment_intent_id', sessionId);

            if (paymentError) {
                console.error('Error updating payment status:', paymentError);
            }

            // Also update booking status to confirmed
            if (bookingId) {
                const { error: bookingError } = await supabase
                    .from('bookings')
                    .update({
                        status: 'confirmed',
                    })
                    .eq('id', bookingId);

                if (bookingError) {
                    console.error('Error updating booking status:', bookingError);
                }
            }

            return NextResponse.json({
                success: true,
                paymentStatus: 'succeeded',
                stripeStatus: session.payment_status,
            });
        }

        return NextResponse.json({
            success: false,
            paymentStatus: 'pending',
            stripeStatus: session.payment_status,
        });
    } catch (error) {
        console.error('Stripe session verification error:', error);
        return NextResponse.json(
            { error: 'Failed to verify payment session' },
            { status: 500 }
        );
    }
}
