# 訪客記錄系統測試檢查清單

**測試日期**: ___________  
**測試人員**: ___________  
**測試環境**: https://classy-biscotti-42a418.netlify.app

---

## 🔧 前置準備

- [ ] visitor_logs 表已在 Supabase 建立
- [ ] RLS 政策已設定（2 個政策）
- [ ] 索引已建立（4 個索引）
- [ ] 測試帳號已準備：
  - [ ] admin: flosHBH012
  - [ ] senior_supervisor: flosZYR016
  - [ ] supervisor: flosWQ001
  - [ ] staff: flosLDX011
- [ ] 瀏覽器已準備（Chrome, Firefox, Safari）
- [ ] Supabase Dashboard 可訪問

---

## ⚡ 快速驗證（5 分鐘）

### 步驟 1: 執行快速測試 SQL
在 Supabase SQL Editor 執行 `test_scripts/quick_test.sql`

- [ ] 表格存在 ✅ PASS
- [ ] RLS 已啟用 ✅ PASS
- [ ] 索引已建立（4 個）✅ PASS
- [ ] RLS 政策已建立（2 個）✅ PASS
- [ ] 必填欄位檢查 ✅ PASS
- [ ] 已登入記錄完整性 ✅ PASS
- [ ] 未登入記錄完整性 ✅ PASS

**快速測試結果**: ⬜ 全部通過 / ⬜ 有失敗項目

---

## 📋 功能測試（15 分鐘）

### TC-001: 未登入訪客記錄
1. [ ] 清除瀏覽器 Cookie 和 LocalStorage
2. [ ] 訪問網站首頁
3. [ ] 等待 3 秒
4. [ ] 在 Supabase 查詢最新記錄
5. [ ] 確認記錄存在且 `is_authorized` = false
6. [ ] 確認 `employee_id`, `employee_name`, `employee_role` 為 NULL
7. [ ] 確認 `ip_address`, `user_agent` 等欄位有值

**結果**: ⬜ PASS / ⬜ FAIL  
**備註**: ___________

---

### TC-002: 員工登入後記錄
1. [ ] 使用 flosLDX011 登入
2. [ ] 登入成功後等待 3 秒
3. [ ] 查詢最新記錄
4. [ ] 確認 `is_authorized` = true
5. [ ] 確認 `employee_id` = 'flosLDX011'
6. [ ] 確認 `employee_name` = '劉道玄'
7. [ ] 確認 `employee_role` = 'staff'

**結果**: ⬜ PASS / ⬜ FAIL  
**備註**: ___________

---

### TC-003: 路由切換記錄
1. [ ] 登入後停留在首頁
2. [ ] 記錄當前時間
3. [ ] 依序訪問：排班 → 出勤 → 請假
4. [ ] 查詢該時間後的記錄
5. [ ] 確認至少有 4 筆記錄（首頁 + 3 個頁面）
6. [ ] 確認每筆記錄的 `page_url` 不同

**結果**: ⬜ PASS / ⬜ FAIL  
**備註**: ___________

---

### TC-004: 不同角色記錄
1. [ ] 使用 flosLDX011 (staff) 登入並訪問
2. [ ] 登出
3. [ ] 使用 flosWQ001 (supervisor) 登入並訪問
4. [ ] 登出
5. [ ] 使用 flosHBH012 (admin) 登入並訪問
6. [ ] 查詢記錄，確認角色正確

**結果**: ⬜ PASS / ⬜ FAIL  
**備註**: ___________

---

### TC-005: 登出後狀態變更
1. [ ] 登入系統
2. [ ] 訪問首頁（確認有記錄）
3. [ ] 登出
4. [ ] 再次訪問首頁
5. [ ] 查詢最新 2 筆記錄
6. [ ] 確認登出後記錄 `is_authorized` = false
7. [ ] 確認登出前記錄 `is_authorized` = true

**結果**: ⬜ PASS / ⬜ FAIL  
**備註**: ___________

---

## 🔒 RLS 政策驗證（10 分鐘）

### RLS-001: INSERT 政策（未登入）
1. [ ] 清除 Cookie，確保未登入
2. [ ] 訪問網站
3. [ ] 確認有新記錄產生

**結果**: ⬜ PASS / ⬜ FAIL  
**備註**: ___________

---

### RLS-002: INSERT 政策（已登入）
1. [ ] 使用任意帳號登入
2. [ ] 訪問任意頁面
3. [ ] 確認有新記錄產生

**結果**: ⬜ PASS / ⬜ FAIL  
**備註**: ___________

---

### RLS-003: SELECT 政策（管理員）
1. [ ] 使用 admin 帳號登入 Supabase Dashboard
2. [ ] 執行查詢：`SELECT COUNT(*) FROM visitor_logs;`
3. [ ] 確認可以看到所有記錄

**結果**: ⬜ PASS / ⬜ FAIL  
**記錄數**: ___________

---

### RLS-004: SELECT 政策（非管理員）
**方法 1: 使用測試工具**
1. [ ] 開啟 `test_scripts/test_rls_policies.html`
2. [ ] 輸入 Supabase 配置
3. [ ] 執行「測試 4: 非管理員嘗試查看記錄」
4. [ ] 確認查詢失敗或返回空結果

