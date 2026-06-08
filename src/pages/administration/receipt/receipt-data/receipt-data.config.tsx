import { ColumnDef } from "@tanstack/react-table";
import deleteImg from "../../../../assets/newIcons/delete.svg";
import pen from "../../../../assets/newIcons/inverdSystem/pen.svg";
// import { formatIndianNumber } from "../../../../utils/formatCurrency";
import { InvoiceDataItem } from "../../../../types/layout.types";

export const receiptDataTableColumns = (
  handleEditClick?: (item: InvoiceDataItem) => void,
  handleDeleteClick?: (item: InvoiceDataItem) => void,
  onAddClick?: () => void,
  pagination?: { pageIndex: number; pageSize: number }
): ColumnDef<InvoiceDataItem, unknown>[] => [
  {
    header: "#",
    accessorKey: "id",
    enableSorting: false,
    cell: ({ row }: any) => {
      if (pagination) {
        const { pageIndex, pageSize } = pagination;
        return pageIndex * pageSize + row.index + 1;
      }
      return row.index + 1;
    },
  },
  {
    header: "Receipt Number",
    accessorKey: "receiptNumber",
  },
  {
    header: "Receipt Date",
    accessorKey: "dateOfReceipt",
    cell: ({ getValue }) => {
      const value = getValue();

      // Type narrowing
      if (
        typeof value === "string" ||
        typeof value === "number" ||
        value instanceof Date
      ) {
        const date = new Date(value);

        if (isNaN(date.getTime())) return "-";

        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
      }

      return "-";
    },
  },
  {
    header: "Part Number",
    accessorKey: "partNumber",
  },

  {
    header: "Receipt Quantity",
    accessorKey: "receiptQuantity",
    // cell: ({ getValue }) => {
    //   const value = getValue();
    //   if (typeof value === "number" || typeof value === "string") {
    //     return formatIndianNumber(value);
    //   }
    //   return value;
    // },
  },
  {
    header: "Status",
    accessorKey: "status",
  },
  {
    header: () => (
      <div className="flex items-center justify-between gap-2">
        <span>Actions</span>
        <button
          className="p-1 hover:bg-gray-100 rounded"
          aria-label="Add new"
          onClick={onAddClick}
        >
          <img src={pen} alt="Add" className="h-4 w-4" />
        </button>
      </div>
    ),
    accessorKey: "id",
    enableSorting: false,
    cell: ({ row }) => {
      const original = row.original;
      return (
        <div className="flex items-center gap-2  min-w-[100px]">
          <button
            className="text-primary hover:text-primary/80 cursor-pointer"
            aria-label="Edit role"
            onClick={() => handleEditClick?.(original)}
          >
            <img src={pen} alt="Edit" className="h-4 w-4" />
          </button>
          <button
            className="cursor-pointer"
            aria-label="Delete role"
            onClick={() => handleDeleteClick?.(original)}
          >
            <img src={deleteImg} alt="Delete" className="h-4 w-4" />
          </button>
        </div>
      );
    },
  },
];
