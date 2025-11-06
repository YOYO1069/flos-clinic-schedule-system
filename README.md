# FLOS曜診所排班系統

獨立的排班管理系統,用於管理醫師和員工的排班。

## 功能特色

- 👨‍⚕️ 醫師排班管理 (12位醫師)
- 👥 員工排班管理 (14位員工)
- 👤 人員管理 (新增/編輯/刪除)
- 📅 月曆排班表輸出
- ⚠️ 排班衝突自動檢測
- 📊 排班統計與報表

## 技術棧

- React 18
- Vite
- Tailwind CSS
- Supabase
- shadcn/ui

## 環境變數

需要設定以下環境變數:

```
VITE_SUPABASE_URL=你的Supabase URL
VITE_SUPABASE_ANON_KEY=你的Supabase Anon Key
```

## 安裝與運行

```bash
# 安裝依賴
pnpm install

# 開發模式
pnpm run dev

# 構建生產版本
pnpm run build

# 預覽生產版本
pnpm run preview
```

## 資料庫設定

1. 在Supabase中執行 `database_schedule_tables.sql`
2. 確認資料表已建立:
   - doctors (12位醫師)
   - staff (14位員工)
   - doctor_schedules
   - staff_schedules

## 部署

本專案部署在 Netlify:
https://effulgent-dasik-9e082a.netlify.app

## 營業時間

- 週一～週五：12:00–20:30
- 週六：10:30–19:00
- 週日：休診（含國定假日）
