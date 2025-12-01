import { createClient } from '@supabase/supabase-js';

// 使用醫師排班資料庫配置
const doctorScheduleUrl = 'https://clzjdlykhjwrlksyjlfz.supabase.co';
const doctorScheduleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsempkbHlraGp3cmxrc3lqbGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3OTM2ODAsImV4cCI6MjA3NTM2OTY4MH0.V6QAoh4N2aSF5CgDYfKTnY8cMQnDV3AYilj7TbpWJcU';

const supabase = createClient(doctorScheduleUrl, doctorScheduleKey);

async function checkDatabase() {
  console.log('=== 檢查資料庫 ===\n');
  
  // 1. 檢查 doctor_schedules 表
  console.log('1. 檢查 doctor_schedules 表:');
  const { data: schedules1, error: error1 } = await supabase
    .from('doctor_schedules')
    .select('*')
    .gte('date', '2025-12-01')
    .lte('date', '2025-12-31')
    .limit(5);
  
  if (error1) {
    console.log('   ❌ 錯誤:', error1.message);
  } else {
    console.log(`   ✓ 找到 ${schedules1?.length || 0} 筆資料`);
    if (schedules1 && schedules1.length > 0) {
      console.log('   範例資料:', schedules1[0]);
    }
  }
  
  // 2. 檢查 doctor_shift_schedules 表
  console.log('\n2. 檢查 doctor_shift_schedules 表:');
  const { data: schedules2, error: error2 } = await supabase
    .from('doctor_shift_schedules')
    .select('*')
    .gte('date', '2025-12-01')
    .lte('date', '2025-12-31')
    .limit(5);
  
  if (error2) {
    console.log('   ❌ 錯誤:', error2.message);
  } else {
    console.log(`   ✓ 找到 ${schedules2?.length || 0} 筆資料`);
    if (schedules2 && schedules2.length > 0) {
      console.log('   範例資料:', schedules2[0]);
    }
  }
  
  // 3. 列出所有表格
  console.log('\n3. 嘗試列出資料庫中的所有表格...');
  const { data: tables, error: error3 } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public');
  
  if (error3) {
    console.log('   ❌ 無法列出表格:', error3.message);
  } else {
    console.log('   ✓ 資料庫表格:', tables);
  }
}

checkDatabase();
