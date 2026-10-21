"use client";

import * as React from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@bobslab/ui";

export function DialogDemo() {
  const [openControlled, setOpenControlled] = React.useState(false);

  return (
    <div className="w-full my-6 flex flex-col gap-6 rounded-2xl border border-border bg-background p-6 shadow-xs">
      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          1. High-Level Entry Component (Zero Boilerplate)
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Uses <code>&lt;Dialog&gt;</code> directly with <code>trigger</code>,{" "}
          <code>title</code>, <code>description</code>, and <code>footer</code>{" "}
          props without assembling sub-primitives.
        </p>
        <Dialog
          trigger={<Button variant="default">Open Quick Dialog</Button>}
          title="Instant Modal"
          description="Rendered using Bobslab's unified single entry component API."
          footer={
            <Button
              variant="outline"
              onClick={() => alert("Action triggered!")}
            >
              Done
            </Button>
          }
        >
          <div className="py-2 text-sm text-foreground">
            This entire dialog requires zero subcomponent assembly. Clean,
            declarative, and fast.
          </div>
        </Dialog>
      </div>

      <div className="pt-4 border-t border-border">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          2. Fine-Grained Primitive Composition
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          For custom headless workflows requiring granular slots and custom
          layout control.
        </p>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setOpenControlled(true)}>
            Open Primitive Dialog
          </Button>

          <DialogRoot open={openControlled} onOpenChange={setOpenControlled}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Fine-Grained Composition</DialogTitle>
                <DialogDescription>
                  Built with individual primitives: DialogHeader, DialogTitle,
                  DialogContent, and DialogFooter.
                </DialogDescription>
              </DialogHeader>
              <div className="py-2 text-sm text-muted-foreground">
                You have total control over every slot, animation, and overlay
                attribute.
              </div>
              <DialogFooter>
                <Button
                  variant="secondary"
                  onClick={() => setOpenControlled(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => setOpenControlled(false)}>
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </DialogRoot>
        </div>
      </div>
    </div>
  );
}
