import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// 簡單的密碼哈希函數
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

const staffSystemUrl = 'https://pizzpwesrbulfjylejlu.supabase.co';
const staffSystemKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpenpwd2VzcmJ1bGZqeWxlamx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NDE1MzgsImV4cCI6MjA3NjIxNzUzOH0.xkVhoQhKBaPGkBzU1tuzAH49rP91gUaBLZFffcnKZIk';

const supabase = createClient(staffSystemUrl, staffSystemKey);

const employees = [
  {
    employee_id: 'STAFF-LZX003',
    name: '哲軒',
    password: 'Staff@LZX2025',
    role: 'staff'
  },
  {
    employee_id: 'STAFF-ZGQ005',
    name: '張耿齊',
    password: 'Staff@ZGQ2025',
    role: 'staff'
  },
  {
    employee_id: 'STAFF-HYC006',
    name: '洪揚程',
    password: 'Staff@HYC2025',
    role: 'staff'
  },
  {
    employee_id: 'STAFF-XHY007',
    name: '謝鏵翧',
    password: 'Staff@XHY2025',
    role: 'staff'
  },
  {
    employee_id: 'STAFF-WZJ008',
    name: '王筑句',
    password: 'Staff@WZJ2025',
    role: 'staff'
  },
  {
    employee_id: 'STAFF-MM009',
    name: '米米',
    password: 'Staff@MM2025',
    role: 'staff'
  },
  {
    employee_id: 'STAFF-H010',
    name: '小鍾鍾',
    password: 'Staff@H2025',
    role: 'staff'
  },
  {
    employee_id: 'STAFF-ZZK013',
    name: '周稚凱',
    password: 'Staff@ZZK2025',
    role: 'staff'
  },
  {
    employee_id: 'STAFF-GYC014',
    name: '郭郁承',
    password: 'Staff@GYC2025',
    role: 'staff'
  },
  {
    employee_id: 'STAFF-CYA015',
    name: '陳怡安',
    password: 'Staff@CYA2025',
    role: 'staff'
  }
];

async function updateEmployees() {
  console.log('=== 更新員工帳號資料 ===\n');

  for (const emp of employees) {
    console.log(`處理: ${emp.name} (${emp.employee_id})`);

    // 加密密碼
    const hashedPassword = hashPassword(emp.password);

    // 檢查員工是否存在
    const { data: existing, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('employee_id', emp.employee_id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error(`  ❌ 查詢失敗:`, fetchError);
      continue;
    }

    if (existing) {
      // 更新現有員工
      const { error: updateError } = await supabase
        .from('users')
        .update({
          name: emp.name,
          password: hashedPassword,
          role: emp.role
        })
        .eq('employee_id', emp.employee_id);

      if (updateError) {
        console.error(`  ❌ 更新失敗:`, updateError);
      } else {
        console.log(`  ✅ 已更新`);
      }
    } else {
      // 新增員工
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          employee_id: emp.employee_id,
          name: emp.name,
          password: hashedPassword,
          role: emp.role,
          department: '一般員工',
          position: '員工',
          status: 'active'
        });

      if (insertError) {
        console.error(`  ❌ 新增失敗:`, insertError);
      } else {
        console.log(`  ✅ 已新增`);
      }
    }
  }

  console.log('\n=== 驗證員工帳號 ===\n');

  // 驗證所有員工
  for (const emp of employees) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('employee_id', emp.employee_id)
      .single();

    if (error) {
      console.log(`❌ ${emp.name} (${emp.employee_id}) - 查詢失敗`);
    } else if (data) {
      // 驗證密碼
      const passwordMatch = hashPassword(emp.password) === data.password;
      if (passwordMatch) {
        console.log(`✅ ${emp.name} (${emp.employee_id}) - 帳號正常，可登入`);
      } else {
        console.log(`⚠️  ${emp.name} (${emp.employee_id}) - 密碼不符`);
      }
    } else {
      console.log(`❌ ${emp.name} (${emp.employee_id}) - 帳號不存在`);
    }
  }

  console.log('\n完成！');
}

updateEmployees();
