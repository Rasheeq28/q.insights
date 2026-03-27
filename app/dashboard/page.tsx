"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ApiToken = {
  id: string;
  dataset_slug: string;
  token_string: string;
  filters: any;
  status: "active" | "revoked";
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [activeTab, setActiveTab] = useState<"active" | "revoked">("active");
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessionAndTokens = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        router.push("/signin");
        return;
      }
      
      setUserEmail(session.user.email ?? null);

      const { data, error } = await supabase
        .from("api_tokens")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setTokens(data as ApiToken[]);
      }
      
      setLoading(false);
    };

    fetchSessionAndTokens();
  }, [router]);

  const handleRevoke = async (id: string) => {
    const { error } = await supabase
      .from("api_tokens")
      .update({ status: "revoked" })
      .eq("id", id);

    if (!error) {
      setTokens(tokens.map(t => t.id === id ? { ...t, status: "revoked" } : t));
    } else {
      console.error("Failed to revoke token:", error);
      alert("Failed to revoke token. Please try again.");
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const getDisplayUrl = (token: ApiToken) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://qlabs.co';
    const baseUrl = `${origin}/api/datasets/${token.dataset_slug}?token=${token.token_string}`;
    const platform = token.filters?.platform || "browser"; // Default to browser CSV 
    
    if (platform === "sheets") {
      return `=IMPORTDATA("${baseUrl}")`;
    } else if (platform === "excel" || platform === "browser") {
      return baseUrl;
    } else if (platform === "postman") {
      return `${baseUrl}&format=json`;
    }
    return baseUrl;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-brand-slate-dark flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-emerald"></div>
      </main>
    );
  }

  const activeTokens = tokens.filter(t => t.status === "active");
  const revokedTokens = tokens.filter(t => t.status === "revoked");
  const displayedTokens = activeTab === "active" ? activeTokens : revokedTokens;

  return (
    <main className="min-h-screen bg-brand-slate-dark text-white pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">API Dashboard</h1>
            <p className="text-slate-400">Manage your active Google Sheets connections and API keys.</p>
          </div>
          <div className="flex items-center gap-4 bg-slate-800/50 px-5 py-3 rounded-xl border border-white/5">
            <div className="h-10 w-10 rounded-full bg-brand-emerald/20 flex items-center justify-center text-brand-emerald font-bold">
              {userEmail?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{userEmail}</p>
              <p className="text-xs text-brand-emerald font-semibold uppercase tracking-wider">Free Tier</p>
            </div>
          </div>
        </div>

        {/* Tokens List */}
        <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <div className="flex border-b border-white/5 bg-slate-800/30 px-6 pt-6 gap-6">
            <button
              onClick={() => setActiveTab("active")}
              className={`pb-4 text-sm font-bold transition-colors border-b-2 ${activeTab === "active" ? "border-brand-emerald text-brand-emerald" : "border-transparent text-slate-400 hover:text-white"}`}
            >
              Active Links ({activeTokens.length})
            </button>
            <button
              onClick={() => setActiveTab("revoked")}
              className={`pb-4 text-sm font-bold transition-colors border-b-2 ${activeTab === "revoked" ? "border-red-500 text-red-500" : "border-transparent text-slate-400 hover:text-white"}`}
            >
              Revoked Links ({revokedTokens.length})
            </button>
          </div>
          
          <div className="p-0">
            {displayedTokens.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <p>No {activeTab} API links found.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {displayedTokens.map((token) => {
                  const createdDate = new Date(token.created_at);
                  const expiryDate = new Date(createdDate);
                  expiryDate.setDate(expiryDate.getDate() + 30);
                  
                  return (
                    <div key={token.id} className="p-6 md:p-8 hover:bg-white/[0.02] transition-colors">
                      <div className="flex flex-col md:flex-row gap-6 justify-between">
                        <div className="space-y-4 flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-bold text-white capitalize">{token.dataset_slug.replace(/-/g, ' ')}</h3>
                            <span className="bg-brand-emerald/10 text-brand-emerald px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
                              {token.filters?.platform || "browser"}
                            </span>
                          </div>
                          
                          <div className="text-sm border border-white/10 bg-black/40 rounded-lg p-3 font-mono text-slate-400 break-all relative group pr-12">
                            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleCopy(getDisplayUrl(token))}
                                className="bg-slate-800 hover:bg-slate-700 text-white p-1.5 rounded border border-white/10"
                                title="Copy Formula"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                            </div>
                            {getDisplayUrl(token)}
                          </div>
                          
                          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500 font-medium">
                            <p>Created: <span className="text-slate-300">{createdDate.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span></p>
                            <p>Expires: <span className="text-amber-400">{expiryDate.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span></p>
                            
                            {token.filters && Object.keys(token.filters).length > 0 && (
                              <p className="border-l border-white/10 pl-6">
                                Filters: <span className="text-slate-300">{Object.keys(token.filters).filter(k => k !== 'platform').join(", ") || "None"}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {token.status === "active" && (
                          <div className="flex-shrink-0 flex items-start">
                            <button
                              onClick={() => handleRevoke(token.id)}
                              className="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-400 border border-red-500/20 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-colors"
                            >
                              Revoke
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
