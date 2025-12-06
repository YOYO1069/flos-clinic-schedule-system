# Visitor Logs 資料表建立指南

## 概述
本指南說明如何在 Supabase 專案中建立 `visitor_logs` 資料表，用於記錄診所管理系統的訪客日誌。

## Supabase 專案資訊
- **專案名稱**: duolaiyuanmeng
- **專案 URL**: https://pizzpwesrbulfjylejlu.supabase.co
- **SQL Editor**: https://supabase.com/dashboard/project/pizzpwesrbulfjylejlu/sql

## 建立步驟

### 方式一：使用 SQL Editor（推薦）

1. 登入 Supabase Dashboard
2. 選擇 `duolaiyuanmeng` 專案
3. 進入 SQL Editor
4. 複製以下完整 SQL 並執行

```sql
-- ============================================
-- FLOS 診所管理系統 - 訪客日誌表建立腳本
-- ============================================

-- 步驟 1：建立 visitor_logs 表
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

-- 步驟 2：建立索引以提高查詢性能
CREATE INDEX IF NOT EXISTS idx_visitor_logs_access_time ON visitor_logs(access_time DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_ip_address ON visitor_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_employee_id ON visitor_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_is_authorized ON visitor_logs(is_authorized);

-- 步驟 3：啟用 Row Level Security (RLS)
ALTER TABLE visitor_logs ENABLE ROW LEVEL SECURITY;

-- 步驟 4：建立 RLS 政策 - 允許所有人插入訪問記錄
CREATE POLICY "allow_all_insert_visitor_logs" ON visitor_logs
  FOR INSERT
  WITH CHECK (true);

-- 步驟 5：建立 RLS 政策 - 只有管理員可以查看日誌
CREATE POLICY "admin_only_select_visitor_logs" ON visitor_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.employee_id = current_setting('request.jwt.claims', true)::json->>'employee_id'
      AND users.role = 'admin'
    )
  );
```

### 方式二：使用 Table Editor

如果 SQL Editor 出現問題，可以使用 Table Editor 手動建立：

1. 進入 Supabase Dashboard > Table Editor
2. 點擊 "New table"
3. 設定表格名稱為 `visitor_logs`
4. 勾選 "Enable Row Level Security (RLS)"
5. 新增以下欄位：

| 欄位名稱 | 資料類型 | 預設值 | 可為空 | 說明 |
|---------|---------|--------|--------|------|
| id | uuid | gen_random_uuid() | 否 | 主鍵 |
| ip_address | text | - | 是 | IP 位址 |
| user_agent | text | - | 是 | 瀏覽器資訊 |
| page_url | text | - | 是 | 訪問頁面 |
| referrer | text | - | 是 | 來源頁面 |
| screen_resolution | text | - | 是 | 螢幕解析度 |
| language | text | - | 是 | 瀏覽器語言 |
| platform | text | - | 是 | 作業系統 |
| access_time | timestamptz | NOW() | 否 | 訪問時間 |
| is_authorized | boolean | false | 否 | 是否已登入 |
| employee_id | text | - | 是 | 員工編號 |
| employee_name | text | - | 是 | 員工姓名 |
| employee_role | text | - | 是 | 員工角色 |
| created_at | timestamptz | NOW() | 否 | 建立時間 |

6. 建立表格後，進入 SQL Editor 執行索引和 RLS 政策的 SQL（見上方完整 SQL）

## 驗證步驟

執行以下 SQL 確認表格已成功建立：

```sql
-- 查詢 visitor_logs 表結構
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'visitor_logs'
ORDER BY ordinal_position;

-- 查詢索引
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'visitor_logs';

-- 查詢 RLS 政策
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'visitor_logs';
```

## 預期結果

### 表結構
應該看到 14 個欄位，包含 id, ip_address, user_agent 等。

### 索引
應該看到 4 個索引：
- idx_visitor_logs_access_time
- idx_visitor_logs_ip_address
- idx_visitor_logs_employee_id
- idx_visitor_logs_is_authorized

### RLS 政策
應該看到 2 個政策：
- allow_all_insert_visitor_logs (INSERT)
- admin_only_select_visitor_logs (SELECT)

## 注意事項

1. **RLS 政策說明**：
   - 所有人都可以插入訪客記錄（包含未登入使用者）
   - 只有 role = 'admin' 的管理員可以查看日誌

2. **安全性**：
   - 表格已啟用 RLS，確保資料安全
   - 管理員權限基於 users 表的 role 欄位

3. **效能優化**：
   - 已建立索引以提高查詢效能
   - access_time 使用降序索引，適合查詢最新記錄

## 故障排除

### 問題：SQL Editor 顯示舊的錯誤訊息
**解決方法**：
1. 清除瀏覽器快取
2. 使用無痕模式開啟 Supabase Dashboard
3. 或使用 Table Editor 手動建立

### 問題：RLS 政策建立失敗
**解決方法**：
1. 確認 users 表已存在
2. 確認 users 表有 employee_id 和 role 欄位
3. 分段執行 SQL，先建立表格和索引，再建立 RLS 政策

## 相關檔案

- SQL 腳本：`/tmp/create_visitor_logs.sql`
- 前端實作：待更新（將在 Phase 3 完成）

---

**建立日期**: 2025-12-06  
**最後更新**: 2025-12-06  
**維護者**: FLOS 診所系統開發團隊
