"use client";

import { useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { SelectionChips } from "@/components/SelectionChips";

function SignUpForm() {
    const searchParams = useSearchParams();
    const next = searchParams.get("next") || "/dashboard";
    const initialEmail = searchParams.get("email") || "";

    const [email, setEmail] = useState(initialEmail);
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const [insightsSaved, setInsightsSaved] = useState(false);
    
    // Insight Form State
    const [userType, setUserType] = useState<string[]>([]);
    const [experience, setExperience] = useState("");
    const [frequency, setFrequency] = useState("");

    const handleToggleUserType = (opt: string) => {
        setUserType(prev => 
            prev.includes(opt) 
                ? prev.filter(t => t !== opt) 
                : [...prev, opt]
        );
    };

    const handleMagicLinkSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email) {
            setStatus("error");
            setMessage("Please enter your email address.");
            return;
        }

        setStatus("loading");
        setMessage("");

        // Check for mock mode or missing env vars
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
            setTimeout(() => {
                setStatus("success");
                setMessage(`Mock Mode: Imagine a confirmation email was just sent to ${email}`);
            }, 1000);
            return;
        }

        try {
            // Check if user already exists
            const checkRes = await fetch('/api/auth/check-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (checkRes.ok) {
                const { exists } = await checkRes.json();
                if (exists) {
                    setStatus("error");
                    setMessage("already logged in");
                    return;
                }
            }

            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
                    shouldCreateUser: true,
                    data: {
                        user_type: userType.join(", "),
                        experience_level: experience,
                        usage_frequency: frequency
                    }
                },
            });

            if (error) {
                setStatus("error");
                if (error.message.toLowerCase().includes("over limit") || error.message.toLowerCase().includes("rate limit")) {
                     setMessage("Please wait a moment before requesting another link.");
                } else {
                     setMessage(error.message);
                }
            } else {
                setStatus("success");
                setMessage(`magic link sent at ${email}`);
            }
        } catch (err: unknown) {
            setStatus("error");
            setMessage("An unexpected error occurred. Please try again.");
            console.error(err);
        }
    };


    if (status === "success") {
        return (
            <div className="bg-[#FFFFFF] border border-[#1C1917]/5 py-12 px-6 shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.05)] rounded-[48px] sm:px-12 w-full text-center relative overflow-hidden">
                <div className="mx-auto w-16 h-16 bg-[#D1FC00]/10 text-[#2F2F2F] rounded-full flex items-center justify-center mb-6">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-[#2F2F2F] mb-2">Check your inbox</h3>
                <p className="text-[#5B5B5B] font-medium leading-relaxed">
                    Magic link sent to <strong>{email}</strong>
                </p>
                <p className="font-inter text-[14px] text-[#5B5B5B] mt-4 pt-4 border-t border-[#F0F0F0]">
                    Preferences saved. We&apos;ve sent a link to your email to complete your registration.
                </p>
                <div className="mt-8">
                   <button 
                       onClick={() => { setStatus("idle"); setEmail(""); setInsightsSaved(false); }}
                       className="text-xs font-bold text-[#A8A29E] hover:text-[#2F2F2F] transition-colors uppercase tracking-[1px]"
                   >
                       Didn&apos;t receive it? Try again.
                   </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#FFFFFF] border border-[#1C1917]/5 py-12 px-6 shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.05)] rounded-[48px] sm:px-12 w-full">
            <form onSubmit={handleMagicLinkSignUp} className="flex flex-col gap-8">
                <div className="flex flex-col gap-1 mb-2">
                    <h4 className="font-manrope font-bold text-[18px] text-[#2F2F2F]">Help us tailor your experience</h4>
                    <p className="font-inter text-[13px] text-[#A8A29E]">Takes 10 seconds, and it is optional.</p>
                </div>

                <SelectionChips 
                    label="What best describes you?"
                    options={["Student", "Developer", "Analyst", "Business Owner", "Exploring"]}
                    selected={userType}
                    onSelect={handleToggleUserType}
                />

                <SelectionChips 
                    label="Experience level"
                    options={["Beginner", "Intermediate", "Advanced"]}
                    selected={experience}
                    onSelect={setExperience}
                />

                <SelectionChips 
                    label="How often do you work with data?"
                    options={["Daily", "Weekly", "Occasionally", "Rarely"]}
                    selected={frequency}
                    onSelect={setFrequency}
                />

                <div className="flex flex-col gap-2 pt-4 border-t border-[#F0F0F0]">
                     <label htmlFor="email" className="font-inter font-bold text-[14px] text-[#2F2F2F]">
                        Email Address
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-[24px] py-[16px] bg-[#F6F6F6] rounded-[9999px] font-inter font-normal text-[16px] text-[#2F2F2F] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#D1FC00]/50"
                        placeholder="you@company.com"
                    />
                </div>

                <div className="pt-2 flex flex-col gap-4">
                    <button
                        type="submit"
                        disabled={status === "loading"}
                        className={`w-full flex items-center justify-center gap-3 py-[16px] px-[24px] rounded-[9999px] bg-[#D1FC00] text-[#000000] font-inter font-bold text-[18px] transition-all
                      ${status === "loading" ? 'opacity-75 cursor-wait' : 'hover:bg-[#DDFF00]'}`}
                    >
                        {status === "loading" ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black/20 border-t-black"></div>
                                <span>Sending Link...</span>
                            </>
                        ) : (
                            <span>Create account</span>
                        )}
                    </button>
                    <p className="font-inter text-[12px] text-[#A8A29E] text-center px-4">
                        By signing up, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </form>

            <div className="mt-8 text-center text-sm pt-6 border-t border-[#F0F0F0]">
                <span className="font-inter font-normal text-[14px] text-[#5B5B5B]">Already have an account? </span>
                <Link href="/signin" className="font-inter font-bold text-[14px] text-[#2F2F2F] hover:underline transition-colors">
                    Log in
                </Link>
            </div>

            {status === "error" && message && (
                <div className="mt-6 p-4 rounded-xl bg-red-50 text-red-600 font-inter font-medium text-[14px] text-center border border-red-100">
                    {message}
                </div>
            )}
        </div>
    );
}

export default function SignUpPage() {
    return (
        <main className="min-h-screen bg-[#F6F6F6] flex flex-col justify-center py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 flex flex-col items-center text-center mb-8">
                <Link href="/" className="flex items-center gap-[8px] mb-8">
                    <img src="/logo.png" alt="Q.Labs Logo" className="h-12 w-auto object-contain" />
                </Link>
                <h2 className="font-manrope font-extrabold text-[40px] leading-[48px] tracking-[-1.2px] text-[#2F2F2F] mb-4">
                    Create an account
                </h2>
                <p className="font-inter text-[16px] leading-[26px] text-[#5B5B5B]">
                    Enter your email to get started with Q.Labs.
                </p>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 w-full">
                <Suspense fallback={
                    <div className="bg-[#FFFFFF] py-20 px-6 shadow-sm rounded-[48px] border border-[#1C1917]/5 text-center flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black/20 border-t-black mb-4"></div>
                        <span className="font-inter text-[#5B5B5B] font-bold tracking-[1.2px] uppercase text-xs">Loading Sign Up...</span>
                    </div>
                }>
                    <SignUpForm />
                </Suspense>

                <p className="mt-8 text-center">
                    <Link href="/" className="font-inter font-bold text-[12px] text-[#A8A29E] hover:text-[#2F2F2F] transition-colors uppercase tracking-[1.2px]">
                        ← Back to Home
                    </Link>
                </p>
            </div>
        </main>
    );
}
