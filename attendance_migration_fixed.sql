-- FLOS 曜診所考勤管理系統 - 資料庫遷移檔案
-- 版本: 1.0.0
-- 日期: 2025-11-13
-- 說明: 建立考勤系統所需的資料表、索引、觸發器與預設資料

-- ============================================
-- 1. 建立 attendance_records (打卡記錄表)
-- ============================================
CREATE TABLE IF NOT EXISTS attendance_records (
  id BIGSERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  check_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
  check_out_time TIMESTAMP WITH TIME ZONE,
  check_in_location_lat DECIMAL(10, 8),
  check_in_location_lng DECIMAL(11, 8),
  check_out_location_lat DECIMAL(10, 8),
  check_out_location_lng DECIMAL(11, 8),
  status VARCHAR(20) DEFAULT 'normal' CHECK (status IN ('normal', 'late', 'early_leave', 'absent', 'overtime')),
  work_hours DECIMAL(5, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE attendance_records IS '員工打卡記錄表';
COMMENT ON COLUMN attendance_records.employee_id IS '員工ID (外鍵關聯 employees 表)';
COMMENT ON COLUMN attendance_records.check_in_time IS '上班打卡時間';
COMMENT ON COLUMN attendance_records.check_out_time IS '下班打卡時間';
COMMENT ON COLUMN attendance_records.status IS '出勤狀態: normal(正常), late(遲到), early_leave(早退), absent(缺勤), overtime(加班)';
COMMENT ON COLUMN attendance_records.work_hours IS '工作時數';

-- ============================================
-- 2. 建立 leave_requests (請假申請表)
-- ============================================
CREATE TABLE IF NOT EXISTS leave_requests (
  id BIGSERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  leave_type VARCHAR(50) NOT NULL CHECK (leave_type IN ('annual', 'sick', 'personal', 'marriage', 'maternity', 'paternity', 'bereavement', 'other')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days DECIMAL(3, 1) NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by INTEGER,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_dates CHECK (end_date >= start_date)
);

COMMENT ON TABLE leave_requests IS '請假申請表';
COMMENT ON COLUMN leave_requests.leave_type IS '請假類型: annual(年假), sick(病假), personal(事假), marriage(婚假), maternity(產假), paternity(陪產假), bereavement(喪假), other(其他)';
COMMENT ON COLUMN leave_requests.status IS '審核狀態: pending(待審核), approved(已核准), rejected(已拒絕), cancelled(已取消)';

-- ============================================
-- 3. 建立 overtime_requests (加班申請表)
-- ============================================
CREATE TABLE IF NOT EXISTS overtime_requests (
  id BIGSERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  overtime_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  hours DECIMAL(4, 2) NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by INTEGER,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE overtime_requests IS '加班申請表';
COMMENT ON COLUMN overtime_requests.hours IS '加班時數';
COMMENT ON COLUMN overtime_requests.status IS '審核狀態: pending(待審核), approved(已核准), rejected(已拒絕), cancelled(已取消)';

-- ============================================
-- 4. 建立 salary_records (薪資記錄表)
-- ============================================
CREATE TABLE IF NOT EXISTS salary_records (
  id BIGSERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  month VARCHAR(7) NOT NULL,
  base_salary DECIMAL(10, 2) NOT NULL DEFAULT 0,
  overtime_pay DECIMAL(10, 2) DEFAULT 0,
  bonus DECIMAL(10, 2) DEFAULT 0,
  deductions DECIMAL(10, 2) DEFAULT 0,
  total_salary DECIMAL(10, 2) NOT NULL,
  work_days INTEGER DEFAULT 0,
  overtime_hours DECIMAL(5, 2) DEFAULT 0,
  leave_days DECIMAL(4, 1) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(employee_id, month)
);

COMMENT ON TABLE salary_records IS '薪資記錄表';
COMMENT ON COLUMN salary_records.month IS '薪資月份 (格式: YYYY-MM)';
COMMENT ON COLUMN salary_records.base_salary IS '基本薪資';
COMMENT ON COLUMN salary_records.overtime_pay IS '加班費';
COMMENT ON COLUMN salary_records.bonus IS '獎金';
COMMENT ON COLUMN salary_records.deductions IS '扣款';
COMMENT ON COLUMN salary_records.total_salary IS '總薪資';

-- ============================================
-- 5. 建立 attendance_settings (考勤設定表)
-- ============================================
CREATE TABLE IF NOT EXISTS attendance_settings (
  id BIGSERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE attendance_settings IS '考勤系統設定表';
COMMENT ON COLUMN attendance_settings.setting_key IS '設定鍵值';
COMMENT ON COLUMN attendance_settings.setting_value IS '設定值';

-- ============================================
-- 6. 建立索引以優化查詢效能
-- ============================================

-- attendance_records 索引
CREATE INDEX IF NOT EXISTS idx_attendance_records_employee_id ON attendance_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_check_in_time ON attendance_records(check_in_time);
CREATE INDEX IF NOT EXISTS idx_attendance_records_status ON attendance_records(status);

-- leave_requests 索引
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_id ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON leave_requests(start_date, end_date);

-- overtime_requests 索引
CREATE INDEX IF NOT EXISTS idx_overtime_requests_employee_id ON overtime_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_overtime_requests_status ON overtime_requests(status);
CREATE INDEX IF NOT EXISTS idx_overtime_requests_date ON overtime_requests(overtime_date);

-- salary_records 索引
CREATE INDEX IF NOT EXISTS idx_salary_records_employee_id ON salary_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_salary_records_month ON salary_records(month);

-- ============================================
-- 7. 建立 updated_at 自動更新函數
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. 為各表建立更新時間觸發器
-- ============================================

-- attendance_records 觸發器
DROP TRIGGER IF EXISTS update_attendance_records_updated_at ON attendance_records;
CREATE TRIGGER update_attendance_records_updated_at
  BEFORE UPDATE ON attendance_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- leave_requests 觸發器
DROP TRIGGER IF EXISTS update_leave_requests_updated_at ON leave_requests;
CREATE TRIGGER update_leave_requests_updated_at
  BEFORE UPDATE ON leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- overtime_requests 觸發器
DROP TRIGGER IF EXISTS update_overtime_requests_updated_at ON overtime_requests;
CREATE TRIGGER update_overtime_requests_updated_at
  BEFORE UPDATE ON overtime_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- salary_records 觸發器
DROP TRIGGER IF EXISTS update_salary_records_updated_at ON salary_records;
CREATE TRIGGER update_salary_records_updated_at
  BEFORE UPDATE ON salary_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- attendance_settings 觸發器
DROP TRIGGER IF EXISTS update_attendance_settings_updated_at ON attendance_settings;
CREATE TRIGGER update_attendance_settings_updated_at
  BEFORE UPDATE ON attendance_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. 插入預設考勤設定
-- ============================================
INSERT INTO attendance_settings (setting_key, setting_value, description) VALUES
('work_start_time', '09:00', '標準上班時間'),
('work_end_time', '18:00', '標準下班時間'),
('late_threshold_minutes', '15', '遲到判定閾值(分鐘)'),
('early_leave_threshold_minutes', '15', '早退判定閾值(分鐘)'),
('overtime_rate', '1.5', '加班費倍率'),
('location_check_enabled', 'true', 'GPS定位打卡是否啟用'),
('allowed_location_radius', '100', '允許打卡範圍(公尺)')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================
-- 10. 啟用 Row Level Security (RLS)
-- ============================================

-- 啟用 RLS
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE overtime_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_settings ENABLE ROW LEVEL SECURITY;

-- 建立基本存取政策 (允許所有操作,實際應用時應根據需求調整)
-- attendance_records 政策
DROP POLICY IF EXISTS "Allow all operations on attendance_records" ON attendance_records;
CREATE POLICY "Allow all operations on attendance_records"
  ON attendance_records
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- leave_requests 政策
DROP POLICY IF EXISTS "Allow all operations on leave_requests" ON leave_requests;
CREATE POLICY "Allow all operations on leave_requests"
  ON leave_requests
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- overtime_requests 政策
DROP POLICY IF EXISTS "Allow all operations on overtime_requests" ON overtime_requests;
CREATE POLICY "Allow all operations on overtime_requests"
  ON overtime_requests
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- salary_records 政策
DROP POLICY IF EXISTS "Allow all operations on salary_records" ON salary_records;
CREATE POLICY "Allow all operations on salary_records"
  ON salary_records
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- attendance_settings 政策
DROP POLICY IF EXISTS "Allow all operations on attendance_settings" ON attendance_settings;
CREATE POLICY "Allow all operations on attendance_settings"
  ON attendance_settings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 遷移完成
-- ============================================
-- 資料表建立完成!
-- 請確認所有資料表、索引、觸發器與政策都已成功建立。
