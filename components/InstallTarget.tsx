"use client";

import { useEffect, useState } from "react";

export type InstallTargetPlugin = Readonly<{
  slug: string;
  name: string;
  title: string;
}>;

/**
 * 从 URL 读取 ?plugin=<slug>，提示用户当前正在查看哪个插件的安装方式。
 * 未知 slug 安全忽略（不编造插件）。
 */
export function InstallTarget({ targets }: { targets: readonly InstallTargetPlugin[] }) {
  const [target, setTarget] = useState<InstallTargetPlugin | null>(null);

  useEffect(() => {
    const apply = () => {
      const slug = new URLSearchParams(window.location.search).get("plugin") ?? "";
      setTarget(targets.find((item) => item.slug === slug) ?? null);
    };
    apply();
    window.addEventListener("popstate", apply);
    return () => window.removeEventListener("popstate", apply);
  }, [targets]);

  if (!target) return null;

  return (
    <div className="install-target" role="status">
      <span>正在安装</span>
      <strong>{target.title}</strong>
      <code>{target.name}</code>
    </div>
  );
}