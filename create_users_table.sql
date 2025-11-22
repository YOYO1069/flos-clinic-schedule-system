-- 建立使用者資料表
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'senior_supervisor', 'supervisor', 'staff')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 啟用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 建立公開存取政策(暫時允許所有操作,後續可調整)
CREATE POLICY "Allow all operations on users" ON users
  FOR ALL USING (true) WITH CHECK (true);

-- 插入初始使用者資料 (每人不同密碼)
-- 🔴 管理者 (1位)
INSERT INTO users (employee_id, name, password, role) VALUES
  ('ADMIN-HBH012', '黃柏翰', 'Admin@HBH2025', 'admin')
ON CONFLICT (employee_id) DO NOTHING;

-- 🟠 高階主管 (2位)
INSERT INTO users (employee_id, name, password, role) VALUES
  ('SUPER-LDX011', '劉道玄', 'Super@LDX2025', 'senior_supervisor'),
  ('SUPER-ZYR016', '鍾曜任', 'Super@ZYR2025', 'senior_supervisor')
ON CONFLICT (employee_id) DO NOTHING;

-- 🟡 一般主管 (2位)
INSERT INTO users (employee_id, name, password, role) VALUES
  ('SUPER-WQ001', '萬晴', 'Super@WQ2025', 'supervisor'),
  ('SUPER-CYA002', '陳韻安', 'Super@CYA2025', 'supervisor')
ON CONFLICT (employee_id) DO NOTHING;

-- 🟢 員工 (11位)
INSERT INTO users (employee_id, name, password, role) VALUES
  ('STAFF-LZX003', '劉哲軒', 'Staff@LZX2025', 'staff'),
  ('STAFF-LWH004', '李文華', 'Staff@LWH2025', 'staff'),
  ('STAFF-ZGQ005', '張耿齊', 'Staff@ZGQ2025', 'staff'),
  ('STAFF-HYC006', '洪揚程', 'Staff@HYC2025', 'staff'),
  ('STAFF-XHY007', '謝鏵翧', 'Staff@XHY2025', 'staff'),
  ('STAFF-WZJ008', '王筑句', 'Staff@WZJ2025', 'staff'),
  ('STAFF-MM009', '米米', 'Staff@MM2025', 'staff'),
  ('STAFF-H010', '花', 'Staff@H2025', 'staff'),
  ('STAFF-ZZK013', '周稚凱', 'Staff@ZZK2025', 'staff'),
  ('STAFF-GYC014', '郭郁承', 'Staff@GYC2025', 'staff'),
  ('STAFF-CYA015', '陳怡安', 'Staff@CYA2025', 'staff')
ON CONFLICT (employee_id) DO NOTHING;

-- 建立更新時間觸發器函數
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 建立觸發器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
