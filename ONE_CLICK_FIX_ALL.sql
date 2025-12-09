-- ============================================================================
-- FLOS 排班系統 - 一鍵修復所有問題
-- ============================================================================
-- 這個腳本會修復所有資料表結構問題，不會修改任何密碼或員工資料
-- 執行方式：在 Supabase SQL Editor 中全選並執行
-- ============================================================================

-- ============================================================================
-- 1. 修復 attendance_records 資料表
-- ============================================================================

-- 新增所有必要欄位
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS id BIGSERIAL PRIMARY KEY;
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS employee_id INTEGER;
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS employee_name VARCHAR(100);
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS work_date DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS check_in_time TIMESTAMP;
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS check_out_time TIMESTAMP;
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS check_in_latitude DOUBLE PRECISION;
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS check_in_longitude DOUBLE PRECISION;
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS check_out_latitude DOUBLE PRECISION;
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS check_out_longitude DOUBLE PRECISION;
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS check_in_address TEXT;
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS check_out_address TEXT;
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS work_hours DOUBLE PRECISION;
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'web';
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON attendance_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_work_date ON attendance_records(work_date);
CREATE INDEX IF NOT EXISTS idx_attendance_created_at ON attendance_records(created_at);

-- ============================================================================
-- 2. 修復 leave_requests 資料表
-- ============================================================================

-- 新增所有必要欄位
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS id BIGSERIAL PRIMARY KEY;
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS employee_id INTEGER;
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS leave_type VARCHAR(50);
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS days DOUBLE PRECISION;
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS reason TEXT;
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS approved_by INTEGER;
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_leave_employee_id ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_start_date ON leave_requests(start_date);
CREATE INDEX IF NOT EXISTS idx_leave_created_at ON leave_requests(created_at);

-- ============================================================================
-- 3. 確保 employees 資料表完整
-- ============================================================================

-- 新增可能缺少的欄位
ALTER TABLE employees ADD COLUMN IF NOT EXISTS id BIGSERIAL PRIMARY KEY;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS employee_id VARCHAR(50) UNIQUE NOT NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS name VARCHAR(100) NOT NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS password VARCHAR(255) NOT NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'staff';
ALTER TABLE employees ADD COLUMN IF NOT EXISTS position VARCHAR(100);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS employment_status VARCHAR(20) DEFAULT 'active';
ALTER TABLE employees ADD COLUMN IF NOT EXISTS resignation_date DATE;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS bluetooth_device_name VARCHAR(100);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS bluetooth_mac_address VARCHAR(20);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE employees ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
ALTER TABLE employees ADD COLUMN IF NOT EXISTS password_changed BOOLEAN DEFAULT FALSE;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR(50);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS account_locked BOOLEAN DEFAULT FALSE;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP;

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);
CREATE INDEX IF NOT EXISTS idx_employees_employment_status ON employees(employment_status);

-- ============================================================================
-- 4. 驗證修復結果
-- ============================================================================

-- 檢查 attendance_records 欄位
SELECT 
  'attendance_records' as table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'attendance_records'
ORDER BY ordinal_position;

-- 檢查 leave_requests 欄位
SELECT 
  'leave_requests' as table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'leave_requests'
ORDER BY ordinal_position;

-- 檢查 employees 欄位
SELECT 
  'employees' as table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'employees'
ORDER BY ordinal_position;

-- ============================================================================
-- 5. 系統狀態檢查
-- ============================================================================

-- 員工統計
SELECT 
  '員工統計' as category,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE role = 'admin') as admins,
  COUNT(*) FILTER (WHERE role LIKE '%supervisor%') as supervisors,
  COUNT(*) FILTER (WHERE role = 'staff') as staff
FROM employees;

-- 打卡記錄統計
SELECT 
  '打卡記錄' as category,
  COUNT(*) as total_records,
  COUNT(DISTINCT employee_id) as employees_with_records,
  COUNT(*) FILTER (WHERE check_in_latitude IS NOT NULL) as records_with_gps
FROM attendance_records;

-- 請假記錄統計
SELECT 
  '請假記錄' as category,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'pending') as pending,
  COUNT(*) FILTER (WHERE status = 'approved') as approved,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected
FROM leave_requests;

-- ============================================================================
-- 完成！
-- ============================================================================

SELECT '✅ 所有資料表結構已修復完成！' as status;
SELECT '⚠️ 請檢查上方的驗證結果，確保所有欄位都存在' as reminder;
SELECT '📝 沒有修改任何密碼或員工資料' as note;

-- ============================================================================
