import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_DATABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// 資料庫表名常數
export const TABLES = {
  APPOINTMENTS: 'appointments', // 更新為新的表名
  CUSTOMERS: 'customers',
  TREATMENTS: 'treatments',
  STAFF: 'staff',
  ROOMS_EQUIPMENT: 'rooms_equipment',
  BUSINESS_HOURS: 'business_hours',

  HOLIDAYS: 'holidays', // 新增 holidays 表名
  USERS: 'users',
}

// 預約狀態常數
export const APPOINTMENT_STATUS = {
  PENDING: '尚未報到',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  NO_SHOW: '未到',
}

// 預約來源常數
export const APPOINTMENT_SOURCE = {
  CLINIC: '診所預約',
  ONLINE: '線上預約',
  PHONE: '電話預約',
  WALK_IN: '現場預約',
}

// 人員角色常數
export const STAFF_ROLES = {
  DOCTOR: '醫師',
  CONSULTANT: '諮詢師',
  NURSE: '護理師',
  BEAUTICIAN: '美容師',
}

// 醫師名單
export const DOCTORS = [
  '鍾曜任',
  '伍詠聰',
  '林思宇',
  '王昱淞',
  '黃俊堯',
  '藍子軒',
  '何逸群',
  '郭昌浩',
  '宋昀翰',
]

// 諾詢師名單
export const CONSULTANTS = [
  '萬晴',
  '陳韻安',
  '劉哲軒',
  '李文華',
  '張耿齊',
  '洪揚程',
  '謝鑵翹',
  '王筑句',
  '米米',
  '花',
  '劉道玄',
  '黃柏翰',
  '周稚凱',
  '郭郁承',
]

// 房間列表
export const ROOMS = [
  '1號房',
  '2號房',
  '3號房',
  'VIP房',
]

// 設備列表
export const EQUIPMENT = [
  '機器貓',
  'EMBODY',
  'Onda pro',
  'Emsculpt neo',
]

// 營業時間配置
export const BUSINESS_HOURS = {
  weekday: { start: 12, end: 20 }, // 12:00-20:00
  saturday: { start: 11, end: 20 }, // 11:00-20:00
  sunday: null, // 週日休診
}

// 每小時最大預約數
export const MAX_APPOINTMENTS_PER_HOUR = 3

// 時區設定
export const TIMEZONE = 'Asia/Taipei'
