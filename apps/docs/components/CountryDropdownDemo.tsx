"use client";

import * as React from "react";
import { CountryDropdown, GLOBAL_COUNTRY, type Country } from "@bobslab/ui";

export function CountryDropdownDemo() {
  const [selectedCode, setSelectedCode] = React.useState<string>("GB");
  const [selectedCountry, setSelectedCountry] = React.useState<
    Country | undefined
  >();

  return (
    <div className="w-full my-6 flex flex-col gap-6 rounded-2xl border border-border bg-background p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-foreground">
            Interactive Country Dropdown
          </h4>
          <p className="text-xs text-muted-foreground">
            Virtualized list with search, worldwide alias matching, and priority
            regions.
          </p>
        </div>

        <CountryDropdown
          value={selectedCode}
          onValueChange={setSelectedCode}
          onChange={setSelectedCountry}
          priorityCountries={["GB", "US", "EU", "CA", "AU", "DE", "FR"]}
          showGlobal={true}
          align="end"
        />
      </div>

      <div className="rounded-xl border border-border bg-muted/30 p-4 text-xs space-y-2">
        <div className="font-semibold text-foreground">
          Selected Country Details:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-muted-foreground font-mono">
          <div>
            <span className="text-[10px] uppercase text-muted-foreground/70 block">
              Flag &amp; Code
            </span>
            <span className="text-foreground text-sm font-bold">
              {selectedCountry?.flag || "🇬🇧"} {selectedCode}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-muted-foreground/70 block">
              Name
            </span>
            <span className="text-foreground truncate block">
              {selectedCountry?.name ||
                (selectedCode === "GLOBAL"
                  ? GLOBAL_COUNTRY.name
                  : "United Kingdom")}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-muted-foreground/70 block">
              Currency
            </span>
            <span className="text-foreground">
              {selectedCountry?.currency ||
                (selectedCode === "GLOBAL" ? "USD" : "£")}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-muted-foreground/70 block">
              Dial Code
            </span>
            <span className="text-foreground">
              {selectedCountry?.dialCode ||
                (selectedCode === "GLOBAL" ? "—" : "+44")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
