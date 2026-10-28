/**
 * 策划文案层（可读描述、场景、示例），按 slug 与白名单数据合并。
 *
 * 注意：版本 / 权限 / 哈希 / 兼容范围 **不在此文件**——它们由
 * scripts/export-market-data.mjs 从现有生成流程的产物导出（单一来源）。
 * 本文件只保存说明性文案；缺项一律以“待补”呈现，不编造。
 */

export type PluginCopy = Readonly<{
  listSummary: string;
  summary: string;
  useCases: readonly string[];
  examples: readonly Readonly<{ title: string; body: string }>[];
  licenseNote: string;
  notes: readonly string[];
}>;

export const pluginCopy: Readonly<Record<string, PluginCopy>> = {
  "text-stats": {
    listSummary: "统计文本的字符、词数、行数与段落。",
    summary: "统计字符数、中英文词数、行数、段落数与 UTF-8 字节数；纯本地计算，不联网、不读写文件。",
    useCases: [
      "投稿前核对字数口径：中文按字、英文按词，结果与口径一起返回，不用自己猜。",
      "统计审稿意见、基金申请书等长文本的规模与阅读时长估算。",
      "把“字数”写进方法学附录时，附上明确的计数规则与版本号（rulesVersion）。"
    ],
    examples: [
      {
        title: "统计一段中英混排文本",
        body: 'text_stats_count { "text": "SciForge 你好 world" }\n→ characters 17 · cjkCharacters 2 · latinWords 2 · words 4 · utf8Bytes 21'
      },
      {
        title: "查询完整口径与上限",
        body: "text_stats_explain {} → 返回计数规则、1,000,000 码点上限与三个可对照示例"
      }
    ],
    licenseNote: "待补（包内 package.json 未声明 license；仓库根许可为 Apache-2.0，插件是否单独授权待确认）",
    notes: ["纯本地计算：无网络、无文件读写、无账号要求。"]
  },
  "unit-conversion": {
    listSummary: "换算同维度科学单位，支持温度转换。",
    summary: "同维度单位的确定性换算，带维度检查与仿射温标处理；纯本地计算，不联网、不读写文件。",
    useCases: [
      "把实验记录里的单位统一到论文口径（如 eV ↔ J、mmHg ↔ kPa）。",
      "跨文献比较数值前先做同维度校验，避免 m → kg 这类静默错误。",
      "温度换算（C ↔ F ↔ K ↔ R）按仿射公式处理，不当作简单比例。"
    ],
    examples: [
      {
        title: "摄氏转华氏",
        body: 'unit_conversion_convert { "value": 100, "from": "C", "to": "F" }\n→ { "ok": true, "result": { "value": 212, "dimension": "temperature", "formatted": "212" } }'
      },
      {
        title: "列出支持的单位",
        body: "unit_conversion_list {} → 返回 7 个维度、各自的基准单位与示例"
      }
    ],
    licenseNote: "待补（包内 package.json 未声明 license；仓库根许可为 Apache-2.0，插件是否单独授权待确认）",
    notes: [
      "权限口径差异待补：插件 README 把 unit_conversion_list 标为 read，市场索引标为 compute；页面按索引声明展示，差异待维护者确认。"
    ]
  }
};