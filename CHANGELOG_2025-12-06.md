# 變更日誌 - 2025-12-06

## 安全加固與介面優化

### 🔒 安全性更新

#### 1. Visitor Logs 訪客記錄系統
- **新增功能**: 實作訪客日誌記錄系統
- **資料表**: `visitor_logs`（需在 Supabase 手動建立）
- **記錄內容**:
  - IP 位址
  - 瀏覽器資訊（User Agent）
  - 訪問頁面 URL
  - 來源頁面（Referrer）
  - 螢幕解析度
  - 瀏覽器語言
  - 作業系統平台
  - 訪問時間
  - 登入狀態（是否已認證）
  - 員工資訊（編號、姓名、角色）

- **安全政策**:
  - 啟用 Row Level Security (RLS)
  - 所有訪客（包含未登入）可插入記錄
  - 僅管理員（role = 'admin'）可查看日誌
  - 建立索引優化查詢效能

- **前端實作**:
  - 新增 `useVisitorLog` Hook
  - 在 App.tsx 中自動記錄所有頁面訪問
  - 登入時記錄員工資訊
  - 未登入時記錄為匿名訪客

#### 2. 員工帳號格式更新
- **舊格式**: ADMIN-XXX, SUPER-XXX, STAFF-XXX
- **新格式**: flosXXX（例如：flosHBH012）
- **登入介面**: 更新 placeholder 範例為新格式
- **向後相容**: 系統同時支援新舊格式登入

### 🎨 介面優化

#### 1. 移除階級顯示標籤
- **移除位置**:
  - AdminPanel.tsx: 移除角色說明區塊（管理者、高階主管、一般主管、員工）
  - LeaveApproval.tsx: 移除頁面標題中的角色顯示
  - 其他頁面: 保留功能性角色判斷，僅移除視覺標籤

- **保留功能**:
  - 角色權限控制邏輯維持不變
  - 管理員/主管審核權限正常運作
  - 資料存取控制不受影響

#### 2. 登入介面更新
- **更新內容**:
  - Placeholder 文字從 "例如: ADMIN-HBH012" 改為 "例如: flosHBH012"
  - 保持原有登入邏輯和驗證機制

### 📁 新增檔案

1. **VISITOR_LOGS_SETUP_GUIDE.md**
   - 完整的 visitor_logs 表建立指南
   - 包含 SQL 腳本和驗證步驟
   - 提供兩種建立方式（SQL Editor 和 Table Editor）

2. **CHANGELOG_2025-12-06.md**
   - 本次更新的完整變更記錄
   - 包含所有修改的檔案清單

3. **client/src/_core/hooks/useVisitorLog.ts**
   - 訪客記錄 Hook
   - 自動收集瀏覽器和系統資訊
   - 整合登入狀態

### 🔧 修改檔案清單

#### 前端組件
1. **client/src/App.tsx**
   - 新增 useVisitorLog Hook 使用
   - 在路由變更時自動記錄訪客

2. **client/src/pages/Login.tsx**
   - 更新員工編號 placeholder
   - 登入成功後記錄訪客資訊

3. **client/src/pages/AdminPanel.tsx**
   - 移除角色說明區塊（🔴 管理者、🟠 高階主管、🟡 一般主管、🟢 員工）
   - 保留功能性權限控制

4. **client/src/pages/LeaveApproval.tsx**
   - 移除頁面標題中的角色顯示
   - 保留審核權限邏輯

### ⚠️ 待完成事項

1. **Supabase 資料表建立**
   - 需在 Supabase Dashboard 手動執行 SQL
   - 參考: VISITOR_LOGS_SETUP_GUIDE.md
   - SQL 腳本位置: /tmp/create_visitor_logs.sql

2. **測試驗證**
   - 測試新帳號格式登入（flosXXX）
   - 驗證訪客記錄功能
   - 確認角色權限控制正常

3. **部署**
   - 推送代碼到 GitHub
   - 部署到 Netlify
   - 驗證生產環境功能

### 🔍 影響評估

#### 非破壞性變更
- ✅ 所有變更不影響現有功能
- ✅ 登入系統向後相容
- ✅ 角色權限邏輯維持不變
- ✅ 資料庫結構不受影響（visitor_logs 為新增表）

#### 使用者體驗
- ✅ 介面更簡潔（移除階級標籤）
- ✅ 登入提示更新為新格式
- ✅ 新增訪客追蹤功能（對使用者透明）

### 📊 技術細節

#### 資料庫
- **專案**: duolaiyuanmeng (pizzpwesrbulfjylejlu)
- **新增表**: visitor_logs
- **索引**: 4 個（access_time, ip_address, employee_id, is_authorized）
- **RLS 政策**: 2 個（INSERT 所有人, SELECT 僅管理員）

#### 前端
- **框架**: React + TypeScript
- **狀態管理**: useAuth Hook
- **新增 Hook**: useVisitorLog
- **路由**: wouter

#### 部署
- **平台**: Netlify
- **網址**: https://classy-biscotti-42a418.netlify.app
- **GitHub**: YOYO1069/flos-clinic-schedule-system

---

**變更日期**: 2025-12-06  
**執行者**: Manus AI Agent  
**審核狀態**: 待測試驗證  
**部署狀態**: 待部署
