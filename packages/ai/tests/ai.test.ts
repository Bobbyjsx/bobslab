import { describe, expect, it } from "vitest";
import {
  decodePromptContent,
  encodePromptContent,
  extractActiveMention,
  formatCountdown,
  formatPromptTag,
  parseEventPayload,
  parsePromptTags,
  parseSseBlock,
  sanitizeStreamErrorText,
  tokenizePromptText,
} from "../src/index";

describe("@bobslab/ai", () => {
  describe("streaming & SSE", () => {
    it("parses valid SSE blocks", () => {
      const raw = 'event: message\ndata: {"text":"hello world"}';
      const parsed = parseSseBlock(raw);
      expect(parsed).not.toBeNull();
      expect(parsed?.event).toBe("message");

      const payload = parseEventPayload(parsed!.data);
      expect(payload?.text).toBe("hello world");
    });

    it("sanitizes sensitive tokens and internal traces from errors", () => {
      expect(
        sanitizeStreamErrorText("Error with api_key=sk-12345 secret key"),
      ).toBe(
        "The AI service is temporarily unavailable. Please try again or select another model.",
      );

      expect(
        sanitizeStreamErrorText("Model was deprecated", "MODEL_NOT_FOUND"),
      ).toBe(
        "This model is no longer available. Please pick a different model and try again.",
      );
    });
  });

  describe("prompts", () => {
    it("encodes and decodes prompt contents safely", () => {
      const original = "Write a unit test for @bobslab/ai";
      const b64 = encodePromptContent(original);
      const decoded = decodePromptContent(b64);
      expect(decoded).toBe(original);
    });

    it("formats and parses prompt tags in text", () => {
      const tag = formatPromptTag({
        id: "p1",
        title: "Test Prompt",
        prompt: "System instructions here",
      });

      const message = `Please apply ${tag} to this code.`;
      const parsed = parsePromptTags(message);

      expect(parsed.cleanText).toBe("Please apply  to this code.");
      expect(parsed.tags.length).toBe(1);
      expect(parsed.tags[0]?.id).toBe("p1");
      expect(parsed.tags[0]?.title).toBe("Test Prompt");
      expect(parsed.tags[0]?.promptText).toBe("System instructions here");
    });

    it("tokenizes prompt text into parts", () => {
      const tag = formatPromptTag({ id: "p1", title: "P1", prompt: "Hello" });
      const parts = tokenizePromptText(`Prefix ${tag} Suffix`);
      expect(parts.length).toBe(3);
      expect(parts[0]?.type).toBe("text");
      expect(parts[1]?.type).toBe("prompt");
      expect(parts[2]?.type).toBe("text");
    });

    it("extracts active @mention queries at cursor position", () => {
      const mention = extractActiveMention("Hello @refactor", 15);
      expect(mention).not.toBeNull();
      expect(mention?.query).toBe("refactor");
    });
  });

  describe("quota & countdown", () => {
    it("formats relative reset countdowns", () => {
      const now = Date.now();
      const future = new Date(
        now + 2 * 3600 * 1000 + 15 * 60 * 1000,
      ).toISOString();
      const text = formatCountdown(future, now);
      expect(text).toContain("2h 15m");
    });
  });
});
