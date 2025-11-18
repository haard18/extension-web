import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReplyDash - AI-Powered Replies for LinkedIn & X",
  description: "Chrome extension that helps you craft thoughtful, engaging replies to LinkedIn and X posts instantly using AI. Save hours on social media engagement while maintaining authenticity.",
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
