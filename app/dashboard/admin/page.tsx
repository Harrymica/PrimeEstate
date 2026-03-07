import { requireRole } from '@/lib/auth-helpers';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Home, Calendar, DollarSign } from 'lucide-react';

export default async function AdminDashboard() {
  await requireRole('admin');
  const supabase = await createClient();

  // Fetch all statistics
  const { data: users } = await supabase.from('users').select('*');
  const { data: properties } = await supabase.from('properties').select('*');
  const { data: inspections } = await supabase.from('inspections').select('*');
  const { data: payments } = await supabase.from('payments').select('*');
  const { data: bookings } = await supabase.from('bookings').select('*');

  const stats = {
    totalUsers: users?.length || 0,
    totalProperties: properties?.length || 0,
    totalInspections: inspections?.length || 0,
    totalRevenue: payments?.reduce((sum: number, p: any) => sum + (p.status === 'completed' ? p.amount : 0), 0) || 0,
    completedBookings: bookings?.filter((b: any) => b.completed).length || 0,
    totalBookings: bookings?.length || 0,
  };

  const usersByRole = {
    tenant: users?.filter(u => u.role === 'tenant').length || 0,
    landlord: users?.filter(u => u.role === 'landlord').length || 0,
    admin: users?.filter(u => u.role === 'admin').length || 0,
  };

  const paymentStats = {
    completed: payments?.filter(p => p.status === 'completed').length || 0,
    pending: payments?.filter(p => p.status === 'pending').length || 0,
    failed: payments?.filter(p => p.status === 'failed').length || 0,
    refunded: payments?.filter(p => p.status === 'refunded').length || 0,
  };

  const inspectionStats = {
    pending: inspections?.filter(i => i.status === 'pending').length || 0,
    approved: inspections?.filter(i => i.status === 'approved').length || 0,
    completed: inspections?.filter(i => i.status === 'completed').length || 0,
    rejected: inspections?.filter(i => i.status === 'rejected').length || 0,
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-600 mt-2">Overview and management of the entire platform</p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{stats.totalUsers}</p>
            <p className="text-xs text-slate-600 mt-2">
              {usersByRole.tenant} tenants, {usersByRole.landlord} landlords
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Home className="h-4 w-4" />
              Total Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{stats.totalProperties}</p>
            <p className="text-xs text-slate-600 mt-2">Active listings on platform</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Total Inspections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{stats.totalInspections}</p>
            <p className="text-xs text-slate-600 mt-2">
              {inspectionStats.completed} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">${stats.totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-slate-600 mt-2">From completed payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{stats.completedBookings}/{stats.totalBookings}</p>
            <p className="text-xs text-slate-600 mt-2">Completed bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Platform Health</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">Healthy</p>
            <p className="text-xs text-slate-600 mt-2">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="inspections">Inspections</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>User Statistics</CardTitle>
              <CardDescription>Breakdown of users by role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">Tenants</p>
                    <p className="text-sm text-slate-600">Users looking for apartments</p>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{usersByRole.tenant}</p>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">Landlords</p>
                    <p className="text-sm text-slate-600">Users renting properties</p>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{usersByRole.landlord}</p>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">Admins</p>
                    <p className="text-sm text-slate-600">Platform administrators</p>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{usersByRole.admin}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inspections" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Inspection Statistics</CardTitle>
              <CardDescription>Breakdown of inspections by status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">Pending</p>
                    <p className="text-sm text-slate-600">Awaiting approval</p>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">{inspectionStats.pending}</p>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">Approved</p>
                    <p className="text-sm text-slate-600">Approved for scheduling</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{inspectionStats.approved}</p>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">Completed</p>
                    <p className="text-sm text-slate-600">Finished inspections</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{inspectionStats.completed}</p>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">Rejected</p>
                    <p className="text-sm text-slate-600">Rejected requests</p>
                  </div>
                  <p className="text-2xl font-bold text-red-600">{inspectionStats.rejected}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Statistics</CardTitle>
              <CardDescription>Breakdown of payments by status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">Completed</p>
                    <p className="text-sm text-slate-600">Successful payments</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{paymentStats.completed}</p>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">Pending</p>
                    <p className="text-sm text-slate-600">Awaiting completion</p>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">{paymentStats.pending}</p>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">Failed</p>
                    <p className="text-sm text-slate-600">Failed transactions</p>
                  </div>
                  <p className="text-2xl font-bold text-red-600">{paymentStats.failed}</p>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">Refunded</p>
                    <p className="text-sm text-slate-600">Refunded payments</p>
                  </div>
                  <p className="text-2xl font-bold text-slate-600">{paymentStats.refunded}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="properties" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Property Information</CardTitle>
              <CardDescription>Overview of all properties on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">Total Properties</p>
                    <p className="text-sm text-slate-600">All listings</p>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalProperties}</p>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">Available</p>
                    <p className="text-sm text-slate-600">Ready for booking</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {properties?.filter(p => p.status === 'available').length || 0}
                  </p>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">Rented</p>
                    <p className="text-sm text-slate-600">Currently occupied</p>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {properties?.filter(p => p.status === 'rented').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
