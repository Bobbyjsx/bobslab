"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cn } from "@bobslab/utils";
import { CloseIcon } from "@bobslab/icons";
import { Button } from "./button";

const DialogRoot = DialogPrimitive.Root;

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean;
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-2xl border border-border bg-background p-6 shadow-xl transition-all duration-150 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              />
            }
          >
            <CloseIcon size={16} />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1.5 text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3 pt-2",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "text-lg font-semibold tracking-tight text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export interface DialogProps extends Omit<
  DialogPrimitive.Root.Props,
  "children"
> {
  /** Content to display inside the dialog */
  children?: React.ReactNode;
  /** Optional trigger element for zero-boilerplate usage */
  trigger?: React.ReactElement;
  /** Modal title for zero-boilerplate usage */
  title?: React.ReactNode;
  /** Modal description for zero-boilerplate usage */
  description?: React.ReactNode;
  /** Modal footer element for zero-boilerplate usage */
  footer?: React.ReactNode;
  /** Show the default close button */
  showCloseButton?: boolean;
  contentClassName?: string;
  headerClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  footerClassName?: string;
}

/**
 * Dialog component supporting both single entry component usage and primitive composition.
 */
function Dialog({
  trigger,
  title,
  description,
  footer,
  children,
  showCloseButton = true,
  contentClassName,
  headerClassName,
  titleClassName,
  descriptionClassName,
  footerClassName,
  ...props
}: DialogProps) {
  // If high-level ergonomic props are supplied, render the composite entry component
  if (trigger || title || description || footer) {
    return (
      <DialogPrimitive.Root data-slot="dialog" {...props}>
        {trigger && <DialogTrigger render={trigger} />}
        <DialogContent
          className={contentClassName}
          showCloseButton={showCloseButton}
        >
          {(title || description) && (
            <DialogHeader className={headerClassName}>
              {title && (
                <DialogTitle className={titleClassName}>{title}</DialogTitle>
              )}
              {description && (
                <DialogDescription className={descriptionClassName}>
                  {description}
                </DialogDescription>
              )}
            </DialogHeader>
          )}
          {children}
          {footer && (
            <DialogFooter className={footerClassName}>{footer}</DialogFooter>
          )}
        </DialogContent>
      </DialogPrimitive.Root>
    );
  }

  // Otherwise, render headless root for fine-grained primitive composition
  return (
    <DialogPrimitive.Root data-slot="dialog" {...props}>
      {children}
    </DialogPrimitive.Root>
  );
}

Dialog.displayName = "Dialog";

export {
  Dialog,
  DialogRoot,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
