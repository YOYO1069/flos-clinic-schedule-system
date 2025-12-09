# 實作方案對比與選擇指南

## 📊 兩種架構完整對比

### 架構 A：tRPC 後端架構（原始設計）

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   前端      │      │   後端      │      │  資料庫     │
│  (Netlify)  │─────▶│  (Railway)  │─────▶│ (Supabase)  │
│   React     │ HTTP │   Express   │ SQL  │ PostgreSQL  │
│   tRPC      │      │   tRPC      │      │             │
└─────────────┘      └─────────────┘      └─────────────┘
```

**技術棧：**
- 前端：React + Vite + tRPC Client
- 後端：Node.js + Express + tRPC Server
- 資料庫：Supabase PostgreSQL
- 密碼：bcrypt (10 rounds)

**優點：**
- ✅ **高安全性** - bcrypt 是業界標準，抗暴力破解
- ✅ **業務邏輯保護** - 重要邏輯在後端，前端無法檢視
- ✅ **類型安全** - tRPC 提供端到端類型檢查
- ✅ **可擴展性** - 易於新增複雜功能
- ✅ **專業架構** - 符合企業級應用標準

**缺點：**
- ❌ **部署複雜** - 需要兩個服務（前端 + 後端）
- ❌ **成本較高** - Railway 每月 $5-10
- ❌ **維護負擔** - 需要監控兩個服務
- ❌ **開發複雜** - 前後端分離，需要管理 API 介面

**適用場景：**
- 🏢 企業級應用
- 🔐 高安全性需求
- 👥 多人協作開發
- 📈 預期快速擴展

---

### 架構 B：純 Supabase 前端架構（當前實作）

```
┌─────────────┐      ┌─────────────┐
│   前端      │      │  資料庫     │
│  (Netlify)  │─────▶│ (Supabase)  │
│   React     │ SQL  │ PostgreSQL  │
│   Supabase  │      │             │
└─────────────┘      └─────────────┘
```

**技術棧：**
- 前端：React + Vite + Supabase Client
- 資料庫：Supabase PostgreSQL
- 密碼：SHA-256 (Web Crypto API)

**優點：**
- ✅ **零成本** - Netlify 免費託管
- ✅ **部署簡單** - 推送到 GitHub 即可
- ✅ **維護容易** - 只有一個服務
- ✅ **開發快速** - 無需管理 API
- ✅ **自動部署** - GitHub → Netlify 自動化

**缺點：**
- ⚠️ **安全性較低** - SHA-256 可被暴力破解（需加鹽）
- ⚠️ **邏輯暴露** - 所有程式碼在前端可檢視
- ⚠️ **擴展受限** - 複雜邏輯難以實作
- ⚠️ **API Key 暴露** - Supabase anon key 在前端

**適用場景：**
- 🏠 內部管理系統
- 💰 預算有限
- 👤 小團隊或個人專案
- 🚀 快速原型開發

---

## 🔐 密碼安全性對比

### bcrypt（架構 A）

```typescript
// 雜湊
const hash = await bcrypt.hash(password, 10);
// 結果：$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

// 驗證
const valid = await bcrypt.compare(password, hash);
```

**特性：**
- ⏱️ **計算成本高** - 故意設計緩慢，抗暴力破解
- 🧂 **自動加鹽** - 每次雜湊結果不同
- 🔄 **可調整強度** - rounds 參數控制計算複雜度
- 🏆 **業界標準** - 被廣泛認可和使用

**破解難度：** 極高（10 rounds 需要約 0.1 秒/次嘗試）

---

### SHA-256（架構 B）

```typescript
// 雜湊
const hash = await hashPassword(password);
// 結果：5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8

