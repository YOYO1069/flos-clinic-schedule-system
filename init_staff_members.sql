-- 初始化員工名單到 staff_members 資料表
-- 請在 Supabase 後台的 SQL Editor 中執行此檔案

-- 清空現有資料(如果需要重新初始化)
-- TRUNCATE TABLE staff_members RESTART IDENTITY CASCADE;

-- 插入員工名單(根據 PDF 中的順序)
INSERT INTO staff_members (name, order_index) VALUES
('黃語', 1),
('陳醫安', 2),
('劉哲軒', 3),
('李文華', 4),
('洪揚程', 5),
('薛建鈞', 6),
('王筑句 王美句', 7),
('米米', 8),
('花', 9),
('劉道玄', 10),
('黃柏翰', 11),
('周稚凱', 12),
('郭郁承', 13),
('陳怡安', 14)

ON CONFLICT DO NOTHING;

-- 驗證插入結果
SELECT id, name, order_index, created_at 
FROM staff_members 
ORDER BY order_index;
