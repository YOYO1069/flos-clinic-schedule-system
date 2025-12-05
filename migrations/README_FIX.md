# 資料庫修正說明

## 問題

系統出現以下錯誤：
1. `Could not find the 'employment_status' column of 'users' in the schema cache`
2. `Could not find the 'days' column of 'leave_requests' in the schema cache`

## 解決方案

請在 Supabase Dashboard 執行 `fix_missing_columns.sql` 中的 SQL 語句。

## 執行步驟

1. 登入 Supabase Dashboard: https://supabase.com/dashboard
2. 選擇您的專案
3. 點擊左側選單的「SQL Editor」
4. 點擊「New query」
5. 複製 `fix_missing_columns.sql` 的內容
6. 貼上並執行
7. 確認執行成功

## 修正內容

### users 表
- 新增 `position` 欄位（職位）
- 新增 `phone` 欄位（聯絡電話）
- 新增 `employment_status` 欄位（在職狀態）
- 新增 `resignation_date` 欄位（離職日期）

### leave_requests 表
- 建立完整的請假申請表
- 包含所有必要欄位
- 建立索引提升查詢效能

### schedules 表
- 建立完整的排班表
- 包含所有必要欄位
- 建立索引提升查詢效能

## 執行後

執行 SQL 後，系統的所有功能應該可以正常運作：
- ✅ 員工編輯功能可以儲存
- ✅ 請假管理功能可以正常使用
- ✅ 班表管理功能可以正常使用
