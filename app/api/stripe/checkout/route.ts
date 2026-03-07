import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth-helpers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

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

        const origin = request.headers.get('origin') || 'http://localhost:3000';

        // Create Stripe Checkout Session with customer email pre-filled
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            customer_email: user.email || undefined,
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Property Inspection Reservation Fee',
                            description: propertyAddress
                                ? `Refundable inspection reservation for ${propertyAddress}`
                                : 'Refundable property inspection reservation fee',
                        },
                        unit_amount: Math.round(amount * 100), // cents
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                bookingId,
                inspectionId: inspectionId || '',
                userId: user.id,
            },
            success_url: `${origin}/properties/book/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
            cancel_url: `${origin}/properties`,
        });

        // Save payment record with status pending
        const supabase = await createClient();
        await supabase.from('payments').insert({
            booking_id: bookingId,
            tenant_id: user.id,
            amount,
            currency: 'usd',
            status: 'pending',
            stripe_payment_intent_id: session.id,
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('Stripe checkout error:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
