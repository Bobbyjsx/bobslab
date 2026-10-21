"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cn } from "@bobslab/utils";

const TabsRoot = TabsPrimitive.Root;

function TabsList({ className, ...props }: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-xl bg-muted p-1 text-muted-foreground select-none",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1 text-xs sm:text-sm font-medium transition-all outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer data-selected:bg-background data-selected:text-foreground data-selected:shadow-2xs",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("outline-none pt-2", className)}
      {...props}
    />
  );
}

export interface TabItem {
  value: string;
  label: React.ReactNode;
  content?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps extends TabsPrimitive.Root.Props {
  /** Optional array of tab items for zero-boilerplate usage */
  items?: TabItem[];
  listClassName?: string;
  triggerClassName?: string;
  contentClassName?: string;
}

/**
 * Tabs component supporting both zero-boilerplate item lists and primitive composition.
 */
function Tabs({
  items,
  listClassName,
  triggerClassName,
  contentClassName,
  children,
  className,
  ...props
}: TabsProps) {
  if (items && items.length > 0) {
    const defaultValue = props.defaultValue ?? items[0]?.value;
    return (
      <TabsPrimitive.Root
        data-slot="tabs"
        defaultValue={defaultValue}
        className={cn("flex flex-col gap-2", className)}
        {...props}
      >
        <TabsList className={listClassName}>
          {items.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              disabled={item.disabled}
              className={triggerClassName}
            >
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {items.map((item) => (
          <TabsContent
            key={item.value}
            value={item.value}
            className={contentClassName}
          >
            {item.content}
          </TabsContent>
        ))}
      </TabsPrimitive.Root>
    );
  }

  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    >
      {children}
    </TabsPrimitive.Root>
  );
}

Tabs.displayName = "Tabs";

export { Tabs, TabsRoot, TabsList, TabsTrigger, TabsContent };
