export const CurrencySymbolMap: Record<string, string> = {
  USD: "$",
  CAD: "CA$",
  EUR: "€",
  AED: "AED",
  AFN: "Af",
  ALL: "ALL",
  AMD: "AMD",
  ARS: "AR$",
  AUD: "AU$",
  AZN: "man.",
  BAM: "KM",
  BDT: "Tk",
  BGN: "BGN",
  BHD: "BD",
  BIF: "FBu",
  BND: "BN$",
  BOB: "Bs",
  BRL: "R$",
  BWP: "BWP",
  BYN: "Br",
  BZD: "BZ$",
  CDF: "CDF",
  CHF: "CHF",
  CLP: "CL$",
  CNY: "CN¥",
  COP: "CO$",
  CRC: "₡",
  CVE: "CV$",
  CZK: "Kč",
  DJF: "Fdj",
  DKK: "Dkr",
  DOP: "RD$",
  DZD: "DA",
  EEK: "Ekr",
  EGP: "EGP",
  ERN: "Nfk",
  ETB: "Br",
  GBP: "£",
  GEL: "GEL",
  GHS: "GH₵",
  GNF: "FG",
  GTQ: "GTQ",
  HKD: "HK$",
  HNL: "HNL",
  HRK: "kn",
  HUF: "Ft",
  IDR: "Rp",
  ILS: "₪",
  INR: "₹",
  IQD: "IQD",
  IRR: "IRR",
  ISK: "Ikr",
  JMD: "J$",
  JOD: "JD",
  JPY: "¥",
  KES: "Ksh",
  KHR: "KHR",
  KMF: "CF",
  KRW: "₩",
  KWD: "KD",
  KZT: "KZT",
  LBP: "L.L.",
  LKR: "SLRs",
  LTL: "Lt",
  LVL: "Ls",
  LYD: "LD",
  MAD: "MAD",
  MDL: "MDL",
  MGA: "MGA",
  MKD: "MKD",
  MMK: "MMK",
  MOP: "MOP$",
  MUR: "MURs",
  MXN: "MX$",
  MYR: "RM",
  MZN: "MTn",
  NAD: "N$",
  NGN: "₦",
  NIO: "C$",
  NOK: "Nkr",
  NPR: "NPRs",
  NZD: "NZ$",
  OMR: "OMR",
  PAB: "B/.",
  PEN: "S/.",
  PHP: "₱",
  PKR: "PKRs",
  PLN: "zł",
  PYG: "₲",
  QAR: "QR",
  RON: "RON",
  RSD: "din.",
  RUB: "RUB",
  RWF: "RWF",
  SAR: "SR",
  SDG: "SDG",
  SEK: "Skr",
  SGD: "S$",
  SOS: "Ssh",
  SYP: "SY£",
  THB: "฿",
  TND: "DT",
  TOP: "T$",
  TRY: "TL",
  TTD: "TT$",
  TWD: "NT$",
  TZS: "TSh",
  UAH: "₴",
  UGX: "USh",
  UYU: "$U",
  UZS: "UZS",
  VEF: "Bs.F.",
  VND: "₫",
  XAF: "F CFA",
  XOF: "CFA",
  YER: "YR",
  ZAR: "R",
  ZMK: "ZK",
  ZWL: "ZWL$",
};

export interface FormatCurrencyOptions {
  convertToMajorCurrency?: boolean;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  compact?: boolean;
}

export interface InferCurrencyOptions {
  currency?: string | null;
  text?: string | null;
  countryOrRegion?: string | string[] | null;
  domain?: string | null;
}

export interface FormatDiscountOptions {
  discountType?: string | null;
  discountValue?: number | string | null;
  currency?: string | null;
  text?: string | null;
  region?: string | string[] | null;
  domain?: string | null;
}

