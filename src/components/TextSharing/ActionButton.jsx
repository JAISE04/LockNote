import React from "react";
import { Loader2 } from "lucide-react";

const Spinner = () => (
  <Loader2 className="animate-spin-slow size-4" aria-hidden="true" />
);

export default function ActionButton({
  onClick,
  icon,
  children,
  variant = "primary",
  loading = false,
  disabled = false,
  className = "",
  ...props
}) {
  const baseClasses =
    "inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 font-medium transition duration-200 ease-[var(--easing)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary:
      "text-primary-foreground bg-gradient-to-r from-indigo-500 to-blue-500 shadow-[0_12px_36px_rgba(79,70,229,.35)] hover:opacity-95 active:opacity-90",
    secondary:
      "bg-secondary text-secondary-foreground border border-border hover:bg-muted",
    ghost: "text-foreground hover:bg-muted/40",
    destructive: "bg-destructive text-primary-foreground hover:opacity-95",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <Spinner />
      ) : (
        icon && (
          <span className="text-lg" aria-hidden="true">
            {icon}
          </span>
        )
      )}
      <span>{children}</span>
    </button>
  );
}
