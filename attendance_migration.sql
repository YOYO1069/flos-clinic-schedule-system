-- FLOS 曜診所考勤管理系統資料表結構
-- 建立時間: 2025-11-12
-- 整合於排班系統,使用現有 employees 表

-- 1. 打卡記錄表
CREATE TABLE IF NOT EXISTS attendance_records (
  id BIGSERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
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

-- 2. 請假申請表
CREATE TABLE IF NOT EXISTS leave_requests (
  id BIGSERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type VARCHAR(50) NOT NULL CHECK (leave_type IN ('annual', 'sick', 'personal', 'marriage', 'maternity', 'paternity', 'bereavement', 'other')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days DECIMAL(3, 1) NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by INTEGER REFERENCES employees(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. 加班申請表
CREATE TABLE IF NOT EXISTS overtime_requests (
  id BIGSERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  overtime_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  hours DECIMAL(4, 2) NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by INTEGER REFERENCES employees(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. 薪資記錄表
CREATE TABLE IF NOT EXISTS salary_records (
  id BIGSERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL, -- 格式: YYYY-MM
  base_salary DECIMAL(10, 2) NOT NULL,
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

-- 5. 考勤設定表 (用於設定打卡規則、工作時間等)
CREATE TABLE IF NOT EXISTS attendance_settings (
  id BIGSERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_attendance_records_employee_id ON attendance_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_check_in_time ON attendance_records(check_in_time);
CREATE INDEX IF NOT EXISTS idx_attendance_records_status ON attendance_records(status);

CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_id ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_start_date ON leave_requests(start_date);

CREATE INDEX IF NOT EXISTS idx_overtime_requests_employee_id ON overtime_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_overtime_requests_status ON overtime_requests(status);
CREATE INDEX IF NOT EXISTS idx_overtime_requests_overtime_date ON overtime_requests(overtime_date);

CREATE INDEX IF NOT EXISTS idx_salary_records_employee_id ON salary_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_salary_records_month ON salary_records(month);

-- 為各表建立更新時間觸發器
DROP TRIGGER IF EXISTS update_attendance_records_updated_at ON attendance_records;
CREATE TRIGGER update_attendance_records_updated_at
  BEFORE UPDATE ON attendance_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leave_requests_updated_at ON leave_requests;
CREATE TRIGGER update_leave_requests_updated_at
  BEFORE UPDATE ON leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_overtime_requests_updated_at ON overtime_requests;
CREATE TRIGGER update_overtime_requests_updated_at
  BEFORE UPDATE ON overtime_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_salary_records_updated_at ON salary_records;
CREATE TRIGGER update_salary_records_updated_at
  BEFORE UPDATE ON salary_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF NOT EXISTS update_attendance_settings_updated_at ON attendance_settings;
CREATE TRIGGER update_attendance_settings_updated_at
  BEFORE UPDATE ON attendance_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 插入預設考勤設定
INSERT INTO attendance_settings (setting_key, setting_value, description) VALUES
('work_start_time', '09:00', '標準上班時間'),
('work_end_time', '18:00', '標準下班時間'),
('late_threshold_minutes', '15', '遲到判定閾值(分鐘)'),
('early_leave_threshold_minutes', '15', '早退判定閾值(分鐘)'),
('overtime_rate', '1.5', '加班費倍率'),
('location_check_enabled', 'true', 'GPS定位打卡是否啟用'),
('allowed_location_radius', '100', '允許打卡範圍(公尺)')
ON CONFLICT (setting_key) DO NOTHING;

-- 新增註解說明
COMMENT ON TABLE attendance_records IS '員工打卡記錄表';
COMMENT ON TABLE leave_requests IS '請假申請表';
COMMENT ON TABLE overtime_requests IS '加班申請表';
COMMENT ON TABLE salary_records IS '薪資記錄表';
COMMENT ON TABLE attendance_settings IS '考勤系統設定表';

-- 啟用 Row Level Security (RLS)
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE overtime_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_settings ENABLE ROW LEVEL SECURITY;

-- 建立政策:允許所有人讀取
CREATE POLICY "Allow public read access" ON attendance_records FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON leave_requests FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON overtime_requests FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON salary_records FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON attendance_settings FOR SELECT USING (true);

-- 建立政策:允許所有人插入
CREATE POLICY "Allow public insert access" ON attendance_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert access" ON leave_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert access" ON overtime_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert access" ON salary_records FOR INSERT WITH CHECK (true);

-- 建立政策:允許所有人更新
CREATE POLICY "Allow public update access" ON attendance_records FOR UPDATE USING (true);
CREATE POLICY "Allow public update access" ON leave_requests FOR UPDATE USING (true);
CREATE POLICY "Allow public update access" ON overtime_requests FOR UPDATE USING (true);
CREATE POLICY "Allow public update access" ON salary_records FOR UPDATE USING (true);
CREATE POLICY "Allow public update access" ON attendance_settings FOR UPDATE USING (true);

-- 建立政策:允許所有人刪除
CREATE POLICY "Allow public delete access" ON attendance_records FOR DELETE USING (true);
CREATE POLICY "Allow public delete access" ON leave_requests FOR DELETE USING (true);
CREATE POLICY "Allow public delete access" ON overtime_requests FOR DELETE USING (true);
CREATE POLICY "Allow public delete access" ON salary_records FOR DELETE USING (true);
