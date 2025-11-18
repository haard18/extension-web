import Link from "next/link";
import { PricingTable, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-background grid-pattern">
      {/* Navigation */}
      <nav className="border-b border-border/30 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/image.png" alt="ReplyDash Logo" width={32} height={32} />
              <span className="text-xl md:text-2xl font-bold font-grotesk">ReplyDash</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium hover:text-primary transition">
                Features
              </a>
              <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition">
                How it Works
              </a>
              <a href="#pricing" className="text-sm font-medium hover:text-primary transition">
                Pricing
              </a>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
              <SignedOut>
                <Link
                  href="/sign-in"
                  className="px-3 md:px-4 py-2 text-sm font-medium hover:text-primary transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="px-4 md:px-6 py-2 bg-primary text-primary-foreground border border-border hover:bg-primary/90 transition text-sm font-semibold"
                >
                  Get Started
                </Link>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm font-medium hover:text-primary transition"
                >
                  Dashboard
                </Link>
                <UserButton />
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-4 md:px-6">
        <section className="py-16 md:py-24 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-block mb-4 px-4 py-1.5 bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              Chrome Extension for LinkedIn & X
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-grotesk mb-6 leading-tight tracking-tight">
              Write Engaging Replies in Seconds, Not Minutes
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              ReplyDash is a Chrome extension that helps you craft thoughtful, engaging replies to LinkedIn and X posts instantly using AI. Save hours on social media engagement while maintaining authenticity.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <SignedOut>
                <Link href="/sign-up">
                  <button className="w-full sm:w-auto bg-primary text-primary-foreground px-8 py-4 font-semibold text-base hover:bg-primary/90 transition shadow-lg">
                    Start Free - 10 Replies/Day
                  </button>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard">
                  <button className="w-full sm:w-auto bg-primary text-primary-foreground px-8 py-4 font-semibold text-base hover:bg-primary/90 transition shadow-lg">
                    Go to Dashboard →
                  </button>
                </Link>
              </SignedIn>
              <a href="#how-it-works" className="w-full sm:w-auto px-8 py-4 border border-border font-semibold text-base hover:bg-muted transition">
                See How it Works
              </a>
            </div>

            {/* Trust Signals */}
            <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Free to start</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Works on LinkedIn & X</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-16 md:py-20 bg-muted/30">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-grotesk mb-4">
                Everything You Need to Engage Smarter
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Built for professionals who value their time and want to maintain an active social media presence
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {/* Feature 1 */}
              <div className="bg-card border border-border/50 p-6 md:p-8 hover:border-primary/50 transition">
                <div className="w-12 h-12 bg-primary/10 flex items-center justify-center mb-4 text-2xl">
                  ⚡
                </div>
                <h3 className="text-xl font-bold font-grotesk mb-3">
                  One-Click Replies
                </h3>
                <p className="text-base leading-relaxed text-muted-foreground">
                  Generate contextual replies instantly without leaving LinkedIn or X. Our AI understands the context and crafts relevant responses in seconds.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-card border border-border/50 p-6 md:p-8 hover:border-primary/50 transition">
                <div className="w-12 h-12 bg-secondary/10 flex items-center justify-center mb-4 text-2xl">
                  🎨
                </div>
                <h3 className="text-xl font-bold font-grotesk mb-3">
                  Adjustable Tone
                </h3>
                <p className="text-base leading-relaxed text-muted-foreground">
                  Choose between witty, casual replies or professional, value-driven responses. Match your brand voice every time.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-card border border-border/50 p-6 md:p-8 hover:border-primary/50 transition">
                <div className="w-12 h-12 bg-accent/10 flex items-center justify-center mb-4 text-2xl">
                  📊
                </div>
                <h3 className="text-xl font-bold font-grotesk mb-3">
                  Usage Analytics
                </h3>
                <p className="text-base leading-relaxed text-muted-foreground">
                  Track your engagement with daily and weekly quotas. See your progress and manage your plan from a beautiful dashboard.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-16 md:py-20">
          <div className="max-w-5xl mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-grotesk mb-4">
                How ReplyDash Works
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get started in minutes. No complicated setup required.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-bold mb-3">Install Extension</h3>
                <p className="text-muted-foreground">
                  Add ReplyDash to Chrome in one click. Sign up for a free account to get started with 10 daily replies.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-bold mb-3">Connect from Dashboard</h3>
                <p className="text-muted-foreground">
                  Open your dashboard and click "Connect Extension" to sync your account. Choose your preferred reply tone.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-bold mb-3">Generate Replies</h3>
                <p className="text-muted-foreground">
                  Browse LinkedIn or X, click the "Generate Reply" button on any post, and watch the magic happen.
                </p>
              </div>
            </div>

            {/* Visual Demo Placeholder */}
            <div className="bg-muted border border-border p-8 md:p-12 text-center">
              <div className="max-w-2xl mx-auto">
                <p className="text-sm text-muted-foreground mb-4 uppercase font-semibold tracking-wide">How it Looks</p>
                <div className="bg-card border-2 border-dashed border-border/50 p-8 md:p-12 mb-4">
                  <p className="text-muted-foreground mb-2">
                    A "Generate Reply" button appears below each LinkedIn or X post
                  </p>
                  <div className="inline-flex items-center justify-center mt-4">
                    <button className="w-10 h-10 bg-black hover:bg-gray-800 rounded-full flex items-center justify-center border-2 border-black transition-all hover:scale-105">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg"
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24"
                        fill="none" 
                        stroke="white" 
                        strokeWidth="2"
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="9"></circle>
                        <path d="M13 6l-5 6h4l-1 6 5-6h-4z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Click the button, and your reply box is instantly filled with a contextual, engaging response ready to post.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-16 md:py-20">
          <div className="max-w-5xl mx-auto px-4 md:px-6">
            <h2 className="text-3xl md:text-4xl font-bold font-grotesk text-center mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-center mb-12 text-muted-foreground">
              Start free, upgrade when you need more replies
            </p>
            <PricingTable
              appearance={{
                variables: {
                  colorPrimary: "#3B82F6",
                  colorBackground: "#FDFDFD",
                  colorText: "#000000",
                  colorBorder: "#e5e7eb",
                  borderRadius: "4px",
                  fontFamily: '"Space Grotesk", "Inter", sans-serif',
                },
                elements: {
                  pricingTable: {
                    className:
                      "border border-border bg-white p-4 font-grotesk",
                  },
                  planCard: {
                    className:
                      "border border-border bg-card hover:border-primary/50 transition-all duration-200",
                  },
                  planName: {
                    className: "font-bold text-lg",
                  },
                  planPrice: {
                    className: "text-4xl font-bold",
                  },
                  planFeatureList: {
                    className: "border-t border-border mt-4 pt-4 space-y-2",
                  },
                  planFeature: {
                    className:
                      "text-sm font-medium flex items-center gap-2",
                  },
                  ctaButton: {
                    className:
                      "w-full bg-primary text-primary-foreground py-3 font-semibold hover:bg-primary/90 transition",
                  },
                  header: {
                    className:
                      "text-3xl font-bold mb-6",
                  },
                },
              }}
              ctaPosition="bottom"
              collapseFeatures={false}
              for="user"
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-12 mt-20 bg-card">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Image src="/image.png" alt="ReplyDash Logo" width={32} height={32} />
                <span className="text-xl font-bold font-grotesk">ReplyDash</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4 max-w-md">
                Chrome extension for generating AI-powered replies to LinkedIn and X posts. Save time, stay engaged, and grow your professional network.
              </p>
              <p className="text-sm text-muted-foreground">
                Built by{" "}
                <a
                  href="https://elcara.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold hover:text-primary transition"
                >
                  Elcara
                </a>
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#features" className="hover:text-primary transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-primary transition">
                    How it Works
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-primary transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-primary transition">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="https://elcara.xyz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition"
                  >
                    About Elcara
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/elcara"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} ReplyDash. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-primary transition">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-primary transition">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
