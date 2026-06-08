import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { dashboardCard } from "../../api/administration/dashboardCard";
import { rolePermission } from "../../api/administration/assignRoles";
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  CircularProgress,
  Box,
} from "@mui/material";

const AddColumnsDialog = ({
  isOpen,
  onClose,
  rolePermissionArr,
  roleId,
  onPermissionsUpdated,
  assignedRoles,
}: {
  isOpen: boolean;
  onClose: () => void;
  rolePermissionArr?: string[];
  roleId?: string;
  onPermissionsUpdated?: () => void;
  assignedRoles?: boolean;
}) => {
  const [data, setData] = useState<{ type: { type: string; id: string }[] }[]>(
    []
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await dashboardCard();
      if (response && response.data) {
        setData(response.data);
      } else {
        console.warn("No data returned from dashboardCard API");
      }
    } catch (error) {
      console.error("Error while fetching data in ColumnsDialog:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (isOpen) {
      fetchData();
      setSelectedIds(rolePermissionArr ?? []);
    }
  }, [isOpen, rolePermissionArr]);

  const handleCheckboxChange = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleApply = async () => {
    if (!roleId) {
      console.error("Role ID is required");
      return;
    }

    const payload = {
      rolePermission: selectedIds,
      id: roleId,
    };

    try {
      await rolePermission(payload);
      onPermissionsUpdated?.();
      console.log("Updated Permissions:", selectedIds);
      fetchData();
    } catch (error) {
      console.error("Failed to update role permission");
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()} modal>
      <DialogContent className="bg-white rounded-lg p-4 sm:p-6 shadow-lg w-[95%] max-w-md md:!max-w-xl mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-sm md:text-lg font-semibold">
            {assignedRoles ? "Edit Columns" : "Add Columns"}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <Box className="flex justify-center items-center min-h-[150px]">
            <CircularProgress size={24} />
          </Box>
        ) : (
          <div className="p-2 border border-primary rounded-md max-h-[300px] overflow-y-auto md:max-h-none">
            <FormGroup
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  md: "1fr 1fr",
                  sm: "2fr 2fr",
                },
                gap: {
                  md: "8px",
                  xs: "4px",
                },
              }}
            >
              {data.length > 0 &&
                data[0]?.type?.length > 0 &&
                data[0].type.map((item) => (
                  <FormControlLabel
                    key={item.id}
                    control={
                      <Checkbox
                        checked={selectedIds.includes(item.id)}
                        onChange={() => handleCheckboxChange(item.id)}
                        size="small"
                        className="!text-black"
                      />
                    }
                    label={item.type}
                    sx={{
                      fontSize: {
                        md: "medium",
                        sm: "5px",
                      },
                    }}
                  />
                ))}
            </FormGroup>
          </div>
        )}

        <div className="flex justify-center gap-5 md:gap-15 mt-6">
          <Button
            variant="outline"
            className="border-primary text-primary normal-case px-7 md:px-15"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            className="bg-primary normal-case px-7 md:px-15"
            onClick={handleApply}
            disabled={isLoading}
          >
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddColumnsDialog;
