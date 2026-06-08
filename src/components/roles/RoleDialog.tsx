import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import TextField from "@mui/material/TextField";
import { toast } from "react-hot-toast";

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

const RoleDialog: React.FC<RoleDialogProps> = ({
  open,
  onClose,
  onSave,
  initialData = { name: "", description: "" },
}) => {
  const [roleData, setRoleData] = React.useState<RoleData>(initialData);
  const [errors, setErrors] = React.useState<{
    name?: string;
    description?: string;
  }>({});

  const handleChange =
    (field: keyof RoleData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;

      // For name and description: allow only letters and spaces, no numbers/special chars
      if (field === "name" || field === "description") {
        // Remove all characters except letters and spaces
        value = value.replace(/[^A-Za-z ]/g, "");
      }

      setRoleData({ ...roleData, [field]: value });
    };

  const validate = (): boolean => {
    const letterAndSpaceRegex = /^[A-Za-z ]+$/;
    const newErrors: { name?: string; description?: string } = {};
    let isValid = true;

    // Name validation
    if (!roleData.name.trim()) {
      newErrors.name = "Role name is required";
      toast.error("Role name is required");
      isValid = false;
    } else if (!letterAndSpaceRegex.test(roleData.name.trim())) {
      newErrors.name = "Only letters and spaces are allowed in role name";
      toast.error("Only letters and spaces are allowed in role name");
      isValid = false;
    }

    // Description validation
    if (!roleData.description.trim()) {
      newErrors.description = "Description is required";
      toast.error("Description is required");
      isValid = false;
    } else if (!letterAndSpaceRegex.test(roleData.description.trim())) {
      newErrors.description =
        "Only letters and spaces are allowed in description";
      toast.error("Only letters and spaces are allowed in description");
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };
  const handleSubmit = () => {
    if (validate() && onSave) {
      onSave(roleData);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="sm:max-w-4xl p-8" style={{ maxWidth: "800px" }}>
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-medium">
            Add Role
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
                label="Role name"
                variant="outlined"
                placeholder="Enter role name here"
                fullWidth
                className="bg-white"
                value={roleData.name}
                onChange={handleChange("name")}
                required
                error={!!errors.name}
                helperText={errors.name}
                inputProps={{ maxLength: 100 }}
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
                label="Description"
                variant="outlined"
                placeholder="Enter description here"
                fullWidth
                className="bg-white"
                value={roleData.description}
                onChange={handleChange("description")}
                required
                error={!!errors.description}
                helperText={errors.description}
                inputProps={{ maxLength: 100 }}
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
            className="bg-primary text-white hover:bg-primary/80 w-full min-w-24 sm:w-auto"
            disabled={
              roleData.name.trim().length === 0 ||
              roleData.description.trim().length === 0
            }
          >
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoleDialog;
