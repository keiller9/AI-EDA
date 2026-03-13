## 生产前设计检查 / Pre-Fabrication Design Check

`/design-check <SCOPE>`

你是 EDA 生产前检查专家。对当前设计进行全面的生产就绪检查。
检查范围：$ARGUMENTS（可选值：sch / pcb / all，默认 all）

---

### 检查流程

#### 第一阶段：环境与 DRC

1. `eda_connection_status` — 确认连接
2. `eda_sys_get_document_info` — 确认编辑器环境
3. `eda_check_design` type="sch" — 原理图 DRC（scope 含 sch 时）
4. `eda_check_design` type="pcb" — PCB DRC（scope 含 pcb 时）

#### 第二阶段：交叉比对

5. `eda_sch_list_components` — 原理图器件清单
6. `eda_pcb_list_components` — PCB 器件清单
7. 比对两份清单的位号（designator）：
   - 原理图有但 PCB 没有 → **缺失器件**
   - PCB 有但原理图没有 → **多余器件**

#### 第三阶段：网络完整性

8. `eda_pcb_list_nets` — 获取所有 PCB 网络
9. 找 length=0 的网络 → **未布线网络**
10. 统计未布线比例

#### 第四阶段：BOM 完整性

11. `eda_sys_export_bom` — 导出 BOM 数据
12. 检查每个器件是否有：值（Value）、封装（Footprint）
13. 标记缺失项

#### 第五阶段：汇总报告

14. `eda_sys_show_message` — 在 EDA 中显示总结

---

### 检查规则

#### BOM 完整性
- 所有器件必须有 Value（阻值/容值/型号）
- 所有器件必须有封装（Footprint）
- 虚拟器件（测试点、安装孔）除外

#### 原理图 ↔ PCB 一致性
- 位号必须一一对应
- 原理图修改后必须"导入变更"到 PCB
- 多页原理图的所有器件都必须出现在 PCB 中

#### 网络布线完整性
- 所有网络 length > 0（已布线）
- GND 网络可能 length=0（如果用铺铜代替走线，属正常）
- 电源网络 length=0 → 严重问题

#### 制造约束
- 最小走线宽度 ≥ 4mil（常规），≥ 3.5mil（精密）
- 最小钻孔直径 ≥ 8mil（机械钻），≥ 4mil（激光钻）
- 板框（Board Outline）必须闭合
- 安装孔位置与机械图一致

#### 丝印检查
- 器件位号丝印可见且不压焊盘
- 丝印文字高度 ≥ 30mil，线宽 ≥ 5mil
- 极性标记清晰（电解电容、二极管、IC Pin1）

---

### 输出格式

```
## Pre-Fabrication Design Check Report

### 检查环境
- 编辑器版本 / 文档类型 / 检查时间

### 1. DRC 结果
- 原理图: [PASS/FAIL] — X 项违规
- PCB: [PASS/FAIL] — X 项违规

### 2. 原理图 ↔ PCB 一致性
- [PASS/FAIL]
- 缺失器件列表（原理图有/PCB无）
- 多余器件列表（PCB有/原理图无）

### 3. 网络布线完整性
- [PASS/FAIL]
- 已布线: X/Y 网络 (Z%)
- 未布线网络列表

### 4. BOM 完整性
- [PASS/WARN]
- 缺少 Value 的器件列表
- 缺少 Footprint 的器件列表

### 5. 总结
| 检查项 | 状态 |
|--------|------|
| DRC | PASS/FAIL |
| 一致性 | PASS/FAIL |
| 布线 | PASS/FAIL |
| BOM | PASS/WARN |
| **总体** | **READY / NOT READY** |

建议修复优先级：...
```

最后在 EDA 编辑器中用 `eda_sys_show_message` 显示总体结果（success 或 error）。
