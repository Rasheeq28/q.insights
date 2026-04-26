import { notFound } from "next/navigation";
import DatasetDetailClient from "./DatasetDetailClient"; // Client component for interactivity
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
    params: Promise<{ slug: string }>;
}

const DATASET_TABLE_MAP: Record<string, string> = {
  "dsex-prices-historical": "v_dsex_flat",
};

export default async function DatasetDetailPage(props: PageProps) {
    const params = await props.params;
    
    // Fetch specifically from Supabase
    const { data, error } = await supabase
        .from("datasets")
        .select("*")
        .eq("slug", params.slug)
        .single();

    if (error || !data) {
        return notFound();
    }

    const dbTableName = DATASET_TABLE_MAP[params.slug] || data.table_name || params.slug.replace(/-/g, "_");

    const { count } = await supabase.from(dbTableName).select('*', { count: 'exact', head: true });
    
    // Attempt rapid implicit scan of date tracking
    const { data: latestDateObj } = await supabase.from(dbTableName).select('date').order('date', { ascending: false }).limit(1).maybeSingle();
    
    let lastUpdatedFormatted = data.updated_at ? new Date(data.updated_at).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }) : "Live Update";
    if (latestDateObj && latestDateObj.date) {
        lastUpdatedFormatted = new Date(latestDateObj.date).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
    }

    // Fetch real preview data from the underlying table/view
    const { data: realPreviewData } = await supabase
        .from(dbTableName)
        .select('*')
        .order('date', { ascending: false })
        .limit(5);

    const dataset = {
        ...data,
        table_name: dbTableName,
        previewData: (realPreviewData && realPreviewData.length > 0) ? realPreviewData : data.preview_data,
        updatedAt: data.updated_at ? new Date(data.updated_at).toLocaleDateString() : "Live",
        totalRows: count || 0,
        lastUpdated: lastUpdatedFormatted
    };

    // Pass data to client component for interactivity (column selection, etc)
    return <DatasetDetailClient dataset={dataset as any} />;
}
