import Link from 'next/link'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 py-4 bg-white shadow-sm">
        <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          🧠 Replier
        </div>
        <div className="flex items-center gap-4">
          <SignedOut>
            <Link
              href="/sign-in"
              className="px-4 py-2 text-slate-700 hover:text-slate-900 transition"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition"
            >
              Get Started
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-slate-700 hover:text-slate-900 transition"
            >
              Dashboard
            </Link>
            <UserButton />
          </SignedIn>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            AI-Powered Replies for LinkedIn & X
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Generate thoughtful, engaging replies instantly with our Chrome extension.
            Powered by Claude AI.
          </p>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 my-12">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-semibold text-lg mb-2">Lightning Fast</h3>
              <p className="text-slate-600">
                Generate replies in seconds, not minutes. Get the edge you need.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold text-lg mb-2">Intelligent Tone</h3>
              <p className="text-slate-600">
                Context-aware replies that match the platform and conversation style.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="font-semibold text-lg mb-2">Private & Secure</h3>
              <p className="text-slate-600">
                Your data stays yours. We never store your posts or replies.
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center mb-12">
            <SignedOut>
              <Link
                href="/sign-up"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition"
              >
                Start Free
              </Link>
              <Link
                href="/sign-in"
                className="px-8 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition"
              >
                Sign In
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition"
              >
                Go to Dashboard
              </Link>
            </SignedIn>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 mt-20">
        <div className="container mx-auto px-6 text-center">
          <p>
            Built with{' '}
            <span className="text-red-500">❤️</span> using Next.js & Clerk
          </p>
          <p className="text-sm mt-2">
            © 2024 Replier. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
