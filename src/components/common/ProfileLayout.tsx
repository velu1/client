import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
// import { ChevronLeft } from "lucide-react";

interface FormLayoutProps {
  children: React.ReactNode;
  isValid: boolean;
  isSubmitting?: boolean;
  onSubmit: () => void;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;

}

const ProfileLayout: React.FC<FormLayoutProps> = ({
  children,
  isValid,
  isSubmitting = false,
  onSubmit,
  onCancel,
  submitText = "Save",
  cancelText = "Cancel",
}) => {
  const navigate = useNavigate();

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Form Content */}
      <div className="flex-grow px-6 py-4 overflow-auto">
        <div>{children}</div>
      </div>

      {/* Fixed Action Bar at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4  border-gray-200 flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={handleCancel}
          type="button"
          className="w-[180px]"
        >
          {cancelText}
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!isValid || isSubmitting}
          type="submit"
          className="w-[180px]"
        >
          {isSubmitting ? "Saving..." : submitText}
        </Button>
      </div>

      {/* Spacer to prevent content from being hidden behind fixed action bar */}
      <div className="h-[72px]"></div>
    </div>
  );
};

export default ProfileLayout;
