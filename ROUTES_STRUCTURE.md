# FLOS 診所排班系統 - 完整路由結構

## 🏠 主要路由

### 1. **首頁 Dashboard** - `/`
- **檔案**: `Dashboard.tsx`
- **功能**: 系統主入口,顯示功能卡片
- **權限**: 所有登入用戶
- **內容**:
  - 返回主網站按鈕 (→ https://classy-biscotti-42a418.netlify.app/)
  - 醫師排班卡片 (→ `/doctor-schedule`)
  - 員工排班卡片 (→ `/leave-calendar`) - 僅主管以上可見
  - 近期值班醫師預覽

---

## 👤 登入系統

### 2. **登入頁面** - `/login`
- **檔案**: `Login.tsx`
- **功能**: 用戶登入
- **權限**: 公開
- **支援角色**:
  - 🔴 管理者 (admin)
  - 🟠 高階主管 (senior_supervisor)
  - 🟡 一般主管 (supervisor)
  - 🟢 員工 (staff)

---

## 👨‍⚕️ 醫師排班系統

### 3. **醫師排班** - `/doctor-schedule`
- **檔案**: `DoctorSchedule.tsx`
- **功能**: 醫師值班管理
- **權限**: 主管以上 (supervisor, senior_supervisor, admin)
- **資料庫**: clzjdlykhjwrlksyjlfz (doctor_shift_schedules 表)
- **資料範圍**: 2025 年 11 月、12 月、2026 年 1 月 (共 144 筆)
- **功能**:
  - 月曆檢視
  - 新增/編輯/刪除排班
  - 匯出 Excel/PDF
  - 清空所有排班 (有確認對話框)

---

## 👥 員工系統

### 4. **員工休假月曆** - `/leave-calendar`
- **檔案**: `LeaveCalendar.tsx`
- **功能**: 員工休假排班管理
- **權限**: 主管以上 (supervisor, senior_supervisor, admin)
- **資料庫**: pizzpwesrbulfjylejlu (flos_schedules 表)
- **功能**:
  - 月曆檢視 (顯示所有員工)
  - 點擊日期標記 OFF (休假)
  - 匯出 Excel/PDF
  - 圖片辨識匯入
  - 導航按鈕:
    - 醫師排班
    - 員工打卡
    - 請假管理
    - 審核請假 (主管以上)

### 5. **員工排班 (舊版)** - `/schedule`
- **檔案**: `Home.tsx`
- **功能**: 舊版員工排班介面 (有打卡快捷按鈕)
- **權限**: 主管以上
- **功能**:
  - 醫師排班
  - 員工排班
  - 休假月曆
  - 員工打卡
  - 請假管理
  - 請假審核 (主管以上)

### 6. **員工打卡** - `/attendance`
- **檔案**: `Attendance.tsx`
- **功能**: 員工上下班打卡
- **權限**: 所有登入用戶
- **資料庫**: pizzpwesrbulfjylejlu (attendance_records 表)
- **功能**:
  - 上班打卡
  - 下班打卡
  - 查看今日打卡記錄
  - 查看歷史打卡記錄

### 7. **請假管理** - `/leave`
- **檔案**: `LeaveManagement.tsx`
- **功能**: 員工請假申請
- **權限**: 所有登入用戶
- **資料庫**: pizzpwesrbulfjylejlu (leave_requests 表)
- **功能**:
  - 提交請假申請
  - 查看自己的請假記錄
  - 查看請假狀態 (待審核/已批准/已拒絕)

### 8. **請假審核** - `/approval`
- **檔案**: `LeaveApproval.tsx`
- **功能**: 主管審核員工請假
- **權限**: 主管以上 (supervisor, senior_supervisor, admin)
- **資料庫**: pizzpwesrbulfjylejlu (leave_requests 表)
- **功能**:
  - 查看待審核請假
  - 批准/拒絕請假
  - 查看已審核記錄
  - **注意**: 不顯示職稱,只顯示姓名

---

## 🔧 管理功能

### 9. **管理者主控台** - `/admin`
- **檔案**: `AdminPanel.tsx`
- **功能**: 管理者專屬功能
- **權限**: 僅管理者 (admin)
- **功能**:
  - 查看所有用戶密碼
  - 修改用戶密碼
  - 管理診所配置
  - 系統設定

### 10. **員工管理** - `/staff-management`
- **檔案**: `StaffManagement.tsx`
- **功能**: 管理員工名單
- **權限**: 管理者 (admin)
- **功能**:
  - 新增/編輯/刪除員工
  - 管理員工順序

### 11. **修改密碼** - `/change-password`
- **檔案**: `ChangePassword.tsx`
- **功能**: 用戶修改自己的密碼
- **權限**: 所有登入用戶
- **功能**:
  - 輸入舊密碼
  - 設定新密碼

---

## 📅 其他排班頁面

### 12. **月曆排班 (舊版)** - `/calendar`
- **檔案**: `CalendarSchedule.tsx`
- **功能**: 舊版月曆排班介面
- **權限**: 主管以上
- **狀態**: 可能已棄用

### 13. **員工休假 (別名)** - `/staff-leave`
- **檔案**: `LeaveCalendar.tsx`
- **功能**: 與 `/leave-calendar` 相同
- **權限**: 主管以上
- **說明**: 重複路由,指向同一個組件

---

## 🧪 測試頁面

### 14. **環境測試** - `/test-env`
- **檔案**: `TestEnv.tsx`
- **功能**: 測試環境變數
- **權限**: 公開 (開發用)

### 15. **資料庫測試** - `/test-db`
- **檔案**: `TestDB.tsx`
- **功能**: 測試兩個 Supabase 資料庫連線
- **權限**: 公開 (開發用)
- **顯示內容**:
  - 醫師排班資料庫連線狀態 (clzjdlykhjwrlksyjlfz)
  - 員工系統資料庫連線狀態 (pizzpwesrbulfjylejlu)
  - 資料筆數統計

---

## ❌ 錯誤頁面

### 16. **404 頁面** - `/404` 或任何未定義路由
- **檔案**: `NotFound.tsx`
- **功能**: 顯示 404 錯誤
- **權限**: 公開

---

## 📊 路由權限總覽

### 🔴 管理者 (admin) - 16 個路由
- ✅ 所有頁面

### 🟠 高階主管 (senior_supervisor) - 13 個路由
- ✅ 首頁、登入、醫師排班、員工休假月曆、員工排班、員工打卡、請假管理、請假審核、修改密碼
- ❌ 管理者主控台、員工管理

### 🟡 一般主管 (supervisor) - 13 個路由
- ✅ 首頁、登入、醫師排班、員工休假月曆、員工排班、員工打卡、請假管理、請假審核、修改密碼
- ❌ 管理者主控台、員工管理

### 🟢 員工 (staff) - 5 個路由
- ✅ 首頁 (僅顯示醫師排班卡片)、登入、員工打卡、請假管理、修改密碼
- ❌ 醫師排班、員工休假月曆、員工排班、請假審核、管理功能

---

## 🗺️ 路由導航流程

```
登入 (/login)
    ↓
首頁 Dashboard (/)
    ├─→ 醫師排班 (/doctor-schedule) [主管以上]
    │       └─→ 返回首頁
    │
    ├─→ 員工排班 (/leave-calendar) [主管以上]
    │       ├─→ 醫師排班
    │       ├─→ 員工打卡
    │       ├─→ 請假管理
    │       └─→ 審核請假 [主管以上]
    │
    └─→ 返回主網站 (https://classy-biscotti-42a418.netlify.app/)

員工打卡 (/attendance) [所有用戶]
    └─→ 返回首頁

請假管理 (/leave) [所有用戶]
    └─→ 返回首頁

請假審核 (/approval) [主管以上]
    ├─→ 返回首頁
    └─→ 打卡快捷按鈕

管理者主控台 (/admin) [僅管理者]
    └─→ 返回首頁
```

---

## 📝 資料庫對應

### 醫師排班資料庫 (clzjdlykhjwrlksyjlfz.supabase.co)
- **表**: `doctor_shift_schedules`
- **使用頁面**: `/doctor-schedule`
- **資料量**: 144 筆 (11月 35筆 + 12月 56筆 + 1月 53筆)

### 員工系統資料庫 (pizzpwesrbulfjylejlu.supabase.co)
- **表**:
  - `users` (16 筆用戶)
  - `attendance_records` (打卡記錄)
  - `leave_requests` (請假申請)
  - `flos_schedules` (員工排班)
  - `staff_members` (員工名單)
- **使用頁面**: 
  - `/attendance` (打卡)
  - `/leave` (請假)
  - `/approval` (審核)
  - `/leave-calendar` (員工休假月曆)
  - `/schedule` (員工排班)
  - `/admin` (管理者主控台)

---

## 🔗 外部連結

- **主網站**: https://classy-biscotti-42a418.netlify.app/
- **排班系統**: https://effulgent-dasik-9e082a.netlify.app/
- **GitHub**: https://github.com/YOYO1069/flos-clinic-schedule-system
