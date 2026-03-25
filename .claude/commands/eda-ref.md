# 嘉立创 EDA API 完整参考 / Full API Reference

当你需要查找具体 API 方法签名、参数类型、返回值时，使用以下文档。

## 快速参考（所有方法签名）

读取文件 `skills/easyeda-api/references/_quick-reference.md`（2864 行），包含所有 120 个类的方法签名一览。

## 按模块查找

### 文档管理 (DMT_*)
| 类 | 文件路径 |
|----|---------|
| DMT_Board | `skills/easyeda-api/references/classes/DMT_Board.md` |
| DMT_EditorControl | `skills/easyeda-api/references/classes/DMT_EditorControl.md` |
| DMT_Folder | `skills/easyeda-api/references/classes/DMT_Folder.md` |
| DMT_Panel | `skills/easyeda-api/references/classes/DMT_Panel.md` |
| DMT_Pcb | `skills/easyeda-api/references/classes/DMT_Pcb.md` |
| DMT_Project | `skills/easyeda-api/references/classes/DMT_Project.md` |
| DMT_Schematic | `skills/easyeda-api/references/classes/DMT_Schematic.md` |
| DMT_SelectControl | `skills/easyeda-api/references/classes/DMT_SelectControl.md` |
| DMT_Team | `skills/easyeda-api/references/classes/DMT_Team.md` |
| DMT_Workspace | `skills/easyeda-api/references/classes/DMT_Workspace.md` |

### 原理图 (SCH_*)
| 类 | 文件路径 |
|----|---------|
| SCH_Document | `skills/easyeda-api/references/classes/SCH_Document.md` |
| SCH_Drc | `skills/easyeda-api/references/classes/SCH_Drc.md` |
| SCH_Event | `skills/easyeda-api/references/classes/SCH_Event.md` |
| SCH_ManufactureData | `skills/easyeda-api/references/classes/SCH_ManufactureData.md` |
| SCH_Netlist | `skills/easyeda-api/references/classes/SCH_Netlist.md` |
| SCH_Primitive | `skills/easyeda-api/references/classes/SCH_Primitive.md` |
| SCH_PrimitiveArc | `skills/easyeda-api/references/classes/SCH_PrimitiveArc.md` |
| SCH_PrimitiveComponent | `skills/easyeda-api/references/classes/SCH_PrimitiveComponent.md` |
| SCH_PrimitiveWire | `skills/easyeda-api/references/classes/SCH_PrimitiveWire.md` |
| SCH_PrimitivePin | `skills/easyeda-api/references/classes/SCH_PrimitivePin.md` |
| SCH_PrimitiveText | `skills/easyeda-api/references/classes/SCH_PrimitiveText.md` |
| SCH_SelectControl | `skills/easyeda-api/references/classes/SCH_SelectControl.md` |
| SCH_SimulationEngine | `skills/easyeda-api/references/classes/SCH_SimulationEngine.md` |
| SCH_Utils | `skills/easyeda-api/references/classes/SCH_Utils.md` |

### 原理图图元接口 (ISCH_*)
| 接口 | 文件路径 |
|------|---------|
| ISCH_PrimitiveComponent | `skills/easyeda-api/references/classes/ISCH_PrimitiveComponent.md` |
| ISCH_PrimitiveWire | `skills/easyeda-api/references/classes/ISCH_PrimitiveText.md` |
| ISCH_PrimitiveArc | `skills/easyeda-api/references/classes/ISCH_PrimitiveArc.md` |
| ISCH_PrimitiveBus | `skills/easyeda-api/references/classes/ISCH_PrimitiveBus.md` |
| ISCH_PrimitivePin | `skills/easyeda-api/references/classes/ISCH_PrimitivePin.md` |

### PCB (PCB_*)
| 类 | 文件路径 |
|----|---------|
| PCB_Document | `skills/easyeda-api/references/classes/PCB_Document.md` |
| PCB_Drc | `skills/easyeda-api/references/classes/PCB_Drc.md` |
| PCB_Event | `skills/easyeda-api/references/classes/PCB_Event.md` |
| PCB_Layer | `skills/easyeda-api/references/classes/PCB_Layer.md` |
| PCB_Net | `skills/easyeda-api/references/classes/PCB_Net.md` |
| PCB_Primitive | `skills/easyeda-api/references/classes/PCB_Primitive.md` |
| PCB_PrimitiveComponent | `skills/easyeda-api/references/classes/PCB_PrimitiveComponent.md` |
| PCB_PrimitiveLine | `skills/easyeda-api/references/classes/PCB_PrimitiveLine.md` |
| PCB_PrimitivePad | `skills/easyeda-api/references/classes/PCB_PrimitivePad.md` |
| PCB_PrimitiveVia | `skills/easyeda-api/references/classes/PCB_PrimitiveVia.md` |
| PCB_PrimitivePour | `skills/easyeda-api/references/classes/PCB_PrimitivePour.md` |
| PCB_SelectControl | `skills/easyeda-api/references/classes/PCB_SelectControl.md` |
| PCB_ManufactureData | `skills/easyeda-api/references/classes/PCB_ManufactureData.md` |

