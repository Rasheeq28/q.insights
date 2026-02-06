"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Handle the exchange of the auth code for a session
        const handleAuthCallback = async () => {
            const url = new URL(window.location.href);
            const code = url.searchParams.get("code");
            const next = url.searchParams.get("next") || "/datasets";
            const errorDescription = url.searchParams.get("error_description");

            if (errorDescription) {
                setError(errorDescription);
                setTimeout(() => router.push(`/signin?error=${encodeURIComponent(errorDescription)}`), 3000);
                return;
            }

            try {
                if (code) {
                    // PKCE Flow: Exchange code for session
                    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
                    if (error) throw error;

                    if (data?.session?.user) {
                        router.push(next);
                        return; // Done
                    }
                }

                // Implicit Flow / Existing Session Check
                // If there was no code, or if we want to double check session existence
                const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

                if (sessionData?.session?.user) {
                    // We have a valid session (maybe from hash or persisted)
                    router.push(next);
                    return;
                }

                if (sessionError) throw sessionError;

                // If we got here, we have no code and no session
                console.warn("No session or code found in callback");
                router.push("/signin?error=No session found");

            } catch (err: any) {
                console.error("Auth callback error:", err);
                setError(err.message || "Authentication failed");
                setTimeout(() => router.push(`/signin?error=${encodeURIComponent(err.message)}`), 3000);
            }
        };

        handleAuthCallback();
    }, [router]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-red-600 mb-2">Sign In Failed</h2>
                    <p className="text-gray-600">{error}</p>
                    <p className="text-sm text-gray-500 mt-4">Redirecting you to sign in...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Verifying your login...</h2>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
        </div>
    );
}
