import { createClient } from '@supabase/supabase-js';

const staffSystemUrl = 'https://pizzpwesrbulfjylejlu.supabase.co';
const staffSystemKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpenpwd2VzcmJ1bGZqeWxlamx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NDE1MzgsImV4cCI6MjA3NjIxNzUzOH0.xkVhoQhKBaPGkBzU1tuzAH49rP91gUaBLZFffcnKZIk';

const supabase = createClient(staffSystemUrl, staffSystemKey);

async function checkTodayAttendance() {
  console.log('=== 檢查今天的打卡記錄 ===\n');
  
  const today = '2025-12-01';
  
  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('work_date', today)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('查詢失敗:', error);
    return;
  }
  
  console.log(`找到 ${data.length} 筆記錄:\n`);
  
  data.forEach((record, index) => {
    console.log(`${index + 1}. ${record.employee_name} (${record.employee_id})`);
    console.log(`   上班時間: ${record.check_in_time || '-'}`);
    console.log(`   下班時間: ${record.check_out_time || '-'}`);
    console.log(`   工時: ${record.work_hours || '-'}`);
    console.log(`   記錄 ID: ${record.id}`);
    console.log('');
  });
}

checkTodayAttendance();
