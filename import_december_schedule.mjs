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

// 醫師名稱對應 ID (與 ScheduleContext.tsx 中的 doctors 陣列一致)
const doctorNameToId = {
  '何逸群醫師': 1,
  '藍子軒醫師': 2,
  '宋昀翰醫師': 3,
  '伍詠聰醫師': 4,
  '蔡秉遑醫師': 5,
  '王昱淞醫師': 6,
  '劉佑澤醫師': 7,
  '林思宇醫師': 8,
  '陳宥嘉醫師': 9,
  '鍾曜任醫師': 10,
  '李洋醫師': 11,
  '龍勤利醫師': 12,
  '楊鈞賢醫師': 13,
  '視當日情況': 14,
  '郭宜潔醫師': 15,
  '張敬暘醫師': 16,
  '陳冠廷醫師': 17,
  '許哲瑋醫師': 18,
  '黃柏翔醫師': 19,
  '劉彥廷醫師': 20
};

async function clearDecemberSchedules() {
  console.log('正在清空12月排班資料...');
  
  const { data, error } = await supabase
    .from('doctor_schedules')
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
  console.log('正在匯入最新排班資料...');
  
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
    
    // 取得醫師 ID
    const doctorId = doctorNameToId[doctorName];
    
    if (!doctorId) {
      console.warn(`警告: 找不到醫師 "${doctorName}" 的 ID，跳過此記錄`);
      continue;
    }
    
    schedules.push({
      date: date,
      doctor_id: doctorId,
      start_time: startTime,
      end_time: endTime
    });
  }
  
  console.log(`準備匯入 ${schedules.length} 筆排班資料...`);
  
  // 批次匯入
  const { data, error } = await supabase
    .from('doctor_schedules')
    .insert(schedules);
  
  if (error) {
    console.error('匯入失敗:', error);
    throw error;
  }
  
  console.log(`✓ 成功匯入 ${schedules.length} 筆排班資料`);
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
