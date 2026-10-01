import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
};

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[44px]";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm min-h-[38px]",
    md: "px-4 py-2.5 text-base min-h-[44px]",
    lg: "px-6 py-3.5 text-lg min-h-[50px]",
  };

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/25 active:scale-95",
    secondary:
      "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 active:scale-95",
    danger:
      "bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-600/25 active:scale-95",
    ghost: "bg-transparent text-slate-300 hover:bg-slate-800/60 hover:text-white",
    outline:
      "border border-purple-500/40 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400",
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, sizeStyles[size], variantStyles[variant], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
