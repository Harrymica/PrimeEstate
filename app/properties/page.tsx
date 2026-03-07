import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import LandingNav from '@/components/landing-nav';
import { getCurrentUser } from '@/lib/auth-helpers';
import { parseImageUrls } from '@/lib/parse-images';
import {
    MapPin,
    Heart,
    Building2,
    ArrowRight,
    Search,
    SlidersHorizontal,
    Home,
} from 'lucide-react';

export const metadata = {
    title: 'Browse Properties | PrimeEstate',
    description: 'Explore our curated selection of premium rental and sale properties.',
};

export default async function BrowsePropertiesPage() {
    let user = null;
    try {
        user = await getCurrentUser();
    } catch {
        // Not logged in
    }

    const supabase = await createClient();

    const { data: properties } = await supabase
        .from('properties')
        .select('*, users(full_name)')
        .eq('is_available', true)
        .order('created_at', { ascending: false });

    return (
        <div className="min-h-screen landing-dark" style={{ background: '#0F2A1D', color: '#FFFFFF' }}>
            <div className="noise-overlay" />

            <LandingNav isLoggedIn={!!user} />

            {/* Hero Header */}
            <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20">
                <div
                    className="deco-circle"
                    style={{ width: 600, height: 600, top: -300, right: -200 }}
                />
                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                    <div className="text-center space-y-6 max-w-3xl mx-auto">
                        <div
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase animate-fade-in-up"
                            style={{
                                background: 'rgba(212,168,83,0.12)',
                                color: '#D4A853',
                                border: '1px solid rgba(212,168,83,0.2)',
                            }}
                        >
                            <Building2 className="w-3.5 h-3.5" />
                            Browse Listings
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold animate-fade-in-up-delay-1">
                            Find Your Perfect
                            <br />
                            <span style={{ color: '#D4A853' }}>Property</span>
                        </h1>
                        <p className="text-lg animate-fade-in-up-delay-2" style={{ color: '#6B8B73' }}>
                            Explore our curated collection of premium properties available for inspection and rental.
                        </p>
                    </div>

                    {/* Search / Filter Bar */}
                    <div
                        className="mt-10 max-w-2xl mx-auto search-glass rounded-2xl p-4 animate-fade-in-up-delay-3"
                    >
                        <div className="flex items-center gap-3">
                            <Search className="w-5 h-5 flex-shrink-0" style={{ color: '#D4A853' }} />
                            <input
                                type="text"
                                placeholder="Search by city, state, or address..."
                                className="flex-1 bg-transparent text-white placeholder:text-gray-400 focus:outline-none text-sm"
                                disabled
                            />
                            <button className="btn-gold px-5 py-2.5 rounded-xl text-sm cursor-pointer flex items-center gap-2">
                                <SlidersHorizontal className="w-4 h-4" />
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <div className="gradient-line" />

            {/* Properties Grid */}
            <section className="relative py-16 lg:py-20" style={{ background: '#0D2418' }}>
                <div
                    className="deco-circle"
                    style={{ width: 400, height: 400, bottom: -100, left: -150 }}
                />

                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                    {/* Results count */}
                    <div className="flex items-center justify-between mb-10">
                        <p className="text-sm" style={{ color: '#A0B8A8' }}>
                            <span className="font-bold text-white">{properties?.length || 0}</span> properties available
                        </p>
                    </div>

                    {properties && properties.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                            {properties.map((property: any, i: number) => {
                                const imgs = parseImageUrls(property.image_url);
                                return (
                                    <Link
                                        key={property.id}
                                        href={`/properties/${property.id}`}
                                        className="block"
                                    >
                                        <div
                                            className="property-card rounded-2xl overflow-hidden cursor-pointer"
                                            style={{ background: '#1A3C2A', border: '1px solid rgba(255,255,255,0.06)' }}
                                        >
                                            {/* Image */}
                                            <div className="relative overflow-hidden h-64">
                                                {imgs.length > 0 ? (
                                                    <Image
                                                        src={imgs[0]}
                                                        alt={property.address}
                                                        width={600}
                                                        height={400}
                                                        className="property-image w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div
                                                        className="property-image w-full h-full flex items-center justify-center"
                                                        style={{ background: 'linear-gradient(135deg, #1A3C2A, #2A5A3A)' }}
                                                    >
                                                        <Home className="w-16 h-16" style={{ color: 'rgba(212,168,83,0.3)' }} />
                                                    </div>
                                                )}
                                                <div
                                                    className="absolute inset-0"
                                                    style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(15,42,29,0.6) 100%)' }}
                                                />

                                                {/* Tag */}
                                                <div
                                                    className="absolute top-4 left-4 px-3 py-1.5 rounded-lg text-xs font-bold"
                                                    style={{
                                                        background: 'linear-gradient(135deg, #D4A853, #E0BC6A)',
                                                        color: '#0F2A1D',
                                                    }}
                                                >
                                                    Available
                                                </div>

                                                {/* Heart */}
                                                <div
                                                    className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center"
                                                    style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}
                                                >
                                                    <Heart className="w-4 h-4 text-white" />
                                                </div>

                                                {/* Image count badge */}
                                                {imgs.length > 1 && (
                                                    <div
                                                        className="absolute bottom-3 right-3 px-2 py-1 rounded-md text-xs font-medium"
                                                        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
                                                    >
                                                        📷 {imgs.length} photos
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="p-6 space-y-4">
                                                <div>
                                                    <h3 className="text-lg font-bold">{property.address}</h3>
                                                    <div className="flex items-center gap-1.5 mt-1.5">
                                                        <MapPin className="w-3.5 h-3.5" style={{ color: '#D4A853' }} />
                                                        <span className="text-sm" style={{ color: '#6B8B73' }}>
                                                            {property.city}, {property.state} {property.postal_code}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Details */}
                                                <div
                                                    className="flex items-center gap-4 py-3"
                                                    style={{
                                                        borderTop: '1px solid rgba(255,255,255,0.06)',
                                                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                                                    }}
                                                >
                                                    <div className="flex items-center gap-1.5">
                                                        <Building2 className="w-4 h-4" style={{ color: '#D4A853' }} />
                                                        <span className="text-sm" style={{ color: '#A0B8A8' }}>
                                                            {property.units || 1} Unit{(property.units || 1) > 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                    {property.users?.full_name && (
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-sm" style={{ color: '#A0B8A8' }}>
                                                                by {property.users.full_name}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Amenities */}
                                                {property.amenities && property.amenities.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {property.amenities.slice(0, 3).map((a: string, j: number) => (
                                                            <span
                                                                key={j}
                                                                className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                                                                style={{
                                                                    background: 'rgba(212,168,83,0.1)',
                                                                    color: '#D4A853',
                                                                    border: '1px solid rgba(212,168,83,0.15)',
                                                                }}
                                                            >
                                                                {a}
                                                            </span>
                                                        ))}
                                                        {property.amenities.length > 3 && (
                                                            <span className="text-xs" style={{ color: '#6B8B73' }}>
                                                                +{property.amenities.length - 3} more
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Price & CTA */}
                                                <div className="flex items-center justify-between">
                                                    <p className="text-lg font-bold" style={{ color: '#D4A853' }}>
                                                        $50
                                                        <span className="text-xs font-normal ml-1" style={{ color: '#6B8B73' }}>
                                                            refundable
                                                        </span>
                                                    </p>
                                                    <span
                                                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                                                        style={{
                                                            background: 'rgba(212,168,83,0.12)',
                                                            color: '#D4A853',
                                                            border: '1px solid rgba(212,168,83,0.25)',
                                                        }}
                                                    >
                                                        View Details
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <Home className="w-16 h-16 mx-auto mb-4" style={{ color: 'rgba(212,168,83,0.3)' }} />
                            <h3 className="text-xl font-bold mb-2">No Properties Available Yet</h3>
                            <p style={{ color: '#6B8B73' }}>Check back soon — new listings are added regularly.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA */}
            <section className="relative py-16" style={{ background: '#0F2A1D' }}>
                <div className="gradient-line" />
                <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center py-12">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                        Own a Property? <span style={{ color: '#D4A853' }}>List It With Us</span>
                    </h2>
                    <p className="mb-8" style={{ color: '#6B8B73' }}>
                        Join our platform as a landlord and reach thousands of potential tenants.
                    </p>
                    <Link href="/auth/signup">
                        <button className="btn-gold px-8 py-3.5 rounded-xl text-sm cursor-pointer">
                            Get Started as Landlord
                            <ArrowRight className="w-4 h-4 inline ml-2" />
                        </button>
                    </Link>
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
        </div>
    );
}
