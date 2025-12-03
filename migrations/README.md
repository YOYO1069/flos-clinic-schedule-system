# 資料庫遷移說明

## 如何執行 add_staff_fields.sql

### 方法 1: 使用 Supabase Dashboard（推薦）

1. 訪問 [Supabase Dashboard](https://supabase.com/dashboard)
2. 選擇您的專案
3. 點擊左側選單的 "SQL Editor"
4. 建立新查詢
5. 複製 `add_staff_fields.sql` 的內容並貼上
6. 點擊 "Run" 執行

### 方法 2: 使用 psql 命令列

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres" -f add_staff_fields.sql
```

## 新增的欄位

- `phone` (VARCHAR(20)): 員工聯絡電話
- `employment_status` (VARCHAR(20)): 在職狀態（在職、試用期、留職停薪、離職）
- `resignation_date` (DATE): 離職日期

## 注意事項

- `position` 欄位已經存在，不需要額外新增
- 所有現有員工的 `employment_status` 會自動設定為「在職」
- 執行前請先備份資料庫
