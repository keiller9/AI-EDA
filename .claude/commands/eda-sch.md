## 嘉立创EDA — 原理图 API (SCH_*)

`/eda-sch <TASK_DESCRIPTION>`

原理图相关扩展API参考。任务：$ARGUMENTS

---

### SCH_Document — `eda.sch_Document` — 文档操作
| 方法 | 参数 | 描述 |
|------|------|------|
| `save()` | 无 | 保存文档 |
| `importChanges()` | 无 | 从PCB导入变更 |
| `autoLayout(props)` | props: 布局参数 | (BETA) 自动布局 |
| `autoRouting(props)` | props: 布线参数 | (BETA) 自动布线 |

### SCH_Primitive — `eda.sch_Primitive` — 图元通用操作
| 方法 | 参数 | 描述 |
|------|------|------|
| `getPrimitiveByPrimitiveId(id)` | id: string | 获取指定ID图元的所有属性 |
| `getPrimitivesBBox(primitiveIds)` | primitiveIds: string[] | (BETA) 获取图元BBox边界框 |
| `getPrimitiveTypeByPrimitiveId(id)` | id: string | (BETA) 获取图元类型 |

### SCH_PrimitiveComponent — `eda.sch_PrimitiveComponent` — 器件图元 CRUD
| 方法 | 参数 | 描述 |
|------|------|------|
| `create(component, x, y, subPartName?, rotation?, mirror?, addIntoBom?, addIntoPcb?)` | component: {libraryUuid, uuid}; x,y: number; rotation?: number; mirror?: boolean | (BETA) 创建器件 |
| `createNetFlag(identification, net, x, y, rotation?, mirror?)` | identification: 'Power'\|'Ground'\|'AnalogGround'\|'ProtectGround'; net: string; x,y: number | (BETA) 创建电源/地标志 |
| `createNetPort(direction, net, x, y, rotation?, mirror?)` | direction: 'IN'\|'OUT'\|'BI'; net: string; x,y: number | (BETA) 创建网络端口 |
| `createShortCircuitFlag(x, y, rotation?, mirror?)` | x,y: number | (BETA) 创建短路标志 |
| `placeComponentWithMouse(component, subPartName?)` | component: {libraryUuid, uuid} | (BETA) 鼠标交互放置器件 |
| `modify(primitiveId, property)` | primitiveId: string; property: {x?, y?, rotation?, mirror?, designator?, name?, addIntoBom?, addIntoPcb?, manufacturer?, otherProperty?} | (BETA) 修改器件属性 |
| `delete(primitiveIds)` | primitiveIds: string \| string[] | (BETA) 删除器件 |
| `get(primitiveIds)` | primitiveIds: string \| string[] | (BETA) 获取器件详情 |
| `getAll(componentType?, allSchematicPages?)` | componentType?; allSchematicPages?: boolean | (BETA) 获取所有器件 |
| `getAllPinsByPrimitiveId(primitiveId)` | primitiveId: string | (BETA) 获取器件所有引脚 |
| `getAllPrimitiveId(componentType?, allSchematicPages?)` | 同getAll | (BETA) 获取所有器件ID |
| `getAllPropertyNames()` | 无 | (BETA) 获取所有属性名 |

### SCH_PrimitiveWire — `eda.sch_PrimitiveWire` — 导线图元 CRUD
| 方法 | 参数 | 描述 |
|------|------|------|
| `create(line, net?, color?, lineWidth?, lineType?)` | line: number[] \| number[][]; net?: string; lineWidth?: number(1-10); lineType?: ESCH_PrimitiveLineType | (BETA) 创建导线 |
| `modify(primitiveId, property)` | primitiveId: string; property: {line?, net?, color?, lineWidth?, lineType?} | (BETA) 修改导线 |
| `delete(primitiveIds)` | primitiveIds: string \| string[] | (BETA) 删除导线 |
| `get(primitiveIds)` | primitiveIds: string \| string[] | (BETA) 获取导线详情 |
| `getAll(net?)` | net?: string | (BETA) 获取所有导线 |
| `getAllPrimitiveId(net?)` | net?: string | (BETA) 获取所有导线ID |

