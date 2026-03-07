-- Create enum types
CREATE TYPE user_role AS ENUM ('tenant', 'landlord', 'admin');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE inspection_status AS ENUM ('pending', 'scheduled', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');
CREATE TYPE document_type AS ENUM ('id_proof', 'employment_letter', 'bank_statement', 'rental_history', 'other');

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  role user_role NOT NULL DEFAULT 'tenant',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create properties table
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  units INT DEFAULT 1,
  description TEXT,
  amenities TEXT[],
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inspections table
CREATE TABLE inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  landlord_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  inspection_type VARCHAR(50),
  status inspection_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  status booking_status NOT NULL DEFAULT 'pending',
  booking_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  visit_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  status payment_status NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id VARCHAR(255),
  stripe_charge_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  document_type document_type NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_properties_landlord_id ON properties(landlord_id);
CREATE INDEX idx_inspections_property_id ON inspections(property_id);
CREATE INDEX idx_inspections_landlord_id ON inspections(landlord_id);
CREATE INDEX idx_inspections_status ON inspections(status);
CREATE INDEX idx_bookings_tenant_id ON bookings(tenant_id);
CREATE INDEX idx_bookings_inspection_id ON bookings(inspection_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_tenant_id ON payments(tenant_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_stripe_id ON payments(stripe_payment_intent_id);
CREATE INDEX idx_documents_tenant_id ON documents(tenant_id);
CREATE INDEX idx_documents_booking_id ON documents(booking_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" 
  ON users FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" 
  ON users FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can update their own profile" 
  ON users FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for properties table
CREATE POLICY "Anyone can view available properties" 
  ON properties FOR SELECT USING (is_available = true);

CREATE POLICY "Landlords can view their own properties" 
  ON properties FOR SELECT USING (auth.uid() = landlord_id);

CREATE POLICY "Admins can view all properties" 
  ON properties FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Landlords can insert properties" 
  ON properties FOR INSERT WITH CHECK (
    auth.uid() = landlord_id AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'landlord')
  );

CREATE POLICY "Landlords can update own properties" 
  ON properties FOR UPDATE USING (auth.uid() = landlord_id);

-- RLS Policies for inspections table
CREATE POLICY "Tenants can view inspections for their bookings" 
  ON inspections FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE bookings.inspection_id = inspections.id AND bookings.tenant_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can view their own inspections" 
  ON inspections FOR SELECT USING (auth.uid() = landlord_id);

CREATE POLICY "Admins can view all inspections" 
  ON inspections FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Landlords can insert inspections" 
  ON inspections FOR INSERT WITH CHECK (
    auth.uid() = landlord_id AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'landlord')
  );

CREATE POLICY "Landlords can update own inspections" 
  ON inspections FOR UPDATE USING (auth.uid() = landlord_id);

-- RLS Policies for bookings table
CREATE POLICY "Tenants can view their own bookings" 
  ON bookings FOR SELECT USING (auth.uid() = tenant_id);

CREATE POLICY "Landlords can view bookings for their inspections" 
  ON bookings FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM inspections 
      WHERE inspections.id = bookings.inspection_id AND inspections.landlord_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all bookings" 
  ON bookings FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Tenants can insert bookings" 
  ON bookings FOR INSERT WITH CHECK (
    auth.uid() = tenant_id AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'tenant')
  );

CREATE POLICY "Tenants can update own bookings" 
  ON bookings FOR UPDATE USING (auth.uid() = tenant_id);

-- RLS Policies for payments table
CREATE POLICY "Tenants can view their own payments" 
  ON payments FOR SELECT USING (auth.uid() = tenant_id);

CREATE POLICY "Landlords can view payments for their properties" 
  ON payments FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings 
      JOIN inspections ON inspections.id = bookings.inspection_id
      WHERE bookings.id = payments.booking_id AND inspections.landlord_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all payments" 
  ON payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for documents table
CREATE POLICY "Tenants can view their own documents" 
  ON documents FOR SELECT USING (auth.uid() = tenant_id);

CREATE POLICY "Landlords can view documents for their inspections" 
  ON documents FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings 
      JOIN inspections ON inspections.id = bookings.inspection_id
      WHERE bookings.id = documents.booking_id AND inspections.landlord_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all documents" 
  ON documents FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Tenants can insert documents" 
  ON documents FOR INSERT WITH CHECK (
    auth.uid() = tenant_id AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'tenant')
  );

-- RLS Policies for notifications table
CREATE POLICY "Users can view their own notifications" 
  ON notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" 
  ON notifications FOR INSERT WITH CHECK (true);
