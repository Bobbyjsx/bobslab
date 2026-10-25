"use client";

import * as React from "react";
import {
  formatCurrency,
  formatSize,
  timeAgo,
  compactNumber,
  keysToCamel,
  keysToSnake,
  calculateGrossFromNet,
} from "@bobslab/utils";

export function UtilsDemo() {
  const [amount, setAmount] = React.useState(12500.5);
  const [currency, setCurrency] = React.useState("USD");
  const [bytes, setBytes] = React.useState(5242880);

  const rawSnake = { user_account_id: "usr_9912", billing_country_code: "US" };
  const camelResult = keysToCamel(rawSnake);

  return (
    <div className="w-full my-6 flex flex-col gap-6 rounded-2xl border border-border bg-background p-6 shadow-xs">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Currency & Financial Math */}
        <div className="flex flex-col gap-3 rounded-xl border border-border p-4 bg-muted/20">
          <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
            formatCurrency & Financial Math
          </span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-28 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
            />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground outline-none"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="NGN">NGN (₦)</option>
            </select>
          </div>
          <div className="text-xs space-y-1">
            <div>
              Formatted:{" "}
              <span className="font-mono font-semibold text-foreground">
                {formatCurrency(amount, currency)}
              </span>
            </div>
            <div>
              Gross for 1.5% fee:{" "}
              <span className="font-mono font-semibold text-foreground">
                {formatCurrency(calculateGrossFromNet(amount, 0.015), currency)}
              </span>
            </div>
          </div>
        </div>

        {/* File Size & Numbers */}
        <div className="flex flex-col gap-3 rounded-xl border border-border p-4 bg-muted/20">
          <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
            formatSize & compactNumber
          </span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={bytes}
              onChange={(e) => setBytes(Number(e.target.value))}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
            />
          </div>
          <div className="text-xs space-y-1">
            <div>
              File Size:{" "}
              <span className="font-mono font-semibold text-foreground">
                {formatSize(bytes)}
              </span>
            </div>
            <div>
              Compacted (K/M):{" "}
              <span className="font-mono font-semibold text-foreground">
                {compactNumber(bytes)}
              </span>
            </div>
          </div>
        </div>

        {/* Relative Time */}
        <div className="flex flex-col gap-2 rounded-xl border border-border p-4 bg-muted/20">
          <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
            timeAgo(date)
          </span>
          <div className="text-xs space-y-1 text-muted-foreground">
            <div>
              10 minutes ago:{" "}
              <span className="font-mono font-semibold text-foreground">
                {timeAgo(new Date(Date.now() - 10 * 60 * 1000))}
              </span>
            </div>
            <div>
              3 days ago:{" "}
              <span className="font-mono font-semibold text-foreground">
                {timeAgo(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000))}
              </span>
            </div>
          </div>
        </div>

        {/* Case Transformations */}
        <div className="flex flex-col gap-2 rounded-xl border border-border p-4 bg-muted/20">
          <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
            keysToCamel & keysToSnake
          </span>
          <pre className="text-[11px] font-mono bg-background p-2 rounded border border-border/80 overflow-x-auto text-foreground">
            {JSON.stringify(
              {
                toCamel: camelResult,
                toSnake: keysToSnake(camelResult),
              },
              null,
              2,
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}
