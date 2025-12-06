# 訪客記錄系統測試計畫

**版本**: 1.0  
**日期**: 2025-12-06  
**專案**: FLOS 診所管理系統  
**測試範圍**: visitor_logs 訪客記錄系統  
**測試環境**: https://classy-biscotti-42a418.netlify.app

---

## 目錄

1. [測試目標](#測試目標)
2. [測試範圍](#測試範圍)
3. [測試環境準備](#測試環境準備)
4. [測試情境](#測試情境)
5. [測試案例](#測試案例)
6. [RLS 政策驗證](#rls-政策驗證)
7. [資料完整性檢查](#資料完整性檢查)
8. [效能測試](#效能測試)
9. [測試工具與腳本](#測試工具與腳本)
10. [驗證查詢](#驗證查詢)
11. [測試檢查清單](#測試檢查清單)
12. [問題回報](#問題回報)

---

## 測試目標

本測試計畫旨在驗證訪客記錄系統在各種情境下的正確性、安全性和效能，確保：

1. **資料記錄完整性** - 所有訪客行為都被正確記錄
2. **RLS 政策有效性** - 權限控制符合安全需求
3. **使用者體驗** - 不影響系統正常運作
4. **資料準確性** - 記錄的資訊正確無誤
5. **系統穩定性** - 不影響核心功能

---

## 測試範圍

### 涵蓋範圍
- ✅ 未登入訪客的記錄
- ✅ 已登入員工的記錄（staff, supervisor, senior_supervisor, admin）
- ✅ 不同頁面的訪問記錄
- ✅ RLS 政策的 INSERT 權限
- ✅ RLS 政策的 SELECT 權限
- ✅ 資料欄位的完整性
- ✅ IP 位址獲取
- ✅ 瀏覽器資訊收集
- ✅ 系統資訊收集

### 不涵蓋範圍
- ❌ 訪客記錄的分析功能（未實作）
- ❌ 訪客記錄的匯出功能（未實作）
- ❌ 訪客記錄的刪除功能（未實作）

---

## 測試環境準備

### 1. 測試帳號準備

需要準備以下測試帳號：

| 角色 | 員工編號 | 姓名 | 密碼 | 用途 |
|------|---------|------|------|------|
| admin | flosHBH012 | 黃柏翰 | (實際密碼) | 測試管理員查看權限 |
| senior_supervisor | flosZYR016 | 鍾曜任 | (實際密碼) | 測試高階主管記錄 |
| supervisor | flosWQ001 | 萬晴 | (實際密碼) | 測試主管記錄 |
| staff | flosLDX011 | 劉道玄 | (實際密碼) | 測試一般員工記錄 |

### 2. 瀏覽器準備

建議使用以下瀏覽器進行測試：

- **Chrome** (最新版本)
- **Firefox** (最新版本)
- **Safari** (最新版本，測試 macOS/iOS)
- **Edge** (最新版本)
- **行動裝置瀏覽器** (iOS Safari, Android Chrome)

### 3. 測試工具

- **Supabase Dashboard** - 查看資料庫記錄
- **瀏覽器開發者工具** - 檢查 Console 錯誤
- **Postman/cURL** - 測試 API 呼叫（選用）
- **SQL Editor** - 執行驗證查詢

### 4. 環境變數確認

確認以下環境變數已正確設定：

```bash
SUPABASE_URL=https://pizzpwesrbulfjylejlu.supabase.co
SUPABASE_KEY=(anon key)
```

---

## 測試情境

### 情境 1: 未登入訪客訪問

**描述**: 未登入的訪客訪問網站各個頁面

**預期行為**:
- 訪客被導向登入頁面
- 登入頁面的訪問被記錄
- `is_authorized` = false
- `employee_id`, `employee_name`, `employee_role` 為 NULL

**測試步驟**:
1. 清除瀏覽器 Cookie 和 LocalStorage
2. 訪問網站首頁 (https://classy-biscotti-42a418.netlify.app)
3. 訪問其他受保護頁面（會被導向登入頁）
4. 檢查資料庫記錄

### 情境 2: 一般員工登入並訪問

**描述**: 一般員工（staff）登入後訪問各個頁面

**預期行為**:
- 登入成功後的訪問被記錄
- `is_authorized` = true
- `employee_id` = 員工編號
- `employee_name` = 員工姓名
- `employee_role` = 'staff'

**測試步驟**:
1. 使用 staff 帳號登入（例如 flosLDX011）
2. 訪問首頁（休假月曆）
3. 訪問排班頁面
4. 訪問出勤頁面
5. 訪問請假申請頁面
6. 檢查資料庫記錄

### 情境 3: 主管登入並訪問

**描述**: 主管（supervisor/senior_supervisor）登入後訪問各個頁面

**預期行為**:
- 所有訪問被正確記錄
- `employee_role` = 'supervisor' 或 'senior_supervisor'
- 可以訪問審核頁面

**測試步驟**:
1. 使用 supervisor 帳號登入（例如 flosWQ001）
2. 訪問請假審核頁面
3. 訪問出勤管理頁面
4. 檢查資料庫記錄

### 情境 4: 管理員登入並訪問

**描述**: 管理員（admin）登入後訪問各個頁面

**預期行為**:
- 所有訪問被正確記錄
- `employee_role` = 'admin'
- 可以訪問管理員主控台

**測試步驟**:
1. 使用 admin 帳號登入（例如 flosHBH012）
2. 訪問管理員主控台
3. 訪問所有其他頁面
4. 檢查資料庫記錄

### 情境 5: 管理員查看訪客記錄

**描述**: 管理員嘗試查看 visitor_logs 表的資料

**預期行為**:
- 管理員可以成功查詢資料
- 可以看到所有訪客記錄（包含未登入和其他員工）

**測試步驟**:
1. 使用 admin 帳號登入 Supabase Dashboard
2. 執行 SELECT 查詢
3. 確認可以看到所有記錄

### 情境 6: 非管理員嘗試查看訪客記錄

**描述**: 非管理員（staff/supervisor）嘗試查看 visitor_logs 表

**預期行為**:
- 查詢失敗或返回空結果
- RLS 政策阻止存取

**測試步驟**:
1. 使用非 admin 帳號的 JWT token
2. 嘗試執行 SELECT 查詢
3. 確認無法看到任何記錄

### 情境 7: 路由切換記錄

**描述**: 在已登入狀態下切換不同頁面

**預期行為**:
- 每次路由切換都產生新的記錄
- `page_url` 正確反映當前頁面

**測試步驟**:
1. 登入後停留在首頁
2. 依序訪問 5 個不同頁面
3. 檢查資料庫應有 6 筆記錄（含登入頁）

### 情境 8: 登出後再訪問

**描述**: 員工登出後再次訪問網站

**預期行為**:
- 登出後的訪問記錄為未授權狀態
- `is_authorized` = false
- 員工資訊為 NULL

**測試步驟**:
1. 登入後訪問幾個頁面
2. 登出
3. 再次訪問網站
4. 檢查登出後的記錄

---

## 測試案例

### TC-001: 未登入訪客記錄基本資訊

**優先級**: P0 (Critical)  
**測試類型**: 功能測試

**前置條件**:
- 清除瀏覽器 Cookie 和 LocalStorage
- visitor_logs 表已建立

**測試步驟**:
1. 開啟瀏覽器開發者工具 Console
2. 訪問 https://classy-biscotti-42a418.netlify.app
3. 等待 3 秒
4. 在 Supabase SQL Editor 執行查詢：
   ```sql
   SELECT * FROM visitor_logs 
   WHERE is_authorized = false 
   ORDER BY access_time DESC 
   LIMIT 1;
   ```

**預期結果**:
- ✅ 記錄存在
- ✅ `ip_address` 不為 NULL
- ✅ `user_agent` 包含瀏覽器資訊
- ✅ `page_url` 包含網站網址
- ✅ `screen_resolution` 格式為 "寬x高"
- ✅ `language` 為瀏覽器語言（例如 "zh-TW"）
- ✅ `platform` 為作業系統（例如 "MacIntel"）
- ✅ `is_authorized` = false
- ✅ `employee_id` = NULL
- ✅ `employee_name` = NULL
- ✅ `employee_role` = NULL
- ✅ Console 無錯誤訊息

**實際結果**: _待填寫_

**狀態**: ⬜ Pass / ⬜ Fail / ⬜ Blocked

---

### TC-002: 員工登入後記錄員工資訊

**優先級**: P0 (Critical)  
**測試類型**: 功能測試

**前置條件**:
- 已有測試帳號（例如 flosLDX011）
- visitor_logs 表已建立

**測試步驟**:
1. 訪問登入頁面
2. 使用 flosLDX011 登入
3. 登入成功後等待 3 秒
4. 執行查詢：
   ```sql
   SELECT * FROM visitor_logs 
   WHERE employee_id = 'flosLDX011' 
   ORDER BY access_time DESC 
   LIMIT 1;
   ```

**預期結果**:
- ✅ 記錄存在
- ✅ `is_authorized` = true
- ✅ `employee_id` = 'flosLDX011'
- ✅ `employee_name` = '劉道玄'
- ✅ `employee_role` = 'staff'
- ✅ 其他欄位（IP, user_agent 等）正確填入

**實際結果**: _待填寫_

**狀態**: ⬜ Pass / ⬜ Fail / ⬜ Blocked

---

### TC-003: 路由切換產生新記錄

**優先級**: P1 (High)  
**測試類型**: 功能測試

**前置條件**:
- 已登入系統

**測試步驟**:
1. 登入後停留在首頁（休假月曆）
2. 記錄當前時間 T1
3. 點擊導航到「排班」頁面
4. 等待 3 秒
5. 執行查詢：
   ```sql
   SELECT COUNT(*) as record_count 
   FROM visitor_logs 
   WHERE employee_id = 'flosLDX011' 
   AND access_time >= 'T1';
   ```

**預期結果**:
- ✅ `record_count` >= 2（登入頁 + 首頁 + 排班頁）
- ✅ 每筆記錄的 `page_url` 不同

**實際結果**: _待填寫_

**狀態**: ⬜ Pass / ⬜ Fail / ⬜ Blocked

---

### TC-004: 管理員可查看所有記錄（RLS SELECT 政策）

**優先級**: P0 (Critical)  
**測試類型**: 安全測試

**前置條件**:
- 已有 admin 帳號（flosHBH012）
- visitor_logs 表中已有多筆記錄

**測試步驟**:
1. 使用 admin 帳號登入 Supabase Dashboard
2. 在 SQL Editor 執行：
   ```sql
   SELECT COUNT(*) as total_records FROM visitor_logs;
   ```
3. 執行：
   ```sql
   SELECT DISTINCT employee_role FROM visitor_logs WHERE employee_role IS NOT NULL;
   ```

**預期結果**:
- ✅ 可以成功執行查詢
- ✅ `total_records` > 0
- ✅ 可以看到不同角色的記錄（admin, staff, supervisor 等）
- ✅ 可以看到未登入記錄（is_authorized = false）

**實際結果**: _待填寫_

**狀態**: ⬜ Pass / ⬜ Fail / ⬜ Blocked

---

### TC-005: 非管理員無法查看記錄（RLS SELECT 政策）

**優先級**: P0 (Critical)  
**測試類型**: 安全測試

**前置條件**:
- 已有非 admin 帳號（例如 flosLDX011, staff）
- visitor_logs 表中已有記錄

**測試方法**:

**方法 1: 使用 Supabase Client（推薦）**

建立測試腳本 `/tmp/test_rls_select.js`:
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pizzpwesrbulfjylejlu.supabase.co'
const supabaseKey = 'YOUR_ANON_KEY'

const supabase = createClient(supabaseUrl, supabaseKey)

// 模擬 staff 使用者的 JWT token
// 需要先登入取得 token
async function testStaffAccess() {
  // 1. 先用 staff 帳號登入
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'staff@example.com', // 需要實際的 email
    password: 'staff_password'
  })
  
  if (authError) {
    console.error('登入失敗:', authError)
    return
  }
  
  // 2. 嘗試查詢 visitor_logs
  const { data, error } = await supabase
    .from('visitor_logs')
    .select('*')
  
  console.log('查詢結果:', data)
  console.log('錯誤訊息:', error)
  
  // 預期: data 應為空陣列或 error 存在
}

testStaffAccess()
```

**方法 2: 使用 SQL（需要 JWT token）**

在 Supabase SQL Editor 執行：
```sql
-- 設定非 admin 使用者的 JWT claims
SET request.jwt.claims = '{"employee_id": "flosLDX011", "role": "staff"}';

-- 嘗試查詢
SELECT * FROM visitor_logs;
```

**預期結果**:
- ✅ 查詢返回空結果（0 筆記錄）
- ✅ 或返回權限錯誤訊息
- ✅ RLS 政策成功阻止存取

**實際結果**: _待填寫_

**狀態**: ⬜ Pass / ⬜ Fail / ⬜ Blocked

---

### TC-006: 所有人可插入記錄（RLS INSERT 政策）

**優先級**: P0 (Critical)  
**測試類型**: 安全測試

**前置條件**:
- visitor_logs 表已建立

**測試步驟**:

**測試 1: 未登入使用者插入**
1. 清除瀏覽器 Cookie
2. 訪問網站
3. 檢查是否有新記錄產生

**測試 2: 已登入使用者插入**
1. 使用任意帳號登入
2. 訪問任意頁面
3. 檢查是否有新記錄產生

**預期結果**:
- ✅ 未登入使用者可以插入記錄
- ✅ 已登入使用者可以插入記錄
- ✅ 所有角色（staff, supervisor, admin）都可以插入記錄

**實際結果**: _待填寫_

**狀態**: ⬜ Pass / ⬜ Fail / ⬜ Blocked

---

### TC-007: IP 位址正確獲取

**優先級**: P1 (High)  
**測試類型**: 功能測試

**前置條件**:
- visitor_logs 表已建立
- 可訪問 api.ipify.org

**測試步驟**:
1. 訪問網站
2. 等待 5 秒（IP 查詢需要時間）
3. 執行查詢：
   ```sql
   SELECT ip_address FROM visitor_logs 
   ORDER BY access_time DESC 
   LIMIT 1;
   ```
4. 訪問 https://api.ipify.org?format=json 確認實際 IP

**預期結果**:
- ✅ `ip_address` 不為 NULL
- ✅ `ip_address` 格式正確（IPv4 或 IPv6）
- ✅ `ip_address` 與實際 IP 相符

**實際結果**: _待填寫_

**狀態**: ⬜ Pass / ⬜ Fail / ⬜ Blocked

**備註**: 如果 IP 查詢失敗，應在 Console 看到警告訊息，但不影響其他功能

---

### TC-008: 瀏覽器資訊正確收集

**優先級**: P2 (Medium)  
**測試類型**: 功能測試

**前置條件**:
- visitor_logs 表已建立

**測試步驟**:
1. 使用 Chrome 瀏覽器訪問網站
2. 執行查詢：
   ```sql
   SELECT user_agent, screen_resolution, language, platform 
   FROM visitor_logs 
   ORDER BY access_time DESC 
   LIMIT 1;
   ```
3. 在瀏覽器 Console 執行：
   ```javascript
   console.log({
     userAgent: navigator.userAgent,
     screen: `${window.screen.width}x${window.screen.height}`,
     language: navigator.language,
     platform: navigator.platform
   })
   ```

**預期結果**:
- ✅ `user_agent` 包含 "Chrome"
- ✅ `screen_resolution` 與實際螢幕解析度相符
- ✅ `language` 與瀏覽器語言設定相符
- ✅ `platform` 與作業系統相符

**實際結果**: _待填寫_

**狀態**: ⬜ Pass / ⬜ Fail / ⬜ Blocked

---

### TC-009: Referrer 正確記錄

**優先級**: P2 (Medium)  
**測試類型**: 功能測試

**前置條件**:
- visitor_logs 表已建立

**測試步驟**:
1. 從外部網站（例如 Google）點擊連結訪問系統
2. 或在瀏覽器中輸入網址後按 Enter
3. 執行查詢：
   ```sql
   SELECT referrer FROM visitor_logs 
   ORDER BY access_time DESC 
   LIMIT 1;
   ```

**預期結果**:
- ✅ 從外部連結進入：`referrer` 包含來源網址
- ✅ 直接輸入網址：`referrer` 為空字串或 NULL

**實際結果**: _待填寫_

**狀態**: ⬜ Pass / ⬜ Fail / ⬜ Blocked

---

### TC-010: 時間戳記正確記錄

**優先級**: P1 (High)  
**測試類型**: 功能測試

**前置條件**:
- visitor_logs 表已建立

**測試步驟**:
1. 記錄當前時間 T1（精確到秒）
2. 訪問網站
3. 等待 3 秒
4. 執行查詢：
   ```sql
   SELECT access_time, created_at 
   FROM visitor_logs 
   ORDER BY access_time DESC 
   LIMIT 1;
   ```

**預期結果**:
- ✅ `access_time` 在 T1 前後 10 秒內
- ✅ `created_at` 在 T1 前後 10 秒內
- ✅ `access_time` 和 `created_at` 相差不超過 1 秒
- ✅ 時區為 UTC+8 或 UTC（視 Supabase 設定）

**實際結果**: _待填寫_

**狀態**: ⬜ Pass / ⬜ Fail / ⬜ Blocked

---

### TC-011: 登出後狀態變更

**優先級**: P1 (High)  
**測試類型**: 功能測試

**前置條件**:
- 已登入系統

**測試步驟**:
1. 登入系統（例如 flosLDX011）
2. 訪問首頁，確認有記錄產生
3. 登出
4. 再次訪問首頁
5. 執行查詢：
   ```sql
   SELECT is_authorized, employee_id, employee_name, employee_role 
   FROM visitor_logs 
   ORDER BY access_time DESC 
   LIMIT 2;
   ```

**預期結果**:
- ✅ 最新記錄（登出後）：
  - `is_authorized` = false
  - `employee_id` = NULL
  - `employee_name` = NULL
  - `employee_role` = NULL
- ✅ 前一筆記錄（登出前）：
  - `is_authorized` = true
  - `employee_id` = 'flosLDX011'

**實際結果**: _待填寫_

**狀態**: ⬜ Pass / ⬜ Fail / ⬜ Blocked

---

### TC-012: 不同角色記錄正確性

**優先級**: P1 (High)  
**測試類型**: 功能測試

**前置條件**:
- 已有不同角色的測試帳號

**測試步驟**:
1. 依序使用以下帳號登入並訪問首頁：
   - flosLDX011 (staff)
   - flosWQ001 (supervisor)
   - flosZYR016 (senior_supervisor)
   - flosHBH012 (admin)
2. 執行查詢：
   ```sql
   SELECT employee_id, employee_name, employee_role 
   FROM visitor_logs 
   WHERE employee_id IN ('flosLDX011', 'flosWQ001', 'flosZYR016', 'flosHBH012')
   ORDER BY access_time DESC;
   ```

**預期結果**:
- ✅ flosLDX011 的記錄：`employee_role` = 'staff'
- ✅ flosWQ001 的記錄：`employee_role` = 'supervisor'
- ✅ flosZYR016 的記錄：`employee_role` = 'senior_supervisor'
- ✅ flosHBH012 的記錄：`employee_role` = 'admin'

**實際結果**: _待填寫_

**狀態**: ⬜ Pass / ⬜ Fail / ⬜ Blocked

---

## RLS 政策驗證

### RLS-001: INSERT 政策 - 允許所有人插入

**政策名稱**: `allow_all_insert_visitor_logs`

**驗證查詢**:
```sql
-- 查看政策定義
SELECT policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'visitor_logs' 
AND policyname = 'allow_all_insert_visitor_logs';
```

**預期結果**:
- ✅ `permissive` = 'PERMISSIVE'
- ✅ `roles` = '{public}'
- ✅ `cmd` = 'INSERT'
- ✅ `with_check` = 'true'

**驗證方法**:
1. 未登入狀態訪問網站 → 應成功插入記錄
2. 任意角色登入後訪問 → 應成功插入記錄

**狀態**: ⬜ Pass / ⬜ Fail

---

### RLS-002: SELECT 政策 - 僅管理員可查看

**政策名稱**: `admin_only_select_visitor_logs`

**驗證查詢**:
```sql
-- 查看政策定義
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'visitor_logs' 
AND policyname = 'admin_only_select_visitor_logs';
```

**預期結果**:
- ✅ `permissive` = 'PERMISSIVE'
- ✅ `roles` = '{public}'
- ✅ `cmd` = 'SELECT'
- ✅ `qual` 包含 `users.role = 'admin'` 條件

**驗證方法**:
1. 使用 admin 帳號查詢 → 應返回所有記錄
2. 使用非 admin 帳號查詢 → 應返回空結果或錯誤

**狀態**: ⬜ Pass / ⬜ Fail

---

### RLS-003: RLS 啟用狀態

**驗證查詢**:
```sql
-- 確認 RLS 已啟用
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'visitor_logs';
```

**預期結果**:
- ✅ `rowsecurity` = true

**狀態**: ⬜ Pass / ⬜ Fail

---

## 資料完整性檢查

### DI-001: 必填欄位檢查

**驗證查詢**:
```sql
-- 檢查是否有 NULL 值在不應為 NULL 的欄位
SELECT 
  COUNT(*) as total_records,
  COUNT(id) as has_id,
  COUNT(access_time) as has_access_time,
  COUNT(created_at) as has_created_at,
  SUM(CASE WHEN is_authorized IS NULL THEN 1 ELSE 0 END) as null_is_authorized
FROM visitor_logs;
```

**預期結果**:
- ✅ `total_records` = `has_id` = `has_access_time` = `has_created_at`
- ✅ `null_is_authorized` = 0

**狀態**: ⬜ Pass / ⬜ Fail

---

### DI-002: 已登入記錄的員工資訊完整性

**驗證查詢**:
```sql
-- 檢查已登入記錄是否有完整的員工資訊
SELECT 
  COUNT(*) as authorized_records,
  SUM(CASE WHEN employee_id IS NULL THEN 1 ELSE 0 END) as missing_employee_id,
  SUM(CASE WHEN employee_name IS NULL THEN 1 ELSE 0 END) as missing_employee_name,
  SUM(CASE WHEN employee_role IS NULL THEN 1 ELSE 0 END) as missing_employee_role
FROM visitor_logs 
WHERE is_authorized = true;
```

**預期結果**:
- ✅ `missing_employee_id` = 0
- ✅ `missing_employee_name` = 0
- ✅ `missing_employee_role` = 0

**狀態**: ⬜ Pass / ⬜ Fail

---

### DI-003: 未登入記錄的員工資訊為空

**驗證查詢**:
```sql
-- 檢查未登入記錄的員工資訊應為 NULL
SELECT 
  COUNT(*) as unauthorized_records,
  SUM(CASE WHEN employee_id IS NOT NULL THEN 1 ELSE 0 END) as has_employee_id,
  SUM(CASE WHEN employee_name IS NOT NULL THEN 1 ELSE 0 END) as has_employee_name,
  SUM(CASE WHEN employee_role IS NOT NULL THEN 1 ELSE 0 END) as has_employee_role
FROM visitor_logs 
WHERE is_authorized = false;
```

**預期結果**:
- ✅ `has_employee_id` = 0
- ✅ `has_employee_name` = 0
- ✅ `has_employee_role` = 0

**狀態**: ⬜ Pass / ⬜ Fail

---

### DI-004: IP 位址格式驗證

**驗證查詢**:
```sql
-- 檢查 IP 位址格式（IPv4 或 IPv6）
SELECT 
  COUNT(*) as total_records,
  SUM(CASE WHEN ip_address ~ '^([0-9]{1,3}\.){3}[0-9]{1,3}$' THEN 1 ELSE 0 END) as ipv4_count,
  SUM(CASE WHEN ip_address ~ '^([0-9a-fA-F]{0,4}:){7}[0-9a-fA-F]{0,4}$' THEN 1 ELSE 0 END) as ipv6_count,
  SUM(CASE WHEN ip_address IS NULL THEN 1 ELSE 0 END) as null_count
FROM visitor_logs;
```

**預期結果**:
- ✅ `ipv4_count` + `ipv6_count` + `null_count` = `total_records`
- ✅ `null_count` 應很少（僅在 IP 查詢失敗時）

**狀態**: ⬜ Pass / ⬜ Fail

---

### DI-005: 時間戳記合理性

**驗證查詢**:
```sql
-- 檢查時間戳記是否在合理範圍內
SELECT 
  MIN(access_time) as earliest_access,
  MAX(access_time) as latest_access,
  COUNT(*) as total_records,
  SUM(CASE WHEN access_time > NOW() THEN 1 ELSE 0 END) as future_records,
  SUM(CASE WHEN access_time < '2025-12-06' THEN 1 ELSE 0 END) as before_deployment
FROM visitor_logs;
```

**預期結果**:
- ✅ `future_records` = 0（沒有未來時間的記錄）
- ✅ `before_deployment` = 0（沒有部署前的記錄）
- ✅ `earliest_access` >= '2025-12-06'

**狀態**: ⬜ Pass / ⬜ Fail

---

## 效能測試

### PERF-001: 單次記錄插入時間

**測試方法**:
1. 在瀏覽器 Console 執行：
   ```javascript
   console.time('visitor_log');
   // 訪問頁面
   setTimeout(() => console.timeEnd('visitor_log'), 3000);
   ```

**預期結果**:
- ✅ 插入時間 < 2 秒
- ✅ 不阻塞頁面載入

**實際結果**: _待填寫_

**狀態**: ⬜ Pass / ⬜ Fail

---

### PERF-002: IP 查詢對頁面載入的影響

**測試方法**:
1. 使用瀏覽器 Network 面板
2. 訪問頁面
3. 觀察 api.ipify.org 的請求時間

**預期結果**:
- ✅ IP 查詢為非阻塞（異步）
- ✅ 即使 IP 查詢失敗，頁面仍正常載入
- ✅ IP 查詢時間 < 5 秒

**實際結果**: _待填寫_

**狀態**: ⬜ Pass / ⬜ Fail

---

### PERF-003: 大量記錄的查詢效能

**測試方法**:
1. 確保 visitor_logs 表中有 1000+ 筆記錄
2. 執行查詢：
   ```sql
   EXPLAIN ANALYZE
   SELECT * FROM visitor_logs 
   WHERE employee_id = 'flosHBH012' 
   ORDER BY access_time DESC 
   LIMIT 10;
   ```

**預期結果**:
- ✅ 使用索引 `idx_visitor_logs_employee_id`
- ✅ 查詢時間 < 100ms
- ✅ 使用索引 `idx_visitor_logs_access_time`

**實際結果**: _待填寫_

**狀態**: ⬜ Pass / ⬜ Fail

---

## 測試工具與腳本

### 工具 1: 批量測試訪問腳本

建立 `/tmp/batch_visit_test.js`:

```javascript
// 批量訪問測試腳本
// 用於產生大量測試資料

const pages = [
  '/',
  '/schedule',
  '/attendance',
  '/leave',
  '/approval',
  '/admin'
];

async function visitAllPages() {
  for (const page of pages) {
    console.log(`訪問頁面: ${page}`);
    window.location.href = page;
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  console.log('所有頁面訪問完成');
}

// 執行
visitAllPages();
```

**使用方法**:
1. 登入系統
2. 在瀏覽器 Console 貼上腳本
3. 執行後會自動訪問所有頁面
4. 檢查資料庫應有 6 筆新記錄

---

### 工具 2: RLS 政策測試腳本

建立 `/tmp/test_rls_policies.sql`:

```sql
-- RLS 政策測試腳本

-- 測試 1: 確認 RLS 已啟用
SELECT 
  'RLS Enabled' as test_name,
  CASE WHEN rowsecurity THEN 'PASS' ELSE 'FAIL' END as result
FROM pg_tables 
WHERE tablename = 'visitor_logs';

-- 測試 2: 確認 INSERT 政策存在
SELECT 
  'INSERT Policy Exists' as test_name,
  CASE WHEN COUNT(*) = 1 THEN 'PASS' ELSE 'FAIL' END as result
FROM pg_policies 
WHERE tablename = 'visitor_logs' 
AND policyname = 'allow_all_insert_visitor_logs'
AND cmd = 'INSERT';

-- 測試 3: 確認 SELECT 政策存在
SELECT 
  'SELECT Policy Exists' as test_name,
  CASE WHEN COUNT(*) = 1 THEN 'PASS' ELSE 'FAIL' END as result
FROM pg_policies 
WHERE tablename = 'visitor_logs' 
AND policyname = 'admin_only_select_visitor_logs'
AND cmd = 'SELECT';

-- 測試 4: 確認索引存在
SELECT 
  'Indexes Exist' as test_name,
  CASE WHEN COUNT(*) = 4 THEN 'PASS' ELSE 'FAIL' END as result
FROM pg_indexes 
WHERE tablename = 'visitor_logs';
```

**使用方法**:
1. 在 Supabase SQL Editor 執行
2. 檢查所有測試結果為 'PASS'

---

### 工具 3: 資料完整性檢查腳本

建立 `/tmp/data_integrity_check.sql`:

```sql
-- 資料完整性檢查腳本

-- 檢查 1: 必填欄位
SELECT 
  '必填欄位檢查' as check_name,
  COUNT(*) as total_records,
  SUM(CASE WHEN id IS NULL THEN 1 ELSE 0 END) as null_id,
  SUM(CASE WHEN access_time IS NULL THEN 1 ELSE 0 END) as null_access_time,
  SUM(CASE WHEN is_authorized IS NULL THEN 1 ELSE 0 END) as null_is_authorized,
  CASE 
    WHEN SUM(CASE WHEN id IS NULL OR access_time IS NULL OR is_authorized IS NULL THEN 1 ELSE 0 END) = 0 
    THEN 'PASS' 
    ELSE 'FAIL' 
  END as result
FROM visitor_logs;

-- 檢查 2: 已登入記錄的員工資訊
SELECT 
  '已登入記錄員工資訊' as check_name,
  COUNT(*) as authorized_records,
  SUM(CASE WHEN employee_id IS NULL THEN 1 ELSE 0 END) as missing_employee_id,
  SUM(CASE WHEN employee_name IS NULL THEN 1 ELSE 0 END) as missing_employee_name,
  SUM(CASE WHEN employee_role IS NULL THEN 1 ELSE 0 END) as missing_employee_role,
  CASE 
    WHEN SUM(CASE WHEN employee_id IS NULL OR employee_name IS NULL OR employee_role IS NULL THEN 1 ELSE 0 END) = 0 
    THEN 'PASS' 
    ELSE 'FAIL' 
  END as result
FROM visitor_logs 
WHERE is_authorized = true;

-- 檢查 3: 未登入記錄的員工資訊應為空
SELECT 
  '未登入記錄員工資訊為空' as check_name,
  COUNT(*) as unauthorized_records,
  SUM(CASE WHEN employee_id IS NOT NULL THEN 1 ELSE 0 END) as has_employee_id,
  SUM(CASE WHEN employee_name IS NOT NULL THEN 1 ELSE 0 END) as has_employee_name,
  SUM(CASE WHEN employee_role IS NOT NULL THEN 1 ELSE 0 END) as has_employee_role,
  CASE 
    WHEN SUM(CASE WHEN employee_id IS NOT NULL OR employee_name IS NOT NULL OR employee_role IS NOT NULL THEN 1 ELSE 0 END) = 0 
    THEN 'PASS' 
    ELSE 'FAIL' 
  END as result
FROM visitor_logs 
WHERE is_authorized = false;

-- 檢查 4: 角色值有效性
SELECT 
  '角色值有效性' as check_name,
  COUNT(*) as total_with_role,
  SUM(CASE WHEN employee_role NOT IN ('admin', 'senior_supervisor', 'supervisor', 'staff') THEN 1 ELSE 0 END) as invalid_roles,
  CASE 
    WHEN SUM(CASE WHEN employee_role NOT IN ('admin', 'senior_supervisor', 'supervisor', 'staff') THEN 1 ELSE 0 END) = 0 
    THEN 'PASS' 
    ELSE 'FAIL' 
  END as result
FROM visitor_logs 
WHERE employee_role IS NOT NULL;
```

**使用方法**:
1. 在 Supabase SQL Editor 執行
2. 檢查所有 `result` 欄位為 'PASS'

---

## 驗證查詢

### 查詢 1: 查看最近 10 筆記錄

```sql
SELECT 
  id,
  TO_CHAR(access_time, 'YYYY-MM-DD HH24:MI:SS') as access_time,
  is_authorized,
  employee_id,
  employee_name,
  employee_role,
  page_url,
  ip_address
FROM visitor_logs 
ORDER BY access_time DESC 
LIMIT 10;
```

---

### 查詢 2: 統計不同角色的訪問次數

```sql
SELECT 
  COALESCE(employee_role, 'Unauthorized') as role,
  COUNT(*) as visit_count,
  COUNT(DISTINCT employee_id) as unique_employees
FROM visitor_logs 
GROUP BY employee_role 
ORDER BY visit_count DESC;
```

---

### 查詢 3: 查看特定員工的訪問歷史

```sql
SELECT 
  TO_CHAR(access_time, 'YYYY-MM-DD HH24:MI:SS') as access_time,
  page_url,
  ip_address,
  user_agent
FROM visitor_logs 
WHERE employee_id = 'flosHBH012' 
ORDER BY access_time DESC 
LIMIT 20;
```

---

### 查詢 4: 統計每日訪問量

```sql
SELECT 
  DATE(access_time) as visit_date,
  COUNT(*) as total_visits,
  COUNT(DISTINCT CASE WHEN is_authorized THEN employee_id END) as unique_employees,
  SUM(CASE WHEN is_authorized THEN 1 ELSE 0 END) as authorized_visits,
  SUM(CASE WHEN NOT is_authorized THEN 1 ELSE 0 END) as unauthorized_visits
FROM visitor_logs 
GROUP BY DATE(access_time) 
ORDER BY visit_date DESC;
```

---

### 查詢 5: 查看最常訪問的頁面

```sql
SELECT 
  page_url,
  COUNT(*) as visit_count,
  COUNT(DISTINCT employee_id) as unique_visitors
FROM visitor_logs 
GROUP BY page_url 
ORDER BY visit_count DESC 
LIMIT 10;
```

---

### 查詢 6: 檢查 IP 查詢成功率

```sql
SELECT 
  COUNT(*) as total_records,
  SUM(CASE WHEN ip_address IS NOT NULL THEN 1 ELSE 0 END) as has_ip,
  SUM(CASE WHEN ip_address IS NULL THEN 1 ELSE 0 END) as missing_ip,
  ROUND(100.0 * SUM(CASE WHEN ip_address IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
FROM visitor_logs;
```

---

## 測試檢查清單

### 前置準備
- [ ] visitor_logs 表已建立
- [ ] RLS 政策已設定
- [ ] 索引已建立
- [ ] 測試帳號已準備
- [ ] 測試環境可訪問

### 功能測試
- [ ] TC-001: 未登入訪客記錄基本資訊
- [ ] TC-002: 員工登入後記錄員工資訊
- [ ] TC-003: 路由切換產生新記錄
- [ ] TC-004: 管理員可查看所有記錄
- [ ] TC-005: 非管理員無法查看記錄
- [ ] TC-006: 所有人可插入記錄
- [ ] TC-007: IP 位址正確獲取
- [ ] TC-008: 瀏覽器資訊正確收集
- [ ] TC-009: Referrer 正確記錄
- [ ] TC-010: 時間戳記正確記錄
- [ ] TC-011: 登出後狀態變更
- [ ] TC-012: 不同角色記錄正確性

### RLS 政策驗證
- [ ] RLS-001: INSERT 政策驗證
- [ ] RLS-002: SELECT 政策驗證
- [ ] RLS-003: RLS 啟用狀態確認

### 資料完整性
- [ ] DI-001: 必填欄位檢查
- [ ] DI-002: 已登入記錄完整性
- [ ] DI-003: 未登入記錄正確性
- [ ] DI-004: IP 位址格式驗證
- [ ] DI-005: 時間戳記合理性

### 效能測試
- [ ] PERF-001: 單次記錄插入時間
- [ ] PERF-002: IP 查詢影響評估
- [ ] PERF-003: 大量記錄查詢效能

### 跨瀏覽器測試
- [ ] Chrome 測試
- [ ] Firefox 測試
- [ ] Safari 測試
- [ ] Edge 測試
- [ ] 行動裝置測試

### 最終驗證
- [ ] 所有測試案例通過
- [ ] 無 Console 錯誤
- [ ] 核心功能不受影響
- [ ] 文件已更新

---

## 問題回報

### 問題回報模板

**問題編號**: _自動生成_  
**發現日期**: _YYYY-MM-DD_  
**測試案例**: _TC-XXX_  
**嚴重程度**: ⬜ Critical / ⬜ High / ⬜ Medium / ⬜ Low

**問題描述**:
_詳細描述問題_

**重現步驟**:
1. _步驟 1_
2. _步驟 2_
3. _步驟 3_

**預期結果**:
_應該發生什麼_

**實際結果**:
_實際發生什麼_

**截圖/日誌**:
_附上相關截圖或錯誤訊息_

**環境資訊**:
- 瀏覽器: _Chrome 120.0.0_
- 作業系統: _macOS 14.0_
- 測試帳號: _flosXXX_

**建議解決方案**:
_如有建議_

---

## 測試報告模板

### 測試執行摘要

**測試日期**: _YYYY-MM-DD_  
**測試人員**: _姓名_  
**測試環境**: Production / Staging  
**測試版本**: _Commit Hash_

### 測試結果統計

| 類別 | 總數 | 通過 | 失敗 | 阻塞 | 通過率 |
|------|------|------|------|------|--------|
| 功能測試 | 12 | _ | _ | _ | _% |
| RLS 政策 | 3 | _ | _ | _ | _% |
| 資料完整性 | 5 | _ | _ | _ | _% |
| 效能測試 | 3 | _ | _ | _ | _% |
| **總計** | **23** | **_** | **_** | **_** | **_%** |

### 發現的問題

| 編號 | 嚴重程度 | 描述 | 狀態 |
|------|----------|------|------|
| _ | _ | _ | _ |

### 測試結論

_整體評估和建議_

### 下一步行動

1. _行動項目 1_
2. _行動項目 2_

---

## 附錄

### A. 測試資料清理

測試完成後，如需清理測試資料：

```sql
-- ⚠️ 警告：此操作會刪除所有訪客記錄！
-- 僅在測試環境執行

-- 刪除測試期間的記錄
DELETE FROM visitor_logs 
WHERE access_time >= '2025-12-06' 
AND access_time < '2025-12-07';

-- 或刪除所有記錄
TRUNCATE TABLE visitor_logs;
```

### B. 測試環境重置

如需重置測試環境：

```sql
-- 1. 刪除表格
DROP TABLE IF EXISTS visitor_logs CASCADE;

-- 2. 重新建立（參考 VISITOR_LOGS_SETUP_GUIDE.md）
```

### C. 常見問題

**Q1: IP 位址一直為 NULL**
- 檢查網路連線
- 確認可訪問 api.ipify.org
- 檢查瀏覽器 Console 是否有 CORS 錯誤

**Q2: 記錄沒有產生**
- 檢查 visitor_logs 表是否存在
- 檢查 RLS INSERT 政策是否正確
- 檢查瀏覽器 Console 是否有錯誤

**Q3: 管理員無法查看記錄**
- 確認使用的是 admin 角色帳號
- 檢查 RLS SELECT 政策
- 確認 users 表中 role 欄位正確

**Q4: 效能問題**
- 檢查索引是否建立
- 檢查 IP 查詢是否阻塞
- 考慮增加資料庫連線池大小

---

**文件版本**: 1.0  
**最後更新**: 2025-12-06  
**維護者**: FLOS 診所系統開發團隊
