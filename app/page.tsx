import Link from 'next/link'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

export default function Home() {
  return (
    <div className="min-h-screen bg-background grid-pattern">
      {/* Navigation */}
      <nav className="border-b-2 border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-3xl">💬</div>
            <span className="text-2xl font-bold font-grotesk">
              ReplyDash
            </span>
          </div>
          <div className="flex items-center gap-4">
            <SignedOut>
              <Link
                href="/sign-in"
                className="px-4 py-2 font-medium hover:text-primary transition"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-6 py-2 bg-primary text-primary-foreground border-2 border-border shadow-brutal hover-lift font-bold uppercase"
              >
                Get Started
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="px-4 py-2 font-medium hover:text-primary transition"
              >
                Dashboard
              </Link>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6">
        <section className="py-20 text-center">
          <div className="max-w-5xl mx-auto">
            {/* Floating emoji decorations */}
            <div className="flex justify-center gap-12 mb-8 text-5xl">
              <span className="inline-block animate-brutal-bounce">💡</span>
              <span className="inline-block animate-brutal-bounce" style={{ animationDelay: '0.2s' }}>🚀</span>
              <span className="inline-block animate-brutal-bounce" style={{ animationDelay: '0.4s' }}>✨</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold font-grotesk mb-8 leading-tight uppercase tracking-tight">
              Turn scrolling into{' '}
              <span className="inline-block bg-primary text-primary-foreground px-4 py-2 -rotate-1 border-2 border-border shadow-brutal">
                smart replies
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl font-medium mb-10 max-w-2xl mx-auto">
              ReplyDash automatically crafts witty or value-packed replies to posts on LinkedIn and X.
            </p>
            
            <SignedOut>
              <Link href="/sign-up">
                <button className="bg-accent text-accent-foreground border-2 border-border shadow-brutal-lg hover-lift font-bold text-lg px-12 py-8 uppercase">
                  Get Started Now →
                </button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <button className="bg-accent text-accent-foreground border-2 border-border shadow-brutal-lg hover-lift font-bold text-lg px-12 py-8 uppercase">
                  Go to Dashboard →
                </button>
              </Link>
            </SignedIn>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold font-grotesk text-center mb-16 uppercase">
              Everything you need
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-card border-2 border-border shadow-brutal p-8 hover-lift">
                <div className="text-6xl mb-6">⚡</div>
                <h3 className="text-2xl font-bold font-grotesk mb-4 uppercase">
                  Auto-reply
                </h3>
                <p className="text-lg leading-relaxed">
                  Let AI handle the heavy lifting. Generate contextual replies instantly while you focus on what matters.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-secondary text-secondary-foreground border-2 border-border shadow-brutal p-8 hover-lift rotate-1">
                <div className="text-6xl mb-6">🎯</div>
                <h3 className="text-2xl font-bold font-grotesk mb-4 uppercase">
                  Toggle tone
                </h3>
                <p className="text-lg leading-relaxed">
                  Switch between witty, engaging replies or insightful, value-packed responses with one click.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-card border-2 border-border shadow-brutal p-8 hover-lift">
                <div className="text-6xl mb-6">�</div>
                <h3 className="text-2xl font-bold font-grotesk mb-4 uppercase">
                  Track goals
                </h3>
                <p className="text-lg leading-relaxed">
                  Stay on top of your engagement with beautiful progress tracking and quota management.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Showcase */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            <div className="bg-primary text-primary-foreground border-2 border-border shadow-brutal-lg p-10 -rotate-2 hover-lift">
              <div className="text-5xl mb-4">😏</div>
              <h3 className="text-3xl font-bold font-grotesk mb-3 uppercase">Funny Mode</h3>
              <p className="text-lg">Witty comebacks that make people laugh and engage</p>
            </div>

            <div className="bg-accent text-accent-foreground border-2 border-border shadow-brutal-lg p-10 rotate-2 hover-lift">
              <div className="text-5xl mb-4">💎</div>
              <h3 className="text-3xl font-bold font-grotesk mb-3 uppercase">Value Mode</h3>
              <p className="text-lg">Insightful replies that showcase your expertise</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto text-center bg-foreground text-background border-2 border-border shadow-brutal-lg p-12 rotate-1">
            <h2 className="text-4xl md:text-5xl font-bold font-grotesk mb-6 uppercase">
              Ready to reply smarter?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of professionals saving time on LinkedIn and X
            </p>
            <SignedOut>
              <Link href="/sign-up">
                <button className="bg-secondary text-secondary-foreground border-2 border-background shadow-[4px_4px_0_0_#FAFAFA] hover:shadow-[2px_2px_0_0_#FAFAFA] hover:translate-x-[-2px] hover:translate-y-[-2px] font-bold text-lg px-10 py-7 uppercase transition-all">
                  Start Now →
                </button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <button className="bg-secondary text-secondary-foreground border-2 border-background shadow-[4px_4px_0_0_#FAFAFA] hover:shadow-[2px_2px_0_0_#FAFAFA] hover:translate-x-[-2px] hover:translate-y-[-2px] font-bold text-lg px-10 py-7 uppercase transition-all">
                  Go to Dashboard →
                </button>
              </Link>
            </SignedIn>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-border py-10 mt-20 bg-card">
        <div className="container mx-auto px-6 text-center">
          <p className="text-lg font-medium">
            Made with <span className="text-accent text-2xl">💙</span> by{' '}
            <span className="font-bold font-grotesk">Elcara</span>
          </p>
        </div>
      </footer>
    </div>
  )
}
