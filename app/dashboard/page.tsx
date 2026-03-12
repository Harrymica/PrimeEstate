import { getCurrentUserProfile } from '@/lib/auth-helpers';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Home, Calendar, FileText, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { parseImageUrls } from '@/lib/parse-images';
import { redirect } from 'next/navigation';

export default async function TenantDashboard() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect('/auth/login');
  }

  // Redirect landlords and admins to their respective dashboards
  if (profile.role === 'landlord') {
    redirect('/dashboard/landlord');
  }
  if (profile.role === 'admin') {
    redirect('/dashboard/admin');
  }
  const supabase = await createClient();

  // Fetch available properties
  const { data: properties } = await supabase
    .from('properties')
    .select('*, users(full_name)')
    .eq('is_available', true)
    .order('created_at', { ascending: false })
    .limit(6);

  // Fetch user's bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('tenant_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Welcome, {profile.full_name || 'Tenant'}!
        </h1>
        <p className="text-sm md:text-base text-slate-600 mt-1 md:mt-2">Browse available properties and schedule inspections</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              My Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{bookings?.length || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Home className="h-4 w-4" />
              Available Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{properties?.length || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">0</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      {bookings && bookings.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Your inspection appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookings.map((booking: any) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      Booking #{booking.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-slate-600">
                      {new Date(booking.visit_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${booking.status === 'confirmed'
                      ? 'bg-green-100 text-green-700'
                      : booking.status === 'completed'
                        ? 'bg-blue-100 text-blue-700'
                        : booking.status === 'cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                  >
                    {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Properties */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Available Properties</h2>
            <p className="text-slate-600 text-sm mt-1">Browse and request inspections</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties && properties.length > 0 ? (
            properties.map((property: any) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition">
                {/* Property image */}
                {(() => {
                  const imgs = parseImageUrls(property.image_url);
                  return imgs.length > 0 ? (
                    <div className="aspect-video relative overflow-hidden">
                      <Image
                        src={imgs[0]}
                        alt={property.address}
                        fill
                        className="object-cover"
                      />
                      <span className="absolute top-3 right-3 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">
                        Available
                      </span>
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 relative flex items-center justify-center">
                      <Home className="h-12 w-12 text-blue-400" />
                      <span className="absolute top-3 right-3 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">
                        Available
                      </span>
                    </div>
                  );
                })()}
                <CardContent className="pt-5">
                  <h3 className="font-bold text-lg text-slate-900 mb-1">{property.address}</h3>
                  <p className="text-sm text-slate-600 mb-3 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {property.city}, {property.state} {property.postal_code}
                  </p>

                  {property.description && (
                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">{property.description}</p>
                  )}

                  <div className="flex items-center gap-3 mb-4 text-sm text-slate-600">
                    <span>{property.units || 1} unit{(property.units || 1) > 1 ? 's' : ''}</span>
                    {property.users?.full_name && (
                      <>
                        <span>·</span>
                        <span>by {property.users.full_name}</span>
                      </>
                    )}
                  </div>

                  {property.amenities && property.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {property.amenities.slice(0, 3).map((amenity: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-full"
                        >
                          {amenity}
                        </span>
                      ))}
                      {property.amenities.length > 3 && (
                        <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full">
                          +{property.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100">
                    <Link href={`/properties/${property.id}`}>
                      <Button size="sm" className="w-full">
                        <Search className="h-4 w-4 mr-2" />
                        View & Book Inspection
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Home className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 mb-2">No properties available at the moment</p>
              <p className="text-sm text-slate-500">Check back later for new listings</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
