import { ColumnDef } from "@tanstack/react-table";
import pen from "../../../../assets/newIcons/inverdSystem/pen.svg";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const assignedRoleTableColumns = (
  handleEditClick?: (role: any) => void,
  pagination?: { pageIndex: number; pageSize: number }
): ColumnDef<any>[] => [
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
    accessorKey: "name",
    header: "Role Name",
  },
  {
    accessorKey: "inward",
    header: "Description",
  },
  {
    id: "actions",
    header: "Action",
    enableSorting: false,
    accessorKey: "id",
    cell: ({ row }) => {
      const rowData = row.original;
      return (
        <div className="flex items-center gap-2">
          <button
            className="text-primary hover:text-primary/80 cursor-pointer"
            aria-label="Edit assigned role"
            onClick={() => handleEditClick?.(rowData)}
          >
            <img src={pen} alt="Edit" className="h-4 w-4" />
          </button>
        </div>
      );
    },
  },
];
