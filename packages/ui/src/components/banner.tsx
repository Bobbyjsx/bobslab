import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@bobslab/utils";
import { AlertCircleIcon, CloseIcon, InfoIcon } from "@bobslab/icons";

const bannerVariants = cva(
  "relative w-full rounded-2xl p-4 transition-all border flex gap-3 text-sm",
  {
    variants: {
      intent: {
        info: "bg-blue-50/80 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800/60",
        warning:
          "bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800/60",
        success:
          "bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800/60",
        danger:
          "bg-rose-50/80 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border-rose-200 dark:border-rose-800/60",
        gray: "bg-muted/60 text-foreground border-border",
      },
    },
    defaultVariants: {
      intent: "info",
    },
  },
);

export interface BannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bannerVariants> {
  title?: string;
  description?: React.ReactNode;
  showIcon?: boolean;
  showCloseButton?: boolean;
  onClose?: () => void;
  action?: React.ReactNode;
}

export function Banner({
  className,
  intent = "info",
  title,
  description,
  children,
  showIcon = true,
  showCloseButton = false,
  onClose,
  action,
  ...props
}: BannerProps) {
  const [isOpen, setIsOpen] = React.useState(true);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  return (
    <div className={cn(bannerVariants({ intent }), className)} role="alert" {...props}>
      {showIcon && (
        <span className="shrink-0 mt-0.5">
          {intent === "danger" || intent === "warning" ? (
            <AlertCircleIcon size={18} />
          ) : (
            <InfoIcon size={18} />
          )}
        </span>
      )}

      <div className="flex-1 space-y-1">
        {title && <h5 className="font-semibold leading-none tracking-tight">{title}</h5>}
        {description && <div className="text-xs opacity-90">{description}</div>}
        {children}
        {action && <div className="pt-2">{action}</div>}
      </div>

      {showCloseButton && (
        <button
          type="button"
          onClick={handleClose}
          aria-label="Dismiss banner"
          className="shrink-0 p-1 opacity-70 hover:opacity-100 transition-opacity cursor-pointer rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
        >
          <CloseIcon size={14} />
        </button>
      )}
    </div>
  );
}
