import { ColumnDef } from "@tanstack/react-table";
import deleteImg from "../../../../assets/newIcons/delete.svg";
import pen from "../../../../assets/newIcons/inverdSystem/pen.svg";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const roleTableColumns = (
  handleEditClick?: (role: any) => void,
  handleDeleteClick?: (role: any) => void,
  pagination?: { pageIndex: number; pageSize: number }
): ColumnDef<any>[] => [
  {
    header: "#",
    accessorKey: "id",
    enableSorting:false,
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
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "time",
    header: "Time",
  },
  {
    id: "actions",
    accessorKey: "id",
    header: "Actions",
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
