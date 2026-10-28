# SciForge 插件与能力目录

公开静态目录，展示 SciForge 的插件、内置模块、技能、模板与测试夹具。  
不提供下载、安装按钮或插件制品；访问公开，插件运行时的安装、签名、哈希、权限和工作区隔离检查仍由桌面端负责。

## 范围

- 公开条目：45 条 = 插件 11 + 内置模块 26 + 技能 4 + 模板 1 + 测试夹具 3 组。
- 每条包含：名称、类型、用途、核心能力、典型场景、概括性状态，以及适用的关联关系。
- 测试夹具按 3 组展示，不把组内文件逐个算作插件；模板和技能明确标为开发资源。
- 不公开私有源码、仓库链接、内部 PR、候选制品、哈希、内部 commit、测试发布者、日志、本机路径或未脱敏科研资料。
- 未获许可的第三方素材不放入站点。

## 数据

`lib/catalog-public.json` 是经过字段白名单和人工文案审核的公开展示数据，不是内部 inventory 或候选报告的直接拷贝。  
`scripts/check-catalog-data.mjs` 会校验条目数量、类型计数、唯一 slug、必需文案，以及内部路径、摘要和候选字段的禁止项。

```bash
npm ci
npm run dev
npm run lint
npm test             # 数据检查 + 静态导出 + 14 项渲染/数据断言
npm run build:pages  # 校验数据 + 默认 /SciForge-market 静态导出 + base path 守卫
```

## 部署

GitHub Pages 使用 `gh-pages` 分支根目录，页面源码在 `main`：

```bash
SITE_BASE_PATH=/SciForge-market npm run build:pages
# 把 dist/client 的产物提交到 gh-pages
```

地址：<https://agi4sci.github.io/SciForge-market/>

## 截图

- [首页（桌面）](docs/screenshots/home-1440.png)
- [插件详情（桌面）](docs/screenshots/detail-1440.png)
- [目录说明（桌面）](docs/screenshots/install-1440.png)
- [首页（手机）](docs/screenshots/home-390.png)
- [详情（手机）](docs/screenshots/detail-390.png)
- [目录说明（手机）](docs/screenshots/install-390.png)
- [页面不存在（桌面）](docs/screenshots/404-1440.png)