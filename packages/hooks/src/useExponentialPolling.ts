import { useCallback, useEffect, useRef, useState } from "react";

export interface ExponentialPollingOptions {
  baseDelay?: number;
  maxDelay?: number;
  factor?: number;
  enabled?: boolean;
}

/**
 * Polls an async operation with exponential backoff until it resolves to true or is disabled.
 */
export function useExponentialPolling(
  callback: () => Promise<boolean>,
  {
    baseDelay = 1000,
    maxDelay = 30000,
    factor = 1.5,
    enabled = true,
  }: ExponentialPollingOptions = {},
) {
  const [isPolling, setIsPolling] = useState(enabled);
  const currentDelayRef = useRef(baseDelay);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const stop = useCallback(() => {
    setIsPolling(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  const poll = useCallback(async () => {
    try {
      const isComplete = await callback();
      if (isComplete) {
        stop();
        return;
      }
    } catch {
      // Continue polling with backoff on failure
    }

    currentDelayRef.current = Math.min(
      currentDelayRef.current * factor,
      maxDelay,
    );

    timerRef.current = setTimeout(poll, currentDelayRef.current);
  }, [callback, factor, maxDelay, stop]);

  useEffect(() => {
    if (enabled) {
      currentDelayRef.current = baseDelay;
      setIsPolling(true);
      timerRef.current = setTimeout(poll, baseDelay);
    } else {
      stop();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [enabled, baseDelay, poll, stop]);

  return { isPolling, stop };
}
