-- ==========================================
-- FLOS 診所系統 - 新增藍牙打卡功能
-- ==========================================
-- 新增日期: 2025-11-29
-- 說明: 在現有 attendance_records 表中新增藍牙裝置相關欄位
-- 資料庫: PostgreSQL

-- 1. 在 users 表新增藍牙裝置欄位
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS bluetooth_device_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS bluetooth_mac_address VARCHAR(100);

-- 2. 在 attendance_records 表新增藍牙打卡相關欄位
ALTER TABLE attendance_records
ADD COLUMN IF NOT EXISTS check_in_method VARCHAR(50) DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS bluetooth_device_name VARCHAR(255);

-- 3. 新增欄位註解
COMMENT ON COLUMN users.bluetooth_device_name IS '藍牙裝置名稱';
COMMENT ON COLUMN users.bluetooth_mac_address IS '藍牙MAC地址';
COMMENT ON COLUMN attendance_records.check_in_method IS '打卡方式: gps, manual, quick, bluetooth';
COMMENT ON COLUMN attendance_records.bluetooth_device_name IS '藍牙裝置名稱（藍牙打卡時使用）';

-- 4. 更新現有記錄的打卡方式（預設為 manual）
UPDATE attendance_records 
SET check_in_method = 'manual' 
WHERE check_in_method IS NULL;

-- 5. 查詢結果
SELECT '藍牙打卡功能已新增' as message;
