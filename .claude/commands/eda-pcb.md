## 嘉立创EDA — PCB API (PCB_*)

`/eda-pcb <TASK_DESCRIPTION>`

PCB相关扩展API参考。任务：$ARGUMENTS

---

### PCB_Document — `eda.pcb_Document` — PCB文档操作
| 方法 | 参数 | 描述 |
|------|------|------|
| `save(uuid)` | uuid?: string | 保存文档 |
| `importChanges(uuid)` | uuid?: string | 从原理图导入变更 |
| `navigateToCoordinates(x, y)` | x, y: number (mil) | 定位到画布坐标 |
| `navigateToRegion(left, right, top, bottom)` | left, right, top, bottom: number | (BETA) 定位到区域 |
| `zoomToBoardOutline()` | 无 | (BETA) 缩放到板框 |
| `getCanvasOrigin()` | 无 | 获取画布原点偏移 |
| `setCanvasOrigin(offsetX, offsetY)` | offsetX, offsetY: number | 设置画布原点偏移 |
| `convertCanvasOriginToDataOrigin(x, y)` | x, y: number | 画布坐标→数据坐标 |
| `convertDataOriginToCanvasOrigin(x, y)` | x, y: number | 数据坐标→画布坐标 |
| `getPrimitiveAtPoint(x, y)` | x, y: number | (BETA) 获取坐标点图元 |
| `getPrimitivesInRegion(left, right, top, bottom, leftToRight)` | 区域坐标; leftToRight: boolean | (BETA) 获取区域内图元 |
| `startCalculatingRatline()` | 无 | 启动飞线计算 |
| `stopCalculatingRatline()` | 无 | 停止飞线计算 |
| `getCalculatingRatlineStatus()` | 无 | 获取飞线计算状态 |
| `getCurrentFilterConfiguration()` | 无 | (BETA) 获取画布过滤器配置 |
| `importAutoLayoutJsonFile(autoLayoutFile)` | autoLayoutFile: 文件数据 | (BETA) 导入自动布局(JSON) |
| `importAutoRouteJsonFile(autoRouteFile)` | autoRouteFile: 文件数据 | (BETA) 导入自动布线(JSON) |
| `importAutoRouteSesFile(autoRouteFile)` | autoRouteFile: 文件数据 | (BETA) 导入自动布线(SES) |

### PCB_Primitive — `eda.pcb_Primitive` — PCB图元操作
| 方法 | 参数 | 描述 |
|------|------|------|
| `getPrimitivesBBox(primitiveIds)` | primitiveIds: string[] | (BETA) 获取图元BBox边界框 |

### PCB_Net — `eda.pcb_Net` — 网络操作
| 方法 | 参数 | 描述 |
|------|------|------|
| `getAllNetName()` | 无 | 获取所有网络名称 |
| `getAllNetsName()` | 无 | 获取所有网络名称(别名) |
| `getNetLength(net)` | net: string | 获取指定网络长度 |
| `getNetlist(type)` | type: ESYS_NetlistType | 获取网表 |
| `setNetlist(type, netlist)` | type; netlist | 更新网表 |
| `getAllPrimitivesByNet(net, primitiveTypes)` | net: string; primitiveTypes: EPCB_PrimitiveType[] | (BETA) 获取网络的所有图元 |
| `highlightNet(net)` | net: string | (BETA) 高亮网络 |
| `unhighlightNet(net)` | net: string | (BETA) 取消高亮 |
| `selectNet(net)` | net: string | (BETA) 选中网络 |

### PCB_Layer — `eda.pcb_Layer` — 图层操作
| 方法 | 参数 | 描述 |
|------|------|------|
| `getAllLayers()` | 无 | (BETA) 获取所有图层属性 |
| `selectLayer(layer)` | layer: EPCB_LayerId | 选中图层 |
| `setLayerVisible(layer, setOtherLayerInvisible)` | layer: EPCB_LayerId; setOtherLayerInvisible: boolean | (BETA) 设置层可见 |
| `setLayerInvisible(layer, setOtherLayerVisible)` | layer: EPCB_LayerId; setOtherLayerVisible: boolean | (BETA) 设置层不可见 |
| `lockLayer(layer)` | layer: EPCB_LayerId | (BETA) 锁定层 |
| `unlockLayer(layer)` | layer: EPCB_LayerId | (BETA) 解锁层 |
| `modifyLayer(layer, property)` | layer: EPCB_LayerId; property: 修改属性 | (BETA) 修改图层属性 |
| `addCustomLayer()` | 无 | (BETA) 新增自定义层 |
| `removeLayer(layer)` | layer: EPCB_LayerId | (BETA) 移除层 |
| `setTheNumberOfCopperLayers(numberOfLayers)` | numberOfLayers: number | (BETA) 设置铜箔层数 |
| `setPcbType(pcbType)` | pcbType: EPCB_PcbPlateType | (BETA) 设置PCB类型 |
| `setInactiveLayerDisplayMode(displayMode)` | displayMode: EPCB_InactiveLayerDisplayMode | (BETA) 非激活层展示模式 |
| `setInactiveLayerTransparency(transparency)` | transparency: number | (BETA) 非激活层透明度 |
| `setLayerColorConfiguration(colorConfiguration)` | colorConfiguration: EPCB_LayerColorConfiguration | (BETA) 层颜色配置 |

