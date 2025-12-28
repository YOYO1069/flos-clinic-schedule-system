-- 修復請假管理系統的員工ID對應問題
-- 目標：將 leave_requests 表的 employee_id 從 flosXXXXXX 格式改為 staff.id (uuid)

-- Step 1: 新增臨時欄位
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS employee_uuid uuid;

-- Step 2: 根據 employee_name 更新 employee_uuid
-- 對於已有 employee_name 的記錄，從 staff 表查找對應的 uuid
UPDATE leave_requests lr
SET employee_uuid = s.id
FROM staff s
WHERE lr.employee_name = s.name
  AND lr.employee_uuid IS NULL;

-- Step 3: 手動對應沒有 employee_name 的記錄
-- 根據 employee_id 的格式推測員工姓名

-- flosAP003 可能是「櫃檯艾佩」的縮寫 (AP = 艾佩)
-- 但 staff 表中沒有「艾佩」，需要確認

-- flosLWH004 = 李文華 (LWH = Li Wen Hua)
UPDATE leave_requests
SET employee_uuid = '222aba72-6700-431b-a741-272360360f42',
    employee_name = '李文華'
WHERE employee_id = 'flosLWH004' AND employee_name IS NULL;

-- flosHBH012 = 黃柏翰 (HBH = Huang Bo Han)
UPDATE leave_requests
SET employee_uuid = 'db49381a-ad8e-4ea5-8d13-3bd9ee7f8ad0',
    employee_name = '黃柏翰'
WHERE employee_id = 'flosHBH012' AND employee_name IS NULL;

-- flosAP003 需要手動確認
-- 暫時先標記為 NULL，等確認後再更新

-- Step 4: 驗證更新結果
SELECT 
  id,
  employee_id AS old_id,
  employee_name,
  employee_uuid AS new_id,
  CASE 
    WHEN employee_uuid IS NULL THEN '❌ 未對應'
    ELSE '✅ 已對應'
  END AS status
FROM leave_requests
ORDER BY id;

-- Step 5: 如果驗證通過，可以執行以下步驟（先不執行，等確認後再執行）
-- 5.1 備份舊的 employee_id
-- ALTER TABLE leave_requests RENAME COLUMN employee_id TO employee_id_old;

-- 5.2 將 employee_uuid 重命名為 employee_id
-- ALTER TABLE leave_requests RENAME COLUMN employee_uuid TO employee_id;

-- 5.3 刪除舊的 employee_id_old 欄位（確認無誤後）
-- ALTER TABLE leave_requests DROP COLUMN employee_id_old;

-- 注意：執行前請先備份資料庫！
