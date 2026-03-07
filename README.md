# InspectHub - Apartment Inspection Booking Platform

A modern, full-featured platform for managing apartment inspections, connecting tenants with landlords for seamless bookings, secure payments, and document management.

## Features

### For Tenants
- Browse available apartments with detailed listings
- Schedule inspection appointments
- Make secure payments via Stripe
- Receive email notifications
- Download invoices and documents
- Manage your bookings and history

### For Landlords
- List and manage properties
- Review and approve inspection requests
- Track payment history and earnings
- Manage tenant interactions
- View inspection schedules

### For Admins
- Platform-wide analytics and statistics
- User management
- Property oversight
- Payment tracking
- Inspection monitoring
- System health monitoring

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **UI Components**: shadcn/ui with Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Email**: Resend
- **File Storage**: Vercel Blob (for documents)
- **PDF Generation**: html2pdf.js

## Project Structure

```
app/
├── page.tsx                    # Landing page
├── auth/
│   ├── login/                  # Login page
│   ├── signup/                 # Signup page
│   ├── callback/               # Auth callback
│   └── verify-email/           # Email verification
├── dashboard/
│   ├── layout.tsx              # Dashboard layout with sidebar
│   ├── page.tsx                # Tenant dashboard
│   ├── bookings/               # Tenant bookings
│   ├── documents/              # Tenant documents
│   ├── landlord/
│   │   ├── page.tsx            # Landlord main dashboard
│   │   ├── inspections/        # Inspection management
│   │   └── payments/           # Payment tracking
│   └── admin/
│       └── page.tsx            # Admin dashboard
└── api/
    ├── stripe/                 # Stripe payment intents
    ├── inspections/            # Inspection endpoints
    ├── notifications/          # Notification service
    └── email/                  # Email service

lib/
├── supabase/
│   ├── client.ts               # Client-side Supabase
│   └── server.ts               # Server-side Supabase
├── auth-helpers.ts             # Authentication utilities
└── types.ts                    # TypeScript interfaces

scripts/
└── 01-create-tables.sql        # Database schema
```

## Setup Instructions

### Prerequisites

1. **Node.js** - v18 or higher
2. **Git** - for version control
3. **Accounts** (all free to create):
   - Supabase (supabase.com)
   - Stripe (stripe.com)
   - Resend (resend.com)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd inspectHub
npm install
```

### Step 2: Setup Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your **Project URL** and **Anon Key** from Settings → API
4. Run the SQL migration from `scripts/01-create-tables.sql` in the Supabase SQL Editor
5. Copy your **Service Role Key** from Settings → API (keep this secret)

### Step 3: Setup Stripe

1. Create an account at [stripe.com](https://stripe.com)
2. Get your API keys from Dashboard → Developers → API Keys
3. Copy your **Secret Key** (sk_test_...) and **Publishable Key** (pk_test_...)

### Step 4: Setup Resend

1. Create an account at [resend.com](https://resend.com)
2. Navigate to API Keys
3. Create and copy your API key

### Step 5: Configure Environment Variables

Add the following to your Vercel project (Settings → Environment Variables):

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
RESEND_API_KEY=your_resend_api_key
```

### Step 6: Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Database Schema

### Tables

- **users** - User profiles and roles
- **properties** - Apartment/rental listings
- **inspections** - Inspection requests
- **bookings** - Scheduled inspection appointments
- **payments** - Payment transactions
- **documents** - Uploaded files and contracts
- **notifications** - In-app notifications

All tables include Row Level Security (RLS) to ensure data privacy.

## Authentication Flow

1. User signs up on `/auth/signup`
2. Supabase sends verification email via Resend
3. User clicks email link (redirects to `/auth/callback`)
4. Session is created and user is redirected to `/dashboard`
5. Dashboard redirects based on user role (tenant/landlord/admin)

## API Routes

### Payments (`/api/stripe/*`)
- `POST /api/stripe/create-intent` - Create Stripe payment intent
- Handles payment tracking and database updates

