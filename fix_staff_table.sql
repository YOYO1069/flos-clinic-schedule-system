-- 修正 staff 資料表,新增 is_active 欄位
-- 執行日期: 2025-11-12

-- 新增 is_active 欄位到 staff 資料表
ALTER TABLE staff 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;

-- 將現有員工的 is_active 設為 true
UPDATE staff 
SET is_active = true 
WHERE is_active IS NULL;

-- 驗證欄位已新增
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'staff'
ORDER BY ordinal_position;
