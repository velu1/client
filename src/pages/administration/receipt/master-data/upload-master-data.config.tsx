import downloadIcon from "../../../../assets/newIcons/download.svg";
import deleteIcon from "../../../../assets/newIcons/delete.svg";
import { ColumnDef } from "@tanstack/react-table";

interface UploadMasterData {
  id?: string;
  name: string;
  templateName: string;
}

export const uploadMasterData = (
  handleDeleteClick?: (item: UploadMasterData) => void,
  handleExportClick?: (item: UploadMasterData) => void
): ColumnDef<UploadMasterData>[] => [
  {
    header: "Template Name",
    accessorKey: "templateName",
    cell: ({ row }) => row.original.templateName,
  },
  {
    header: () => <div className="text-center w-full">Download</div>,
    accessorKey: "download",
    enableSorting: false,
    cell: ({ row }) => (
      <img
        src={downloadIcon}
        alt="Download"
        className="h-4 w-4 cursor-pointer ml-6"
        onClick={() => handleExportClick?.(row.original)}
      />
    ),
  },
  {
    header: () => <div className="text-center w-full">Delete</div>,
    accessorKey: "delete",
    enableSorting: false,
    cell: ({ row }) => (
      <img
        src={deleteIcon}
        alt="Delete"
        className="h-4 w-4 cursor-pointer ml-4"
        onClick={() => handleDeleteClick?.(row.original)}
      />
    ),
  },
];
