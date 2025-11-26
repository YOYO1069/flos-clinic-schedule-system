-- 初始化員工帳號
-- 請在 Supabase 後台的 SQL Editor 中執行此檔案

-- 插入員工帳號(如果不存在)
-- 密碼格式: Staff@員工名字首字母大寫+2025

INSERT INTO users (employee_id, name, password, role) VALUES
-- 高階主管
('SUPER-LDX011', '劉道玄', 'Staff@LDX2025', 'senior_supervisor'),
('SUPER-ZYR016', '鍾曜任', 'Staff@ZYR2025', 'senior_supervisor'),

-- 一般主管
('SUPER-WQ001', '萬晴', 'Staff@WQ2025', 'supervisor'),
('SUPER-CYA002', '陳韻安', 'Staff@CYA2025', 'supervisor'),

-- 一般員工
('STAFF-LZX001', '劉哲軒', 'Staff@LZX2025', 'staff'),
('STAFF-ZZK002', '周稚凱', 'Staff@ZZK2025', 'staff'),
('STAFF-ZGQ003', '張耿齊', 'Staff@ZGQ2025', 'staff'),
('STAFF-LWH004', '李文華', 'Staff@LWH2025', 'staff'),
('STAFF-HYC005', '洪揚程', 'Staff@HYC2025', 'staff'),
('STAFF-WZG006', '王筑句', 'Staff@WZG2025', 'staff'),
('STAFF-MM007', '米米', 'Staff@MM2025', 'staff'),
('STAFF-HH008', '花花', 'Staff@HH2025', 'staff'),
('STAFF-XHY009', '謝鏵翧', 'Staff@XHY2025', 'staff'),
('STAFF-GYC010', '郭郁承', 'Staff@GYC2025', 'staff'),
('STAFF-CYA011', '陳怡安', 'Staff@CYA2025', 'staff')

ON CONFLICT (employee_id) DO NOTHING;

-- 驗證插入結果
SELECT employee_id, name, role, created_at 
FROM users 
ORDER BY 
  CASE role 
    WHEN 'admin' THEN 1
    WHEN 'senior_supervisor' THEN 2
    WHEN 'supervisor' THEN 3
    WHEN 'staff' THEN 4
  END,
  name;
