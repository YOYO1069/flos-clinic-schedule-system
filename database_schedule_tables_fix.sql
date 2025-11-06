-- FLOS曜診所排班系統 - 資料庫修正腳本
-- 此腳本會先刪除舊資料表,再重新建立並插入資料

-- 刪除舊資料表(如果存在)
DROP TABLE IF EXISTS staff_schedules CASCADE;
DROP TABLE IF EXISTS doctor_schedules CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;

-- 建立醫師資料表
CREATE TABLE doctors (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 建立員工資料表
CREATE TABLE staff (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 建立醫師排班表
CREATE TABLE doctor_schedules (
  id BIGSERIAL PRIMARY KEY,
  doctor_id BIGINT REFERENCES doctors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 建立員工排班表
CREATE TABLE staff_schedules (
  id BIGSERIAL PRIMARY KEY,
  staff_id BIGINT REFERENCES staff(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

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
('蔡秉遑');

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
('郭郁承');

-- 啟用Row Level Security (RLS)
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_schedules ENABLE ROW LEVEL SECURITY;

-- 建立RLS政策:允許所有操作(適用於內部系統)
CREATE POLICY "允許所有操作" ON doctors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "允許所有操作" ON staff FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "允許所有操作" ON doctor_schedules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "允許所有操作" ON staff_schedules FOR ALL USING (true) WITH CHECK (true);

-- 驗證資料
SELECT '醫師數量:' as info, COUNT(*) as count FROM doctors
UNION ALL
SELECT '員工數量:' as info, COUNT(*) as count FROM staff;
