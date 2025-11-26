-- 員工休假月曆系統 - 建立資料表與 RLS 政策
-- 請在 Supabase 後台的 SQL Editor 中執行此檔案

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

-- 建立索引
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

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_leave_records_date ON leave_records(year, month);
CREATE INDEX IF NOT EXISTS idx_leave_records_staff ON leave_records(staff_name);


-- ========================================
-- staff_members 表 RLS 政策
-- ========================================

-- 啟用 RLS
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;

-- 刪除舊政策(如果存在)
DROP POLICY IF EXISTS "Allow all users to read staff_members" ON staff_members;
DROP POLICY IF EXISTS "Allow all users to insert staff_members" ON staff_members;
DROP POLICY IF EXISTS "Allow all users to update staff_members" ON staff_members;
DROP POLICY IF EXISTS "Allow all users to delete staff_members" ON staff_members;

-- 建立新政策:允許所有人讀取
CREATE POLICY "Allow all users to read staff_members"
ON staff_members FOR SELECT
USING (true);

-- 建立新政策:允許所有人新增
CREATE POLICY "Allow all users to insert staff_members"
ON staff_members FOR INSERT
WITH CHECK (true);

-- 建立新政策:允許所有人更新
CREATE POLICY "Allow all users to update staff_members"
ON staff_members FOR UPDATE
USING (true);

-- 建立新政策:允許所有人刪除
CREATE POLICY "Allow all users to delete staff_members"
ON staff_members FOR DELETE
USING (true);


-- ========================================
-- leave_records 表 RLS 政策
-- ========================================

-- 啟用 RLS
ALTER TABLE leave_records ENABLE ROW LEVEL SECURITY;

-- 刪除舊政策(如果存在)
DROP POLICY IF EXISTS "Allow all users to read leave_records" ON leave_records;
DROP POLICY IF EXISTS "Allow all users to insert leave_records" ON leave_records;
DROP POLICY IF EXISTS "Allow all users to update leave_records" ON leave_records;
DROP POLICY IF EXISTS "Allow all users to delete leave_records" ON leave_records;

-- 建立新政策:允許所有人讀取
CREATE POLICY "Allow all users to read leave_records"
ON leave_records FOR SELECT
USING (true);

-- 建立新政策:允許所有人新增
CREATE POLICY "Allow all users to insert leave_records"
ON leave_records FOR INSERT
WITH CHECK (true);

-- 建立新政策:允許所有人更新
CREATE POLICY "Allow all users to update leave_records"
ON leave_records FOR UPDATE
USING (true);

-- 建立新政策:允許所有人刪除
CREATE POLICY "Allow all users to delete leave_records"
ON leave_records FOR DELETE
USING (true);


-- ========================================
-- 驗證設定
-- ========================================

-- 查看 staff_members 表的政策
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'staff_members';

-- 查看 leave_records 表的政策
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'leave_records';

-- 查看資料表是否建立成功
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('staff_members', 'leave_records');
