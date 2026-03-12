import Link from 'next/link';
import Image from 'next/image';
import { getCurrentUser } from '@/lib/auth-helpers';
import LandingNav from '@/components/landing-nav';
import {
  MapPin,
  Home,
  Search,
  ChevronDown,
  BedDouble,
  Bath,
  Maximize,
  Star,
  ArrowRight,
  Shield,
  Clock,
  Headphones,
  TrendingUp,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Quote,
  Building,
  Users,
  Award,
  Heart,
} from 'lucide-react';

export default async function HomePage() {
  // Check if user is logged in (but DON'T redirect — landing page should always be accessible)
  let user = null;
  try {
    user = await getCurrentUser();
  } catch {
    // Not logged in — that's fine
  }

  const properties = [
    {
      image: '/images/property-1.png',
      title: 'Skyline Penthouse',
      location: 'Manhattan, New York',
      price: '$3,200,000',
      beds: 4,
      baths: 3,
      sqft: '3,500',
      tag: 'Featured',
    },
    {
      image: '/images/property-2.png',
      title: 'Coastal Haven',
      location: 'Malibu, California',
      price: '$1,850,000',
      beds: 3,
      baths: 2,
      sqft: '2,800',
      tag: 'New',
    },
    {
      image: '/images/property-3.png',
      title: 'Ocean View Estate',
      location: 'Miami Beach, Florida',
      price: '$4,500,000',
      beds: 5,
      baths: 4,
      sqft: '5,200',
      tag: 'Premium',
    },
  ];

  const features = [
    { icon: Shield, title: 'Trusted & Verified', desc: 'All listings are verified by our expert team' },
    { icon: Clock, title: 'Quick Process', desc: 'Streamlined booking and inspection flow' },
    { icon: Headphones, title: '24/7 Support', desc: 'Round-the-clock customer assistance' },
    { icon: TrendingUp, title: 'Best Value', desc: 'Competitive pricing & market insights' },
  ];

  const stats = [
    { icon: Building, number: '500+', label: 'Properties Listed', color: '#D4A853' },
    { icon: Users, number: '200+', label: 'Happy Clients', color: '#58B078' },
    { icon: Award, number: '50+', label: 'Awards Won', color: '#5894B0' },
    { icon: Star, number: '4.9', label: 'Average Rating', color: '#D4A853' },
  ];

  const steps = [
    { step: '01', title: 'Create Account', desc: 'Register and set up your profile with your preferences', icon: Users },
    { step: '02', title: 'Browse Properties', desc: 'Explore our curated selection of premium listings', icon: Search },
    { step: '03', title: 'Schedule Visit', desc: 'Book an inspection at your preferred date and time', icon: Clock },
    { step: '04', title: 'Close The Deal', desc: 'Complete paperwork and move into your dream home', icon: Award },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Homeowner',
      text: 'PrimeEstate made finding our dream home incredibly easy. The team was professional, responsive, and truly cared about finding the right fit for our family.',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Property Investor',
      text: 'As an investor, I need reliable market data and quick processes. PrimeEstate delivers on both fronts. Their platform is intuitive and their support is outstanding.',
      rating: 5,
    },
    {
      name: 'Emily Williams',
      role: 'First-time Buyer',
      text: "I was nervous about buying my first property, but the PrimeEstate team walked me through every step. I couldn't be happier with my new apartment!",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen landing-dark" style={{ background: '#0F2A1D', color: '#FFFFFF' }}>
      {/* Noise overlay for texture */}
      <div className="noise-overlay" />

      {/* Navigation */}
      <LandingNav isLoggedIn={!!user} />

      {/* =========================================
          HERO SECTION
          ========================================= */}
      <section className="hero-gradient relative overflow-hidden pt-20">
        {/* Decorative circles */}
        <div className="deco-circle" style={{ width: 600, height: 600, top: -200, right: -200 }} />
        <div className="deco-circle" style={{ width: 400, height: 400, bottom: -100, left: -100 }} />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left - Text Content */}
            <div className="space-y-8 animate-fade-in-up">
              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm"
                style={{
                  background: 'rgba(212,168,83,0.12)',
                  border: '1px solid rgba(212,168,83,0.25)',
                  color: '#D4A853',
                }}
              >
                <Star className="w-4 h-4" fill="#D4A853" />
                <span className="font-medium">#1 Real Estate Platform</span>
              </div>

              {/* Heading */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.1] tracking-tight">
                  Find Your
                  <br />
                  <span className="relative inline-block">
                    Dream
                    <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                      <path d="M2 8C50 2 100 2 150 6C200 10 250 4 298 8" stroke="#D4A853" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  </span>{' '}
                  <span style={{ color: '#D4A853' }}>Property</span>
                </h1>
                <p className="text-lg lg:text-xl max-w-lg leading-relaxed" style={{ color: '#A0B8A8' }}>
                  Discover exceptional properties in prime locations. From luxury villas to modern apartments — we make finding your perfect home effortless.
                </p>
              </div>

              {/* Search Bar */}
              <div className="search-glass rounded-2xl p-2 animate-fade-in-up-delay-1">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div
                    className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    <MapPin className="w-5 h-5 flex-shrink-0" style={{ color: '#D4A853' }} />
                    <input
                      type="text"
                      placeholder="Search location..."
                      className="bg-transparent border-none outline-none text-sm w-full placeholder-[#6B8B73] text-white"
                    />
                  </div>
                  <div
                    className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    <Home className="w-5 h-5 flex-shrink-0" style={{ color: '#D4A853' }} />
                    <span className="text-sm" style={{ color: '#6B8B73' }}>Property Type</span>
                    <ChevronDown className="w-4 h-4 ml-auto" style={{ color: '#6B8B73' }} />
                  </div>
                  <button className="btn-gold px-8 py-3 rounded-xl flex items-center justify-center gap-2 text-sm cursor-pointer">
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 lg:gap-10 pt-4 animate-fade-in-up-delay-2">
                <div className="stat-item pr-6 lg:pr-10">
                  <p className="text-3xl lg:text-4xl font-bold" style={{ color: '#D4A853' }}>500+</p>
                  <p className="text-sm mt-1" style={{ color: '#6B8B73' }}>Premium Properties</p>
                </div>
                <div className="stat-item pr-6 lg:pr-10">
                  <p className="text-3xl lg:text-4xl font-bold" style={{ color: '#D4A853' }}>200+</p>
                  <p className="text-sm mt-1" style={{ color: '#6B8B73' }}>Happy Clients</p>
                </div>
                <div className="stat-item">
                  <p className="text-3xl lg:text-4xl font-bold" style={{ color: '#D4A853' }}>15+</p>
                  <p className="text-sm mt-1" style={{ color: '#6B8B73' }}>Years Experience</p>
                </div>
              </div>
            </div>

            {/* Right - Hero Image */}
            <div className="relative animate-slide-in-right">
              <div
                className="relative rounded-3xl overflow-hidden animate-float"
                style={{ boxShadow: '0 25px 80px rgba(0,0,0,0.4)' }}
              >
                <Image
                  src="/images/hero-property.png"
                  alt="Luxury modern villa with pool"
                  width={700}
                  height={500}
                  className="w-full h-[400px] lg:h-[520px] object-cover"
                  priority
                />
                {/* Overlay gradient */}
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(180deg, transparent 50%, rgba(15,42,29,0.8) 100%)' }}
                />

                {/* Floating info card */}
                <div
                  className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl"
                  style={{
                    background: 'rgba(15,42,29,0.85)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-lg">Modern Luxury Villa</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5" style={{ color: '#D4A853' }} />
                        <span className="text-sm" style={{ color: '#A0B8A8' }}>Beverly Hills, CA</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold" style={{ color: '#D4A853' }}>$2.5M</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="w-3 h-3" fill="#D4A853" style={{ color: '#D4A853' }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge top right */}
              <div
                className="absolute -top-4 -right-4 lg:right-4 animate-glow px-5 py-3 rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, #D4A853, #E0BC6A)',
                  color: '#0F2A1D',
                }}
              >
                <p className="text-sm font-bold">Best Deal</p>
                <p className="text-xs font-medium opacity-80">This Week</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom gradient line */}
        <div className="gradient-line" />
      </section>

      {/* =========================================
          FEATURED PROPERTIES
          ========================================= */}
      <section id="properties" className="relative py-20 lg:py-28" style={{ background: '#0D2418' }}>
        <div
          className="deco-circle"
          style={{ width: 500, height: 500, top: -200, left: '50%', transform: 'translateX(-50%)' }}
        />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
            <div className="space-y-4">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase"
                style={{
                  background: 'rgba(212,168,83,0.12)',
                  color: '#D4A853',
                  border: '1px solid rgba(212,168,83,0.2)',
                }}
              >
                Featured Listings
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                Explore Our Premium
                <br />
                <span style={{ color: '#D4A853' }}>Properties</span>
              </h2>
              <p className="text-lg max-w-lg" style={{ color: '#6B8B73' }}>
                Handpicked properties that meet our highest standards of quality, location, and value.
              </p>
            </div>
            <Link
              href="/properties"
              className="group flex items-center gap-2 text-sm font-semibold transition-all duration-300"
              style={{ color: '#D4A853' }}
            >
              View All Properties
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Property Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {properties.map((property, i) => (
              <div
                key={i}
                className="property-card rounded-2xl overflow-hidden cursor-pointer"
                style={{ background: '#1A3C2A', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                {/* Image */}
                <div className="relative overflow-hidden h-64">
                  <Image
                    src={property.image}
                    alt={property.title}
                    width={600}
                    height={400}
                    className="property-image w-full h-full object-cover"
                  />
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
                    {property.tag}
                  </div>

                  {/* Heart */}
                  <div
                    className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}
                  >
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold">{property.title}</h3>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <MapPin className="w-3.5 h-3.5" style={{ color: '#D4A853' }} />
                      <span className="text-sm" style={{ color: '#6B8B73' }}>{property.location}</span>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div
                    className="flex items-center gap-4 py-3"
                    style={{
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <BedDouble className="w-4 h-4" style={{ color: '#D4A853' }} />
                      <span className="text-sm" style={{ color: '#A0B8A8' }}>{property.beds} Beds</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Bath className="w-4 h-4" style={{ color: '#D4A853' }} />
                      <span className="text-sm" style={{ color: '#A0B8A8' }}>{property.baths} Baths</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Maximize className="w-4 h-4" style={{ color: '#D4A853' }} />
                      <span className="text-sm" style={{ color: '#A0B8A8' }}>{property.sqft} ft²</span>
                    </div>
                  </div>

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-bold" style={{ color: '#D4A853' }}>{property.price}</p>
                    <span
                      className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-300"
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
            ))}
          </div>
        </div>
      </section>

      <div className="gradient-line" />

      {/* =========================================
          WHY CHOOSE US / FEATURES
          ========================================= */}
      <section id="features" className="relative py-20 lg:py-28" style={{ background: '#0F2A1D' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase"
                  style={{
                    background: 'rgba(212,168,83,0.12)',
                    color: '#D4A853',
                    border: '1px solid rgba(212,168,83,0.2)',
                  }}
                >
                  Why Choose Us
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                  We Help You Make
                  <br />
                  The Best <span style={{ color: '#D4A853' }}>Decision</span>
                </h2>
                <p className="text-lg max-w-lg" style={{ color: '#6B8B73' }}>
                  Our dedicated team of experts ensures every step of your property journey is smooth, transparent, and rewarding.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features.map((feat, i) => {
                  const Icon = feat.icon;
                  return (
                    <div key={i} className="feature-card p-6 rounded-2xl group">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300"
                        style={{ background: 'rgba(212,168,83,0.12)' }}
                      >
                        <Icon className="w-6 h-6" style={{ color: '#D4A853' }} />
                      </div>
                      <h4 className="font-bold mb-1.5">{feat.title}</h4>
                      <p className="text-sm" style={{ color: '#6B8B73' }}>{feat.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right - Stats visual */}
            <div className="relative">
              <div
                className="rounded-3xl overflow-hidden p-8"
                style={{
                  background: 'linear-gradient(135deg, #153525, #1A3C2A)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {/* Big stat cards */}
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={i}
                        className="p-6 rounded-2xl text-center transition-all duration-300 hover:scale-105"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        <div
                          className="w-14 h-14 rounded-xl mx-auto flex items-center justify-center mb-3"
                          style={{ background: `${stat.color}15` }}
                        >
                          <Icon className="w-7 h-7" style={{ color: stat.color }} />
                        </div>
                        <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.number}</p>
                        <p className="text-sm mt-1" style={{ color: '#6B8B73' }}>{stat.label}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom bar */}
                <div
                  className="mt-6 p-5 rounded-2xl flex items-center justify-between"
                  style={{
                    background: 'rgba(212,168,83,0.08)',
                    border: '1px solid rgba(212,168,83,0.15)',
                  }}
                >
                  <div>
                    <p className="font-bold text-lg">Ready to start?</p>
                    <p className="text-sm" style={{ color: '#6B8B73' }}>Join our growing community</p>
                  </div>
                  <Link href="/auth/signup">
                    <span className="btn-gold px-6 py-3 rounded-xl text-sm inline-block cursor-pointer">
                      Join Now
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="gradient-line" />

      {/* =========================================
          HOW IT WORKS
          ========================================= */}
      <section className="relative py-20 lg:py-28" style={{ background: '#0D2418' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-4 mb-16">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mx-auto"
              style={{
                background: 'rgba(212,168,83,0.12)',
                color: '#D4A853',
                border: '1px solid rgba(212,168,83,0.2)',
              }}
            >
              Easy Process
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              How It <span style={{ color: '#D4A853' }}>Works</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#6B8B73' }}>
              Finding your dream property is just four simple steps away
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 lg:gap-8">
            {steps.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="relative group">
                  <div className="feature-card p-8 rounded-2xl text-center h-full">
                    {/* Step number */}
                    <div
                      className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        background: 'linear-gradient(135deg, #D4A853, #E0BC6A)',
                        color: '#0F2A1D',
                      }}
                    >
                      {item.step}
                    </div>

                    <div
                      className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-5 mt-2 transition-all duration-300"
                      style={{ background: 'rgba(212,168,83,0.1)' }}
                    >
                      <Icon className="w-8 h-8" style={{ color: '#D4A853' }} />
                    </div>

                    <h4 className="text-lg font-bold mb-2">{item.title}</h4>
                    <p className="text-sm" style={{ color: '#6B8B73' }}>{item.desc}</p>
                  </div>

                  {/* Connector line (hide on last) */}
                  {i < 3 && (
                    <div
                      className="hidden md:block absolute top-1/2 -right-4 lg:-right-4 w-8 lg:w-8"
                      style={{ borderTop: '2px dashed rgba(212,168,83,0.3)' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="gradient-line" />

      {/* =========================================
          TESTIMONIALS
          ========================================= */}
      <section id="testimonials" className="relative py-20 lg:py-28" style={{ background: '#0F2A1D' }}>
        <div className="deco-circle" style={{ width: 400, height: 400, top: 0, right: -100 }} />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-4 mb-14">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mx-auto"
              style={{
                background: 'rgba(212,168,83,0.12)',
                color: '#D4A853',
                border: '1px solid rgba(212,168,83,0.2)',
              }}
            >
              Testimonials
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              What Our Clients <span style={{ color: '#D4A853' }}>Say</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#6B8B73' }}>
              Hear from homeowners who found their perfect property through PrimeEstate
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="testimonial-card p-8 rounded-2xl relative">
                <Quote className="w-10 h-10 mb-4 opacity-20" style={{ color: '#D4A853' }} />
                <p className="text-base leading-relaxed mb-6" style={{ color: '#A0B8A8' }}>
                  &ldquo;{testimonial.text}&rdquo;
                </p>

                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, s) => (
                    <Star key={s} className="w-4 h-4" fill="#D4A853" style={{ color: '#D4A853' }} />
                  ))}
                </div>

                <div
                  className="flex items-center gap-3 pt-4"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #D4A853, #E0BC6A)',
                      color: '#0F2A1D',
                    }}
                  >
                    {testimonial.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{testimonial.name}</p>
                    <p className="text-xs" style={{ color: '#6B8B73' }}>{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="gradient-line" />

      {/* =========================================
          CTA SECTION
          ========================================= */}
      <section className="relative py-20 lg:py-28 overflow-hidden cta-gradient">
        <div className="deco-circle" style={{ width: 500, height: 500, bottom: -250, left: -250 }} />
        <div className="deco-circle" style={{ width: 600, height: 600, top: -300, right: -300 }} />

        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10 space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Ready to Find Your
              <br />
              Perfect <span style={{ color: '#D4A853' }}>Home?</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#A0B8A8' }}>
              Join thousands of happy homeowners who found their dream property through PrimeEstate. Start your journey today.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <span className=" btn-gold px-10 py-4 rounded-xl text-base inline-block cursor-pointer">
                Get Started Now
              </span>
            </Link>
            <Link href="#properties">
              <span className="btn-gold-outline px-10 py-4 rounded-xl text-base inline-block cursor-pointer">
                Browse Properties
              </span>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-8 pt-4">
            <div className="flex items-center gap-2 text-sm" style={{ color: '#6B8B73' }}>
              <Shield className="w-5 h-5" style={{ color: '#D4A853' }} />
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center gap-2 text-sm" style={{ color: '#6B8B73' }}>
              <Award className="w-5 h-5" style={{ color: '#D4A853' }} />
              <span>Award Winning</span>
            </div>
            <div className="flex items-center gap-2 text-sm" style={{ color: '#6B8B73' }}>
              <Headphones className="w-5 h-5" style={{ color: '#D4A853' }} />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </section>

      <div className="gradient-line" />

      {/* =========================================
          FOOTER
          ========================================= */}
      <footer id="contact" className="relative py-16 lg:py-20" style={{ background: '#0A1F14' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
            {/* Brand */}
            <div className="space-y-5 lg:col-span-1">
              <Link href="/" className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #D4A853, #E0BC6A)' }}
                >
                  <Building className="w-5 h-5" style={{ color: '#0F2A1D' }} />
                </div>
                <span className="text-xl font-bold text-white">
                  Prime<span style={{ color: '#D4A853' }}>Estate</span>
                </span>
              </Link>
              <p className="text-sm leading-relaxed" style={{ color: '#6B8B73' }}>
                Your trusted partner in finding premium real estate properties. We connect you with the finest homes and investment opportunities.
              </p>
              <div className="flex items-center gap-3">
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <Icon className="w-4 h-4" style={{ color: '#A0B8A8' }} />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm tracking-wider uppercase" style={{ color: '#D4A853' }}>
                Quick Links
              </h4>
              <ul className="space-y-3">
                {['Home', 'About Us', 'Properties', 'Pricing', 'Contact'].map((link, i) => (
                  <li key={i}>
                    <Link
                      href="#"
                      className="text-sm transition-colors duration-300 hover:text-white"
                      style={{ color: '#6B8B73' }}
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm tracking-wider uppercase" style={{ color: '#D4A853' }}>
                Services
              </h4>
              <ul className="space-y-3">
                {['Property Listings', 'Virtual Tours', 'Property Valuation', 'Legal Assistance', 'Investment Advisory'].map(
                  (link, i) => (
                    <li key={i}>
                      <Link
                        href="#"
                        className="text-sm transition-colors duration-300 hover:text-white"
                        style={{ color: '#6B8B73' }}
                      >
                        {link}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm tracking-wider uppercase" style={{ color: '#D4A853' }}>
                Contact Us
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#D4A853' }} />
                  <span className="text-sm" style={{ color: '#6B8B73' }}>
                    123 Property Lane,
                    <br />
                    Beverly Hills, CA 90210
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 flex-shrink-0" style={{ color: '#D4A853' }} />
                  <span className="text-sm" style={{ color: '#6B8B73' }}>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 flex-shrink-0" style={{ color: '#D4A853' }} />
                  <span className="text-sm" style={{ color: '#6B8B73' }}>info@primeestate.com</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-sm" style={{ color: '#4A6B52' }}>
              &copy; 2024 PrimeEstate. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {['Privacy Policy', 'Terms of Service', 'Cookie Settings'].map((link, i) => (
                <Link
                  key={i}
                  href="#"
                  className="text-sm transition-colors duration-300 hover:text-white"
                  style={{ color: '#4A6B52' }}
                >
                  {link}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
