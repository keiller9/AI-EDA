# AI EDA Bridge — 嘉立创 EDA 专业版扩展

将 AI 大模型能力引入嘉立创 EDA 专业版，通过 MCP 协议实现自然语言驱动的电子设计。

**GitHub**: [https://github.com/keiller9/AI-EDA](https://github.com/keiller9/AI-EDA)

## 功能

### AI Bridge 菜单
- **连接 AI** — 一键连接 MCP Server（WebSocket 端口 8765）
- **断开连接** — 安全断开
- **连接状态** — 查看当前连接信息
- **状态面板** — 实时统计面板（命令数、成功率、延迟）
- **AI 助手面板** — 全功能 4-Tab 面板（仪表盘、快捷操作、日志、关于）
- **配置端口** — 自定义 WebSocket 端口

### AI Tools 菜单（原理图编辑器）
- **AI 分析选中元件** — 分析当前选中器件的上下文
- **AI 检查设计** — 运行设计规则检查

### AI Tools 菜单（PCB 编辑器）
- **AI 审查布局** — PCB 布局审查
- **AI 检查 DRC** — PCB 设计规则检查

## AI 助手面板

4 个标签页：

| 标签 | 功能 |
|------|------|
| 仪表盘 | 连接状态、文档类型、器件数/网络数/导线数/DRC 违规数 |
| 快捷操作 | 12 个一键按钮（审查原理图、审查 PCB、运行 DRC、搜索元件、导出 Gerber 等） |
| 日志 | 命令执行历史，支持 OK/ERR 筛选 |
| 关于 | 项目信息、版本、使用提示 |

## 安装

1. 构建扩展：
```bash
cd eda-extension
npm install
npm run build
```

2. 构建产物在 `build/dist/` 目录，文件名 `ai-eda-bridge-extension_v1.2.0.eext`

3. 打开嘉立创 EDA 专业版 → 扩展管理器 → 导入 `.eext` 文件

## 配合 MCP Server 使用

本扩展需要配合 [MCP Server](../mcp-server/) 使用：

1. 构建并启动 MCP Server
2. 在 Claude Code 中配置 `.mcp.json`
3. 在 EDA 中点击 **AI Bridge → 连接 AI**
4. 连接成功后即可通过 Claude Code 操控 EDA

## 技术架构

```
Claude Code ←MCP/Stdio→ MCP Server ←WebSocket:8765→ 本扩展 ←API→ EDA 编辑器
```

- 使用 `eda.sys_WebSocket` API 建立 WebSocket 连接
- 心跳检测（15s 间隔）保持连接活跃
- 命令调度器路由 125+ 种操作到对应 Handler
- 支持原理图读写、PCB 读写、元件库、系统操作

## 开发

```bash
npm install              # 安装依赖
npm run compile          # 编译 TypeScript → dist/index.js
npm run build            # 编译 + 打包 .eext
```

## 版本

| 版本 | 变更 |
|------|------|
| v1.2.0 | AI 助手面板、modify_attribute 修复 |
| v1.1.0 | 状态面板、端口配置、自动连接、右键菜单 |
| v1.0.0 | 初始版本，WebSocket Bridge |

## 许可证

MIT
