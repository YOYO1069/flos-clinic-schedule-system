# LINE Bot 有效打卡範圍驗證設計

## 📍 系統架構

### 整體流程圖

```
員工傳送位置訊息
       ↓
LINE Bot 接收位置資訊
       ↓
從資料庫取得診所位置
       ↓
計算距離 (Haversine 公式)
       ↓
判斷是否在有效範圍內
       ↓
    ┌─────┴─────┐
    ↓           ↓
在範圍內    範圍外
    ↓           ↓
自動打卡    標記待審核
    ↓           ↓
記錄成功    通知管理員
```

---

## 🗄️ 資料庫設計

### 1. clinic_locations 表 (診所位置)

```sql
CREATE TABLE clinic_locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  valid_radius INTEGER DEFAULT 100,  -- 有效範圍(公尺)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. attendance_records 表 (打卡記錄)

已有欄位:
- `check_in_latitude` - 上班打卡緯度
- `check_in_longitude` - 上班打卡經度
- `check_out_latitude` - 下班打卡緯度
- `check_out_longitude` - 下班打卡經度

新增欄位:
```sql
ALTER TABLE attendance_records 
ADD COLUMN distance_from_clinic INTEGER,  -- 距離診所的距離(公尺)
ADD COLUMN is_within_range BOOLEAN DEFAULT true,  -- 是否在有效範圍內
ADD COLUMN approval_status VARCHAR(20) DEFAULT 'approved',  -- 審核狀態
ADD COLUMN approved_by VARCHAR(100),  -- 審核者
ADD COLUMN approval_note TEXT;  -- 審核備註
```

**approval_status 狀態:**
- `approved` - 已核准(自動或手動)
- `pending` - 待審核
- `rejected` - 已拒絕

### 3. line_user_bindings 表 (LINE 用戶綁定)

```sql
CREATE TABLE line_user_bindings (
  id SERIAL PRIMARY KEY,
  line_user_id VARCHAR(255) UNIQUE NOT NULL,
  employee_id VARCHAR(50) NOT NULL,
  employee_name VARCHAR(100) NOT NULL,
  clinic_id INTEGER REFERENCES clinic_locations(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📐 距離計算 (Haversine 公式)

### TypeScript 實作

```typescript
/**
 * 計算兩個GPS座標之間的距離 (公尺)
 * 使用 Haversine 公式
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // 地球半徑(公尺)
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // 回傳公尺
}
```

### 驗證範圍

```typescript
/**
 * 驗證是否在有效打卡範圍內
 */
function isWithinRange(
  userLat: number,
  userLon: number,
  clinicLat: number,
  clinicLon: number,
  validRadius: number
): { isValid: boolean; distance: number } {
  const distance = calculateDistance(userLat, userLon, clinicLat, clinicLon);
  return {
    isValid: distance <= validRadius,
    distance: distance,
  };
}
```

---

## 🤖 LINE Bot 打卡流程

### 方式一:傳送位置訊息打卡 (推薦)

```
員工 → 點擊「位置」→ 傳送目前位置
  ↓
Bot 接收 LocationMessage
  ↓
取得 latitude, longitude
  ↓
計算距離診所的距離
  ↓
判斷是否在範圍內
  ↓
┌─────┴─────┐
↓           ↓
範圍內      範圍外
↓           ↓
自動打卡    標記待審核
↓           ↓
回覆成功    通知管理員
```

**LINE Bot 程式碼:**

```typescript
import { LocationMessage } from '@line/bot-sdk';

async function handleLocationMessage(
  event: MessageEvent,
  location: LocationMessage
): Promise<void> {
  const userId = event.source.userId;
  if (!userId) return;

  // 1. 取得員工資訊
  const employee = await getEmployeeByLineUserId(userId);
  if (!employee) {
    await replyMessage(event.replyToken, '❌ 您尚未綁定員工資料');
    return;
  }

  // 2. 取得診所位置
  const clinic = await getClinicById(employee.clinic_id);
  if (!clinic) {
    await replyMessage(event.replyToken, '❌ 找不到診所資訊');
    return;
  }

  // 3. 計算距離
  const { isValid, distance } = isWithinRange(
    location.latitude,
    location.longitude,
    clinic.latitude,
    clinic.longitude,
    clinic.valid_radius
  );

  // 4. 判斷打卡類型(上班/下班)
  const todayRecord = await getTodayAttendance(employee.id);
  const isCheckIn = !todayRecord || todayRecord.check_out_time;

  // 5. 記錄打卡
  if (isCheckIn) {
    // 上班打卡
    await checkInWithLocation(
      employee.id,
      location.latitude,
      location.longitude,
      distance,
      isValid
    );

    if (isValid) {
      await replyMessage(
        event.replyToken,
        `✅ 上班打卡成功!\n📍 距離診所: ${distance}m\n⏰ 時間: ${getCurrentTime()}`
      );
    } else {
      await replyMessage(
        event.replyToken,
        `⚠️ 上班打卡已記錄,但您不在有效範圍內\n📍 距離診所: ${distance}m (超過${clinic.valid_radius}m)\n⏳ 待管理員審核`
      );
      // 通知管理員
      await notifyAdminForApproval(employee, distance);
    }
  } else {
    // 下班打卡
    await checkOutWithLocation(
      todayRecord.id,
      location.latitude,
      location.longitude,
      distance,
      isValid
    );

    const workHours = calculateWorkHours(todayRecord.check_in_time, new Date());

    if (isValid) {
      await replyMessage(
        event.replyToken,
        `✅ 下班打卡成功!\n📍 距離診所: ${distance}m\n⏰ 時間: ${getCurrentTime()}\n⏱️ 工時: ${workHours}`
      );
    } else {
      await replyMessage(
        event.replyToken,
        `⚠️ 下班打卡已記錄,但您不在有效範圍內\n📍 距離診所: ${distance}m (超過${clinic.valid_radius}m)\n⏳ 待管理員審核`
      );
      // 通知管理員
      await notifyAdminForApproval(employee, distance);
    }
  }
}
```

### 方式二:文字指令 + 位置請求

```
員工 → 輸入「打卡上班」
  ↓
Bot → 請求傳送位置
  ↓
員工 → 傳送位置
  ↓
(同方式一流程)
```

**LINE Bot 程式碼:**

```typescript
async function handleCheckInCommand(
  event: MessageEvent,
  userId: string
): Promise<void> {
  // 請求用戶傳送位置
  await replyMessage(event.replyToken, {
    type: 'text',
    text: '請傳送您的目前位置以完成打卡',
    quickReply: {
      items: [
        {
          type: 'action',
          action: {
            type: 'location',
            label: '📍 傳送位置',
          },
        },
      ],
    },
  });
}
```

---

## 👨‍💼 管理員審核功能

### 審核流程

```
範圍外打卡
    ↓
系統標記為 pending
    ↓
推播通知管理員
    ↓
管理員查看打卡記錄
    ↓
┌────┴────┐
↓         ↓
核准      拒絕
↓         ↓
更新狀態  更新狀態
↓         ↓
通知員工  通知員工
```

### Web 儀表板審核介面

在現有的 `/admin` 頁面新增「待審核打卡」區塊:

```typescript
// 查詢待審核的打卡記錄
const { data: pendingRecords } = await supabase
  .from('attendance_records')
  .select('*')
  .eq('approval_status', 'pending')
  .order('created_at', { ascending: false });

// 審核操作
async function approveAttendance(recordId: number, note: string) {
  await supabase
    .from('attendance_records')
    .update({
      approval_status: 'approved',
      approved_by: adminName,
      approval_note: note,
    })
    .eq('id', recordId);

  // 通知員工
  await notifyEmployee(recordId, 'approved');
}

async function rejectAttendance(recordId: number, note: string) {
  await supabase
    .from('attendance_records')
    .update({
      approval_status: 'rejected',
      approved_by: adminName,
      approval_note: note,
    })
    .eq('id', recordId);

  // 通知員工
  await notifyEmployee(recordId, 'rejected');
}
```

### LINE 推播通知管理員

```typescript
async function notifyAdminForApproval(
  employee: Employee,
  distance: number
): Promise<void> {
  const adminLineId = 'ADMIN_LINE_USER_ID'; // 從設定檔取得

  await client.pushMessage(adminLineId, {
    type: 'text',
    text: `⚠️ 範圍外打卡通知\n\n員工: ${employee.name}\n距離: ${distance}m\n時間: ${getCurrentTime()}\n\n請至管理後台審核`,
  });
}
```

---

## 🎯 使用情境

### 情境一:正常打卡 (範圍內)

```
員工在診所內 → 傳送位置 → 距離 50m
  ↓
✅ 自動打卡成功
  ↓
記錄: is_within_range = true, approval_status = 'approved'
```

### 情境二:範圍外打卡

```
員工在外面 → 傳送位置 → 距離 500m
  ↓
⚠️ 記錄打卡但標記待審核
  ↓
記錄: is_within_range = false, approval_status = 'pending'
  ↓
推播通知管理員
  ↓
管理員審核 → 核准/拒絕
```

### 情境三:忘記打卡 (補打卡)

```
員工忘記打卡 → 隔天補打
  ↓
管理員手動新增打卡記錄
  ↓
記錄: approval_status = 'approved', approved_by = 'Admin'
```

---

## 📊 統計報表

### 打卡範圍統計

```sql
-- 查詢範圍外打卡次數
SELECT 
  employee_name,
  COUNT(*) as out_of_range_count,
  AVG(distance_from_clinic) as avg_distance
FROM attendance_records
WHERE is_within_range = false
  AND work_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY employee_name
ORDER BY out_of_range_count DESC;
```

### 審核狀態統計

```sql
-- 查詢待審核打卡數量
SELECT 
  approval_status,
  COUNT(*) as count
FROM attendance_records
WHERE work_date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY approval_status;
```

---

## 🔧 設定建議

### 有效打卡範圍設定

| 場景 | 建議範圍 | 說明 |
|------|---------|------|
| 小型診所 | 50-100m | 涵蓋診所周圍停車場 |
| 中型診所 | 100-200m | 涵蓋附近街區 |
| 大型醫院 | 200-500m | 涵蓋整個醫院園區 |
| 外勤人員 | 不限制 | 設定為 999999m |

### GPS 定位精度

- **室外**: 5-10m (良好)
- **室內**: 10-50m (中等)
- **地下室**: 50-100m+ (較差)

**建議**: 設定有效範圍時考慮 GPS 誤差,建議至少 50m 以上。

---

## 🚀 部署步驟

### 1. 更新資料庫

```sql
-- 執行資料表建立和修改 SQL
\i create_clinic_locations.sql
\i alter_attendance_records.sql
\i create_line_user_bindings.sql
```

### 2. 設定診所位置

```sql
INSERT INTO clinic_locations (name, address, latitude, longitude, valid_radius) 
VALUES ('FLOS 曜診所', '實際地址', 25.033964, 121.564468, 100);
```

### 3. 部署 LINE Bot

- 上傳程式碼到 Zeabur
- 設定環境變數
- 設定 Webhook URL

### 4. 測試

- 在診所內測試打卡 (應自動核准)
- 在診所外測試打卡 (應標記待審核)
- 測試管理員審核功能

---

## 📝 總結

**優點:**
- ✅ 自動驗證打卡位置
- ✅ 防止異地打卡
- ✅ 保留彈性(管理員可審核)
- ✅ 完整記錄GPS座標和距離

**限制:**
- ❌ GPS 在室內精度較差
- ❌ 需要員工授權位置權限
- ❌ 無法100%防止作弊(可能使用虛擬定位)

**建議:**
- 設定合理的有效範圍(建議100m)
- 定期檢查範圍外打卡記錄
- 對於頻繁範圍外打卡的員工進行提醒
