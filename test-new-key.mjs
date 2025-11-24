import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pizzpwesrbulfjylejlu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpenpwd2VzcmJ1bGZqeWxlamx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NDE1MzgsImV4cCI6MjA3NjIxNzUzOH0.xkVhoQhKBaPGkBzU1tuzAH49rP91gUaBLZFffcnKZIk';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('測試新的 API Key...');

// 測試查詢 users 表
const { data, error } = await supabase
  .from('users')
  .select('employee_id, name, role, password')
  .eq('employee_id', 'SUPER-WQ001')
  .single();

if (error) {
  console.error('查詢失敗:', error);
} else {
  console.log('查詢成功!');
  console.log('員工編號:', data.employee_id);
  console.log('姓名:', data.name);
  console.log('職等:', data.role);
  console.log('密碼:', data.password);
}
