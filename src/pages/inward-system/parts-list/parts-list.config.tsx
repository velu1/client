import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "../../../components/ui/checkbox";
import { Part } from "../../../mock/dummyData";
import { formatIndianNumber } from "../../../utils/formatCurrency";

export const partsTableColumns = (
  onRowSelect?: (row: Part) => void,
  deselectOtherRows?: (rowId: string) => void
): ColumnDef<Part>[] => [
  {
    id: "select",
    accessorKey: "id",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => {
          // If already selected, just toggle off
          if (row.getIsSelected() && !value) {
            row.toggleSelected(false);
            if (onRowSelect) {
              onRowSelect(null as any);
            }
            return;
          }

          // If selecting new row, deselect all others first
          if (value && deselectOtherRows) {
            deselectOtherRows(row.id);
          }

          // Then select this row
          row.toggleSelected(!!value);

          // Notify parent component
          if (value && onRowSelect) {
            onRowSelect(row.original);
          }
        }}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: "uniqueId",
    header: "Unique ID",
  },
  {
    accessorKey: "partNumber",
    header: "Part Number",
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
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
    accessorKey: "manufacturer",
    header: "Manufacturer",
  },
  {
    accessorKey: "receiptNumber",
    header: "Receipt Number",
  },
  {
    accessorKey: "lotNumber",
    header: "Lot Number",
  },
  {
    accessorKey: "dateOfReceipt",
    header: "Date of Receipt",
    cell: ({ getValue }) => {
      const dateValue = getValue() as string;
      if (!dateValue) return "N/A";
      try {
        const date = new Date(dateValue);
        return date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }); // DD/MM/YYYY format
      } catch (error) {
        return dateValue;
      }
    },
  },
  {
    accessorKey: "mfgDate",
    header: "Date of Manufacturer",
    cell: ({ getValue }) => {
      const dateValue = getValue() as string;
      if (!dateValue) return "N/A";
      try {
        const date = new Date(dateValue);
        return date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }); // DD/MM/YYYY format
      } catch (error) {
        return dateValue;
      }
    },
  },
  {
    accessorKey: "partLocation",
    header: "Part Location",
  },
  {
    accessorKey: "internalPartNo",
    header: "Internal PN",
  },
  {
    accessorKey: "description",
    header: "Part Description",
  },
];
