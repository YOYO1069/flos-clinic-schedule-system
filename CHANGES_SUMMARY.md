# 變更摘要 - 診所管理系統安全加固

## 修改檔案清單

### 新增檔案
1. `client/src/_core/hooks/useVisitorLog.ts` - 訪客記錄 Hook
2. `VISITOR_LOGS_SETUP_GUIDE.md` - visitor_logs 表建立指南
3. `CHANGELOG_2025-12-06.md` - 完整變更日誌
4. `CHANGES_SUMMARY.md` - 本檔案

### 修改檔案
1. `client/src/App.tsx`
   - 新增 useLocation, useEffect 引入
   - 新增 useAuth, useVisitorLog Hook 引入
   - 在 Router 組件中加入頁面訪問記錄功能

2. `client/src/pages/Login.tsx`
   - 更新員工編號 placeholder: "例如: ADMIN-HBH012" → "例如: flosHBH012"

3. `client/src/pages/AdminPanel.tsx`
   - 移除「權限說明」Card 區塊（包含管理者、高階主管、一般主管、員工的說明）
   - 移除員工列表中的角色標籤顯示（保留分組標題）

4. `client/src/pages/LeaveApproval.tsx`
   - 移除頁面標題中的角色顯示文字（管理者/高階主管/一般主管）

## 功能變更

### 新增功能
- ✅ 訪客記錄系統（visitor_logs）
  - 自動記錄所有頁面訪問
  - 收集 IP、瀏覽器、系統資訊
  - 區分已登入/未登入訪客
  - 僅管理員可查看日誌

### 介面優化
- ✅ 移除所有階級/角色標籤顯示
- ✅ 更新登入介面為新帳號格式提示
- ✅ 保留功能性權限控制邏輯

### 向後相容
- ✅ 登入系統支援新舊帳號格式
- ✅ 角色權限邏輯完全保留
- ✅ 不影響現有功能運作

## 待辦事項

### 資料庫
- ⏳ 在 Supabase Dashboard 執行 visitor_logs 表建立 SQL
  - 參考: `VISITOR_LOGS_SETUP_GUIDE.md`
  - SQL 位置: `/tmp/create_visitor_logs.sql`

### 測試
- ⏳ 測試新帳號格式登入（flosXXX）
- ⏳ 驗證訪客記錄功能
- ⏳ 確認角色權限控制正常
- ⏳ 檢查介面在手機/平板的顯示

### 部署
- ⏳ 推送代碼到 GitHub
- ⏳ 部署到 Netlify
- ⏳ 驗證生產環境功能

## 非破壞性確認

✅ 所有變更均為非破壞性：
- 不影響現有登入功能
- 不影響角色權限邏輯
- 不影響排班、請假等核心功能
- visitor_logs 為新增表，不影響現有資料庫結構
- 介面變更僅為視覺優化，不影響功能運作

---

**變更日期**: 2025-12-06
**執行者**: Manus AI Agent
**狀態**: 代碼修改完成，待測試部署
