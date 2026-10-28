import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const distRoot = new URL("../dist/client/", import.meta.url);

function outputUrl(path) {
  const outputPath = path === "/" ? "index.html" : `${path.slice(1)}/index.html`;
  return new URL(outputPath, distRoot);
}

async function render(path) {
  return readFile(outputUrl(path), "utf8");
}

async function data() {
  return JSON.parse(await readFile(new URL("../lib/market-public.json", import.meta.url), "utf8"));
}

test("exports a compact plugin directory homepage", async () => {
  const html = await render("/");
  assert.match(html, /发现科研插件/);
  assert.match(html, /为 SciForge 添加实用工具与科研能力/);
  assert.match(html, /文本统计/);
  assert.match(html, /科学单位换算/);
  assert.match(html, /统计文本的字符、词数、行数与段落/);
  assert.match(html, /全部插件 · 2/);
  assert.match(html, /查看详情/);
  assert.match(html, /搜索名称、简介、标签或插件 ID/);
  assert.match(html, /按分类筛选/);

  assert.doesNotMatch(html, /审阅预览版/);
  assert.doesNotMatch(html, /PLUGIN MARKET/);
  assert.doesNotMatch(html, /关于这份预览/);
  assert.doesNotMatch(html, /数据为构建时快照/);
});

test("header keeps only the market navigation with a subtle preview tag", async () => {
  const html = await render("/");
  assert.match(html, /预览版/);
  assert.match(html, /浏览插件/);
  assert.match(html, /安装指南/);
  assert.match(html, /SciForge 项目/);
  assert.doesNotMatch(html, /需求地图/);
  assert.doesNotMatch(html, /工程模块/);
  assert.doesNotMatch(html, /真实闭环/);
  assert.doesNotMatch(html, /提交需求/);
  assert.doesNotMatch(html, /科研 Agent 需求地图/);
});

test("exports full plugin detail pages with verified examples and technical section", async () => {
  const textStats = await render("/plugins/text-stats");
  for (const expected of [
    /适用场景/,
    /已验证示例/,
    /安装/,
    /权限与兼容性/,
    /技术信息（工具 ID、哈希、签名与许可）/,
    /text_stats_count/,
    /text-stats\.count/,
    /utf8Bytes 21/,
    /5cf0d386a15451436e1022d87b6e6e153be560e668e3e3bf08c47fa672ac37cd/,
    /ed25519/,
    /复制插件 ID/,
    /许可证/,
    /当前公开发行版（v0\.2\.16）尚未包含插件市场入口/,
  ]) {
    assert.match(textStats, expected);
  }
  assert.doesNotMatch(textStats, /审阅预览版/);
  assert.doesNotMatch(textStats, /下载暂未开放/);
  assert.doesNotMatch(textStats, /<button[^>]*\sdisabled/);

  const unitConversion = await render("/plugins/unit-conversion");
  assert.match(unitConversion, /unit_conversion_convert/);
  assert.match(unitConversion, /43ec39579bafc377d00382d5be7cd55d7a44ab14c500a13bd567511589ca42ef/);
  assert.match(unitConversion, /212/);
});

test("every plugin in the whitelist is rendered with matching version and hash", async () => {
  const payload = await data();
  for (const plugin of payload.plugins) {
    const html = await render(`/plugins/${plugin.slug}`);
    assert.ok(html.includes(plugin.title), plugin.slug);
    assert.ok(html.includes(plugin.version), plugin.slug);
    assert.ok(html.includes(plugin.sha256), plugin.slug);
    for (const tool of plugin.tools) {
      assert.ok(html.includes(tool.name), `${plugin.slug}:${tool.name}`);
    }
  }
});

test("exports the three-step install guide with accurate release status", async () => {
  const html = await render("/install");
  assert.match(html, /安装插件/);
  assert.match(html, /在 SciForge 桌面端完成安装/);
  assert.match(html, /打开扩展中心/);
  assert.match(html, /找到插件/);
  assert.match(html, /确认权限/);
  assert.match(html, /搜索插件名称或插件 ID/);
  assert.match(html, /v0\.2\.16/);
  assert.match(html, /没有/);
  assert.match(html, /请在 SciForge 桌面端安装。预览版暂不提供插件包下载/);
  assert.match(html, /仅批准你理解的权限/);
  assert.match(html, /找不到插件？/);
  assert.match(html, /版本不兼容？/);
  assert.match(html, /校验失败？/);
  assert.match(html, /兼容性与安全校验/);
  assert.match(html, /本站不执行插件安装/);
  assert.doesNotMatch(html, /开发与提交/);
  assert.match(html, /<details/);

  assert.doesNotMatch(html, /浏览器没有验签/);
  assert.doesNotMatch(html, /审阅预览版/);
});

test("footer carries data provenance without internal links", async () => {
  const html = await render("/");
  assert.match(html, /数据说明/);
  assert.match(html, /2026-10-25T04:01:14\.212Z/);
  assert.doesNotMatch(html, /contribute/);
  assert.doesNotMatch(html, /issues\/new/);
  assert.doesNotMatch(html, /market\/index\.json/);
});

test("exports a custom 404 page", async () => {
  const html = await readFile(new URL("../dist/client/404.html", import.meta.url), "utf8");
  assert.match(html, /页面不存在/);
  assert.match(html, /返回插件市场/);
});

test("每个页面有独立标题与分享元信息", async () => {
  const pages = [
    ["/", /发现科研插件/, /og:title" content="发现科研插件/],
    ["/install", /安装插件/, /og:title" content="安装插件/],
  ];
  for (const [path, title, og] of pages) {
    const html = await render(path);
    assert.match(html, title, path);
    assert.match(html, /<meta property="og:title"/, path);
    assert.match(html, og, path);
    assert.match(html, /<meta name="description"/, path);
  }
});

test("publishes no internal diagnostics, local paths or artifacts", async () => {
  const routes = [
    "/",
    "/plugins/text-stats",
    "/plugins/unit-conversion",
    "/install",
  ];
  for (const route of routes) {
    const html = await render(route);
    assert.doesNotMatch(html, /activation failed/i, route);
    assert.doesNotMatch(html, /capability ids are already provided/i, route);
    assert.doesNotMatch(html, /runtimeGap|blocked\b/i, route);
    assert.doesNotMatch(html, /\/Users\//, route);
    assert.doesNotMatch(html, /SCIFORGE_[A-Z_]+/, route);
  }

  const entries = await readdir(distRoot, { recursive: true });
  assert.equal(
    entries.filter((entry) => entry.endsWith(".sciforge-dsh-plugin")).length,
    0,
    "no plugin artifacts may be published",
  );
  assert.equal(
    entries.filter((entry) => entry.endsWith(".map")).length,
    0,
    "no source maps may be published",
  );

  for (const entry of entries) {
    if (!/\.(js|html|json|css)$/.test(entry)) continue;
    const content = await readFile(new URL(entry, distRoot), "utf8");
    assert.doesNotMatch(content, /sciforge-dsh-plugin|artifactFile/, entry);
  }
});