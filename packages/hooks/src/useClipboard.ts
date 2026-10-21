import { useCallback, useState } from "react";
import { copyTextToClipboard } from "@bobslab/utils";

export interface UseClipboardOptions {
  timeout?: number;
}

export function useClipboard({ timeout = 2000 }: UseClipboardOptions = {}) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      const success = await copyTextToClipboard(text);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), timeout);
      }
      return success;
    },
    [timeout],
  );

  return { copied, copy };
}
