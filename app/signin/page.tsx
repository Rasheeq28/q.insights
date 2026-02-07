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

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setMessage(null);

        if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
            setTimeout(() => {
                setLoading(false);
                setMessage({ type: 'success', text: "Redirecting to Google... (Mock Mode)" });
            }, 1000);
            return;
        }

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback?next=${next}`,
            },
        });

        if (error) {
            setMessage({ type: 'error', text: error.message });
            setLoading(false);
        }
        // If successful, user will be redirected to Google
    };

    return (
        <div className="bg-slate-800/40 backdrop-blur-md py-10 px-6 shadow-2xl rounded-2xl border border-white/5 sm:px-12 w-full">
            <div className="space-y-6">
                <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className={`w-full flex items-center justify-center gap-3 py-3.5 px-4 border border-white/10 rounded-xl bg-white hover:bg-gray-50 text-slate-900 font-bold transition-all active:scale-95 shadow-[0_4px_20px_rgba(255,255,255,0.1)]
                  ${loading ? 'opacity-50 cursor-wait' : 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50'}
                `}
                >
                    {loading ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900"></div>
                            <span>Redirecting...</span>
                        </>
                    ) : (
                        <>
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            <span>Sign in with Google</span>
                        </>
                    )}
                </button>
            </div>

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
                    Sign in securely with your Google account.
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
