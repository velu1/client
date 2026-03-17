import { ColumnDef } from "@tanstack/react-table";
import { PartsHistoryItem } from "../../../../api/reports/parts-history";
import pen from "../../../../assets/newIcons/inverdSystem/pen.svg";
import { formatIndianNumber } from "../../../../utils/formatCurrency";
/**
 * Table column definitions for Parts History
 * @returns Array of column definitions for the DataTable component
 */
export const partsHistoryColumns = (
  onEditClick?: (row: PartsHistoryItem) => void,
  pagination?: { pageIndex: number; pageSize: number }
): ColumnDef<PartsHistoryItem>[] => [
  {
    header: "#",
    accessorKey: "id",
    enableSorting: false,
    cell: ({ row }) => {
      if (pagination) {
        const { pageIndex, pageSize } = pagination;
        return pageIndex * pageSize + row.index + 1;
      }
      return row.index + 1;
    },
  },
  {
    header: "Internal Part Number",
    accessorKey: "internalPartNo",
  },
  {
    header: "Part Number",
    accessorKey: "partNumber",
  },
  {
    header: "Unique ID",
    accessorKey: "uniqueId",
  },
  {
    header: "Quantity",
    accessorKey: "quantity",
    sortDescFirst: false,
    sortingFn: (rowA, rowB) => {
      const a = rowA.getValue("quantity") as number;
      const b = rowB.getValue("quantity") as number;
      return a > b ? 1 : a < b ? -1 : 0;
    },
    cell: ({ row }) => {
      const value = row.getValue("quantity");
      return typeof value === "number" ? value.toLocaleString() : value;
    },
  },
  {
    header: "Lot Number",
    accessorKey: "lotNumber",
    sortDescFirst: false,
    sortingFn: (rowA, rowB) => {
      const a = rowA.getValue("lotNumber") as string[];
      const b = rowB.getValue("lotNumber") as string[];
      // Compare the first lot number in the array, or empty string if no lot numbers
      const aValue = Array.isArray(a) && a.length > 0 ? a[0] : "";
      const bValue = Array.isArray(b) && b.length > 0 ? b[0] : "";
      return aValue.localeCompare(bValue);
    },
    cell: ({ row }) => {
      const value = row.getValue("lotNumber");
      // Handle array of lot numbers
      if (Array.isArray(value)) {
        return value.join(", ");
      }
      return value || "N/A";
    },
  },
  {
    header: "Receipt Number",
    accessorKey: "receiptNumber", // Changed from receiptNumber to match new data structure
  },
  {
    header: "Manufacturer",
    accessorKey: "manufacturer", // Changed from manufacturer to maker to match new data structure
  },
  {
    header: "Return Quantity",
    accessorKey: "updatedQuantity",
    sortDescFirst: false,
    sortingFn: (rowA, rowB) => {
      const aRow = rowA.original;
      const bRow = rowB.original;

      // If neither is returned, they're equal
      if (!aRow.isReturn && !bRow.isReturn) return 0;
      // If only one is returned, non-returned (N/A) comes first in ascending order
      if (!aRow.isReturn) return -1;
      if (!bRow.isReturn) return 1;

      // If both are returned, compare their quantities
      const a = aRow.updatedQuantity as number;
      const b = bRow.updatedQuantity as number;
      return a > b ? 1 : a < b ? -1 : 0;
    },
    cell: ({ row }) => {
      // Check if the item is returned
      const isReturn = row.original.isReturn;
      // Show return quantity only if item is returned, otherwise show N/A
      return isReturn && row.original.updatedQuantity
        ? formatIndianNumber(row.original.updatedQuantity)
        : "N/A";
    },
  },
  {
    header: () => (
      <div className="flex items-center justify-center ">
        <button
          className="p-1 hover:bg-gray-100 rounded"
          aria-label="Add new"
          onClick={() => onEditClick?.({} as PartsHistoryItem)}
        >
          <img src={pen} alt="Add" className="h-4 w-4" />
        </button>{" "}
      </div>
    ),
    accessorKey: "action",
    enableSorting: false,
    cell: () => null,
  },
];
