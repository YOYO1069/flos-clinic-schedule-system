-- 建立操作記錄表
CREATE TABLE IF NOT EXISTS operation_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  user_name VARCHAR(100),
  operation_type VARCHAR(50), -- 'add', 'remove', 'edit'
  target_staff VARCHAR(100),
  target_date DATE,
  old_value VARCHAR(50),
  new_value VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_operation_logs_user_id ON operation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_operation_logs_created_at ON operation_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_operation_logs_target_staff ON operation_logs(target_staff);

-- 修改 leave_records 表,新增 leave_type 欄位
ALTER TABLE leave_records ADD COLUMN IF NOT EXISTS leave_type VARCHAR(10) DEFAULT 'OFF';
-- leave_type 可以是: 'OFF', 'ON', '特'

-- 修改 leave_records 表,新增操作者資訊
ALTER TABLE leave_records ADD COLUMN IF NOT EXISTS operator_id INTEGER;
ALTER TABLE leave_records ADD COLUMN IF NOT EXISTS operator_name VARCHAR(100);

COMMENT ON COLUMN leave_records.leave_type IS '休假類型: OFF(休假), ON(上班), 特(特休)';
COMMENT ON COLUMN leave_records.operator_id IS '操作者ID';
COMMENT ON COLUMN leave_records.operator_name IS '操作者姓名';

-- 修改 staff_members 表,新增職位欄位
ALTER TABLE staff_members ADD COLUMN IF NOT EXISTS position VARCHAR(50);

COMMENT ON COLUMN staff_members.position IS '員工職位: 美容師, 護理師';

-- 更新員工職位資料
-- 美容師
UPDATE staff_members SET position = '美容師' WHERE name IN ('陳韻安', '王筑句', '萬晴', '李文華', '洪揚程', '郭郁承', '周稚凱', '陳怡安', '張耿齊', '何謙', '陳億燦');

-- 護理師
UPDATE staff_members SET position = '護理師' WHERE name IN ('劉哲軒', '謝鏵翧', '姜凱翔', '曾鈺晶');
