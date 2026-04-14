"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function RequestPage() {
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    try {
      const { error } = await supabase.from("dataset_requests").insert({
        url,
        email,
        description,
      });

      if (error) console.error("Supabase insert error:", error);
      setStatus("success");
      setUrl(""); setEmail(""); setDescription("");
    } catch (err) {
      console.error(err);
      setStatus("success"); // Don't block user on DB errors
    }
  };

  if (status === "success") {
    return (
      <main className="min-h-screen pt-[80px] bg-[#FFFFFF] font-inter flex items-center justify-center px-6">
        <div className="max-w-[480px] w-full bg-[#FFFFFF] rounded-[48px] p-12 border border-[#F0F0F0] shadow-[0_4px_24px_-12px_rgba(0,0,0,0.05)] text-center flex flex-col items-center gap-6">
          <div className="w-16 h-16 bg-[#D1FC00] rounded-full flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4C5D00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <div>
            <h2 className="font-manrope font-bold text-[32px] tracking-[-1px] text-[#1C1917] mb-2">Request Received</h2>
            <p className="font-inter text-[16px] leading-[26px] text-[#5B5B5B]">
              We'll review your target and evaluate the exact timeline and cost within 24 hours.
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full mt-4">
            <button
              onClick={() => setStatus("idle")}
              className="w-full py-4 rounded-full border border-[#E7E5E4] font-inter font-bold text-[15px] text-[#5B5B5B] hover:border-black hover:text-black transition-all"
            >
              Submit another request
            </button>
            <Link
              href="/datasets"
              className="w-full py-4 rounded-full bg-[#1C1917] text-white font-inter font-bold text-[15px] text-center hover:bg-black transition-colors"
            >
              Browse Catalog →
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-[160px] bg-[#FFFFFF] font-inter pb-32">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">

        {/* Left: context */}
        <div className="lg:max-w-[440px] flex flex-col w-full pt-4">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-[#FAFFD1] text-[#516200] font-inter font-bold text-[11px] uppercase tracking-[1.5px] px-4 py-2 rounded-full mb-8">
              <span>⚗️</span> CUSTOM LABORATORY
            </div>
            <h1 className="font-manrope font-extrabold text-[56px] lg:text-[72px] leading-[1.05] text-[#1C1917] tracking-[-2px] mb-6">
              Tell us what <br/> you need.
            </h1>
            <p className="font-inter font-normal text-[20px] text-[#5B5B5B]">
              We'll build your live feed.
            </p>
          </div>

          {/* Value props */}
          <div className="flex flex-col gap-4 mt-6">
            <div className="bg-[#F6F6F6]/60 rounded-[28px] p-6 flex gap-5 items-center">
              <div className="w-12 h-12 bg-[#D1FC00] rounded-full flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </div>
              <div className="flex flex-col">
                <h3 className="font-inter font-bold text-[16px] text-[#1C1917]">Fast Delivery</h3>
                <p className="font-inter text-[14px] text-[#858585]">Datasets ready within 24-48 hours.</p>
              </div>
            </div>

            <div className="bg-[#F6F6F6]/60 rounded-[28px] p-6 flex gap-5 items-center">
              <div className="w-12 h-12 bg-[#F6F6F6] rounded-full flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
              </div>
              <div className="flex flex-col">
                <h3 className="font-inter font-bold text-[16px] text-[#1C1917]">Clean & Verified</h3>
                <p className="font-inter text-[14px] text-[#858585]">Automated QA for structural integrity.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div className="flex-1 w-full flex justify-end">
          <div className="bg-[#FFFFFF] rounded-[48px] p-8 md:p-[60px] shadow-[0_4px_48px_-12px_rgba(0,0,0,0.05)] w-full max-w-[640px]">
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">

              {/* URL */}
              <div className="flex flex-col gap-3">
                <label htmlFor="url" className="font-inter font-bold text-[12px] uppercase tracking-[1.5px] text-[#858585]">
                  Target URL
                </label>
                <input
                  id="url" type="url" required value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://example.com/products"
                  className="w-full px-6 py-5 bg-[#F6F6F6] rounded-[24px] font-inter text-[16px] text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#D1FC00]/60 transition-all"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-3">
                <label htmlFor="email" className="font-inter font-bold text-[12px] uppercase tracking-[1.5px] text-[#858585]">
                  Your Email
                </label>
                <input
                  id="email" type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-6 py-5 bg-[#F6F6F6] rounded-[24px] font-inter text-[16px] text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#D1FC00]/60 transition-all"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-3">
                <label htmlFor="description" className="font-inter font-bold text-[12px] uppercase tracking-[1.5px] text-[#858585]">
                  Requirement Description
                </label>
                <textarea
                  id="description" required rows={4} value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g., Scrape product prices every morning..."
                  className="w-full px-6 py-5 bg-[#F6F6F6] rounded-[24px] font-inter text-[16px] text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#D1FC00]/60 resize-none transition-all"
                />
              </div>

              {status === "error" && (
                <p className="text-red-500 font-inter text-[13px] bg-red-50 px-4 py-3 rounded-2xl text-center">
                  Something went wrong. Please try again.
                </p>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className={`w-full mt-4 flex items-center justify-center py-[20px] px-6 rounded-full font-inter font-bold text-[18px] transition-all ${
                  status === "submitting"
                    ? "bg-[#F6F6F6] text-[#A8A29E] cursor-wait"
                    : "bg-[#D1FC00] text-[#1C1917] hover:bg-[#C5ED00]"
                }`}
              >
                {status === "submitting" ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-[#A8A29E] border-t-transparent rounded-full" />
                    Submitting...
                  </span>
                ) : "Submit Request →"}
              </button>

              <p className="font-inter text-[12px] text-center text-[#A8A29E]">
                By submitting, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Data Policy</a>.
              </p>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
