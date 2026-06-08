import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import TextField from "@mui/material/TextField";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import { Part } from "../../mock/dummyData";

interface PrintOptionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options: PrintOptions) => void;
  part: Part;
}

export interface PrintOptions {
  copies: number;
  format: "standard" | "compact" | "detailed";
}

const PrintOptionsDialog: React.FC<PrintOptionsDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  part,
}) => {
  const [copies, setCopies] = useState<string>("1");
  const [format, setFormat] = useState<"standard" | "compact" | "detailed">(
    "standard"
  );
  const [error, setError] = useState<string>("");

  const handleCopiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCopies(value);

    // Validate
    const numValue = Number(value);
    if (!value || isNaN(numValue)) {
      setError("Please enter a valid number");
    } else if (numValue <= 0) {
      setError("Number of copies must be greater than 0");
    } else if (numValue > 10) {
      setError("Maximum 10 copies allowed");
    } else {
      setError("");
    }
  };

  const handleSubmit = () => {
    const numCopies = Number(copies);
    if (!error && numCopies > 0 && numCopies <= 10) {
      onConfirm({
        copies: numCopies,
        format,
      });
      onClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          setCopies("1");
          setFormat("standard");
          setError("");
        }
      }}
      modal={true}
    >
      <DialogContent className="bg-white rounded-lg p-4 sm:p-6 shadow-lg w-[90%] max-w-lg mx-auto">
        <DialogHeader className="flex justify-between items-center mb-4">
          <DialogTitle className="text-xl md:text-xl font-bold font-BreeSerif text-gray-800 text-center w-full">
            Print Options
          </DialogTitle>
        </DialogHeader>

        <div className="px-2 sm:px-5 mb-6">
          <p className="text-base md:text-md text-gray-600 mb-4 text-center">
            Configure print options for part {part.partNumber}
          </p>

          <div className="w-full space-y-4">
            <TextField
              label="Number of Copies"
              type="number"
              fullWidth
              value={copies}
              onChange={handleCopiesChange}
              error={!!error}
              helperText={error}
              InputProps={{
                inputProps: {
                  min: 1,
                  max: 10,
                },
              }}
              size="small"
            />

            <FormControl component="fieldset">
              <FormLabel component="legend" className="text-gray-700">
                Print Format
              </FormLabel>
              <RadioGroup
                value={format}
                onChange={(e) =>
                  setFormat(
                    e.target.value as "standard" | "compact" | "detailed"
                  )
                }
              >
                <FormControlLabel
                  value="standard"
                  control={
                    <Radio
                      sx={{
                        color: "#C29B6C",
                        "&.Mui-checked": { color: "#C29B6C" },
                      }}
                    />
                  }
                  label="Standard"
                />
                <FormControlLabel
                  value="compact"
                  control={
                    <Radio
                      sx={{
                        color: "#C29B6C",
                        "&.Mui-checked": { color: "#C29B6C" },
                      }}
                    />
                  }
                  label="Compact"
                />
                <FormControlLabel
                  value="detailed"
                  control={
                    <Radio
                      sx={{
                        color: "#C29B6C",
                        "&.Mui-checked": { color: "#C29B6C" },
                      }}
                    />
                  }
                  label="Detailed"
                />
              </RadioGroup>
            </FormControl>
          </div>
        </div>

        <div className="flex justify-center space-x-4 sm:space-x-10 mt-6 sm:mt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-3 sm:px-6 py-1.5 sm:py-2 w-[100px] sm:w-35 h-[30px] sm:h-7 border border-primary rounded-sm text-gray-800 text-sm sm:text-base"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!!error || !copies}
            className="px-3 sm:px-6 py-1.5 sm:py-2 w-[100px] sm:w-35 h-[30px] sm:h-7 bg-primary text-white rounded-sm text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrintOptionsDialog;
