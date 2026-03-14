## 嘉立创EDA — 文档树 API (DMT_*)

`/eda-dmt <TASK_DESCRIPTION>`

文档树相关扩展API参考。任务：$ARGUMENTS

---

### DMT_SelectControl — `eda.dmt_SelectControl` — 选择/文档信息
| 方法 | 参数 | 描述 |
|------|------|------|
| `getCurrentDocumentInfo()` | 无 | 获取当前文档类型、UUID、工程/库UUID → IDMT_EditorDocumentItem |

### DMT_Project — `eda.dmt_Project` — 工程管理
| 方法 | 参数 | 描述 |
|------|------|------|
| `openProject(projectUuid)` | projectUuid: string | 打开工程 |
| `createProject(projectFriendlyName, projectName?, teamUuid?, folderUuid?, description?, collaborationMode?)` | 名称+可选参数 | 创建工程 |
| `modifyProjectFriendlyName(projectUuid, name)` | UUID; 新名称 | 修改工程名 |
| `modifyProjectDescription(projectUuid, description)` | UUID; 描述 | 修改描述 |
| `getProjectInfo(projectUuid)` | UUID | 获取工程详情 → IDMT_ProjectItem |
| `getAllProjectsInfo(teamUuid)` | teamUuid: string | 获取所有工程 → IDMT_BriefProjectItem[] |

### DMT_Board — `eda.dmt_Board` — 板子管理
| 方法 | 参数 | 描述 |
|------|------|------|
| `createBoard(schematicUuid?, pcbUuid?)` | 可选关联SCH/PCB | 创建板子 |
| `modifyBoardName(originalBoardName, boardName)` | 原名; 新名 | 修改板子名 |
| `copyBoard(sourceBoardName)` | 源板名 | 复制板子 |
| `getBoardInfo(boardName)` | 板名 | 获取板子详情 → IDMT_BoardItem |
| `getAllBoardsName()` | 无 | 获取所有板子名 → string[] |

### DMT_Schematic — `eda.dmt_Schematic` — 原理图管理
| 方法 | 参数 | 描述 |
|------|------|------|
| `createSchematic(boardName?)` | boardName?: string | 创建原理图 |
| `createSchematicPage(schematicUuid)` | UUID | 创建图页 |
| `modifySchematicName(schematicUuid, name)` | UUID; 名称 | 修改原理图名 |
| `modifySchematicPageName(pageUuid, name)` | UUID; 名称 | 修改图页名 |
| `getSchematicInfo(schematicUuid)` | UUID | 获取原理图详情 → IDMT_SchematicItem |
| `getAllSchematicsInfo()` | 无 | 获取所有原理图 |

### DMT_Pcb — `eda.dmt_Pcb` — PCB管理
| 方法 | 参数 | 描述 |
|------|------|------|
| `createPcb(boardName?)` | boardName?: string | 创建PCB |
| `modifyPcbName(pcbUuid, pcbName)` | UUID; 名称 | 修改PCB名 |
| `copyPcb(pcbUuid, boardName?)` | UUID; 目标板 | 复制PCB |
| `getPcbInfo(pcbUuid)` | UUID | 获取PCB详情 → IDMT_PcbItem |
| `getAllPcbsInfo()` | 无 | 获取所有PCB |

### DMT_EditorControl — `eda.dmt_EditorControl` — 编辑器控制
| 方法 | 参数 | 描述 |
|------|------|------|
| `openDocument(documentUuid, splitScreenId?)` | UUID; 可选分屏ID | 打开文档 |
| `openLibraryDocument(libraryUuid, libraryType, uuid, splitScreenId?)` | 库UUID+类型+UUID | 打开库文档(符号/封装) |
| `closeDocument(tabId)` | tabId: string | 关闭文档 |
| `getSplitScreenTree()` | 无 | 获取分屏树 → IDMT_EditorSplitScreenItem |
| `getAllTabs(splitScreenId?)` | 可选分屏ID | 获取所有标签页 → IDMT_EditorTabItem[] |
| `setIndicatorMarker(documentUuid, markers)` | UUID; 标记数组 | 设置指示标记 |

### DMT_Folder — `eda.dmt_Folder` — 文件夹管理
| 方法 | 参数 | 描述 |
|------|------|------|
| `createFolder(folderName, teamUuid, parentFolderUuid?, description?)` | 名称; 团队UUID | 创建文件夹 |
| `modifyFolderName(teamUuid, folderUuid, name)` | 团队+文件夹UUID; 名称 | 修改文件夹名 |
| `modifyFolderDescription(teamUuid, folderUuid, desc?)` | 各参数 | 修改描述 |
| `moveFolder(teamUuid, folderUuid, targetFolderUuid?)` | 移动参数 | 移动文件夹 |
| `getFolderInfo(teamUuid, folderUuid)` | 团队+文件夹UUID | 获取详情 → IDMT_FolderItem |

### DMT_Panel — `eda.dmt_Panel` — 面板管理
| 方法 | 参数 | 描述 |
|------|------|------|
| `createPanel()` | 无 | 创建面板 |
| `modifyPanelName(panelUuid, name)` | UUID; 名称 | 修改面板名 |
| `copyPanel(panelUuid)` | UUID | 复制面板 |
| `getPanelInfo(panelUuid)` | UUID | 获取面板详情 → IDMT_PanelItem |

### DMT_Team — `eda.dmt_Team` — 团队
| 方法 | 参数 | 描述 |
|------|------|------|
| `getAllTeamsInfo()` | 无 | 获取所有直属团队 → IDMT_TeamItem[] |
| `getAllInvolvedTeamInfo()` | 无 | 获取所有参与团队 |
| `getCurrentTeamInfo()` | 无 | 获取当前团队 |

### DMT_Workspace — `eda.dmt_Workspace` — 工作区
| 方法 | 参数 | 描述 |
|------|------|------|
| `getAllWorkspacesInfo()` | 无 | 获取所有工作区 → IDMT_WorkspaceItem[] |
| `toggleToWorkspace(workspaceUuid?)` | UUID | 切换工作区 |
| `getCurrentWorkspaceInfo()` | 无 | 获取当前工作区 |

---

根据以上API完成任务：**$ARGUMENTS**
