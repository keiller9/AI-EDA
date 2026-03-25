# AI-EDA

[English](README.md) | **中文**

MCP（模型上下文协议）桥接器，连接 **Claude Code** 与 **嘉立创EDA专业版**（JLCEDA Pro），让硬件工程师通过自然语言操控原理图和 PCB 设计。

## 为什么选择 AI-EDA？

传统 EDA 工作流需要深度菜单导航和大量手动重复操作。AI-EDA 将 Claude 的推理能力与嘉立创 EDA Pro 的完整 API 接口桥接 — **122 个 MCP 工具**覆盖原理图、PCB、元件库和系统操作。用自然语言提问，在编辑器中得到结果。

**核心能力：**
- **读取** — 列出器件、网络、层叠、DRC 规则；按坐标或区域查询
- **写入** — 放置器件、画走线、创建网络标识/标签、修改属性、批量操作
- **创建** — 从零创建项目、原理图、PCB、Board
- **分析** — 运行 DRC、原理图↔PCB 交叉探测、生成 BOM、导出 Gerber
- **DRC 管理** — 规则配置 CRUD、网络类、差分对、等长组完整管理
- **路由控制** — 清除布线、飞线显示、坐标变换
- **导航** — 缩放到板框、高亮网络、导航到坐标、交叉探测
- **自动化** — 自动布局/布线、批量操作、自然语言 → 原理图生成

## 架构

```
Claude Code ◄──Stdio──► MCP Server ◄──WebSocket──► EDA Extension
  (LLM)                (Node.js)       :8765        (嘉立创EDA Pro)
```

