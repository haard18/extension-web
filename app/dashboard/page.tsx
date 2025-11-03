'use client'

import { useEffect, useState } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { PricingTable } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'

/**
 * Dashboard Component
 * 
 * This is the main dashboard showing:
 * - Clerk Pricing Table for plan management
 * - Usage statistics
 * - "Connect Extension" button to send token to Chrome
 * 
 * The extension will use the stored token in chrome.storage.local
 * to authenticate requests to the backend API.
 * 
 * The Pricing Table component handles subscription management
 * entirely through Clerk Billing.
 */

interface UserData {
  usage_count: number
}

export default function DashboardPage() {
  const { isLoaded, userId } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tokenLoading, setTokenLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/sign-in')
    }
  }, [isLoaded, userId, router])

  // Mock data - in production, fetch user data from Clerk
  useEffect(() => {
    if (userId) {
      // User data is managed by Clerk
      // Usage stats can be fetched from your backend API
      setUserData({
        usage_count: 12,
      })
      setLoading(false)
    }
  }, [userId])

  /**
   * Send token to Chrome extension
   * 
   * This function:
   * 1. Fetches the Clerk session token from /api/token
   * 2. Stores it in chrome.storage.local with key 'clerkToken'
   * 3. The extension can then access this token and use it for all backend requests
   * 
   * The extension will include this token in the Authorization header:
   * ```
   * Authorization: Bearer <token>
   * ```
   */
  async function sendTokenToExtension() {
    setTokenLoading(true)
    setMessage(null)

    try {
      // Check if running in a Chrome extension context
      const chromeStorage = (window as any).chrome?.storage
      
      if (chromeStorage) {
        // Fetch the session token from our API
        const response = await fetch('/api/token')

        if (!response.ok) {
          throw new Error('Failed to fetch token')
        }

        const { token } = await response.json()

        // Store token in Chrome local storage
        chromeStorage.local.set(
          { 
            clerkToken: token,
            clerkTokenTimestamp: new Date().toISOString(),
          },
          () => {
            setMessage({
              type: 'success',
              text: '✅ Token sent to extension! You can now use the extension with your account.',
            })
            setTokenLoading(false)
          }
        )
      } else {
        setMessage({
          type: 'error',
          text: '❌ Chrome storage API not available. Make sure you are running this in your browser (not in an embedded frame).',
        })
        setTokenLoading(false)
      }
    } catch (error) {
      console.error('Error sending token to extension:', error)
      setMessage({
        type: 'error',
        text: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
      setTokenLoading(false)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!userId) {
    return null
  }

  const currentPlan = 'free' // Plan is now managed entirely by Clerk Billing

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">
            🧠 Replier
          </Link>
          <UserButton />
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Welcome, {user?.firstName || 'User'}!
          </h1>
          <p className="text-lg text-slate-600">
            Manage your account and connect your Chrome extension
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column: Pricing Table */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Choose Your Plan</h2>

              {/* Clerk Pricing Table Component */}
              {/* This component displays all available plans and handles subscription management */}
              {/* Users can upgrade, downgrade, or view plan details directly */}
              <PricingTable />
            </div>

            {/* Connect Extension Section */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Connect Extension</h2>

              <p className="text-slate-600 mb-4">
                Send your authentication token to your Chrome extension. This allows the extension to
                securely communicate with your backend API on your behalf.
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-slate-900 mb-2">How it works:</h3>
                <ol className="space-y-2 text-sm text-slate-600 list-decimal list-inside">
                  <li>Click "Send Token to Extension" below</li>
                  <li>Your Clerk authentication token is stored in the extension's local storage</li>
                  <li>The extension includes this token in all requests to the backend API</li>
                  <li>The backend validates the token and processes your request</li>
                </ol>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900">
                  💡 <strong>Note:</strong> Make sure you have the Replier Chrome extension installed
                  and this browser window open when you click the button.
                </p>
              </div>

              <button
                onClick={sendTokenToExtension}
                disabled={tokenLoading}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {tokenLoading ? 'Sending...' : '🔐 Send Token to Extension'}
              </button>
            </div>
          </div>

          {/* Right Column: Account Info */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Account Info</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Name
                  </label>
                  <p className="text-slate-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Email
                  </label>
                  <p className="text-slate-900">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Plan
                  </label>
                  <p className="text-slate-900 capitalize font-semibold">
                    {currentPlan}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Total Usage
                  </label>
                  <p className="text-slate-900">
                    {userData?.usage_count || 0} replies
                  </p>
                </div>
              </div>

              <hr className="my-6" />

              <Link
                href="/"
                className="block w-full text-center px-4 py-2 text-slate-700 hover:text-slate-900 transition"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
