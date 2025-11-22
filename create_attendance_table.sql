-- 建立打卡記錄資料表
CREATE TABLE IF NOT EXISTS attendance_records (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR(50) NOT NULL,
  employee_name VARCHAR(100) NOT NULL,
  check_in_time TIMESTAMP WITH TIME ZONE,
  check_out_time TIMESTAMP WITH TIME ZONE,
  work_hours DECIMAL(5,2),
  attendance_date DATE NOT NULL,
  source VARCHAR(20) DEFAULT 'web' CHECK (source IN ('web', 'line')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON attendance_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_source ON attendance_records(source);

-- 啟用 RLS
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- 建立公開存取政策
CREATE POLICY "Allow all operations on attendance_records" ON attendance_records
  FOR ALL USING (true) WITH CHECK (true);

-- 建立更新時間觸發器
DROP TRIGGER IF EXISTS update_attendance_records_updated_at ON attendance_records;
CREATE TRIGGER update_attendance_records_updated_at
    BEFORE UPDATE ON attendance_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
