import * as React from "react";
import { cn } from "@bobslab/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "accent";
}

export function Card({
  className = "",
  variant = "default",
  children,
  ...props
}: CardProps) {
  const variantStyles = {
    default: "bg-background text-foreground border border-border shadow-xs",
    elevated: "bg-background text-foreground border border-border shadow-md",
    accent:
      "bg-primary text-primary-foreground border border-primary/20 shadow-sm",
  };

  return (
    <div
      className={cn(
        "rounded-2xl transition-all",
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-5 pb-3 border-b border-border/60",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-base font-semibold tracking-tight text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-xs text-muted-foreground mt-0.5", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-5", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "p-5 pt-3 border-t border-border/60 flex items-center justify-between",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
