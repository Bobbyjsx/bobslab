"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@bobslab/ui";

export function AvatarDemo() {
  return (
    <div className="w-full my-6 flex flex-col gap-6 rounded-2xl border border-border bg-background p-6 shadow-xs">
      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Avatar with Image & Fallback
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Avatar className="size-12">
            <AvatarImage
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              alt="Jane Doe"
            />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <Avatar className="size-10">
            <AvatarImage
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
              alt="Alex Smith"
            />
            <AvatarFallback>AS</AvatarFallback>
          </Avatar>
          <Avatar className="size-10">
            <AvatarImage src="/broken-image.jpg" alt="Broken image" />
            <AvatarFallback>GE</AvatarFallback>
          </Avatar>
          <Avatar className="size-8">
            <AvatarFallback>BL</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}
