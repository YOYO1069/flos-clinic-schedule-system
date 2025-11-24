import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pizzpwesrbulfjylejlu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpenpwd2VzcmJ1bGZqeWxlamx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3NTc5NzMsImV4cCI6MjA0NzMzMzk3M30.Vf8xCQSZYbBWbJYr5qANJvELsEDqxVPmYKTxOYHqDXM';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('測試 Supabase 連線...');
console.log('URL:', supabaseUrl);

// 測試查詢 users 表
const { data, error } = await supabase
  .from('users')
  .select('employee_id, name, role')
  .eq('employee_id', 'SUPER-WQ001')
  .single();

if (error) {
  console.error('查詢失敗:', error);
} else {
  console.log('查詢成功:', data);
}
