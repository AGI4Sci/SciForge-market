# SciForge 插件市场（独立站 · 审阅预览版）

独立于"科研 Agent 需求地图"站点的市场资料页：浏览插件、查看详情、安装指南。
不购买服务器、不引入后台；构建为纯静态导出，部署走 GitHub Pages（分支模式）。

## 范围（本期）

- 只发布公开审阅页面：列表、搜索/分类、插件详情、安装指南。
- 不上传插件制品、不开放真实下载；安装与验签以桌面端市场为准。
- 不包含未上架插件及其内部原因；不放本机路径、凭据、发布密钥。
- 本仓库不手工维护插件的版本 / 权限 / 哈希——见下节数据管线。

## 数据管线

站点展示的技术字段由发布流程导出，而不是在本仓库手工维护：

1. 在受控的发布流程中生成市场索引。
2. 本仓 `scripts/export-market-data.mjs` 按公开白名单导出为 `lib/market-public.json`：

```bash
node scripts/export-market-data.mjs \
  --index     <index.json> \
  --plugins   <plugins-dir> \
  --artifacts <artifacts-dir> \
  --commit    <source-commit> \
  --out       lib/market-public.json
```

- 导出字段（白名单）：`slug/name/title/version/publisher/categories/tools(name,id,effect)/`
  `hostDependencies/sizeBytes/sha256/artifactFile/engineRange/signature(algorithm,publisherId)`。
- 不导出：未上架清单、内部路径、入口实现、运行时诊断、签名本体。
- 字段缺失或形状不符时脚本直接失败，不猜、不补。
- `lib/plugin-copy.ts` 只保存说明性文案（摘要、场景、示例、许可备注），与白名单数据合并渲染。

## 本地开发与验证

```bash
npm ci
npm run dev          # 本地预览（默认 http://localhost:3000/）
npm run build:pages  # 静态导出到 dist/client（GITHUB_PAGES=true）
npm test             # build:pages + 渲染断言
npm run lint
```

预览线上路径（带 basePath）时：

```bash
SITE_BASE_PATH=/<repo-name> npm run build:pages
# 产物在 dist/client；把 dist/client 挂到 /<repo-name>/ 下即可核对线上形态
```

## 部署（GitHub Pages · 分支模式）

不依赖 GitHub Actions。发布分支是 `gh-pages`，Pages 源设为该分支根目录。

```bash
SITE_BASE_PATH=/SciForge-market npm run build:pages
# 把 dist/client 的全部文件 + .nojekyll 提交到 gh-pages 分支根目录
```

- 预期地址：`https://agi4sci.github.io/SciForge-market/`（以部署后实测为准）
- 回退：把 `gh-pages` 恢复到上一版产物并重推；或删除该分支的部署提交。

## 截图

- [首页（桌面）](docs/screenshots/home-1440.png)
- [详情页（桌面）](docs/screenshots/detail-1440.png)
- [安装指南（桌面）](docs/screenshots/install-1440.png)
- [首页（手机）](docs/screenshots/home-390.png)
- [详情页（手机）](docs/screenshots/detail-390.png)
- [安装指南（手机）](docs/screenshots/install-390.png)
- [页面不存在（桌面）](docs/screenshots/404-1440.png)