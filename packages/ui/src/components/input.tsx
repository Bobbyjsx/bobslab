import * as React from "react";
import { cn } from "@bobslab/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  leftNode?: React.ReactNode;
  rightNode?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      label,
      error,
      helpText,
      leftNode,
      rightNode,
      required,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId =
      id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5 font-sans text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-slate-700 dark:text-zinc-300"
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftNode && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              {leftNode}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            required={required}
            className={cn(
              "block w-full h-9 rounded-xl border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors shadow-2xs focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50",
              leftNode && "pl-9",
              rightNode && "pr-9",
              error &&
                "border-destructive focus:border-destructive focus:ring-destructive/20",
              className,
            )}
            {...props}
          />
          {rightNode && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
              {rightNode}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        {helpText && !error && (
          <p className="text-xs text-muted-foreground">{helpText}</p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
