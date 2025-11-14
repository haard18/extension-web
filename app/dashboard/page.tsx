"use client";

import { useEffect, useState } from "react";
import { PricingTable, useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import { SubscriptionDetailsButton } from "@clerk/nextjs/experimental";

interface UsageStats {
  usage_count: number;
  daily_used: number;
  daily_goal: number;
  daily_remaining: number;
  weekly_used: number;
  weekly_goal: number;
  weekly_remaining: number;
}

export default function DashboardPage() {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tone, setTone] = useState<"funny" | "value">("value");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/sign-in");
    }
  }, [isLoaded, userId, router]);

  useEffect(() => {
    if (!userId) return;

    const fetchUsage = async () => {
      try {
        const response = await fetch("/api/token");
        const { token } = await response.json();

        const usageResponse = await fetch(
          `${
            process.env.NEXT_PUBLIC_BACKEND_URL ||
            "https://replier.elcarainternal.lol"
          }/usage`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (usageResponse.ok) {
          const data = await usageResponse.json();
          setUsage(data);
        }
      } catch (error) {
        console.warn("Error fetching usage:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
    const interval = setInterval(fetchUsage, 10000);
    return () => clearInterval(interval);
  }, [userId]);

  async function sendTokenToExtension() {
    setTokenLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/token");

      if (!response.ok) {
        throw new Error("Failed to fetch token");
      }

      const { token } = await response.json();

      const tokenPromise = new Promise<void>((resolve, reject) => {
        let messageHandler: ((event: MessageEvent) => void) | null = null;
        let timeoutId: NodeJS.Timeout | null = null;

        const cleanup = () => {
          if (messageHandler) {
            window.removeEventListener("message", messageHandler);
          }
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
        };

        messageHandler = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) {
            return;
          }

          const { type, success, error } = event.data;

          if (type === "REPLIER_EXTENSION_RESPONSE") {
            cleanup();
            if (success) {
              resolve();
            } else {
              reject(new Error(error || "Extension failed to store token"));
            }
          }
        };

        window.addEventListener("message", messageHandler);

        timeoutId = setTimeout(() => {
          cleanup();
          reject(
            new Error(
              "Extension did not respond. Make sure it is installed and enabled."
            )
          );
        }, 10000);

        window.postMessage(
          {
            type: "REPLIER_EXTENSION",
            action: "STORE_TOKEN",
            token: token,
          },
          window.location.origin
        );
      });

      await tokenPromise;

      setMessage({
        type: "success",
        text: "✅ Token sent to extension! You can now use the extension.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: `❌ Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    } finally {
      setTokenLoading(false);
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
    );
  }

  if (!userId) {
    return null;
  }

  const dailyPercent = usage ? (usage.daily_used / usage.daily_goal) * 100 : 0;
  const weeklyPercent = usage
    ? (usage.weekly_used / usage.weekly_goal) * 100
    : 0;

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <nav className="border-b-2 border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/image.png" alt="Logo" width={32} height={32} />
            <span className="text-2xl font-bold font-grotesk">ReplyDash</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium px-4 py-2 bg-muted border-2 border-border shadow-brutal-sm">
              <a
                href="https://elcara.xyz"
                target="_blank"
                rel="noopener noreferrer"
              >
                by Elcara
              </a>
            </span>
            <UserButton
              appearance={{
                elements: {
                  rootBox: "text-slate-200",
                },
              }}
            />
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-bold font-grotesk mb-3 uppercase">
            Hey {user?.firstName || "User"} 👋
          </h1>
          <p className="text-2xl font-medium">
            Let's keep the conversation going
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 border-2 border-border shadow-brutal transition-all ${
              message.type === "success"
                ? "bg-emerald-100 text-emerald-900"
                : "bg-red-100 text-red-900"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Connect Extension - Primary CTA */}
            <div className="bg-linear-to-br from-[#10B981] to-[#059669] border-2 border-border shadow-brutal-lg p-8 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-white text-[#10B981] border-2 border-border shadow-brutal-sm flex items-center justify-center text-2xl">
                  🚀
                </div>
                <h2 className="text-3xl font-bold font-grotesk uppercase">
                  Activate Extension
                </h2>
              </div>

              <p className="text-lg font-medium mb-6 text-white/90">
                Click the button below to connect your Chrome extension and start generating AI replies instantly!
              </p>

              <button
                onClick={sendTokenToExtension}
                disabled={tokenLoading}
                className="w-full px-6 py-6 bg-white text-[#10B981] font-bold text-xl border-2 border-border shadow-brutal-lg hover-lift transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-brutal uppercase mb-6"
              >
                {tokenLoading ? "⏳ Connecting..." : "⚡ Connect Extension Now"}
              </button>

              <div className="bg-white/10 border-2 border-white/20 p-4 backdrop-blur-sm">
                <h3 className="font-bold text-base mb-3 uppercase flex items-center gap-2">
                  <span>📋</span> Quick Setup:
                </h3>
                <ol className="space-y-2 text-sm font-medium list-decimal list-inside text-white/90">
                  <li>Install the ReplyDash Chrome extension</li>
                  <li>Click "Connect Extension Now" above</li>
                  <li>Start generating replies on LinkedIn & X!</li>
                </ol>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="bg-card border-2 border-border shadow-brutal-lg p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-14 h-14 bg-primary border-2 border-border shadow-brutal-sm flex items-center justify-center text-2xl">
                  📊
                </div>
                <h2 className="text-3xl font-bold font-grotesk uppercase">
                  Your Quota
                </h2>
              </div>
              {usage ? (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg uppercase tracking-wide">
                        Daily Replies
                      </span>
                      <span className="text-3xl font-bold font-grotesk">
                        {usage.daily_used} / {usage.daily_goal}
                      </span>
                    </div>
                    <div className="h-8 bg-muted border-2 border-border relative overflow-hidden">
                      <div
                        className="h-full bg-primary border-r-2 border-border transition-all duration-500"
                        style={{ width: `${Math.min(100, dailyPercent)}%` }}
                      ></div>
                    </div>
                    <p className="text-sm font-medium">
                      {usage.daily_remaining} replies remaining today
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg uppercase tracking-wide">
                        Weekly Replies
                      </span>
                      <span className="text-3xl font-bold font-grotesk">
                        {usage.weekly_used} / {usage.weekly_goal}
                      </span>
                    </div>
                    <div className="h-8 bg-muted border-2 border-border relative overflow-hidden">
                      <div
                        className="h-full bg-secondary border-r-2 border-border transition-all duration-500"
                        style={{ width: `${Math.min(100, weeklyPercent)}%` }}
                      ></div>
                    </div>
                    <p className="text-sm font-medium">
                      {usage.weekly_remaining} replies remaining this week
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-6 border-t-2 border-border">
                    <div className="text-center p-4 bg-primary text-primary-foreground border-2 border-border shadow-brutal-sm">
                      <p className="text-4xl font-bold font-grotesk">
                        {usage.daily_used}
                      </p>
                      <p className="text-sm font-medium mt-1 uppercase">
                        Today
                      </p>
                    </div>
                    <div className="text-center p-4 bg-secondary text-secondary-foreground border-2 border-border shadow-brutal-sm">
                      <p className="text-4xl font-bold font-grotesk">
                        {usage.weekly_used}
                      </p>
                      <p className="text-sm font-medium mt-1 uppercase">
                        This Week
                      </p>
                    </div>
                    <div className="text-center p-4 bg-accent text-accent-foreground border-2 border-border shadow-brutal-sm">
                      <p className="text-4xl font-bold font-grotesk">
                        {usage.daily_remaining}
                      </p>
                      <p className="text-sm font-medium mt-1 uppercase">Left</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Loading usage data...</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Tone Selector */}
            <div className="bg-card border-2 border-border shadow-brutal-lg p-8 relative">
              {/* Mascot */}
              <div className="absolute -top-6 -right-6 text-6xl animate-brutal-wiggle">
                🤖
              </div>

              <h2 className="text-3xl font-bold font-grotesk mb-4 uppercase">
                Reply Tone
              </h2>
              <p className="text-base font-medium mb-6">Choose your style</p>

              <div className="space-y-4">
                <button
                  onClick={() => setTone("funny")}
                  className={`w-full p-6 border-2 border-border text-left transition-all ${
                    tone === "funny"
                      ? "bg-accent text-accent-foreground shadow-brutal-lg -translate-x-1 -translate-y-1"
                      : "bg-muted shadow-brutal hover-lift"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">😏</span>
                    <div>
                      <h3 className="font-bold text-xl font-grotesk uppercase mb-1">
                        Funny
                      </h3>
                      <p className="text-sm font-medium">
                        Witty replies that spark engagement
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setTone("value")}
                  className={`w-full p-6 border-2 border-border text-left transition-all ${
                    tone === "value"
                      ? "bg-secondary text-secondary-foreground shadow-brutal-lg -translate-x-1 -translate-y-1"
                      : "bg-muted shadow-brutal hover-lift"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">💎</span>
                    <div>
                      <h3 className="font-bold text-xl font-grotesk uppercase mb-1">
                        Value
                      </h3>
                      <p className="text-sm font-medium">
                        Insightful, professional replies
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-card border-2 border-border shadow-brutal-lg p-6">
              <h2 className="text-2xl font-bold font-grotesk mb-6 uppercase">
                Account Info
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-2 uppercase">
                    Name
                  </label>
                  <p className="font-bold text-lg">
                    {user?.firstName} {user?.lastName}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-2 uppercase">
                    Email
                  </label>
                  <p className="font-medium break-all">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-2 uppercase">
                    Joined
                  </label>
                  <p className="font-medium">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>

                <div className="pt-4 border-t-2 border-border">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-muted-foreground uppercase">Plan Status</span>
                    <div className="px-3 py-1 bg-primary text-primary-foreground border-2 border-border shadow-brutal-sm text-xs font-bold uppercase">
                      {usage && usage.daily_goal > 10 ? "PRO" : "FREE"}
                    </div>
                  </div>
                  <span
                    className="w-full px-4 py-2 bg-muted hover:bg-muted/80 border-2 border-border shadow-brutal hover-lift transition font-bold uppercase flex items-center justify-center gap-2"
                  >
                    <SubscriptionDetailsButton />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section - Full Width Below */}
        <div className="mt-16">
          <h2 className="text-4xl md:text-5xl font-bold font-grotesk text-center mb-6 uppercase">
            Need More Replies?
          </h2>
          <p className="text-xl text-center mb-12 font-medium">
            Upgrade your plan to unlock higher limits
          </p>
          <PricingTable
              appearance={{
                variables: {
                  colorPrimary: "#6B5BFF", // Elcara purple
                  colorBackground: "#FDFDFD",
                  colorText: "#000000",
                  colorBorder: "#000000",
                  borderRadius: "0px",
                  fontFamily: '"Instrument Sans", "Inter", sans-serif',
                },
                elements: {
                  pricingTable: {
                    className:
                      "border-4 border-black bg-white shadow-[6px_6px_0_0_#000] p-6 font-grotesk",
                  },
                  planCard: {
                    className:
                      "border-2 border-black bg-[#F8F8F8] shadow-[4px_4px_0_0_#000] hover:-translate-x-1 hover:-translate-y-1 transition-transform duration-150",
                  },
                  planName: {
                    className: "font-extrabold uppercase text-xl text-black",
                  },
                  planPrice: {
                    className: "text-5xl font-extrabold text-black",
                  },
                  planFeatureList: {
                    className: "border-t-2 border-black mt-4 pt-4 space-y-2",
                  },
                  planFeature: {
                    className:
                      "text-base font-medium text-black flex items-center gap-2 before:content-['☑️']",
                  },
                  ctaButton: {
                    className:
                      "w-full bg-[#FACC15] text-black border-2 border-black py-3 font-bold uppercase hover:-translate-x-1 hover:-translate-y-1 transition-transform shadow-[3px_3px_0_0_#000]",
                  },
                  header: {
                    className:
                      "text-4xl font-extrabold uppercase mb-6 text-black",
                  },
                },
              }}
              ctaPosition="bottom"
              collapseFeatures={false}
              for="user"
            />
        </div>
      </main>
    </div>
  );
}
