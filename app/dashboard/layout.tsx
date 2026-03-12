import { requireAuth } from '@/lib/auth-helpers';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  LogOut,
  Home,
  Building2,
  Calendar,
  FileText,
  DollarSign,
  ClipboardList,
  Users,
  LayoutDashboard,
  Search,
} from 'lucide-react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/auth/login');
  }

  async function handleSignOut() {
    'use server';
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/auth/login');
  }

  // Navigation items with icons — 4 items per role for bottom nav
  const navItems = {
    tenant: [
      { label: 'Home', shortLabel: 'Home', href: '/dashboard', icon: Home },
      { label: 'Properties', shortLabel: 'Browse', href: '/properties', icon: Search },
      { label: 'My Bookings', shortLabel: 'Bookings', href: '/dashboard/bookings', icon: Calendar },
      { label: 'Documents', shortLabel: 'Docs', href: '/dashboard/documents', icon: FileText },
    ],
    landlord: [
      { label: 'Home', shortLabel: 'Home', href: '/dashboard/landlord', icon: Home },
      { label: 'My Properties', shortLabel: 'Properties', href: '/dashboard/landlord', icon: Building2 },
      { label: 'Inspections', shortLabel: 'Inspections', href: '/dashboard/landlord/inspections', icon: ClipboardList },
      { label: 'Payments', shortLabel: 'Payments', href: '/dashboard/landlord/payments', icon: DollarSign },
    ],
    admin: [
      { label: 'Home', shortLabel: 'Home', href: '/dashboard/admin', icon: Home },
      { label: 'All Users', shortLabel: 'Users', href: '/dashboard/admin', icon: Users },
      { label: 'Properties', shortLabel: 'Properties', href: '/dashboard/admin', icon: Building2 },
      { label: 'Dashboard', shortLabel: 'Overview', href: '/dashboard/admin', icon: LayoutDashboard },
    ],
  };

  const items = navItems[profile.role as keyof typeof navItems] || navItems.tenant;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50">
      {/* Desktop Sidebar — hidden on mobile */}
      <aside className="hidden md:flex w-64 border-r border-slate-200 bg-white shadow-sm flex-col flex-shrink-0">
        <div className="border-b border-slate-200 p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Home className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">PrimeEstate</h1>
            <p className="text-xs text-slate-500 capitalize">{profile.role}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-4 space-y-4">
          <div className="p-3 bg-gradient-to-br from-blue-50 to-slate-50 rounded-lg border border-blue-100">
            <p className="text-xs font-medium text-slate-600 mb-1">Logged in as</p>
            <p className="text-sm font-semibold text-slate-900">{profile.full_name || 'User'}</p>
            <p className="text-xs text-slate-500 truncate">{profile.email}</p>
          </div>

          <form action={handleSignOut}>
            <Button variant="outline" size="sm" className="w-full" type="submit">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </form>
        </div>
      </aside>

      {/* Mobile Top Bar — visible only on mobile */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <Home className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-base font-bold text-slate-900">PrimeEstate</h1>
        </div>
        <form action={handleSignOut}>
          <Button variant="ghost" size="sm" type="submit" className="text-slate-500 h-8 w-8 p-0">
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation — visible only on mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href + item.shortLabel}
                href={item.href}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-slate-500 hover:text-blue-600 active:text-blue-700 transition-colors"
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium leading-tight">{item.shortLabel}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
