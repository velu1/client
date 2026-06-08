import { ColumnDef } from "@tanstack/react-table";
import { Printer } from "lucide-react";
import pen from "../../../assets/newIcons/inverdSystem/pen.svg";

// Types for the row data (can be extended as needed)
export interface PartsInRow {
  id: string;
  invoiceNumber: string;
  uniqueId: string;
  partNumber: string;
  quantity: number;
  lotNumber: string;
  internalPartNo: string;
  manufacturer?: string; // Manufacturer - needed for QR code but not shown in table
  manufactureDate?: string; // Manufacture date - needed for QR code but not shown in table
  // ...other fields if needed
}

export const summaryTableColumns = (
  handlePrintClick?: (row: PartsInRow) => void,
  onAddClick?: () => void,
  page: number = 1,
  pageSize: number = 10
): ColumnDef<PartsInRow, any>[] => [
  {
    accessorKey: "id",
    header: "#",
    enableSorting: false,
    cell: ({ row }) => pageSize * (page - 1) + row.index + 1,
    size: 40,
  },
  {
    accessorKey: "receiptNumber",
    header: "Receipt Number",
    cell: ({ getValue }) => (
      <span className="text-primary font-medium">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "uniqueId",
    header: "Unique ID",
    cell: ({ getValue }) => <span>{getValue() as string}</span>,
  },
  {
    accessorKey: "partNumber",
    header: "Part Number",
    cell: ({ getValue }) => <span>{getValue() as string}</span>,
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return <span>{value.toLocaleString()}</span>;
    },
  },
  {
    id: "actions",
    accessorKey: "id",
    header: () => (
      <div className="flex items-center justify-between gap-2">
        <span>Actions</span>
        <button
          className="p-1 cursor-pointer rounded"
          aria-label="Add new"
          onClick={onAddClick}
        >
          <img src={pen} alt="Add" className="h-4 w-4 ml-10" />
        </button>
      </div>
    ),
    enableSorting: false,
    cell: ({ row }) => (
      <button
        className="flex items-center justify-center p-1 rounded hover:bg-primary/10 text-primary"
        aria-label="Print"
        onClick={() => handlePrintClick?.(row.original)}
        type="button"
      >
        <Printer size={16} />
      </button>
    ),
    size: 60,
  },
];
