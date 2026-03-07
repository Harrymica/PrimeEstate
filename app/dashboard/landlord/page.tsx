import { requireRole } from '@/lib/auth-helpers';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Home, Calendar, Building2, Plus, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { parseImageUrls } from '@/lib/parse-images';

export default async function LandlordDashboard() {
  const profile = await requireRole('landlord');
  const supabase = await createClient();

  // Fetch landlord's properties
  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .eq('landlord_id', profile.id)
    .order('created_at', { ascending: false });

  // Fetch upcoming inspections for landlord's properties
  const propertyIds = properties?.map((p) => p.id) || [];

  const { data: inspections } = await supabase
    .from('inspections')
    .select('*, properties(address, city)')
    .in('property_id', propertyIds.length > 0 ? propertyIds : ['00000000-0000-0000-0000-000000000000'])
    .order('created_at', { ascending: false })
    .limit(5);

  const pendingInspections = inspections?.filter((i: any) => i.status === 'pending') || [];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome, {profile.full_name || 'Landlord'}!
          </h1>
          <p className="text-slate-600 mt-2">Manage your properties and inspection requests</p>
        </div>
        <Link href="/dashboard/landlord/properties/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              My Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{properties?.length || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {properties?.filter((p: any) => p.is_available).length || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Pending Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{pendingInspections.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Home className="h-4 w-4" />
              Total Units
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">
              {properties?.reduce((sum: number, p: any) => sum + (p.units || 1), 0) || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Inspections */}
      {pendingInspections.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Pending Inspection Requests</CardTitle>
            <CardDescription>Requests waiting for your approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingInspections.map((inspection: any) => (
                <div
                  key={inspection.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {inspection.properties?.address || 'Property'}
                    </p>
                    <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                      <MapPin className="h-4 w-4" />
                      {inspection.properties?.city || 'Unknown location'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Requested {new Date(inspection.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href="/dashboard/landlord/inspections">
                      <Button variant="outline" size="sm">
                        Review
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Properties List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">My Properties</h2>
            <p className="text-slate-600 text-sm mt-1">Manage and monitor your rental properties</p>
          </div>
          <Link href="/dashboard/landlord/properties/new">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          </Link>
        </div>

        {properties && properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {properties.map((property: any) => (
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
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <Home className="h-12 w-12 text-blue-400" />
                    </div>
                  );
                })()}
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-slate-900">{property.address}</h3>
                      <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                        <MapPin className="h-4 w-4" />
                        {property.city}, {property.state} {property.postal_code}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${property.is_available
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                        }`}
                    >
                      {property.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>

                  {property.description && (
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">{property.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-slate-500">Units</p>
                      <p className="font-semibold text-slate-900">{property.units || 1}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Listed</p>
                      <p className="font-semibold text-slate-900">
                        {new Date(property.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {property.amenities && property.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {property.amenities.slice(0, 4).map((amenity: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-full"
                        >
                          {amenity}
                        </span>
                      ))}
                      {property.amenities.length > 4 && (
                        <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full">
                          +{property.amenities.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t border-slate-100">
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600">
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Home className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 mb-2">No properties yet</p>
              <p className="text-sm text-slate-500 mb-6">
                Start by adding your first property to receive inspection requests
              </p>
              <Link href="/dashboard/landlord/properties/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Property
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
