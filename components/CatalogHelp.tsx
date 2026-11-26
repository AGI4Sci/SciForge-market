import { catalogSnapshot } from "@/lib/catalog-data";
import { kindLabels, siteCopy, statusLabels, type Locale } from "@/lib/locale";

const glossary = {
  zh: {
    resourceHeading: "资源类型定义",
    statusHeading: "适配状态说明",
    types: {
      plugin: "独立维护的扩展，给桌面客户端增加专项功能。",
      builtin: "桌面客户端源码中的功能模块。",
      skill: "供 Agent 参考的任务步骤和操作规则。",
      template: "新建插件时可直接沿用的项目结构。",
      fixture: "供自动化测试使用的样例文件与场景。",
    },
    statuses: {
      partial: "测试构建已验证详情页列出的部分功能。",
      verified: "详情页列出的功能已在测试构建中验证。",
      adapting: "组件正在接入桌面客户端或开展联合测试。",
      documented: "已公开功能介绍和使用范围。",
      integrated: "已并入桌面客户端源码。",
      development: "用于开发插件或执行开发任务。",
      testing: "供自动化测试使用。",
    },
  },
  en: {
    resourceHeading: "Resource types",
    statusHeading: "What each status means",
    types: {
      plugin: "An independently maintained extension that adds a specific desktop capability.",
      builtin: "A module in the desktop client source.",
      skill: "Task instructions and working rules for an agent.",
      template: "A project structure you can reuse when creating a plugin.",
      fixture: "Sample files and scenarios for automated tests.",
    },
    statuses: {
      partial: "Some of the features listed on the detail page have passed tests.",
      verified: "The features listed on the detail page were verified in a test build.",
      adapting: "The component is being integrated or tested with the desktop client.",
      documented: "The component's capabilities and intended uses are documented.",
      integrated: "Part of the desktop client source.",
      development: "Used to develop plugins or carry out development tasks.",
      testing: "Used by automated tests.",
    },
  },
} as const;

export function CatalogHelp({ locale }: { locale: Locale }) {
  const copy = glossary[locale];
  return (
    <main id="main-content">
      <section className="market-hero">
        <div className="install-shell"><h1>{siteCopy[locale].about}</h1></div>
      </section>
      <div className="market-body">
        <div className="install-shell market-detail-grid">
          <section className="market-panel">
            <h2>{copy.resourceHeading}</h2>
            <dl className="catalog-definitions">
              {(Object.keys(copy.types) as (keyof typeof copy.types)[]).map((kind) => (
                <div key={kind}>
                  <dt>{kindLabels[locale][kind]} <span>{catalogSnapshot.counts[kind]}</span></dt>
                  <dd>{copy.types[kind]}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="market-panel">
            <h2>{copy.statusHeading}</h2>
            <dl className="catalog-definitions">
              {(Object.keys(copy.statuses) as (keyof typeof copy.statuses)[]).map((status) => (
                <div key={status}><dt>{statusLabels[locale][status]}</dt><dd>{copy.statuses[status]}</dd></div>
              ))}
            </dl>
          </section>
        </div>
      </div>
    </main>
  );
}
