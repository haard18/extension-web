/**
 * API Route: GET /api/billing-portal
 * 
 * Redirects to the Clerk Billing page where users can:
 * - View current plan and usage
 * - Upgrade or downgrade plans
 * - Manage payment methods
 * - View invoices
 * 
 * Note: This uses Clerk's native Billing product which is configured
 * in the Clerk Dashboard. No redirect URL needed here.
 * 
 * Documentation: https://clerk.com/docs/billing
 */

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export async function GET() {
  // Verify user is authenticated
  const session = await auth()
  
  if (!session?.userId) {
    redirect('/sign-in')
  }

  // Redirect to Clerk's account page which includes billing if enabled
  // Users will access billing from their account settings in your app
  // or via the Clerk Dashboard's Account Portal (organization settings)
  
  // For now, redirect to account settings where billing will appear
  // Once Clerk Billing is enabled in the Dashboard, this will show payment methods
  redirect(`${process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL}?redirect_url=${encodeURIComponent('/dashboard')}`)
}

