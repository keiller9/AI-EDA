## 嘉立创EDA — 综合库 API (LIB_*)

`/eda-lib <TASK_DESCRIPTION>`

综合库相关扩展API参考。任务：$ARGUMENTS

---

### LIB_Device — `eda.lib_Device` — 器件管理
| 方法 | 参数 | 描述 |
|------|------|------|
| `get(deviceUuid, libraryUuid)` | deviceUuid, libraryUuid: string | (BETA) 获取器件所有属性 |
| `search(key, libraryUuid, classification, symbolType, itemsOfPage, page)` | key: 关键词; libraryUuid; classification; symbolType; 分页参数 | (BETA) 搜索器件 |
| `create(libraryUuid, deviceName, classification, association, description, property)` | 库UUID; 名称; 分类; 关联; 描述; 属性 | (BETA) 创建器件 |
| `modify(deviceUuid, libraryUuid, ...)` | UUID; 库UUID; 名称; 分类; 关联; 描述; 属性 | (BETA) 修改器件 |
| `delete(deviceUuid, libraryUuid)` | UUID; 库UUID | (BETA) 删除器件 |
| `copy(deviceUuid, libraryUuid, targetLibraryUuid, targetClassification, newDeviceName)` | 源UUID; 源库; 目标库; 目标分类; 新名称 | (BETA) 复制器件 |
| `getByLcscIds(lcscIds, libraryUuid, allowMultiMatch)` | lcscIds: string[]; libraryUuid; allowMultiMatch: boolean | (BETA) 用立创C编号获取器件 |

### LIB_Symbol — `eda.lib_Symbol` — 符号管理
> 待补充详细方法

### LIB_Footprint — `eda.lib_Footprint` — 封装管理
> 待补充详细方法

### LIB_3DModel — `eda.lib_3DModel` — 3D模型管理
> 待补充详细方法

### LIB_Cbb — `eda.lib_Cbb` — 复用模块管理
> 待补充详细方法

### LIB_Classification — `eda.lib_Classification` — 库分类索引
> 待补充详细方法

### LIB_LibrariesList — `eda.lib_LibrariesList` — 库列表
> 待补充详细方法

### LIB_PanelLibrary — `eda.lib_PanelLibrary` — 面板库
> 待补充详细方法

### LIB_SelectControl — `eda.lib_SelectControl` — 库选择控制
> 待补充详细方法

---

根据以上API完成任务：**$ARGUMENTS**
