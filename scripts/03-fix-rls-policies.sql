-- =============================================================================
-- 03-fix-rls-policies.sql
-- Run this in the Supabase SQL Editor to fix RLS policies
-- =============================================================================

-- Allow tenants to INSERT inspections (they create inspection requests)
DROP POLICY IF EXISTS "Landlords can insert inspections" ON inspections;
DROP POLICY IF EXISTS "Tenants can insert inspections" ON inspections;
DROP POLICY IF EXISTS "Users can insert inspections" ON inspections;

CREATE POLICY "Users can insert inspections"
  ON inspections FOR INSERT WITH CHECK (
    auth.uid() = tenant_id OR auth.uid() = landlord_id
  );

-- Allow tenants to view their own inspections (via tenant_id)
DROP POLICY IF EXISTS "Tenants can view inspections for their bookings" ON inspections;
DROP POLICY IF EXISTS "Tenants can view their own inspections" ON inspections;

CREATE POLICY "Tenants can view their own inspections"
  ON inspections FOR SELECT USING (
    auth.uid() = tenant_id
  );

-- Allow tenants to INSERT payments
DROP POLICY IF EXISTS "Tenants can insert payments" ON payments;

CREATE POLICY "Tenants can insert payments"
  ON payments FOR INSERT WITH CHECK (
    auth.uid() = tenant_id
  );

-- Allow tenants to view their own payments
DROP POLICY IF EXISTS "Tenants can view their own payments" ON payments;

CREATE POLICY "Tenants can view their own payments"
  ON payments FOR SELECT USING (
    auth.uid() = tenant_id
  );
