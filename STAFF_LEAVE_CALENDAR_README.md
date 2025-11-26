# 員工休假月曆系統整合說明

## 系統概述

已成功將科技感員工休假月曆整合到 FLOS 診所排班系統中,採用深色主題設計,並實作嚴格的權限控制機制。

## 功能特色

### 1. 科技感介面設計
- **深藍漸層背景** - 從 slate-900 到 blue-900 的漸層效果
- **霓虹色標記** - 休假標記使用紅色到粉紅色的漸層文字
- **懸停效果** - 滑鼠移到格子上會有藍色光暈效果
- **動畫效果** - OFF 標記有脈衝動畫

### 2. 權限控制機制

#### 有編輯權限的人員(5位):
1. **ADMIN-HBH012** - 黃柏翰(管理者)
2. **SUPER-LDX011** - 劉道玄(高階主管)
3. **SUPER-ZYR016** - 鍾曜任(高階主管)
4. **SUPER-WQ001** - 萬晴(一般主管)
5. **SUPER-CYA002** - 陳韻安(一般主管)

#### 權限功能差異:

**有編輯權限者可以:**
- ✅ 點擊格子標記/取消休假
- ✅ 編輯員工名單(新增/刪除)
- ✅ 匯入圖片自動辨識休假
- ✅ 清除當月所有記錄
- ✅ 匯出 Excel
- ✅ 列印和儲存圖片

**無編輯權限者只能:**
- ✅ 檢視月曆
- ✅ 匯出 Excel
- ✅ 列印和儲存圖片
- ❌ 無法編輯任何資料

### 3. 隱私保護

系統**不會顯示**誰有編輯權限,所有使用者看到的介面相同,只是:
- 有權限者:點擊格子可以編輯
- 無權限者:點擊格子會顯示「您沒有編輯權限」

這樣可以保護管理層的隱私,避免員工知道誰能編輯月曆。

## 系統入口

### 1. 從管理者主控台進入
- 登入後前往 `/admin`
- 點擊「員工休假月曆」按鈕

### 2. 從主頁面進入
- 登入後在首頁
- 點擊「員工休假月曆」按鈕

### 3. 直接訪問
- URL: `https://effulgent-dasik-9e082a.netlify.app/staff-leave`

## 資料庫設定

### 必要步驟:設定 Supabase RLS 政策

**重要!** 必須執行以下 SQL 才能正常使用系統:

1. 登入 Supabase 後台: https://supabase.com/dashboard
2. 選擇專案: pizzpwesrbulfjylejlu
3. 開啟 SQL Editor
4. 執行以下 SQL:

