import { describe, expect, it } from "vitest";
import {
  calculateGrossFromNet,
  capitalizeFirstLetter,
  cn,
  compactNumber,
  formatCurrency,
  formatDuration,
  formatSize,
  koboToNaira,
  nairaToKobo,
  pluralize,
  toCamelCase,
  toSnakeCase,
  keysToCamel,
  keysToSnake,
  timeAgo,
} from "../src/index";

describe("@bobslab/utils", () => {
  describe("cn", () => {
    it("merges classes correctly with tailwind-merge override", () => {
      expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
      expect(cn("text-red-500", false && "text-blue-500", "font-bold")).toBe(
        "text-red-500 font-bold",
      );
    });

    it("capitalizes first letter", () => {
      expect(capitalizeFirstLetter("hello")).toBe("Hello");
      expect(capitalizeFirstLetter("")).toBe("");
    });
  });

  describe("case-transform", () => {
    it("transforms snake_case and kebab-case to camelCase", () => {
      expect(toCamelCase("user_profile_id")).toBe("userProfileId");
      expect(toCamelCase("user-session-token")).toBe("userSessionToken");
    });

    it("transforms camelCase to snake_case", () => {
      expect(toSnakeCase("userProfileId")).toBe("user_profile_id");
    });

    it("deeply converts keys in nested objects and arrays", () => {
      const input = {
        user_name: "John Doe",
        account_details: {
          account_number: "123456",
          nested_items: [{ item_id: 1, item_name: "Test" }],
        },
        "model.version": "gpt-4",
      };

      const result = keysToCamel<any>(input);
      expect(result.userName).toBe("John Doe");
      expect(result.accountDetails.accountNumber).toBe("123456");
      expect(result.accountDetails.nestedItems[0].itemId).toBe(1);
      expect(result.accountDetails.nestedItems[0].itemName).toBe("Test");
      expect(result["model.version"]).toBe("gpt-4");

      const backToSnake = keysToSnake<any>(result);
      expect(backToSnake.user_name).toBe("John Doe");
      expect(backToSnake.account_details.account_number).toBe("123456");
    });
  });

  describe("formatters", () => {
    it("formats currency correctly", () => {
      const formatted = formatCurrency(200, "USD");
      expect(formatted).toContain("200.00");
    });

    it("converts kobo <-> naira", () => {
      expect(koboToNaira(50000)).toBe(500);
      expect(nairaToKobo(500)).toBe(50000);
    });

    it("formats file sizes", () => {
      expect(formatSize(0)).toBe("0 B");
      expect(formatSize(1024)).toBe("1 KB");
      expect(formatSize(1024 * 1024 * 2.5)).toBe("2.5 MB");
    });

    it("formats compact numbers", () => {
      expect(compactNumber(1500)).toBe("1.5K");
      expect(compactNumber(2500000)).toBe("2.5M");
    });

    it("pluralizes correctly", () => {
      expect(pluralize(1, "item")).toBe("item");
      expect(pluralize(2, "item")).toBe("items");
      expect(pluralize(2, "person", "people")).toBe("people");
    });

    it("formats durations", () => {
      expect(formatDuration(45)).toBe("00:45");
      expect(formatDuration(125)).toBe("02:05");
      expect(formatDuration(3665)).toBe("1:01:05");
    });

    it("formats relative timeAgo", () => {
      const now = new Date();
      expect(timeAgo(now)).toBe("just now");
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      expect(timeAgo(tenMinutesAgo)).toBe("10m ago");
    });
  });

  describe("math", () => {
    it("calculates gross from net with fee percentage", () => {
      // Net 95 with 5% fee -> 95 / 0.95 = 100
      expect(calculateGrossFromNet(95, 5)).toBe(100);
      // Net 100 with 10% fee and $5 flat fee -> (100 + 5) / 0.9 = 116.67
      expect(calculateGrossFromNet(100, 10, 5)).toBe(116.67);
    });
  });
});
