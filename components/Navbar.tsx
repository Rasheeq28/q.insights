"use client";

import Link from "next/link";
import BrandLogo from "./BrandLogo";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
    const [session, setSession] = useState<any>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center group transition-transform hover:scale-105">
              <BrandLogo size="md" />
            </Link>
            <div className="hidden lg:ml-12 lg:flex lg:space-x-8">
              <Link
                href="/insights"
                className="text-slate-400 hover:text-white transition-colors border-transparent inline-flex items-center px-1 pt-1 text-sm font-semibold"
              >
                Live Data
              </Link>
              <Link
                href="/request"
                className="text-slate-400 hover:text-white transition-colors border-transparent inline-flex items-center px-1 pt-1 text-sm font-semibold"
              >
                Custom Data
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
            <div className="hidden lg:flex items-center gap-4">
              {session ? (
                <button
                  onClick={handleSignOut}
                  className="text-slate-400 hover:text-white px-4 py-2 font-semibold transition-colors text-sm"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  href="/signup"
                  className="bg-[#D1FC00] hover:bg-white text-black px-6 py-2.5 font-bold rounded-full transition-all shadow-lg shadow-[#D1FC00]/10 text-sm"
                >
                  Sign Up
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
            >
              {isMenuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full bg-[#1C1917] border-b border-white/5 py-8 px-6 animate-in slide-in-from-top-4 duration-300 shadow-2xl">
          <div className="flex flex-col gap-6">
            <Link href="/insights" onClick={() => setIsMenuOpen(false)} className="text-[18px] font-bold text-white hover:text-[#D1FC00] transition-colors">
              Live Data
            </Link>
            <Link href="/request" onClick={() => setIsMenuOpen(false)} className="text-[18px] font-bold text-white hover:text-[#D1FC00] transition-colors">
              Custom Data
            </Link>
            <Link href="/pricing" onClick={() => setIsMenuOpen(false)} className="text-[18px] font-bold text-white hover:text-[#D1FC00] transition-colors">
              Pricing
            </Link>
            <div className="h-px bg-white/5 my-2"></div>
            {session ? (
              <button
                onClick={() => { handleSignOut(); setIsMenuOpen(false); }}
                className="w-full text-left text-[18px] font-bold text-[#A8A29E] hover:text-white transition-colors"
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/signup"
                onClick={() => setIsMenuOpen(false)}
                className="w-full bg-[#D1FC00] text-black text-center py-4 rounded-full font-bold text-[16px]"
              >
                Get Started Free
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
