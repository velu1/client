import { ColumnDef } from "@tanstack/react-table";
import { Part } from "../../mock/dummyData";
import { Trash2, PlusCircle } from "lucide-react";
import deleteImg from "../../assets/newIcons/delete.svg";
import pen from "../../assets/newIcons/inverdSystem/pen.svg";
import { toast } from "react-fox-toast";
import { deletePartNumber } from "../../api/administration/template";

interface TemplateColumnOptions {
  pageIndex: number;
  pageSize: number;
  onOpenDialog: (template: Part) => void;
  handleDeleteClick?: (row: Part) => void;
  handleEditClick?: (row: Part) => void;
  refreshData?: () => void;
}

export const templateColumns = ({
  pageIndex,
  pageSize,
  onOpenDialog,
  handleDeleteClick,
  handleEditClick,
  refreshData,
}: TemplateColumnOptions): ColumnDef<Part>[] => [
  {
    header: "#",
    accessorKey: "_id",
    enableSorting: false,
    cell: ({ row }) => pageIndex * pageSize + row.index + 1,
  },
  {
    accessorKey: "manufacturer",
    header: "Manufacturer",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return <span className="font-semibold">{value}</span>;
    },
  },
  {
    accessorKey: "templateName",
    header: "Template Name",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return <div className="flex flex-wrap gap-1">{value}</div>;
    },
  },
  {
    accessorKey: "partNumber",
    header: "Part Number",
    cell: ({ getValue, row }) => {
      const values = getValue() as string[];
      const template = row.original;

      const handleDeletePartNumber = async (partNumber: string) => {
        try {
          await deletePartNumber(partNumber);
          refreshData?.();
          toast.success("Part number deleted successfully");
        } catch (error: any) {
          toast.error(error?.response?.data?.message);
          console.error("Delete error", error);
        }
      };

      return (
        <div className="flex flex-wrap gap-1 items-center">
          {values?.map((val, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1 bg-sidebar text-xs text-black px-2 py-1 rounded-full"
            >
              {val}
              <Trash2
                className="w-3 h-3 text-[#CFA77B] cursor-pointer"
                onClick={() => handleDeletePartNumber(val)}
              />
            </div>
          ))}
          <PlusCircle
            className="w-4 h-4 text-[#CFA77B] cursor-pointer"
            onClick={() => onOpenDialog(template)}
          />
        </div>
      );
    },
  },

  {
    id: "actions",
    accessorKey: "_id",
    enableSorting: false,
    header: "Actions",
    cell: ({ row }) => {
      const original = row.original;

      return (
        <div className="flex items-center gap-2  min-w-[100px]">
          <button
            className="text-primary hover:text-primary/80 cursor-pointer"
            aria-label="Edit"
            onClick={() => handleEditClick?.(original)}
          >
            <img src={pen} alt="Edit" className="h-4 w-4" />
          </button>
          {original.partNumber.length <= 0 && (
            <button
              className="cursor-pointer"
              aria-label="Delete"
              onClick={() => handleDeleteClick?.(original)}
            >
              <img src={deleteImg} alt="Delete" className="h-4 w-4" />
            </button>
          )}
        </div>
      );
    },
  },
];