### PCB 图元接口 (IPCB_*)
| 接口 | 文件路径 |
|------|---------|
| IPCB_PrimitiveComponent | `skills/easyeda-api/references/classes/IPCB_PrimitiveComponent.md` |
| IPCB_PrimitiveLine | `skills/easyeda-api/references/classes/IPCB_PrimitiveLine.md` |
| IPCB_PrimitiveVia | `skills/easyeda-api/references/classes/IPCB_PrimitiveVia.md` |
| IPCB_PrimitivePad | `skills/easyeda-api/references/classes/IPCB_PrimitivePad.md` |
| IPCB_PrimitivePour | `skills/easyeda-api/references/classes/IPCB_PrimitivePour.md` |
| IPCB_PrimitiveRegion | `skills/easyeda-api/references/classes/IPCB_PrimitiveRegion.md` |
| IPCB_PrimitiveArc | `skills/easyeda-api/references/classes/IPCB_PrimitiveArc.md` |
| IPCB_PrimitiveFill | `skills/easyeda-api/references/classes/IPCB_PrimitiveFill.md` |

### 元件库 (LIB_*)
| 类 | 文件路径 |
|----|---------|
| LIB_Device | `skills/easyeda-api/references/classes/LIB_Device.md` |
| LIB_Symbol | `skills/easyeda-api/references/classes/LIB_Symbol.md` |
| LIB_Footprint | `skills/easyeda-api/references/classes/LIB_Footprint.md` |
| LIB_3DModel | `skills/easyeda-api/references/classes/LIB_3DModel.md` |
| LIB_Cbb | `skills/easyeda-api/references/classes/LIB_Cbb.md` |
| LIB_Classification | `skills/easyeda-api/references/classes/LIB_Classification.md` |
| LIB_LibrariesList | `skills/easyeda-api/references/classes/LIB_LibrariesList.md` |
| LIB_PanelLibrary | `skills/easyeda-api/references/classes/LIB_PanelLibrary.md` |
| LIB_SelectControl | `skills/easyeda-api/references/classes/LIB_SelectControl.md` |

### 系统 (SYS_*)
| 类 | 文件路径 |
|----|---------|
| SYS_Dialog | `skills/easyeda-api/references/classes/SYS_Dialog.md` |
| SYS_Environment | `skills/easyeda-api/references/classes/SYS_Environment.md` |
| SYS_FileManager | `skills/easyeda-api/references/classes/SYS_FileManager.md` |
| SYS_FileSystem | `skills/easyeda-api/references/classes/SYS_FileSystem.md` |
| SYS_HeaderMenu | `skills/easyeda-api/references/classes/SYS_HeaderMenu.md` |
| SYS_I18n | `skills/easyeda-api/references/classes/SYS_I18n.md` |
| SYS_IFrame | `skills/easyeda-api/references/classes/SYS_IFrame.md` |
| SYS_Log | `skills/easyeda-api/references/classes/SYS_Log.md` |
| SYS_Message | `skills/easyeda-api/references/classes/SYS_Message.md` |
| SYS_MessageBus | `skills/easyeda-api/references/classes/SYS_MessageBus.md` |
| SYS_PanelControl | `skills/easyeda-api/references/classes/SYS_PanelControl.md` |
| SYS_RightClickMenu | `skills/easyeda-api/references/classes/SYS_RightClickMenu.md` |
| SYS_Setting | `skills/easyeda-api/references/classes/SYS_Setting.md` |
| SYS_ShortcutKey | `skills/easyeda-api/references/classes/SYS_ShortcutKey.md` |
| SYS_Storage | `skills/easyeda-api/references/classes/SYS_Storage.md` |
| SYS_Timer | `skills/easyeda-api/references/classes/SYS_Timer.md` |
| SYS_ToastMessage | `skills/easyeda-api/references/classes/SYS_ToastMessage.md` |
| SYS_WebSocket | `skills/easyeda-api/references/classes/SYS_WebSocket.md` |
| SYS_Window | `skills/easyeda-api/references/classes/SYS_Window.md` |

### 枚举 (Enums)
完整枚举列表：`skills/easyeda-api/references/enums/` 目录（62 个文件）

### 接口 (Interfaces)
完整接口列表：`skills/easyeda-api/references/interfaces/` 目录（70 个文件）

### 类型别名 (Types)
完整类型别名：`skills/easyeda-api/references/types/` 目录（19 个文件）

## 扩展开发指南

| 主题 | 文件路径 |
|------|---------|
| 快速入门 | `skills/easyeda-api/guide/how-to-start.md` |
| extension.json 配置 | `skills/easyeda-api/guide/extension-json.md` |
| 调用 API | `skills/easyeda-api/guide/invoke-apis.md` |
| IFrame 面板 | `skills/easyeda-api/guide/inline-frame.md` |
| 国际化 | `skills/easyeda-api/guide/i18n.md` |
| API 稳定性 | `skills/easyeda-api/guide/stability.md` |
| 扩展市场 | `skills/easyeda-api/guide/extensions-marketplace.md` |
| pro-api-types | `skills/easyeda-api/guide/ancillary-projects/pro-api-types.md` |
| pro-api-sdk | `skills/easyeda-api/guide/ancillary-projects/pro-api-sdk.md` |

## 使用方式

1. 需要查某个类的方法签名 → 读取 `_quick-reference.md` 中对应段落
2. 需要详细参数/返回值/示例 → 读取 `classes/<ClassName>.md`
3. 需要枚举值 → 读取 `enums/<EnumName>.md`
4. 需要接口字段 → 读取 `interfaces/<InterfaceName>.md`
5. 需要扩展开发指导 → 读取 `guide/` 下对应文档
