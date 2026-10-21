export interface PromptItem {
  id: string;
  title: string;
  prompt: string;
  category?: string;
  tags?: string[];
}

export const PROMPT_TAG_REGEX =
  /\[prompt:([^|\]]+)\|([^|\]]+)(?:\|([^\]]*))?\]/g;

export interface ParsedPromptTag {
  id: string;
  title: string;
  rawTag: string;
  promptText?: string;
}

export type PromptTextPart =
  { type: "text"; text: string } | { type: "prompt"; tag: ParsedPromptTag };

export function encodePromptContent(text: string): string {
  try {
    return btoa(
      encodeURIComponent(text).replace(/%([0-9A-F]{2})/g, (_, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      }),
    );
  } catch {
    return "";
  }
}

export function decodePromptContent(b64: string): string {
  try {
    return decodeURIComponent(
      Array.prototype.map
        .call(atob(b64), (c: string) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );
  } catch {
    return "";
  }
}

export function formatPromptTag(item: PromptItem): string {
  const b64 = encodePromptContent(item.prompt);
  return `[prompt:${item.id}|${item.title}|${b64}]`;
}

export function parsePromptTags(text: string): {
  cleanText: string;
  tags: ParsedPromptTag[];
} {
  const tags: ParsedPromptTag[] = [];
  const cleanText = text
    .replace(PROMPT_TAG_REGEX, (raw, id, title, b64) => {
      tags.push({
        id,
        title,
        rawTag: raw,
        promptText: b64 ? decodePromptContent(b64) : undefined,
      });
      return "";
    })
    .trim();

  return { cleanText, tags };
}

export function tokenizePromptText(text: string): PromptTextPart[] {
  const parts: PromptTextPart[] = [];
  const regex = new RegExp(PROMPT_TAG_REGEX.source, "g");
  let cursor = 0;

  for (const match of text.matchAll(regex)) {
    const index = match.index ?? 0;
    if (index > cursor) {
      parts.push({ type: "text", text: text.slice(cursor, index) });
    }

    const [rawTag = "", id = "", title = "", b64] = match;
    parts.push({
      type: "prompt",
      tag: {
        id,
        title,
        rawTag,
        promptText: b64 ? decodePromptContent(b64) : undefined,
      },
    });
    cursor = index + rawTag.length;
  }

  if (cursor < text.length) {
    parts.push({ type: "text", text: text.slice(cursor) });
  }

  return parts.length > 0 ? parts : [{ type: "text", text }];
}

export interface ActiveMention {
  query: string;
  startIndex: number;
  endIndex: number;
}

export function extractActiveMention(
  text: string,
  cursorPos?: number,
): ActiveMention | null {
  const position = cursorPos !== undefined ? cursorPos : text.length;
  const beforeCursor = text.slice(0, position);

  const match = /(?:^|\s)@([^\n@]*[^\n@ ])$|(?:^|\s)@()$/.exec(beforeCursor);
  if (!match) return null;

  const query = match[1] ?? match[2] ?? "";
  if (query.length > 80) return null;

  const startIndex = beforeCursor.length - query.length - 1;
  return {
    query,
    startIndex,
    endIndex: position,
  };
}
