'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    CreditCard,
    Shield,
    CheckCircle,
    Loader2,
    AlertCircle,
    Building2,
    MapPin,
    Lock,
    ExternalLink,
} from 'lucide-react';

interface PropertyData {
    id: string;
    address: string;
    city: string;
    state: string;
    postal_code: string;
    description: string;
    units: number;
}

export default function BookInspectionPage({ params }: { params: Promise<{ id: string }> }) {
    const [propertyId, setPropertyId] = useState<string>('');
    const [property, setProperty] = useState<PropertyData | null>(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [visitDate, setVisitDate] = useState('');
    const [notes, setNotes] = useState('');

    // Resolve params
    useEffect(() => {
        params.then((p) => setPropertyId(p.id));
    }, [params]);

    // Fetch property data
    useEffect(() => {
        if (!propertyId) return;

        async function fetchProperty() {
            try {
                const res = await fetch(`/api/properties/${propertyId}`);
                if (!res.ok) throw new Error('Property not found');
                const data = await res.json();
                setProperty(data.property);
            } catch {
                setError('Could not load property details');
            } finally {
                setLoading(false);
            }
        }
        fetchProperty();
    }, [propertyId]);

    async function handlePayment() {
        if (!visitDate) {
            setError('Please select a preferred visit date');
            return;
        }

        setError(null);
        setPaying(true);

        try {
            // Step 1: Create inspection
            const inspectionRes = await fetch('/api/inspections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    property_id: propertyId,
                    notes,
                }),
            });

            const inspectionData = await inspectionRes.json();

            if (!inspectionRes.ok) {
                throw new Error(inspectionData.error || 'Failed to create inspection request');
            }

            // Step 2: Create booking
            const bookingRes = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    inspection_id: inspectionData.inspection.id,
                    visit_date: visitDate,
                    notes,
                }),
            });

            const bookingData = await bookingRes.json();

            if (!bookingRes.ok) {
                throw new Error(bookingData.error || 'Failed to create booking');
            }

            // Step 3: Create Stripe Checkout Session & redirect
            const checkoutRes = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    inspectionId: inspectionData.inspection.id,
                    bookingId: bookingData.booking.id,
                    propertyAddress: property?.address || '',
                    amount: 50,
                }),
            });

            const checkoutData = await checkoutRes.json();

            if (!checkoutRes.ok) {
                throw new Error(checkoutData.error || 'Failed to create checkout session');
            }

            // Redirect to Stripe Checkout
            if (checkoutData.url) {
                window.location.href = checkoutData.url;
            } else {
                throw new Error('No checkout URL returned');
            }

        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
            setPaying(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#0F2A1D' }}>
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#D4A853' }} />
            </div>
        );
    }

    return (
        <div className="min-h-screen landing-dark" style={{ background: '#0F2A1D', color: '#FFFFFF' }}>
            <div className="noise-overlay" />

            <div className="max-w-3xl mx-auto px-6 pt-12 pb-20 relative z-10">
                {/* Back */}
                <Link
                    href={`/properties/${propertyId}`}
                    className="inline-flex items-center gap-2 text-sm font-medium transition-colors mb-8"
                    style={{ color: '#A0B8A8' }}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Property
                </Link>

                {/* Header */}
                <div className="text-center mb-10">
                    <div
                        className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4"
                        style={{ background: 'rgba(212,168,83,0.15)' }}
                    >
                        <CreditCard className="w-7 h-7" style={{ color: '#D4A853' }} />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Reserve Your Inspection</h1>
                    <p style={{ color: '#6B8B73' }}>Pay a refundable $50 reservation fee to secure your private inspection slot</p>
                </div>

                <div className="grid md:grid-cols-5 gap-8">
                    {/* Left: Form */}
                    <div className="md:col-span-3 space-y-6">
                        {/* Error */}
                        {error && (
                            <div
                                className="flex items-start gap-3 p-4 rounded-xl"
                                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
                            >
                                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" />
                                <p className="text-sm text-red-300">{error}</p>
                            </div>
                        )}

                        {/* Property Summary */}
                        {property && (
                            <div
                                className="p-5 rounded-2xl"
                                style={{ background: '#1A3C2A', border: '1px solid rgba(255,255,255,0.06)' }}
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ background: 'rgba(212,168,83,0.15)' }}
                                    >
                                        <Building2 className="w-6 h-6" style={{ color: '#D4A853' }} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">{property.address}</h3>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <MapPin className="w-3.5 h-3.5" style={{ color: '#D4A853' }} />
                                            <span className="text-sm" style={{ color: '#6B8B73' }}>
                                                {property.city}, {property.state} {property.postal_code}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Visit Date */}
                        <div
                            className="p-5 rounded-2xl space-y-4"
                            style={{ background: '#1A3C2A', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                            <h3 className="font-bold flex items-center gap-2">
                                <Building2 className="w-4 h-4" style={{ color: '#D4A853' }} />
                                Preferred Visit Date
                            </h3>
                            <input
                                type="date"
                                value={visitDate}
                                onChange={(e) => setVisitDate(e.target.value)}
                                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                                className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2"
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    colorScheme: 'dark',
                                }}
                                required
                            />

                            <div className="space-y-2">
                                <label className="text-sm font-medium" style={{ color: '#A0B8A8' }}>
                                    Additional Notes (optional)
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Any specific questions or requirements..."
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 resize-none"
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                    }}
                                />
                            </div>
                        </div>

                        {/* Why this fee - explainer */}
                        <div
                            className="p-5 rounded-2xl"
                            style={{ background: 'rgba(212,168,83,0.06)', border: '1px solid rgba(212,168,83,0.15)' }}
                        >
                            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                                <Shield className="w-4 h-4" style={{ color: '#D4A853' }} />
                                Why a $50 Reservation Fee?
                            </h3>
                            <ul className="space-y-2">
                                {[
                                    'Confirms serious interest — ensures only genuine applicants reserve viewings',
                                    'Prevents time-wasting — protects landlords from no-show bookings',
                                    'Reserves a private slot — guarantees your exclusive inspection time',
                                    'Fully refundable — get your $50 back within 48 hours after viewing if you decide not to proceed',
                                ].map((reason, i) => (
                                    <li key={i} className="flex items-start gap-2.5 text-xs" style={{ color: '#A0B8A8' }}>
                                        <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#58B078' }} />
                                        {reason}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Refund guarantee banner */}
                        <div
                            className="p-3 rounded-xl text-center"
                            style={{ background: 'rgba(88,176,120,0.08)', border: '1px solid rgba(88,176,120,0.15)' }}
                        >
                            <p className="text-xs font-medium" style={{ color: '#58B078' }}>
                                🛡️ 100% Refundable — If you decide not to proceed after your inspection, request a full refund within 48 hours.
                            </p>
                        </div>

                        {/* Pay Button */}
                        <button
                            onClick={handlePayment}
                            disabled={paying || !visitDate}
                            className="w-full btn-gold py-4 rounded-xl text-sm font-bold cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {paying ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Redirecting to Stripe...
                                </>
                            ) : (
                                <>
                                    <Lock className="w-4 h-4" />
                                    Continue to Payment — $50
                                    <ExternalLink className="w-3.5 h-3.5 ml-1" />
                                </>
                            )}
                        </button>

                        <p className="text-center text-xs" style={{ color: '#6B8B73' }}>
                            <Shield className="w-3 h-3 inline mr-1" />
                            You&apos;ll be redirected to Stripe&apos;s secure checkout. Refundable within 48 hours.
                        </p>
                    </div>

                    {/* Right: Order Summary */}
                    <div className="md:col-span-2">
                        <div
                            className="sticky top-12 rounded-2xl p-5 space-y-4"
                            style={{ background: '#1A3C2A', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                            <h3 className="font-bold text-sm">Order Summary</h3>

                            <div className="space-y-3 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                <div className="flex justify-between text-sm">
                                    <span style={{ color: '#A0B8A8' }}>Reservation Fee</span>
                                    <span>$50.00</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span style={{ color: '#A0B8A8' }}>Service Fee</span>
                                    <span>$0.00</span>
                                </div>
                            </div>

                            <div className="flex justify-between font-bold">
                                <span>Total (Refundable)</span>
                                <span style={{ color: '#D4A853' }}>$50.00</span>
                            </div>

                            <div
                                className="p-2.5 rounded-lg"
                                style={{ background: 'rgba(88,176,120,0.08)', border: '1px solid rgba(88,176,120,0.12)' }}
                            >
                                <p className="text-[11px] text-center font-medium" style={{ color: '#58B078' }}>
                                    🛡️ 100% refundable within 48h after inspection
                                </p>
                            </div>

                            <div className="space-y-2.5 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                {[
                                    'Redirected to Stripe secure checkout',
                                    'Private exclusive inspection slot',
                                    'Refundable within 48 hours after viewing',
                                    'Booking confirmation PDF on success',
                                ].map((feat, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#58B078' }} />
                                        <span className="text-xs" style={{ color: '#A0B8A8' }}>{feat}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
