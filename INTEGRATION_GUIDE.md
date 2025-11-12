# FLOS 曜診所排班與考勤管理系統 - 整合說明文件

## 專案概述

本專案在原有的排班系統基礎上,整合了完整的考勤管理功能,包括員工打卡、請假管理、加班管理、薪資計算等模組。系統使用 Supabase 作為資料庫,部署到 Netlify,可與後台系統 (https://classy-biscotti-42a418.netlify.app/) 進行整合。

## 技術架構

### 前端技術棧
- **框架**: React 19.2.0 + TypeScript
- **建置工具**: Vite 7.1.9
- **UI 框架**: Tailwind CSS 4 + Shadcn/ui
- **路由**: Wouter 3.7.1
- **日期處理**: date-fns 4.1.0
- **圖示**: Lucide React

### 後端技術棧
- **資料庫**: Supabase (PostgreSQL 17)
- **ORM**: Supabase JavaScript Client
- **認證**: Supabase Auth
- **即時更新**: Supabase Realtime

### 部署配置
- **託管平台**: Netlify
- **GitHub 儲存庫**: YOYO1069/flos-clinic-schedule-system
- **自動部署**: GitHub main 分支推送自動觸發
- **建置命令**: `npm run build`
- **發布目錄**: `dist`

## 資料庫結構

### 1. employees (員工資料表)
已存在於 Supabase,由員工福利系統建立。

### 2. attendance_records (打卡記錄表)
```sql
- id: BIGSERIAL PRIMARY KEY
- employee_id: INTEGER (外鍵 → employees)
- check_in_time: TIMESTAMP WITH TIME ZONE
- check_out_time: TIMESTAMP WITH TIME ZONE
- check_in_location_lat/lng: DECIMAL (GPS 座標)
- check_out_location_lat/lng: DECIMAL (GPS 座標)
- status: VARCHAR(20) (normal/late/early_leave/absent/overtime)
- work_hours: DECIMAL(5,2)
- notes: TEXT
- created_at, updated_at: TIMESTAMP
```

### 3. leave_requests (請假申請表)
```sql
- id: BIGSERIAL PRIMARY KEY
- employee_id: INTEGER (外鍵 → employees)
- leave_type: VARCHAR(50) (annual/sick/personal/marriage/maternity/paternity/bereavement/other)
- start_date, end_date: DATE
- days: DECIMAL(3,1)
- reason: TEXT
- status: VARCHAR(20) (pending/approved/rejected/cancelled)
- approved_by: INTEGER (外鍵 → employees)
- approved_at: TIMESTAMP
- rejection_reason: TEXT
- created_at, updated_at: TIMESTAMP
```

### 4. overtime_requests (加班申請表)
```sql
- id: BIGSERIAL PRIMARY KEY
- employee_id: INTEGER (外鍵 → employees)
- overtime_date: DATE
- start_time, end_time: TIME
- hours: DECIMAL(4,2)
- reason: TEXT
- status: VARCHAR(20) (pending/approved/rejected/cancelled)
- approved_by: INTEGER (外鍵 → employees)
- approved_at: TIMESTAMP
- rejection_reason: TEXT
- created_at, updated_at: TIMESTAMP
```

### 5. salary_records (薪資記錄表)
```sql
- id: BIGSERIAL PRIMARY KEY
- employee_id: INTEGER (外鍵 → employees)
- month: VARCHAR(7) (格式: YYYY-MM)
- base_salary: DECIMAL(10,2)
- overtime_pay: DECIMAL(10,2)
- bonus: DECIMAL(10,2)
- deductions: DECIMAL(10,2)
- total_salary: DECIMAL(10,2)
- work_days: INTEGER
- overtime_hours: DECIMAL(5,2)
- leave_days: DECIMAL(4,1)
- notes: TEXT
- created_at, updated_at: TIMESTAMP
```

### 6. attendance_settings (考勤設定表)
```sql
- id: BIGSERIAL PRIMARY KEY
- setting_key: VARCHAR(100) UNIQUE
- setting_value: TEXT
- description: TEXT
- created_at, updated_at: TIMESTAMP
```

## 部署步驟

### 步驟 1: 建立 Supabase 資料表

1. 登入 Supabase Dashboard
   - 網址: https://supabase.com/dashboard/project/clzjdlykhjwrlksyjlfz

2. 開啟 SQL Editor
   - 點選左側選單的 "SQL Editor"

3. 執行資料庫遷移檔案
   - 複製 `attendance_migration.sql` 的完整內容
   - 貼上到 SQL Editor 並執行
   - 確認所有資料表建立成功

### 步驟 2: 部署到 Netlify

**選項 A: 透過 GitHub 自動部署 (推薦)**

1. 推送程式碼到 GitHub
   ```bash
   cd /home/ubuntu/flos-clinic-schedule-system
   git add .
   git commit -m "feat: 整合考勤管理系統"
   git push origin main
   ```

2. Netlify 會自動偵測到推送並開始建置
   - 建置命令: `npm run build`
   - 發布目錄: `dist`

3. 等待建置完成,取得部署網址

**選項 B: 手動部署**

1. 本地建置專案
   ```bash
   cd /home/ubuntu/flos-clinic-schedule-system
   npm run build
   ```

2. 登入 Netlify Dashboard
   - 拖放 `dist` 資料夾到 Netlify 進行部署

### 步驟 3: 與後台系統整合

在後台系統 (https://classy-biscotti-42a418.netlify.app/) 中加入考勤系統連結:

1. 在「員工專區」標籤中加入「考勤管理」卡片
2. 連結指向 Netlify 部署的網址
3. 建議加入「返回後台」按鈕在考勤系統的導航列

## 功能模組說明

### 1. 排班管理 (原有功能)
- 路徑: `/`
- 功能: 醫師與員工排班管理
- 特色: 月曆視圖、ON/OFF 切換、週日自動休診

### 2. 員工打卡系統
- 路徑: `/attendance`
- 功能:
  - GPS 定位打卡
  - 上下班打卡記錄
  - 自動計算工作時數
  - 打卡歷史查詢
- 特色: 即時定位、自動狀態判定

### 3. 請假管理系統
- 路徑: `/leave`
- 功能:
  - 線上請假申請
  - 請假記錄查詢
  - 主管審核介面
  - 請假天數自動計算
- 支援假別: 年假、病假、事假、婚假、產假、陪產假、喪假、其他

### 4. 加班管理系統 (待開發)
- 加班申請與審核
- 加班時數統計
- 加班費自動計算

### 5. 薪資計算系統 (待開發)
- 自動計算月薪
- 薪資明細查詢
- 薪資報表匯出

## 環境變數配置

系統已內建 Supabase 連接資訊,無需額外配置環境變數。

```javascript
// client/src/lib/supabase.ts
const supabaseUrl = 'https://clzjdlykhjwrlksyjlfz.supabase.co'
const supabaseAnonKey = 'eyJhbGci...' // 已配置
```

## 安全性考量

### Row Level Security (RLS)
所有考勤相關資料表都已啟用 RLS,並配置了基本的存取政策:
- 允許所有使用者讀取資料
- 允許所有使用者新增、更新、刪除資料

**建議**: 在正式環境中,應根據員工角色設定更嚴格的存取權限。

### GPS 定位隱私
- 定位資料僅用於打卡驗證
- 不會持續追蹤員工位置
- 僅在打卡時記錄一次座標

## 測試建議

### 功能測試清單
- [ ] 員工打卡功能 (上班/下班)
- [ ] GPS 定位是否正常運作
- [ ] 請假申請流程
- [ ] 請假記錄查詢
- [ ] 排班系統是否不受影響
- [ ] 資料庫讀寫是否正常
- [ ] 頁面路由切換

### 資料庫測試
```sql
-- 測試查詢打卡記錄
SELECT * FROM attendance_records ORDER BY created_at DESC LIMIT 10;

-- 測試查詢請假記錄
SELECT * FROM leave_requests ORDER BY created_at DESC LIMIT 10;

-- 測試查詢考勤設定
SELECT * FROM attendance_settings;
```

## 後續擴充建議

### 短期優化
1. 加入員工認證系統 (目前使用模擬 ID)
2. 實作加班管理功能
3. 實作薪資計算功能
4. 加入出勤統計報表與圖表

### 中期規劃
1. 整合 LINE 通知 (請假審核、打卡提醒)
2. 加入主管審核介面
3. 實作權限管理系統
4. 加入異常出勤自動偵測

### 長期規劃
1. 開發手機 APP 版本
2. 整合薪資系統
3. 加入 AI 排班建議
4. 實作多層級審核流程

## 聯絡資訊

- **GitHub**: YOYO1069/flos-clinic-schedule-system
- **Supabase 專案**: clzjdlykhjwrlksyjlfz
- **後台系統**: https://classy-biscotti-42a418.netlify.app/

## 版本歷史

- **v1.0.0** (2025-11-12): 初始版本,整合排班與考勤管理系統
  - 員工打卡系統
  - 請假管理系統
  - 資料庫架構設計
  - Netlify 部署配置
