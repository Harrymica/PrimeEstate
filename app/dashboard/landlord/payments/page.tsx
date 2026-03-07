import { requireRole } from '@/lib/auth-helpers';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Download } from 'lucide-react';

export default async function PaymentsPage() {
  const profile = await requireRole('landlord');
  const supabase = await createClient();

  // Fetch landlord's properties
  const { data: properties } = await supabase
    .from('properties')
    .select('id')
    .eq('landlord_id', profile.id);

  // Fetch all payments for landlord's property inspections
  const { data: allPayments } = await supabase
    .from('payments')
    .select('*, inspections(properties(title, address))')
    .in('inspection_id', 
      (await supabase
        .from('inspections')
        .select('id')
        .in('property_id', properties?.map(p => p.id) || [])
      ).data?.map((i: any) => i.id) || []
    )
    .order('created_at', { ascending: false });

  const completed = allPayments?.filter(p => p.status === 'completed') || [];
  const pending = allPayments?.filter(p => p.status === 'pending') || [];
  const failed = allPayments?.filter(p => p.status === 'failed') || [];
  const refunded = allPayments?.filter(p => p.status === 'refunded') || [];

  const totalEarnings = completed.reduce((sum: number, p: any) => sum + p.amount, 0);
  const totalPending = pending.reduce((sum: number, p: any) => sum + p.amount, 0);

  const PaymentRow = ({ payment, status }: any) => (
    <tr className="border-t border-slate-200 hover:bg-slate-50">
      <td className="px-6 py-4">
        <div>
          <p className="font-medium text-slate-900">{payment.inspections?.properties?.title}</p>
          <p className="text-sm text-slate-600">{payment.inspections?.properties?.address}</p>
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <span className="font-semibold text-slate-900">${payment.amount.toFixed(2)}</span>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
          status === 'completed'
            ? 'bg-green-100 text-green-700'
            : status === 'pending'
              ? 'bg-yellow-100 text-yellow-700'
              : status === 'failed'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-700'
        }`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </td>
      <td className="px-6 py-4 text-right text-sm text-slate-600">
        {new Date(payment.created_at).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 text-right">
        <Button size="sm" variant="ghost">
          <Download className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Payments</h1>
        <p className="text-slate-600 mt-2">Track payments from inspection bookings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">${totalEarnings.toFixed(2)}</p>
            <p className="text-xs text-slate-600 mt-2">From {completed.length} completed payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">${totalPending.toFixed(2)}</p>
            <p className="text-xs text-slate-600 mt-2">From {pending.length} pending payments</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="completed" className="w-full">
        <TabsList>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="failed">Failed ({failed.length})</TabsTrigger>
          <TabsTrigger value="refunded">Refunded ({refunded.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="completed" className="mt-6">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Property
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
                    <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {completed.length > 0 ? (
                    completed.map((payment: any) => (
                      <PaymentRow key={payment.id} payment={payment} status="completed" />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-600">
                        No completed payments
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Property
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
                    <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pending.length > 0 ? (
                    pending.map((payment: any) => (
                      <PaymentRow key={payment.id} payment={payment} status="pending" />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-600">
                        No pending payments
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="failed" className="mt-6">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Property
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
                    <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {failed.length > 0 ? (
                    failed.map((payment: any) => (
                      <PaymentRow key={payment.id} payment={payment} status="failed" />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-600">
                        No failed payments
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="refunded" className="mt-6">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Property
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
                    <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {refunded.length > 0 ? (
                    refunded.map((payment: any) => (
                      <PaymentRow key={payment.id} payment={payment} status="refunded" />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-600">
                        No refunded payments
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
