-- 更新 leave_requests 資料表結構
-- 新增 no_deduct_attendance 欄位

-- 新增欄位(如果不存在)
ALTER TABLE leave_requests 
ADD COLUMN IF NOT EXISTS no_deduct_attendance BOOLEAN DEFAULT true;

-- 更新現有記錄,設定所有假別都不扣全勤
UPDATE leave_requests 
SET no_deduct_attendance = true 
WHERE no_deduct_attendance IS NULL;

-- 驗證欄位是否新增成功
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'leave_requests' 
AND column_name = 'no_deduct_attendance';
