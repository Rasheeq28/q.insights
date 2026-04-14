export default function DataTable({ data, fields }: { data: any[]; fields: string[] }) {
    if (!data || data.length === 0) return <div className="p-8 text-center text-[#A8A29E] font-inter">No data available</div>;

    return (
        <table className="w-full text-left font-inter text-sm border-collapse">
            <thead>
                <tr className="bg-[#F1F1F1] border-b border-[#E7E5E4]">
                    {fields.map((field) => (
                        <th key={field} className="px-6 py-4 font-bold text-[#2F2F2F] uppercase text-[10px] tracking-wider whitespace-nowrap">
                            {field.replace(/_/g, " ")}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((row, index) => (
                    <tr key={index} className="border-b border-[#E7E5E4]/50 hover:bg-[#F6F6F6] transition-colors">
                        {fields.map((field) => (
                            <td key={field} className="px-6 py-4 text-[#5B5B5B] whitespace-nowrap max-w-[250px] truncate text-[13px]">
                                {typeof row[field] === 'object' ? JSON.stringify(row[field]) : String(row[field] || '-')}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
