import React from "react";
import { cn } from "../../lib/utils";
import { useState } from "react";
import DialogComponent from "../common/DialogComponent";
import { styled } from "@mui/material/styles";
import { Switch } from "@mui/material";
import AddUserDialog from "../user/AddUserDialog";
import RoleDialog from "../roles/RoleDialog";
import { AssignRolesDisplay } from "../../pages/administration/user-management/assigned-roles";
import { Checkbox } from "../../components/ui/checkbox";
import AddColumnsDialogLocal from "../common/AddColumnsDialogLocal";
// Generic field interface for the card items
export interface CardField {
  label: string;
  value: React.ReactNode;
}

export interface MobileCardProps {
  fields: CardField[];
  index?: number | string;
  onEdit?: () => void;
  showDeleteDialogExternally?: boolean;
  onDelete?: () => void;
  onDeleteClose?: () => void;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  image?: string;
  image2?: string;
  isActive?: boolean;
  handleDelete?: () => void;
  onToggleStatus?: () => void;
  addUser?: boolean;
  addRoles?: boolean;
  squareImg?: boolean;
  deleteImg?: boolean;
  switchActive?: boolean;
  selectedRole?: AssignRolesDisplay | null;
  onPermissionsUpdated?: () => void;
  isSelected?: boolean;
  onSelectChange?: (checked: boolean) => void;
  showColumnsDialog?: boolean;
  setShowColumnsDialog?: (value: boolean) => void;
  selectedRow?: any;
  setSelectedRow?: (row: any) => void;
  visibleColumns?: string[];
  setVisibleColumns?: (cols: string[]) => void;
  allColumns?: any[]; // Adjust type if you have a specific one
}

/**
 * Generic Mobile Card component
 * Displays a card with a header showing the index and fields in a label-value format
 */

const CustomSwitch = styled(Switch)(({ theme }) => ({
  width: 25,
  height: 15,

  padding: 0,
  display: "flex",
  "&:active": {
    "& .MuiSwitch-thumb": {
      width: 8,
    },
    "& .MuiSwitch-switchBase.Mui-checked": {
      transform: "translateX(8px)",
    },
  },
  "& .MuiSwitch-switchBase": {
    padding: 3,
    "&.Mui-checked": {
      transform: "translateX(9px)",
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
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: "white",
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: "#c09966",
    border: "1px solid #c09966",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
  },
}));

export function MobileCard({
  fields,
  index,
  image,
  image2,
  switchActive,
  onEdit,
  showDeleteDialogExternally,
  onDelete,
  onDeleteClose,
  addUser,
  addRoles,
  squareImg,
  deleteImg,
  className,
  headerClassName,
  bodyClassName,
  onSelectChange,
  onToggleStatus,
  isSelected,
  isActive,
  showColumnsDialog,
  setShowColumnsDialog,
  selectedRow,
  visibleColumns,
  setVisibleColumns,
  allColumns,
}: MobileCardProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteConfirm = () => {
    onDelete?.(); //
    setShowDeleteDialog(false);
  };

  const handleDeleteCancel = () => {
    onDeleteClose?.(); //
    setShowDeleteDialog(false);
  };

  return (
    <div
      className={cn(
        "rounded-md overflow-hidden shadow-sm mb-4 bg-white",
        className
      )}
    >
      {addUser && (
        <AddUserDialog open={showDialog} onClose={() => setShowDialog(false)} />
      )}

      {addRoles && (
        <RoleDialog open={showDialog} onClose={() => setShowDialog(false)} />
      )}

      {showDeleteDialog && (
        <DialogComponent
          isOpen={showDeleteDialog}
          onClose={handleDeleteCancel}
          title="Confirmation"
          subtitle="Are you sure you want to delete?"
          cancelButtonText="No"
          saveButtonText="Yes"
          onSave={handleDeleteConfirm}
        />
      )}

      {showColumnsDialog !== undefined &&
        setShowColumnsDialog !== undefined &&
        visibleColumns !== undefined &&
        setVisibleColumns !== undefined &&
        allColumns !== undefined && (
          <AddColumnsDialogLocal
            key={selectedRow?.id}
            isOpen={showColumnsDialog}
            onClose={() => setShowColumnsDialog(false)}
            columns={allColumns.filter((col) => col.accessorKey !== "id")}
            visibleColumns={visibleColumns}
            setVisibleColumns={setVisibleColumns}
            selectedRow={selectedRow}
          />
        )}

      {/* Card Header */}
      <div
        className={cn(
          "flex justify-between items-center p-3 bg-amber-50 text-amber-700",
          headerClassName
        )}
      >
        {squareImg && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={(value) => onSelectChange?.(!!value)}
            aria-label="Select row"
            className="border border-primary"
          />
        )}

        <div className="font-medium">
          {typeof index !== "undefined" && (
            <span className="mr-2">#{index}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {onEdit && (
            <button
              onClick={onEdit}
              className="text-primary hover:text-primary"
              aria-label="Edit item"
            >
              {!squareImg && (
                <img
                  src={image}
                  alt="image"
                  className="h-4 w-4 cursor-pointer"
                />
              )}
            </button>
          )}
          {deleteImg && (
            <img
              src={image2}
              alt="img"
              className="h-[3.5] w-3 cursor-pointer"
              onClick={() => {
                if (showDeleteDialogExternally) {
                  onDelete?.(); 
                } else {
                  setShowDeleteDialog(true); 
                }
              }}
            />
          )}
          {switchActive && (
            <CustomSwitch
              checked={isActive}
              onChange={() => onToggleStatus?.()}
              aria-label="Toggle user status"
            />
          )}{" "}
        </div>
      </div>

      {/* Card Body */}
      <div className={cn("divide-y", bodyClassName)}>
        {fields.map((field, idx) => (
          <div key={idx} className="flex justify-between p-3">
            <div className="text-primary text-xs  font-BreeSerif">
              {field.label}
            </div>
            <div className="text-right text-gray-900 text-xs font-BreeSerif">
              {field.value || <span className="text-gray-400">N/A</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
