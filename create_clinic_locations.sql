-- ==========================================
-- 診所位置和打卡範圍設定資料表
-- ==========================================

-- 建立診所位置資料表
CREATE TABLE IF NOT EXISTS clinic_locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  valid_radius INTEGER DEFAULT 100, -- 有效打卡範圍(公尺)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_clinic_locations_active ON clinic_locations(is_active);

-- 新增註解
COMMENT ON TABLE clinic_locations IS '診所位置和打卡範圍設定';
COMMENT ON COLUMN clinic_locations.latitude IS '診所緯度';
COMMENT ON COLUMN clinic_locations.longitude IS '診所經度';
COMMENT ON COLUMN clinic_locations.valid_radius IS '有效打卡範圍(公尺)';
COMMENT ON COLUMN clinic_locations.is_active IS '是否啟用';

-- 插入 FLOS 診所預設位置(請替換為實際座標)
INSERT INTO clinic_locations (name, address, latitude, longitude, valid_radius) VALUES
('FLOS 曜診所', '台北市信義區信義路五段7號', 25.033964, 121.564468, 100)
ON CONFLICT DO NOTHING;

-- 修改 attendance_records 表,新增驗證相關欄位
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS distance_from_clinic INTEGER;
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS is_within_range BOOLEAN DEFAULT true;
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'approved';
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS approved_by VARCHAR(100);
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS approval_note TEXT;

COMMENT ON COLUMN attendance_records.distance_from_clinic IS '距離診所的距離(公尺)';
COMMENT ON COLUMN attendance_records.is_within_range IS '是否在有效範圍內';
COMMENT ON COLUMN attendance_records.approval_status IS '審核狀態: approved(已核准), pending(待審核), rejected(已拒絕)';
COMMENT ON COLUMN attendance_records.approved_by IS '審核者';
COMMENT ON COLUMN attendance_records.approval_note IS '審核備註';
