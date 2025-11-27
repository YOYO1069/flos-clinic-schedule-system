# FLOS 診所系統整合計畫表

## 📋 系統架構概覽

### 現有系統
1. **FLOSCLASS 後台系統** (https://classy-biscotti-42a418.netlify.app/)
   - 預約管理
   - 客戶管理
   - 病例管理
   - 員工管理
   - 同意書管理
   - 醫療團隊
   - 員工福利

2. **排班系統** (https://effulgent-dasik-9e082a.netlify.app/)
   - 員工休假月曆 ✅
   - 醫師排班
   - 員工排班
   - 員工打卡系統 ✅
   - 請假管理 ✅
   - 審核請假 ✅
   - 登入與權限系統 ✅

3. **LINE Bot 打卡系統** (Zeabur)
   - LINE 打卡功能
   - 打卡記錄查詢

---

## 🎯 整合計畫階段

### 第一階段:基礎整合 (已完成 ✅)

**目標:** 建立統一的員工管理和打卡系統

**已完成項目:**
- [x] 建立統一的 Supabase 資料庫
- [x] 實作員工登入系統
- [x] 實作四級權限制度(管理者/高階主管/一般主管/員工)
- [x] 整合網頁打卡功能
- [x] 實作請假管理和審核系統
- [x] 實作員工休假月曆
- [x] 管理者主控台(查看所有帳號密碼)

**資料庫結構:**
- `users` - 員工帳號資料
- `attendance_records` - 打卡記錄(支援 web/line 雙軌)
- `leave_requests` - 請假申請
- `staff_members` - 員工名單(休假月曆用)
- `leave_records` - 休假記錄(休假月曆用)

---

### 第二階段:排班與操作費整合 (規劃中 📋)

**目標:** 將排班系統與操作費系統整合,實現自動化薪資計算

#### 2.1 排班系統完善
**預計時程:** 2-3 週

**功能需求:**
- [ ] 醫師排班管理
  - 設定每日值班醫師
  - 支援多時段排班
  - 排班衝突檢測
  - 排班歷史記錄

- [ ] 員工排班管理
  - 設定員工班表(早班/中班/晚班)
  - 支援輪班制度
  - 自動計算工時
  - 排班公告通知

- [ ] 排班統計報表
  - 每月排班總覽
  - 員工工時統計
  - 醫師出診統計
  - 匯出 Excel 報表

**資料庫設計:**
```sql
-- 醫師排班表
CREATE TABLE doctor_schedules (
  id SERIAL PRIMARY KEY,
  doctor_name VARCHAR(100),
  schedule_date DATE,
  time_slot VARCHAR(50), -- 早班/午班/晚班
  status VARCHAR(20), -- 正常/請假/代班
  created_at TIMESTAMP DEFAULT NOW()
);

-- 員工排班表
CREATE TABLE staff_schedules (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR(50),
  schedule_date DATE,
  shift_type VARCHAR(20), -- 早班/中班/晚班
  work_hours DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 2.2 操作費系統整合
**預計時程:** 3-4 週

**功能需求:**
- [ ] 操作費記錄管理
  - 記錄每筆操作項目
  - 關聯執行人員
  - 設定分潤比例
  - 自動計算個人操作費

- [ ] 操作費統計
  - 每日操作費總覽
  - 個人操作費明細
  - 月度操作費報表
  - 年度操作費統計

- [ ] 薪資計算整合
  - 基本薪資設定
  - 操作費加總
  - 加班費計算
  - 請假扣款計算
  - 自動生成薪資單

**資料庫設計:**
```sql
-- 操作費記錄表
CREATE TABLE operation_fees (
  id SERIAL PRIMARY KEY,
  operation_date DATE,
  operation_type VARCHAR(100), -- 操作項目
  patient_name VARCHAR(100),
  total_amount DECIMAL(10,2), -- 總金額
  employee_id VARCHAR(50), -- 執行人員
  commission_rate DECIMAL(5,2), -- 分潤比例
  commission_amount DECIMAL(10,2), -- 個人操作費
  created_at TIMESTAMP DEFAULT NOW()
);

-- 薪資記錄表
CREATE TABLE salary_records (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR(50),
  salary_month VARCHAR(7), -- YYYY-MM
  base_salary DECIMAL(10,2), -- 基本薪資
  operation_fees DECIMAL(10,2), -- 操作費總額
  overtime_pay DECIMAL(10,2), -- 加班費
  leave_deduction DECIMAL(10,2), -- 請假扣款
  total_salary DECIMAL(10,2), -- 實領薪資
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 第三階段:預約系統交易格式整合 (規劃中 📋)

**目標:** 在預約欄位新增交易格式,整合收費和操作費記錄

**預計時程:** 4-5 週

#### 3.1 預約系統交易功能
**功能需求:**
- [ ] 預約單新增交易欄位
  - 服務項目選擇
  - 服務價格設定
  - 付款方式(現金/刷卡/轉帳)
  - 付款狀態(未付/已付/部分付款)

- [ ] 收費管理
  - 收費記錄
  - 收據列印
  - 退款處理
  - 分期付款

- [ ] 財務報表
  - 每日收入統計
  - 月度營收報表
  - 服務項目銷售統計
  - 應收帳款管理

**資料庫設計:**
```sql
-- 預約交易記錄表
CREATE TABLE appointment_transactions (
  id SERIAL PRIMARY KEY,
  appointment_id INTEGER, -- 關聯預約單
  patient_name VARCHAR(100),
  service_items JSONB, -- 服務項目清單
  total_amount DECIMAL(10,2), -- 總金額
  payment_method VARCHAR(20), -- 付款方式
  payment_status VARCHAR(20), -- 付款狀態
  paid_amount DECIMAL(10,2), -- 已付金額
  transaction_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 收費記錄表
CREATE TABLE payment_records (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER,
  payment_amount DECIMAL(10,2),
  payment_method VARCHAR(20),
  payment_date TIMESTAMP,
  receipt_number VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3.2 FLOSCLASS 後台整合
**功能需求:**
- [ ] 在 FLOSCLASS 預約管理中新增交易功能
- [ ] 整合操作費自動計算
- [ ] 整合財務報表
- [ ] 確保不影響現有預約和病歷功能

---

### 第四階段:LINE Bot 完整整合 (規劃中 📋)

**目標:** 將 LINE Bot 功能完整整合到排班系統

**預計時程:** 2-3 週

**功能需求:**
- [ ] LINE Bot 打卡記錄同步到 Supabase
- [ ] LINE Bot 查詢個人排班
- [ ] LINE Bot 請假申請
- [ ] LINE Bot 查詢薪資明細
- [ ] LINE Bot 推播排班通知

**技術實作:**
- 更新 LINE Bot 的資料庫連線到統一的 Supabase
- 實作 Webhook 同步機制
- 確保網頁和 LINE 雙軌操作一致性

---

### 第五階段:系統優化與擴展 (未來規劃 🔮)

**預計時程:** 持續進行

**功能需求:**
- [ ] 行動版 APP 開發
- [ ] 數據分析儀表板
- [ ] 自動化排班建議(AI)
- [ ] 客戶關係管理(CRM)整合
- [ ] 庫存管理系統
- [ ] 供應商管理系統

---

## 🗄️ 統一資料庫架構

### Supabase 資料表總覽

**員工管理:**
- `users` - 員工帳號(登入用)
- `staff_members` - 員工基本資料
- `staff_schedules` - 員工排班

**考勤管理:**
- `attendance_records` - 打卡記錄
- `leave_requests` - 請假申請
- `leave_records` - 休假記錄(月曆用)

**排班管理:**
- `doctor_schedules` - 醫師排班
- `staff_schedules` - 員工排班

**財務管理:**
- `operation_fees` - 操作費記錄
- `salary_records` - 薪資記錄
- `appointment_transactions` - 預約交易
- `payment_records` - 收費記錄

---

## 📊 整合優先順序

### 高優先級 (立即執行)
1. ✅ 員工登入與權限系統
2. ✅ 打卡系統整合(網頁 + LINE)
3. ✅ 請假管理與審核
4. ⏳ 修正登入問題(環境變數)

### 中優先級 (近期執行)
1. 📋 排班系統完善
2. 📋 操作費系統整合
3. 📋 LINE Bot 完整整合

### 低優先級 (未來規劃)
1. 📋 預約交易格式
2. 📋 財務報表系統
3. 🔮 系統優化與擴展

---

## ⚠️ 重要原則

1. **絕對不碰觸 FLOSCLASS 後台的預約和病歷功能**
2. **所有新功能都使用獨立的資料表**
3. **確保向下相容,不影響現有功能**
4. **每個階段完成後進行完整測試**
5. **保持資料備份機制**

---

## 📝 下一步行動

### 立即執行:
1. 等待 Netlify 部署完成,測試登入功能
2. 確認所有員工可以正常登入
3. 測試打卡、請假、審核功能

### 待確認:
1. 員工名單完整清單(用於更新資料庫)
2. 操作費計算規則和分潤比例
3. 預約交易格式的具體需求

---

**文件版本:** v1.0  
**最後更新:** 2025-11-22  
**負責人:** FLOS 診所 IT 團隊