export class AmountAction {
  /**
   * Returns a standard locale map for currencies that need specific localization (e.g. Francophone CFA).
   */
  static getCurrencyLocaleMap(currency: string): string {
    const localeMap: Record<string, string> = {
      XOF: "fr",
      XAF: "fr",
      NGN: "en-NG",
      KES: "en-KE",
      GHS: "en-GH",
      ZAR: "en-ZA",
      EUR: "de-DE",
      GBP: "en-GB",
    };
    return localeMap[currency] || "en";
  }

  /**
   * Converts kobo (minor NGN unit) to Naira (major unit).
   */
  static koboToNaira(amount: number | string): number {
    return +amount / 100;
  }

  /**
   * Converts Naira to kobo.
   */
  static nairaToKobo(amount: number | string): number {
    return Math.round(+amount * 100);
  }

  /**
   * Resolves the currency symbol from ISO currency code.
   */
  static getCurrencySymbol(currency?: string | null): string {
    if (!currency) return "$";
    const upper = currency.toUpperCase().trim();
    return CurrencySymbolMap[upper] || upper;
  }

  /**
   * Inactive/unspecified currency inference from merchant domain, region, or coupon text evidence.
   */
  static inferCurrency(options: InferCurrencyOptions): string {
    const { currency, text, countryOrRegion, domain } = options;

    if (currency && currency.trim() !== "") {
      const upper = currency.toUpperCase().trim();
      if (CurrencySymbolMap[upper]) {
        return upper;
      }
    }

    // 1. Text Inspection (Title, description, notes, snippets)
    if (text) {
      const lowerText = text.toLowerCase();
      if (
        lowerText.includes("ngn") ||
        text.includes("₦") ||
        lowerText.includes("naira")
      ) {
        return "NGN";
      }
      if (
        lowerText.includes("ghs") ||
        text.includes("gh₵") ||
        lowerText.includes("cedi")
      ) {
        return "GHS";
      }
      if (
        lowerText.includes("kes") ||
        lowerText.includes("ksh") ||
        lowerText.includes("shilling")
      ) {
        return "KES";
      }
      if (lowerText.includes("zar") || lowerText.includes("rand")) {
        return "ZAR";
      }
      if (lowerText.includes("gbp") || text.includes("£")) {
        return "GBP";
      }
      if (lowerText.includes("eur") || text.includes("€")) {
        return "EUR";
      }
      if (lowerText.includes("cad") || text.includes("ca$")) {
        return "CAD";
      }
      if (lowerText.includes("aud") || text.includes("au$")) {
        return "AUD";
      }
      if (
        lowerText.includes("xof") ||
        lowerText.includes("xaf") ||
        lowerText.includes("cfa")
      ) {
        return "XOF";
      }
      if (lowerText.includes("usd") || text.includes("$")) {
        return "USD";
      }
    }

    // 2. Region / Country restrictions inspection
    const regions = Array.isArray(countryOrRegion)
      ? countryOrRegion
      : countryOrRegion
        ? [countryOrRegion]
        : [];

    for (const r of regions) {
      const lower = r.toLowerCase().trim();
      if (lower === "ng" || lower === "nga" || lower.includes("nigeria")) {
        return "NGN";
      }
      if (lower === "gh" || lower === "gha" || lower.includes("ghana")) {
        return "GHS";
      }
      if (lower === "ke" || lower === "ken" || lower.includes("kenya")) {
        return "KES";
      }
      if (lower === "za" || lower === "zaf" || lower.includes("south africa")) {
        return "ZAR";
      }
      if (
        lower === "uk" ||
        lower === "gb" ||
        lower === "gbr" ||
        lower.includes("united kingdom")
      ) {
        return "GBP";
      }
      if (
        lower === "eu" ||
        lower.includes("europe") ||
        lower.includes("germany") ||
        lower.includes("france")
      ) {
        return "EUR";
      }
      if (lower === "ca" || lower === "can" || lower.includes("canada")) {
        return "CAD";
      }
      if (lower === "au" || lower === "aus" || lower.includes("australia")) {
        return "AUD";
      }
    }

    // 3. Merchant domain TLD inspection
    if (domain) {
      const d = domain.toLowerCase().trim();
      if (d.endsWith(".ng") || d.endsWith(".com.ng")) {
        return "NGN";
      }
      if (d.endsWith(".gh") || d.endsWith(".com.gh")) {
        return "GHS";
      }
      if (d.endsWith(".ke") || d.endsWith(".co.ke")) {
        return "KES";
      }
      if (d.endsWith(".za") || d.endsWith(".co.za")) {
        return "ZAR";
      }
      if (d.endsWith(".uk") || d.endsWith(".co.uk")) {
        return "GBP";
      }
      if (d.endsWith(".ca")) {
        return "CAD";
      }
      if (d.endsWith(".au") || d.endsWith(".com.au")) {
        return "AUD";
      }
      if (
        d.endsWith(".de") ||
        d.endsWith(".fr") ||
        d.endsWith(".es") ||
        d.endsWith(".it")
      ) {
        return "EUR";
      }
    }

    return "USD";
  }

