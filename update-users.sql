-- 清空現有用戶資料
TRUNCATE TABLE users CASCADE;

-- 插入所有 16 位員工資料
-- 🔴 管理者 (1位)
INSERT INTO users (employee_id, name, password, role, created_at, updated_at) VALUES
('ADMIN-HBH012', '黃柏翰', 'Admin@HBH2025', 'admin', NOW(), NOW());

-- 🟠 高階主管 (2位)
INSERT INTO users (employee_id, name, password, role, created_at, updated_at) VALUES
('SUPER-LDX011', '劉道玄', 'Super@LDX2025', 'senior_supervisor', NOW(), NOW()),
('SUPER-ZYR016', '鍾曜任', 'Super@ZYR2025', 'senior_supervisor', NOW(), NOW());

-- 🟡 一般主管 (2位)
INSERT INTO users (employee_id, name, password, role, created_at, updated_at) VALUES
('SUPER-WQ001', '萬晴', 'Super@WQ2025', 'supervisor', NOW(), NOW()),
('SUPER-CYA002', '陳韻安', 'Super@CYA2025', 'supervisor', NOW(), NOW());

-- 🟢 員工 (11位)
INSERT INTO users (employee_id, name, password, role, created_at, updated_at) VALUES
('STAFF-LZX003', '劉哲軒', 'Staff@LZX2025', 'staff', NOW(), NOW()),
('STAFF-LWH004', '李文華', 'Staff@LWH2025', 'staff', NOW(), NOW()),
('STAFF-ZGQ005', '張耿齊', 'Staff@ZGQ2025', 'staff', NOW(), NOW()),
('STAFF-HYC006', '洪揚程', 'Staff@HYC2025', 'staff', NOW(), NOW()),
('STAFF-XHY007', '謝鏵翧', 'Staff@XHY2025', 'staff', NOW(), NOW()),
('STAFF-WZJ008', '王筑句', 'Staff@WZJ2025', 'staff', NOW(), NOW()),
('STAFF-MM009', '米米', 'Staff@MM2025', 'staff', NOW(), NOW()),
('STAFF-H010', '花', 'Staff@H2025', 'staff', NOW(), NOW()),
('STAFF-ZZK013', '周稚凱', 'Staff@ZZK2025', 'staff', NOW(), NOW()),
('STAFF-GYC014', '郭郁承', 'Staff@GYC2025', 'staff', NOW(), NOW()),
('STAFF-CYA015', '陳怡安', 'Staff@CYA2025', 'staff', NOW(), NOW());

-- 驗證插入結果
SELECT 
  role,
  COUNT(*) as count,
  STRING_AGG(name, ', ') as names
FROM users
GROUP BY role
ORDER BY 
  CASE role
    WHEN 'admin' THEN 1
    WHEN 'senior_supervisor' THEN 2
    WHEN 'supervisor' THEN 3
    WHEN 'staff' THEN 4
  END;
