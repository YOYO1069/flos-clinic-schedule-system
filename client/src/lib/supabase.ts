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

// 醫師排班資料類型
export interface DoctorSchedule {
  id: string;
  date: string;
  doctor_id: number;
  start_time: string;
  end_time: string;
  created_at?: string;
  updated_at?: string;
}

// 醫師資料
export const doctors = [
  { id: 1, name: '鍾曜任', color: '#ec4899' },
  { id: 2, name: '伍詠聰', color: '#3b82f6' },
  { id: 3, name: '林思宇', color: '#10b981' },
  { id: 4, name: '王昱淞', color: '#f59e0b' },
  { id: 5, name: '黃俊堯', color: '#8b5cf6' },
  { id: 6, name: '藍子軒', color: '#06b6d4' },
  { id: 7, name: '何逸群', color: '#ef4444' },
  { id: 8, name: '郭昌浩', color: '#14b8a6' },
];
