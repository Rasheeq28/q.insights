"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function TopNavbar() {
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

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md px-[48px] py-[20px] flex justify-between items-center border-b border-[#F0F0F0] h-[80px]">
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

      <div className="flex items-center justify-end gap-[24px] flex-1">
        {session ? (
          <button onClick={() => supabase.auth.signOut()} className="font-inter font-medium text-[14px] text-[#A8A29E] hover:text-[#1C1917]">Sign out</button>
        ) : (
          <Link href="/signup" className="font-inter font-bold text-[14px] text-[#1C1917] hover:opacity-70">Sign up</Link>
        )}
        <div className="bg-[#D1FC00] text-[#1C1917] font-inter font-bold text-[15px] px-[28px] py-[12px] rounded-full cursor-default select-none">
          Beta version 2.0
        </div>
      </div>
    </nav>
  );
}
