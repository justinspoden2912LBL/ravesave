#!/usr/bin/env node

// Check if Supabase environment variables are set
const requiredEnvVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']

console.log('🔍 Checking Ravesave Setup...\n')

let allGood = true

requiredEnvVars.forEach(varName => {
  const value = process.env[varName]
  if (!value || value.includes('your-') || value.includes('your_')) {
    console.log(`❌ ${varName}: Not configured`)
    allGood = false
  } else {
    console.log(`✅ ${varName}: Configured`)
  }
})

console.log('')

if (allGood) {
  console.log('✅ All environment variables are set!')
  console.log('🚀 Ready to deploy to Vercel')
  console.log('🔐 Admin login: https://ravesave.de/admin/login')
} else {
  console.log('⚠️  Missing environment variables!')
  console.log('')
  console.log('📋 Next steps:')
  console.log('1. Go to https://supabase.com/dashboard')
  console.log('2. Get your Project URL and anon key from Settings → API')
  console.log('3. Add to Vercel: Settings → Environment Variables')
  console.log('4. Deploy again')
  console.log('')
  console.log('📖 Full guide: SETUP_GUIDE.md')
}

process.exit(allGood ? 0 : 1)
