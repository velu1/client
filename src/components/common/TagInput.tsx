import React, { useState, KeyboardEvent } from "react";
import { Input } from "../ui/input";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  maxTags?: number;
}

const TagInput: React.FC<TagInputProps> = ({
  tags,
  setTags,
  placeholder = "Enter",
  className,
  maxTags = 10,
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault();
      if (tags.length < maxTags) {
        if (!tags.includes(inputValue.trim())) {
          setTags([...tags, inputValue.trim()]);
          setInputValue("");
        }
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className={cn("flex flex-col w-full", className)}>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <div
            key={index}
            className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm"
          >
            <span className="mr-1">Tag {index + 1}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full"
        disabled={tags.length >= maxTags}
      />
      {tags.length >= maxTags && (
        <p className="text-xs text-muted-foreground mt-1">
          Maximum of {maxTags} tags reached
        </p>
      )}
    </div>
  );
};

export default TagInput;
