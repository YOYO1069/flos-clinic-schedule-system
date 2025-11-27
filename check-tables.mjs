import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pizzpwesrbulfjylejlu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpenpwd2VzcmJ1bGZqeWxlamx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NDE1MzgsImV4cCI6MjA3NjIxNzUzOH0.xkVhoQhKBaPGkBzU1tuzAH49rP91gUaBLZFffcnKZIk';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('檢查資料表...');

// 測試查詢 employees 表
const { data: employees, error: empError } = await supabase
  .from('employees')
  .select('*')
  .limit(1);

if (empError) {
  console.error('employees 表不存在或無法訪問:', empError.message);
} else {
  console.log('✅ employees 表存在,資料:', employees);
}

// 測試查詢 users 表
const { data: users, error: userError } = await supabase
  .from('users')
  .select('*')
  .limit(1);

if (userError) {
  console.error('users 表不存在或無法訪問:', userError.message);
} else {
  console.log('✅ users 表存在,資料:', users);
}

// 測試查詢 staff_members 表
const { data: staff, error: staffError } = await supabase
  .from('staff_members')
  .select('*')
  .limit(1);

if (staffError) {
  console.error('staff_members 表不存在或無法訪問:', staffError.message);
} else {
  console.log('✅ staff_members 表存在,資料:', staff);
}