### SCH_SelectControl — `eda.sch_SelectControl` — 选择控制
| 方法 | 参数 | 描述 |
|------|------|------|
| `getSelectedPrimitives_PrimitiveId()` | 无 | 查询选中图元ID |
| `getSelectedPrimitives()` | 无 | (BETA) 查询选中图元所有参数 |
| `getAllSelectedPrimitives_PrimitiveId()` | 无 | (BETA) 查询所有已选中图元ID |
| `getAllSelectedPrimitives()` | 无 | (BETA) 查询所有已选中图元对象 |
| `doSelectPrimitives(primitiveIds)` | primitiveIds: string[] | 选中图元 |
| `clearSelected()` | 无 | 清除选中 |
| `doCrossProbeSelect(components, pins, nets, highlight, select)` | components, pins, nets: 筛选条件; highlight, select: boolean | 交叉选择 |
| `getCurrentMousePosition()` | 无 | (BETA) 获取鼠标画布位置 |
| `refactorGetAllSelectedPrimitives()` | 无 | (BETA) 3.0版查询所有已选中图元 |

### SCH_Event — `eda.sch_Event` — 事件监听
| 方法 | 参数 | 描述 |
|------|------|------|
| `addMouseEventListener(id, eventType, callFn, onlyOnce)` | id: string; eventType: ESCH_MouseEventType; callFn: Function; onlyOnce: boolean | 鼠标事件监听 |
| `addPrimitiveEventListener(id, eventType, callFn, onlyOnce)` | id: string; eventType: ESCH_PrimitiveEventType; callFn: Function; onlyOnce: boolean | (BETA) 图元事件监听 |
| `addSimulationEnginePullEventListener(id, eventType, callFn)` | id: string; eventType; callFn: Function | (BETA) 仿真引擎拉取事件 |
| `isEventListenerAlreadyExist(id)` | id: string | 查询监听是否存在 |
| `removeEventListener(id)` | id: string | 移除监听 |

### SCH_Netlist — `eda.sch_Netlist` — 网表
| 方法 | 参数 | 描述 |
|------|------|------|
| `getNetlist(type)` | type: ESYS_NetlistType | 获取网表 |
| `setNetlist(type, netlist)` | type: ESYS_NetlistType; netlist: 网表数据 | (BETA) 更新网表 |

### SCH_Drc — `eda.sch_Drc` — 设计规则检查
| 方法 | 参数 | 描述 |
|------|------|------|
| `check(strict, userInterface, includeVerboseError)` | strict, userInterface, includeVerboseError: boolean | (BETA) 检查DRC |

### SCH_ManufactureData — `eda.sch_ManufactureData` — 生产资料
| 方法 | 参数 | 描述 |
|------|------|------|
| `getBomFile(fileName?, fileType?, template?, filterOptions?, statistics?, property?, columns?, assemblyVariantsConfig?)` | fileName?: string; fileType?: 'xlsx'\|'csv'; template?: string | (BETA) 获取BOM文件 → File对象 |
| `getNetlistFile(fileName?, netlistType?)` | fileName?: string; netlistType?: ESYS_NetlistType | (BETA) 获取网表文件 |
| `getExportDocumentFile(fileName?, fileType?, ...)` | fileType?: ESCH_ExportDocumentFileType | (BETA) 导出文档(PDF/SVG等) |
| `getSimulationNetlistFile(fileName?, netlistType?)` | fileName?: string; netlistType?: ESCH_SimulationNetlistType | (BETA) 获取仿真网表 |
| `getAssemblyVariantsConfigs()` | 无 | (BETA) 获取装配体变量配置 → Array<{text,value}> |
| `placeComponentsOrder(interactive?, ignoreWarning?)` | interactive, ignoreWarning: boolean | (BETA) 元件下单 |
| `placeSmtComponentsOrder(interactive?, ignoreWarning?)` | interactive, ignoreWarning: boolean | (BETA) SMT下单 |

