# 資料庫設定指南

## 概述

本指南將協助您完成 FLOS 診所排班系統的資料庫設定,包括建立資料表、設定 RLS 政策、初始化員工帳號等步驟。

## 前置準備

1. 登入 Supabase 後台: https://supabase.com/dashboard
2. 選擇專案: `pizzpwesrbulfjylejlu`
3. 開啟左側選單的 **SQL Editor**

---

## 步驟 1: 建立資料表與 RLS 政策

### 目的
建立 `staff_members` 和 `leave_records` 資料表,並設定 Row Level Security 政策。

### 執行方式
1. 在 SQL Editor 中點擊 **New query**
2. 複製以下 SQL 並貼上
3. 點擊 **Run** 執行

### SQL 內容

```sql
-- ========================================
-- 建立 staff_members 資料表
-- ========================================

CREATE TABLE IF NOT EXISTS staff_members (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_members_order ON staff_members(order_index);

-- ========================================
-- 建立 leave_records 資料表
-- ========================================

CREATE TABLE IF NOT EXISTS leave_records (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  staff_name TEXT NOT NULL,
  day INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(year, month, staff_name, day)
);

CREATE INDEX IF NOT EXISTS idx_leave_records_date ON leave_records(year, month);
CREATE INDEX IF NOT EXISTS idx_leave_records_staff ON leave_records(staff_name);

-- ========================================
-- staff_members 表 RLS 政策
-- ========================================

ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all users to read staff_members" ON staff_members;
DROP POLICY IF EXISTS "Allow all users to insert staff_members" ON staff_members;
DROP POLICY IF EXISTS "Allow all users to update staff_members" ON staff_members;
DROP POLICY IF EXISTS "Allow all users to delete staff_members" ON staff_members;

CREATE POLICY "Allow all users to read staff_members" ON staff_members FOR SELECT USING (true);
CREATE POLICY "Allow all users to insert staff_members" ON staff_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all users to update staff_members" ON staff_members FOR UPDATE USING (true);
CREATE POLICY "Allow all users to delete staff_members" ON staff_members FOR DELETE USING (true);

-- ========================================
-- leave_records 表 RLS 政策
-- ========================================

ALTER TABLE leave_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all users to read leave_records" ON leave_records;
DROP POLICY IF EXISTS "Allow all users to insert leave_records" ON leave_records;
DROP POLICY IF EXISTS "Allow all users to update leave_records" ON leave_records;
DROP POLICY IF EXISTS "Allow all users to delete leave_records" ON leave_records;

CREATE POLICY "Allow all users to read leave_records" ON leave_records FOR SELECT USING (true);
CREATE POLICY "Allow all users to insert leave_records" ON leave_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all users to update leave_records" ON leave_records FOR UPDATE USING (true);
CREATE POLICY "Allow all users to delete leave_records" ON leave_records FOR DELETE USING (true);
```

### 驗證結果
執行完成後,應該看到:
- ✅ `staff_members` 表已建立
- ✅ `leave_records` 表已建立
- ✅ RLS 政策已設定

---

## 步驟 2: 初始化員工帳號

### 目的
為所有員工建立登入帳號,讓他們可以登入系統。

### 執行方式
1. 在 SQL Editor 中點擊 **New query**
2. 複製以下 SQL 並貼上
3. 點擊 **Run** 執行

### SQL 內容

```sql
-- 插入員工帳號(如果不存在)
INSERT INTO users (employee_id, name, password, role) VALUES
-- 高階主管
('SUPER-LDX011', '劉道玄', 'Staff@LDX2025', 'senior_supervisor'),
('SUPER-ZYR016', '鍾曜任', 'Staff@ZYR2025', 'senior_supervisor'),

-- 一般主管
('SUPER-WQ001', '萬晴', 'Staff@WQ2025', 'supervisor'),
('SUPER-CYA002', '陳韻安', 'Staff@CYA2025', 'supervisor'),

-- 一般員工
('STAFF-LZX001', '劉哲軒', 'Staff@LZX2025', 'staff'),
('STAFF-ZZK002', '周稚凱', 'Staff@ZZK2025', 'staff'),
('STAFF-ZGQ003', '張耿齊', 'Staff@ZGQ2025', 'staff'),
('STAFF-LWH004', '李文華', 'Staff@LWH2025', 'staff'),
('STAFF-HYC005', '洪揚程', 'Staff@HYC2025', 'staff'),
('STAFF-WZG006', '王筑句', 'Staff@WZG2025', 'staff'),
('STAFF-MM007', '米米', 'Staff@MM2025', 'staff'),
('STAFF-HH008', '花花', 'Staff@HH2025', 'staff'),
('STAFF-XHY009', '謝鏵翧', 'Staff@XHY2025', 'staff'),
('STAFF-GYC010', '郭郁承', 'Staff@GYC2025', 'staff'),
('STAFF-CYA011', '陳怡安', 'Staff@CYA2025', 'staff')

ON CONFLICT (employee_id) DO NOTHING;
```

