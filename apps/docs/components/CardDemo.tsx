"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Badge,
} from "@bobslab/ui";

export function CardDemo() {
  return (
    <div className="w-full my-6 grid grid-cols-1 md:grid-cols-2 gap-6 rounded-2xl border border-border bg-background p-6 shadow-xs">
      <Card variant="default">
        <CardHeader>
          <div>
            <CardTitle>Standard Card</CardTitle>
            <CardDescription>
              Basic container with subtle border & shadow
            </CardDescription>
          </div>
          <Badge variant="neutral">Free</Badge>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Cards organize related user interface components, information, and
            contextual action triggers into clean, scannable units.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 border-t border-border/40 pt-4">
          <Button variant="outline" size="sm">
            Cancel
          </Button>
          <Button size="sm">Continue</Button>
        </CardFooter>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <div>
            <CardTitle>Elevated Card</CardTitle>
            <CardDescription>
              Stronger shadow for floating panels & modals
            </CardDescription>
          </div>
          <Badge variant="default">Pro</Badge>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The elevated variant brings increased prominence to key focal points
            such as billing summaries, pricing tiers, and active workflows.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between items-center border-t border-border/40 pt-4">
          <span className="text-xs font-semibold text-foreground">
            $29.00 / month
          </span>
          <Button size="sm">Upgrade</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
