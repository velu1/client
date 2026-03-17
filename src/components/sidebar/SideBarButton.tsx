import React from "react";
type SidebarButtonProps = {
  icon: React.ReactNode;
  label: string;
  active: string;
  setActive: (val: string) => void;
};

export default function SideBarButton({
  icon,
  label,
  active,
  setActive,
}: SidebarButtonProps) {
  const isActive = active === label;

  // Function to add `fill` property to an SVG
  const modifyIconColor = (icon: React.ReactNode) => {
    if (React.isValidElement(icon) && icon.type === "svg") {
      // Clone the element and add fill property
      return React.cloneElement(icon as React.ReactElement<any>, {
        fill: isActive ? "white" : "currentColor", // Set color based on active state
      });
    }
    return icon; // Return the icon as is if it's not an SVG
  };

  return (
    <div
      onClick={() => setActive(label)}
      className={`w-10 h-10 rounded-md flex items-center justify-center cursor-pointer transition-all 
        ${isActive ? "bg-primary text-white" : "hover:bg-[#e6d6c3]"}`}
    >
      {modifyIconColor(icon)}
    </div>
  );
}
