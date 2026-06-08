import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import TextField from "@mui/material/TextField";

interface RoleDialogProps {
  open: boolean;
  onClose: () => void;
  onSave?: (data: RoleData) => void;
  initialData?: RoleData;
}

interface RoleData {
  name: string;
  description: string;
}

const EditRoleDialog: React.FC<RoleDialogProps> = ({
  open,
  onClose,
  onSave,
  initialData = { name: "", description: "" },
}) => {
  const [roleData, setRoleData] = React.useState<RoleData>(initialData);

  const handleChange =
    (field: keyof RoleData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;

      // For name and description, allow only letters, numbers and spaces
      if (field === "name" || field === "description") {
        // Remove all characters except letters, numbers and spaces
        value = value.replace(/[^A-Za-z ]/g, "");
      }

      setRoleData({ ...roleData, [field]: value });
    };

  const handleSubmit = () => {
    if (onSave) {
      onSave(roleData);
    }
  };

  useEffect(() => {
    if (open) {
      setRoleData(initialData);
    }
  }, [initialData, open]);

  const hasChanges = (): boolean => {
    return (
      roleData.name.trim() !== initialData.name.trim() ||
      roleData.description.trim() !== initialData.description.trim()
    );
  };

  const isFormValid =
    roleData.name.trim() !== "" && roleData.description.trim() !== "";

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent
        className="sm:max-w-4xl p-8 "
        style={{ maxWidth: "800px" }}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-medium">
            Edit Role
          </DialogTitle>
        </DialogHeader>
        <div className="md:p-4 space-y-6">
          <div
            className="rounded-lg p-4 md:p-8"
            style={{ border: "2px solid var(--primary)" }}
          >
            <div className="flex flex-col md:flex-row space-x-6 gap-5">
              {/* Role Name Field */}
              <TextField
                size="small"
                label="Role name *"
                variant="outlined"
                placeholder="Enter role name here"
                fullWidth
                className="bg-white"
                value={roleData.name}
                onChange={handleChange("name")}
                inputProps={{ maxLength: 100 }}
                required
                sx={{
                  "& .MuiInputBase-input": {
                    fontSize: "14px",
                  },
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: "var(--primary)",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "var(--primary)",
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "14px",
                  },
                }}
              />
              {/* Description Field */}
              <TextField
                size="small"
                label="Description *"
                variant="outlined"
                placeholder="Enter description here"
                fullWidth
                className="bg-white"
                value={roleData.description}
                onChange={handleChange("description")}
                inputProps={{ maxLength: 100 }}
                required
                sx={{
                  "& .MuiInputBase-input": {
                    fontSize: "14px",
                  },
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: "var(--primary)",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "var(--primary)",
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "14px",
                  },
                }}
              />
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full min-w-24 sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || !hasChanges()}
            className="bg-primary text-white hover:bg-primary/80 w-full min-w-24 sm:w-auto"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditRoleDialog;
