"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function TopNavbar() {
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

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md px-6 md:px-[48px] py-[20px] flex justify-between items-center border-b border-[#F0F0F0] h-[80px]">
      <div className="flex items-center gap-[12px] flex-1">
        <Link href="/" className="flex items-center gap-[12px]">
          <img src="/logo.png" alt="Q.Labs Logo" className="h-8 w-auto object-contain" />
        </Link>
      </div>
      
      <div className="hidden lg:flex items-center justify-center gap-[32px] flex-1">
        <Link href="/" className="font-inter font-medium text-[15px] text-[#5B5B5B] hover:text-[#1C1917] transition-colors whitespace-nowrap">Home Page</Link>
        <Link href="/datasets" className="font-inter font-medium text-[15px] text-[#5B5B5B] hover:text-[#1C1917] transition-colors whitespace-nowrap">Datasets</Link>
        <Link href="/request" className="font-inter font-medium text-[15px] text-[#5B5B5B] hover:text-[#1C1917] transition-colors whitespace-nowrap">Custom Scraping</Link>
        <Link href="/pricing" className="font-inter font-medium text-[15px] text-[#5B5B5B] hover:text-[#1C1917] transition-colors whitespace-nowrap">Pricing</Link>
        <Link href="/feedback" className="font-inter font-medium text-[15px] text-[#5B5B5B] hover:text-[#1C1917] transition-colors whitespace-nowrap">Feedback</Link>
        {session && (
            <Link href="/dashboard" className="font-inter font-medium text-[15px] text-[#5B5B5B] hover:text-[#1C1917] transition-colors whitespace-nowrap">Dashboard</Link>
        )}
      </div>

      <div className="flex items-center justify-end gap-4 md:gap-[24px] flex-1">
        <div className="hidden sm:flex items-center gap-4">
            {session ? (
              <button onClick={() => supabase.auth.signOut()} className="font-inter font-medium text-[14px] text-[#A8A29E] hover:text-[#1C1917]">Sign out</button>
            ) : (
              <Link href="/signup" className="font-inter font-bold text-[14px] text-[#1C1917] hover:opacity-70">Sign up</Link>
            )}
            <div className="bg-[#D1FC00] text-[#1C1917] font-inter font-bold text-[14px] md:text-[15px] px-4 md:px-[28px] py-[10px] md:py-[12px] rounded-full cursor-default select-none whitespace-nowrap">
              Beta 2.0
            </div>
        </div>

        {/* Mobile Hamburger */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden p-2 text-slate-600 hover:text-black transition-colors"
        >
          {isMenuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-[80px] left-0 w-full bg-white border-b border-[#F0F0F0] py-8 px-6 animate-in slide-in-from-top-4 duration-300 shadow-xl z-50">
          <div className="flex flex-col gap-6">
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="text-[18px] font-bold text-[#1C1917]">Home</Link>
            <Link href="/datasets" onClick={() => setIsMenuOpen(false)} className="text-[18px] font-bold text-[#1C1917]">Datasets</Link>
            <Link href="/request" onClick={() => setIsMenuOpen(false)} className="text-[18px] font-bold text-[#1C1917]">Custom Scraping</Link>
            <Link href="/pricing" onClick={() => setIsMenuOpen(false)} className="text-[18px] font-bold text-[#1C1917]">Pricing</Link>
            <Link href="/feedback" onClick={() => setIsMenuOpen(false)} className="text-[18px] font-bold text-[#1C1917]">Feedback</Link>
            {session && (
              <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="text-[18px] font-bold text-[#1C1917]">Dashboard</Link>
            )}
            <div className="h-px bg-[#F0F0F0] my-2"></div>
            {session ? (
              <button 
                onClick={() => { supabase.auth.signOut(); setIsMenuOpen(false); }} 
                className="w-full text-left text-[18px] font-bold text-[#A8A29E]"
              >
                Sign Out
              </button>
            ) : (
              <Link href="/signup" onClick={() => setIsMenuOpen(false)} className="w-full bg-[#D1FC00] text-black text-center py-4 rounded-full font-bold text-[16px]">
                Sign Up
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
