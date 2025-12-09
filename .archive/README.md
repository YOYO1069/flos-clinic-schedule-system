# 📦 FLOS 排班系統 - 備份與版本管理

## 🎯 目錄用途

此目錄（`.archive/`）用於保存系統架構變更過程中的所有重要資訊，確保：

1. ✅ **可追溯性** - 記錄所有重大變更
2. ✅ **可回滾性** - 保留原始實作，隨時可恢復
3. ✅ **知識傳承** - 文件化決策過程和技術選型
4. ✅ **多版本並存** - 支援不同部署方案

---

## 📁 目錄結構

```
.archive/
├── README.md                          # 本文件
├── ARCHITECTURE_CHANGELOG.md          # 架構變更詳細日誌
├── IMPLEMENTATION_COMPARISON.md       # 兩種架構完整對比
├── implementations/                   # 實作程式碼備份
│   ├── trpc-backend/                 # tRPC 後端架構
│   │   ├── server/                   # 後端伺服器程式碼
│   │   ├── Login.tsx.backup          # 原始登入頁面
│   │   └── Home.tsx.backup           # 原始首頁
│   └── supabase-direct/              # 純 Supabase 架構（當前）
│       ├── crypto.ts                 # 瀏覽器密碼工具
│       ├── Login.tsx                 # Supabase 登入頁面
│       ├── Home.tsx                  # Supabase 首頁
│       └── LeaveManagement.tsx       # 請假管理頁面
└── migration-logs/                    # 遷移日誌
    ├── password_migration.log        # 密碼格式轉換日誌
    └── database_changes.log          # 資料庫結構變更
```

---

## 📋 快速導航

### 我想了解...

**🔍 為什麼要改架構？**
→ 閱讀 [ARCHITECTURE_CHANGELOG.md](./ARCHITECTURE_CHANGELOG.md) 的「變更原因」章節

**⚖️ 兩種架構有什麼差別？**
→ 閱讀 [IMPLEMENTATION_COMPARISON.md](./IMPLEMENTATION_COMPARISON.md)

**🔙 如何回滾到舊版本？**
→ 參考本文件的「回滾指南」章節

**🚀 如何部署 tRPC 後端版本？**
→ 閱讀 `/tmp/RAILWAY_DEPLOYMENT_GUIDE.md`

**🔐 密碼安全性如何改進？**
→ 閱讀 [IMPLEMENTATION_COMPARISON.md](./IMPLEMENTATION_COMPARISON.md) 的「安全性改進建議」章節

---

## 🔄 版本切換指南

### 當前版本：純 Supabase 架構

**特點：**
- ✅ 零成本部署在 Netlify
- ✅ 自動部署（推送即可）
- ⚠️ 密碼使用 SHA-256（可改進為 PBKDF2）

**檔案位置：**
- `client/src/lib/crypto.ts`
- `client/src/pages/Login.tsx`
- `client/src/pages/Home.tsx`
- `client/src/pages/LeaveManagement.tsx`

---

### 切換到 tRPC 後端架構

**步驟 1：恢復原始檔案**

```bash
# 從備份恢復
cp .archive/implementations/trpc-backend/Login.tsx.backup client/src/pages/Login.tsx
cp .archive/implementations/trpc-backend/Home.tsx.backup client/src/pages/Home.tsx

# 移除 Supabase 專用檔案
rm client/src/lib/crypto.ts
```

**步驟 2：部署後端**

參考 `/tmp/RAILWAY_DEPLOYMENT_GUIDE.md` 部署 Node.js 後端到 Railway

**步驟 3：更新前端 API 端點**

```typescript
// client/src/lib/trpc.ts
const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'https://your-railway-app.up.railway.app/api/trpc',
    }),
  ],
});
```

**步驟 4：轉換密碼格式**

```bash
# 將 SHA-256 密碼轉換回 bcrypt
# 需要執行密碼重置或要求使用者重新設定密碼
```

**步驟 5：推送並部署**

```bash
git add -A
git commit -m "chore: 切換到 tRPC 後端架構"
git push origin main
```

---

## 🔙 回滾指南

### 緊急回滾（出現嚴重問題）

**方法 1：Git 回滾**

```bash
# 查看提交歷史
git log --oneline

# 回滾到特定提交
git reset --hard <commit-hash>

# 強制推送（注意：會覆蓋遠端）
git push origin main --force
```

**方法 2：從備份恢復**

```bash
# 恢復特定檔案
git checkout <commit-hash> -- client/src/pages/Login.tsx

# 提交變更
git add client/src/pages/Login.tsx
git commit -m "revert: 恢復登入頁面到舊版本"
git push origin main
```

---

## 📝 變更記錄模板

當進行重大變更時，請在 `ARCHITECTURE_CHANGELOG.md` 中新增記錄：

```markdown
## 📅 YYYY-MM-DD - 變更標題

### 🎯 變更原因
說明為什麼要做這個變更...

### 🔄 主要變更
列出所有重要的程式碼變更...

### 📦 備份位置
說明備份檔案的位置...

### 🔙 回滾方案
說明如何回滾此變更...
```

---

## 🛡️ 最佳實踐

### 1. 變更前必做

- [ ] 閱讀相關文件
- [ ] 備份當前實作
- [ ] 記錄變更原因
- [ ] 建立測試計畫

### 2. 變更中必做

- [ ] 逐步進行，不要一次改太多
- [ ] 每個階段都提交 Git
- [ ] 記錄遇到的問題和解決方法
- [ ] 保留原始程式碼的註解

### 3. 變更後必做

- [ ] 完整測試所有功能
- [ ] 更新文件
- [ ] 記錄變更日誌
- [ ] 通知相關人員

---

## 🔐 安全性注意事項

### ⚠️ 不要提交到 Git 的內容

```bash
# .gitignore 應包含
.env
.env.local
*.log
node_modules/
dist/
```

### ✅ 可以提交的內容

- 程式碼（不含密鑰）
- 文件
- 配置範例（`.env.example`）
- 備份檔案（`.archive/`）

---

## 📞 需要協助？

### 常見問題

**Q: 密碼格式轉換後無法登入？**
A: 檢查資料庫中的密碼是否已正確轉換為 SHA-256 格式（64 字元十六進位字串）

**Q: Netlify 部署失敗？**
A: 檢查 `netlify.toml` 配置和建置指令是否正確

**Q: 想要更高的密碼安全性？**
A: 參考 `IMPLEMENTATION_COMPARISON.md` 中的 PBKDF2 實作

**Q: 如何監控系統運作？**
A: 使用 Netlify 的部署日誌和 Supabase 的查詢日誌

---

## 📚 延伸閱讀

- [Supabase 官方文件](https://supabase.com/docs)
- [Netlify 部署指南](https://docs.netlify.com/)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [OWASP 安全最佳實踐](https://owasp.org/www-project-top-ten/)

---

**維護者：** FLOS 開發團隊  
**最後更新：** 2025-12-08  
**版本：** 1.0
