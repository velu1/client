import { ColumnDef } from "@tanstack/react-table";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../../components/ui/hover-card";
import { PhoneIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const adminTableColumns = (): ColumnDef<any>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const navigate = useNavigate();
      return (
        <HoverCard>
          <HoverCardTrigger asChild>
            <span
              onClick={() => {
                if (!row.original.isYou) {
                  navigate(`/admins/${row.original._id}`);
                }
              }}
            >
              {row.original.name} {row.original.isYou && "(You)"}
            </span>
          </HoverCardTrigger>
          <HoverCardContent className="w-fit px-5 py-1 ml-24">
            <div className="flex items-center gap-2">
              <PhoneIcon className="h-4 w-4 text-primary mr-2" />
              <span className="text-primary">
                {`+${row.original.countryCode}` + " " + row.original.phone}
              </span>
            </div>
          </HoverCardContent>
        </HoverCard>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      // Return empty cell if this is the current user
      if (row.original.isYou) {
        return <div></div>;
      }
      return row.original.status;
    },
  },
];
