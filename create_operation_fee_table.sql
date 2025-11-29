-- ==========================================
-- FLOS 診所系統 - 建立操作費記錄資料表
-- ==========================================

-- 建立操作費記錄表
CREATE TABLE IF NOT EXISTS operation_fee_records (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR(50) NOT NULL,
  employee_name VARCHAR(100) NOT NULL,
  operation_date DATE NOT NULL,
  operation_item VARCHAR(100) NOT NULL,
  operation_category VARCHAR(50) NOT NULL, -- '美容師' 或 '護理師'
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_fee INTEGER NOT NULL,
  total_fee INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- 外鍵約束
  CONSTRAINT fk_employee FOREIGN KEY (employee_id) REFERENCES users(employee_id) ON DELETE CASCADE
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_operation_fee_employee ON operation_fee_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_operation_fee_date ON operation_fee_records(operation_date);
CREATE INDEX IF NOT EXISTS idx_operation_fee_employee_date ON operation_fee_records(employee_id, operation_date);

-- 建立更新時間觸發器
CREATE OR REPLACE FUNCTION update_operation_fee_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_operation_fee_updated_at
BEFORE UPDATE ON operation_fee_records
FOR EACH ROW
EXECUTE FUNCTION update_operation_fee_updated_at();

-- 插入測試資料（可選）
-- INSERT INTO operation_fee_records (employee_id, employee_name, operation_date, operation_item, operation_category, quantity, unit_fee, total_fee, notes) VALUES
-- ('STAFF-WQ001', '萬晴', '2025-11-28', '清粉刺', '美容師', 2, 300, 600, '測試資料'),
-- ('STAFF-LZX003', '劉哲軒', '2025-11-28', '點滴', '護理師', 1, 200, 200, '測試資料');

-- 查詢資料表結構
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'operation_fee_records'
ORDER BY ordinal_position;
