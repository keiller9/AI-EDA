# Contributing to AI-EDA

感谢你对 AI-EDA 项目的关注！

## 项目结构

```
mcp-server/          # MCP Server（Node.js）
eda-extension/       # 嘉立创 EDA 专业版扩展
.claude/commands/    # Claude Code Skills（15 个）
skills/              # 第三方 Skill 集成
```

## 开发环境

- Node.js >= 18
- 嘉立创 EDA 专业版桌面客户端 >= 2.3.0
- Claude Code

## 构建

```bash
# MCP Server
cd mcp-server && npm install && npm run build

# EDA Extension
cd eda-extension && npm install && npm run build
```

## 测试

```bash
cd mcp-server && npm test
```

## 协议同步

`mcp-server/src/protocol.ts` 和 `eda-extension/src/protocol.ts` 必须保持同步。添加新命令时：

1. 在两个 `protocol.ts` 中添加相同的 `BridgeCommand` 枚举值
2. 在 `mcp-server/src/tools/` 中添加 MCP 工具定义
3. 在 `eda-extension/src/handlers/` 中添加对应 Handler
4. 运行 `npm test` 确认协议同步测试通过

## 提交规范

```
<type>: <description>

type:
  feat     新功能
  fix      Bug 修复
  docs     文档更新
  refactor 重构
  test     测试
  chore    构建/工具变更
```

## 添加新 MCP 工具

1. 确定工具属于哪个模块（schematic-read/write, pcb-read/write, system）
2. 在 `protocol.ts` 添加命令枚举
3. 在对应的 `tools/*.ts` 中用 `server.tool()` 注册
4. 在对应的 `handlers/*.ts` 中用 `registerHandler()` 实现
5. 更新 README 工具表格
6. 添加测试用例

## 许可证

MIT — 详见 [LICENSE](LICENSE)
