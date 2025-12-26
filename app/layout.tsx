import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { AuthProvider } from "@/components/auth/auth-provider";
import { AuthButton } from "@/components/auth/auth-button";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rate My Interview | Share Your Interview Experience",
  description: "Share and discover honest interview experiences. Help others prepare for their interviews with real feedback from candidates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {/* Header */}
          <header className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <Link href="/" className="text-xl font-semibold text-gray-900">
                  Rate My Interview
                </Link>
                <div className="flex items-center gap-4">
                  <Link
                    href="/interviews"
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Browse
                  </Link>
                  <AuthButton />
                </div>
              </div>
            </div>
          </header>
          {children}
          {/* Footer */}
        <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-500">
                Rate My Interview - Share your interview experiences
              </div>
              <div className="flex items-center gap-6">
                <Link
                  href="/how-reviews-work"
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  How reviews work
                </Link>
                <Link
                  href="/interviews"
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Browse interviews
                </Link>
              </div>
            </div>
          </div>
        </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
