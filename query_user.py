from supabase import create_client
import os

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

# 查詢陳怡安的資料
response = supabase.table('users').select('*').eq('name', '陳怡安').execute()
print("陳怡安的資料:")
for user in response.data:
    print(f"  員工編號: {user['employee_id']}")
    print(f"  姓名: {user['name']}")
    print(f"  角色: {user.get('role', 'employee')}")
    print(f"  密碼: {user.get('password', 'N/A')}")
    print()

# 查詢所有員工角色
response = supabase.table('users').select('employee_id, name, role').execute()
print("\n所有員工角色:")
for user in response.data:
    role = user.get('role', 'employee')
    print(f"  {user['employee_id']} - {user['name']} - {role}")
