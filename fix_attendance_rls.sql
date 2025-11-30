-- ==========================================
-- FLOS 診所系統 - 修復打卡功能 RLS 政策
-- ==========================================

-- 1. 檢查當前的 RLS 政策
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'attendance_records';

-- 2. 暫時停用 RLS（測試用）
ALTER TABLE attendance_records DISABLE ROW LEVEL SECURITY;

-- 3. 或者，如果需要保留 RLS，請確保有正確的插入政策
-- 刪除舊的政策（如果存在）
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON attendance_records;

-- 建立新的插入政策
CREATE POLICY "Enable insert for authenticated users"
ON attendance_records
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 4. 確保有查詢政策
DROP POLICY IF EXISTS "Enable read for authenticated users" ON attendance_records;

CREATE POLICY "Enable read for authenticated users"
ON attendance_records
FOR SELECT
TO authenticated
USING (true);

-- 5. 確保有更新政策
DROP POLICY IF EXISTS "Enable update for authenticated users" ON attendance_records;

CREATE POLICY "Enable update for authenticated users"
ON attendance_records
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 6. 重新啟用 RLS
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- 7. 查詢結果
SELECT '打卡功能 RLS 政策已修復' as message;