### PCB_SelectControl — `eda.pcb_SelectControl` — 选择控制
| 方法 | 参数 | 描述 |
|------|------|------|
| `getSelectedPrimitives()` | 无 | (BETA) 查询选中图元参数 |
| `getAllSelectedPrimitives_PrimitiveId()` | 无 | (BETA) 查询所有已选中图元ID |
| `getAllSelectedPrimitives()` | 无 | (BETA) 查询所有已选中图元对象 |
| `doSelectPrimitives(primitiveIds)` | primitiveIds: string[] | (BETA) 选中图元 |
| `clearSelected()` | 无 | (BETA) 清除选中 |
| `doCrossProbeSelect(components, pins, nets, highlight, select)` | 交叉选择参数 | (BETA) 交叉选择 |
| `getCurrentMousePosition()` | 无 | (BETA) 获取鼠标画布位置 |

### PCB_Event — `eda.pcb_Event` — 事件监听
| 方法 | 参数 | 描述 |
|------|------|------|
| `addMouseEventListener(id, eventType, callFn, onlyOnce)` | id: string; eventType; callFn: Function; onlyOnce: boolean | (BETA) 鼠标事件 |
| `addPrimitiveEventListener(id, eventType, callFn, onlyOnce)` | id: string; eventType; callFn: Function; onlyOnce: boolean | (BETA) 图元事件 |
| `addNetEventListener(id, eventType, callFn, onlyOnce)` | id: string; eventType; callFn: Function; onlyOnce: boolean | (BETA) 网络事件 |
| `addCrossProbeSelectEventListener(id, callFn)` | id: string; callFn: Function | (BETA) 交叉选择事件 |
| `isEventListenerAlreadyExist(id)` | id: string | 查询监听是否存在 |
| `removeEventListener(id)` | id: string | 移除监听 |

### PCB_Drc — `eda.pcb_Drc` — 设计规则检查
| 方法 | 参数 | 描述 |
|------|------|------|
| `check(strict, userInterface, includeVerboseError)` | 三个boolean | (BETA) 检查DRC |
| `getCurrentRuleConfigurationName()` | 无 | 获取当前规则配置名 |
| `getRuleConfiguration(configurationName)` | configurationName: string | 获取指定规则配置 |
| `getAllRuleConfigurations(includeSystem)` | includeSystem: boolean | (BETA) 获取所有规则配置 |
| `getCurrentRuleConfiguration()` | 无 | (BETA) 获取当前规则配置 |
| `getDefaultRuleConfigurationName()` | 无 | (BETA) 获取默认规则名 |
| `saveRuleConfiguration(ruleConfiguration, configurationName, allowOverwrite)` | 配置; 名称; 是否覆盖 | (BETA) 保存规则配置 |
| `overwriteCurrentRuleConfiguration(ruleConfiguration)` | 配置对象 | (BETA) 覆写当前配置 |
| `deleteRuleConfiguration(configurationName)` | string | (BETA) 删除配置 |
| `renameRuleConfiguration(originalName, newName)` | 原名; 新名 | (BETA) 重命名 |
| `setAsDefaultRuleConfiguration(configurationName)` | string | (BETA) 设为默认 |
| `getNetRules()` | 无 | (BETA) 获取网络规则 |
| `overwriteNetRules(netRules)` | 规则数据 | (BETA) 覆写网络规则 |
| `getNetByNetRules()` | 无 | (BETA) 获取网络-网络规则 |
| `overwriteNetByNetRules(rules)` | 规则数据 | (BETA) 覆写网络-网络规则 |
| `getRegionRules()` | 无 | (BETA) 获取区域规则 |
| `overwriteRegionRules(rules)` | 规则数据 | (BETA) 覆写区域规则 |
| `createNetClass(netClassName, nets, color)` | name: string; nets: string[]; color: string | (BETA) 创建网络类 |
| `modifyNetClassName(originalName, newName)` | 原名; 新名 | (BETA) 修改网络类名 |
| `deleteNetClass(netClassName)` | string | (BETA) 删除网络类 |
| `addNetToNetClass(netClassName, net)` | name; net: string | (BETA) 添加网络到类 |
| `removeNetFromNetClass(netClassName, net)` | name; net: string | (BETA) 从类移除网络 |
| `getAllNetClasses()` | 无 | (BETA) 获取所有网络类 |
| `createDifferentialPair(name, positiveNet, negativeNet)` | 三个string | (BETA) 创建差分对 |
| `deleteDifferentialPair(name)` | string | (BETA) 删除差分对 |
| `getAllDifferentialPairs()` | 无 | (BETA) 获取所有差分对 |
| `createEqualLengthNetGroup(name, nets, color)` | name; nets: string[]; color | (BETA) 创建等长网络组 |
| `deleteEqualLengthNetGroup(name)` | string | (BETA) 删除等长网络组 |
| `getAllEqualLengthNetGroups()` | 无 | (BETA) 获取所有等长网络组 |
| `createPadPairGroup(name, padPairs)` | name; padPairs: 焊盘对数组 | (BETA) 创建焊盘对组 |
| `deletePadPairGroup(name)` | string | (BETA) 删除焊盘对组 |
| `getAllPadPairGroups()` | 无 | (BETA) 获取所有焊盘对组 |
| `getPadPairGroupMinWireLength(name)` | string | (BETA) 获取最短导线长度 |

### PCB_MathPolygon — `eda.pcb_MathPolygon` — 多边形数学计算
> 待补充详细方法

### PCB_ManufactureData — `eda.pcb_ManufactureData` — 生产资料
> 待补充详细方法

---

根据以上API完成任务：**$ARGUMENTS**
