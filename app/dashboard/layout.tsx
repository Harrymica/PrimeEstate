import { requireAuth } from '@/lib/auth-helpers';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogOut, Home } from 'lucide-react';

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

  // Get the current URL path to detect which sub-route we're on
  const headersList = await headers();
  const currentPath = headersList.get('x-nextjs-data')
    ? ''
    : headersList.get('x-invoke-path') || '';

  // Use referer or x-url header to detect current path
  const referer = headersList.get('referer') || '';
  const url = headersList.get('x-url') || referer;

  // Determine if we're on the correct role-specific page
  const isOnLandlordPage = url.includes('/dashboard/landlord');
  const isOnAdminPage = url.includes('/dashboard/admin');
  const isOnBaseDashboard = url.endsWith('/dashboard') || url.endsWith('/dashboard/');

  // Only redirect from the base /dashboard page to the role-specific page
  if (isOnBaseDashboard) {
    if (profile.role === 'landlord') {
      redirect('/dashboard/landlord');
    }
    if (profile.role === 'admin') {
      redirect('/dashboard/admin');
    }
  }

  async function handleSignOut() {
    'use server';
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/auth/login');
  }

  const navItems = {
    tenant: [
      { label: 'Browse Properties', href: '/dashboard' },
      { label: 'My Bookings', href: '/dashboard/bookings' },
      { label: 'Documents', href: '/dashboard/documents' },
    ],
    landlord: [
      { label: 'My Properties', href: '/dashboard/landlord' },
      { label: 'Inspections', href: '/dashboard/landlord/inspections' },
      { label: 'Payments', href: '/dashboard/landlord/payments' },
    ],
    admin: [
      { label: 'Overview', href: '/dashboard/admin' },
      { label: 'All Users', href: '/dashboard/admin' },
      { label: 'All Properties', href: '/dashboard/admin' },
      { label: 'All Inspections', href: '/dashboard/admin' },
    ],
  };

  const items = navItems[profile.role as keyof typeof navItems] || navItems.tenant;

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col h-full">
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
            {items.map((item) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                className="block px-4 py-2 rounded-lg text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition"
              >
                {item.label}
              </Link>
            ))}
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
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
