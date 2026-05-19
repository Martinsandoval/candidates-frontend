"use client";

import type { ReactNode } from "react";
import * as React from "react";
import { Button as RadixButton } from "@radix-ui/themes";

type Variant = "primary" | "secondary" | "danger" | "gray" | "warning" | "unstyled" | "link";
type Size = "sm" | "md" | "lg" | "full";

type RadixButtonProps = React.ComponentProps<typeof RadixButton>;

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

interface ButtonProps extends Omit<RadixButtonProps, "variant" | "size"> {
  /**
   * Visual style of the button. Defaults to `"primary"`.
   * - `primary`: Filled blue, main call-to-action
   * - `secondary`: Outlined, secondary actions
   * - `danger`: Red, destructive actions
   * - `warning`: Yellow/orange, cautionary actions
   * - `gray`: Neutral gray, tertiary actions
   * - `link`: Text link style, inline navigation actions
   * - `unstyled`: No styles applied, full custom control via `className`
   */
  variant?: Variant;
  /**
   * Controls button width. Defaults to `"sm"`. `"full"` stretches to 100%.
   */
  size?: Size;
  /**
   * Additional CSS classes merged with the computed variant class.
   */
  className?: string;
  children?: ReactNode;
}

function getButtonClass(variant: Variant, size: Size) {
  if (variant === "unstyled" || variant === "link") return "";

  const base = {
    primary: "ButtonPrimary",
    secondary: "ButtonSecondary",
    danger: "ButtonDanger",
    warning: "ButtonWarning",
    gray: "ButtonGray",
  }[variant];

  if (size === "sm") return base;
  if (size === "full") return `${base} Full`;
  if (size === "lg") return `${base} Lg`;
  if (size === "md") return `${base} Md`;

  return base;
}

/**
 * General-purpose button component wrapping Radix UI's Button.
 *
 * Supports six visual variants and four size options. The `link` and `unstyled`
 * variants render a native `<button>` element; all other variants delegate to
 * `@radix-ui/themes` Button for consistent focus and accessibility behaviour.
 *
 * @author Martin Sandoval
 */
const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "sm",
  className = "",
  children,
  style,
  ...props
}) => {
  const computedClass = getButtonClass(variant, size);

  if (variant === "unstyled") {
    return (
      <button
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        className={className}
        style={style}
      >
        {children}
      </button>
    );
  }

  if (variant === "link") {
    return (
      <button
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        className={cn("ButtonLink", className)}
        style={style}
      >
        {children}
      </button>
    );
  }

  return (
    <RadixButton {...props} className={cn(computedClass, className)} style={style}>
      {children}
    </RadixButton>
  );
};

export default Button;
