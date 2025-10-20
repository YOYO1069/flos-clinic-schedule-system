-- 建立排班資料表
CREATE TABLE IF NOT EXISTS flos_schedules (
  id BIGSERIAL PRIMARY KEY,
  doctor_name TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ON', 'OFF')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(doctor_name, date)
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_flos_schedules_date ON flos_schedules(date);
CREATE INDEX IF NOT EXISTS idx_flos_schedules_doctor ON flos_schedules(doctor_name);

-- 建立更新時間觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_flos_schedules_updated_at 
    BEFORE UPDATE ON flos_schedules 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 啟用 Row Level Security (RLS)
ALTER TABLE flos_schedules ENABLE ROW LEVEL SECURITY;

-- 建立政策:允許所有人讀取
CREATE POLICY "Allow public read access" ON flos_schedules
    FOR SELECT USING (true);

-- 建立政策:允許所有人插入
CREATE POLICY "Allow public insert access" ON flos_schedules
    FOR INSERT WITH CHECK (true);

-- 建立政策:允許所有人更新
CREATE POLICY "Allow public update access" ON flos_schedules
    FOR UPDATE USING (true);

-- 建立政策:允許所有人刪除
CREATE POLICY "Allow public delete access" ON flos_schedules
    FOR DELETE USING (true);

