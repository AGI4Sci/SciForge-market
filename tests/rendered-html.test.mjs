import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const distRoot = new URL("../dist/client/", import.meta.url);
const payload = JSON.parse(await readFile(new URL("../lib/catalog-public.json", import.meta.url), "utf8"));

function outputUrl(path) {
  const outputPath = path === "/" ? "index.html" : `${path.slice(1)}/index.html`;
  return new URL(outputPath, distRoot);
}

async function render(path) {
  return readFile(outputUrl(path), "utf8");
}

test("homepage publishes all five groups and the full count", async () => {
  const html = await render("/");
  for (const expected of [
    /插件与能力目录/,
    /29/,
    /插件[\s\S]*5/,
    /内置模块[\s\S]*16/,
    /技能[\s\S]*4/,
    /模板[\s\S]*1/,
    /测试夹具[\s\S]*3/,
    /全部资源/,
    /搜索名称、用途或场景/,
    /业务分类/,
    /状态/,
  ]) assert.match(html, expected);
  assert.doesNotMatch(html, /打开扩展中心/);
  assert.doesNotMatch(html, /安装插件/);
  assert.doesNotMatch(html, /复制插件 ID/);
});

test("all 29 catalog details are directly exported", async () => {
  for (const item of payload.items) {
    const html = await render(`/catalog/${item.slug}`);
    assert.ok(html.includes(item.title), `${item.slug}: title`);
    assert.ok(html.includes(item.summary), `${item.slug}: summary`);
    assert.ok(html.includes(item.statusLabel), `${item.slug}: status`);
    for (const feature of item.features) assert.ok(html.includes(feature), `${item.slug}:${feature}`);
    assert.doesNotMatch(html, /SHA-256|sourceCommit|plugins\/|packages\//, item.slug);
    assert.doesNotMatch(html, /复制插件 ID|打开扩展中心/, item.slug);
  }
});

test("plugin, builtin, skill, template and fixture examples render their own framing", async () => {
  const plugin = await render("/catalog/text-stats");
  assert.match(plugin, /插件/);
  assert.match(plugin, /部分功能已验证|公开说明/);
  assert.match(plugin, /中英文统计规则/);

  const builtin = await render("/catalog/domain-artifact-versions");
  assert.match(builtin, /内置模块/);
  assert.match(builtin, /已集成/);
  assert.match(builtin, /核心能力/);

  const skill = await render("/catalog/skill-openspec-explore");
  assert.match(skill, /技能/);
  assert.match(skill, /开发资源/);
  assert.match(skill, /用于开发期间的 OpenSpec 工作/);

  const template = await render("/catalog/plugin-template");
  assert.match(template, /模板/);
  assert.match(template, /用于建立新插件/);

  const fixture = await render("/catalog/fixtures-test-fixtures");
  assert.match(fixture, /测试夹具/);
  assert.match(fixture, /测试资源/);
  assert.match(fixture, /供自动化测试使用/);
});

test("legacy plugin address guides to the new catalog detail without install data", async () => {
  const html = await render("/plugins/text-stats");
  assert.match(html, /地址已更新|旧地址仍然可以访问/);
  assert.match(html, /\/catalog\/text-stats/);
  assert.doesNotMatch(html, /SHA-256|复制插件 ID|打开扩展中心/);
});

test("help page describes the catalog and contains no install promise", async () => {
  const html = await render("/install");
  assert.match(html, /目录说明/);
  assert.match(html, /资源类型定义/);
  assert.match(html, /适配状态说明/);
  assert.match(html, /测试夹具/);
  assert.doesNotMatch(html, /打开扩展中心/);
  assert.doesNotMatch(html, /确认权限/);
  assert.doesNotMatch(html, /安装插件/);
});

test("custom 404 and share metadata remain present", async () => {
  const html = await readFile(new URL("../dist/client/404.html", import.meta.url), "utf8");
  assert.match(html, /页面不存在/);
  assert.match(html, /返回/);
  const home = await render("/");
  assert.match(home, /<meta property="og:title"/);
  assert.match(home, /<meta name="description"/);
});

test("no internal paths, hashes, artifacts or source maps are published", async () => {
  const pages = ["/", "/install", ...payload.items.map((item) => `/catalog/${item.slug}`)];
  const routes = [...pages, ...pages.map((path) => path === "/" ? "/en" : `/en${path}`)];
  for (const route of routes) {
    const html = await render(route);
    assert.doesNotMatch(html, /\/Users\//, route);
    assert.doesNotMatch(html, /SCIFORGE_[A-Z_]+/, route);
    assert.doesNotMatch(html, /sha256|sourceCommit|artifactFile|candidate\//i, route);
    assert.doesNotMatch(html, /internal-market|SciForge_private/, route);
  }
  const entries = await readdir(distRoot, { recursive: true });
  assert.equal(entries.filter((entry) => entry.endsWith(".sciforge-dsh-plugin")).length, 0);
  assert.equal(entries.filter((entry) => entry.endsWith(".map")).length, 0);
  assert.equal(entries.filter((entry) => entry.endsWith(".sciforge-plugin")).length, 0);
});

test("both languages publish every resource and keep the scope note in the footer", async () => {
  const english = JSON.parse(await readFile(new URL("../lib/catalog-public.en.json", import.meta.url), "utf8"));
  assert.deepEqual(Object.keys(english).sort(), payload.items.map(item => item.slug).sort());
  const pages = [["/", "Plugins and capabilities"], ["/install", "Resource types"],
    ...payload.items.map(item => [`/catalog/${item.slug}`, english[item.slug].summary])];

  for (const [route, translation] of pages) {
    const zh = await render(route);
    const en = await render(route === "/" ? "/en" : `/en${route}`);
    assert.match(zh, /<html[^>]*lang="zh-CN"/);
    assert.match(en, /<html[^>]*lang="en"/);
    assert.match(zh, /<footer[^>]*>[\s\S]*公开能力目录 · 仅展示组件元数据与适配状态/);
    assert.doesNotMatch(zh, /暂不提供下载|不提供下载|怎么看目录|受治理的|界面目标|候选制品|不是正式发行版/);
    assert.match(en, /Component metadata and integration status/);
    assert.ok(en.includes(translation.replaceAll("'", "&#x27;")), route);
  }
});
