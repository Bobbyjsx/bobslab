// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useCountdown, useDebounce, useLocalStorage } from "../src/index";

describe("@bobslab/hooks", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    window.localStorage.clear();
  });

  describe("useDebounce", () => {
    it("debounces value changes", () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        {
          initialProps: { value: "first", delay: 500 },
        },
      );

      expect(result.current).toBe("first");

      rerender({ value: "second", delay: 500 });
      expect(result.current).toBe("first");

      act(() => {
        vi.advanceTimersByTime(250);
      });
      expect(result.current).toBe("first");

      act(() => {
        vi.advanceTimersByTime(250);
      });
      expect(result.current).toBe("second");
    });
  });

  describe("useLocalStorage", () => {
    it("reads initial value and updates localStorage on change", () => {
      const { result } = renderHook(() =>
        useLocalStorage("test-key", "default-val"),
      );

      expect(result.current[0]).toBe("default-val");

      act(() => {
        result.current[1]("updated-val");
      });

      expect(result.current[0]).toBe("updated-val");
      expect(window.localStorage.getItem("test-key")).toBe(
        JSON.stringify("updated-val"),
      );
    });
  });

  describe("useCountdown", () => {
    it("counts down when running and triggers onComplete", () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() =>
        useCountdown({
          seconds: 3,
          autoStart: true,
          intervalMs: 1000,
          onComplete,
        }),
      );

      expect(result.current.countdown).toBe(3);
      expect(result.current.isRunning).toBe(true);

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(result.current.countdown).toBe(2);

      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(result.current.countdown).toBe(0);
      expect(result.current.isRunning).toBe(false);
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });
});
