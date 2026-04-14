"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

const MISSING_OPTIONS = [
    "More datasets",
    "Easier to use",
    "Better dashboards",
    "More automation",
    "Not sure"
];

export default function FeedbackPage() {
    const [friction, setFriction] = useState<boolean | null>(null);
    const [frictionText, setFrictionText] = useState("");
    const [missingFeature, setMissingFeature] = useState("");
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (friction === null || !missingFeature) {
            alert("Please answer the required questions.");
            return;
        }

        setStatus("loading");
        try {
            const { error } = await supabase
                .from('user_feedback')
                .insert({
                    friction,
                    friction_text: frictionText,
                    missing_feature: missingFeature,
                    email: email || null
                });

            if (error) throw error;
            setStatus("success");
            
            // Redirect to homepage after small delay to show success (optional) or immediate
            setTimeout(() => {
                router.push('/');
            }, 1500);
        } catch (err) {
            console.error("Feedback error:", err);
            setStatus("error");
        }
    };

    if (status === "success") {
        return (
            <main className="min-h-screen bg-[#F6F6F6] flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-[48px] p-12 text-center shadow-sm border border-[#F0F0F0]">
                    <div className="text-[48px] mb-4">🙌</div>
                    <h1 className="font-manrope font-extrabold text-[32px] tracking-[-1.5px] text-[#2F2F2F] mb-4">
                        Thank you!
                    </h1>
                    <p className="font-inter text-[16px] text-[#5B5B5B] mb-8">
                        Your feedback helps us build a better Q.Labs for everyone.
                    </p>
                    <Link href="/" className="inline-block bg-[#D1FC00] text-black font-inter font-bold px-8 py-4 rounded-full hover:bg-[#DDFF00] transition-colors">
                        Back to Home
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#F6F6F6] py-20 px-6">
            <div className="max-w-2xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 mb-8 text-[#A8A29E] hover:text-[#2F2F2F] font-inter font-bold text-[12px] uppercase tracking-[1.2px]">
                    ← Back to Home
                </Link>
                
                <h1 className="font-manrope font-extrabold text-[48px] tracking-[-2.4px] text-[#2F2F2F] mb-2">
                    Help us improve
                </h1>
                <p className="font-inter text-[18px] text-[#5B5B5B] mb-12">
                    Takes 10 seconds. No jargon. No long forms.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-12">
                    {/* Question 1: Friction */}
                    <div className="flex flex-col gap-6">
                        <label className="font-manrope font-bold text-[24px] tracking-[-0.8px] text-[#2F2F2F]">
                            1. Was anything confusing or hard to use?
                        </label>
                        <div className="flex gap-4">
                            {[true, false].map((val) => (
                                <button
                                    key={val ? "yes" : "no"}
                                    type="button"
                                    onClick={() => setFriction(val)}
                                    className={`flex-1 py-4 rounded-2xl border font-inter font-bold text-[16px] transition-all
                                        ${friction === val 
                                            ? "bg-[#D1FC00] border-[#D1FC00] text-black shadow-sm" 
                                            : "bg-white border-[#E7E5E4] text-[#5B5B5B] hover:border-[#D1FC00]"}`}
                                >
                                    {val ? "Yes" : "No"}
                                </button>
                            ))}
                        </div>
                        {friction === true && (
                            <textarea
                                value={frictionText}
                                onChange={(e) => setFrictionText(e.target.value)}
                                placeholder="What felt confusing?"
                                className="w-full p-6 bg-white border border-[#E7E5E4] rounded-2xl font-inter text-[16px] focus:outline-none focus:ring-2 focus:ring-[#D1FC00]/30 min-h-[120px]"
                            />
                        )}
                    </div>

                    {/* Question 2: Value Gap */}
                    <div className="flex flex-col gap-6">
                        <label className="font-manrope font-bold text-[24px] tracking-[-0.8px] text-[#2F2F2F]">
                            2. What&apos;s missing for you?
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {MISSING_OPTIONS.map((opt) => (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => setMissingFeature(opt)}
                                    className={`py-4 px-6 text-left rounded-2xl border font-inter font-medium text-[15px] transition-all
                                        ${missingFeature === opt 
                                            ? "bg-[#D1FC00] border-[#D1FC00] text-black shadow-sm" 
                                            : "bg-white border-[#E7E5E4] text-[#5B5B5B] hover:border-[#D1FC00]"}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Optional Email */}
                    <div className="flex flex-col gap-4 pt-6 border-t border-[#E7E5E4]">
                        <label className="font-inter font-bold text-[14px] text-[#2F2F2F]">
                            Drop your email for future updates (Optional)
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full px-6 py-4 bg-white border border-[#E7E5E4] rounded-2xl font-inter text-[16px] focus:outline-none focus:ring-2 focus:ring-[#D1FC00]/30"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={status === "loading" || friction === null || !missingFeature}
                        className={`py-5 px-10 rounded-full font-inter font-black text-[18px] transition-all
                            ${status === "loading" || friction === null || !missingFeature
                                ? "bg-[#E7E5E4] text-[#A8A29E] cursor-not-allowed"
                                : "bg-[#D1FC00] text-black hover:bg-[#DDFF00] shadow-lg shadow-[#D1FC00]/20"}`}
                    >
                        {status === "loading" ? "Submitting..." : "Send Feedback"}
                    </button>
                    
                    {status === "error" && (
                        <p className="text-red-500 text-center font-inter font-medium">
                            Oops! Something went wrong. Please try again.
                        </p>
                    )}
                </form>
            </div>
        </main>
    );
}
