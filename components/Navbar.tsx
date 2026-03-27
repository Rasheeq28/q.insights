"use client";

import Link from "next/link";
import BrandLogo from "./BrandLogo";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

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
              {session ? (
                <Link
                  href="/dashboard"
                  className="text-brand-emerald hover:text-emerald-400 transition-colors border-transparent inline-flex items-center px-1 pt-1 text-sm font-semibold"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="#"
                  className="text-slate-400 hover:text-white transition-colors border-transparent inline-flex items-center px-1 pt-1 text-sm font-semibold"
                >
                  API
                </Link>
              )}
              <Link
                href="/pricing"
                className="text-slate-400 hover:text-white transition-colors border-transparent inline-flex items-center px-1 pt-1 text-sm font-semibold"
              >
                Pricing
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {session ? (
              <button
                onClick={handleSignOut}
                className="text-slate-400 hover:text-white px-4 py-2 font-semibold transition-colors"
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/signup"
                className="bg-brand-emerald hover:bg-emerald-400 text-slate-900 px-4 py-2 font-bold rounded-lg transition-colors shadow-lg shadow-brand-emerald/20"
              >
                Sign Up
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
