-- ==========================================
-- FLOS 診所系統 - 完整使用者帳號建立腳本
-- ==========================================

-- 清空現有使用者 (保留資料表結構)
TRUNCATE TABLE users CASCADE;

-- 插入所有使用者
INSERT INTO users (employee_id, password, name, role, position) VALUES

-- 🔴 管理員 (1位)
('ADMIN-HBH012', 'Admin@HBH2025', '黃柏翰', 'admin', '管理者'),

-- 🟠 高階主管 (2位)
('SUPER-LDX011', 'Super@LDX2025', '劉道玄', 'senior_supervisor', '高階主管'),
('SUPER-ZYR016', 'Super@ZYR2025', '鍾曜任', 'senior_supervisor', '高階主管'),

-- 🟡 一般主管 (2位)
('SUPER-WQ001', 'Super@WQ2025', '萬晴', 'supervisor', '美容師主管'),
('SUPER-CYA002', 'Super@CYA2025', '陳韻安', 'supervisor', '美容師主管'),

-- 🟢 員工 (11位)
('STAFF-LZX003', 'Staff@LZX2025', '劉哲軒', 'staff', '護理師'),
('STAFF-LWH004', 'Staff@LWH2025', '李文華', 'staff', '美容師'),
('STAFF-ZGQ005', 'Staff@ZGQ2025', '張耿齊', 'staff', '美容師'),
('STAFF-HYC006', 'Staff@HYC2025', '洪揚程', 'staff', '美容師'),
('STAFF-XHY007', 'Staff@XHY2025', '謝鏵翧', 'staff', '護理師'),
('STAFF-WZJ008', 'Staff@WZJ2025', '王筑句', 'staff', '美容師'),
('STAFF-MM009', 'Staff@MM2025', '米米', 'staff', '員工'),
('STAFF-H010', 'Staff@H2025', '花', 'staff', '員工'),
('STAFF-ZZK013', 'Staff@ZZK2025', '周稚凱', 'staff', '美容師'),
('STAFF-GYC014', 'Staff@GYC2025', '郭郁承', 'staff', '美容師'),
('STAFF-CYA015', 'Staff@CYA2025', '陳怡安', 'staff', '美容師')

ON CONFLICT (employee_id) DO UPDATE SET
  password = EXCLUDED.password,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  position = EXCLUDED.position;

-- 更新 staff_members 表,確保職位資料一致
UPDATE staff_members SET position = '美容師' WHERE name IN ('萬晴', '陳韻安', '李文華', '張耿齊', '洪揚程', '王筑句', '周稚凱', '郭郁承', '陳怡安');
UPDATE staff_members SET position = '護理師' WHERE name IN ('劉哲軒', '謝鏵翧');
UPDATE staff_members SET position = '高階主管' WHERE name IN ('劉道玄', '鍾曜任');
UPDATE staff_members SET position = '美容師主管' WHERE name IN ('萬晴', '陳韻安');

-- 查詢所有使用者
SELECT 
  employee_id,
  name,
  role,
  position,
  CASE role
    WHEN 'admin' THEN '🔴 管理員'
    WHEN 'senior_supervisor' THEN '🟠 高階主管'
    WHEN 'supervisor' THEN '🟡 一般主管'
    WHEN 'staff' THEN '🟢 員工'
  END as role_display
FROM users
ORDER BY 
  CASE role
    WHEN 'admin' THEN 1
    WHEN 'senior_supervisor' THEN 2
    WHEN 'supervisor' THEN 3
    WHEN 'staff' THEN 4
  END,
  employee_id;