### Inspections (`/api/inspections/*`)
- `POST /api/inspections/create` - Create inspection request
- Creates notification for landlord
- Validates property ownership

### Notifications (`/api/notifications/*`)
- `POST /api/notifications/create` - Create notification
- Supports different notification types

### Email (`/api/email/*`)
- `POST /api/email/send` - Send email via Resend
- Used for confirmations, notifications, receipts

## User Roles

### Tenant
- Browse available properties
- Schedule inspections
- Make payments
- Download documents
- View booking history

### Landlord
- List properties
- Approve/reject inspection requests
- Track payments and earnings
- Manage property information
- View inspection history

### Admin
- View all users, properties, and inspections
- Monitor platform statistics
- Track all payments
- System health overview
- User management

## Testing

### Test Accounts

Create accounts with these test credentials:

**Tenant Account:**
- Email: tenant@test.com
- Password: TestPassword123!
- Role: Tenant

**Landlord Account:**
- Email: landlord@test.com
- Password: TestPassword123!
- Role: Landlord

**Admin Account:**
- Email: admin@test.com
- Password: TestPassword123!
- Role: Admin

### Test Payments

Use Stripe test cards:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Require Auth**: 4000 0025 0000 3155

Any future date and any 3-digit CVC.

## Features Implemented

✅ User authentication with role-based access
✅ Property listings and browsing
✅ Inspection request system
✅ Booking scheduling
✅ Stripe payment integration
✅ Email notifications via Resend
✅ PDF generation support
✅ Document management
✅ Role-based dashboards (tenant/landlord/admin)
✅ Payment tracking and history
✅ Responsive design
✅ Row Level Security policies
✅ Real-time notifications

## Features Ready for Implementation

The following components are set up and ready for additional work:

- [ ] Property image uploads (Vercel Blob integration)
- [ ] Advanced search and filtering
- [ ] Messaging between users
- [ ] Review and rating system
- [ ] Analytics charts and graphs
- [ ] Recurring email reminders
- [ ] PDF document generation
- [ ] Property amenities customization
- [ ] Webhook integrations
- [ ] Export to CSV/Excel

## Troubleshooting

### "Environment variables not set"
- Ensure all 6 environment variables are added to Vercel
- Restart your development server
- Check that variable names match exactly

### "Database connection failed"
- Verify Supabase URL and keys are correct
- Ensure SQL migration has been run
- Check that your Supabase project is active
- Try creating a new database connection

### "Email not sending"
- Verify Resend API key is correct
- Check spam folder
- Ensure sender email is verified in Resend
- Review Resend logs for errors

### "Stripe payments failing"
- Use test mode keys (sk_test_*, pk_test_*)
- Use test card numbers (4242 4242 4242 4242)
- Check Stripe dashboard for error details
- Verify webhook configuration if using webhooks

### "Auth redirects not working"
- Ensure callback URL matches in Supabase
- Check that email verification is enabled
- Verify Supabase URL is correct
- Check browser cookies are enabled

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables
5. Deploy

### Post-Deployment

1. Update Supabase auth callback URL to your Vercel domain
2. Test email verification with real domain
3. Monitor logs for errors
4. Set up Stripe webhook endpoints
5. Configure domain in Resend for production email

## Security Considerations

- All sensitive keys are stored in environment variables
- Passwords are hashed with Supabase auth
- Row Level Security policies protect data
- API routes validate user permissions
- Email verification required for account activation
- Payment data handled by Stripe (PCI compliant)
- CSRF protection via Next.js

## Support & Contributing

For issues, questions, or contributions:

1. Check the SETUP_GUIDE.md for detailed setup instructions
2. Review the implementation plan at v0_plans/practical-sketch.md
3. Check existing issues before creating new ones
4. Follow the existing code style and patterns

## License

This project is provided as-is for use.

## Roadmap

Future enhancements planned:

- Mobile app (React Native)
- Advanced scheduling calendar
- Video tours of properties
- AI-powered property recommendations
- Automated lease generation
- Integration with accounting software
- Blockchain verification for documents
- Multi-language support
- Dark mode
- Advanced analytics and reporting
