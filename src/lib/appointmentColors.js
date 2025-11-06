/**
 * 預約顏色標示工具函數
 * 根據預約狀態、日期等條件返回對應的顏色樣式
 */

/**
 * 判斷預約是否為歷史預約（10/29 之前）
 */
export function isHistoricalAppointment(appointmentDate) {
  const cutoffDate = new Date('2025-10-29')
  const aptDate = new Date(appointmentDate)
  return aptDate < cutoffDate
}

/**
 * 判斷預約是否超時
 * 超時定義：預約時間已過但狀態仍為「尚未報到」
 */
export function isOvertimeAppointment(appointmentDate, appointmentTime, status) {
  const now = new Date()
  const aptDateTime = new Date(`${appointmentDate} ${appointmentTime}`)
  
  // 如果預約時間已過，且狀態仍為「尚未報到」，則視為超時
  if (aptDateTime < now && (status === '尚未報到' || status === '已報到')) {
    return true
  }
  
  return false
}

/**
 * 判斷預約是否為「內不佔用」
 * 根據備註或特殊標記判斷
 */
export function isNonOccupiedAppointment(notes, statusTag) {
  // 檢查備註是否包含「內不佔用」關鍵字
  if (notes && notes.includes('內不佔用')) {
    return true
  }
  
  // 檢查是否有特殊標記
  if (statusTag === 'occupied' || statusTag === 'non-occupied') {
    return true
  }
  
  return false
}

/**
 * 獲取預約在月曆上的顯示顏色
 * 優先級：超時 > 內不佔用 > 歷史預約 > 一般預約
 */
export function getAppointmentColor(appointment) {
  const { 
    taiwan_date,
    appointment_date, 
    time_24h,
    appointment_time, 
    status, 
    appointment_status,
    notes,
    status_tag 
  } = appointment
  
  // 使用新欄位名稱，向下相容舊欄位
  const dateField = taiwan_date || appointment_date
  const timeField = time_24h || appointment_time
  
  const actualStatus = status || appointment_status || '尚未報到'
  
  // 1. 超時預約（紅色）
  if (isOvertimeAppointment(dateField, timeField, actualStatus)) {
    return {
      bgClass: 'bg-gradient-to-r from-red-500/80 to-red-600/80',
      hoverClass: 'hover:from-red-600 hover:to-red-700',
      label: '超時'
    }
  }
  
  // 2. 內不佔用（紫色）
  if (isNonOccupiedAppointment(notes, status_tag)) {
    return {
      bgClass: 'bg-gradient-to-r from-purple-500/80 to-purple-600/80',
      hoverClass: 'hover:from-purple-600 hover:to-purple-700',
      label: '內不佔用'
    }
  }
  
  // 3. 歷史預約（灰色）
  if (isHistoricalAppointment(dateField)) {
    return {
      bgClass: 'bg-gradient-to-r from-gray-500/60 to-gray-600/60',
      hoverClass: 'hover:from-gray-600 hover:to-gray-700',
      label: '歷史'
    }
  }
  
  // 4. 已完成（綠色）
  if (actualStatus === '已完成') {
    return {
      bgClass: 'bg-gradient-to-r from-green-500/80 to-green-600/80',
      hoverClass: 'hover:from-green-600 hover:to-green-700',
      label: '已完成'
    }
  }
  
  // 5. 已取消（深紅色）
  if (actualStatus === '已取消') {
    return {
      bgClass: 'bg-gradient-to-r from-rose-500/80 to-rose-600/80',
      hoverClass: 'hover:from-rose-600 hover:to-rose-700',
      label: '已取消'
    }
  }
  
  // 6. 進行中（藍色）
  if (actualStatus === '進行中') {
    return {
      bgClass: 'bg-gradient-to-r from-blue-500/80 to-blue-600/80',
      hoverClass: 'hover:from-blue-600 hover:to-blue-700',
      label: '進行中'
    }
  }
  
  // 7. 一般預約（黃橙色）
  return {
    bgClass: 'bg-gradient-to-r from-yellow-500/80 to-orange-500/80',
    hoverClass: 'hover:from-yellow-600 hover:to-orange-600',
    label: '預約'
  }
}

/**
 * 獲取預約在列表中的狀態徽章顏色
 */
export function getStatusBadgeColor(status) {
  switch (status) {
    case '尚未報到':
      return 'bg-yellow-500/20 text-yellow-300'
    case '已報到':
      return 'bg-blue-500/20 text-blue-300'
    case '進行中':
      return 'bg-purple-500/20 text-purple-300'
    case '已完成':
      return 'bg-green-500/20 text-green-300'
    case '已取消':
      return 'bg-red-500/20 text-red-300'
    default:
      return 'bg-gray-500/20 text-gray-300'
  }
}
