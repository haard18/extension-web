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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
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
      <nav className="border-b border-border/30 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/image.png" alt="Logo" width={32} height={32} />
              <span className="text-xl md:text-2xl font-bold font-grotesk">ReplyDash</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                <a
                  href="https://elcara.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition"
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
        </div>
      </nav>

      <main className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-grotesk mb-3 leading-tight">
              Hey {user?.firstName || "User"} 👋
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Let's keep the conversation going
            </p>
          </div>

          {message && (
            <div
              className={`mb-6 p-4 border border-border transition-all ${
                message.type === "success"
                  ? "bg-emerald-100 text-emerald-900"
                  : "bg-red-100 text-red-900"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              {/* Connect Extension - Primary CTA */}
              <div className="bg-linear-to-br from-[#10B981] to-[#059669] border border-border p-6 md:p-8 text-white shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white text-[#10B981] flex items-center justify-center text-2xl">
                    🚀
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold font-grotesk">
                    Activate Extension
                  </h2>
                </div>

                <p className="text-base md:text-lg mb-6 text-white/90 leading-relaxed">
                  Click the button below to connect your Chrome extension and start generating AI replies instantly!
                </p>

                <button
                  onClick={sendTokenToExtension}
                  disabled={tokenLoading}
                  className="w-full px-6 py-4 bg-white text-[#10B981] font-semibold text-base md:text-lg hover:bg-white/90 transition disabled:opacity-50 disabled:cursor-not-allowed mb-6"
                >
                  {tokenLoading ? "⏳ Connecting..." : "⚡ Connect Extension Now"}
                </button>

                <div className="bg-white/10 border border-white/20 p-4 backdrop-blur-sm">
                  <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                    <span>📋</span> Quick Setup:
                  </h3>
                  <ol className="space-y-2 text-sm list-decimal list-inside text-white/90">
                    <li>Install the ReplyDash Chrome extension</li>
                    <li>Click "Connect Extension Now" above</li>
                    <li>Start generating replies on LinkedIn & X!</li>
                  </ol>
                </div>
              </div>

              {/* Usage Stats */}
              <div className="bg-card border border-border/50 p-6 md:p-8 hover:border-primary/50 transition">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary/10 flex items-center justify-center text-2xl">
                    📊
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold font-grotesk">
                    Your Quota
                  </h2>
                </div>
                {usage ? (
                  <div className="space-y-6 md:space-y-8">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-base md:text-lg">
                          Daily Replies
                        </span>
                        <span className="text-2xl md:text-3xl font-bold font-grotesk">
                          {usage.daily_used} / {usage.daily_goal}
                        </span>
                      </div>
                      <div className="h-6 bg-muted border border-border relative overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${Math.min(100, dailyPercent)}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {usage.daily_remaining} replies remaining today
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-base md:text-lg">
                          Weekly Replies
                        </span>
                        <span className="text-2xl md:text-3xl font-bold font-grotesk">
                          {usage.weekly_used} / {usage.weekly_goal}
                        </span>
                      </div>
                      <div className="h-6 bg-muted border border-border relative overflow-hidden">
                        <div
                          className="h-full bg-secondary transition-all duration-500"
                          style={{ width: `${Math.min(100, weeklyPercent)}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {usage.weekly_remaining} replies remaining this week
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 md:gap-4 pt-6 border-t border-border">
                      <div className="text-center p-3 md:p-4 bg-primary text-primary-foreground">
                        <p className="text-3xl md:text-4xl font-bold font-grotesk">
                          {usage.daily_used}
                        </p>
                        <p className="text-xs md:text-sm font-medium mt-1">
                          Today
                        </p>
                      </div>
                      <div className="text-center p-3 md:p-4 bg-secondary text-secondary-foreground">
                        <p className="text-3xl md:text-4xl font-bold font-grotesk">
                          {usage.weekly_used}
                        </p>
                        <p className="text-xs md:text-sm font-medium mt-1">
                          This Week
                        </p>
                      </div>
                      <div className="text-center p-3 md:p-4 bg-accent text-accent-foreground">
                        <p className="text-3xl md:text-4xl font-bold font-grotesk">
                          {usage.daily_remaining}
                        </p>
                        <p className="text-xs md:text-sm font-medium mt-1">Left</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Loading usage data...</p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 md:space-y-8">
              {/* Tone Selector */}
              <div className="bg-card border border-border/50 p-6 md:p-8 hover:border-primary/50 transition">
                <h2 className="text-2xl md:text-3xl font-bold font-grotesk mb-2">
                  Reply Tone
                </h2>
                <p className="text-sm md:text-base text-muted-foreground mb-6">Choose your style</p>

                <div className="space-y-3">
                  <button
                    onClick={() => setTone("funny")}
                    className={`w-full p-4 md:p-6 border border-border text-left transition-all ${
                      tone === "funny"
                        ? "bg-accent text-accent-foreground border-primary/50"
                        : "bg-muted hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl md:text-3xl">😏</span>
                      <div>
                        <h3 className="font-bold text-lg md:text-xl font-grotesk mb-1">
                          Funny
                        </h3>
                        <p className={`text-sm ${tone === "funny" ? "text-white" : "text-muted-foreground"}`}>
                          Witty replies that spark engagement
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setTone("value")}
                    className={`w-full p-4 md:p-6 border border-border text-left transition-all ${
                      tone === "value"
                        ? "bg-secondary text-secondary-foreground border-primary/50"
                        : "bg-muted hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl md:text-3xl">💎</span>
                      <div>
                        <h3 className="font-bold text-lg md:text-xl font-grotesk mb-1">
                          Value
                        </h3>
                        <p className={`text-sm ${tone === "value" ? "text-white" : "text-muted-foreground"}`}>
                          Insightful, professional replies
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Account Info */}
              <div className="bg-card border border-border/50 p-6 md:p-8 hover:border-primary/50 transition">
                <h2 className="text-2xl md:text-3xl font-bold font-grotesk mb-6">
                  Account Info
                </h2>

                <div className="space-y-4 md:space-y-5">
                  <div>
                    <label className="block text-xs md:text-sm font-bold text-muted-foreground mb-2">
                      Name
                    </label>
                    <p className="font-bold text-base md:text-lg">
                      {user?.firstName} {user?.lastName}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-bold text-muted-foreground mb-2">
                      Email
                    </label>
                    <p className="text-sm md:text-base break-all">
                      {user?.primaryEmailAddress?.emailAddress}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-bold text-muted-foreground mb-2">
                      Joined
                    </label>
                    <p className="text-sm md:text-base">
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs md:text-sm font-bold text-muted-foreground">Plan Status</span>
                      <div className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold">
                        {usage && usage.daily_goal > 10 ? "PRO" : "FREE"}
                      </div>
                    </div>
                    <span className="w-full px-4 py-2 bg-muted hover:bg-muted/80 border border-border transition font-semibold text-sm flex items-center justify-center gap-2">
                      <SubscriptionDetailsButton />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Section - Full Width Below */}
          <div className="mt-16 md:mt-20">
            <h2 className="text-3xl md:text-4xl font-bold font-grotesk text-center mb-4">
              Need More Replies?
            </h2>
            <p className="text-base md:text-lg text-center mb-12 text-muted-foreground">
              Upgrade your plan to unlock higher limits
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
        </div>
      </main>
    </div>
  );
}
