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

test("exports a compact plugin directory homepage", async () => {
  const html = await render("/");
  assert.match(html, /发现科研插件/);
  assert.match(html, /为 SciForge 添加实用工具与科研能力/);
  assert.match(html, /文本统计/);
  assert.match(html, /科学单位换算/);
  assert.match(html, /统计文本的字符、词数、行数与段落/);
  assert.match(html, /全部插件 · 2/);
  assert.match(html, /查看详情/);
  assert.match(html, /搜索插件/);
  assert.match(html, /按分类筛选/);

  // 不再有验收式文案与装饰标题
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

test("exports full plugin detail pages", async () => {
  const textStats = await render("/plugins/text-stats");
  for (const expected of [
    /用途/,
    /适用场景/,
    /真实示例/,
    /兼容版本/,
    /权限/,
    /text_stats_count/,
    /5cf0d386a15451436e1022d87b6e6e153be560e668e3e3bf08c47fa672ac37cd/,
    /ed25519/,
    /预览版暂不提供插件包下载/,
    /下载暂未开放/,
    /复制插件 ID/,
  ]) {
    assert.match(textStats, expected);
  }
  assert.doesNotMatch(textStats, /审阅预览版/);

  const unitConversion = await render("/plugins/unit-conversion");
  assert.match(unitConversion, /unit_conversion_convert/);
  assert.match(unitConversion, /43ec39579bafc377d00382d5be7cd55d7a44ab14c500a13bd567511589ca42ef/);
});

test("exports the three-step install guide with collapsible details", async () => {
  const html = await render("/install");
  assert.match(html, /安装插件/);
  assert.match(html, /在 SciForge 桌面端完成安装/);
  assert.match(html, /打开市场/);
  assert.match(html, /找到插件/);
  assert.match(html, /确认权限/);
  assert.match(html, /扩展中心/);
  assert.match(html, /点击 Install/);
  assert.match(html, /请在 SciForge 桌面端安装。预览版暂不提供插件包下载/);
  assert.match(html, /仅批准你理解的权限/);
  assert.match(html, /找不到插件？/);
  assert.match(html, /安装失败怎么办？/);
  assert.match(html, /兼容性与安全校验/);
  assert.match(html, /本站不执行插件安装/);
  assert.match(html, /<details/);

  // 不准确的绝对表述已删除
  assert.doesNotMatch(html, /浏览器没有验签/);
  assert.doesNotMatch(html, /审阅预览版/);
});

test("footer carries data provenance in a collapsed section", async () => {
  const html = await render("/");
  assert.match(html, /数据说明/);
  assert.match(html, /market\/index\.json/);
  assert.match(html, /2026-10-25T04:01:14\.212Z/);
});

test("publishes no internal diagnostics, local paths or artifacts", async () => {
  const routes = ["/", "/plugins/text-stats", "/plugins/unit-conversion", "/install"];
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