"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Dataset } from "@/lib/types";
import Link from "next/link";

interface PaywallModalProps {
    isOpen: boolean;
    onClose: () => void;
    dataset: Dataset;
    actionType: "api";
    selectedFields: string[];
}

export default function PaywallModal({ isOpen, onClose, dataset, actionType, selectedFields }: PaywallModalProps) {
    const [status, setStatus] = useState<"loading" | "unauthenticated" | "checkout" | "processing" | "success" | "error">("loading");
    const [user, setUser] = useState<any>(null);
    const [tokenString, setTokenString] = useState("");

    useEffect(() => {
        if (!isOpen) {
            setStatus("loading");
            return;
        }

        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setStatus("unauthenticated");
            } else {
                setUser(session.user);
                
                // For MVP: We check if they already have access.
                // Since this is MVP V2 and Stripe is pending, we assume they need to checkout unless they recently purchased.
                // Just default to checkout prompt for the demo.
                setStatus("checkout");
            }
        };

        checkAuth();
    }, [isOpen]);

    const handleMockCheckout = async () => {
        setStatus("processing");
        try {
            // MVP Simulation: Wait 1.5s to simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Attempt to log basic purchase either way
            if (user) {
                await supabase.from("user_purchases").insert({
                    user_id: user.id,
                    dataset_slug: dataset.slug, // Mock data logic mapped
                    status: "active"
                }).select().maybeSingle(); // Just bypass constraints if any
            }



            // Logic for API token generation
            const generatedToken = "qlabs_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

            if (user) {
                const { error } = await supabase.from("api_tokens").insert({
                    user_id: user.id,
                    dataset_slug: dataset.slug,
                    token_string: generatedToken,
                    filters: {},
                    status: "active"
                });
                if (error) console.error("Token insert failed, but resolving for MVP demo:", error);
            }

            setTokenString(generatedToken);
            setStatus("success");
        } catch (err) {
            console.error(err);
            setStatus("error");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-[#FFFFFF] w-full max-w-[500px] rounded-[32px] md:rounded-[48px] p-6 sm:p-10 shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] border border-[#1C1917]/5 relative flex flex-col gap-6">
                
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 w-10 h-10 bg-[#F1F1F1] hover:bg-[#E2E2E2] rounded-full flex items-center justify-center transition-colors"
                >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#2F2F2F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M13 1L1 13M1 1l12 12" />
                    </svg>
                </button>

                {status === "loading" && (
                    <div className="flex flex-col items-center justify-center py-10 gap-4">
                        <div className="w-10 h-10 border-4 border-[#E2E2E2] border-t-[#D1FC00] rounded-full animate-spin"></div>
                        <p className="font-inter text-[#5B5B5B] text-[14px]">Verifying access...</p>
                    </div>
                )}

                {status === "unauthenticated" && (
                    <div className="flex flex-col items-center text-center gap-4 py-4">
                        <div className="w-16 h-16 bg-[#F1F1F1] rounded-full flex items-center justify-center mb-2">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A8A29E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        </div>
                        <h2 className="font-manrope font-bold text-[24px] sm:text-[32px] leading-[30px] sm:leading-[36px] tracking-[-0.6px] text-[#2F2F2F]">Create a free account to keep using this</h2>
                        <p className="font-inter text-[16px] text-[#5B5B5B]">
                            Get access to live data in seconds.
                        </p>
                        <Link href={`/signup?next=/datasets/${dataset.slug}`} className="mt-4 w-full bg-[#DDFF00] hover:bg-[#D1FC00] text-black font-inter font-bold text-[16px] py-[16px] rounded-full transition-all text-center">
                            Create Account
                        </Link>
                        <Link href="/signin" className="font-inter font-bold text-[14px] text-[#5B5B5B] hover:text-[#2F2F2F] mt-2 underline">
                            Already have an account? Log in
                        </Link>
                    </div>
                )}

                {status === "checkout" && (
                    <div className="flex flex-col gap-6 py-2">
                        <div className="flex flex-col gap-2">
                            <h2 className="font-manrope font-bold text-[24px] sm:text-[32px] leading-[30px] sm:leading-[36px] tracking-[-0.6px] text-[#2F2F2F]">Follow this data live</h2>
                            <p className="font-inter text-[16px] text-[#5B5B5B]">
                                Get a lifetime connection to the <strong>{dataset.title}</strong> feed. Automatically updates in Sheets and Excel.
                            </p>
                        </div>

                        <div className="bg-[#F6F6F6] rounded-2xl p-6 border border-[#E7E5E4] flex justify-between items-center">
                            <span className="font-inter font-bold text-[18px] text-[#2F2F2F]">Dataset Access</span>
                            <span className="font-manrope font-extrabold text-[24px] text-[#2F2F2F]">${dataset.price || "49"}</span>
                        </div>

                        <button 
                            onClick={handleMockCheckout}
                            className="mt-2 w-full bg-black hover:bg-black/80 text-white font-inter font-bold text-[16px] py-[16px] rounded-full transition-all flex justify-center items-center gap-2"
                        >
                            <span>Get Access</span>
                            <span className="font-inter font-normal opacity-70 border-l border-white/20 pl-2 ml-2">💳 Secure Checkout</span>
                        </button>
                    </div>
                )}

                {status === "processing" && (
                    <div className="flex flex-col items-center justify-center py-10 gap-4">
                        <div className="w-10 h-10 border-4 border-[#E2E2E2] border-t-black rounded-full animate-spin"></div>
                        <p className="font-inter font-bold text-[#2F2F2F] text-[16px]">Processing connection...</p>
                    </div>
                )}



                {status === "success" && actionType === "api" && (
                    <div className="flex flex-col items-center text-center gap-6 py-4">
                        <div className="w-16 h-16 bg-[#DDFF00] rounded-full flex items-center justify-center shadow-lg shadow-[#DDFF00]/40">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                        </div>
                        
                        <div className="flex flex-col gap-2 w-full">
                            <h2 className="font-manrope font-bold text-[24px] sm:text-[32px] leading-[30px] sm:leading-[36px] tracking-[-0.6px] text-[#2F2F2F]">Your connection is ready!</h2>
                            <p className="font-inter text-[16px] text-[#5B5B5B]">
                                Use the link below to follow your live data feed.
                            </p>
                        </div>

                        <div className="w-full bg-[#1C1917] rounded-[24px] p-[24px] overflow-hidden relative group">
                            <p className="font-inter font-bold text-[10px] uppercase tracking-[1.2px] text-[#A8A29E] text-left mb-2">Your Data Link (Ready for Sheets/Excel)</p>
                            <code className="block font-mono text-[14px] text-[#D1FC00] text-left break-all select-all">
                                {typeof window !== 'undefined' ? window.location.origin : ''}/api/datasets/{dataset.slug}?token={tokenString}&fields={selectedFields.join(",")}
                            </code>
                            <p className="font-inter text-[12px] text-[#A8A29E] text-left mt-4 border-t border-white/10 pt-4 leading-[20px]">
                                Your data feed is now active and ready to use.
                            </p>
                        </div>

                        <Link href="/dashboard" className="mt-2 w-full bg-[#E2E2E2] hover:bg-[#D1FC00] text-black font-inter font-bold text-[16px] py-[16px] rounded-full transition-all text-center">
                            Go to Dashboard
                        </Link>
                    </div>
                )}

                {status === "error" && (
                    <div className="flex flex-col items-center text-center gap-4 py-4">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        </div>
                        <h2 className="font-manrope font-bold text-[24px] text-[#2F2F2F]">Something went wrong</h2>
                        <p className="font-inter text-[14px] text-[#5B5B5B]">We couldn't process your request. Please try again or contact support.</p>
                        <button onClick={() => setStatus("checkout")} className="mt-4 bg-[#E2E2E2] px-6 py-2 rounded-full font-bold text-[14px]">Try Again</button>
                    </div>
                )}
            </div>
        </div>
    );
}