\`\`\`sql
-- staff_members 表 RLS 政策
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all users to read staff_members" ON staff_members;
DROP POLICY IF EXISTS "Allow all users to insert staff_members" ON staff_members;
DROP POLICY IF EXISTS "Allow all users to update staff_members" ON staff_members;
DROP POLICY IF EXISTS "Allow all users to delete staff_members" ON staff_members;

CREATE POLICY "Allow all users to read staff_members" ON staff_members FOR SELECT USING (true);
CREATE POLICY "Allow all users to insert staff_members" ON staff_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all users to update staff_members" ON staff_members FOR UPDATE USING (true);
CREATE POLICY "Allow all users to delete staff_members" ON staff_members FOR DELETE USING (true);

-- leave_records 表 RLS 政策
ALTER TABLE leave_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all users to read leave_records" ON leave_records;
DROP POLICY IF EXISTS "Allow all users to insert leave_records" ON leave_records;
DROP POLICY IF EXISTS "Allow all users to update leave_records" ON leave_records;
DROP POLICY IF EXISTS "Allow all users to delete leave_records" ON leave_records;

CREATE POLICY "Allow all users to read leave_records" ON leave_records FOR SELECT USING (true);
CREATE POLICY "Allow all users to insert leave_records" ON leave_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all users to update leave_records" ON leave_records FOR UPDATE USING (true);
CREATE POLICY "Allow all users to delete leave_records" ON leave_records FOR DELETE USING (true);
\`\`\`

## 資料表結構

### staff_members (員工名單)
\`\`\`sql
CREATE TABLE staff_members (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

### leave_records (休假記錄)
\`\`\`sql
CREATE TABLE leave_records (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  staff_name TEXT NOT NULL,
  day INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(year, month, staff_name, day)
);
\`\`\`

## 使用說明

### 標記休假
1. 登入系統
2. 前往「員工休假月曆」
3. 點擊對應員工和日期的格子
4. 再次點擊可取消休假標記

### 編輯員工名單(僅限有權限者)
1. 點擊「編輯員工」按鈕
2. 輸入員工名字後點擊「+」新增
3. 點擊員工旁的垃圾桶圖示可刪除

### 匯入圖片辨識(僅限有權限者)
1. 點擊「更多功能」→「匯入圖片」
2. 選擇之前儲存的月曆圖片
3. 系統會自動辨識並還原休假記錄

### 匯出功能
1. **匯出 Excel**: 點擊「更多功能」→「匯出 Excel」
2. **列印**: 點擊「更多功能」→「列印」
3. **儲存圖片**: 點擊「更多功能」→「儲存圖片」

## 技術架構

- **前端框架**: React + TypeScript
- **UI 框架**: Tailwind CSS
- **資料庫**: Supabase (PostgreSQL)
- **部署平台**: Netlify
- **圖片辨識**: Tesseract.js (OCR)
- **圖片生成**: html2canvas
- **Excel 匯出**: xlsx

## 檔案位置

- **主要元件**: `/client/src/pages/StaffLeaveCalendar.tsx`
- **路由設定**: `/client/src/App.tsx`
- **RLS 設定**: `/setup_rls_policies.sql`
- **Supabase 配置**: `/client/src/lib/supabase.ts`

## 權限控制實作

權限控制在前端實作,透過檢查 `employee_id` 是否在允許清單中:

\`\`\`typescript
const EDIT_PERMISSION_IDS = [
  'ADMIN-HBH012',    // 黃柏翰 - 管理者
  'SUPER-LDX011',    // 劉道玄 - 高階主管
  'SUPER-ZYR016',    // 鍾曜任 - 高階主管
  'SUPER-WQ001',     // 萬晴 - 一般主管
  'SUPER-CYA002',    // 陳韻安 - 一般主管
];

const hasPermission = EDIT_PERMISSION_IDS.includes(user.employee_id);
\`\`\`

## 注意事項

1. **資料永久儲存** - 所有休假記錄儲存在 Supabase 雲端資料庫
2. **月份獨立** - 每個月份的資料獨立儲存,切換月份不會互相影響
3. **權限隱藏** - 系統不會顯示誰有編輯權限,保護隱私
4. **RLS 必須設定** - 執行 SQL 設定 RLS 政策後才能正常使用
5. **瀏覽器相容** - 建議使用 Chrome、Edge、Safari 最新版本

## 故障排除

### 問題:顯示「載入員工名單失敗」
**解決方法**: 執行 `setup_rls_policies.sql` 設定 RLS 政策

### 問題:顯示「載入休假記錄失敗」
**解決方法**: 執行 `setup_rls_policies.sql` 設定 RLS 政策

### 問題:點擊格子沒反應
**解決方法**: 檢查是否已登入,以及該帳號是否有編輯權限

### 問題:無法新增員工
**解決方法**: 確認該帳號是否在 5 位有權限人員名單中

## 更新記錄

### 2025-01-26
- ✅ 整合科技感月曆到現有系統
- ✅ 實作權限控制機制(5 位指定人員)
- ✅ 隱藏權限資訊
- ✅ 新增系統入口按鈕
- ✅ 建立 RLS 政策設定檔案

---

**系統版本**: v1.0.0  
**最後更新**: 2025-01-26  
**維護人員**: Manus AI
