## 嘉立创EDA — 系统 API (SYS_*)

`/eda-sys <TASK_DESCRIPTION>`

系统相关扩展API参考。任务：$ARGUMENTS

---

### SYS_WebSocket — `eda.sys_WebSocket` — WebSocket通信
| 方法 | 参数 | 描述 |
|------|------|------|
| `register(id, serviceUri, receiveMessageCallFn, connectedCallFn, protocols)` | id: string; serviceUri: string; receiveMessageCallFn: Function; connectedCallFn: Function; protocols: string | 注册WebSocket连接 |
| `send(id, data, extensionUuid)` | id: string; data: string; extensionUuid?: string | 发送数据 |
| `close(id, code, reason, extensionUuid)` | id: string; code?: number; reason?: string; extensionUuid?: string | 关闭连接 |

### SYS_ClientUrl — `eda.sys_ClientUrl` — HTTP外部请求
| 方法 | 参数 | 描述 |
|------|------|------|
| `request(url, method, data, options, succeedCallFn)` | url: string; method: string; data: any; options: object; succeedCallFn: Function | 发起cURL请求 |

### SYS_Dialog — `eda.sys_Dialog` — 对话框
| 方法 | 参数 | 描述 |
|------|------|------|
| `showInformationMessage(content, title, buttonTitle)` | content, title, buttonTitle: string | 弹出消息窗口 |
| `showConfirmationMessage(content, title, mainButtonTitle, buttonTitle, callbackFn)` | content; title; mainButtonTitle; buttonTitle; callbackFn: Function | 弹出确认窗口 |
| `showInputDialog(beforeContent, afterContent, title, type, value, otherProperty, callbackFn)` | 各项内容和回调 | (BETA) 弹出输入窗口 |
| `showSelectDialog(options, beforeContent, afterContent, title, defaultOption, multiple, callbackFn)` | options数组; 各项; multiple: boolean; callbackFn | (BETA) 弹出选择窗口 |

### SYS_ToastMessage — `eda.sys_ToastMessage` — 吐司消息
| 方法 | 参数 | 描述 |
|------|------|------|
| `showMessage(message, messageType, timer, bottomPanel, buttonTitle, buttonCallbackFn)` | message: string; messageType: ESYS_ToastMessageType; timer?: number(ms); bottomPanel?; buttonTitle?; buttonCallbackFn? | 显示吐司消息 |

### SYS_Message — `eda.sys_Message` — 消息通知
| 方法 | 参数 | 描述 |
|------|------|------|
| `showToastMessage(message, messageType, timer, bottomPanel, buttonTitle, buttonCallbackFn)` | 同SYS_ToastMessage.showMessage | 显示吐司消息 |
| `showFollowMouseTip(tip, msTimeout)` | tip: string; msTimeout: number | (BETA) 跟随鼠标提示 |
| `removeFollowMouseTip(tip)` | tip: string | (BETA) 移除鼠标提示 |

### SYS_IFrame — `eda.sys_IFrame` — 内联框架窗口
| 方法 | 参数 | 描述 |
|------|------|------|
| `openIFrame(htmlFileName, width, height, id, props)` | htmlFileName: string; width, height: number; id: string; props: object | (BETA) 打开IFrame |
| `closeIFrame(id)` | id: string | (BETA) 关闭 |
| `showIFrame(id)` | id: string | (BETA) 显示 |
| `hideIFrame(id)` | id: string | (BETA) 隐藏 |

### SYS_Environment — `eda.sys_Environment` — 运行环境
| 方法 | 参数 | 描述 |
|------|------|------|
| `getEditorCurrentVersion()` | 无 | 编辑器版本 |
| `getEditorCompliedDate()` | 无 | 编译日期 |
| `getUserInfo()` | 无 | 用户信息 |
| `isClient()` | 无 | 是否客户端 |
| `isWeb()` | 无 | 是否浏览器 |
| `isOnlineMode()` | 无 | 是否在线 |
| `isOfflineMode()` | 无 | 是否全离线 |
| `isHalfOfflineMode()` | 无 | 是否半离线 |
| `isJLCEDAProEdition()` | 无 | 是否嘉立创EDA专业版 |
| `isEasyEDAProEdition()` | 无 | 是否EasyEDA Pro版 |
| `isProPrivateEdition()` | 无 | 是否私有化部署版 |

