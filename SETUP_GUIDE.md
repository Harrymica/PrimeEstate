# Apartment Inspection Booking Platform - Setup Guide

## Prerequisites

Before running this application, you need to set up the following services:

1. **Supabase Account** - PostgreSQL database with auth
2. **Stripe Account** - Payment processing
3. **Resend Account** - Email sending

## Step 1: Supabase Setup

### 1.1 Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your **Project URL** and **Anon Key** from the API settings

### 1.2 Run Database Migration
Copy the SQL from `/scripts/01-create-tables.sql` and run it in your Supabase SQL Editor:

1. Go to your Supabase dashboard
2. Click "SQL Editor"
3. Create a new query
4. Paste the entire contents of `/scripts/01-create-tables.sql`
5. Click "Run"

This creates all tables, indexes, and Row Level Security policies.

### 1.3 Get Service Role Key
1. Go to Project Settings → API
2. Copy the **Service Role Key** (keep this secret!)

## Step 2: Stripe Setup

### 2.1 Create Stripe Account
1. Go to [stripe.com](https://stripe.com)
2. Create an account and verify your email
3. Go to Dashboard → Developers → API Keys
4. Copy your **Secret Key** (starts with `sk_`)
5. Copy your **Publishable Key** (starts with `pk_`)

### 2.2 Create Products
1. Go to Products in your Stripe dashboard
2. Create a product for "Inspection Fee"
3. Add a price (e.g., $50)

## Step 3: Resend Setup

### 3.1 Create Resend Account
1. Go to [resend.com](https://resend.com)
2. Sign up and verify your email
3. Go to API Keys
4. Create a new API key and copy it

### 3.2 Verify Domain (Optional but Recommended)
For production, add your domain to Resend for better deliverability.

## Step 4: Environment Variables

Add these to your Vercel project (Settings → Environment Variables):

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

RESEND_API_KEY=your_resend_api_key
```

## Step 5: Run the Application

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Database Schema Overview

### Tables Created:

- **users** - Stores user profiles (tenants, landlords, admins)
- **properties** - Apartment/rental properties
- **inspections** - Inspection requests
- **bookings** - Booking time slots
- **payments** - Payment transactions
- **documents** - Uploaded files (contracts, photos, etc.)
- **notifications** - In-app notifications

All tables include Row Level Security (RLS) to ensure users can only access their own data.

## Testing the Platform

### Test Account Creation
1. Create accounts for:
   - Tenant (book inspections)
   - Landlord (manage properties)
   - Admin (manage all)

### Test Booking Flow
1. As tenant: Browse properties → Book inspection
2. Payment: Use Stripe test card `4242 4242 4242 4242`
3. Receive confirmation email via Resend

### Test Admin Dashboard
1. As admin: View all bookings and payments
2. Approve/reject inspections
3. View analytics and reports

## Troubleshooting

**"Environment variables not set"**
- Ensure all 6 environment variables are added to Vercel
- Restart the development server

**"Database connection failed"**
- Verify Supabase URL and keys are correct
- Ensure SQL migration ran successfully
- Check that your Supabase project is active

**"Email not sending"**
- Verify Resend API key is correct
- Check spam folder
- Ensure sender email is verified in Resend

**"Stripe payments failing"**
- Use Stripe test keys (sk_test_* and pk_test_*)
- Use test card numbers from Stripe docs
- Check webhook configuration if using webhooks
