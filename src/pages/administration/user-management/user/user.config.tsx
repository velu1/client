import { ColumnDef } from "@tanstack/react-table";
import deleteImg from "../../../../assets/newIcons/delete.svg";
import pen from "../../../../assets/newIcons/inverdSystem/pen.svg";
import { styled } from "@mui/material/styles";
import { Switch } from "@mui/material";

// eslint-disable-next-line @typescript-eslint/no-explicit-any

const CustomSwitch = styled(Switch)(({ theme }) => ({
  width: 30,
  height: 15,
  marginLeft: 10,
  padding: 0,
  display: "flex",
  "&:active": {
    "& .MuiSwitch-thumb": {
      width: 10,
    },
    "& .MuiSwitch-switchBase.Mui-checked": {
      transform: "translateX(13px)",
    },
  },
  "& .MuiSwitch-switchBase": {
    padding: 3,
    "&.Mui-checked": {
      transform: "translateX(13px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "#c09966",
        opacity: 1,
        border: "1px solid #c09966",
      },
    },
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "0 0 0 1px #ccc",
    width: 10,
    height: 10,
    borderRadius: "50%",
    backgroundColor: "white",
    border: "2px solid #c09966",
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: "transparent",
    border: "1px solid #c09966",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
  },
}));

export const userTableColumns = (
  handleEditClick?: (user: any) => void,
  handleDeleteClick?: (user: any) => void,
  handleSwitchClick?: (user: any) => void,
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
    accessorKey: "firstName",
    header: "First Name",
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
  },
  {
    accessorKey: "email",
    header: "Email ID",
    accessorFn: (row: any) => row.email || "",
  },
  {
    accessorKey: "role.name",
    header: "Role",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    id: "actions",
    enableSorting: false,
    accessorKey: "id",
    size: 120,
    header: "Action",
    cell: ({ row }) => {
      const original = row.original;
      const isActive = original.status === "Active";

      return (
        <div className="flex items-center gap-2 min-w-[100px]">
          <button
            className="w-6 h-6 flex items-center justify-center text-primary hover:text-primary/80 cursor-pointer"
            aria-label="Edit role"
            onClick={() => handleEditClick?.(original)}
          >
            <img src={pen} alt="Edit" className="w-4 h-4 object-contain" />
          </button>
          <button
            className="w-6 h-6 flex items-center justify-center cursor-pointer"
            aria-label="Delete role"
            onClick={() => handleDeleteClick?.(original)}
          >
            <img
              src={deleteImg}
              alt="Delete"
              className="w-4 h-4 object-contain"
            />
          </button>
          <CustomSwitch
            checked={isActive}
            onChange={() => handleSwitchClick?.(original)}
            aria-label="Toggle user status"
          />
        </div>
      );
    },
  },
];
