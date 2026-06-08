import React from "react";
import { DialogProps } from "../../types/layout.types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

const RequestDialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  buttons,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={true}>
      <DialogContent className="h-[220px] w-[320px]">
        <DialogHeader>
          <DialogTitle className="text-primary">{title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm mt-2">{message}</p>
        <div className="mt-4 flex justify-center space-x-3">{buttons}</div>
      </DialogContent>
    </Dialog>
  );
};

export default RequestDialog;