### SYS_FileSystem — `eda.sys_FileSystem` — 文件系统
| 方法 | 参数 | 描述 |
|------|------|------|
| `getExtensionFile(uri)` | uri: string | 获取扩展内文件 |
| `saveFile(fileData, fileName)` | fileData; fileName: string | 保存文件(下载) |
| `openReadFileDialog(filenameExtensions, multiFiles)` | filenameExtensions: string; multiFiles: boolean | (BETA) 打开文件读入窗口 |
| `readFileFromFileSystem(uri)` | uri: string | (BETA) 读取文件 |
| `saveFileToFileSystem(uri, fileData, fileName, force)` | uri; fileData; fileName; force: boolean | (BETA) 写入文件 |
| `deleteFileInFileSystem(uri, force)` | uri: string; force: boolean | (BETA) 删除文件 |
| `listFilesOfFileSystem(folderPath, recursive)` | folderPath: string; recursive: boolean | (BETA) 列出文件 |
| `getDocumentsPath()` | 无 | (BETA) 文档目录 |
| `getEdaPath()` | 无 | (BETA) EDA目录 |
| `getLibrariesPaths()` | 无 | (BETA) 库目录 |
| `getProjectsPaths()` | 无 | (BETA) 工程目录 |

### SYS_I18n — `eda.sys_I18n` — 多语言
| 方法 | 参数 | 描述 |
|------|------|------|
| `text(tag, namespace, language, args)` | tag: string; namespace?; language?; args? | 输出翻译文本 |
| `getCurrentLanguage()` | 无 | 当前语言 |
| `getAllSupportedLanguages()` | 无 | 所有支持语言 |
| `isLanguageSupported(language)` | language: string | 语言是否支持 |
| `importMultilingual(language, source)` | language; source | 导入多语言 |
| `importMultilingualNamespace(namespace, source)` | namespace; source | 导入(指定命名空间) |
| `importMultilingualLanguage(namespace, language, source)` | namespace; language; source | 导入(命名空间+语言) |
| `addLanguageChangedEventListener(id, callFn, onlyOnce)` | id; callFn; onlyOnce: boolean | 语言切换监听 |
| `isEventListenerAlreadyExist(id)` | id: string | 监听是否存在 |
| `removeEventListener(id)` | id: string | 移除监听 |

### SYS_HeaderMenu — `eda.sys_HeaderMenu` — 顶部菜单
| 方法 | 参数 | 描述 |
|------|------|------|
| `insertHeaderMenus(headerMenus)` | headerMenus: ISYS_HeaderMenus | 导入菜单 |
| `removeHeaderMenus()` | 无 | 移除菜单 |
| `replaceHeaderMenus(headerMenus)` | headerMenus: ISYS_HeaderMenus | 替换菜单 |
| `insertSystemHeaderMenuItem(env, id, props)` | env: ESYS_HeaderMenuEnvironment; id; props | (BETA) 插入系统菜单项 |
| `removeSystemHeaderMenuItem(id, props)` | id; props | (BETA) 移除系统菜单项 |

### SYS_Storage — `eda.sys_Storage` — 扩展存储
| 方法 | 参数 | 描述 |
|------|------|------|
| `getExtensionUserConfig(key)` | key: string | 获取配置 |
| `setExtensionUserConfig(key, value)` | key: string; value: any | 设置配置 |
| `deleteExtensionUserConfig(key)` | key: string | 删除配置 |
| `getExtensionAllUserConfigs()` | 无 | 获取所有配置 |
| `setExtensionAllUserConfigs(configs)` | configs: object | 设置所有配置 |
| `clearExtensionAllUserConfigs()` | 无 | 清除所有配置 |

### SYS_Unit — `eda.sys_Unit` — 单位转换
| 方法 | 参数 | 描述 |
|------|------|------|
| `getSystemDataUnit()` | 无 | 系统数据单位(mil) |
| `milToMm(mil, numberOfDecimals)` | mil: number; numberOfDecimals?: number | 密尔→毫米 |
| `mmToMil(mm, numberOfDecimals)` | mm: number; numberOfDecimals?: number | 毫米→密尔 |
| `milToInch(mil, numberOfDecimals)` | mil: number; numberOfDecimals?: number | 密尔→英寸 |
| `inchToMil(inch, numberOfDecimals)` | inch: number; numberOfDecimals?: number | 英寸→密尔 |
| `mmToInch(mm, numberOfDecimals)` | mm: number; numberOfDecimals?: number | 毫米→英寸 |
| `inchToMm(inch, numberOfDecimals)` | inch: number; numberOfDecimals?: number | 英寸→毫米 |

