#!/usr/bin/env python3
"""
FLOS 診所系統 - 新增12月新人帳號腳本
"""
import os
from supabase import create_client, Client

# 從環境變數取得 Supabase 連線資訊
SUPABASE_URL = "https://pizzpwesrbulfjylejlu.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpenpwd2VzcmJ1bGZqeWxlamx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NDE1MzgsImV4cCI6MjA3NjIxNzUzOH0.xkVhoQhKBaPGkBzU1tuzAH49rP91gUaBLZFffcnKZIk"

# 建立 Supabase 客戶端
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

print("=" * 60)
print("FLOS 診所系統 - 新增12月新人帳號")
print("=" * 60)

# 新增的員工資料
new_staff = [
    {
        "employee_id": "STAFF-JKX017",
        "password": "Staff@JKX2025",
        "name": "姜凱翔",
        "role": "staff",
        "position": "護理師"
    },
    {
        "employee_id": "STAFF-ZYJ018",
        "password": "Staff@ZYJ2025",
        "name": "曾鈺晶",
        "role": "staff",
        "position": "美容師"
    },
    {
        "employee_id": "STAFF-HQ019",
        "password": "Staff@HQ2025",
        "name": "何謙",
        "role": "staff",
        "position": "美容師"
    },
    {
        "employee_id": "STAFF-CYC020",
        "password": "Staff@CYC2025",
        "name": "陳億燦",
        "role": "staff",
        "position": "美容師"
    },
    {
        "employee_id": "STAFF-WL021",
        "password": "Staff@WL2025",
        "name": "威廉",
        "role": "staff",
        "position": "美容師"
    }
]

print("\n📝 準備新增以下員工:")
print("-" * 60)
for staff in new_staff:
    print(f"  {staff['name']:<6} | {staff['employee_id']:<15} | {staff['position']:<8}")
print("-" * 60)

# 新增到 users 表
print("\n🔄 正在新增到 users 表...")
success_count = 0
for staff in new_staff:
    try:
        result = supabase.table("users").upsert(staff).execute()
        print(f"  ✅ {staff['name']} 新增成功")
        success_count += 1
    except Exception as e:
        print(f"  ❌ {staff['name']} 新增失敗: {str(e)}")

# 新增到 staff_members 表
print("\n🔄 正在新增到 staff_members 表...")
for staff in new_staff:
    try:
        # 檢查是否已存在
        existing = supabase.table("staff_members").select("*").eq("name", staff['name']).execute()
        
        if len(existing.data) == 0:
            # 取得最大 display_order
            max_order_result = supabase.table("staff_members").select("display_order").order("display_order", desc=True).limit(1).execute()
            max_order = max_order_result.data[0]['display_order'] if max_order_result.data else 0
            
            # 新增員工
            staff_member_data = {
                "name": staff['name'],
                "position": staff['position'],
                "display_order": max_order + 1
            }
            supabase.table("staff_members").insert(staff_member_data).execute()
            print(f"  ✅ {staff['name']} 新增到 staff_members")
        else:
            # 更新職位
            supabase.table("staff_members").update({"position": staff['position']}).eq("name", staff['name']).execute()
            print(f"  ℹ️  {staff['name']} 已存在，更新職位資訊")
    except Exception as e:
        print(f"  ❌ {staff['name']} staff_members 操作失敗: {str(e)}")

# 查詢結果
print("\n" + "=" * 60)
print("✅ 新增完成！")
print("=" * 60)

try:
    # 查詢新增的使用者
    result = supabase.table("users").select("employee_id, name, position, role").in_("employee_id", [s['employee_id'] for s in new_staff]).execute()
    
    print("\n📊 新增的員工帳號:")
    print("-" * 60)
    for user in result.data:
        print(f"  {user['name']:<6} | {user['employee_id']:<15} | {user['position']:<8}")
    print("-" * 60)
    
    # 統計
    all_staff = supabase.table("users").select("position").eq("role", "staff").execute()
    beautician_count = sum(1 for s in all_staff.data if s['position'] == '美容師')
    nurse_count = sum(1 for s in all_staff.data if s['position'] == '護理師')
    
    print(f"\n📈 員工統計:")
    print(f"  總員工數: {len(all_staff.data)} 位")
    print(f"  美容師: {beautician_count} 位")
    print(f"  護理師: {nurse_count} 位")
    print("=" * 60)
    
except Exception as e:
    print(f"❌ 查詢失敗: {str(e)}")
