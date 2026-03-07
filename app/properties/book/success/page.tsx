'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    CheckCircle,
    Download,
    Loader2,
    Building2,
    MapPin,
    Calendar,
    CreditCard,
    Shield,
    Home,
    User,
    Mail,
    FileText,
} from 'lucide-react';

interface BookingData {
    id: string;
    tenant_id: string;
    inspection_id: string;
    status: string;
    visit_date: string;
    notes: string;
    created_at: string;
    inspections: {
        id: string;
        property_id: string;
        notes: string;
        status: string;
        properties: {
            address: string;
            city: string;
            state: string;
            postal_code: string;
            units: number;
            users: {
                full_name: string;
                email: string;
                phone: string;
            };
        };
    };
}

export default function BookingSuccessPage() {
    const searchParams = useSearchParams();
    const bookingId = searchParams.get('booking_id');
    const sessionId = searchParams.get('session_id');

    const [booking, setBooking] = useState<BookingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloading, setDownloading] = useState(false);
    const pdfTriggered = useRef(false);

    useEffect(() => {
        if (!bookingId) {
            setError('No booking ID found');
            setLoading(false);
            return;
        }

        async function fetchBooking() {
            try {
                const res = await fetch(`/api/bookings/${bookingId}`);
                if (!res.ok) throw new Error('Booking not found');
                const data = await res.json();
                setBooking(data.booking);
            } catch {
                setError('Could not load booking details');
            } finally {
                setLoading(false);
            }
        }
        fetchBooking();
    }, [bookingId]);

    // Auto-trigger PDF download once booking data is loaded
    useEffect(() => {
        if (booking && !pdfTriggered.current) {
            pdfTriggered.current = true;
            // Small delay to let the page render first
            setTimeout(() => {
                generateAndDownloadPDF(booking);
            }, 1500);
        }
    }, [booking]);

    function generateAndDownloadPDF(b: BookingData) {
        setDownloading(true);
        try {
            const prop = b.inspections?.properties;
            const landlord = prop?.users;
            const visitDateFormatted = new Date(b.visit_date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
            const bookingDateFormatted = new Date(b.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });

            const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Booking Confirmation - PrimeEstate</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a2e; background: #fff; }
        .container { max-width: 700px; margin: 0 auto; padding: 40px 30px; }
        .header { text-align: center; padding-bottom: 30px; border-bottom: 3px solid #D4A853; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: 800; color: #0F2A1D; }
        .logo span { color: #D4A853; }
        .subtitle { color: #6B8B73; margin-top: 5px; font-size: 14px; }
        .badge { display: inline-block; background: #e8f5e9; color: #2e7d32; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; margin-top: 15px; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #D4A853; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #eee; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .info-item { padding: 12px 15px; background: #f8f9fa; border-radius: 8px; }
        .info-label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .info-value { font-size: 15px; font-weight: 600; color: #1a1a2e; }
        .full-width { grid-column: 1 / -1; }
        .refund-box { background: #e8f5e9; border: 1px solid #c8e6c9; border-radius: 10px; padding: 15px 20px; margin-top: 25px; }
        .refund-box p { font-size: 13px; color: #2e7d32; line-height: 1.5; }
        .footer { margin-top: 35px; padding-top: 20px; border-top: 2px solid #eee; text-align: center; }
        .footer p { font-size: 12px; color: #999; margin-bottom: 4px; }
        .amount-box { text-align: center; background: linear-gradient(135deg, #0F2A1D, #1A3C2A); color: #fff; padding: 20px; border-radius: 12px; margin: 20px 0; }
        .amount { font-size: 36px; font-weight: 800; color: #D4A853; }
        .amount-label { font-size: 12px; color: #A0B8A8; margin-top: 5px; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Prime<span>Estate</span></div>
            <div class="subtitle">Property Inspection Booking Confirmation</div>
            <div class="badge">✓ Reservation Confirmed</div>
        </div>

        <div class="amount-box">
            <div class="amount">$50.00</div>
            <div class="amount-label">Refundable Inspection Reservation Fee</div>
        </div>

        <div class="section">
            <div class="section-title">Booking Details</div>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Booking ID</div>
                    <div class="info-value">${b.id.slice(0, 8).toUpperCase()}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Booking Date</div>
                    <div class="info-value">${bookingDateFormatted}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Visit Date</div>
                    <div class="info-value">${visitDateFormatted}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Status</div>
                    <div class="info-value" style="color: #D4A853;">Pending Confirmation</div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Property Information</div>
            <div class="info-grid">
                <div class="info-item full-width">
                    <div class="info-label">Address</div>
                    <div class="info-value">${prop?.address || 'N/A'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">City</div>
                    <div class="info-value">${prop?.city || 'N/A'}, ${prop?.state || ''}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Postal Code</div>
                    <div class="info-value">${prop?.postal_code || 'N/A'}</div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Landlord / Contact</div>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Name</div>
                    <div class="info-value">${landlord?.full_name || 'N/A'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Email</div>
                    <div class="info-value">${landlord?.email || 'N/A'}</div>
                </div>
            </div>
        </div>

        ${b.notes ? `
        <div class="section">
            <div class="section-title">Your Notes</div>
            <div class="info-item full-width">
                <div class="info-value" style="font-weight: 400; font-size: 14px; line-height: 1.5;">${b.notes}</div>
            </div>
        </div>
        ` : ''}

        <div class="refund-box">
            <p><strong>🛡️ Refund Policy:</strong> Your $50 reservation fee is fully refundable. If you decide not to proceed after your inspection, request a refund within 48 hours of your scheduled visit date.</p>
        </div>

        <div class="footer">
            <p><strong>PrimeEstate</strong> — Property Inspection Platform</p>
            <p>This document serves as your booking confirmation. Please present it at your inspection.</p>
            <p>Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
    </div>
</body>
</html>`;

            // Create a Blob and trigger download
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);

            // Open in new window and trigger print (which allows saving as PDF)
            const printWindow = window.open(url, '_blank');
            if (printWindow) {
                printWindow.onload = () => {
                    setTimeout(() => {
                        printWindow.print();
                    }, 500);
                };
            } else {
                // Fallback: download as HTML file
                const a = document.createElement('a');
                a.href = url;
                a.download = `PrimeEstate-Booking-${b.id.slice(0, 8).toUpperCase()}.html`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }

            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('PDF generation error:', err);
        } finally {
            setDownloading(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#0F2A1D' }}>
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: '#D4A853' }} />
                    <p className="mt-4 text-sm" style={{ color: '#A0B8A8' }}>Loading your booking confirmation...</p>
                </div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0F2A1D', color: '#FFFFFF' }}>
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error || 'Booking not found'}</p>
                    <Link href="/properties">
                        <button className="btn-gold px-6 py-3 rounded-xl text-sm font-bold cursor-pointer">
                            Browse Properties
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    const prop = booking.inspections?.properties;
    const landlord = prop?.users;

    return (
        <div className="min-h-screen landing-dark" style={{ background: '#0F2A1D', color: '#FFFFFF' }}>
            <div className="noise-overlay" />

            <div className="max-w-2xl mx-auto px-6 py-16 relative z-10">
                {/* Success Animation */}
                <div className="text-center mb-10">
                    <div
                        className="w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6 animate-fade-in-up"
                        style={{ background: 'rgba(88,176,120,0.15)' }}
                    >
                        <CheckCircle className="w-12 h-12" style={{ color: '#58B078' }} />
                    </div>
                    <h1 className="text-3xl font-bold mb-3 animate-fade-in-up-delay-1">Reservation Confirmed! 🎉</h1>
                    <p className="text-sm animate-fade-in-up-delay-2" style={{ color: '#A0B8A8' }}>
                        Your inspection slot has been reserved successfully. A confirmation document is being prepared.
                    </p>
                </div>

                {/* Booking Details Card */}
                <div
                    className="rounded-2xl overflow-hidden mb-6"
                    style={{ background: '#1A3C2A', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                    {/* Amount header */}
                    <div className="text-center p-6" style={{ background: 'rgba(212,168,83,0.08)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#6B8B73' }}>Reservation Fee Paid</p>
                        <p className="text-4xl font-bold" style={{ color: '#D4A853' }}>$50.00</p>
                        <p className="text-xs mt-1" style={{ color: '#58B078' }}>🛡️ Fully refundable within 48 hours after inspection</p>
                    </div>

                    <div className="p-6 space-y-4">
                        {/* Property */}
                        <div className="flex items-start gap-3">
                            <Building2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#D4A853' }} />
                            <div>
                                <p className="text-xs" style={{ color: '#6B8B73' }}>Property</p>
                                <p className="font-bold">{prop?.address || 'N/A'}</p>
                                <p className="text-sm" style={{ color: '#A0B8A8' }}>
                                    {prop?.city}, {prop?.state} {prop?.postal_code}
                                </p>
                            </div>
                        </div>

                        {/* Visit Date */}
                        <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#D4A853' }} />
                            <div>
                                <p className="text-xs" style={{ color: '#6B8B73' }}>Scheduled Visit</p>
                                <p className="font-bold">
                                    {new Date(booking.visit_date).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Booking ID */}
                        <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#D4A853' }} />
                            <div>
                                <p className="text-xs" style={{ color: '#6B8B73' }}>Booking Reference</p>
                                <p className="font-bold font-mono">{booking.id.slice(0, 8).toUpperCase()}</p>
                            </div>
                        </div>

                        {/* Landlord */}
                        {landlord && (
                            <div className="flex items-start gap-3">
                                <User className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#D4A853' }} />
                                <div>
                                    <p className="text-xs" style={{ color: '#6B8B73' }}>Contact</p>
                                    <p className="font-bold">{landlord.full_name}</p>
                                    {landlord.email && (
                                        <p className="text-sm flex items-center gap-1" style={{ color: '#A0B8A8' }}>
                                            <Mail className="w-3 h-3" /> {landlord.email}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Download PDF Button */}
                <button
                    onClick={() => generateAndDownloadPDF(booking)}
                    disabled={downloading}
                    className="w-full btn-gold py-4 rounded-xl text-sm font-bold cursor-pointer flex items-center justify-center gap-2 mb-4 disabled:opacity-50"
                >
                    {downloading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Preparing Document...
                        </>
                    ) : (
                        <>
                            <Download className="w-4 h-4" />
                            Download Booking Confirmation
                        </>
                    )}
                </button>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <Link href="/dashboard" className="flex-1">
                        <button className="w-full py-3.5 rounded-xl text-sm font-bold cursor-pointer flex items-center justify-center gap-2"
                            style={{ border: '1.5px solid rgba(212,168,83,0.5)', color: '#D4A853' }}
                        >
                            <Home className="w-4 h-4" />
                            Dashboard
                        </button>
                    </Link>
                    <Link href="/properties" className="flex-1">
                        <button className="w-full py-3.5 rounded-xl text-sm font-bold cursor-pointer flex items-center justify-center gap-2"
                            style={{ border: '1.5px solid rgba(255,255,255,0.15)', color: '#A0B8A8' }}
                        >
                            <Building2 className="w-4 h-4" />
                            Browse More
                        </button>
                    </Link>
                </div>

                {/* Refund reminder */}
                <div
                    className="mt-6 p-4 rounded-xl text-center"
                    style={{ background: 'rgba(88,176,120,0.06)', border: '1px solid rgba(88,176,120,0.12)' }}
                >
                    <p className="text-xs" style={{ color: '#58B078' }}>
                        <Shield className="w-3.5 h-3.5 inline mr-1" />
                        <strong>Refund Policy:</strong> Your $50 fee is fully refundable within 48 hours after your scheduled inspection if you choose not to proceed.
                    </p>
                </div>
            </div>
        </div>
    );
}
