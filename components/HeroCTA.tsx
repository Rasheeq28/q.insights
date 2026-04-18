"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function HeroCTA() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsSignedIn(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center lg:items-start">
      <Link
        href={isSignedIn ? "/datasets" : "/signup"}
        className="bg-[#D1FC00] text-[#1C1917] font-inter font-bold text-[15px] px-[28px] py-[14px] rounded-full hover:bg-[#C5ED00] transition-colors"
      >
        {isSignedIn ? "Explore Datasets" : "Try for Free"}
      </Link>
      <Link
        href="#how-it-works"
        className="bg-[#F0F0F0] text-[#1C1917] font-inter font-bold text-[15px] px-[28px] py-[14px] rounded-full hover:bg-[#E2E2E2] transition-colors"
      >
        How it works
      </Link>
    </div>
  );
}
