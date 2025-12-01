import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 使用醫師排班資料庫配置
const doctorScheduleUrl = 'https://clzjdlykhjwrlksyjlfz.supabase.co';
const doctorScheduleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsempkbHlraGp3cmxrc3lqbGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3OTM2ODAsImV4cCI6MjA3NTM2OTY4MH0.V6QAoh4N2aSF5CgDYfKTnY8cMQnDV3AYilj7TbpWJcU';

const supabase = createClient(doctorScheduleUrl, doctorScheduleKey);

// 正確的表名
const CORRECT_TABLE = 'doctor_shift_schedules';

async function clearDecemberSchedules() {
  console.log('正在清空12月排班資料 (doctor_shift_schedules 表)...');
  
  const { data, error } = await supabase
    .from(CORRECT_TABLE)
    .delete()
    .gte('date', '2025-12-01')
    .lte('date', '2025-12-31');
  
  if (error) {
    console.error('清空失敗:', error);
    throw error;
  }
  
  console.log('✓ 12月排班資料已清空');
}

async function importSchedules() {
  console.log('正在匯入最新排班資料到 doctor_shift_schedules 表...');
  
  // 讀取 CSV 檔案
  const csvPath = path.join(__dirname, 'december_schedule_2025.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.trim().split('\n');
  
  // 跳過標題行
  const dataLines = lines.slice(1);
  
  const schedules = [];
  
  for (const line of dataLines) {
    const [date, dayOfWeek, period, time, doctorName] = line.split(',');
    
    // 解析時間
    const [startTime, endTime] = time.split('-');
    
    schedules.push({
      date: date,
      doctor_name: doctorName,
      start_time: startTime,
      end_time: endTime
    });
  }
  
  console.log(`準備匯入 ${schedules.length} 筆排班資料...`);
  
  // 批次匯入
  const { data, error } = await supabase
    .from(CORRECT_TABLE)
    .insert(schedules);
  
  if (error) {
    console.error('匯入失敗:', error);
    throw error;
  }
  
  console.log(`✓ 成功匯入 ${schedules.length} 筆排班資料`);
  
  // 驗證匯入結果
  const { data: checkData, error: checkError } = await supabase
    .from(CORRECT_TABLE)
    .select('*')
    .gte('date', '2025-12-01')
    .lte('date', '2025-12-31')
    .limit(5);
  
  if (checkError) {
    console.error('驗證失敗:', checkError);
  } else {
    console.log('\n驗證結果 - 前5筆資料:');
    checkData.forEach((record, index) => {
      console.log(`${index + 1}. ${record.date} - ${record.doctor_name} (${record.start_time}-${record.end_time})`);
    });
  }
}

async function main() {
  try {
    await clearDecemberSchedules();
    await importSchedules();
    console.log('\n✅ 12月排班資料更新完成！');
  } catch (error) {
    console.error('\n❌ 發生錯誤:', error);
    process.exit(1);
  }
}

main();
