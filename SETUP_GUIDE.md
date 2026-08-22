# Ravesave Setup Guide 🚀

## Quick Start

### 1. Supabase Setup

1. Go to https://supabase.com/dashboard
2. Create a new project or select existing
3. Go to **Authentication → Users**
4. Click **Add user**
   - Email: `justin.spoden2912@gmail.com`
   - Password: (choose a secure password)
5. Disable email confirmation or verify the user manually

### 2. Get Supabase Credentials

Go to **Settings → API** in Supabase and copy:

- **Project URL** (e.g., `https://xyzcompany.supabase.co`)
- **anon public** key (starts with `eyJ...`)

### 3. Configure Vercel

1. Go to https://vercel.com/dashboard
2. Select your ravesave project
3. Go to **Settings → Environment Variables**
4. Add these variables:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

5. Click **Save**

### 4. Deploy

Vercel will automatically deploy. If not:

```bash
git push origin main
```

### 5. Test Admin Login

1. Go to: https://ravesave.de/admin/login
2. Login with:
   - Email: `justin.spoden2912@gmail.com`
   - Password: (your Supabase password)
3. You should be redirected to the admin dashboard

## Admin URLs

| Page | URL |
|------|-----|
| Login | https://ravesave.de/admin/login |
| Dashboard | https://ravesave.de/admin |
| AI Chat | https://ravesave.de/admin/chat |
| Settings | https://ravesave.de/admin/settings |
| API Keys | https://ravesave.de/admin-key |
| Design | https://ravesave.de/admin-design |

## Security Notes

- ✅ Never commit `.env` file with real credentials
- ✅ Use Vercel environment variables for production
- ✅ Regenerate Supabase secret if accidentally exposed
- ✅ Admin emails are whitelisted in `src/lib/auth.ts`

## Troubleshooting

### Login not working
- Check environment variables in Vercel
- Verify user exists in Supabase Auth
- Check browser console for errors

### Redirect loop
- Clear browser cache
- Verify email is confirmed in Supabase

### 404 errors
- Wait for Vercel build to complete
- Check that all route files exist

---

**Status:** ✅ Production Ready  
**Last Updated:** 2026-08-22
