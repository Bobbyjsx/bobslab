import { describe, expect, it } from "vitest";
import {
  BREAKPOINTS,
  createConfig,
  getRequiredEnv,
  RADII,
  THEME_COLORS,
} from "../src/index";
import {
  base as eslintBase,
  reactInternal,
  next as eslintNext,
} from "../src/eslint/index";
import { prettierConfig } from "../src/prettier/index";
import biomeConfig from "../src/biome/biome.json";
import zedConfig from "../src/zed/settings.json";
import vscodeConfig from "../src/vscode/settings.json";
import tsBase from "../src/typescript/base.json";

describe("@bobslab/config", () => {
  it("exports theme colors referencing CSS variables", () => {
    expect(THEME_COLORS.primary).toBe("var(--primary)");
    expect(THEME_COLORS.secondary).toBe("var(--secondary)");
    expect(THEME_COLORS.accent).toBe("var(--accent)");
    expect(THEME_COLORS.background).toBe("var(--background)");
    expect(THEME_COLORS.foreground).toBe("var(--foreground)");
  });

  it("exports valid radii tokens", () => {
    expect(RADII.sm).toContain("0.25rem");
    expect(RADII["2xl"]).toContain("1rem");
    expect(RADII.full).toBe("9999px");
  });

  it("exports standard responsive breakpoints", () => {
    expect(BREAKPOINTS.sm).toBe("640px");
    expect(BREAKPOINTS.md).toBe("768px");
    expect(BREAKPOINTS.lg).toBe("1024px");
  });

  it("createConfig freezes config object", () => {
    const cfg = createConfig({
      name: "Bobslab Test",
      url: "https://bobslab.dev",
    });
    expect(cfg.name).toBe("Bobslab Test");
    expect(Object.isFrozen(cfg)).toBe(true);
  });

  it("getRequiredEnv returns fallback if key is not found", () => {
    const val = getRequiredEnv(
      "NON_EXISTENT_BOBSLAB_ENV_KEY",
      "fallback-value",
    );
    expect(val).toBe("fallback-value");
  });

  it("getRequiredEnv throws if key missing and no fallback provided", () => {
    expect(() => getRequiredEnv("NON_EXISTENT_BOBSLAB_ENV_KEY")).toThrow(
      "Missing required environment variable",
    );
  });

  it("exports shared toolchain configs", () => {
    expect(Array.isArray(eslintBase)).toBe(true);
    expect(Array.isArray(reactInternal)).toBe(true);
    expect(Array.isArray(eslintNext)).toBe(true);
    expect(prettierConfig.semi).toBe(true);
    expect(biomeConfig.formatter.enabled).toBe(true);
    expect(zedConfig.format_on_save).toBe("on");
    expect(vscodeConfig["editor.formatOnSave"]).toBe(true);
    expect(tsBase.compilerOptions.strict).toBe(true);
  });
});
