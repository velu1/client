import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import TextField from "@mui/material/TextField";
import { Part } from "../../mock/dummyData";

interface ReturnQuantityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
  part: Part;
}

const ReturnQuantityDialog: React.FC<ReturnQuantityDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  part,
}) => {
  const [quantity, setQuantity] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuantity(value);

    // Validate
    const numValue = Number(value);
    if (!value || isNaN(numValue)) {
      setError("Please enter a valid number");
    } else if (numValue <= 0) {
      setError("Quantity must be greater than 0");
    } else if (numValue > part.quantity) {
      setError(`Cannot return more than available quantity (${part.quantity})`);
    } else {
      setError("");
    }
  };

  const handleSubmit = () => {
    const numQuantity = Number(quantity);
    if (!error && numQuantity > 0 && numQuantity <= part.quantity) {
      onConfirm(numQuantity);
      onClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          setQuantity("");
          setError("");
        }
      }}
      modal={true}
    >
      <DialogContent className="bg-white rounded-lg p-4 sm:p-6 shadow-lg w-[90%] max-w-lg mx-auto">
        <DialogHeader className="flex justify-between items-center mb-4">
          <DialogTitle className="text-xl md:text-xl font-bold font-BreeSerif text-gray-800 text-center w-full">
            Update Quantity
          </DialogTitle>
        </DialogHeader>

        <div className="px-2 sm:px-5 mb-6">
          <p className="text-base md:text-md text-gray-600 mb-4 text-center">
            Enter the quantity you want to return for part {part.partNumber}
          </p>

          <div className="w-full">
            <TextField
              label="Return Quantity"
              type="number"
              fullWidth
              value={quantity}
              onChange={handleQuantityChange}
              error={!!error}
              helperText={error}
              InputProps={{
                inputProps: {
                  min: 1,
                  max: part.quantity,
                },
              }}
              size="small"
            />

            <div className="mt-2 text-sm text-gray-500">
              <p>Available quantity: {part.quantity}</p>
            </div>
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
            disabled={!!error || !quantity}
            className="px-3 sm:px-6 py-1.5 sm:py-2 w-[100px] sm:w-35 h-[30px] sm:h-7 bg-primary text-white rounded-sm text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReturnQuantityDialog;
