"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function AuthCallbackHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleAuthCallback = async () => {
            const code = searchParams.get("code");
            const next = searchParams.get("next") || "/datasets";
            const errorDescription = searchParams.get("error_description");

            if (errorDescription) {
                setError(errorDescription);
                setTimeout(() => router.push(`/signin?error=${encodeURIComponent(errorDescription)}`), 3000);
                return;
            }

            try {
                if (code) {
                    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
                    if (error) throw error;

                    if (data?.session?.user) {
                        const { user } = data.session;

                        // Sync user to public.users table
                        await supabase.from('users').upsert({
                            id: user.id,
                            email: user.email,
                            created_at: new Date().toISOString(),
                        }, { onConflict: 'id', ignoreDuplicates: true });

                        router.push(next);
                        return;
                    }
                }

                const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

                if (sessionData?.session?.user) {
                    router.push(next);
                    return;
                }

                if (sessionError) throw sessionError;

                console.warn("No session or code found in callback");
                router.push("/signin?error=No session found");

            } catch (err: any) {
                console.error("Auth callback error:", err);
                setError(err.message || "Authentication failed");
                setTimeout(() => router.push(`/signin?error=${encodeURIComponent(err.message)}`), 3000);
            }
        };

        handleAuthCallback();
    }, [router, searchParams]);

    if (error) {
        return (
            <div className="text-center p-8 bg-slate-800/40 backdrop-blur-md rounded-2xl border border-red-500/20 shadow-2xl relative z-10">
                <div className="h-12 w-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
                <h2 className="text-2xl font-black text-white mb-3 tracking-tight">Sign In Failed</h2>
                <p className="text-slate-400 font-medium mb-6">{error}</p>
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <div className="animate-spin h-3 w-3 border-b-2 border-slate-500 rounded-full"></div>
                    Redirecting to sign in...
                </div>
            </div>
        );
    }

    return (
        <div className="text-center p-12 bg-slate-800/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl relative z-10 w-full max-w-md">
            <h2 className="text-3xl font-black text-white mb-8 tracking-tight">Verifying Identity</h2>
            <div className="relative h-20 w-20 mx-auto mb-8">
                <div className="absolute inset-0 bg-brand-emerald/20 rounded-full blur-xl animate-pulse"></div>
                <div className="relative h-full w-full rounded-full border-4 border-slate-700 border-t-brand-emerald animate-spin"></div>
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                Connecting to Secure Server
            </p>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <main className="min-h-screen bg-brand-slate-dark flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-emerald/5 rounded-full blur-[120px] pointer-events-none"></div>

            <Suspense fallback={
                <div className="text-center p-12 bg-slate-800/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-emerald mx-auto"></div>
                </div>
            }>
                <AuthCallbackHandler />
            </Suspense>
        </main>
    );
}
