import React from "react";

export default function FormGroup({
  label,
  hint,
  error,
  children,
  required = false,
  className = "",
}) {
  const hintId = hint
    ? `${label?.toLowerCase().replace(/\s+/g, "-")}-hint`
    : undefined;
  const errorId = error
    ? `${label?.toLowerCase().replace(/\s+/g, "-")}-error`
    : undefined;

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-foreground">
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {hint && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p id={errorId} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
