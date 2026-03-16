import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
    try {
        const { transactionId, tx_ref, bookingId } = await request.json();

        if (!transactionId && !tx_ref) {
            return NextResponse.json({ error: 'Missing transaction ID or tx_ref' }, { status: 400 });
        }

        // Verify the transaction with Flutterwave API
        const verifyRes = await fetch(
            `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
                },
            }
        );

        const verifyData = await verifyRes.json();

        if (
            verifyData.status === 'success' &&
            verifyData.data.status === 'successful'
        ) {
            // Use admin client to bypass RLS for updating
            const supabase = createAdminClient();

            // Update payment status to succeeded
            // Match by flutterwave_tx_ref
            const matchRef = tx_ref || verifyData.data.tx_ref;
            const { error: paymentError } = await supabase
                .from('payments')
                .update({
                    status: 'succeeded',
                    flutterwave_transaction_id: String(transactionId),
                    updated_at: new Date().toISOString(),
                })
                .eq('flutterwave_tx_ref', matchRef);

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
                flutterwaveStatus: verifyData.data.status,
            });
        }

        return NextResponse.json({
            success: false,
            paymentStatus: 'pending',
            flutterwaveStatus: verifyData.data?.status || 'unknown',
        });
    } catch (error) {
        console.error('Flutterwave verification error:', error);
        return NextResponse.json(
            { error: 'Failed to verify payment' },
            { status: 500 }
        );
    }
}
