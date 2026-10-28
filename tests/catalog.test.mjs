import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCatalogQuery,
  categoriesOf,
  filterCards,
  normalizeQuery,
  parseCatalogState,
} from "../lib/catalog.ts";

const labels = { text: "文本", utility: "实用工具", science: "科学计算" };
const cards = [
  {
    slug: "text-stats",
    name: "@sciforge/plugin-text-stats",
    title: "文本统计",
    listSummary: "统计文本的字符、词数、行数与段落。",
    publisher: "sciforge-market",
    categories: ["text", "utility"],
  },
  {
    slug: "unit-conversion",
    name: "@sciforge/plugin-unit-conversion",
    title: "科学单位换算",
    listSummary: "换算同维度科学单位，支持温度转换。",
    publisher: "sciforge-market",
    categories: ["science", "utility"],
  },
];

test("normalizeQuery 去首尾空白、压缩空白、限制长度", () => {
  assert.equal(normalizeQuery("  单位   换算 "), "单位 换算");
  assert.equal(normalizeQuery("x".repeat(200)).length, 120);
});

test("parseCatalogState 对未知分类安全回退", () => {
  assert.deepEqual(parseCatalogState("?q=%20单位%20&category=nope", ["text", "utility", "science"]), {
    query: "单位",
    category: "all",
  });
  assert.deepEqual(parseCatalogState("?category=science", ["text", "utility", "science"]), {
    query: "",
    category: "science",
  });
});

test("buildCatalogQuery 只在非默认值时输出参数", () => {
  assert.equal(buildCatalogQuery({ query: "", category: "all" }), "");
  assert.equal(buildCatalogQuery({ query: "单位", category: "all" }), "q=%E5%8D%95%E4%BD%8D");
  assert.equal(
    buildCatalogQuery({ query: "", category: "text" }),
    "category=text",
  );
});

test("filterCards 支持名称/ID/简介/标签，且大小写无关", () => {
  assert.deepEqual(filterCards(cards, { query: "TEXT-STATS", category: "all" }, labels).map((c) => c.slug), [
    "text-stats",
  ]);
  assert.deepEqual(filterCards(cards, { query: "温度", category: "all" }, labels).map((c) => c.slug), [
    "unit-conversion",
  ]);
  assert.deepEqual(filterCards(cards, { query: "实用工具", category: "all" }, labels).map((c) => c.slug), [
    "text-stats",
    "unit-conversion",
  ]);
});

test("filterCards 的搜索与分类组合生效", () => {
  assert.deepEqual(filterCards(cards, { query: "单位", category: "text" }, labels), []);
  assert.deepEqual(filterCards(cards, { query: "单位", category: "science" }, labels).map((c) => c.slug), [
    "unit-conversion",
  ]);
});

test("categoriesOf 只返回有内容的分类，去重保序", () => {
  assert.deepEqual(categoriesOf(cards), ["text", "utility", "science"]);
});