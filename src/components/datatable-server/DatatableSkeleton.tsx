interface DataTableSkeletonProps {
  columnCount?: number;
  rowCount?: number;
}

export function DataTableSkeleton({ columnCount = 5, rowCount = 8 }: DataTableSkeletonProps) {
  const widths = ["w-20", "w-28", "w-24", "w-16", "w-32"];
  return (
    <table className="w-full text-sm">
      <tbody className="divide-y divide-gray-100">
        {Array(rowCount).fill(0).map((_, rowIndex) => (
          <tr key={rowIndex} className="animate-pulse">
            {Array(columnCount).fill(0).map((_, colIndex) => (
              <td key={colIndex} className="px-4 py-3">
                <div className={`h-3.5 rounded-full bg-gray-200 ${widths[colIndex % widths.length]}`} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
