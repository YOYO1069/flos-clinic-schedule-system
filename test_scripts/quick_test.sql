-- 訪客記錄系統快速測試腳本
-- 執行時間: < 1 分鐘
-- 用途: 快速驗證系統基本功能

-- ============================================
-- 測試 1: 確認表格和 RLS 設定
-- ============================================

-- 1.1 確認表格存在
SELECT 
  'Table Exists' as test_name,
  CASE WHEN COUNT(*) = 1 THEN '✅ PASS' ELSE '❌ FAIL' END as result
FROM information_schema.tables 
WHERE table_name = 'visitor_logs';

-- 1.2 確認 RLS 已啟用
SELECT 
  'RLS Enabled' as test_name,
  CASE WHEN rowsecurity THEN '✅ PASS' ELSE '❌ FAIL' END as result
FROM pg_tables 
WHERE tablename = 'visitor_logs';

-- 1.3 確認索引已建立
SELECT 
  'Indexes Created' as test_name,
  CASE WHEN COUNT(*) = 4 THEN '✅ PASS' ELSE '❌ FAIL' END as result,
  COUNT(*) as actual_count,
  4 as expected_count
FROM pg_indexes 
WHERE tablename = 'visitor_logs';

-- 1.4 確認 RLS 政策已建立
SELECT 
  'RLS Policies Created' as test_name,
  CASE WHEN COUNT(*) = 2 THEN '✅ PASS' ELSE '❌ FAIL' END as result,
  COUNT(*) as actual_count,
  2 as expected_count
FROM pg_policies 
WHERE tablename = 'visitor_logs';

-- ============================================
-- 測試 2: 檢查資料記錄
-- ============================================

-- 2.1 確認有記錄存在
SELECT 
  'Has Records' as test_name,
  CASE WHEN COUNT(*) > 0 THEN '✅ PASS' ELSE '⚠️  WARN - 尚無記錄' END as result,
  COUNT(*) as record_count
FROM visitor_logs;

-- 2.2 檢查最近 5 筆記錄
SELECT 
  TO_CHAR(access_time, 'YYYY-MM-DD HH24:MI:SS') as access_time,
  is_authorized,
  employee_id,
  employee_name,
  employee_role,
  SUBSTRING(page_url, 1, 50) as page_url,
  ip_address
FROM visitor_logs 
ORDER BY access_time DESC 
LIMIT 5;

-- ============================================
-- 測試 3: 資料完整性檢查
-- ============================================

-- 3.1 必填欄位檢查
SELECT 
  'Required Fields' as test_name,
  CASE 
    WHEN SUM(CASE WHEN id IS NULL OR access_time IS NULL OR is_authorized IS NULL THEN 1 ELSE 0 END) = 0 
    THEN '✅ PASS' 
    ELSE '❌ FAIL' 
  END as result,
  COUNT(*) as total_records,
  SUM(CASE WHEN id IS NULL THEN 1 ELSE 0 END) as null_id,
  SUM(CASE WHEN access_time IS NULL THEN 1 ELSE 0 END) as null_access_time,
  SUM(CASE WHEN is_authorized IS NULL THEN 1 ELSE 0 END) as null_is_authorized
FROM visitor_logs;

-- 3.2 已登入記錄的員工資訊完整性
SELECT 
  'Authorized Records Integrity' as test_name,
  CASE 
    WHEN COUNT(*) = 0 THEN '⚠️  WARN - 尚無已登入記錄'
    WHEN SUM(CASE WHEN employee_id IS NULL OR employee_name IS NULL OR employee_role IS NULL THEN 1 ELSE 0 END) = 0 
    THEN '✅ PASS' 
    ELSE '❌ FAIL' 
  END as result,
  COUNT(*) as authorized_records,
  SUM(CASE WHEN employee_id IS NULL THEN 1 ELSE 0 END) as missing_employee_id,
  SUM(CASE WHEN employee_name IS NULL THEN 1 ELSE 0 END) as missing_employee_name,
  SUM(CASE WHEN employee_role IS NULL THEN 1 ELSE 0 END) as missing_employee_role
FROM visitor_logs 
WHERE is_authorized = true;

-- 3.3 未登入記錄的員工資訊應為空
SELECT 
  'Unauthorized Records Integrity' as test_name,
  CASE 
    WHEN COUNT(*) = 0 THEN '⚠️  WARN - 尚無未登入記錄'
    WHEN SUM(CASE WHEN employee_id IS NOT NULL OR employee_name IS NOT NULL OR employee_role IS NOT NULL THEN 1 ELSE 0 END) = 0 
    THEN '✅ PASS' 
    ELSE '❌ FAIL' 
  END as result,
  COUNT(*) as unauthorized_records,
  SUM(CASE WHEN employee_id IS NOT NULL THEN 1 ELSE 0 END) as has_employee_id,
  SUM(CASE WHEN employee_name IS NOT NULL THEN 1 ELSE 0 END) as has_employee_name,
  SUM(CASE WHEN employee_role IS NOT NULL THEN 1 ELSE 0 END) as has_employee_role
FROM visitor_logs 
WHERE is_authorized = false;

-- ============================================
-- 測試 4: 統計資訊
-- ============================================

-- 4.1 訪問統計
SELECT 
  '📊 訪問統計' as category,
  COUNT(*) as total_visits,
  COUNT(DISTINCT employee_id) as unique_employees,
  SUM(CASE WHEN is_authorized THEN 1 ELSE 0 END) as authorized_visits,
  SUM(CASE WHEN NOT is_authorized THEN 1 ELSE 0 END) as unauthorized_visits,
  ROUND(100.0 * SUM(CASE WHEN is_authorized THEN 1 ELSE 0 END) / COUNT(*), 2) as authorized_percentage
FROM visitor_logs;

-- 4.2 角色分布
SELECT 
  '👥 角色分布' as category,
  COALESCE(employee_role, 'Unauthorized') as role,
  COUNT(*) as visit_count,
  COUNT(DISTINCT employee_id) as unique_users,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
FROM visitor_logs 
GROUP BY employee_role 
ORDER BY visit_count DESC;

-- 4.3 IP 查詢成功率
SELECT 
  '🌐 IP 查詢成功率' as category,
  COUNT(*) as total_records,
  SUM(CASE WHEN ip_address IS NOT NULL THEN 1 ELSE 0 END) as has_ip,
  SUM(CASE WHEN ip_address IS NULL THEN 1 ELSE 0 END) as missing_ip,
  ROUND(100.0 * SUM(CASE WHEN ip_address IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
FROM visitor_logs;

-- 4.4 最常訪問的頁面
SELECT 
  '📄 最常訪問頁面 (Top 5)' as category,
  SUBSTRING(page_url, 1, 60) as page_url,
  COUNT(*) as visit_count,
  COUNT(DISTINCT employee_id) as unique_visitors
FROM visitor_logs 
GROUP BY page_url 
ORDER BY visit_count DESC 
LIMIT 5;

-- ============================================
-- 測試結果摘要
-- ============================================

SELECT 
  '
  ============================================
  測試完成！
  ============================================
  
  ✅ = 通過
  ❌ = 失敗
  ⚠️  = 警告（可能需要更多測試資料）
  
  請檢查上方所有測試結果。
  如有 ❌ 或 ⚠️，請參考 VISITOR_LOGS_TEST_PLAN.md 進行詳細測試。
  ============================================
  ' as summary;
