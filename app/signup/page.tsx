"use client";

import { useState, Suspense, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

function SignUpForm() {
    const searchParams = useSearchParams();
    const next = searchParams.get("next") || "/datasets";
    const initialEmail = searchParams.get("email") || "";

    const [email, setEmail] = useState(initialEmail);
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

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
                    shouldCreateUser: true, // Allow registration of new users
                },
            });

            if (error) {
                setStatus("error");
                // Provide clearer messaging for common errors
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
            <div className="bg-slate-800/40 backdrop-blur-md py-12 px-6 shadow-2xl rounded-2xl border border-brand-emerald/20 sm:px-12 w-full text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-emerald to-transparent"></div>
                <div className="mx-auto w-16 h-16 bg-brand-emerald/10 text-brand-emerald rounded-full flex items-center justify-center mb-6">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Check your inbox</h3>
                <p className="text-slate-300 font-medium">
                    {message}
                </p>
                <div className="mt-8">
                   <button 
                       onClick={() => { setStatus("idle"); setEmail(""); }}
                       className="text-sm text-slate-400 hover:text-white transition-colors"
                   >
                       Didn&apos;t receive it? Try again.
                   </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-800/40 backdrop-blur-md py-10 px-6 shadow-2xl rounded-2xl border border-white/5 sm:px-12 w-full">
            <form onSubmit={handleMagicLinkSignUp} className="space-y-6">
                <div>
                     <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
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
                        className="appearance-none block w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:border-transparent transition-all"
                        placeholder="you@company.com"
                    />
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={status === "loading"}
                        className={`w-full flex items-center justify-center gap-3 py-3.5 px-4 border border-transparent rounded-xl bg-brand-emerald text-slate-900 font-bold hover:bg-emerald-400 transition-all active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.3)]
                      ${status === "loading" ? 'opacity-75 cursor-wait shadow-none' : 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-emerald focus:ring-offset-slate-900'}
                    `}
                    >
                        {status === "loading" ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900"></div>
                                <span>Sending Link...</span>
                            </>
                        ) : (
                            <span>Create account</span>
                        )}
                    </button>
                    <p className="text-xs text-slate-500 mt-4 text-center">
                        By signing up, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </form>

            <div className="mt-8 text-center text-sm text-slate-400 pt-6 border-t border-white/10">
                Already have an account?{" "}
                <Link href="/signin" className="text-brand-emerald hover:text-emerald-400 font-bold transition-colors">
                    Log in
                </Link>
            </div>

            {status === "error" && message && (
                <div className="mt-6 p-4 rounded-xl border bg-red-500/10 text-red-400 border-red-500/20 text-sm font-medium text-center">
                    {message}
                </div>
            )}
        </div>
    );
}

export default function SignUpPage() {
    return (
        <main className="min-h-screen bg-brand-slate-dark flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-emerald/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
                <div className="inline-flex items-center justify-center mb-8">
                    <BrandLogo size="lg" />
                </div>
                <h2 className="text-4xl font-black text-white mb-3 tracking-tight">
                    Create an account
                </h2>
                <p className="text-slate-400 font-medium mb-10">
                    Enter your email to get started with Q.Insights.
                </p>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <Suspense fallback={
                    <div className="bg-slate-800/40 backdrop-blur-md py-20 px-6 shadow-2xl rounded-2xl border border-white/5 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-emerald mx-auto mb-4"></div>
                        <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Sign Up...</span>
                    </div>
                }>
                    <SignUpForm />
                </Suspense>

                <p className="mt-8 text-center text-sm">
                    <Link href="/datasets" className="font-bold text-slate-500 hover:text-brand-emerald transition-colors uppercase tracking-widest">
                        ← Back to Datasets
                    </Link>
                </p>
            </div>
        </main>
    );
}