  /**
   * Formats value with appropriate currency symbol and localized number formatting.
   */
  static formatAmountAndCurrency = (
    currency: string,
    value: number | string,
    options?: FormatCurrencyOptions,
  ): string => {
    const rawNum = Number(value);
    const num = options?.convertToMajorCurrency
      ? AmountAction.koboToNaira(rawNum)
      : rawNum;

    if (isNaN(num)) return String(value);

    const effectiveLocale =
      options?.locale || AmountAction.getCurrencyLocaleMap(currency);
    const maxDigits = options?.maximumFractionDigits ?? (num % 1 === 0 ? 0 : 2);
    const minDigits = options?.minimumFractionDigits ?? (num % 1 === 0 ? 0 : 2);

    try {
      const formatted = new Intl.NumberFormat(effectiveLocale, {
        style: "currency",
        currency: currency,
        currencyDisplay: "symbol",
        maximumFractionDigits: maxDigits,
        minimumFractionDigits: minDigits,
      }).format(num);

      const customSymbol = CurrencySymbolMap[currency] || currency;
      return formatted.replace(currency, customSymbol).trim();
    } catch {
      const symbol = AmountAction.getCurrencySymbol(currency);
      return `${symbol}${num.toLocaleString(effectiveLocale, {
        maximumFractionDigits: maxDigits,
        minimumFractionDigits: minDigits,
      })}`;
    }
  };

  /**
   * Formats minimum order condition string.
   */
  static formatMinimumOrder(
    minOrderValue: number | string,
    currency?: string | null,
    options?: InferCurrencyOptions,
  ): string {
    const effCurrency = currency || AmountAction.inferCurrency(options || {});
    const symbol = AmountAction.getCurrencySymbol(effCurrency);
    const num = Number(minOrderValue);
    const formattedNum = isNaN(num) ? minOrderValue : num.toLocaleString();
    return `Min. order ${symbol}${formattedNum}`;
  }

  /**
   * Formats discount badge / callout header text (e.g. "20% OFF", "₦2,000 OFF", "FREE SHIPPING").
   */
  static formatDiscount(options: FormatDiscountOptions): string {
    const dtype = (options.discountType || "").toLowerCase();
    const val = options.discountValue;

    if (dtype.includes("percent") && val != null) {
      return `${val}% OFF`;
    }

    if (dtype.includes("shipping")) {
      return "FREE SHIPPING";
    }

    if (dtype.includes("bogo")) {
      return "BUY 1 GET 1";
    }

    if ((dtype.includes("fixed") || dtype.includes("amount")) && val != null) {
      const effCurrency = AmountAction.inferCurrency({
        currency: options.currency,
        text: options.text,
        countryOrRegion: options.region,
        domain: options.domain,
      });
      const symbol = AmountAction.getCurrencySymbol(effCurrency);
      const num = Number(val);
      const formattedVal = isNaN(num) ? val : num.toLocaleString();
      return `${symbol}${formattedVal} OFF`;
    }

    if (val != null) {
      return `${val}% OFF`;
    }

    return "DIRECT DEAL";
  }
}