**方法 2: 手動測試（進階）**
1. [ ] 使用非 admin 帳號的 JWT token
2. [ ] 嘗試查詢 visitor_logs
3. [ ] 確認無法看到記錄

**結果**: ⬜ PASS / ⬜ FAIL  
**備註**: ___________

---

## ✅ 資料完整性檢查（5 分鐘）

在 Supabase SQL Editor 執行以下查詢：

### DI-001: 必填欄位
```sql
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN id IS NULL THEN 1 ELSE 0 END) as null_id,
  SUM(CASE WHEN access_time IS NULL THEN 1 ELSE 0 END) as null_time,
  SUM(CASE WHEN is_authorized IS NULL THEN 1 ELSE 0 END) as null_auth
FROM visitor_logs;
```
- [ ] `null_id` = 0
- [ ] `null_time` = 0
- [ ] `null_auth` = 0

**結果**: ⬜ PASS / ⬜ FAIL

---

### DI-002: 已登入記錄完整性
```sql
SELECT COUNT(*) as total,
  SUM(CASE WHEN employee_id IS NULL THEN 1 ELSE 0 END) as missing_id
FROM visitor_logs WHERE is_authorized = true;
```
- [ ] `missing_id` = 0

**結果**: ⬜ PASS / ⬜ FAIL

---

### DI-003: 未登入記錄為空
```sql
SELECT COUNT(*) as total,
  SUM(CASE WHEN employee_id IS NOT NULL THEN 1 ELSE 0 END) as has_id
FROM visitor_logs WHERE is_authorized = false;
```
- [ ] `has_id` = 0

**結果**: ⬜ PASS / ⬜ FAIL

---

### DI-004: IP 位址格式
```sql
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN ip_address IS NOT NULL THEN 1 ELSE 0 END) as has_ip,
  ROUND(100.0 * SUM(CASE WHEN ip_address IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
FROM visitor_logs;
```
- [ ] `success_rate` > 90%

**結果**: ⬜ PASS / ⬜ FAIL  
**成功率**: ___________%

---

## 🚀 效能測試（5 分鐘）

### PERF-001: 插入時間
1. [ ] 開啟瀏覽器開發者工具 Network 面板
2. [ ] 訪問網站
3. [ ] 觀察 Supabase API 請求時間
4. [ ] 確認插入時間 < 2 秒

**結果**: ⬜ PASS / ⬜ FAIL  
**實際時間**: __________ 秒

---

### PERF-002: IP 查詢影響
1. [ ] 開啟 Network 面板
2. [ ] 訪問網站
3. [ ] 觀察 api.ipify.org 請求
4. [ ] 確認為非阻塞（異步）
5. [ ] 確認即使失敗頁面仍正常載入

**結果**: ⬜ PASS / ⬜ FAIL  
**備註**: ___________

---

### PERF-003: 查詢效能
```sql
EXPLAIN ANALYZE
SELECT * FROM visitor_logs 
WHERE employee_id = 'flosHBH012' 
ORDER BY access_time DESC 
LIMIT 10;
```
1. [ ] 查詢使用索引
2. [ ] 查詢時間 < 100ms

**結果**: ⬜ PASS / ⬜ FAIL  
**查詢時間**: __________ ms

---

## 🌐 跨瀏覽器測試（10 分鐘）

### Chrome
- [ ] 未登入訪問記錄正常
- [ ] 登入後記錄正常
- [ ] Console 無錯誤

**結果**: ⬜ PASS / ⬜ FAIL

---

### Firefox
- [ ] 未登入訪問記錄正常
- [ ] 登入後記錄正常
- [ ] Console 無錯誤

**結果**: ⬜ PASS / ⬜ FAIL

---

### Safari（如有 macOS/iOS 裝置）
- [ ] 未登入訪問記錄正常
- [ ] 登入後記錄正常
- [ ] Console 無錯誤

**結果**: ⬜ PASS / ⬜ FAIL

---

### 行動裝置（如有）
- [ ] 未登入訪問記錄正常
- [ ] 登入後記錄正常
- [ ] Console 無錯誤

**結果**: ⬜ PASS / ⬜ FAIL  
**裝置**: ___________

---

## 🎯 核心功能穩定性確認

### 確認訪客記錄不影響核心功能
- [ ] 登入功能正常
- [ ] 排班功能正常
- [ ] 請假功能正常
- [ ] 出勤功能正常
- [ ] 審核功能正常
- [ ] 管理員主控台正常

**結果**: ⬜ 全部正常 / ⬜ 有異常

---

## 📊 測試摘要

### 測試統計
- 總測試案例數: 23
- 通過: __________
- 失敗: __________
- 阻塞: __________
- 通過率: __________%

### 發現的問題
1. ___________
2. ___________
3. ___________

### 整體評估
⬜ 可以上線  
⬜ 需要修正後再測試  
⬜ 有重大問題，不建議上線

### 測試結論
___________________________________________
___________________________________________
___________________________________________

### 建議
___________________________________________
___________________________________________
___________________________________________

---

## 📝 簽核

**測試人員**: ___________  
**簽名**: ___________  
**日期**: ___________

**審核人員**: ___________  
**簽名**: ___________  
**日期**: ___________

---

**文件版本**: 1.0  
**最後更新**: 2025-12-06
