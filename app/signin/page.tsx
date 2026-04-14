"use client";

import { useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

function SignInForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const next = searchParams.get("next") || "/datasets";

    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleMagicLinkSignIn = async (e: React.FormEvent) => {
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
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
                    shouldCreateUser: false, // Prevent auto-registration of unverified emails
                },
            });

            if (error) {
                setStatus("error");
                // If the error is regarding a non-existent user, provide a clear message and route them to signup
                if (error.message.toLowerCase().includes("user not found") || error.message.toLowerCase().includes("signups not allowed") || error.message.toLowerCase().includes("invalid login")) {
                     setMessage("Account not found. Redirecting to Sign Up...");
                     setTimeout(() => {
                         router.push(`/signup?email=${encodeURIComponent(email)}`);
                     }, 1500);
                } else {
                     setMessage(error.message);
                }
            } else {
                setStatus("success");
                setMessage(`Check confirmation mail sent to ${email}`);
            }
        } catch (err: any) {
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
                    {message}
                </p>
                <div className="mt-8">
                   <button 
                       onClick={() => { setStatus("idle"); setEmail(""); }}
                       className="text-xs font-bold text-[#A8A29E] hover:text-[#2F2F2F] transition-colors uppercase tracking-[1px]"
                   >
                       Wrong email? Try again.
                   </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#FFFFFF] border border-[#1C1917]/5 py-12 px-6 shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.05)] rounded-[48px] sm:px-12 w-full">
            <form onSubmit={handleMagicLinkSignIn} className="space-y-6">
                <div>
                     <label htmlFor="email" className="block text-sm font-bold text-[#1C1917] mb-3">
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
                        className="appearance-none block w-full px-6 py-4 bg-[#F6F6F6] rounded-full placeholder-[#A8A29E] text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#D1FC00]/50 transition-all border border-transparent focus:bg-white focus:border-[#D1FC00]/20"
                        placeholder="you@company.com"
                    />
                </div>

                <button
                    type="submit"
                    disabled={status === "loading"}
                    className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-full bg-[#D1FC00] text-black font-inter font-bold text-[16px] hover:bg-[#DDFF00] transition-all active:scale-95 shadow-lg shadow-[#D1FC00]/10
                  ${status === "loading" ? 'opacity-75 cursor-wait' : ''}
                `}
                >
                    {status === "loading" ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black/20 border-t-black"></div>
                            <span>Sending Link...</span>
                        </>
                    ) : (
                        <span>Log in</span>
                    )}
                </button>
            </form>

            <div className="mt-8 text-center text-sm pt-6 border-t border-[#F0F0F0]">
                <span className="text-[#5B5B5B]">Don&apos;t have an account?</span>{" "}
                <Link href="/signup" className="text-[#1C1917] font-bold hover:underline">
                    Sign up
                </Link>
            </div>

            {status === "error" && message && (
                <div className="mt-6 p-4 rounded-2xl bg-red-50 text-red-600 border border-red-100 text-[14px] font-medium text-center">
                    {message}
                </div>
            )}
        </div>
    );
}

export default function SignInPage() {
    return (
        <main className="min-h-screen bg-[#F6F6F6] flex flex-col justify-center py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center flex flex-col items-center mb-10">
                <div className="mb-10">
                    <BrandLogo size="lg" />
                </div>
                <h2 className="font-manrope font-extrabold text-[40px] leading-[48px] tracking-[-1.2px] text-[#2F2F2F] mb-4">
                    Welcome Back
                </h2>
                <p className="font-inter text-[16px] leading-[26px] text-[#5B5B5B]">
                    Log in securely to access your datasets.
                </p>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <Suspense fallback={
                    <div className="bg-[#FFFFFF] border border-[#1C1917]/5 py-20 px-6 shadow-sm rounded-[48px] text-center flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black/20 border-t-black mb-4"></div>
                        <span className="text-[#A8A29E] font-bold uppercase tracking-widest text-xs">Initializing Secure Link...</span>
                    </div>
                }>
                    <SignInForm />
                </Suspense>

                <p className="mt-10 text-center">
                    <Link href="/datasets" className="font-inter font-bold text-[12px] text-[#A8A29E] hover:text-[#2F2F2F] transition-colors uppercase tracking-[1.2px]">
                        ← Back to Datasets
                    </Link>
                </p>
            </div>
        </main>
    );
}
