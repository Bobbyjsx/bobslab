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
  AmountAction,
} from "@bobslab/utils";

export function UtilsDemo() {
  const [amount, setAmount] = React.useState(12500.5);
  const [currency, setCurrency] = React.useState("USD");
  const [bytes, setBytes] = React.useState(5242880);

  // AmountAction State
  const [dealText, setDealText] = React.useState(
    "2k Off When You Shop Up to 20k and Above. Extra discount for orders over 20,000 NGN.",
  );
  const [rawCurrency, setRawCurrency] = React.useState("USD");
  const [dealRegion, setDealRegion] = React.useState("Nigeria");
  const [dealDomain, setDealDomain] = React.useState("jumia.com.ng");
  const [discountVal, setDiscountVal] = React.useState(2000);
  const [minOrderVal, setMinOrderVal] = React.useState(20000);

  const rawSnake = { user_account_id: "usr_9912", billing_country_code: "US" };
  const camelResult = keysToCamel(rawSnake);

  const inferred = AmountAction.inferCurrency({
    currency: rawCurrency,
    text: dealText,
    countryOrRegion: dealRegion,
    domain: dealDomain,
  });

  const formattedDiscount = AmountAction.formatDiscount({
    discountType: "amount",
    discountValue: discountVal,
    currency: inferred,
    region: dealRegion,
    domain: dealDomain,
  });

  const formattedMinOrder = AmountAction.formatMinimumOrder(
    minOrderVal,
    inferred,
  );

  return (
    <div className="w-full my-6 flex flex-col gap-6 rounded-2xl border border-border bg-background p-6 shadow-xs">
      {/* AmountAction Multi-Currency Resolution */}
      <div className="flex flex-col gap-4 rounded-xl border border-border p-5 bg-muted/20">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
            AmountAction • Multi-Currency Discrepancy Resolver
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono font-medium">
            Resolved: {inferred}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">
              Raw Currency:
            </label>
            <input
              type="text"
              value={rawCurrency}
              onChange={(e) => setRawCurrency(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">
              Region / Country:
            </label>
            <input
              type="text"
              value={dealRegion}
              onChange={(e) => setDealRegion(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">
              Domain TLD:
            </label>
            <input
              type="text"
              value={dealDomain}
              onChange={(e) => setDealDomain(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">
              Discount / Min. Order:
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={discountVal}
                onChange={(e) => setDiscountVal(Number(e.target.value))}
                className="w-1/2 rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground outline-none focus:border-primary"
                placeholder="Discount"
              />
              <input
                type="number"
                value={minOrderVal}
                onChange={(e) => setMinOrderVal(Number(e.target.value))}
                className="w-1/2 rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground outline-none focus:border-primary"
                placeholder="Min Order"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">
            Deal Text / Description:
          </label>
          <input
            type="text"
            value={dealText}
            onChange={(e) => setDealText(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-border/60">
          <div className="text-xs">
            <span className="text-muted-foreground">Formatted Discount: </span>
            <span className="font-mono font-bold text-foreground bg-primary/10 px-2 py-1 rounded">
              {formattedDiscount}
            </span>
          </div>
          <div className="text-xs">
            <span className="text-muted-foreground">Formatted Condition: </span>
            <span className="font-mono font-semibold text-foreground">
              {formattedMinOrder}
            </span>
          </div>
        </div>
      </div>

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
