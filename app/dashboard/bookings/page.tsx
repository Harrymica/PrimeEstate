import { requireAuth } from '@/lib/auth-helpers';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin } from 'lucide-react';

export default async function BookingsPage() {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, inspections(properties(title, address), tenant_id)')
    .eq('inspections.tenant_id', user.id)
    .order('scheduled_date', { ascending: true });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">My Bookings</h1>
        <p className="text-slate-600 mt-2">View and manage your inspection appointments</p>
      </div>

      {bookings && bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking: any) => (
            <Card key={booking.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">
                      {booking.inspections?.properties?.title}
                    </h3>

                    <div className="space-y-2 text-sm text-slate-600 mb-6">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        {booking.inspections?.properties?.address}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        {new Date(booking.scheduled_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        {booking.scheduled_time} ({booking.duration_minutes} minutes)
                      </div>
                    </div>

                    <div className="flex gap-2 text-xs">
                      {booking.confirmed && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                          Confirmed
                        </span>
                      )}
                      {booking.completed && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          Completed
                        </span>
                      )}
                      {!booking.confirmed && !booking.completed && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600">
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <p className="text-slate-600 mb-4">You haven&apos;t booked any inspections yet</p>
            <Button href="/dashboard">Browse Properties</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