// 驗證
const valid = await verifyPassword(password, hash);
```

**特性：**
- ⚡ **計算快速** - 瞬間完成，但易被暴力破解
- 🧂 **無自動加鹽** - 相同密碼產生相同雜湊（彩虹表攻擊）
- 🔒 **固定強度** - 無法調整安全性
- 🌐 **瀏覽器原生** - 無需額外套件

**破解難度：** 低（GPU 可達 數十億次/秒）

---

## 💡 安全性改進建議（架構 B）

### 1. 加入鹽值（Salt）

```typescript
// 改進版 crypto.ts
export async function hashPasswordWithSalt(password: string): Promise<{ hash: string, salt: string }> {
  const salt = crypto.randomUUID();
  const combined = password + salt;
  const encoder = new TextEncoder();
  const data = encoder.encode(combined);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return { hash, salt };
}

export async function verifyPasswordWithSalt(password: string, hash: string, salt: string): Promise<boolean> {
  const combined = password + salt;
  const encoder = new TextEncoder();
  const data = encoder.encode(combined);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return computedHash === hash;
}
```

**資料庫結構變更：**
```sql
ALTER TABLE employees ADD COLUMN password_salt VARCHAR(255);
```

---

### 2. 使用 PBKDF2（更安全）

```typescript
// 使用 Web Crypto API 的 PBKDF2
export async function hashPasswordPBKDF2(password: string): Promise<{ hash: string, salt: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000, // 10 萬次迭代
      hash: 'SHA-256'
    },
    passwordKey,
    256
  );
  
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  
  return { hash, salt: saltHex };
}
```

**安全性：** 接近 bcrypt（10 萬次迭代約 0.1 秒）

---

### 3. 啟用 Supabase Row Level Security (RLS)

```sql
-- 啟用 RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- 只允許使用者查看和更新自己的資料
CREATE POLICY "Users can view own data" ON employees
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON employees
  FOR UPDATE USING (auth.uid() = id);

-- 管理員可以查看所有資料
CREATE POLICY "Admins can view all data" ON employees
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

## 📋 決策矩陣

| 考量因素 | 權重 | 架構 A (tRPC) | 架構 B (Supabase) | 建議 |
|---------|------|--------------|------------------|------|
| **安全性** | ⭐⭐⭐⭐⭐ | 9/10 | 5/10 | A |
| **成本** | ⭐⭐⭐⭐ | 3/10 | 10/10 | B |
| **開發速度** | ⭐⭐⭐ | 5/10 | 9/10 | B |
| **維護難度** | ⭐⭐⭐⭐ | 4/10 | 9/10 | B |
| **可擴展性** | ⭐⭐⭐ | 9/10 | 5/10 | A |
| **部署複雜度** | ⭐⭐ | 3/10 | 10/10 | B |

**總分（加權）：**
- 架構 A (tRPC)：**6.4/10**
- 架構 B (Supabase)：**7.6/10**

---

## 🎯 推薦方案

### 當前階段：架構 B（純 Supabase）✅

**理由：**
1. ✅ 這是內部員工管理系統，不對外開放
2. ✅ 預算有限，零成本部署更實際
3. ✅ 團隊規模小，維護簡單更重要
4. ✅ 可透過加鹽和 PBKDF2 改進安全性

**安全性補強：**
- 🔐 實作 PBKDF2 密碼雜湊
- 🔐 啟用 Supabase RLS
- 🔐 定期更換 Supabase API Key
- 🔐 限制 IP 存取（如果可能）

---

### 未來擴展：架構 A（tRPC 後端）

**時機：**
- 📈 使用者超過 50 人
- 💰 有預算支持後端服務
- 🔐 需要更高安全性（如處理敏感資料）
- 🚀 需要複雜業務邏輯

**遷移路徑：**
1. 部署後端到 Railway
2. 逐步遷移功能到後端
3. 保留前端 Supabase 作為備援
4. 完全切換後移除前端直連

---

## 📚 相關文件

- [架構變更日誌](./ARCHITECTURE_CHANGELOG.md)
- [Railway 部署指南](/tmp/RAILWAY_DEPLOYMENT_GUIDE.md)
- [部署檢查清單](/tmp/DEPLOYMENT_CHECKLIST.md)

---

**文件版本：** 1.0  
**最後更新：** 2025-12-08  
**維護者：** Manus AI Assistant
