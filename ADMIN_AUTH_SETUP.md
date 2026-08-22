# Admin Authentication Setup

## Overview
The admin panel is now protected with Supabase Auth. Only authenticated users with admin access can view admin pages.

## Setup Instructions

### 1. Configure Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication → Users**
3. Click **Add user**
4. Create a user with email: `justin.spoden2912@gmail.com`
5. Set a secure password
6. Verify the email (or disable email confirmation in Supabase settings)

### 2. Set Environment Variables

Add these to your `.env` file (or Vercel environment variables):

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in Supabase:
- Go to **Settings → API**
- Copy **Project URL** → `VITE_SUPABASE_URL`
- Copy **anon public** key → `VITE_SUPABASE_ANON_KEY`

### 3. Deploy

Push to main and Vercel will automatically deploy with the new auth protection.

## Admin URLs

- **Login:** https://ravesave.de/admin/login
- **Dashboard:** https://ravesave.de/admin
- **AI Chat:** https://ravesave.de/admin/chat
- **Settings:** https://ravesave.de/admin/settings
- **API Keys:** https://ravesave.de/admin-key
- **Design:** https://ravesave.de/admin-design

## Features

- ✅ Protected routes with automatic redirect to login
- ✅ Session management with Supabase Auth
- ✅ Logout functionality
- ✅ Admin email whitelist (currently: justin.spoden2912@gmail.com)
- ✅ Beautiful login UI with gradient background

## Adding More Admins

To add more admin users, edit `src/lib/auth.ts` and add emails to the `adminEmails` array:

```typescript
const adminEmails = [
  'justin.spoden2912@gmail.com',
  'admin@example.com',
  // Add more admin emails here
]
```

## Troubleshooting

### Login not working
- Check that Supabase URL and anon key are correct in .env
- Verify user exists in Supabase Auth dashboard
- Check browser console for errors

### Redirect loop
- Clear browser cache and cookies
- Check Supabase Auth settings (email confirmation, etc.)

### 404 on admin pages
- Make sure the app is deployed (Vercel build completed)
- Check that all route files exist in src/routes/admin/
