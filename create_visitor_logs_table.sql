-- 創建訪客日誌表
CREATE TABLE IF NOT EXISTS visitor_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT,
  user_agent TEXT,
  page_url TEXT,
  referrer TEXT,
  screen_resolution TEXT,
  language TEXT,
  platform TEXT,
  access_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_authorized BOOLEAN DEFAULT FALSE,
  employee_id TEXT,
  employee_name TEXT,
  employee_role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 創建索引以提高查詢性能
CREATE INDEX IF NOT EXISTS idx_visitor_logs_access_time ON visitor_logs(access_time DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_ip_address ON visitor_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_employee_id ON visitor_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_is_authorized ON visitor_logs(is_authorized);

-- 啟用 Row Level Security (RLS)
ALTER TABLE visitor_logs ENABLE ROW LEVEL SECURITY;

-- 創建政策：允許所有人插入（記錄訪問）
CREATE POLICY "允許所有人記錄訪問" ON visitor_logs
  FOR INSERT
  WITH CHECK (true);

-- 創建政策：只有管理員可以查看日誌
CREATE POLICY "只有管理員可以查看日誌" ON visitor_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.employee_id = current_setting('request.jwt.claims', true)::json->>'employee_id'
      AND users.role = 'admin'
    )
  );

COMMENT ON TABLE visitor_logs IS '訪客訪問日誌表，記錄所有訪問網站的記錄';
COMMENT ON COLUMN visitor_logs.ip_address IS '訪客 IP 地址';
COMMENT ON COLUMN visitor_logs.user_agent IS '瀏覽器 User Agent';
COMMENT ON COLUMN visitor_logs.page_url IS '訪問的頁面 URL';
COMMENT ON COLUMN visitor_logs.is_authorized IS '是否為授權訪問（已登入員工）';
COMMENT ON COLUMN visitor_logs.employee_id IS '員工編號（如果是授權訪問）';
