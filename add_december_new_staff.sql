-- ==========================================
-- FLOS 診所系統 - 新增12月新人帳號
-- ==========================================
-- 新增日期: 2025-11-28
-- 新增人數: 5位

-- 新增使用者到 users 表
INSERT INTO users (employee_id, password, name, role, position) VALUES
('STAFF-JKX017', 'Staff@JKX2025', '姜凱翔', 'staff', '護理師'),
('STAFF-ZYJ018', 'Staff@ZYJ2025', '曾鈺晶', 'staff', '美容師'),
('STAFF-HQ019', 'Staff@HQ2025', '何謙', 'staff', '美容師'),
('STAFF-CYC020', 'Staff@CYC2025', '陳億燦', 'staff', '美容師'),
('STAFF-WL021', 'Staff@WL2025', '威廉', 'staff', '美容師')

ON CONFLICT (employee_id) DO UPDATE SET
  password = EXCLUDED.password,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  position = EXCLUDED.position;

-- 新增或更新 staff_members 表
INSERT INTO staff_members (name, position, display_order)
SELECT name, position, 
  COALESCE((SELECT MAX(display_order) FROM staff_members), 0) + ROW_NUMBER() OVER (ORDER BY name)
FROM (
  VALUES 
    ('姜凱翔', '護理師'),
    ('曾鈺晶', '美容師'),
    ('何謙', '美容師'),
    ('陳億燦', '美容師'),
    ('威廉', '美容師')
) AS new_staff(name, position)
WHERE NOT EXISTS (
  SELECT 1 FROM staff_members WHERE staff_members.name = new_staff.name
)
ON CONFLICT (name) DO UPDATE SET
  position = EXCLUDED.position;

-- 查詢新增的使用者
SELECT 
  employee_id as "員工編號",
  password as "預設密碼",
  name as "姓名",
  position as "職位",
  role as "權限"
FROM users
WHERE employee_id IN ('STAFF-JKX017', 'STAFF-ZYJ018', 'STAFF-HQ019', 'STAFF-CYC020', 'STAFF-WL021')
ORDER BY employee_id;

-- 查詢所有員工總數
SELECT 
  COUNT(*) as "員工總數",
  COUNT(CASE WHEN position = '美容師' THEN 1 END) as "美容師人數",
  COUNT(CASE WHEN position = '護理師' THEN 1 END) as "護理師人數"
FROM users
WHERE role = 'staff';
