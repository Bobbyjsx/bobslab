# @bobslab/utils

Core utility functions for class concatenation (`cn`), case transformation, financial math, currency formatting, and multi-currency resolution (`AmountAction`).

## Installation

```bash
# npm
npm install @bobslab/utils

# pnpm
pnpm add @bobslab/utils

# yarn
yarn add @bobslab/utils
```

## Features

- **`AmountAction`**: Multi-currency resolution engine to infer real currency from mixed texts, countries/regions, and merchant domain TLDs.
- **`formatDiscount` & `formatMinimumOrder`**: Standardized discount badge text (`"₦2,000 OFF"`, `"20% OFF"`, `"FREE SHIPPING"`) and minimum spend indicators.
- **`cn`**: Tailwind class merger combining `clsx` and `tailwind-merge`.
- **`formatCurrency`**: Localized currency formatter with standard symbol placement.
- **`formatSize` & `compactNumber`**: Byte size and metric number compaction.
- **`keysToCamel` & `keysToSnake`**: Deep object key case transforms.
- **`timeAgo`**: Human-readable relative time formatting.

## Usage

### 1. `AmountAction` Multi-Currency Resolution

```ts
import { AmountAction } from "@bobslab/utils";

// Resolves discrepancies when raw currency is "$" but coupon mentions Nigeria or .ng
const currency = AmountAction.inferCurrency({
  currency: "USD",
  text: "2k Off When You Shop Up to 20k and Above. Extra discount for orders over 20,000 NGN.",
  countryOrRegion: "Nigeria",
  domain: "jumia.com.ng",
});
// => "NGN"

const discountBadge = AmountAction.formatDiscount({
  discountType: "amount",
  discountValue: 2000,
  currency: "NGN",
  region: "Nigeria",
});
// => "₦2,000 OFF"

const minOrder = AmountAction.formatMinimumOrder(20000, "NGN");
// => "Min. order ₦20,000"
```

### 2. General Formatting & Helpers

```ts
import { cn, formatCurrency, formatSize, timeAgo } from "@bobslab/utils";

const className = cn("p-4 font-bold", isPrimary && "text-primary");
const price = formatCurrency(250000, "NGN"); // "₦250,000.00"
const fileSize = formatSize(1048576); // "1 MB"
const elapsed = timeAgo(new Date(Date.now() - 3600000)); // "1 hour ago"
```

## License

MIT © [Godswill Ezeala](https://godswillezeala.online/)
