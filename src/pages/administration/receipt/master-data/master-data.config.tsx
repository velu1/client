import { ColumnDef } from "@tanstack/react-table";
import deleteImg from "../../../../assets/newIcons/delete.svg";
import pen from "../../../../assets/newIcons/inverdSystem/pen.svg";
import { MasterDataItem } from "./index";
import { formatIndianNumber } from "../../../../utils/formatCurrency";

export const masterDataTableColumns = (
  handleEditClick?: (item: MasterDataItem) => void,
  handleDeleteClick?: (item: MasterDataItem) => void,
  onAddClick?: () => void,
  pagination?: { pageIndex: number; pageSize: number }
): ColumnDef<MasterDataItem>[] => [
  {
    header: "#",
    accessorKey: "id",
    enableSorting: false,
    cell: ({ row }: any) => {
      // Calculate the serial number based on the current page
      if (pagination) {
        const { pageIndex, pageSize } = pagination;
        return pageIndex * pageSize + row.index + 1;
      }
      // Fallback to simple index if pagination not provided
      return row.index + 1;
    },
  },
  {
    header: "Part Number",
    accessorKey: "partNumber",
  },
  {
    header: "Internal Part No",
    accessorKey: "internalPartNo",
  },
  {
    header: "Part Location",
    accessorKey: "partLocation",
  },
  {
    header: "Quantity",
    accessorKey: "quantity",
    cell: ({ getValue }) => {
      const value = getValue();
      // Ensure value is number or string before formatting
      if (typeof value === "number" || typeof value === "string") {
        return formatIndianNumber(value);
      }
      return value;
    },
  },
  {
    header: "Manufacturer",
    accessorKey: "manufacturer",
  },
  {
    header: "Description",
    accessorKey: "description",
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
