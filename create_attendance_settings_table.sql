-- ==========================================
-- FLOS 診所系統 - 建立打卡設定資料表
-- ==========================================

-- 建立打卡設定表
CREATE TABLE IF NOT EXISTS attendance_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_by VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 建立更新時間觸發器
CREATE OR REPLACE FUNCTION update_attendance_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_attendance_settings_updated_at
BEFORE UPDATE ON attendance_settings
FOR EACH ROW
EXECUTE FUNCTION update_attendance_settings_updated_at();

-- 插入預設設定
INSERT INTO attendance_settings (setting_key, setting_value, description) VALUES
('require_gps', 'false', '是否強制要求GPS定位（true/false）'),
('allow_manual_location', 'true', '是否允許手動輸入地點（true/false）'),
('allow_quick_checkin', 'true', '是否允許快速打卡（無需定位）（true/false）'),
('clinic_latitude', '25.0330', '診所緯度（預設台北）'),
('clinic_longitude', '121.5654', '診所經度（預設台北）'),
('valid_distance', '500', '有效打卡距離（公尺）')
ON CONFLICT (setting_key) DO NOTHING;

-- 查詢所有設定
SELECT * FROM attendance_settings ORDER BY setting_key;
