import { requireRole } from '@/lib/auth-helpers';
import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, CreditCard, Clock, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

interface EnrichedPayment {
  id: string;
  booking_id: string;
  tenant_id: string;
  landlord_id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  stripe_payment_intent_id: string;
  // Enriched data
  tenantName: string;
  tenantEmail: string;
  propertyAddress: string;
  propertyLocation: string;
  visitDate: string | null;
}

export default async function PaymentsPage() {
  const profile = await requireRole('landlord');
  const supabase = createAdminClient();

  // 1. Fetch all payments for this landlord directly by landlord_id
  const { data: rawPayments } = await supabase
    .from('payments')
    .select('*')
    .eq('landlord_id', profile.id)
    .order('created_at', { ascending: false });

  // 2. Enrich each payment with tenant info, property info, and booking info
  const allPayments: EnrichedPayment[] = [];

  for (const payment of rawPayments || []) {
    let tenantName = 'Unknown';
    let tenantEmail = '';
    let propertyAddress = 'N/A';
    let propertyLocation = '';
    let visitDate: string | null = null;

    // Fetch tenant info
    if (payment.tenant_id) {
      const { data: tenant } = await supabase
        .from('users')
        .select('full_name, email')
        .eq('id', payment.tenant_id)
        .single();

      if (tenant) {
        tenantName = tenant.full_name || 'Unknown';
        tenantEmail = tenant.email || '';
      }
    }

    // Fetch booking → inspection → property chain
    if (payment.booking_id) {
      const { data: booking } = await supabase
        .from('bookings')
        .select('visit_date, inspection_id')
        .eq('id', payment.booking_id)
        .single();

      if (booking) {
        visitDate = booking.visit_date;

        if (booking.inspection_id) {
          const { data: inspection } = await supabase
            .from('inspections')
            .select('property_id')
            .eq('id', booking.inspection_id)
            .single();

          if (inspection?.property_id) {
            const { data: property } = await supabase
              .from('properties')
              .select('address, city, state')
              .eq('id', inspection.property_id)
              .single();

            if (property) {
              propertyAddress = property.address;
              propertyLocation = `${property.city}, ${property.state}`;
            }
          }
        }
      }
    }

    allPayments.push({
      ...payment,
      amount: parseFloat(payment.amount),
      tenantName,
      tenantEmail,
      propertyAddress,
      propertyLocation,
      visitDate,
    });
  }

  const succeeded = allPayments.filter(p => p.status === 'succeeded');
  const pending = allPayments.filter(p => p.status === 'pending');
  const failed = allPayments.filter(p => p.status === 'failed');
  const refunded = allPayments.filter(p => p.status === 'refunded');

  const totalEarnings = succeeded.reduce((sum, p) => sum + p.amount, 0);
  const totalPending = pending.reduce((sum, p) => sum + p.amount, 0);
  const totalAll = allPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Payments</h1>
        <p className="text-slate-600 mt-2">Track payments from inspection bookings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">${totalAll.toFixed(2)}</p>
            <p className="text-xs text-slate-600 mt-2">From {allPayments.length} total payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Succeeded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">${totalEarnings.toFixed(2)}</p>
            <p className="text-xs text-slate-600 mt-2">{succeeded.length} payment{succeeded.length !== 1 ? 's' : ''}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">${totalPending.toFixed(2)}</p>
            <p className="text-xs text-slate-600 mt-2">{pending.length} payment{pending.length !== 1 ? 's' : ''}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Refunded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-400">${refunded.reduce((s, p) => s + p.amount, 0).toFixed(2)}</p>
            <p className="text-xs text-slate-600 mt-2">{refunded.length} payment{refunded.length !== 1 ? 's' : ''}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({allPayments.length})</TabsTrigger>
          <TabsTrigger value="succeeded">Succeeded ({succeeded.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="failed">Failed ({failed.length})</TabsTrigger>
          <TabsTrigger value="refunded">Refunded ({refunded.length})</TabsTrigger>
        </TabsList>

        {/* All */}
        <TabsContent value="all" className="mt-6">
          <PaymentTable payments={allPayments} emptyMessage="No payments yet" />
        </TabsContent>

        {/* Succeeded */}
        <TabsContent value="succeeded" className="mt-6">
          <PaymentTable payments={succeeded} emptyMessage="No succeeded payments" />
        </TabsContent>

        {/* Pending */}
        <TabsContent value="pending" className="mt-6">
          <PaymentTable payments={pending} emptyMessage="No pending payments" />
        </TabsContent>

        {/* Failed */}
        <TabsContent value="failed" className="mt-6">
          <PaymentTable payments={failed} emptyMessage="No failed payments" />
        </TabsContent>

        {/* Refunded */}
        <TabsContent value="refunded" className="mt-6">
          <PaymentTable payments={refunded} emptyMessage="No refunded payments" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PaymentTable({ payments, emptyMessage }: { payments: EnrichedPayment[]; emptyMessage: string }) {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Property
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Tenant
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Status
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {payments.length > 0 ? (
              payments.map((payment) => (
                <tr key={payment.id} className="border-t border-slate-200 hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{payment.propertyAddress}</p>
                      <p className="text-sm text-slate-500">{payment.propertyLocation}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{payment.tenantName}</p>
                      <p className="text-sm text-slate-500">{payment.tenantEmail}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-semibold text-slate-900">${payment.amount.toFixed(2)}</span>
                    <p className="text-xs text-slate-400 uppercase">{payment.currency}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${payment.status === 'succeeded'
                      ? 'bg-green-100 text-green-700'
                      : payment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : payment.status === 'failed'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                      {payment.status === 'succeeded' && <CheckCircle className="h-3 w-3" />}
                      {payment.status === 'pending' && <Clock className="h-3 w-3" />}
                      {payment.status === 'failed' && <XCircle className="h-3 w-3" />}
                      {payment.status === 'refunded' && <RotateCcw className="h-3 w-3" />}
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-sm text-slate-900">
                      {new Date(payment.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    {payment.visitDate && (
                      <p className="text-xs text-slate-500">
                        Visit: {new Date(payment.visitDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  <CreditCard className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p>{emptyMessage}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
