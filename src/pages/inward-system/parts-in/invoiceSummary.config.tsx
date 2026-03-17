import { ColumnDef } from "@tanstack/react-table";

// Types for the row data (matches API response)
export interface InvoiceSummaryRow {
  _id: string;
  invoiceNumber: string;
  partNumber: string;
  invoiceQty: number;
  inwardQty: number;
  icr: string;
  createdAt: string;
  updatedAt: string;
}

export const invoiceSummaryTableColumns = (
  page: number = 1,
  pageSize: number = 10
): ColumnDef<InvoiceSummaryRow, any>[] => [
  {
    accessorKey: "_id",
    header: "#",
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
    accessorKey: "partNumber",
    header: "Part Number",
    cell: ({ getValue }) => <span>{getValue() as string}</span>,
  },
  {
    accessorKey: "receiptQuantity",
    header: "Invoice Qty",
    cell: ({ getValue }) => <span>{getValue() as number}</span>,
  },
  {
    accessorKey: "inwardQty",
    header: "Inward Qty",
    cell: ({ getValue }) => <span>{getValue() as number}</span>,
  },
  {
    accessorKey: "icr",
    header: "ICR",
    cell: ({ getValue }) => <span>{getValue() as string}</span>,
  },
  // {
  //   id: "actions",
  //   accessorKey: "_id",
  //   header: "Action",
  //   enableSorting: false,
  //   cell: ({ row }) => (
  //     <button
  //       className="flex items-center justify-center p-1 rounded hover:bg-primary/10 text-primary"
  //       aria-label="Print"
  //       onClick={() => handlePrintClick?.(row.original)}
  //       type="button"
  //     >
  //       <Printer size={16} />
  //     </button>
  //   ),
  //   size: 60,
  // },
];
