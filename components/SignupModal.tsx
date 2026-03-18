"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase";

interface SignupModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SignupModal({ isOpen, onClose }: SignupModalProps) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen || !mounted) return null;

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const checkRes = await fetch('/api/auth/check-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (checkRes.ok) {
                const { exists } = await checkRes.json();
                if (exists) {
                    setMessage({ text: 'already logged in', type: 'error' });
                    setLoading(false);
                    return;
                }
            }

            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) {
                setMessage({ text: error.message, type: 'error' });
            } else {
                setMessage({ text: `magic link sent at ${email}`, type: 'success' });
            }
        } catch (err: any) {
            setMessage({ text: err.message || 'Something went wrong.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center pt-10 pb-10">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-[#131722] rounded-2xl shadow-2xl border border-white/10 overflow-hidden transform transition-all m-4">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="p-8">
                    <div className="flex justify-center mb-6">
                        <div className="h-16 w-16 bg-[#1a2332] rounded-full border border-white/5 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white text-center mb-2">Sign up to download dataset</h3>
                    <p className="text-slate-400 text-center text-sm mb-8">
                        Join Q.Labs to access premium real-world insights.
                    </p>

                    <form onSubmit={handleSignup} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wide">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-[#161f2e] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald transition-colors"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading || (message?.type === 'success')}
                                />
                            </div>
                        </div>

                        {message && (
                            <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20'}`}>
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || (message?.type === 'success')}
                            className="w-full py-3.5 bg-brand-emerald hover:bg-brand-emerald-hover text-slate-950 font-black rounded-xl shadow-[0_0_20px_rgba(204,255,0,0.2)] transition-all flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin"></div>
                                    Sending Link...
                                </div>
                            ) : message?.type === 'success' ? (
                                'Link Sent'
                            ) : (
                                'Send Magic Link'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400">
                        <svg className="h-4 w-4 text-brand-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Get your first 1,000 rows for free.
                    </div>
                </div>

                <div className="bg-[#101520] border-t border-white/5 py-4 px-8 text-center text-sm text-slate-400">
                    Already have an account? <button onClick={() => {}} className="text-brand-emerald font-bold hover:underline">Log In</button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
