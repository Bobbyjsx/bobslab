import { useEffect, useRef } from "react";

/**
 * Automatically scrolls container to bottom on dependency changes.
 */
export function useChatScroll<T>(
  dependency: T,
): React.RefObject<HTMLDivElement | null> {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [dependency]);

  return containerRef;
}
