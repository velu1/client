import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id?: string) => void;
  title: string;
  subtitle: string;
  cancelButtonText: string;
  saveButtonText: string;
  id?: string;
}

const DialogComponent: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  onSave,
  title,
  subtitle,
  cancelButtonText,
  saveButtonText,
}) => {
  const handleCancel = () => {
    onClose();
  };

  const handleConfirm = () => {
    onSave();
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      modal={true}
    >
      <DialogContent className="bg-white rounded-lg p-4 sm:p-6 shadow-lg w-[90%] max-w-lg mx-auto">
        <DialogHeader className="flex justify-between items-center mb-4">
          <DialogTitle className="text-xl md:text-xl font-bold font-BreeSerif text-gray-800 text-center w-full">
            {title}
          </DialogTitle>
        </DialogHeader>
        <p className="px-2 sm:px-5 text-base md:text-md text-gray-600 text-center">
          {subtitle}
        </p>
        <div className="flex justify-center space-x-4 sm:space-x-10 mt-6 sm:mt-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="px-3 sm:px-6 py-1.5 sm:py-2 w-[100px] sm:w-35 h-[30px] sm:h-7 border border-primary rounded-sm text-gray-800 text-sm sm:text-base"
          >
            {cancelButtonText}
          </Button>
          <Button
            onClick={handleConfirm}
            className="px-3 sm:px-6 py-1.5 sm:py-2 w-[100px] sm:w-35 h-[30px] sm:h-7 bg-primary text-white rounded-sm text-sm sm:text-base"
          >
            {saveButtonText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogComponent;
