import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { useEffect, useState } from "react";
import { PartsHistoryItem } from "../../api/reports/parts-history";

type Column = {
  header: string;
  accessorKey: string;
};

const AddColumnsDialogLocal = ({
  isOpen,
  onClose,
  columns,
  setVisibleColumns,
  visibleColumns,
}: {
  isOpen: boolean;
  onClose: () => void;
  columns: Column[];
  visibleColumns: string[];
  setVisibleColumns: (cols: string[]) => void;
  selectedRow?: PartsHistoryItem | null;
}) => {
  const [selectedColumns, setSelectedColumns] =
    useState<string[]>(visibleColumns);

  useEffect(() => {
    if (isOpen) {
      setSelectedColumns(visibleColumns);
    }
  }, [isOpen, visibleColumns]);

  const handleCheckboxChange = (key: string) => {
    setSelectedColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleApply = () => {
    setVisibleColumns(selectedColumns); // <-- sync changes here
    console.log("Selected Columns:", selectedColumns);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()} modal>
      <DialogContent className="bg-white rounded-lg p-4 sm:p-6 shadow-lg w-[95%] max-w-md md:!max-w-xl mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-sm md:text-lg font-semibold">
            Add Columns
          </DialogTitle>
        </DialogHeader>

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
            {columns.map((col) => (
              <FormControlLabel
                key={col.accessorKey}
                control={
                  <Checkbox
                    checked={selectedColumns.includes(col.accessorKey)}
                    onChange={() => handleCheckboxChange(col.accessorKey)}
                    size="small"
                    className="!text-black"
                  />
                }
                label={col.header}
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

        <div className="flex justify-center gap-5 md:gap-15 mt-6">
          <Button
            variant="outline"
            className="border-primary text-primary normal-case px-7 md:px-15"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            className="bg-primary normal-case px-7 md:px-15"
            onClick={handleApply}
          >
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddColumnsDialogLocal;