### 員工帳號列表

| 員工編號 | 姓名 | 密碼 | 角色 |
|---------|------|------|------|
| SUPER-LDX011 | 劉道玄 | Staff@LDX2025 | 高階主管 |
| SUPER-ZYR016 | 鍾曜任 | Staff@ZYR2025 | 高階主管 |
| SUPER-WQ001 | 萬晴 | Staff@WQ2025 | 一般主管 |
| SUPER-CYA002 | 陳韻安 | Staff@CYA2025 | 一般主管 |
| STAFF-LZX001 | 劉哲軒 | Staff@LZX2025 | 員工 |
| STAFF-ZZK002 | 周稚凱 | Staff@ZZK2025 | 員工 |
| STAFF-ZGQ003 | 張耿齊 | Staff@ZGQ2025 | 員工 |
| STAFF-LWH004 | 李文華 | Staff@LWH2025 | 員工 |
| STAFF-HYC005 | 洪揚程 | Staff@HYC2025 | 員工 |
| STAFF-WZG006 | 王筑句 | Staff@WZG2025 | 員工 |
| STAFF-MM007 | 米米 | Staff@MM2025 | 員工 |
| STAFF-HH008 | 花花 | Staff@HH2025 | 員工 |
| STAFF-XHY009 | 謝鏵翧 | Staff@XHY2025 | 員工 |
| STAFF-GYC010 | 郭郁承 | Staff@GYC2025 | 員工 |
| STAFF-CYA011 | 陳怡安 | Staff@CYA2025 | 員工 |

**注意**: 請告知員工他們的初始密碼,並建議他們登入後修改密碼。

---

## 步驟 3: 更新請假資料表結構

### 目的
為 `leave_requests` 資料表新增 `no_deduct_attendance` 欄位,用於標記該假別是否不扣全勤。

### 執行方式
1. 在 SQL Editor 中點擊 **New query**
2. 複製以下 SQL 並貼上
3. 點擊 **Run** 執行

### SQL 內容

```sql
-- 新增欄位(如果不存在)
ALTER TABLE leave_requests 
ADD COLUMN IF NOT EXISTS no_deduct_attendance BOOLEAN DEFAULT true;

-- 更新現有記錄,設定所有假別都不扣全勤
UPDATE leave_requests 
SET no_deduct_attendance = true 
WHERE no_deduct_attendance IS NULL;
```

---

## 驗證設定

### 檢查資料表是否建立成功

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('staff_members', 'leave_records', 'users', 'leave_requests');
```

應該看到 4 個資料表。

### 檢查 RLS 政策是否設定成功

```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('staff_members', 'leave_records');
```

應該看到每個資料表有 4 個政策(SELECT, INSERT, UPDATE, DELETE)。

### 檢查員工帳號是否建立成功

```sql
SELECT employee_id, name, role 
FROM users 
ORDER BY 
  CASE role 
    WHEN 'admin' THEN 1
    WHEN 'senior_supervisor' THEN 2
    WHEN 'supervisor' THEN 3
    WHEN 'staff' THEN 4
  END,
  name;
```

應該看到 15 位員工(1 位管理者 + 2 位高階主管 + 2 位一般主管 + 11 位員工)。

---

## 常見問題

### Q: 執行 SQL 時出現「relation already exists」錯誤
**A**: 這是正常的,表示資料表已經存在。可以忽略此錯誤。

### Q: 執行 SQL 時出現「duplicate key value」錯誤
**A**: 這表示員工帳號已經存在。使用 `ON CONFLICT DO NOTHING` 可以避免此錯誤。

### Q: 員工無法登入
**A**: 請確認:
1. 員工編號和密碼是否正確
2. users 資料表中是否有該員工的記錄
3. 檢查瀏覽器 Console 是否有錯誤訊息

### Q: 員工休假月曆顯示「載入失敗」
**A**: 請確認:
1. 是否已執行步驟 1 建立資料表
2. 是否已設定 RLS 政策
3. 重新整理頁面

---

## 完成後的系統功能

✅ **員工休假月曆**
- 有權限的 5 位人員可以編輯
- 其他人只能檢視
- 權限資訊隱藏

✅ **請假管理系統**
- 14 種假別可選擇
- 所有假別不扣全勤
- 不需填寫請假理由

✅ **登入系統**
- 所有員工都可以登入
- 根據角色顯示不同功能

---

## 聯絡支援

如果在設定過程中遇到問題,請聯絡系統管理員。

**系統版本**: v2.0.0  
**最後更新**: 2025-01-26
