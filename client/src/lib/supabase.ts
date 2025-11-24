import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pizzpwesrbulfjylejlu.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpenpwd2VzcmJ1bGZqeWxlamx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NDE1MzgsImV4cCI6MjA3NjIxNzUzOH0.xkVhoQhKBaPGkBzU1tuzAH49rP91gUaBLZFffcnKZIk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
]

// 諮詢師資料
export const consultants = [
  '小桃', '小葵', '小莉', '小芸', '小雅', 
  '小琳', '小珊', '小婷', '小慧', '小芳', '小美'
]

// 跟診人員資料
export const nurses = [
  '小紅', '小綠', '小藍', '小黃', '小紫',
  '小橙', '小粉', '小灰', '小白', '小黑',
  '小棕', '小青', '小金', '小銀', '小銅',
  '小鐵', '小鋼', '小石', '小木'
]

// 房間/設備資料
export const rooms = [
  'VIP室設備', '整容間設備', '美容間設備',
  '診間設備', '水水床', '白白床',
  '整容間', '美容間', '診間',
  'VIP', '水水', '白白'
]

// 營業時間
export const businessHours = {
  weekday: { start: '12:00', end: '20:30' },
  saturday: { start: '10:30', end: '19:00' },
  sunday: { closed: true }
}

// 資料庫表格結構
export const tables = {
  schedules: 'flos_schedules',
  employees: 'employees',
  attendanceRecords: 'attendance_records',
  leaveRequests: 'leave_requests',
  overtimeRequests: 'overtime_requests',
  salaryRecords: 'salary_records',
  attendanceSettings: 'attendance_settings'
}

// 即時訂閱功能
export const subscribeToChanges = (table: string, callback: (payload: any) => void) => {
  const subscription = supabase
    .channel(`public:${table}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: table }, callback)
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}
