import { useEffect } from "react";
import { Skeleton } from "../ui/skeleton";

interface DataTableSkeletonProps {
  columnCount?: number;
  rowCount?: number;
}

export function DataTableSkeleton({
  columnCount = 5,
  rowCount = 10,
}: DataTableSkeletonProps) {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes shimmer {
        0% {
          background-position: -500px 0;
        }
        100% {
          background-position: 500px 0;
        }
      }

      .shimmer {
        background: linear-gradient(
          to right,
          #f3f3f3 4%,
          #e0e0e0 25%,
          #f3f3f3 36%
        );
        background-size: 1000px 100%;
        animation: shimmer 2.5s infinite linear;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="overflow-x-auto scrollbar-thin rounded-md">
      <table className="w-full h-[52vh] text-sm">
        <tbody>
          {Array(rowCount)
            .fill(0)
            .map((_, rowIndex) => (
              <tr
                key={rowIndex}
                className={`border-t border-gray-200 ${
                  rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                {Array(columnCount)
                  .fill(0)
                  .map((_, colIndex) => (
                    <td key={colIndex} className="px-4 py-2 whitespace-nowrap">
                      <Skeleton className="h-4 w-24 shimmer" />
                    </td>
                  ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
