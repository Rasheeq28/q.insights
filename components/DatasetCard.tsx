import Link from "next/link";
import { Dataset } from "@/lib/types";

export function DatasetCard({ dataset }: { dataset: Dataset }) {
    return (
        <article className="bg-white rounded-[40px] border border-[#F0F0F0] p-[40px] flex flex-col justify-between items-start h-[360px] shadow-[0_4px_24px_-12px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_8px_32px_-16px_rgba(0,0,0,0.1)] hover:-translate-y-1">
            <div className="flex flex-col gap-4 w-full">
                <h3 className="font-manrope font-bold text-[22px] tracking-[-0.5px] text-[#1C1917] leading-tight">
                    {dataset.title}
                </h3>
                <p className="font-inter font-normal text-[15px] text-[#5B5B5B] leading-[26px]">
                    {dataset.description}
                </p>
            </div>

            <div className="mt-auto pt-[40px] w-full">
                <Link href={`/datasets/${dataset.slug}`} className="w-full h-[56px] bg-[#F9FEE6] rounded-[48px] flex items-center justify-center font-inter font-bold text-[15px] text-[#1C1917] hover:bg-[#D1FC00] transition-colors">
                    Try Dataset
                </Link>
            </div>
        </article>
    );
}

export default DatasetCard;
