import os
from supabase import create_client

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

# 查詢所有請假記錄
response = supabase.table("leave_requests").select("*").execute()

print("=== 請假記錄 ===")
print(f"總共 {len(response.data)} 筆記錄\n")

for record in response.data:
    print(f"ID: {record['id']}")
    print(f"員工ID: {record['employee_id']}")
    print(f"假期類型: {record['leave_type']}")
    print(f"開始日期: {record['start_date']}")
    print(f"結束日期: {record['end_date']}")
    print(f"狀態: {record['status']}")
    print(f"原因: {record.get('reason', 'N/A')}")
    print("-" * 50)
