import { Button } from "../ui/button";
import { ExpandableNavProps } from "../../types/layout.types";
import { useState, useEffect } from "react";
import arrowUp from "../../assets/newIcons/sidebar/arrowUp.svg";
import arrowDown from "../../assets/newIcons/sidebar/arrowDown.svg";
import { useLocation } from "react-router-dom";

export function ExpandableNav({
  label,
  basePath,
  iconActive,
  iconInactive,
  children,
  isActiveParent,
  onNavigate,
  showIcon = true,
}: ExpandableNavProps & { showIcon?: boolean }) {
  const location = useLocation();
  const hasNested = Array.isArray(children);

  // Recursive check if any child or its descendants match the current path
  const hasActiveDescendant = (items: any[]): boolean => {
    return items.some((child) => {
      if (isActiveParent(child.path) || location.pathname === child.path) {
        return true;
      }
      if (child.children) {
        return hasActiveDescendant(child.children);
      }
      return false;
    });
  };

  const [isExpanded, setIsExpanded] = useState(() => {
    return (
      isActiveParent(basePath) || (hasNested && hasActiveDescendant(children))
    );
  });

  // Automatically expand if user navigates to a nested route later
  useEffect(() => {
    if (
      isActiveParent(basePath) ||
      (hasNested && hasActiveDescendant(children))
    ) {
      setIsExpanded(true);
    }
  }, [location.pathname, basePath, children]);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div>
      {/* Parent label */}
      <Button
        variant="ghost"
        onClick={toggleExpand}
        className={`w-full justify-start flex items-center gap-2 rounded-none px-4 py-2 transition ${
          isExpanded
            ? "bg-[#676e6e] text-white"
            : "text-[#676e6e] hover:bg-[#676e6e]/20"
        }`}
      >
        {showIcon && (
          <img
            src={isExpanded ? iconActive : iconInactive}
            alt=""
            className="w-4 h-4"
          />
        )}
        {label}
        <span className="ml-auto">
          <img
            src={isExpanded ? arrowUp : arrowDown}
            alt="Toggle"
            className="h-4 w-4"
          />
        </span>
      </Button>

      {/* Child menu items */}
      {isExpanded && hasNested && (
        <div className="ml-0 bg-[#f5efe5]">
          {children.map((child, index) => {
            const isChildActive =
              isActiveParent(child.path) || location.pathname === child.path;

            return child.children ? (
              <ExpandableNav
                key={index}
                label={child.label}
                basePath={child.path}
                iconActive={iconActive}
                iconInactive={iconInactive}
                children={child.children}
                isActiveParent={isActiveParent}
                onNavigate={onNavigate}
                showIcon={false}
              />
            ) : (
              <Button
                key={index}
                variant="ghost"
                className={`w-full justify-start text-sm rounded-none px-6 py-2 transition ${
                  isChildActive
                    ? "bg-[#f5efe5] text-primary"
                    : "text-[#676e6e]/70 hover:bg-[#676e6e]/10"
                }`}
                onClick={() => onNavigate?.(child.path)}
              >
                {child.label}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
