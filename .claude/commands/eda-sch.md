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

### SCH_Primitive — `eda.sch_Primitive` — 图元操作
| 方法 | 参数 | 描述 |
|------|------|------|
| `getPrimitiveByPrimitiveId(id)` | id: string | 获取指定ID图元的所有属性 |
| `getPrimitivesBBox(primitiveIds)` | primitiveIds: string[] | (BETA) 获取图元BBox边界框 |
| `getPrimitiveTypeByPrimitiveId(id)` | id: string | (BETA) 获取图元类型 |

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
> 导出BOM等生产资料（待补充详细方法）

### SCH_SimulationEngine — `eda.sch_SimulationEngine` — 仿真引擎
> 仿真相关API（待补充详细方法）

### SCH_Utils — `eda.sch_Utils` — 工具类
> 原理图工具方法（待补充详细方法）

---

根据以上API完成任务：**$ARGUMENTS**
