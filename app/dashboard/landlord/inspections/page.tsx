import { requireRole } from '@/lib/auth-helpers';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Calendar, User } from 'lucide-react';

export default async function InspectionsPage() {
  const profile = await requireRole('landlord');
  const supabase = await createClient();

  // Fetch landlord's properties
  const { data: properties } = await supabase
    .from('properties')
    .select('id')
    .eq('landlord_id', profile.id);

  // Fetch all inspections for landlord's properties
  const propertyIds = properties?.map(p => p.id) || [];
  const { data: allInspections } = await supabase
    .from('inspections')
    .select('*, properties(address, city)')
    .in('property_id', propertyIds.length > 0 ? propertyIds : ['00000000-0000-0000-0000-000000000000'])
    .order('created_at', { ascending: false });

  const pending = allInspections?.filter((i: any) => i.status === 'pending') || [];
  const scheduled = allInspections?.filter((i: any) => i.status === 'scheduled') || [];
  const completed = allInspections?.filter((i: any) => i.status === 'completed') || [];
  const cancelled = allInspections?.filter((i: any) => i.status === 'cancelled') || [];

  const InspectionCard = ({ inspection, status }: any) => (
    <Card key={inspection.id} className="mb-3 md:mb-4">
      <CardContent className="pt-4 md:pt-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-start justify-between sm:block">
              <h3 className="text-base md:text-lg font-bold text-slate-900 mb-2 md:mb-3">
                {inspection.properties?.address || 'Property'}
              </h3>
              {/* Status badge — shown inline on mobile, separate column on desktop */}
              <span className={`sm:hidden inline-block px-3 py-1 rounded text-xs font-semibold ${status === 'pending'
                ? 'bg-yellow-100 text-yellow-700'
                : status === 'scheduled'
                  ? 'bg-blue-100 text-blue-700'
                  : status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>

            <div className="space-y-2 text-sm text-slate-600 mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                {inspection.properties?.city || 'Unknown'}
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 flex-shrink-0" />
                Inspection #{inspection.id?.slice(0, 8)}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                Created {new Date(inspection.created_at).toLocaleDateString()}
              </div>
            </div>

            {inspection.bookings && inspection.bookings.length > 0 && (
              <div className="bg-slate-50 p-3 rounded mb-4">
                <p className="text-xs font-semibold text-slate-600 mb-1">SCHEDULED</p>
                <p className="text-sm text-slate-900">
                  {new Date(inspection.bookings[0].scheduled_date).toLocaleDateString()} at{' '}
                  {inspection.bookings[0].scheduled_time}
                </p>
              </div>
            )}

            {inspection.notes && (
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-xs font-semibold text-blue-600 mb-1">NOTES</p>
                <p className="text-sm text-blue-900">{inspection.notes}</p>
              </div>
            )}
          </div>

          <div className="hidden sm:block ml-6 text-right">
            <span className={`inline-block px-3 py-1 rounded text-xs font-semibold mb-4 ${status === 'pending'
              ? 'bg-yellow-100 text-yellow-700'
              : status === 'scheduled'
                ? 'bg-blue-100 text-blue-700'
                : status === 'completed'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>

            <div className="space-y-2">
              {status === 'pending' && (
                <>
                  <Button size="sm" className="w-full">
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" className="w-full text-red-600">
                    Reject
                  </Button>
                </>
              )}
              {status === 'scheduled' && (
                <Button size="sm" variant="outline" className="w-full">
                  Mark Complete
                </Button>
              )}
              <Button size="sm" variant="ghost" className="w-full">
                View Details
              </Button>
            </div>
          </div>

          {/* Mobile action buttons */}
          <div className="flex gap-2 sm:hidden">
            {status === 'pending' && (
              <>
                <Button size="sm" className="flex-1">
                  Approve
                </Button>
                <Button size="sm" variant="outline" className="flex-1 text-red-600">
                  Reject
                </Button>
              </>
            )}
            {status === 'scheduled' && (
              <Button size="sm" variant="outline" className="flex-1">
                Mark Complete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Inspection Requests</h1>
        <p className="text-sm md:text-base text-slate-600 mt-1 md:mt-2">Manage inspection requests for your properties</p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:flex">
          <TabsTrigger value="pending" className="text-xs sm:text-sm">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="scheduled" className="text-xs sm:text-sm">Scheduled ({scheduled.length})</TabsTrigger>
          <TabsTrigger value="completed" className="text-xs sm:text-sm">Done ({completed.length})</TabsTrigger>
          <TabsTrigger value="cancelled" className="text-xs sm:text-sm">Cancelled ({cancelled.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pending.length > 0 ? (
            <div>
              {pending.map((inspection: any) => (
                <InspectionCard key={inspection.id} inspection={inspection} status="pending" />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <p className="text-slate-600">No pending inspection requests</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="scheduled" className="mt-6">
          {scheduled.length > 0 ? (
            <div>
              {scheduled.map((inspection: any) => (
                <InspectionCard key={inspection.id} inspection={inspection} status="scheduled" />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <p className="text-slate-600">No scheduled inspections</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completed.length > 0 ? (
            <div>
              {completed.map((inspection: any) => (
                <InspectionCard key={inspection.id} inspection={inspection} status="completed" />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <p className="text-slate-600">No completed inspections</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6">
          {cancelled.length > 0 ? (
            <div>
              {cancelled.map((inspection: any) => (
                <InspectionCard key={inspection.id} inspection={inspection} status="cancelled" />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <p className="text-slate-600">No cancelled inspections</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
