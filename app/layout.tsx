import "@/styles/globals.css";
import Navbar from "@/components/Navbar";
import { Inter } from "next/font/google"; // Using a nice font

const inter = Inter({ subsets: ["latin"] });

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Q.Labs - Premium Dataset Discovery",
  description: "Discover and export high-quality structured datasets.",
};

// Force rebuild triggered at 22:35

import BrandLogo from "@/components/BrandLogo";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-brand-slate-dark min-h-screen flex flex-col" suppressHydrationWarning>
        <Navbar />
        {/* Add padding top to account for fixed navbar */}
        <div className="flex-grow pt-16">
          {children}
        </div>

        <footer className="bg-brand-slate-950 border-t border-white/5 mt-auto">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <BrandLogo size="sm" />
              <span className="text-white font-bold text-base tracking-tight">Q<span className="text-brand-emerald">.</span>Labs</span>
            </div>

            <div className="text-slate-500 text-xs">
              &copy; {new Date().getFullYear()} Q.Labs Platform. All rights reserved.
            </div>

            <div className="flex gap-6">
              <span className="text-slate-500 hover:text-brand-emerald cursor-pointer transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
              </span>
              <span className="text-slate-500 hover:text-brand-emerald cursor-pointer transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-2v-3.86c0-.812-.47-1.14-1.114-1.14-.644 0-1.114.47-1.114 1.14v3.86h-2v-6h2v1.018c.321-.496 1.054-.834 1.831-.834 1.353 0 2.397 1.056 2.397 2.923v2.893z" /></svg>
              </span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
