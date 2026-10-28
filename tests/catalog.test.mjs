import assert from "node:assert/strict";
import test from "node:test";
import {
  EMPTY_FILTER,
  buildCatalogQuery,
  filterCatalog,
  normalizeQuery,
  parseCatalogFilter,
  uniqueValues,
} from "../lib/catalog-filter.ts";

const items = [
  {
    title: "文本统计",
    summary: "统计文本",
    kind: "plugin",
    categories: ["text", "utility"],
    features: ["统计字符"],
    scenarios: ["核对字数"],
    status: "documented",
  },
  {
    title: "Artifact Versions",
    summary: "科研制品版本",
    kind: "builtin",
    categories: ["research", "artifacts"],
    features: ["不可变版本"],
    scenarios: ["保存实验产物"],
    status: "integrated",
  },
  {
    title: "OpenSpec 探索",
    summary: "先探索需求",
    kind: "skill",
    categories: ["development"],
    features: ["问题探索"],
    scenarios: ["动手前梳理需求"],
    status: "development",
  },
  {
    title: "测试夹具",
    summary: "合成测试输入",
    kind: "fixture",
    categories: ["testing"],
    features: ["验证测试行为"],
    scenarios: ["回归测试"],
    status: "testing",
  },
];

const allowed = {
  kinds: uniqueValues(items.map((item) => item.kind)),
  categories: uniqueValues(items.flatMap((item) => item.categories)),
  statuses: uniqueValues(items.map((item) => item.status)),
};

test("normalizeQuery collapses whitespace and caps length", () => {
  assert.equal(normalizeQuery("  a   b  "), "a b");
  assert.equal(normalizeQuery("x".repeat(200)).length, 120);
});

test("parseCatalogFilter accepts known values and falls back safely", () => {
  assert.deepEqual(parseCatalogFilter("?type=builtin&category=research&status=integrated&q=%E7%89%88%E6%9C%AC", allowed), {
    query: "版本", kind: "builtin", category: "research", status: "integrated",
  });
  assert.deepEqual(parseCatalogFilter("?type=nope&category=nope&status=nope", allowed), EMPTY_FILTER);
});

test("buildCatalogQuery keeps the URL shareable", () => {
  assert.equal(buildCatalogQuery(EMPTY_FILTER), "");
  assert.equal(buildCatalogQuery({ query: "版本", kind: "builtin", category: "research", status: "integrated" }), "q=%E7%89%88%E6%9C%AC&type=builtin&category=research&status=integrated");
});

test("filterCatalog combines type, category, status and search", () => {
  assert.deepEqual(filterCatalog(items, { ...EMPTY_FILTER, query: "字符" }).map((item) => item.kind), ["plugin"]);
  assert.deepEqual(filterCatalog(items, { ...EMPTY_FILTER, kind: "builtin" }).map((item) => item.title), ["Artifact Versions"]);
  assert.deepEqual(filterCatalog(items, { ...EMPTY_FILTER, category: "testing" }).map((item) => item.kind), ["fixture"]);
  assert.deepEqual(filterCatalog(items, { ...EMPTY_FILTER, status: "development" }).map((item) => item.kind), ["skill"]);
  assert.deepEqual(filterCatalog(items, { ...EMPTY_FILTER, query: "需求", status: "development", category: "development" }).map((item) => item.kind), ["skill"]);
  assert.equal(filterCatalog(items, { query: "不存在" }).length, 0);
});