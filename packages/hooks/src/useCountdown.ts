import { useCallback, useEffect, useRef, useState } from "react";

export interface UseCountdownOptions {
  seconds: number;
  autoStart?: boolean;
  onComplete?: () => void;
  intervalMs?: number;
}

export function useCountdown({
  seconds,
  autoStart = false,
  onComplete,
  intervalMs = 1000,
}: UseCountdownOptions) {
  const [countdown, setCountdown] = useState(seconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const stop = useCallback(() => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const reset = useCallback(
    (newSeconds?: number) => {
      stop();
      setCountdown(newSeconds ?? seconds);
    },
    [seconds, stop],
  );

  useEffect(() => {
    if (!isRunning) return;

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          stop();
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, intervalMs, onComplete, stop]);

  return {
    countdown,
    isRunning,
    start,
    stop,
    reset,
  };
}
