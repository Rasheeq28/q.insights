"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

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

  const handleExport = async () => {
    // Check if user is authenticated
    let session = null;
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        console.log("No active session found:", error);
        router.push("/signin");
        return;
      }
      session = data.session;
      console.log("Exporting for user:", session.user.email);
    } catch (err) {
      console.error("Auth check failed:", err);
      router.push("/signin");
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
        console.warn("Session expired or unauthorized, redirecting to signin...");
        router.push("/signin");
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
    <button
      onClick={handleExport}
      disabled={loading}
      className={`
         w-full sm:w-auto px-8 py-3 rounded-lg font-semibold text-white shadow-md transition-all
         ${loading ? "bg-blue-400 cursor-wait" : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5"}
      `}
    >
      {loading ? "Preparing Download..." : "Export CSV"}
    </button>
  );
}
