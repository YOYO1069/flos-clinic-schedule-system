const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://clzjdlykhjwrlksyjlfz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsempkbHlraGp3cmxrc3lqbGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3OTM2ODAsImV4cCI6MjA3NTM2OTY4MH0.V6QAoh4N2aSF5CgDYfKTnY8cMQnDV3AYilj7TbpWJcU'
);

const novemberSchedules = [
  { date: '2025-11-01', doctor_name: '王昱淞醫師', start_time: '11:00', end_time: '18:30' },
  { date: '2025-11-01', doctor_name: '何逸群醫師', start_time: '14:00', end_time: '18:00' },
  { date: '2025-11-03', doctor_name: '郭昌濬醫師', start_time: '12:00', end_time: '20:00' },
  { date: '2025-11-03', doctor_name: '王昱淞醫師', start_time: '17:30', end_time: '21:00' },
  { date: '2025-11-04', doctor_name: '藍子軒醫師', start_time: '12:00', end_time: '20:00' },
  { date: '2025-11-04', doctor_name: '蔡秉遑醫師', start_time: '17:00', end_time: '21:00' },
  { date: '2025-11-05', doctor_name: '龍勤莉醫師', start_time: '12:00', end_time: '20:00' },
  { date: '2025-11-06', doctor_name: '郭昌濬醫師', start_time: '12:00', end_time: '20:00' },
  { date: '2025-11-07', doctor_name: '郭昌濬醫師', start_time: '12:00', end_time: '20:00' },
  { date: '2025-11-08', doctor_name: '王昱淞醫師', start_time: '11:00', end_time: '18:30' },
  { date: '2025-11-10', doctor_name: '伍詠聰醫師', start_time: '12:00', end_time: '20:00' },
  { date: '2025-11-10', doctor_name: '王昱淞醫師', start_time: '17:30', end_time: '21:00' },
  { date: '2025-11-11', doctor_name: '藍子軒醫師', start_time: '12:00', end_time: '20:00' },
  { date: '2025-11-11', doctor_name: '蔡秉遑醫師', start_time: '17:00', end_time: '21:00' },
  { date: '2025-11-12', doctor_name: '宋昀翰醫師', start_time: '12:00', end_time: '20:00' },
  { date: '2025-11-13', doctor_name: '郭昌濬醫師', start_time: '12:00', end_time: '20:00' },
  { date: '2025-11-14', doctor_name: '林思宇醫師', start_time: '12:00', end_time: '20:00' },
  { date: '2025-11-15', doctor_name: '林思宇醫師', start_time: '11:00', end_time: '18:30' },
  { date: '2025-11-17', doctor_name: '郭昌濬醫師', start_time: '12:00', end_time: '20:00' },
  { date: '2025-11-17', doctor_name: '王昱淞醫師', start_time: '17:30', end_time: '21:00' },
  { date: '2025-11-18', doctor_name: '王昱淞醫師', start_time: '12:00', end_time: '20:00' },
  { date: '2025-11-18', doctor_name: '蔡秉遑醫師', start_time: '17:00', end_time: '21:00' },
  { date: '2025-11-19', doctor_name: '龍勤莉醫師', start_time: '12:00', end_time: '20:00' },
  { date: '2025-11-20', doctor_name: '龍勤莉醫師', start_time: '12:00', end_time: '20:00' },
  { date: '2025-11-21', doctor_name: '郭昌濬醫師', start_time: '12:00', end_time: '20:00' },
  { date: '2025-11-22', doctor_name: '林思宇醫師', start_time: '11:00', end_time: '18:30' },
  { date: '2025-11-24', doctor_name: '伍詠聰醫師', start_time: '12:00', end_time: '20:00' },
  { date: '2025-11-24', doctor_name: '王昱淞醫師', start_time: '17:30', end_time: '21:00' },
  { date: '2025-11-25', doctor_name: '藍子軒醫師', start_time: '12:00', end_time: '20:00' },
  { date: '2025-11-25', doctor_name: '蔡秉遑醫師', start_time: '17:00', end_time: '21:00' },
  { date: '2025-11-26', doctor_name: '宋昀翰醫師', start_time: '12:00', end_time: '20:00' },
  { date: '2025-11-27', doctor_name: '伍詠聰醫師', start_time: '12:00', end_time: '20:00' },
  { date: '2025-11-28', doctor_name: '何逸群醫師', start_time: '13:00', end_time: '17:30' },
  { date: '2025-11-28', doctor_name: '王昱淞醫師', start_time: '17:00', end_time: '20:00' },
  { date: '2025-11-29', doctor_name: '林思宇醫師', start_time: '11:00', end_time: '18:30' },
];

async function importNovemberSchedules() {
  console.log('開始匯入 11 月排班資料...');
  
  // 先刪除 11 月的現有資料
  const { error: deleteError } = await supabase
    .from('doctor_shift_schedules')
    .delete()
    .gte('date', '2025-11-01')
    .lte('date', '2025-11-30');
  
  if (deleteError) {
    console.log('⚠️ 刪除舊資料時發生錯誤:', deleteError.message);
  } else {
    console.log('✅ 已清除 11 月舊資料');
  }
  
  // 插入新資料
  const { data, error } = await supabase
    .from('doctor_shift_schedules')
    .insert(novemberSchedules)
    .select();
  
  if (error) {
    console.log('❌ 匯入失敗:', error.message);
  } else {
    console.log(`✅ 成功匯入 ${data.length} 筆 11 月排班資料`);
    console.log('\n排班統計:');
    
    // 統計每個醫師的排班數
    const doctorStats = {};
    data.forEach(schedule => {
      const doctor = schedule.doctor_name;
      if (!doctorStats[doctor]) {
        doctorStats[doctor] = 0;
      }
      doctorStats[doctor]++;
    });
    
    Object.entries(doctorStats).sort((a, b) => b[1] - a[1]).forEach(([doctor, count]) => {
      console.log(`  ${doctor}: ${count} 班`);
    });
  }
}

importNovemberSchedules();
