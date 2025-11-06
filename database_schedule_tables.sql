-- FLOS曜診所排班系統資料庫結構
-- 內部系統 - 簡化版
-- 請在Supabase SQL Editor中執行此腳本

-- 1. 醫師資料表
CREATE TABLE IF NOT EXISTS doctors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 員工資料表
CREATE TABLE IF NOT EXISTS staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 醫師排班表
CREATE TABLE IF NOT EXISTS doctor_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(doctor_id, date, start_time)
);

-- 4. 員工排班表
CREATE TABLE IF NOT EXISTS staff_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(staff_id, date, start_time)
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_doctors_name ON doctors(name);
CREATE INDEX IF NOT EXISTS idx_doctors_active ON doctors(is_active);
CREATE INDEX IF NOT EXISTS idx_staff_name ON staff(name);
CREATE INDEX IF NOT EXISTS idx_staff_active ON staff(is_active);
CREATE INDEX IF NOT EXISTS idx_doctor_schedules_date ON doctor_schedules(date);
CREATE INDEX IF NOT EXISTS idx_doctor_schedules_doctor_id ON doctor_schedules(doctor_id);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_date ON staff_schedules(date);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_staff_id ON staff_schedules(staff_id);

-- 插入FLOS曜診所實際醫師名單 (12位)
INSERT INTO doctors (name) VALUES
('鍾曜任'),
('伍詠聰'),
('林思宇'),
('王昱淞'),
('黃俊堯'),
('藍子軒'),
('何逸群'),
('郭昌浩'),
('宋昀翰'),
('龍勤莉'),
('郭昌濬'),
('蔡秉遑')
ON CONFLICT DO NOTHING;

-- 插入FLOS曜診所實際員工名單 (14位)
INSERT INTO staff (name) VALUES
('萬晴'),
('陳韻安'),
('劉哲軒'),
('李文華'),
('張耿齊'),
('洪揚程'),
('謝鏵翧'),
('王筑句'),
('米米'),
('花'),
('劉道玄'),
('黃柏翰'),
('周稚凱'),
('郭郁承')
ON CONFLICT DO NOTHING;

-- 啟用Row Level Security (RLS)
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_schedules ENABLE ROW LEVEL SECURITY;

-- 建立RLS政策 (允許所有操作)
CREATE POLICY "Allow all operations on doctors" ON doctors FOR ALL USING (true);
CREATE POLICY "Allow all operations on staff" ON staff FOR ALL USING (true);
CREATE POLICY "Allow all operations on doctor_schedules" ON doctor_schedules FOR ALL USING (true);
CREATE POLICY "Allow all operations on staff_schedules" ON staff_schedules FOR ALL USING (true);

-- 完成!
-- 
-- 營業時間:
-- 週一～週五：12:00–20:30
-- 週六：10:30–19:00
-- 週日：休診（含國定假日）
-- 
-- 排班說明:
-- 診所只有一段班，不分早班/午班/晚班
