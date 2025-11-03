import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Replier - AI Reply Generator",
  description: "Generate AI-powered replies for LinkedIn and X (Twitter)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased bg-slate-50">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