### SYS_Window — `eda.sys_Window` — 窗口操作
| 方法 | 参数 | 描述 |
|------|------|------|
| `open(url, target)` | url: string; target: ESYS_WindowOpenTarget | 打开资源窗口 |
| `openUI(uiName, args)` | uiName: string; args: any | 打开UI窗口 |
| `getCurrentTheme()` | 无 | 当前主题 |
| `getUrlParam(key)` | key: string | 获取URL参数 |
| `getUrlAnchor()` | 无 | 获取URL锚点 |
| `addEventListener(type, listener, options)` | type: ESYS_WindowEventType; listener: Function; options | 新增事件监听 |
| `removeEventListener(removableObject)` | removableObject | 移除事件监听 |
| `urlPushState(url)` | url: string | 追加URL历史 |
| `urlReplaceState(url)` | url: string | 修改URL历史 |

### SYS_MessageBus — `eda.sys_MessageBus` — 消息总线
| 方法 | 参数 | 描述 |
|------|------|------|
| `createPrivateMessageBus()` | 无 | 创建私有总线 |
| `removePrivateMessageBus()` | 无 | 移除私有总线 |
| `subscribe(topic, callbackFn)` | topic: string; callbackFn: Function | 私有：订阅 |
| `subscribeOnce(topic, callbackFn)` | topic; callbackFn | 私有：订阅单次 |
| `publish(topic, message)` | topic: string; message: any | 私有：发布 |
| `push(topic, message)` | topic; message | 私有：推 |
| `pull(topic, callbackFn)` | topic; callbackFn | 私有：拉 |
| `pullAsync(topic)` | topic: string | 私有：拉(Promise) |
| `rpcCall(topic, message, timeout)` | topic; message; timeout: number | 私有：RPC调用 |
| `rpcService(topic, callbackFn)` | topic; callbackFn | 私有：注册RPC服务 |
| `subscribePublic(topic, callbackFn)` | topic; callbackFn | 公共：订阅 |
| `subscribeOncePublic(topic, callbackFn)` | topic; callbackFn | 公共：订阅单次 |
| `publishPublic(topic, message)` | topic; message | 公共：发布 |
| `pushPublic(topic, message)` | topic; message | 公共：推 |
| `pullPublic(topic, callbackFn)` | topic; callbackFn | 公共：拉 |
| `pullAsyncPublic(topic)` | topic | 公共：拉(Promise) |
| `rpcCallPublic(topic, message, timeout)` | topic; message; timeout | 公共：RPC调用 |
| `rpcServicePublic(topic, callbackFn)` | topic; callbackFn | 公共：注册RPC服务 |

### SYS_ShortcutKey — `eda.sys_ShortcutKey` — 快捷键
| 方法 | 参数 | 描述 |
|------|------|------|
| `registerShortcutKey(shortcutKey, title, callbackFn, documentType, scene)` | shortcutKey: TSYS_ShortcutKeys; title; callbackFn; documentType; scene | (BETA) 注册快捷键 |
| `unregisterShortcutKey(shortcutKey)` | shortcutKey: TSYS_ShortcutKeys | (BETA) 反注册 |
| `getShortcutKeys(includeSystem)` | includeSystem: boolean | (BETA) 查询快捷键列表 |

### SYS_RightClickMenu — `eda.sys_RightClickMenu` — 右键菜单
| 方法 | 参数 | 描述 |
|------|------|------|
| `changeMenu(menuId, menuItems)` | menuId: string; menuItems: ISYS_RightClickMenuItem[] | (BETA) 修改右键菜单 |

### SYS_Log — `eda.sys_Log` — 日志
> 待补充详细方法

### SYS_Timer — `eda.sys_Timer` — 定时器
> 待补充详细方法

### SYS_Tool — `eda.sys_Tool` — 工具
> 待补充详细方法

### SYS_Setting — `eda.sys_Setting` — 设置
> 待补充详细方法

### SYS_PanelControl — `eda.sys_PanelControl` — 面板控制
> 待补充详细方法

### SYS_LoadingAndProgressBar — `eda.sys_LoadingAndProgressBar` — 加载与进度条
> 待补充详细方法

### SYS_MessageBox — `eda.sys_MessageBox` — 消息框
> 待补充详细方法

### SYS_FontManager — `eda.sys_FontManager` — 字体管理
> 待补充详细方法

### SYS_FileManager — `eda.sys_FileManager` — 文件管理
> 待补充详细方法

### SYS_FormatConversion — `eda.sys_FormatConversion` — 格式转换(Chameleon)
> 待补充详细方法

---

根据以上API完成任务：**$ARGUMENTS**
