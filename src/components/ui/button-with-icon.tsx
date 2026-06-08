import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { buttonVariants } from "./button";

type IconPosition = "left" | "right" | "center" | "only";

interface ButtonWithIconProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  icon?: React.ReactNode;
  iconPosition?: IconPosition;
  label?: React.ReactNode;
  iconSrc?: string;
  iconAlt?: string;
  iconClassName?: string;
}

export function ButtonWithIcon({
  className,
  variant,
  size,
  icon,
  iconSrc,
  iconAlt = "icon",
  iconClassName,
  iconPosition = "left",
  label,
  children,
  ...props
}: ButtonWithIconProps) {
  // Use either provided label or children as label content
  const buttonLabel = label || children;

  // Handle icon-only case
  const isIconOnly = iconPosition === "only" || !buttonLabel;

  // Determine which icon to use (Component or Image)
  const IconElement = React.useMemo(() => {
    if (icon) {
      return (
        <span className={cn("inline-flex shrink-0", iconClassName)}>
          {icon}
        </span>
      );
    }

    if (iconSrc) {
      return (
        <img
          src={iconSrc}
          alt={iconAlt}
          className={cn("h-5 w-5 ", iconClassName)}
        />
      );
    }

    return null;
  }, [icon, iconSrc, iconAlt, iconClassName]);

  return (
    <button
      className={cn(
        buttonVariants({ variant, size, className }),
        isIconOnly && "p-0",
        size === "icon" && "flex items-center justify-center"
      )}
      {...props}
    >
      {isIconOnly ? (
        <span className="flex items-center justify-center">{IconElement}</span>
      ) : (
        <>
          {iconPosition === "left" && IconElement}

          {iconPosition === "center" ? (
            <span className="flex flex-col items-center gap-1.5">
              {IconElement}
              <span>{buttonLabel}</span>
            </span>
          ) : (
            buttonLabel
          )}

          {iconPosition === "right" && IconElement}
        </>
      )}
    </button>
  );
}
