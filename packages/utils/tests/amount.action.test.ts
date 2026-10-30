import { describe, expect, it } from "vitest";
import { AmountAction, CurrencySymbolMap } from "../src/index";

describe("AmountAction", () => {
  describe("getCurrencyLocaleMap", () => {
    it("returns expected locales for specific currencies", () => {
      expect(AmountAction.getCurrencyLocaleMap("XOF")).toBe("fr");
      expect(AmountAction.getCurrencyLocaleMap("XAF")).toBe("fr");
      expect(AmountAction.getCurrencyLocaleMap("NGN")).toBe("en-NG");
      expect(AmountAction.getCurrencyLocaleMap("USD")).toBe("en");
    });
  });

  describe("koboToNaira and nairaToKobo", () => {
    it("converts kobo to naira", () => {
      expect(AmountAction.koboToNaira(100)).toBe(1);
      expect(AmountAction.koboToNaira(200000)).toBe(2000);
      expect(AmountAction.koboToNaira("1500")).toBe(15);
    });

    it("converts naira to kobo", () => {
      expect(AmountAction.nairaToKobo(1)).toBe(100);
      expect(AmountAction.nairaToKobo(2000)).toBe(200000);
      expect(AmountAction.nairaToKobo("15.5")).toBe(1550);
    });
  });

  describe("getCurrencySymbol", () => {
    it("returns correct symbol for NGN, USD, GBP, EUR", () => {
      expect(AmountAction.getCurrencySymbol("NGN")).toBe("₦");
      expect(AmountAction.getCurrencySymbol("USD")).toBe("$");
      expect(AmountAction.getCurrencySymbol("GBP")).toBe("£");
      expect(AmountAction.getCurrencySymbol("EUR")).toBe("€");
      expect(AmountAction.getCurrencySymbol("GHS")).toBe("GH₵");
      expect(AmountAction.getCurrencySymbol("KES")).toBe("Ksh");
      expect(AmountAction.getCurrencySymbol("ZAR")).toBe("R");
    });

    it("defaults to $ for empty or undefined", () => {
      expect(AmountAction.getCurrencySymbol(null)).toBe("$");
      expect(AmountAction.getCurrencySymbol(undefined)).toBe("$");
      expect(AmountAction.getCurrencySymbol("")).toBe("$");
    });
  });

  describe("inferCurrency", () => {
    it("preserves explicit currency if provided", () => {
      expect(AmountAction.inferCurrency({ currency: "NGN" })).toBe("NGN");
      expect(AmountAction.inferCurrency({ currency: "eur" })).toBe("EUR");
    });

    it("infers NGN from text with 'NGN' or '₦' or 'Naira'", () => {
      expect(
        AmountAction.inferCurrency({
          text: "Extra discount for orders over 20,000 NGN",
        }),
      ).toBe("NGN");
      expect(
        AmountAction.inferCurrency({
          text: "Save ₦5000 on your first purchase",
        }),
      ).toBe("NGN");
      expect(
        AmountAction.inferCurrency({
          text: "Get 2000 Naira off selected deals",
        }),
      ).toBe("NGN");
    });

    it("infers NGN from region restrictions like 'Nigeria' or 'NG'", () => {
      expect(
        AmountAction.inferCurrency({
          countryOrRegion: ["Nigeria"],
        }),
      ).toBe("NGN");
      expect(
        AmountAction.inferCurrency({
          countryOrRegion: "NG",
        }),
      ).toBe("NGN");
    });

    it("infers NGN from .ng merchant domains like 'jumia.com.ng'", () => {
      expect(
        AmountAction.inferCurrency({
          domain: "jumia.com.ng",
        }),
      ).toBe("NGN");
    });

    it("infers GBP from UK domain or text", () => {
      expect(
        AmountAction.inferCurrency({
          domain: "store.co.uk",
        }),
      ).toBe("GBP");
      expect(
        AmountAction.inferCurrency({
          text: "Save £10 on fashion",
        }),
      ).toBe("GBP");
    });

    it("defaults to USD if no indicators present", () => {
      expect(
        AmountAction.inferCurrency({
          text: "Save 20 off your total",
        }),
      ).toBe("USD");
    });
  });

  describe("formatDiscount", () => {
    it("formats percentage discounts", () => {
      expect(
        AmountAction.formatDiscount({
          discountType: "percentage",
          discountValue: 20,
        }),
      ).toBe("20% OFF");
    });

    it("resolves and formats Jumia Nigeria 2000 NGN deal correctly as ₦2,000 OFF", () => {
      const formatted = AmountAction.formatDiscount({
        discountType: "fixed_amount",
        discountValue: 2000,
        text: "Extra discount for orders over 20,000 NGN.",
        region: ["Nigeria"],
        domain: "jumia.com.ng",
      });
      expect(formatted).toBe("₦2,000 OFF");
    });

    it("formats free shipping and BOGO", () => {
      expect(
        AmountAction.formatDiscount({ discountType: "free_shipping" }),
      ).toBe("FREE SHIPPING");
      expect(AmountAction.formatDiscount({ discountType: "bogo" })).toBe(
        "BUY 1 GET 1",
      );
    });
  });

  describe("formatMinimumOrder", () => {
    it("formats minimum order with inferred NGN currency symbol", () => {
      const minOrderStr = AmountAction.formatMinimumOrder(20000, null, {
        text: "Extra discount for orders over 20,000 NGN",
        countryOrRegion: ["Nigeria"],
      });
      expect(minOrderStr).toBe("Min. order ₦20,000");
    });

    it("formats minimum order with explicit USD currency", () => {
      const minOrderStr = AmountAction.formatMinimumOrder(50, "USD");
      expect(minOrderStr).toBe("Min. order $50");
    });
  });
});
