'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

interface LandingNavProps {
    isLoggedIn?: boolean;
}

export default function LandingNav({ isLoggedIn = false }: LandingNavProps) {
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    async function handleLogout() {
        setLoggingOut(true);
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/');
            router.refresh();
        } catch {
            setLoggingOut(false);
        }
    }

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'shadow-lg' : ''}`}
            style={{
                background: scrolled ? 'rgba(15, 42, 29, 0.95)' : 'rgba(15, 42, 29, 0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #D4A853, #E0BC6A)' }}
                        >
                            <Building className="w-5 h-5" style={{ color: '#0F2A1D' }} />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">
                            Prime<span style={{ color: '#D4A853' }}>Estate</span>
                        </span>
                    </Link>

                    {/* Nav Links - Desktop */}
                    <div className="hidden md:flex items-center gap-8">
                        {[
                            { label: 'Home', href: '/' },
                            { label: 'About', href: '/#features' },
                            { label: 'Properties', href: '/properties' },
                            { label: 'Testimonials', href: '/#testimonials' },
                            { label: 'Contact', href: '/#contact' },
                        ].map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="nav-link text-sm font-medium"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Auth Buttons */}
                    <div className="flex items-center gap-3">
                        {isLoggedIn ? (
                            <>
                                <Link href="/dashboard">
                                    <button className="btn-gold px-5 py-2.5 rounded-xl text-sm cursor-pointer">
                                        Dashboard
                                    </button>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    disabled={loggingOut}
                                    className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all duration-300 disabled:opacity-50"
                                    style={{
                                        border: '1.5px solid rgba(239,68,68,0.4)',
                                        color: '#f87171',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                                        e.currentTarget.style.borderColor = 'rgba(239,68,68,0.6)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)';
                                    }}
                                >
                                    <LogOut className="w-4 h-4" />
                                    {loggingOut ? 'Logging out...' : 'Logout'}
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/auth/login">
                                    <button className="hidden sm:block px-5 py-2.5 rounded-xl text-sm font-medium btn-gold-outline cursor-pointer">
                                        Sign In
                                    </button>
                                </Link>
                                <Link href="/auth/signup">
                                    <button className="btn-gold px-5 py-2.5 rounded-xl text-sm cursor-pointer">
                                        Get Started
                                    </button>
                                </Link>
                            </>
                        )}

                        {/* Mobile hamburger */}
                        <button
                            className="md:hidden flex flex-col gap-1.5 p-2 cursor-pointer"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
                            <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
                            <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div className="md:hidden pb-6 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        {[
                            { label: 'Home', href: '/' },
                            { label: 'About', href: '/#features' },
                            { label: 'Properties', href: '/properties' },
                            { label: 'Testimonials', href: '/#testimonials' },
                            { label: 'Contact', href: '/#contact' },
                        ].map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="block py-2 text-sm font-medium"
                                style={{ color: '#A0B8A8' }}
                                onClick={() => setMobileOpen(false)}
                            >
                                {item.label}
                            </Link>
                        ))}
                        {isLoggedIn ? (
                            <div className="flex flex-col gap-2 pt-2">
                                <Link href="/dashboard" className="block" onClick={() => setMobileOpen(false)}>
                                    <button className="w-full btn-gold px-5 py-2.5 rounded-xl text-sm cursor-pointer">
                                        Go to Dashboard
                                    </button>
                                </Link>
                                <button
                                    onClick={() => {
                                        setMobileOpen(false);
                                        handleLogout();
                                    }}
                                    disabled={loggingOut}
                                    className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer disabled:opacity-50"
                                    style={{
                                        border: '1.5px solid rgba(239,68,68,0.4)',
                                        color: '#f87171',
                                    }}
                                >
                                    <LogOut className="w-4 h-4" />
                                    {loggingOut ? 'Logging out...' : 'Logout'}
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 pt-2">
                                <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                                    <button className="w-full px-5 py-2.5 rounded-xl text-sm font-medium btn-gold-outline cursor-pointer">
                                        Sign In
                                    </button>
                                </Link>
                                <Link href="/auth/signup" onClick={() => setMobileOpen(false)}>
                                    <button className="w-full btn-gold px-5 py-2.5 rounded-xl text-sm cursor-pointer">
                                        Get Started
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
