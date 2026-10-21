import type { AgentRuntimeAdapter } from "./adapter.interface.js";
import { AntigravityRuntimeAdapter } from "./antigravity.adapter.js";
import { CodexRuntimeAdapter } from "./codex.adapter.js";

export class RuntimeRegistry {
  private adapters: Map<string, AgentRuntimeAdapter> = new Map();
  private primaryProvider: "antigravity" | "codex" = "antigravity";

  constructor(preferredProvider?: "antigravity" | "codex") {
    const agy = new AntigravityRuntimeAdapter();
    const codex = new CodexRuntimeAdapter();

    this.adapters.set("antigravity", agy);
    this.adapters.set("codex", codex);

    if (preferredProvider) {
      this.primaryProvider = preferredProvider;
    }
  }

  getAdapter(provider?: "antigravity" | "codex"): AgentRuntimeAdapter {
    const target = provider ?? this.primaryProvider;
    const adapter = this.adapters.get(target);
    if (!adapter) {
      // Fallback to antigravity or first available
      return this.adapters.get("antigravity")!;
    }
    return adapter;
  }

  registerCustomAdapter(provider: string, adapter: AgentRuntimeAdapter): void {
    this.adapters.set(provider, adapter);
  }
}
