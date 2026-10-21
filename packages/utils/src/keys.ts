export function isMac(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform);
}

export function shortcutLabel(key: string): string {
  const mac = isMac();
  return key
    .replace(/\bctrl\b/gi, mac ? "⌃" : "Ctrl")
    .replace(/\bmeta\b|\bcmd\b/gi, mac ? "⌘" : "Ctrl")
    .replace(/\balt\b/gi, mac ? "⌥" : "Alt")
    .replace(/\bshift\b/gi, mac ? "⇧" : "Shift");
}
