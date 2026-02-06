
import { notFound } from "next/navigation";
import DatasetDetailClient from "./DatasetDetailClient"; // Client component for interactivity
import { MOCK_DATASETS } from "@/lib/mockData";

interface PageProps {
    params: Promise<{ slug: string }>;
}

import { Suspense } from "react";

export default async function DatasetDetailPage(props: PageProps) {
    const params = await props.params;
    const dataset = MOCK_DATASETS.find((d) => d.slug === params.slug);

    if (!dataset) {
        return notFound();
    }

    // Pass data to client component for interactivity (column selection, etc)
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading dataset details...</div>}>
            <DatasetDetailClient dataset={dataset} />
        </Suspense>
    );
}
