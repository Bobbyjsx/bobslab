import { useEffect, useState } from "react";

/**
 * Responsive media query hook to detect mobile viewport.
 */
export function useIsMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < breakpoint;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const onChange = () => {
      setIsMobile(mql.matches);
    };

    mql.addEventListener("change", onChange);
    setIsMobile(mql.matches);

    return () => {
      mql.removeEventListener("change", onChange);
    };
  }, [breakpoint]);

  return isMobile;
}
