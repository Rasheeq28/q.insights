"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [tokens, setTokens] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const handleRevoke = async (tokenId: string) => {
        if (!confirm("Are you sure you want to revoke this connection? This will immediately stop data access for this URL.")) return;

        try {
            const { error } = await supabase
                .from("api_tokens")
                .update({ status: "revoked" })
                .eq("id", tokenId);

            if (error) throw error;

            // Update local state
            setTokens(tokens.map(t => t.id === tokenId ? { ...t, status: 'revoked' } : t));
        } catch (err) {
            console.error("Revoke error", err);
            alert("Failed to revoke connection. Please try again.");
        }
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/signup");
                return;
            } else {
                setUser(session.user);
            }

            try {
                // Fetch API tokens instead of dynamic column data
                const { data: apiTokens, error: tokenError } = await supabase
                    .from("api_tokens")
                    .select("*")
                    .eq("user_id", session.user.id)
                    .order("created_at", { ascending: false });
                
                if (apiTokens) {
                    setTokens(apiTokens);
                }
            } catch (err) {
                console.error("Dashboard fetch error", err);
            }

            setLoading(false);
        };

        fetchDashboardData();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-black/10 border-t-[#D1FC00] rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex">
            {/* Sidebar */}
            <aside className="w-[280px] bg-white border-r border-[#F0F0F0] h-screen sticky top-0 flex flex-col pt-8 pb-8 flex-shrink-0 z-40 hidden lg:flex">
                <div className="px-8 pb-10 border-b border-[#F0F0F0]">
                    <Link href="/" className="flex items-center gap-[12px]">
                        <img src="/logo.png" alt="Q.Labs Logo" className="h-8 w-auto object-contain" />
                    </Link>
                </div>
                
                <div className="flex flex-col gap-2 mt-8 px-4 flex-1">
                    <Link href="/" className={`px-4 py-3 rounded-[16px] font-inter font-bold text-[14px] flex items-center gap-3 transition-colors ${pathname === '/' ? 'bg-[#D1FC00] text-[#1C1917]' : 'text-[#5B5B5B] hover:bg-[#F6F6F6] hover:text-[#1C1917]'}`}>
                        Home
                    </Link>
                    <Link href="/datasets" className={`px-4 py-3 rounded-[16px] font-inter font-bold text-[14px] flex items-center gap-3 transition-colors ${pathname === '/datasets' ? 'bg-[#D1FC00] text-[#1C1917]' : 'text-[#5B5B5B] hover:bg-[#F6F6F6] hover:text-[#1C1917]'}`}>
                        Datasets
                    </Link>
                    <Link href="/dashboard" className={`px-4 py-3 rounded-[16px] font-inter font-bold text-[14px] flex items-center gap-3 transition-colors ${pathname === '/dashboard' ? 'bg-[#D1FC00] text-[#1C1917]' : 'text-[#5B5B5B] hover:bg-[#F6F6F6] hover:text-[#1C1917]'}`}>
                        Dashboard
                    </Link>
                </div>

                <div className="px-8 mt-auto flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#E7E5E4] rounded-full overflow-hidden flex items-center justify-center">
                        <span className="font-manrope font-bold text-[14px] text-[#2F2F2F]">
                            {user.email?.[0].toUpperCase()}
                        </span>
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="font-inter font-bold text-[13px] text-[#1C1917] truncate">{user.email}</span>
                        <button onClick={() => supabase.auth.signOut()} className="font-inter text-[11px] text-[#A8A29E] text-left hover:text-[#1C1917]">Sign out</button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 max-w-[1200px] px-6 lg:px-16 pt-32 lg:pt-16 pb-24 mx-auto w-full">
                
                {/* Header overview */}
                <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-12">
                    <div className="flex flex-col gap-2">
                        <div className="font-inter font-bold text-[11px] uppercase tracking-[1.5px] text-[#A8A29E] mb-2">
                            OVERVIEW / CONNECTIONS
                        </div>
                        <h1 className="font-manrope font-extrabold text-[40px] md:text-[48px] leading-[1.1] tracking-[-1.5px] text-[#1C1917]">
                            Your Active Connections
                        </h1>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="font-inter text-[14px] text-[#5B5B5B]">Manage your created connections and statuses.</span>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Link href="/datasets" className="bg-[#D1FC00] text-[#1C1917] font-inter font-bold text-[14px] px-6 py-3 rounded-full hover:bg-[#C5ED00] transition-colors flex items-center gap-2 shadow-sm">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                            Create Connection
                        </Link>
                    </div>
                </div>

                {/* Tokens Table */}
                <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-[0_4px_32px_-12px_rgba(0,0,0,0.05)] border border-[#F0F0F0] flex flex-col relative overflow-hidden">
                    {tokens.length === 0 ? (
                        <div className="text-center py-10 flex flex-col items-center">
                            <div className="w-16 h-16 bg-[#F6F6F6] rounded-full flex items-center justify-center mb-6">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A8A29E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                            </div>
                            <h3 className="font-inter font-bold text-[18px] text-[#1C1917] mb-2">No active connections.</h3>
                            <p className="font-inter text-[15px] text-[#5B5B5B] mb-6">You haven't requested any API tokens yet.</p>
                            <Link href="/datasets" className="font-inter font-bold text-[14px] text-[#1C1917] underline decoration-[#D1FC00] decoration-2 underline-offset-4">Browse Datasets</Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto w-full z-10">
                            <table className="w-full text-left font-inter border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="text-[#A8A29E] text-[11px] uppercase tracking-[1.5px] border-b border-[#F0F0F0]">
                                        <th className="pb-4 font-bold px-4 first:pl-0">Dataset</th>
                                        <th className="pb-4 font-bold px-4">Connection</th>
                                        <th className="pb-4 font-bold px-4">Status</th>
                                        <th className="pb-4 font-bold px-4">Creation Date</th>
                                        <th className="pb-4 font-bold px-4">Expiry Date</th>
                                        <th className="pb-4 font-bold px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tokens.map((token) => {
                                        const urlString = `${window.location.origin}/api/datasets/${token.dataset_slug}?token=${token.token_string || token.token}`;
                                        
                                        return (
                                        <tr key={token.id} className="border-b border-[#F0F0F0]/50 hover:bg-[#FAFAFA] transition-colors last:border-0">
                                            <td className="py-5 px-4 font-bold text-[#1C1917] capitalize first:pl-0">{token.dataset_slug?.replace(/-/g, ' ')}</td>
                                            <td className="py-5 px-4">
                                                <div className="flex items-center gap-3">
                                                    <code className="text-[13px] text-[#5B5B5B] font-mono bg-[#F6F6F6] px-2 py-1 rounded max-w-[200px] truncate" title={urlString}>
                                                        {urlString}
                                                    </code>
                                                    <button 
                                                        onClick={() => navigator.clipboard.writeText(urlString)}
                                                        className="text-[#A8A29E] hover:text-[#1C1917] transition-colors p-1"
                                                        title="Copy URL"
                                                    >
                                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="py-5 px-4">
                                                <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[1px] ${token.status === 'active' ? 'bg-[#FAFFD1] text-[#516200]' : 'bg-[#F6F6F6] text-[#A8A29E]'}`}>
                                                    {token.status}
                                                </span>
                                            </td>
                                            <td className="py-5 px-4 text-[14px] text-[#5B5B5B]">
                                                {new Date(token.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-5 px-4 text-[14px] text-[#5B5B5B]">
                                                {new Date(new Date(token.created_at).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                            </td>
                                            <td className="py-5 px-4 text-right">
                                                {token.status === 'active' && (
                                                    <button 
                                                        onClick={() => handleRevoke(token.id)}
                                                        className="text-red-500 hover:text-red-700 font-inter font-bold text-[12px] uppercase tracking-[1px] transition-colors"
                                                    >
                                                        Revoke
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    )})}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}
