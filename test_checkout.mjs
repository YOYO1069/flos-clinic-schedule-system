import { createClient } from '@supabase/supabase-js';

const staffSystemUrl = 'https://pizzpwesrbulfjylejlu.supabase.co';
const staffSystemKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpenpwd2VzcmJ1bGZqeWxlamx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NDE1MzgsImV4cCI6MjA3NjIxNzUzOH0.xkVhoQhKBaPGkBzU1tuzAH49rP91gUaBLZFffcnKZIk';

const supabase = createClient(staffSystemUrl, staffSystemKey);

async function testCheckOut() {
  console.log('=== 測試下班打卡 ===\n');
  
  // 取得黃柏翰的打卡記錄 (ID: 1)
  const recordId = 1;
  
  // 模擬台灣時間轉 UTC
  function taiwanTimeToUTC(taiwanTime) {
    const utcTime = new Date(taiwanTime.getTime() - 8 * 60 * 60 * 1000);
    return utcTime.toISOString();
  }
  
  function getTaiwanNow() {
    const now = new Date();
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
    return new Date(utcTime + 8 * 60 * 60 * 1000);
  }
  
  const taiwanNow = getTaiwanNow();
  const utcNow = taiwanTimeToUTC(taiwanNow);
  
  console.log(`台灣時間: ${taiwanNow.toISOString()}`);
  console.log(`UTC 時間: ${utcNow}`);
  console.log('');
  
  // 取得上班時間
  const { data: record, error: fetchError } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('id', recordId)
    .single();
  
  if (fetchError) {
    console.error('取得記錄失敗:', fetchError);
    return;
  }
  
  console.log('原始記錄:');
  console.log(`  上班時間: ${record.check_in_time}`);
  console.log(`  下班時間: ${record.check_out_time || '-'}`);
  console.log('');
  
  // 計算工時
  const checkInTime = new Date(record.check_in_time);
  const checkOutTime = new Date(utcNow);
  const workHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
  
  console.log(`計算工時: ${workHours.toFixed(2)} 小時`);
  console.log('');
  
  // 更新下班時間
  const updateData = {
    check_out_time: utcNow,
    work_hours: Math.round(workHours * 100) / 100,
    check_out_address: '測試打卡'
  };
  
  console.log('準備更新資料:');
  console.log(JSON.stringify(updateData, null, 2));
  console.log('');
  
  const { data, error } = await supabase
    .from('attendance_records')
    .update(updateData)
    .eq('id', recordId)
    .select()
    .single();
  
  if (error) {
    console.error('❌ 更新失敗:', error);
    console.error('錯誤詳情:', JSON.stringify(error, null, 2));
  } else {
    console.log('✅ 更新成功!');
    console.log('更新後的記錄:');
    console.log(`  上班時間: ${data.check_in_time}`);
    console.log(`  下班時間: ${data.check_out_time}`);
    console.log(`  工時: ${data.work_hours}`);
  }
}

testCheckOut();
