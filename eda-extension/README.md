# AI EDA Bridge — 嘉立创 EDA 专业版扩展

本扩展是 **Claude Code**（Anthropic 官方 AI 编程工具）与嘉立创 EDA 专业版之间的桥梁。通过 MCP（Model Context Protocol）协议，让 Claude Code 能够**直接读取、分析、修改**你的原理图和 PCB 设计。

> **核心工作流**：你在 Claude Code 中用自然语言下达指令 → Claude 通过本扩展提供的 122 个 MCP 工具操控 EDA 编辑器 → 自动完成审查、修复、放置器件、画线等操作。

**GitHub**: [https://github.com/keiller9/AI-EDA](https://github.com/keiller9/AI-EDA)

## 已验证的核心功能

### 原理图智能审查（通过 Claude Code）
在 Claude Code 中输入 `/review-sch`，Claude 会自动：
1. 扫描所有 IC 的电源引脚，检查旁路电容是否齐全
2. 验证 I2C/SPI/UART/RESET 总线的上拉/下拉配置
3. 检测浮空引脚和单引脚网络
4. 审查复位电路、ESD 保护、位号规范
5. 输出结构化报告（通过/警告/失败）

### 原理图自动修复（通过 Claude Code）
审查发现问题后，在 Claude Code 中输入"帮我修复"，Claude 会自动：
- 修改错误位号（如 LED 误标为电感 L1 → D4）
- 从嘉立创元件库搜索并放置缺失器件（如 10kΩ 上拉电阻）
- 画导线连接引脚
- 添加电源/地标识（VCC、GND）

**所有操作都由 Claude Code 通过 MCP 工具远程执行，无需手动编辑。**

## 扩展菜单

### AI Bridge
- **连接 AI** — 一键连接 MCP Server（WebSocket 端口 8765）
- **断开连接 / 连接状态 / 配置端口**
- **AI 助手面板** — 仪表盘 + 快捷操作 + 日志 + 关于

### AI Tools（原理图/PCB 编辑器）
- **AI 分析选中元件** — 分析器件上下文（引脚、网络、邻近器件）
- **AI 检查设计 / AI 审查布局 / AI 检查 DRC**

## 安装

1. 构建扩展：
```bash
cd eda-extension
npm install
npm run build
```

2. 构建产物在 `build/dist/` 目录，文件名 `ai-eda-bridge-extension_v1.2.0.eext`

3. 打开嘉立创 EDA 专业版 → 扩展管理器 → 导入 `.eext` 文件

## 使用前提

本扩展**必须配合 Claude Code + MCP Server 使用**：

1. 安装 [Claude Code](https://docs.anthropic.com/en/docs/claude-code)（Anthropic 官方 CLI）
2. 构建 [MCP Server](https://github.com/keiller9/AI-EDA/tree/master/mcp-server)
3. 在项目目录配置 `.mcp.json` 指向 MCP Server
4. 在 EDA 中点击 **AI Bridge → 连接 AI**
5. 在 Claude Code 中用自然语言与原理图/PCB 交互

## 技术架构

```
Claude Code ←MCP/Stdio→ MCP Server ←WebSocket:8765→ 本扩展 ←API→ EDA 编辑器
  (AI 大脑)              (工具转发层)                  (编辑器桥接)
```

- 本扩展本身**不包含 AI 能力**，AI 由 Claude Code 提供
- 扩展负责接收 Claude Code 的工具调用指令，转换为 EDA API 调用
- WebSocket 心跳（15s）保持连接活跃
- 122 个 MCP 工具覆盖原理图/PCB/元件库/系统操作

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
