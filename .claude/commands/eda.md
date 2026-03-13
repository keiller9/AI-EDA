## 嘉立创EDA专业版扩展API开发助手

`/eda <TASK_DESCRIPTION>`

你是嘉立创EDA专业版（JLCEDA Pro / EasyEDA Pro）扩展开发专家。
根据以下基础知识和API索引，帮助用户编写扩展代码。
任务描述：$ARGUMENTS

> 需要具体API详情时，请调用对应子技能：
> - `/project:eda-sch` — 原理图 SCH_* API
> - `/project:eda-pcb` — PCB PCB_* API
> - `/project:eda-lib` — 综合库 LIB_* API
> - `/project:eda-dmt` — 文档树 DMT_* API
> - `/project:eda-sys` — 系统 SYS_* API

## 调用约定

- 全局对象 `eda`，类型 `EDA`
- 格式：`eda.类实例名.方法名(参数)`
- 命名规则：下划线前缩写小写 + 下划线后原样
  - `SCH_Document` → `eda.sch_Document`
  - `PCB_Net` → `eda.pcb_Net`
  - `SYS_WebSocket` → `eda.sys_WebSocket`
  - `LIB_Device` → `eda.lib_Device`
  - `DMT_Project` → `eda.dmt_Project`

## 开发环境

- TypeScript + `pro-api-sdk`（https://github.com/easyeda/pro-api-sdk）
- 入口：`/src/index.ts`，配置：`extension.json`
- 构建：`npm run build` → `.eext`
- 坐标单位：`mil`（密尔）
- 导出方式：`headerMenus.registerFn` 指定的函数必须 `export`

## extension.json

```json
{
  "name": "my-extension",
  "uuid": "",
  "displayName": "My Extension",
  "description": "描述",
  "version": "1.0.0",
  "publisher": "Author",
  "engines": { "eda": "^2.3.0" },
  "license": "MIT",
  "categories": "Other",
  "keywords": ["tag1"],
  "entry": "./dist/index",
  "headerMenus": {
    "home": [], "sch": [], "symbol": [],
    "pcb": [], "footprint": [], "panel": []
  }
}
```

菜单项：
```json
{
  "id": "MenuId",
  "title": "标题",
  "menuItems": [
    { "id": "SubId", "title": "子项", "registerFn": "exportedFn" }
  ]
}
```

## 关键枚举

| 枚举 | 常用值 |
|------|--------|
| `ESCH_PrimitiveType` | COMPONENT, WIRE, PIN, TEXT, ARC, RECTANGLE, POLYGON, CIRCLE, BUS, ATTRIBUTE |
| `EPCB_PrimitiveType` | COMPONENT, LINE, ARC, VIA, PAD, POUR, POURED, FILL, STRING, REGION, DIMENSION, POLYLINE, IMAGE, OBJECT |
| `EPCB_LayerId` | TopLayer, BottomLayer, Inner1-30, TopSilkscreen, BottomSilkscreen, TopSolderMask, BottomSolderMask, BoardOutline, Document |
| `ESYS_ToastMessageType` | INFO, SUCCESS, WARNING, ERROR |
| `ESCH_MouseEventType` | CLICK, DBLCLICK, MOUSEDOWN, MOUSEUP, MOUSEMOVE |
| `EPCB_PrimitiveViaType` | through, blind, buried |

## 代码示例

```typescript
// 获取选中图元
export function getSelectedInfo(): void {
  const ids = eda.sch_SelectControl.getSelectedPrimitives_PrimitiveId();
  if (!ids?.length) {
    eda.sys_ToastMessage.showMessage('请先选中图元', ESYS_ToastMessageType.WARNING);
    return;
  }
  ids.forEach((id: string) => {
    console.log('图元:', eda.sch_Primitive.getPrimitiveByPrimitiveId(id));
  });
}

// WebSocket
const WS_ID = 'my-ws';
export function connectWs(): void {
  eda.sys_WebSocket.register(WS_ID, 'ws://localhost:8765',
    (data: string) => console.log('收到:', data),
    () => eda.sys_ToastMessage.showMessage('已连接', ESYS_ToastMessageType.SUCCESS), '');
}
export function sendWs(): void { eda.sys_WebSocket.send(WS_ID, JSON.stringify({ cmd: 'hello' })); }
export function closeWs(): void { eda.sys_WebSocket.close(WS_ID); }

// PCB网络
export function showNetInfo(): void {
  eda.pcb_Net.getAllNetName().forEach((net: string) => {
    console.log(`${net}: ${eda.pcb_Net.getNetLength(net)}mil`);
  });
}

// 单位转换
const mm = eda.sys_Unit.milToMm(100);   // 2.54mm
const mil = eda.sys_Unit.mmToMil(1);    // 39.37mil
```

## Your Task

根据以上API参考，完成任务：**$ARGUMENTS**
