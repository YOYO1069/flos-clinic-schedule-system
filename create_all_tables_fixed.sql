-- ==========================================
-- FLOS 診所系統 - 完整資料表建立腳本 (修正版)
-- ==========================================
-- 資料庫: pizzpwesrbulfjylejlu
-- ==========================================

-- 步驟 1: 建立使用者資料表
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL,
  position VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 步驟 2: 插入測試使用者資料
INSERT INTO users (employee_id, password, name, role, position) VALUES
('ADMIN-HBH012', 'admin123', '黃柏翰', 'admin', '管理者'),
('BEAUTY-001', 'beauty123', '陳韻安', 'employee', '美容師'),
('BEAUTY-002', 'beauty123', '王筑句', 'employee', '美容師'),
('BEAUTY-003', 'beauty123', '萬晴', 'employee', '美容師'),
('BEAUTY-004', 'beauty123', '李文華', 'employee', '美容師'),
('BEAUTY-005', 'beauty123', '洪揚程', 'employee', '美容師'),
('BEAUTY-006', 'beauty123', '郭郁承', 'employee', '美容師'),
('BEAUTY-007', 'beauty123', '周稚凱', 'employee', '美容師'),
('BEAUTY-008', 'beauty123', '陳怡安', 'employee', '美容師'),
('BEAUTY-009', 'beauty123', '張耿齊', 'employee', '美容師'),
('BEAUTY-010', 'beauty123', '何謙', 'employee', '美容師'),
('BEAUTY-011', 'beauty123', '陳億燦', 'employee', '美容師'),
('NURSE-001', 'nurse123', '劉哲軒', 'employee', '護理師'),
('NURSE-002', 'nurse123', '謝鏵翧', 'employee', '護理師'),
('NURSE-003', 'nurse123', '姜凱翔', 'employee', '護理師'),
('NURSE-004', 'nurse123', '曾鈺晶', 'employee', '護理師')
ON CONFLICT (employee_id) DO NOTHING;

-- 步驟 3: 建立打卡記錄資料表
CREATE TABLE IF NOT EXISTS attendance_records (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  employee_id VARCHAR(50) NOT NULL,
  employee_name VARCHAR(100) NOT NULL,
  check_in_time TIMESTAMP,
  check_out_time TIMESTAMP,
  check_in_latitude DECIMAL(10, 8),
  check_in_longitude DECIMAL(11, 8),
  check_out_latitude DECIMAL(10, 8),
  check_out_longitude DECIMAL(11, 8),
  check_in_address TEXT,
  check_out_address TEXT,
  work_date DATE NOT NULL,
  total_hours DECIMAL(5, 2),
  status VARCHAR(20) DEFAULT 'checked_in',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 步驟 4: 建立索引
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendance_records(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_work_date ON attendance_records(work_date);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON attendance_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);

-- 步驟 5: 新增註解
COMMENT ON TABLE users IS '員工使用者資料表';
COMMENT ON TABLE attendance_records IS '員工打卡記錄資料表';
COMMENT ON COLUMN attendance_records.check_in_latitude IS '上班打卡緯度';
COMMENT ON COLUMN attendance_records.check_in_longitude IS '上班打卡經度';
COMMENT ON COLUMN attendance_records.check_out_latitude IS '下班打卡緯度';
COMMENT ON COLUMN attendance_records.check_out_longitude IS '下班打卡經度';
COMMENT ON COLUMN attendance_records.total_hours IS '工作總時數';

-- 步驟 6: 更新 staff_members 的職位資料
UPDATE staff_members SET position = '美容師' WHERE name IN ('陳韻安', '王筑句', '萬晴', '李文華', '洪揚程', '郭郁承', '周稚凱', '陳怡安', '張耿齊', '何謙', '陳億燦');
UPDATE staff_members SET position = '護理師' WHERE name IN ('劉哲軒', '謝鏵翧', '姜凱翔', '曾鈺晶');
