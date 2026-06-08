import React, { useState, useRef } from "react";
import { cn } from "../../lib/utils";
import { Image as ImageIcon } from "lucide-react";
import { Button } from "../ui/button";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  className?: string;
  defaultImage?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  className,
  defaultImage,
}) => {
  const [preview, setPreview] = useState<string | null>(defaultImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("relative w-full", className)}>
      <div
        className={cn(
          "border border-dashed border-gray-300 rounded-lg flex items-center justify-center",
          "w-full aspect-[2/1] overflow-hidden",
          preview ? "bg-gray-100" : "bg-transparent"
        )}
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-center p-8">
            <ImageIcon className="w-12 h-12 mx-auto text-gray-400" />
            <div className="mt-4">
              <Button
                type="button"
                onClick={handleUploadClick}
                className="bg-gray-800 text-white hover:bg-gray-700"
              >
                Image upload
              </Button>
            </div>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {preview && (
        <div className="absolute bottom-4 right-4">
          <Button
            type="button"
            onClick={handleUploadClick}
            size="sm"
            className="bg-gray-800 text-white hover:bg-gray-700"
          >
            Change Image
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
