"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import SignupModal from "./SignupModal";

interface ExportButtonProps {
  slug?: string;
  fields?: string[];
  startDate?: string;
  endDate?: string;
}

export default function ExportButton({ slug, fields = [], startDate, endDate }: ExportButtonProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleExport = async () => {
    // Check if user is authenticated
    let session = null;
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        console.log("No active session found:", error);
        setIsModalOpen(true);
        return;
      }
      session = data.session;
      console.log("Exporting for user:", session.user.email);
    } catch (err) {
      console.error("Auth check failed:", err);
      setIsModalOpen(true);
      return;
    }

    setLoading(true);

    try {
      // Construct Export URL Query Params
      const params = new URLSearchParams(searchParams.toString());
      if (slug) params.set("slug", slug);
      params.set("format", "csv");
      if (fields.length > 0) {
        params.set("fields", fields.join(","));
      }
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      // Fetch with Authorization Header
      const response = await fetch(`/api/datasets?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (response.status === 401) {
        console.warn("Session expired or unauthorized, opening modal...");
        setIsModalOpen(true);
        return;
      }

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      // Handle File Download from Blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${slug || "dataset"}.csv`);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export dataset. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleExport}
        disabled={loading}
        className={`
          w-full px-6 py-3.5 rounded-xl font-black text-sm uppercase tracking-wide transition-all shadow-md
          ${loading 
            ? "bg-slate-700 text-slate-400 cursor-wait" 
            : "bg-brand-emerald text-slate-950 hover:bg-brand-emerald-hover hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(204,255,0,0.3)]"}
        `}
      >
        <div className="flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          {loading ? "Preparing..." : "Download CSV (Free up to 1000 rows)"}
        </div>
      </button>

      <SignupModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
