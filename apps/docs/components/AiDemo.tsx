"use client";

import * as React from "react";
import {
  formatPromptTag,
  parsePromptTags,
  tokenizePromptText,
} from "@bobslab/ai";
import { Button } from "@bobslab/ui";

export function AiDemo() {
  const [inputText, setInputText] = React.useState(
    "Please run [prompt:code-review|Security Audit|UmV2aWV3IHRoaXMgZGlmZiBmb3Igc2VjdXJpdHkgaW52YXJpYW50cw==] on our latest pull request.",
  );

  const { cleanText, tags } = parsePromptTags(inputText);
  const _tokens = tokenizePromptText(inputText);

  const handleInsertTag = () => {
    const newTag = formatPromptTag({
      id: "unit-tests",
      title: "Write Tests",
      prompt: "Generate unit tests with Vitest for all modified functions.",
    });
    setInputText((prev) => `${prev} ${newTag}`);
  };

  return (
    <div className="w-full my-6 flex flex-col gap-6 rounded-2xl border border-border bg-background p-6 shadow-xs">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
            Prompt Tag Encoder / Decoder
          </label>
          <Button size="xs" variant="outline" onClick={handleInsertTag}>
            + Insert Prompt Tag
          </Button>
        </div>
        <textarea
          rows={3}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full rounded-xl border border-border bg-muted/20 p-3 text-xs font-mono text-foreground outline-none focus:border-primary"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border p-4 bg-muted/30 space-y-2">
          <span className="text-xs font-semibold text-foreground">
            Cleaned Text (Tags Stripped)
          </span>
          <p className="text-xs text-muted-foreground">{cleanText}</p>
        </div>

        <div className="rounded-xl border border-border p-4 bg-muted/30 space-y-2">
          <span className="text-xs font-semibold text-foreground">
            Extracted Tags ({tags.length})
          </span>
          {tags.map((t) => (
            <div
              key={t.id}
              className="rounded border border-border bg-background p-2 text-xs space-y-0.5"
            >
              <div className="font-semibold text-primary">{t.title}</div>
              <div className="text-[11px] text-muted-foreground">
                ID: {t.id}
              </div>
              <div className="text-[11px] font-mono text-foreground italic">
                &ldquo;{t.promptText}&rdquo;
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
