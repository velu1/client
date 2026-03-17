import React from "react";
import { Textarea } from "../ui/textarea";
import { cn } from "../../lib/utils";
import {
  Bold,
  Italic,
  Link,
  List,
  ListOrdered,
  MoreHorizontal,
  Image,
  Type,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter content",
  className,
}) => {
  // Toolbar button handler (this would actually implement formatting in a real editor)
  const handleToolbarClick = (action: string) => {
    console.log(`Action: ${action}`);
    // In a real implementation, this would apply formatting to the text
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center border rounded-t-md p-2 bg-white">
        <div className="flex items-center space-x-1">
          <div className="flex mr-2">
            <button
              type="button"
              className="p-1 hover:bg-gray-100 rounded"
              onClick={() => handleToolbarClick("normal")}
            >
              <div className="flex items-center">
                <Type size={18} />
                <span className="ml-1 text-sm">Normal</span>
              </div>
            </button>
          </div>

          <button
            type="button"
            className="p-1 hover:bg-gray-100 rounded"
            onClick={() => handleToolbarClick("bold")}
          >
            <Bold size={18} />
          </button>
          <button
            type="button"
            className="p-1 hover:bg-gray-100 rounded"
            onClick={() => handleToolbarClick("italic")}
          >
            <Italic size={18} />
          </button>
          <button
            type="button"
            className="p-1 hover:bg-gray-100 rounded"
            onClick={() => handleToolbarClick("link")}
          >
            <Link size={18} />
          </button>
          <button
            type="button"
            className="p-1 hover:bg-gray-100 rounded"
            onClick={() => handleToolbarClick("undo")}
          >
            <MoreHorizontal size={18} />
          </button>
          <button
            type="button"
            className="p-1 hover:bg-gray-100 rounded"
            onClick={() => handleToolbarClick("bulletList")}
          >
            <List size={18} />
          </button>
          <button
            type="button"
            className="p-1 hover:bg-gray-100 rounded"
            onClick={() => handleToolbarClick("numberedList")}
          >
            <ListOrdered size={18} />
          </button>
          <button
            type="button"
            className="p-1 hover:bg-gray-100 rounded"
            onClick={() => handleToolbarClick("code")}
          >
            <Type size={18} />
          </button>
          <button
            type="button"
            className="p-1 hover:bg-gray-100 rounded"
            onClick={() => handleToolbarClick("image")}
          >
            <Image size={18} />
          </button>
        </div>
      </div>

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn("min-h-[150px] rounded-t-none border-t-0", className)}
      />
    </div>
  );
};

export default RichTextEditor;
