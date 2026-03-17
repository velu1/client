import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { NavItemProps } from "../../types/layout.types";

export function NavItem({
  label,
  to,
  iconActive,
  iconInactive,
  isActiveParent,
  onClick,
  iconOnly = false,
  renderCustomIcon,
}: NavItemProps & {
  iconOnly?: boolean;
  renderCustomIcon?: () => React.ReactNode;
}) {
  const active = isActiveParent(to);

  return (
    <Link to={to} title={label}>
      <Button
        variant="ghost"
        className={`flex items-center justify-center rounded-none transition ${
          iconOnly
            ? "md:w-8 md:h-8 xl:w-10 xl:h-10"
            : "w-full justify-start gap-2"
        } ${
          active
            ? "bg-[#676e6e] text-white"
            : "hover:bg-[#676e6e]/50 text-[#676e6e]"
        }`}
        onClick={() => onClick?.(to)}
      >
        {renderCustomIcon ? (
          renderCustomIcon()
        ) : (
          <img
            src={active ? iconActive : iconInactive}
            alt=""
            className={`w-4 h-4 ${iconOnly ? "" : "mr-2"}`}
          />
        )}
        {!iconOnly && label}
      </Button>
    </Link>
  );
}
