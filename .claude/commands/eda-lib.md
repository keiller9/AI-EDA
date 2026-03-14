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
| 方法 | 参数 | 描述 |
|------|------|------|
| `create(libraryUuid, symbolName, classification?, symbolType?, description?)` | 库UUID; 名称; 分类; 类型: ELIB_SymbolType | (BETA) 创建符号 |
| `modify(symbolUuid, libraryUuid, symbolName?, classification?, description?)` | 各参数 | (BETA) 修改符号 |
| `delete(symbolUuid, libraryUuid)` | UUID; 库UUID | (BETA) 删除符号 |
| `get(symbolUuid, libraryUuid)` | UUID; 库UUID | (BETA) 获取符号属性 → ILIB_SymbolItem |
| `search(key, libraryUuid, classification?, symbolType?, itemsOfPage?, page?)` | 搜索参数 | (BETA) 搜索符号 |
| `copy(symbolUuid, libraryUuid, targetLibraryUuid, targetClassification?, newName?)` | 复制参数 | (BETA) 复制符号 |

### LIB_Footprint — `eda.lib_Footprint` — 封装管理
| 方法 | 参数 | 描述 |
|------|------|------|
| `create(libraryUuid, footprintName, classification?, description?)` | 库UUID; 名称 | (BETA) 创建封装 |
| `modify(footprintUuid, libraryUuid, footprintName?, classification?, description?)` | 各参数 | (BETA) 修改封装 |
| `delete(footprintUuid, libraryUuid)` | UUID; 库UUID | (BETA) 删除封装 |
| `get(footprintUuid, libraryUuid)` | UUID; 库UUID | (BETA) 获取封装属性 → ILIB_FootprintItem |
| `search(key, libraryUuid, classification?, itemsOfPage?, page?)` | 搜索参数 | (BETA) 搜索封装 |
| `copy(footprintUuid, libraryUuid, targetLibraryUuid, targetClassification?, newName?)` | 复制参数 | (BETA) 复制封装 |

### LIB_3DModel — `eda.lib_3DModel` — 3D模型管理
| 方法 | 参数 | 描述 |
|------|------|------|
| `create(libraryUuid, modelFile, classification?, unit?)` | 库UUID; File; 分类 | (BETA) 创建3D模型 |
| `modify(modelUuid, libraryUuid, modelName?, classification?)` | 各参数 | (BETA) 修改3D模型 |
| `delete(modelUuid, libraryUuid)` | UUID; 库UUID | (BETA) 删除3D模型 |
| `get(modelUuid, libraryUuid)` | UUID; 库UUID | (BETA) 获取3D模型属性 |
| `search(key, libraryUuid, classification?, itemsOfPage?, page?)` | 搜索参数 | (BETA) 搜索3D模型 |

### LIB_Cbb — `eda.lib_Cbb` — 复用模块管理
| 方法 | 参数 | 描述 |
|------|------|------|
| `create(libraryUuid, cbbName, classification?, description?)` | 库UUID; 名称 | (BETA) 创建复用模块 |
| `modify(cbbUuid, libraryUuid, cbbName?, classification?, description?)` | 各参数 | (BETA) 修改 |
| `delete(cbbUuid, libraryUuid)` | UUID; 库UUID | (BETA) 删除 |
| `get(cbbUuid, libraryUuid)` | UUID; 库UUID | (BETA) 获取属性 → ILIB_CbbItem |
| `search(key, libraryUuid, classification?, itemsOfPage?, page?)` | 搜索参数 | (BETA) 搜索 |

### LIB_Classification — `eda.lib_Classification` — 库分类索引
| 方法 | 参数 | 描述 |
|------|------|------|
| `createPrimary(libraryUuid, libraryType, name)` | 库UUID; ELIB_LibraryType; 名称 | (BETA) 创建一级分类 |
| `createSecondary(libraryUuid, libraryType, primaryUuid, name)` | 一级UUID下创建 | (BETA) 创建二级分类 |
| `getIndexByName(libraryUuid, libraryType, primary, secondary?)` | 名称查索引 | (BETA) 按名称查分类索引 |
| `getNameByIndex(libraryUuid, libraryType, ...)` | 索引查名称 | (BETA) 按索引查分类名 |

### LIB_LibrariesList — `eda.lib_LibrariesList` — 库列表
| 方法 | 参数 | 描述 |
|------|------|------|
| `getSystemLibraryUuid()` | 无 | 获取系统库UUID |
| `getPersonalLibraryUuid()` | 无 | 获取个人库UUID |
| `getProjectLibraryUuid()` | 无 | 获取工程库UUID |
| `getTeamLibrariesUuid(teamUuid?)` | 团队UUID | 获取团队库UUID列表 |
| `getLibraryInfo(libraryUuid)` | UUID | 获取库信息 → ILIB_LibraryInfo |
| `getAllLibrariesInfo()` | 无 | 获取所有库信息 |

### LIB_PanelLibrary — `eda.lib_PanelLibrary` — 面板库
| 方法 | 参数 | 描述 |
|------|------|------|
| `create(libraryUuid, name, classification?, description?)` | 库UUID; 名称 | (BETA) 创建面板库 |
| `modify(panelLibraryUuid, libraryUuid, name?, classification?, description?)` | 各参数 | (BETA) 修改 |
| `delete(panelLibraryUuid, libraryUuid)` | UUID | (BETA) 删除 |
| `get(panelLibraryUuid, libraryUuid)` | UUID | (BETA) 获取属性 |
| `search(key, libraryUuid, classification?, itemsOfPage?, page?)` | 搜索参数 | (BETA) 搜索 |

### LIB_SelectControl — `eda.lib_SelectControl` — 库选择控制
| 方法 | 参数 | 描述 |
|------|------|------|
| `getSelectedLibraryRowInfo()` | 无 | 获取当前选中的库行信息 |

---

根据以上API完成任务：**$ARGUMENTS**
