import type { ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "success";
type ButtonSize = "sm" | "md";

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  onClick?: () => void;
  size?: ButtonSize;
  className?: string;
  type?: "button" | "submit";
}

const SIZE_CLS: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
};

const VARIANT_CLS: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground border-primary hover:opacity-90",
  secondary: "bg-white text-foreground border-border hover:bg-muted",
  ghost: "bg-transparent text-foreground border-transparent hover:bg-muted",
  success: "bg-emerald-600 text-white border-emerald-600 hover:opacity-90",
};

export function Button({
  children,
  variant = "primary",
  onClick,
  size = "md",
  className = "",
  type = "button",
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 font-semibold rounded-lg border transition-all cursor-pointer ${SIZE_CLS[size]} ${VARIANT_CLS[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
