import { createClient } from '@supabase/supabase-js';

const staffSystemUrl = 'https://pizzpwesrbulfjylejlu.supabase.co';
const staffSystemKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpenpwd2VzcmJ1bGZqeWxlamx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NDE1MzgsImV4cCI6MjA3NjIxNzUzOH0.xkVhoQhKBaPGkBzU1tuzAH49rP91gUaBLZFffcnKZIk';

const supabase = createClient(staffSystemUrl, staffSystemKey);

async function checkSchema() {
  console.log('=== 檢查 attendance_records 表結構 ===\n');
  
  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('查詢失敗:', error);
    return;
  }
  
  if (data && data.length > 0) {
    console.log('表中的欄位:');
    Object.keys(data[0]).forEach(key => {
      console.log(`  - ${key}: ${typeof data[0][key]}`);
    });
  }
}

checkSchema();
