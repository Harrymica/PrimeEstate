import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { parseImageUrls } from '@/lib/parse-images';
import LandingNav from '@/components/landing-nav';
import MobileBookingCTA from '@/components/mobile-booking-cta';
import {
    MapPin,
    Building2,
    ArrowLeft,
    Home,
    Shield,
    Clock,
    Calendar,
    CheckCircle,
    CreditCard,
    Phone,
    Mail,
} from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: property } = await supabase
        .from('properties')
        .select('address, city, state')
        .eq('id', id)
        .single();

    return {
        title: property ? `${property.address} | PrimeEstate` : 'Property Details | PrimeEstate',
        description: property
            ? `View details and book an inspection for ${property.address}, ${property.city}, ${property.state}`
            : 'View property details on PrimeEstate',
    };
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    let user = null;
    try {
        user = await getCurrentUser();
    } catch { }

    const supabase = await createClient();
    const { data: property, error } = await supabase
        .from('properties')
        .select('*, users(full_name, email, phone)')
        .eq('id', id)
        .single();

    if (error || !property) {
        notFound();
    }

    // Parse image URLs (DB stores them as a JSON string, not a native array)
    const images = parseImageUrls(property.image_url);

    return (
        <div className="min-h-screen landing-dark" style={{ background: '#0F2A1D', color: '#FFFFFF' }}>
            <div className="noise-overlay" />
            <LandingNav isLoggedIn={!!user} />

            {/* Back Link */}
            <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-4 relative z-10">
                <Link
                    href="/properties"
                    className="inline-flex items-center gap-2 text-sm font-medium transition-colors duration-200"
                    style={{ color: '#A0B8A8' }}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Properties
                </Link>
            </div>

            {/* Image Gallery */}
            <section className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                {images.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-2xl overflow-hidden">
                        {/* Main image */}
                        <div className="relative h-72 md:h-[440px]">
                            <Image
                                src={images[0]}
                                alt={property.address}
                                fill
                                className="object-cover"
                            />
                        </div>

                        {/* Side images */}
                        <div className="grid grid-cols-2 gap-3">
                            {images.slice(1, 5).map((url: string, i: number) => (
                                <div key={i} className="relative h-[130px] md:h-[214px]">
                                    <Image
                                        src={url}
                                        alt={`${property.address} - Photo ${i + 2}`}
                                        fill
                                        className="object-cover"
                                    />
                                    {/* "More photos" overlay on last visible image */}
                                    {i === 3 && images.length > 5 && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <span className="text-white font-bold text-lg">+{images.length - 5} more</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {/* Fill empty grid slots */}
                            {images.length < 5 &&
                                Array.from({ length: Math.min(4, 5 - images.length) }).map((_, i) => (
                                    <div
                                        key={`empty-${i}`}
                                        className="h-[130px] md:h-[214px] flex items-center justify-center rounded-sm"
                                        style={{ background: '#1A3C2A' }}
                                    >
                                        <Home className="w-8 h-8" style={{ color: 'rgba(212,168,83,0.2)' }} />
                                    </div>
                                ))}
                        </div>
                    </div>
                ) : (
                    <div
                        className="h-72 md:h-96 rounded-2xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #1A3C2A, #2A5A3A)' }}
                    >
                        <Home className="w-20 h-20" style={{ color: 'rgba(212,168,83,0.2)' }} />
                    </div>
                )}
            </section>

            {/* Content */}
            <section className="max-w-7xl mx-auto px-6 lg:px-8 py-10 relative z-10">
                <div className="grid lg:grid-cols-3 gap-10">
                    {/* Left: Property Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Title & Location */}
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span
                                    className="px-3 py-1 rounded-lg text-xs font-bold"
                                    style={{
                                        background: property.is_available
                                            ? 'linear-gradient(135deg, #D4A853, #E0BC6A)'
                                            : 'rgba(255,255,255,0.1)',
                                        color: property.is_available ? '#0F2A1D' : '#A0B8A8',
                                    }}
                                >
                                    {property.is_available ? 'Available' : 'Unavailable'}
                                </span>
                                <span className="text-xs" style={{ color: '#6B8B73' }}>
                                    Listed {new Date(property.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-bold mb-3">{property.address}</h1>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5" style={{ color: '#D4A853' }} />
                                <span className="text-lg" style={{ color: '#A0B8A8' }}>
                                    {property.city}, {property.state} {property.postal_code}
                                </span>
                            </div>
                        </div>

                        {/* Key Details */}
                        <div
                            className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-6 rounded-2xl"
                            style={{ background: '#1A3C2A', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                            <div className="text-center">
                                <Building2 className="w-6 h-6 mx-auto mb-2" style={{ color: '#D4A853' }} />
                                <p className="text-2xl font-bold">{property.units || 1}</p>
                                <p className="text-xs" style={{ color: '#6B8B73' }}>
                                    Unit{(property.units || 1) > 1 ? 's' : ''}
                                </p>
                            </div>
                            <div className="text-center">
                                <CreditCard className="w-6 h-6 mx-auto mb-2" style={{ color: '#D4A853' }} />
                                <p className="text-2xl font-bold">$50</p>
                                <p className="text-xs" style={{ color: '#6B8B73' }}>Inspection Fee</p>
                            </div>
                            <div className="text-center">
                                <Calendar className="w-6 h-6 mx-auto mb-2" style={{ color: '#D4A853' }} />
                                <p className="text-2xl font-bold">Flexible</p>
                                <p className="text-xs" style={{ color: '#6B8B73' }}>Scheduling</p>
                            </div>
                        </div>

                        {/* Description */}
                        {property.description && (
                            <div>
                                <h2 className="text-xl font-bold mb-4">About This Property</h2>
                                <p className="text-base leading-relaxed" style={{ color: '#A0B8A8' }}>
                                    {property.description}
                                </p>
                            </div>
                        )}

                        {/* Amenities */}
                        {property.amenities && property.amenities.length > 0 && (
                            <div>
                                <h2 className="text-xl font-bold mb-4">Amenities & Features</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {property.amenities.map((amenity: string, i: number) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-3 p-3 rounded-xl"
                                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                                        >
                                            <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#D4A853' }} />
                                            <span className="text-sm">{amenity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* What to Expect */}
                        <div>
                            <h2 className="text-xl font-bold mb-4">Inspection Process</h2>
                            <div className="grid sm:grid-cols-3 gap-4">
                                {[
                                    { icon: CreditCard, title: 'Reserve Your Slot', desc: 'Pay a $50 refundable reservation fee to confirm your serious interest and secure a private viewing' },
                                    { icon: Calendar, title: 'Schedule Visit', desc: 'Choose a date and time that works for you. Your slot is guaranteed and exclusive' },
                                    { icon: Shield, title: 'Verified Tour', desc: 'Get a private guided tour with the landlord. Full refund available within 48 hours if you decide not to proceed' },
                                ].map((step, i) => (
                                    <div
                                        key={i}
                                        className="p-5 rounded-xl text-center"
                                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                                    >
                                        <step.icon className="w-8 h-8 mx-auto mb-3" style={{ color: '#D4A853' }} />
                                        <h3 className="font-bold text-sm mb-1">{step.title}</h3>
                                        <p className="text-xs" style={{ color: '#6B8B73' }}>{step.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Why the Fee */}
                        <div
                            className="p-5 rounded-2xl"
                            style={{ background: 'rgba(212,168,83,0.06)', border: '1px solid rgba(212,168,83,0.15)' }}
                        >
                            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                                <Shield className="w-4 h-4" style={{ color: '#D4A853' }} />
                                Why a Reservation Fee?
                            </h3>
                            <ul className="space-y-2">
                                {[
                                    'Confirms serious interest — ensures only genuine applicants book viewings',
                                    'Prevents time-wasting — protects landlords from no-show bookings',
                                    'Reserves a private slot — guarantees your exclusive inspection time',
                                    'Fully refundable — get a full refund within 48 hours after viewing if you decide not to proceed',
                                ].map((reason, i) => (
                                    <li key={i} className="flex items-start gap-2.5 text-xs" style={{ color: '#A0B8A8' }}>
                                        <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#58B078' }} />
                                        {reason}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right: Booking Sidebar */}
                    <div className="lg:col-span-1">
                        <div
                            className="sticky top-28 rounded-2xl p-6 space-y-6"
                            style={{ background: '#1A3C2A', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                            {/* Price */}
                            <div className="text-center pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#6B8B73' }}>
                                    Refundable Reservation Fee
                                </p>
                                <p className="text-4xl font-bold" style={{ color: '#D4A853' }}>$50</p>
                                <p className="text-xs mt-1" style={{ color: '#A0B8A8' }}>Fully refundable within 48 hours after viewing</p>
                            </div>

                            {/* What's included */}
                            <div className="space-y-3">
                                {[
                                    'Confirms your serious interest',
                                    'Private, exclusive inspection slot',
                                    'Professional guided property tour',
                                    'Fully refundable if you choose not to proceed',
                                    'No hidden fees — what you see is what you pay',
                                ].map((feat, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#58B078' }} />
                                        <span className="text-sm" style={{ color: '#A0B8A8' }}>{feat}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Refund notice */}
                            <div
                                className="p-3 rounded-xl text-center"
                                style={{ background: 'rgba(88,176,120,0.08)', border: '1px solid rgba(88,176,120,0.15)' }}
                            >
                                <p className="text-xs font-medium" style={{ color: '#58B078' }}>
                                    🛡️ 100% Refundable — Request a refund within 48 hours after your inspection if you decide not to proceed.
                                </p>
                            </div>

                            {/* Book Button */}
                            {user ? (
                                <Link href={`/properties/${id}/book`} className="block">
                                    <button className="w-full btn-gold py-4 rounded-xl text-sm font-bold cursor-pointer flex items-center justify-center gap-2">
                                        <CreditCard className="w-4 h-4" />
                                        Reserve Inspection — $50
                                    </button>
                                </Link>
                            ) : (
                                <Link href="/auth/login" className="block">
                                    <button className="w-full btn-gold py-4 rounded-xl text-sm font-bold cursor-pointer flex items-center justify-center gap-2">
                                        Sign In to Book
                                    </button>
                                </Link>
                            )}

                            <p className="text-center text-xs" style={{ color: '#6B8B73' }}>
                                <Shield className="w-3 h-3 inline mr-1" />
                                Secure payment powered by Stripe
                            </p>

                            {/* Landlord Info */}
                            {property.users && (
                                <div className="pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                    <p className="text-xs uppercase tracking-wider mb-3" style={{ color: '#6B8B73' }}>
                                        Listed by
                                    </p>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                                            style={{ background: 'rgba(212,168,83,0.2)', color: '#D4A853' }}
                                        >
                                            {property.users.full_name?.charAt(0)?.toUpperCase() || 'L'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{property.users.full_name || 'Landlord'}</p>
                                            <p className="text-xs" style={{ color: '#6B8B73' }}>Property Owner</p>
                                        </div>
                                    </div>
                                    {property.users.email && (
                                        <div className="flex items-center gap-2 text-xs" style={{ color: '#A0B8A8' }}>
                                            <Mail className="w-3 h-3" />
                                            {property.users.email}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ background: '#091A12', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <Link href="/" className="flex items-center gap-2">
                            <Building2 className="w-5 h-5" style={{ color: '#D4A853' }} />
                            <span className="font-bold text-white">
                                Prime<span style={{ color: '#D4A853' }}>Estate</span>
                            </span>
                        </Link>
                        <p className="text-sm" style={{ color: '#6B8B73' }}>
                            © 2026 PrimeEstate. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>

            {/* Mobile booking popup */}
            <MobileBookingCTA propertyId={id} isLoggedIn={!!user} />
        </div>
    );
}
