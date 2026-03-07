export type UserRole = 'tenant' | 'landlord' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  landlord_id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  rent: number;
  available_date: string;
  images: string[];
  amenities: string[];
  status: 'available' | 'rented' | 'unavailable';
  created_at: string;
  updated_at: string;
}

export interface Inspection {
  id: string;
  property_id: string;
  tenant_id: string;
  requested_at: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  inspection_id: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  confirmed: boolean;
  completed: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  inspection_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  stripe_payment_intent_id?: string;
  stripe_charge_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  inspection_id?: string;
  user_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  document_type: 'contract' | 'photo' | 'invoice' | 'other';
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'booking' | 'payment' | 'inspection' | 'document' | 'system';
  title: string;
  message: string;
  read: boolean;
  action_url?: string;
  created_at: string;
}
