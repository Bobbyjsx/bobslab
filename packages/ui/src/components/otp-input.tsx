import * as React from "react";
import { cn } from "@bobslab/utils";

export interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  hasError?: boolean;
  className?: string;
}

export function OtpInput({
  value = "",
  onChange,
  length = 6,
  disabled = false,
  hasError = false,
  className,
}: OtpInputProps) {
  const inputsRef = React.useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    if (!raw) return;
    const chars = raw.split("");
    const arr = value.padEnd(length, " ").split("");
    chars.forEach((char, i) => {
      const pos = idx + i;
      if (pos < length) arr[pos] = char;
    });
    const next = arr.slice(0, length).join("").replace(/ /g, "");
    onChange(next);
    const nextIdx = Math.min(idx + chars.length, length - 1);
    inputsRef.current[nextIdx]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace") {
      if (value[idx]) {
        const arr = value.split("");
        arr[idx] = "";
        onChange(arr.join(""));
      } else if (idx > 0) {
        const arr = value.split("");
        arr[idx - 1] = "";
        onChange(arr.join(""));
        inputsRef.current[idx - 1]?.focus();
      }
      e.preventDefault();
    } else if (e.key === "Delete") {
      const arr = value.split("");
      arr[idx] = "";
      onChange(arr.join(""));
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
      e.preventDefault();
    } else if (e.key === "ArrowRight" && idx < length - 1) {
      inputsRef.current[idx + 1]?.focus();
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
    if (!pasted) return;
    const newVal = pasted.slice(0, length);
    onChange(newVal);
    const nextIdx = Math.min(newVal.length, length - 1);
    inputsRef.current[nextIdx]?.focus();
  };

  return (
    <div
      role="group"
      aria-label="Verification code"
      className={cn("flex gap-2 sm:gap-3 justify-center select-none", className)}
    >
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          disabled={disabled}
          value={value[i] ?? ""}
          autoComplete="one-time-code"
          aria-label={`Digit ${i + 1} of ${length}`}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          className={cn(
            "w-11 h-14 sm:w-12 sm:h-14 text-center text-xl font-semibold rounded-xl border transition-all duration-150 outline-none",
            "bg-background text-foreground shadow-2xs",
            !hasError && "border-border hover:border-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20",
            hasError && "border-destructive ring-1 ring-destructive text-destructive",
            disabled && "opacity-40 cursor-not-allowed",
          )}
        />
      ))}
    </div>
  );
}
