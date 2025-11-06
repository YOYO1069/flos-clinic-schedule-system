import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, parseISO } from 'date-fns'

// 格式化日期為 YYYY-MM-DD
export const formatDate = (date) => {
  if (!date) return ''
  if (typeof date === 'string') {
    date = parseISO(date)
  }
  return format(date, 'yyyy-MM-dd')
}

// 格式化時間為 HH:mm:ss
export const formatTime = (time) => {
  if (!time) return ''
  // 如果已經是 HH:mm:ss 格式,直接返回
  if (/^\d{2}:\d{2}:\d{2}$/.test(time)) {
    return time
  }
  // 如果是 HH:mm 格式,補上秒數
  if (/^\d{2}:\d{2}$/.test(time)) {
    return `${time}:00`
  }
  return time
}

// 格式化日期時間顯示
export const formatDateTime = (date, time) => {
  if (!date) return ''
  const dateStr = typeof date === 'string' ? date : formatDate(date)
  const timeStr = time ? ` ${time.substring(0, 5)}` : ''
  return `${dateStr}${timeStr}`
}

// 格式化顯示用日期 (中文)
export const formatDisplayDate = (date) => {
  if (!date) return ''
  if (typeof date === 'string') {
    date = parseISO(date)
  }
  // 使用自定義格式而非locale
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  const dayOfWeek = getDay(date)
  return `${format(date, 'yyyy年MM月dd日')} (${weekdays[dayOfWeek]})`
}

// 取得當前月份的所有日期
export const getMonthDays = (date) => {
  const start = startOfMonth(date)
  const end = endOfMonth(date)
  return eachDayOfInterval({ start, end })
}

// 產生月曆格子 (包含前後月份的日期以填滿6週)
export const generateCalendarDays = (date) => {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  
  // 取得月初是星期幾 (0=週日, 1=週一, ..., 6=週六)
  const startDayOfWeek = getDay(monthStart)
  
  // 計算需要顯示的開始日期 (往前推到週日)
  const calendarStart = addDays(monthStart, -startDayOfWeek)
  
  // 產生42天 (6週 * 7天)
  const days = []
  for (let i = 0; i < 42; i++) {
    const day = addDays(calendarStart, i)
    days.push({
      date: day,
      dateString: formatDate(day),
      dayOfMonth: day.getDate(),
      isCurrentMonth: day >= monthStart && day <= monthEnd,
      isToday: isToday(day),
      dayOfWeek: getDay(day),
    })
  }
  
  return days
}

// 檢查是否為今天
export const checkIsToday = (date) => {
  if (!date) return false
  if (typeof date === 'string') {
    date = parseISO(date)
  }
  return isToday(date)
}

// 檢查兩個日期是否相同
export const checkIsSameDay = (date1, date2) => {
  if (!date1 || !date2) return false
  if (typeof date1 === 'string') {
    date1 = parseISO(date1)
  }
  if (typeof date2 === 'string') {
    date2 = parseISO(date2)
  }
  return isSameDay(date1, date2)
}

// 取得星期幾的中文名稱
export const getWeekdayName = (dayOfWeek) => {
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return weekdays[dayOfWeek]
}

// 產生時段列表
export const generateTimeSlots = (startHour, startMinute, endHour, endMinute, interval = 60) => {
  const slots = []
  let currentMinutes = startHour * 60 + startMinute
  const endMinutes = endHour * 60 + endMinute

  while (currentMinutes <= endMinutes) {
    const hour = Math.floor(currentMinutes / 60)
    const minute = currentMinutes % 60
    
    // 檢查是否超過結束時間
    if (currentMinutes > endMinutes) break
    
    const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`
    slots.push({
      time: timeString,
      display: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      hour,
      minute,
    })

    currentMinutes += interval
  }
  
  return slots
    
}

// 檢查是否為營業時間
export const isBusinessHour = (date, businessHours) => {
  if (!date || !businessHours) return false
  
  const dayOfWeek = typeof date === 'string' ? getDay(parseISO(date)) : getDay(date)
  
  // 週日休診
  if (dayOfWeek === 0) return false
  
  // 週六特殊營業時間
  if (dayOfWeek === 6) {
    return businessHours.saturday !== null
  }
  
  // 週一至週五
  return businessHours.weekday !== null
}

// 取得營業時間
export const getBusinessHours = (date, businessHours) => {
  if (!date || !businessHours) return null
  
  const dayOfWeek = typeof date === 'string' ? getDay(parseISO(date)) : getDay(date)
  
  // 週日休診
  if (dayOfWeek === 0) return null
  
  // 週六特殊營業時間
  if (dayOfWeek === 6) {
    return businessHours.saturday
  }
  
  // 週一至週五
  return businessHours.weekday
}

// 檢查是否為假日
export const isHoliday = (date, holidays) => {
  if (!date || !holidays) return false
  
  const dateString = typeof date === 'string' ? date : formatDate(date)
  const foundHoliday = holidays.find(holiday => holiday.holiday_date === dateString)
  return foundHoliday
}

// 取得假日資訊
// 由於 isHoliday 已經返回假日物件或 null/undefined，這裡不再需要
// 為了避免重複程式碼，我們將 getHolidayInfo 移除，直接在 AppointmentsPage 使用 isHoliday 的結果
// 舊程式碼:
/*
export const getHolidayInfo = (date, holidays) => {
  if (!date || !holidays) return null
  
  const dateString = typeof date === 'string' ? date : formatDate(date)
  return holidays.find(holiday => holiday.holiday_date === dateString)
}
*/

// 檢查日期是否可預約
export const isDateBookable = (date, businessHours, holidays) => {
  // 檢查是否為營業時間
  if (!isBusinessHour(date, businessHours)) return false
  
  // 檢查是否為假日
  if (isHoliday(date, holidays)) return false
  
  return true
}
