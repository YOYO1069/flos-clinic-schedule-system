-- 新增員工管理欄位遷移腳本
-- 執行日期: 2025-12-03
-- 說明: 新增職位、電話、在職狀態和離職日期欄位

-- 1. 新增聯絡電話欄位
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- 2. 新增在職狀態欄位（預設為在職）
ALTER TABLE users ADD COLUMN IF NOT EXISTS employment_status VARCHAR(20) DEFAULT '在職';

-- 3. 新增離職日期欄位
ALTER TABLE users ADD COLUMN IF NOT EXISTS resignation_date DATE;

-- 4. 更新現有員工的預設狀態
UPDATE users SET employment_status = '在職' WHERE employment_status IS NULL;

-- 5. 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_users_employment_status ON users(employment_status);

-- 完成！
-- 注意: position 欄位已經存在，不需要新增
