import * as React from "react";
import { cn } from "@bobslab/utils";
import { SpinnerIcon } from "@bobslab/icons";

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: 14,
  md: 18,
  lg: 24,
};

export function Spinner({ size = "md", className, ...props }: SpinnerProps) {
  const pixelSize = sizeMap[size];
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn("inline-flex items-center justify-center text-current", className)}
      {...props}
    >
      <SpinnerIcon size={pixelSize} />
    </span>
  );
}
