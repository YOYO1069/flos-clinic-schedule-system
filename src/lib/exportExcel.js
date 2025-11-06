import * as XLSX from 'xlsx'
import { formatDate, formatTime } from './dateUtils'

// 匯出預約資料為Excel
export const exportAppointmentsToExcel = (appointments, filename) => {
  if (!appointments || appointments.length === 0) {
    alert('沒有資料可以匯出')
    return
  }

  // 準備資料 - 按照標準格式匯出
  const data = appointments.map(apt => ({
    '日期': apt.taiwan_date || apt.appointment_date || '',
    '時間': apt.time_24h || (apt.appointment_time ? apt.appointment_time.substring(0, 5) : ''),
    '客人姓名': apt.patient_name || apt.customer_name || '',
    '聯絡電話': apt.phone || apt.contact_phone || '',
    'LINE ID': apt.line_id || '',
    '療程項目': apt.treatment || '',
    '使用房間': apt.room || '',
    '執行人員': apt.executor || apt.staff || '',
    '諮詢師': apt.consultant || '',
    '跟診人員': apt.assistant || apt.nurse || '',
    '主治醫師': apt.on_duty_doctor || apt.doctor || '',
    '使用設備': apt.equipment || '',
    '預約狀態': apt.status || apt.appointment_status || '',
    '資料來源': apt.source || '',
    '備註': apt.notes || '',
  }))

  // 建立工作簿
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '預約資料')

  // 設定欄位寬度
  const columnWidths = [
    { wch: 12 },  // 日期
    { wch: 10 },  // 時間
    { wch: 15 },  // 客人姓名
    { wch: 15 },  // 聯絡電話
    { wch: 15 },  // LINE ID
    { wch: 30 },  // 療程項目
    { wch: 10 },  // 使用房間
    { wch: 15 },  // 執行人員
    { wch: 12 },  // 諮詢師
    { wch: 12 },  // 跟診人員
    { wch: 12 },  // 主治醫師
    { wch: 15 },  // 使用設備
    { wch: 12 },  // 預約狀態
    { wch: 12 },  // 資料來源
    { wch: 50 },  // 備註
  ]
  worksheet['!cols'] = columnWidths

  // 產生檔案名稱
  const finalFilename = filename || `FLOS預約資料_${formatDate(new Date())}.xlsx`

  // 匯出檔案
  XLSX.writeFile(workbook, finalFilename)
}

// 匯出客戶資料為Excel
export const exportCustomersToExcel = (customers, filename) => {
  if (!customers || customers.length === 0) {
    alert('沒有資料可以匯出')
    return
  }

  // 準備資料
  const data = customers.map(customer => ({
    '客戶編號': customer.customer_code || '',
    '姓名': customer.name || '',
    '電話': customer.phone || '',
    'LINE ID': customer.line_id || '',
    'Email': customer.email || '',
    '生日': customer.birth_date || '',
    '性別': customer.gender || '',
    '身分類別': customer.identity_type || '',
    'VIP狀態': customer.vip_status ? '是' : '否',
    '業配標記': customer.sponsored ? '是' : '否',
    '地址': customer.address || '',
    '緊急聯絡人': customer.emergency_contact || '',
    '緊急聯絡電話': customer.emergency_phone || '',
    '備註': customer.notes || '',
  }))

  // 建立工作簿
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '客戶資料')

  // 設定欄位寬度
  const columnWidths = [
    { wch: 12 },  // 客戶編號
    { wch: 15 },  // 姓名
    { wch: 15 },  // 電話
    { wch: 15 },  // LINE ID
    { wch: 25 },  // Email
    { wch: 12 },  // 生日
    { wch: 8 },   // 性別
    { wch: 12 },  // 身分類別
    { wch: 10 },  // VIP狀態
    { wch: 10 },  // 業配標記
    { wch: 40 },  // 地址
    { wch: 15 },  // 緊急聯絡人
    { wch: 15 },  // 緊急聯絡電話
    { wch: 50 },  // 備註
  ]
  worksheet['!cols'] = columnWidths

  // 產生檔案名稱
  const finalFilename = filename || `FLOS客戶資料_${formatDate(new Date())}.xlsx`

  // 匯出檔案
  XLSX.writeFile(workbook, finalFilename)
}

// 匯出療程資料為Excel
export const exportTreatmentsToExcel = (treatments, filename) => {
  if (!treatments || treatments.length === 0) {
    alert('沒有資料可以匯出')
    return
  }

  // 準備資料
  const data = treatments.map(treatment => ({
    '分類': treatment.category || '',
    '療程名稱': treatment.name || '',
    '標準價格': treatment.standard_price || '',
    '體驗價格': treatment.experience_price || '',
    '曜獨家價格': treatment.exclusive_price || '',
    '療程時間(分鐘)': treatment.duration_minutes || '',
    '說明': treatment.description || '',
    '狀態': treatment.is_active ? '啟用' : '停用',
  }))

  // 建立工作簿
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '療程資料')

  // 設定欄位寬度
  const columnWidths = [
    { wch: 15 },  // 分類
    { wch: 40 },  // 療程名稱
    { wch: 12 },  // 標準價格
    { wch: 12 },  // 體驗價格
    { wch: 12 },  // 曜獨家價格
    { wch: 15 },  // 療程時間
    { wch: 50 },  // 說明
    { wch: 10 },  // 狀態
  ]
  worksheet['!cols'] = columnWidths

  // 產生檔案名稱
  const finalFilename = filename || `FLOS療程資料_${formatDate(new Date())}.xlsx`

  // 匯出檔案
  XLSX.writeFile(workbook, finalFilename)
}
