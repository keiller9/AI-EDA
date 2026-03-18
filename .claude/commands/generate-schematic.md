## 自然语言生成原理图 / Generate Schematic

`/generate-schematic <电路描述>`

根据自然语言描述，通过 MCP API 在 JLCEDA Pro 编辑器中自动创建原理图。$ARGUMENTS

---

### 工作流程

#### 步骤 1：解析电路描述

从用户描述中提取：
- **功能模块**：电源、MCU、传感器、显示、通信、按键、LED 等
- **器件清单**：每个器件的类型、参数（阻值、容值、型号）
- **连接关系**：哪些引脚相连
- **电源需求**：电压域（3.3V / 5V / 12V）、供电方式

#### 步骤 2：组件研究

对每个器件查找嘉立创库中的真实元件：

```
eda_lib_search_device key="<器件关键字>"
```

如果知道 LCSC 编号：
```
eda_lib_get_device_by_lcsc lcscIds=["C<编号>"]
```

获取器件详情（引脚定义、封装）：
```
eda_lib_get_device deviceUuid=... libraryUuid=...
```

**常用 LCSC 编号参考：**
| 器件 | LCSC | 封装 |
|------|------|------|
| 10kΩ 电阻 | C25804 | 0402 |
| 1kΩ 电阻 | C11702 | 0402 |
| 100nF 电容 | C1525 | 0402 |
| 红色 LED | C2286 | 0603 |
| 轻触开关 | C318884 | 6x6mm |

#### 步骤 3：检查编辑器状态

```
eda_connection_status → 确认编辑器已连接
eda_dmt_get_document_info → 检查当前文档类型
```

如果当前没有打开原理图，可以创建新的：
```
eda_dmt_create_schematic → 创建新原理图
```

#### 步骤 4：布局规划

**布局原则：**
- 信号流向：**左 → 右**（输入在左，输出在右）
- 电源流向：**上 → 下**（VCC 在上，GND 在下）
- 网格间距：器件之间间距 **200 mil**
- 电源符号偏移：VCC 在器件上方 100 mil，GND 在器件下方 100 mil

**坐标规划模板：**
```
Y=-100  ──── VCC ────────────────── VCC ────
              |                      |
Y=0     [输入器件]──────────[处理器件]──────────[输出器件]
              |                      |
Y=100   ──── GND ────────────────── GND ────

X=      200       400       600       800
```

**在执行前，向用户展示布局计划表格：**
| 器件 | Designator | 位置 (x, y) | 旋转 |
|------|-----------|------------|------|
| ... | ... | ... | ... |

等待用户确认后再执行放置。

#### 步骤 5：放置器件

逐个放置组件：
```
eda_sch_place_component deviceId="<libraryUuid>:<deviceUuid>" x=<x> y=<y> rotation=<r>
```

放置后读取引脚位置：
```
eda_sch_get_component id=<componentId> → 获取引脚坐标
```

#### 步骤 6：连线与网络

画导线连接引脚：
```
eda_sch_draw_wire points=[{x:<x1>,y:<y1>}, {x:<x2>,y:<y2>}]
```

放置电源/地网络标志：
```
eda_sch_create_net_flag identification="Power" net="VCC" x=<x> y=<y>
eda_sch_create_net_flag identification="Ground" net="GND" x=<x> y=<y>
```

放置信号网络标签：
```
eda_sch_create_net_label x=<x> y=<y> net="SDA"
```

**连线规则：**
- 导线只走水平或垂直，不走斜线
- 转弯处使用中间点 `[{x1,y1}, {x_mid,y1}, {x_mid,y2}, {x2,y2}]`
- 导线端点必须精确对齐引脚坐标

#### 步骤 7：验证

```
eda_check_design type="sch" → 运行设计检查
eda_sch_list_nets → 验证所有网络连接
eda_sch_save → 保存文档
```

---

### 电气安全规则

放置器件前，自动检查以下规则：

1. **LED 必须有限流电阻** — 典型 1kΩ（红色 LED @3.3V）
2. **IC 必须有去耦电容** — 每个 VCC 引脚旁放 100nF
3. **I2C 总线需上拉电阻** — SDA/SCL 各 4.7kΩ
4. **RESET 引脚需上拉** — 10kΩ + 100nF RC 复位电路
5. **按键需消抖** — 100nF 电容并联或软件消抖
6. **UART/SPI 信号标注** — 用网络标签标明信号名

---

### 常用电路模板

#### LED 驱动电路
```
VCC → R (1kΩ) → LED (Anode) → LED (Cathode) → GND
```
器件：电阻 + LED + VCC + GND

#### 按键输入电路
```
VCC → R_pullup (10kΩ) → 节点A → MCU_INPUT
                         节点A → SW → GND
```
器件：上拉电阻 + 开关 + VCC + GND

#### MCU 最小系统
```
VCC → 去耦(100nF) → GND
VCC → MCU(VCC) ─── MCU(GND) → GND
      MCU(XTAL1) → 晶振 → MCU(XTAL2)
      MCU(RESET) → R(10kΩ) → VCC
      MCU(RESET) → C(100nF) → GND
```

#### LDO 电源
```
VIN → C_in(10μF) → LDO(VIN)
LDO(VOUT) → C_out(10μF) → 负载
LDO(GND) → GND
```

#### I2C 总线
```
VCC → R_SDA(4.7kΩ) → SDA 网络标签
VCC → R_SCL(4.7kΩ) → SCL 网络标签
```
