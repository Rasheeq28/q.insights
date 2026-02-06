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
                Documentation
              </Link>
              <Link
                href="#"
                className="text-slate-400 hover:text-white transition-colors border-transparent inline-flex items-center px-1 pt-1 text-sm font-semibold"
              >
                Pricing
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/signin"
              className="text-slate-400 hover:text-white transition-colors px-4 py-2 text-sm font-semibold"
            >
              Sign In
            </Link>
            <Link
              href="/signin"
              className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-bold rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] text-slate-950 bg-brand-emerald hover:bg-brand-emerald-hover hover:scale-105 active:scale-95 transition-all focus:outline-none"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