### SCH_SimulationEngine — `eda.sch_SimulationEngine` — 仿真引擎
| 方法 | 参数 | 描述 |
|------|------|------|
| `pushData(eventType, props)` | eventType; props: object | 向仿真内核发送数据 |

### SCH_PrimitivePin — `eda.sch_PrimitivePin` — 引脚图元 CRUD（仅符号编辑器）
| 方法 | 参数 | 描述 |
|------|------|------|
| `create(x, y, pinNumber, pinName?, rotation?, pinLength?, pinColor?, pinShape?, pinType?)` | x,y: number; pinNumber: string; pinShape?: ESCH_PrimitivePinShape; pinType?: ESCH_PrimitivePinType | (BETA) 创建引脚 |
| `modify(primitiveId, property)` | 同create参数 | (BETA) 修改引脚 |
| `delete(primitiveIds)` | string \| string[] | (BETA) 删除引脚 |
| `get(primitiveIds)` | string \| string[] | (BETA) 获取引脚 |
| `getAll()` | 无 | (BETA) 获取所有引脚 |
| `getAllPrimitiveId()` | 无 | (BETA) 获取所有引脚ID |

### SCH_PrimitiveArc — `eda.sch_PrimitiveArc` — 圆弧 CRUD
| 方法 | 参数 | 描述 |
|------|------|------|
| `create(startX, startY, referenceX, referenceY, endX, endY, color?, fillColor?, lineWidth?, lineType?)` | 坐标+样式 | (BETA) 创建圆弧 |
| `modify/delete/get` | 标准CRUD | (BETA) 修改/删除/获取 |

### SCH_PrimitiveText — `eda.sch_PrimitiveText` — 文本 CRUD
| 方法 | 参数 | 描述 |
|------|------|------|
| `create(x, y, content, rotation?, textColor?, fontName?, fontSize?, bold?, italic?, underLine?, alignMode?)` | 位置+文本+样式 | (BETA) 创建文本 |
| `modify/delete/get` | 标准CRUD | (BETA) 修改/删除/获取 |

### SCH_PrimitiveBus — `eda.sch_PrimitiveBus` — 总线 CRUD
| 方法 | 参数 | 描述 |
|------|------|------|
| `create(busName, line, color?, lineWidth?, lineType?)` | busName: string; line: number[] | (BETA) 创建总线 |
| `modify/delete/get` | 标准CRUD | (BETA) 修改/删除/获取 |

### SCH_PrimitiveCircle — `eda.sch_PrimitiveCircle` — 圆 CRUD
| 方法 | 参数 | 描述 |
|------|------|------|
| `create(centerX, centerY, radius, color?, fillColor?, lineWidth?, lineType?, fillStyle?)` | centerX,Y,radius: number | (BETA) 创建圆 |
| `modify/delete/get` | 标准CRUD | (BETA) 修改/删除/获取 |

### SCH_PrimitivePolygon — `eda.sch_PrimitivePolygon` — 多边形 CRUD
| 方法 | 参数 | 描述 |
|------|------|------|
| `create(line, color?, fillColor?, lineWidth?, lineType?)` | line: number[] | (BETA) 创建多边形 |
| `modify/delete/get` | 标准CRUD | (BETA) 修改/删除/获取 |

### SCH_PrimitiveRectangle — `eda.sch_PrimitiveRectangle` — 矩形 CRUD
| 方法 | 参数 | 描述 |
|------|------|------|
| `create(topLeftX, topLeftY, width, height, cornerRadius?, rotation?, color?, fillColor?, lineWidth?, lineType?, fillStyle?)` | 位置+尺寸+样式 | (BETA) 创建矩形 |
| `modify/delete/get` | 标准CRUD | (BETA) 修改/删除/获取 |

### SCH_PrimitiveAttribute — `eda.sch_PrimitiveAttribute` — 属性图元
| 方法 | 参数 | 描述 |
|------|------|------|
| `modify(primitiveId, property)` | 属性对象 | (BETA) 修改属性 |
| `get(primitiveIds)` | string \| string[] | (BETA) 获取属性 |

---

根据以上API完成任务：**$ARGUMENTS**
