# Changelog — AI EDA Bridge Extension

## [1.2.0] — 2026-03-18

### Added
- **AI 助手面板**（`ai-panel.html`）：4-Tab 全功能面板
  - 仪表盘：连接状态、文档类型、器件数/网络数/导线数/DRC 违规数
  - 快捷操作：12 个一键按钮（审查原理图、审查 PCB、运行 DRC、搜索元件、导出 Gerber 等）
  - 活动日志：命令执行历史，支持 OK/ERR 筛选
  - 关于页：项目信息、版本、Skill 列表
- 菜单入口 "AI 助手面板" 添加到 home/sch/pcb 三个上下文
- Dashboard 数据自动采集（每 5 秒刷新器件数/网络数等）

### Fixed
- `schematic-write.ts`：修复 modify_attribute 大小写问题（Designator→designator）
- `createNetFlag`/`createNetPort` 类型错误修复

### Changed
- `extension.json` categories 改为 `["Schematic", "PCB", "Project"]`
- 补全 repository/homepage/bugs URL
- 增加关键词：Claude、自动化、原理图审查、PCB

## [1.1.0] — 2026-03-15

### Added
- **状态面板**（`panel.html`）：连接状态、命令统计、日志
- **端口配置**：自定义 WebSocket 端口（对话框输入 1024-65535）
- **启动自动连接**：加载时自动读取存储的端口配置并连接
- **右键菜单 AI 操作**：
  - 原理图：AI 分析选中元件、AI 检查设计
  - PCB：AI 审查布局、AI 检查 DRC
- 心跳检测（15s 间隔）保持 WebSocket 连接活跃

## [1.0.0] — 2026-03-12

### Added
- WebSocket Bridge 基础架构（连接 MCP Server）
- 命令调度器（dispatcher）：路由 125+ 种命令到 Handler
- 5 个 Handler 模块：
  - `schematic-read.ts` — 原理图数据读取
  - `schematic-write.ts` — 器件放置、画线、属性修改
  - `pcb-read.ts` — PCB 数据读取
  - `pcb-write.ts` — PCB 走线、过孔、铺铜、DRC 规则管理
  - `system.ts` — DRC、BOM、文档管理、元件库、复合工具
- 协议定义（`protocol.ts`）：125+ BridgeCommand 枚举
- 菜单项：连接/断开/状态
