"use client";

import Link from "next/link";
import BrandLogo from "./BrandLogo";

export default function Navbar() {
  return (
    <nav className="bg-brand-slate-dark/80 backdrop-blur-md border-b border-white/5 fixed w-full z-50 top-0 left-0 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center group transition-transform hover:scale-105">
              <BrandLogo size="md" />
            </Link>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <Link
                href="/datasets"
                className="text-slate-400 hover:text-white transition-colors border-transparent inline-flex items-center px-1 pt-1 text-sm font-semibold"
              >
                Datasets
              </Link>
              <Link
                href="#"
                className="text-slate-400 hover:text-white transition-colors border-transparent inline-flex items-center px-1 pt-1 text-sm font-semibold"
              >
                API
              </Link>
              <Link
                href="#"
                className="text-slate-400 hover:text-white transition-colors border-transparent inline-flex items-center px-1 pt-1 text-sm font-semibold"
              >
                Scrapers
              </Link>
              <Link
                href="/pricing"
                className="text-slate-400 hover:text-white transition-colors border-transparent inline-flex items-center px-1 pt-1 text-sm font-semibold"
              >
                Pricing
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Auth links removed per MVP brief */}
          </div>
        </div>
      </div>
    </nav>
  );
}
