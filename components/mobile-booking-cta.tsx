'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CreditCard, X, Shield, CheckCircle } from 'lucide-react';

interface MobileBookingCTAProps {
    propertyId: string;
    isLoggedIn: boolean;
}

export default function MobileBookingCTA({ propertyId, isLoggedIn }: MobileBookingCTAProps) {
    const [visible, setVisible] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Show the CTA after a short delay on mobile
        const timer = setTimeout(() => {
            if (window.innerWidth < 1024) {
                setVisible(true);
            }
        }, 2000);

        // Also show when user scrolls past the hero
        function handleScroll() {
            if (window.innerWidth < 1024 && window.scrollY > 400 && !dismissed) {
                setVisible(true);
            }
        }

        window.addEventListener('scroll', handleScroll);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [dismissed]);

    if (dismissed || !visible) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="lg:hidden fixed inset-0 z-[60] transition-opacity duration-300"
                style={{ background: 'rgba(0,0,0,0.5)' }}
                onClick={() => setDismissed(true)}
            />

            {/* Bottom Sheet Modal */}
            <div
                className="lg:hidden fixed bottom-0 left-0 right-0 z-[70] rounded-t-3xl p-6 space-y-4 animate-slide-up"
                style={{
                    background: '#1A3C2A',
                    borderTop: '2px solid rgba(212,168,83,0.3)',
                    boxShadow: '0 -10px 40px rgba(0,0,0,0.4)',
                }}
            >
                {/* Close button */}
                <button
                    onClick={() => setDismissed(true)}
                    className="absolute top-4 right-4 p-1 rounded-full cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.1)' }}
                >
                    <X className="w-4 h-4" style={{ color: '#A0B8A8' }} />
                </button>

                {/* Handle bar */}
                <div className="w-10 h-1 rounded-full mx-auto -mt-1 mb-2" style={{ background: 'rgba(255,255,255,0.15)' }} />

                {/* Price */}
                <div className="text-center">
                    <p className="text-xs uppercase tracking-wider" style={{ color: '#6B8B73' }}>
                        Refundable Reservation Fee
                    </p>
                    <p className="text-3xl font-bold mt-1" style={{ color: '#D4A853' }}>
                        $50
                    </p>
                </div>

                {/* Quick benefits */}
                <div className="flex justify-center gap-4">
                    {[
                        'Private tour',
                        '100% refundable',
                        'Instant booking',
                    ].map((b, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                            <CheckCircle className="w-3 h-3" style={{ color: '#58B078' }} />
                            <span className="text-[11px]" style={{ color: '#A0B8A8' }}>{b}</span>
                        </div>
                    ))}
                </div>

                {/* CTA Button */}
                {isLoggedIn ? (
                    <Link href={`/properties/${propertyId}/book`} className="block">
                        <button className="w-full btn-gold py-4 rounded-xl text-sm font-bold cursor-pointer flex items-center justify-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Reserve Inspection — $50
                        </button>
                    </Link>
                ) : (
                    <Link href="/auth/login" className="block">
                        <button className="w-full btn-gold py-4 rounded-xl text-sm font-bold cursor-pointer flex items-center justify-center gap-2">
                            Sign In to Book Inspection
                        </button>
                    </Link>
                )}

                {/* Refund note */}
                <p className="text-center text-[11px]" style={{ color: '#58B078' }}>
                    <Shield className="w-3 h-3 inline mr-1" />
                    Fully refundable within 48h after inspection
                </p>
            </div>

            <style jsx>{`
                @keyframes slideUp {
                    from {
                        transform: translateY(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                .animate-slide-up {
                    animation: slideUp 0.4s cubic-bezier(0.32, 0.72, 0, 1) forwards;
                }
            `}</style>
        </>
    );
}
