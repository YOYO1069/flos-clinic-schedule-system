-- ==========================================
-- FLOS 診所系統 - 新增藍牙打卡功能
-- ==========================================
-- 新增日期: 2025-11-29
-- 說明: 在現有 attendance_records 表中新增藍牙裝置相關欄位

-- 1. 在 users 表新增藍牙裝置欄位
ALTER TABLE users 
ADD COLUMN bluetooth_device_name VARCHAR(255) COMMENT '藍牙裝置名稱',
ADD COLUMN bluetooth_mac_address VARCHAR(100) COMMENT '藍牙MAC地址';

-- 2. 在 attendance_records 表新增藍牙打卡相關欄位
ALTER TABLE attendance_records
ADD COLUMN check_in_method VARCHAR(50) DEFAULT 'manual' COMMENT '打卡方式: gps, manual, quick, bluetooth',
ADD COLUMN bluetooth_device_name VARCHAR(255) COMMENT '藍牙裝置名稱（藍牙打卡時使用）';

-- 3. 更新現有記錄的打卡方式（預設為 manual）
UPDATE attendance_records 
SET check_in_method = 'manual' 
WHERE check_in_method IS NULL;

-- 4. 查詢結果
SELECT '藍牙打卡功能已新增' as message;

-- 5. 顯示更新後的 users 表結構
DESCRIBE users;

-- 6. 顯示更新後的 attendance_records 表結構
DESCRIBE attendance_records;
