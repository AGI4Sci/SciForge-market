"use client";

import { useState } from "react";

export function PluginActions({ pluginId }: { pluginId: string }) {
  const [copied, setCopied] = useState(false);

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
    setCopied(ok);
    if (ok) window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="market-actions">
      <button type="button" className="market-action market-action-primary" onClick={copy}>
        {copied ? "已复制插件 ID" : "复制插件 ID"}
      </button>
      <button
        type="button"
        className="market-action market-action-disabled"
        disabled
        title="预览版暂不提供插件包下载；安装请在 SciForge 桌面端完成。"
      >
        下载暂未开放
      </button>
    </div>
  );
}