export interface DataTableProps {
  data: any[];
  fields: string[];
}

export default function DataTable({ data, fields }: DataTableProps) {
  if (!data || data.length === 0) {
    return <div className="text-gray-500 italic p-4">No preview data available.</div>;
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {fields.map((field) => (
              <th
                key={field}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {field}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, idx) => (
            <tr key={idx}>
              {fields.map((field) => (
                <td key={`${idx}-${field}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row[field] !== undefined ? String(row[field]) : "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
