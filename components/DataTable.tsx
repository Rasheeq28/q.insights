export interface DataTableProps {
  data: any[];
  fields: string[];
}

export default function DataTable({ data, fields }: DataTableProps) {
  if (!data || data.length === 0) {
    return <div className="text-gray-500 italic p-4">No preview data available.</div>;
  }

  return (
    <div className="overflow-x-auto border border-white/5 rounded-xl shadow-2xl">
      <table className="min-w-full divide-y divide-white/5">
        <thead className="bg-slate-900/80 backdrop-blur-sm">
          <tr>
            {fields.map((field) => (
              <th
                key={field}
                scope="col"
                className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]"
              >
                {field}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 bg-slate-900/20">
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-brand-emerald/5 transition-colors group">
              {fields.map((field) => (
                <td key={`${idx}-${field}`} className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 group-hover:text-white transition-colors">
                  {row[field] !== undefined ? (
                    typeof row[field] === 'number' ? (
                      <span className="font-mono tabular-nums">{row[field]}</span>
                    ) : String(row[field])
                  ) : "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
