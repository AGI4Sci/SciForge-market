"use client";

import { useState } from "react";

type CopyStatus = "idle" | "copied" | "failed";

export function PluginActions({ pluginId }: { pluginId: string }) {
  const [status, setStatus] = useState<CopyStatus>("idle");

  async function copy() {
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(pluginId);
        ok = true;
      }
    } catch {
      ok = false;
    }
    if (!ok) {
      try {
        const area = document.createElement("textarea");
        area.value = pluginId;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        ok = document.execCommand("copy");
        document.body.removeChild(area);
      } catch {
        ok = false;
      }
    }
    setStatus(ok ? "copied" : "failed");
    window.setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <div className="plugin-actions">
      <code className="plugin-id">{pluginId}</code>
      <button type="button" className="market-action market-action-primary" onClick={copy}>
        {status === "copied" ? "已复制" : status === "failed" ? "复制失败" : "复制插件 ID"}
      </button>
      <p className="plugin-action-status" role="status" aria-live="polite">
        {status === "copied"
          ? "已复制到剪贴板。"
          : status === "failed"
            ? "复制失败：请手动选中上面的插件 ID 复制。"
            : ""}
      </p>
    </div>
  );
}