| 组件 | 说明 |
|------|------|
| **mcp-server/** | Node.js MCP 服务器 — 122 个工具通过 stdio 暴露，WebSocket 桥接到 EDA |
| **eda-extension/** | 嘉立创 EDA Pro 扩展 — 接收命令，调用 EDA API，返回结果 |
| **.claude/commands/** | 15 个技能 — 领域知识 + MCP 工具引导 |
| **skills/** | 第三方 Skill 集成（easyeda-api 完整 API 参考） |

## 快速开始

### 前提条件
- [Node.js](https://nodejs.org/) >= 18
- [嘉立创EDA专业版](https://lceda.cn/) >= 2.3.0
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code)

### 1. 编译 MCP Server

```bash
cd mcp-server
npm install
npm run build
```

### 2. 编译 EDA 扩展

```bash
cd eda-extension
npm install
npm run build
```

将在 `eda-extension/build/dist/` 生成 `.eext` 文件。

### 3. 安装 EDA 扩展

1. 打开嘉立创EDA专业版
2. 进入**扩展管理器**
3. 导入 `.eext` 文件

### 4. 注册 MCP Server 到 Claude Code

项目包含 `.mcp.json` — 按需修改路径：

```json
{
  "mcpServers": {
    "jlceda-bridge": {
      "command": "node",
      "args": ["<path-to>/mcp-server/dist/index.js"],
      "env": { "WS_PORT": "8765" }
    }
  }
}
```

### 5. 安装技能（可选但推荐）

克隆仓库后 `.claude/commands/` 中的 15 个内置技能自动可用。如需完整 API 参考文档（120+ 个类文档）：

```bash
npx clawhub@latest install easyeda-api
```

安装到 `skills/easyeda-api/` 目录，包含完整的 API 文档（类、枚举、接口、开发指南）。

### 6. 连接

1. 在嘉立创EDA专业版**桌面客户端**中，点击 **AI Bridge → 连接 AI**
2. 看到成功提示："Connected to MCP Server"
3. 在 Claude Code 中使用任意 `eda_*` 工具与设计交互

> **重要：** 网页版嘉立创EDA因 HTTPS 混合内容限制无法连接本地 WebSocket。请使用**桌面客户端**。

## 使用示例

```
> 给我当前设计的概览
  → eda_get_design_overview（自动检测原理图/PCB）

> 找到器件 U1 并显示它的上下文
  → eda_find_component → eda_sch_get_component_context

> 检查设计有没有错误
  → eda_check_design（DRC + 网络分析 + 报告）

> 在 PCB 上高亮 VCC 网络
  → eda_pcb_highlight_net，net="VCC"

> 自动布局原理图
  → eda_sch_auto_layout

> 为 VCC、3V3、5V 创建 Power 网络类
  → eda_pcb_create_net_class，name="Power"，nets=["VCC","3V3","5V"]

> 导出 Gerber 制造文件
  → eda_pcb_export_gerber

> /project:review-pcb 去耦电容
  → 带领域规则的系统化 PCB 审查

> /project:design-check all
  → 生产前检查：DRC + 原理图↔PCB 交叉校验 + BOM

> /project:review-sch 电源旁路
  → 原理图审查：旁路电容、上拉电阻、浮空引脚、ESD

> /project:generate-schematic ESP32 温度传感器带 OLED 显示屏
  → 自然语言描述自动生成原理图

> /project:eda-ref
  → 浏览完整 API 参考（120 个类、62 个枚举、70 个接口）
```

## 使用技能（Skill）

技能是将领域知识与 MCP 工具序列结合的斜杠命令，在 Claude Code 中运行。

### 调用方式

```bash
# 在 Claude Code 中输入斜杠命令：
/project:review-sch           # 审查当前原理图
/project:review-pcb           # 审查 PCB 布局
/project:design-check         # 生产前检查
/project:generate-schematic   # 自然语言生成原理图
/project:component-research   # 元件库研究
/project:eda-ref              # 浏览完整 API 参考

# 带参数：
/project:review-sch 电源旁路电容检查
/project:generate-schematic STM32 最小系统，带 USB 和 SD 卡
/project:component-research STM32F103 LQFP-64
```

### 技能分类

| 分类 | 技能 | 适用场景 |
|------|------|----------|
| **设计审查** | `review-sch`、`review-pcb`、`design-check` | 投产前、重大修改后 |
| **设计自动化** | `generate-schematic`、`place-components`、`route-traces` | 新建设计、布局优化 |
| **研究** | `component-research`、`electrical-rules` | 选型、设计规则查询 |
| **API 参考** | `eda`、`eda-sch`、`eda-pcb`、`eda-lib`、`eda-dmt`、`eda-sys`、`eda-ref` | 扩展开发、API 调试 |

### 添加自定义技能

在 `.claude/commands/` 目录下创建 `.md` 文件：

```markdown
# 我的自定义技能

`/my-skill <ARGUMENTS>`

告诉 Claude 如何执行任务的指令。
使用 $ARGUMENTS 引用用户输入。

## 步骤
1. 调用 eda_get_design_overview
2. 分析结果
3. ...
```

文件名即为斜杠命令：`my-skill.md` → `/project:my-skill`

## MCP 工具（122 个）

| 分类 | 数量 | 说明 |
|------|------|------|
| 连接 | 1 | 连接状态检查 |
| 原理图读取 | 10 | 状态、器件、网络、导线、图元、选中、鼠标位置、包围盒 |
| 原理图写入 | 18 | 放置、画线、网络标识/标签、导航、批量操作、保存、自动布局/布线 |
| PCB 读取 | 16 | 状态、器件、网络、层叠、图元、坐标变换、选中 |
| PCB 写入 | 45 | 放置、画线/弧/折线、过孔、文字、铺铜、DRC 规则 CRUD、网络类/差分对/等长组管理、路由控制、制造导出 |
| 文档管理 | 11 | 查看/打开文档、创建项目/原理图/PCB/Board |
| 元件库 | 5 | 搜索器件/封装、LCSC 编号查询 |
| 系统与复合 | 12 | DRC、BOM、设计概览、智能搜索、单位转换 |

> 完整工具列表请查看 [English README](README.md#mcp-tools-122)

### v2.0.0 新增工具（29 个）

**文档创建（5）**：`create_project` / `create_schematic` / `create_schematic_page` / `create_pcb` / `create_board`

**DRC 规则管理（15）**：规则配置 CRUD、网络规则、区域规则、网络类增删、差分对删除、等长组 CRUD、焊盘对组读取

**路由控制（4）**：`clear_routing` / `start_ratline` / `stop_ratline` / `get_ratline_status`

**坐标 + 导航 + 标签（5）**：画布↔数据坐标转换、原理图导航、网络标签放置

## 技能（15 个）

### API 参考技能（7）
| 技能 | 说明 |
|------|------|
| `/project:eda` | EDA API 主参考，调用约定 |
| `/project:eda-sch` | 原理图 API — 15 个类，完整方法签名 |
| `/project:eda-pcb` | PCB API — 22 个类，完整方法签名 |
| `/project:eda-lib` | 综合库 API — 9 个类（器件、符号、封装、3D 模型） |
| `/project:eda-dmt` | 文档树 API — 10 个类（工程、板子、编辑器控制） |
| `/project:eda-sys` | 系统 API — 20+ 个类（文件、对话框、菜单、存储、单位） |
| `/project:eda-ref` | **完整 API 参考** — 120 个类、62 枚举、70 接口的详细文档索引 |

### 设计工作流技能（6）
| 技能 | 说明 |
|------|------|
| `/project:generate-schematic` | **自然语言 → 原理图** — 通过 MCP API 自动创建原理图 |
| `/project:review-pcb` | PCB 布局审查 — 去耦电容、电源走线、DRC 规则、DFM、信号完整性 |
| `/project:review-sch` | 原理图审查 — 旁路电容、上拉电阻、浮空引脚、ESD、导航定位 |
| `/project:design-check` | 生产前检查 — DRC + Board 一致性 + 原理图↔PCB 交叉校验 + BOM |
| `/project:place-components` | PCB 布局 — 功能分组、优先级、栅格对齐 |
| `/project:route-traces` | PCB 布线 — 飞线显示、线宽、过孔、差分对、等长约束、层策略 |

### 知识技能（2）
| 技能 | 说明 |
|------|------|
| `/project:electrical-rules` | 电气规则 — 引脚类型、电源、信号完整性、保护电路 |
| `/project:component-research` | 元件研究 — 库搜索、Datasheet 查找、参数提取 |

> **设计模式：** 技能结合**领域知识**（EDA 设计规则、数值阈值）和 **MCP 工具序列**（调用什么工具、以什么顺序）。所有方法签名来源于 `@jlceda/pro-api-types` v0.2.15。

## 项目结构

```
AI-EDA/
├── mcp-server/                  # MCP 服务器（Node.js/TypeScript）
│   ├── src/
│   │   ├── index.ts             # 服务器入口 — 注册全部 122 个工具
│   │   ├── ws-bridge.ts         # WebSocket 服务器，请求/响应匹配
│   │   ├── protocol.ts          # 共享命令枚举（与扩展同步）
│   │   ├── tools/               # MCP 工具定义（Zod schema）
│   │   └── __tests__/           # Vitest 测试套件（19 个测试）
│   ├── vitest.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── eda-extension/               # 嘉立创 EDA Pro 扩展（v1.2.0）
│   ├── src/
│   │   ├── index.ts             # 扩展入口 — 菜单操作、自动连接
│   │   ├── ws-client.ts         # WebSocket 客户端
│   │   ├── dispatcher.ts        # 命令路由 + 日志 + 统计
│   │   ├── protocol.ts          # 共享命令枚举（与服务器同步）
│   │   └── handlers/            # EDA API 调用实现
│   ├── extension.json           # 扩展清单
│   ├── package.json
│   └── tsconfig.json
│
├── .claude/commands/            # Claude Code 技能（15 个文件）
├── skills/                      # 第三方 Skill 集成
│   └── easyeda-api/            # 完整 API 参考（120 类、62 枚举、70 接口）
├── .mcp.json                    # MCP 服务器注册
├── CONTRIBUTING.md              # 贡献指南
├── LICENSE                      # MIT 许可证
└── .gitignore
```

## 技术栈

- **MCP 服务器**: `@modelcontextprotocol/sdk`, `ws`, `zod`, TypeScript
- **EDA 扩展**: 嘉立创 EDA Pro 扩展 API, `@jlceda/pro-api-types` v0.2.15, TypeScript
- **协议**: WebSocket（JSON 请求/响应，UUID 匹配）
- **构建**: esbuild（扩展）, tsc（服务器）

## 测试

```bash
cd mcp-server
npm test          # 运行所有测试（vitest）
npm run test:watch  # 监听模式
```

3 个测试套件，19 个测试：
- **协议同步** — 验证两个 `protocol.ts` 文件的枚举值完全一致
- **工具注册** — 验证全部 122 个工具注册无报错、无重名
- **WSBridge** — WebSocket 服务器的启动/连接/发送/接收/超时行为

## 版本历史

| 版本 | 工具数 | 技能数 | 亮点 |
|------|--------|--------|------|
| v2.1.0 | 122 | 15 | **AI 助手面板**（仪表盘/快捷操作/日志/关于）、完整 API 参考集成、modify_attribute 修复 |
| v2.0.0 | 122 | 14 | 文档创建、DRC CRUD、路由控制、网络标签、坐标变换、测试基础设施、自然语言生成原理图 |
| v1.9.0 | 93 | 13 | UI 增强 — 状态面板、端口配置、自动连接、右键菜单 |
| v1.8.0 | 93 | 11 | 全覆盖 — SCH/PCB 图元、DMT、LIB、SYS |
| v1.7.0 | 65 | 11 | PCB 全覆盖 — 文档、网络、选择、层叠、DRC 规则、制造导出 |
| v1.6.0 | 40 | 11 | SCH 全覆盖 — 自动布局、交叉探测、BOM、网络标识 |
| v1.5.0 | 31 | 11 | 工作流技能 — 领域知识 + MCP 工具引导 |

## 许可证

MIT
