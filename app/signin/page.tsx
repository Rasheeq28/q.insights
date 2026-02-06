"use client";

import { useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

function SignInForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const next = searchParams.get("next") || "/datasets";

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
            setTimeout(() => {
                setLoading(false);
                setMessage({ type: 'success', text: "Check your email for the login link! (Mock Mode)" });
            }, 1000);
            return;
        }

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback?next=${next}`,
            },
        });

        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            setMessage({ type: 'success', text: "Check your email for the login link!" });
        }
        setLoading(false);
    };

    return (
        <div className="bg-slate-800/40 backdrop-blur-md py-10 px-6 shadow-2xl rounded-2xl border border-white/5 sm:px-12 w-full">
            <form className="space-y-6" onSubmit={handleLogin}>
                <div>
                    <label htmlFor="email" className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3">
                        Email Address
                    </label>
                    <div className="mt-1">
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@company.com"
                            className="appearance-none block w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl shadow-inner text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-emerald/50 focus:border-brand-emerald/50 transition-all font-medium sm:text-sm"
                        />
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-[0_4px_20px_rgba(16,185,129,0.2)] text-sm font-black text-slate-950 uppercase tracking-widest transition-all active:scale-95
                  ${loading ? 'bg-brand-emerald/50 cursor-wait' : 'bg-brand-emerald hover:bg-brand-emerald-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-emerald'}
                `}
                    >
                        {loading ? "Sending..." : "Send Magic Link"}
                    </button>
                </div>
            </form>

            {message && (
                <div className={`mt-8 p-4 rounded-xl border text-sm font-medium ${message.type === 'success'
                    ? 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                    {message.text}
                </div>
            )}
        </div>
    );
}

export default function SignInPage() {
    return (
        <main className="min-h-screen bg-brand-slate-dark flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-emerald/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
                <div className="inline-flex items-center justify-center mb-8">
                    <BrandLogo size="lg" />
                </div>
                <h2 className="text-4xl font-black text-white mb-3 tracking-tight">
                    Welcome Back
                </h2>
                <p className="text-slate-400 font-medium mb-10">
                    Enter your email to receive a secure login link.
                </p>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <Suspense fallback={
                    <div className="bg-slate-800/40 backdrop-blur-md py-20 px-6 shadow-2xl rounded-2xl border border-white/5 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-emerald mx-auto mb-4"></div>
                        <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Initializing Secure Link...</span>
                    </div>
                }>
                    <SignInForm />
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
