import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-slate-900">
            Welcome Back
          </h1>
          <p className="text-center text-slate-600 mb-8">
            Sign in to your Replier account
          </p>
          <SignIn
            appearance={{
              elements: {
                formButtonPrimary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700',
                card: 'shadow-none',
                cardBox: 'shadow-none',
              },
            }}
          />
        </div>
        <p className="text-center text-slate-600 mt-6">
          Don't have an account?{' '}
          <a href="/sign-up" className="text-blue-600 hover:text-blue-700 font-semibold">
            Sign up for free
          </a>
        </p>
      </div>
    </div>
  )
}
