'use client'

import { useEffect, useState } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'

interface UsageStats {
  usage_count: number
  daily_used: number
  daily_goal: number
  daily_remaining: number
  weekly_used: number
  weekly_goal: number
  weekly_remaining: number
}

export default function DashboardPage() {
  const { isLoaded, userId } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const [usage, setUsage] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [tokenLoading, setTokenLoading] = useState(false)
  const [tone, setTone] = useState<'funny' | 'value'>('value')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/sign-in')
    }
  }, [isLoaded, userId, router])

  // Fetch usage stats on load and set up polling
  useEffect(() => {
    if (!userId) return

    const fetchUsage = async () => {
      try {
        const response = await fetch('/api/token')
        const { token } = await response.json()

        const usageResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://replier.elcarainternal.lol'}/usage`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (usageResponse.ok) {
          const data = await usageResponse.json()
          setUsage(data)
        }
      } catch (error) {
        console.warn('Error fetching usage:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsage()

    // Poll every 10 seconds
    const interval = setInterval(fetchUsage, 10000)
    return () => clearInterval(interval)
  }, [userId])

  /**
   * Send token to Chrome extension
   */
  async function sendTokenToExtension() {
    setTokenLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/token')

      if (!response.ok) {
        throw new Error('Failed to fetch token')
      }

      const { token } = await response.json()

      console.log('📤 Sending token to extension via postMessage...')

      const tokenPromise = new Promise<void>((resolve, reject) => {
        let messageHandler: ((event: MessageEvent) => void) | null = null
        let timeoutId: NodeJS.Timeout | null = null

        const cleanup = () => {
          if (messageHandler) {
            window.removeEventListener('message', messageHandler)
          }
          if (timeoutId) {
            clearTimeout(timeoutId)
          }
        }

        messageHandler = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) {
            return
          }

          const { type, success, error } = event.data

          if (type === 'REPLIER_EXTENSION_RESPONSE') {
            cleanup()
            if (success) {
              resolve()
            } else {
              reject(new Error(error || 'Extension failed to store token'))
            }
          }
        }

        window.addEventListener('message', messageHandler)

        timeoutId = setTimeout(() => {
          cleanup()
          reject(new Error('Extension did not respond. Make sure it is installed and enabled.'))
        }, 10000)

        window.postMessage({
          type: 'REPLIER_EXTENSION',
          action: 'STORE_TOKEN',
          token: token,
        }, window.location.origin)
      })

      await tokenPromise

      setMessage({
        type: 'success',
        text: '✅ Token sent to extension! You can now use the extension.',
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
    } finally {
      setTokenLoading(false)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!userId) {
    return null
  }

  const dailyPercent = usage ? (usage.daily_used / usage.daily_goal) * 100 : 0
  const weeklyPercent = usage ? (usage.weekly_used / usage.weekly_goal) * 100 : 0

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-950 border-b border-slate-700 sticky top-0 z-10 backdrop-blur-md bg-opacity-80">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            🧠 ReplyDash
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">by Elcara</span>
            <UserButton appearance={{
              elements: {
                rootBox: "text-slate-200"
              }
            }} />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome, {user?.firstName || 'User'}! 👋
          </h1>
          <p className="text-lg text-slate-400">
            Manage your account and connect your Chrome extension
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border transition-all ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
              : 'bg-red-500/10 border-red-500/30 text-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column: Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Usage Stats Section */}
            <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-8 backdrop-blur-md">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                Your Quota
              </h2>

              {usage ? (
                <div className="space-y-8">
                  {/* Daily Quota */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Daily Replies</span>
                      <span className="text-lg font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        {usage.daily_used} / {usage.daily_goal}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-blue-500 to-purple-500 transition-all duration-300 rounded-full"
                        style={{ width: `${Math.min(100, dailyPercent)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      {usage.daily_remaining} remaining today
                    </p>
                  </div>

                  {/* Weekly Quota */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Weekly Replies</span>
                      <span className="text-lg font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        {usage.weekly_used} / {usage.weekly_goal}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-blue-500 to-purple-500 transition-all duration-300 rounded-full"
                        style={{ width: `${Math.min(100, weeklyPercent)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      {usage.weekly_remaining} remaining this week
                    </p>
                  </div>

                  {/* Stats Summary */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-400">{usage.usage_count}</p>
                      <p className="text-xs text-slate-400 mt-1">Total Used</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-purple-400">{usage.daily_remaining}</p>
                      <p className="text-xs text-slate-400 mt-1">Daily Left</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-pink-400">{usage.weekly_remaining}</p>
                      <p className="text-xs text-slate-400 mt-1">Weekly Left</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400">Loading usage data...</p>
              )}
            </div>

            {/* Tone Selector */}
            <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-8 backdrop-blur-md">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z"/>
                  </svg>
                </div>
                Reply Tone
              </h2>
              <p className="text-slate-400 mb-6">Choose the style of replies generated for you:</p>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Value Tone */}
                <button
                  onClick={() => setTone('value')}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    tone === 'value'
                      ? 'bg-blue-500/20 border-blue-400 shadow-lg shadow-blue-500/20'
                      : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <div className="text-2xl mb-2">💎</div>
                  <h3 className="font-bold text-white mb-2">Value</h3>
                  <p className="text-sm text-slate-300">Insightful, professional replies that showcase expertise</p>
                </button>

                {/* Funny Tone */}
                <button
                  onClick={() => setTone('funny')}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    tone === 'funny'
                      ? 'bg-purple-500/20 border-purple-400 shadow-lg shadow-purple-500/20'
                      : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <div className="text-2xl mb-2">🎭</div>
                  <h3 className="font-bold text-white mb-2">Funny</h3>
                  <p className="text-sm text-slate-300">Witty, entertaining replies that spark engagement</p>
                </button>
              </div>
            </div>

            {/* Connect Extension Section */}
            <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-8 backdrop-blur-md">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                Connect Extension
              </h2>

              <p className="text-slate-400 mb-6">
                Send your authentication token to your Chrome extension. This enables secure communication with the backend API.
              </p>

              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-white mb-3">How it works:</h3>
                <ol className="space-y-2 text-sm text-slate-400 list-decimal list-inside">
                  <li>Click "Send Token to Extension" below</li>
                  <li>Your authentication token is securely stored in the extension</li>
                  <li>The extension includes this token in all API requests</li>
                  <li>Your replies and quota are tracked in real-time</li>
                </ol>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-200">
                  💡 <strong>Tip:</strong> Make sure the ReplyDash Chrome extension is installed and this browser window is open.
                </p>
              </div>

              <button
                onClick={sendTokenToExtension}
                disabled={tokenLoading}
                className="w-full px-6 py-3 bg-linear-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-green-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                {tokenLoading ? '⏳ Sending...' : '🔐 Send Token to Extension'}
              </button>
            </div>
          </div>

          {/* Right Column: Account Info */}
          <div>
            <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-6 sticky top-28 backdrop-blur-md">
              <h2 className="text-xl font-bold text-white mb-6">Account Info</h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2">
                    Name
                  </label>
                  <p className="text-white font-medium">
                    {user?.firstName} {user?.lastName}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2">
                    Email
                  </label>
                  <p className="text-white font-medium break-all">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2">
                    Joined
                  </label>
                  <p className="text-white font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-700">
                  <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2">
                    Plan
                  </label>
                  <p className="text-lg font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Pro
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Unlimited access</p>
                </div>
              </div>

              <hr className="my-6 border-slate-700" />

              <Link
                href="/"
                className="block w-full text-center px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white transition rounded-lg"
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
