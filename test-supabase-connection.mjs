import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://clzjdlykhjwrlksyjlfz.supabase.co';
const supabaseAnonKey = 'sb_publishable_DymEZJ118QSiKvIDVqhpgg_6GXrHWGU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);

try {
  // 測試查詢 doctor_shift_schedules 表
  const { data, error } = await supabase
    .from('doctor_shift_schedules')
    .select('*')
    .limit(5);

  if (error) {
    console.error('❌ Error:', error.message);
    console.error('Details:', error);
  } else {
    console.log('✅ Connection successful!');
    console.log(`Found ${data.length} records:`);
    console.log(JSON.stringify(data, null, 2));
  }
} catch (err) {
  console.error('❌ Exception:', err);
}
