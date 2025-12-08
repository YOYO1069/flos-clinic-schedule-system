import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://clzjdlykhjwrlksyjlfz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsempkbHlraGp3cmxrc3lqbGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3OTM2ODAsImV4cCI6MjA3NTM2OTY4MH0.V6QAoh4N2aSF5CgDYfKTnY8cMQnDV3AYilj7TbpWJcU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 資料表名稱常數
export const tables = {
  employees: 'employees',
  attendance_records: 'attendance_records',
  leave_requests: 'leave_requests',
  visitor_logs: 'visitor_logs',
  doctor_schedules: 'doctor_schedules'
};

// 醫生排班系統使用相同的資料庫
export const doctorScheduleClient = supabase;
export const SCHEDULE_TABLE = 'doctor_schedules';
