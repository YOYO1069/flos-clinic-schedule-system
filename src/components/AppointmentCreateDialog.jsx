import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { DOCTORS, STAFF, ROOMS } from '@/constants/clinicData'

// 統一的資料庫表格名稱
const APPOINTMENTS_TABLE = 'flos_appointments_v2'

// 使用設備選項
const EQUIPMENT_OPTIONS = [
  '酷捷儀器', '震波儀', 'Anikine', 'Embody', 'Neo', 'Onda', 
  '埋線材料', '微針', '抽血設備', '水水床', '白白床', '皮秒雷射', 
  '英特波', '玻尿酸', 'MAX', '無'
]

// 預約狀態選項
const STATUS_OPTIONS = ['尚未報到', '已報到', '進行中', '已完成', '已取消']

// 資料來源選項
const SOURCE_OPTIONS = ['手動新增', '線上預約', '電話預約', 'LINE預約', '現場預約', '轉介紹', 'Google', 'FB / IG', '親友推薦', '道玄介紹', '委外', '行銷合作', '其他']

// 諾詢師選項
const CONSULTANT_OPTIONS = ['萬晴', '陳韻安', '劉哲軒', '李文華', '張耿齊', '洪揚程', '謝鑵翹', '王筑句', '米米', '花', '劉道玄', '黃柏翰', '周稚凱', '郭郁承', '鐘曜任']

// 跟診人員選項
const ASSISTANT_OPTIONS = ['安安', 'Gavin', '句句', '米', '花', 'gallan', '道玄', '陳祐翔', '翔翔', '無']

export function AppointmentCreateDialog({ open, onOpenChange, onSuccess, initialDate, initialTime }) {
  const [formData, setFormData] = useState({
    taiwan_date: initialDate || '', // 預約日期
    time_24h: initialTime || '', // 預約時間
    customer_name: '', // 客戶姓名
    customer_birthday: '', // 客戶生日
    contact_phone: '', // 聯絡電話
    treatment_item: '', // 療程項目
    room_used: '', // 使用房間
    equipment_used: '', // 使用設備
    customer_source: '', // 客戶來源
    appointment_status: '尚未報到', // 預約狀態
    data_source: '手動新增', // 資料來源
    consultant: '', // 諮詢師
    assistant: '', // 跟診人員
    attending_physician: '', // 主治醫師
    duration_hours: 1.0, // 療程時間（小時）
    notes: '', // 備註
  })
  const [loading, setLoading] = useState(false)

  // 初始化 useEffect 以處理 initialDate 和 initialTime
  React.useEffect(() => {
    setFormData(prev => ({
      ...prev,
      taiwan_date: initialDate || prev.taiwan_date,
      time_24h: initialTime || prev.time_24h,
    }))
  }, [initialDate, initialTime])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // 準備要插入的資料（使用 flos_appointments_v2 的欄位名稱）
    const dataToInsert = {
      taiwan_date: formData.taiwan_date,
      time_24h: formData.time_24h,
      customer_name: formData.customer_name,
      customer_birthday: formData.customer_birthday || null,
      contact_phone: formData.contact_phone || null,
      treatment_item: formData.treatment_item,
      room_used: formData.room_used || null,
      equipment_used: formData.equipment_used || null,
      customer_source: formData.customer_source || null,
      appointment_status: formData.appointment_status,
      data_source: formData.data_source,
      consultant: formData.consultant || null,
      assistant: formData.assistant || null,
      attending_physician: formData.attending_physician || null,
      treatment_duration_hours: formData.duration_hours || null,
      notes: formData.notes || null,
    }

    console.log('📝 新增預約到', APPOINTMENTS_TABLE, ':', dataToInsert)
    
    try {
      const { data, error } = await supabase
        .from(APPOINTMENTS_TABLE)
        .insert([dataToInsert])
        .select()

      if (error) {
        console.error('Supabase 錯誤:', error)
        throw error
      }

      console.log('✅ 新增成功:', data)
      toast.success('預約新增成功！')
      onSuccess?.()
      onOpenChange(false)
      
      // 重置表單
      setFormData({
        taiwan_date: initialDate || '',
        time_24h: initialTime || '',
        customer_name: '',
        customer_birthday: '',
        contact_phone: '',
        treatment_item: '',
        room_used: '',
        equipment_used: '',
        customer_source: '',
        appointment_status: '尚未報到',
        data_source: '手動新增',
        consultant: '',
        assistant: '',
        attending_physician: '',
        duration_hours: 1.0,
        notes: '',
      })
    } catch (error) {
      console.error('❌ 新增失敗:', error)
      toast.error('新增預約失敗：' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-[80vw] max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">新增預約</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 第一行：日期、時間 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taiwan_date" className="text-white">
                日期 <span className="text-red-400">*</span>
              </Label>
              <Input
                id="taiwan_date"
                type="date"
                value={formData.taiwan_date}
                onChange={(e) => handleChange('taiwan_date', e.target.value)}
                required
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time_24h" className="text-white">
                時間 <span className="text-red-400">*</span>
              </Label>
              <Input
                id="time_24h"
                type="time"
                step="1800"
                value={formData.time_24h}
                onChange={(e) => handleChange('time_24h', e.target.value)}
                required
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>

          {/* 第二行：客人姓名、客戶生日 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer_name" className="text-white">
                客人姓名 <span className="text-red-400">*</span>
              </Label>
              <Input
                id="customer_name"
                type="text"
                value={formData.customer_name}
                onChange={(e) => handleChange('customer_name', e.target.value)}
                required
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="請輸入客人姓名"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer_birthday" className="text-white">
                客戶生日
              </Label>
              <Input
                id="customer_birthday"
                type="date"
                value={formData.customer_birthday}
                onChange={(e) => handleChange('customer_birthday', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>

          {/* 第三行：聯絡電話、療程項目 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_phone" className="text-white">
                聯絡電話
              </Label>
              <Input
                id="contact_phone"
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => handleChange('contact_phone', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="請輸入聯絡電話"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="treatment_item" className="text-white">
                療程項目 <span className="text-red-400">*</span>
              </Label>
              <Input
                id="treatment_item"
                type="text"
                value={formData.treatment_item}
                onChange={(e) => handleChange('treatment_item', e.target.value)}
                required
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="請輸入療程項目"
              />
            </div>
          </div>

          {/* 第四行：使用房間、使用設備 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="room_used" className="text-white">
                使用房間
              </Label>
              <Select
                value={formData.room_used}
                onValueChange={(value) => handleChange('room_used', value)}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="選擇房間" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {ROOMS.map(room => (
                    <SelectItem key={room} value={room} className="text-white hover:bg-gray-700">
                      {room}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="equipment_used" className="text-white">
                使用設備
              </Label>
              <Select
                value={formData.equipment_used}
                onValueChange={(value) => handleChange('equipment_used', value)}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="例：皮秒雷射機" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {EQUIPMENT_OPTIONS.map(equipment => (
                    <SelectItem key={equipment} value={equipment} className="text-white hover:bg-gray-700">
                      {equipment}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 第五行：跟診人員、預約狀態 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assistant" className="text-white">
                跟診人員
              </Label>
              <Select
                value={formData.assistant}
                onValueChange={(value) => handleChange('assistant', value)}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="選擇人員" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {ASSISTANT_OPTIONS.map(assistant => (
                    <SelectItem key={assistant} value={assistant} className="text-white hover:bg-gray-700">
                      {assistant}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="appointment_status" className="text-white">
                預約狀態 <span className="text-red-400">*</span>
              </Label>
              <Select
                value={formData.appointment_status}
                onValueChange={(value) => handleChange('appointment_status', value)}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {STATUS_OPTIONS.map(status => (
                    <SelectItem key={status} value={status} className="text-white hover:bg-gray-700">
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 第六行：資料來源、諮詢師 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_source" className="text-white">
                資料來源
              </Label>
              <Select
                value={formData.data_source}
                onValueChange={(value) => handleChange('data_source', value)}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {SOURCE_OPTIONS.map(source => (
                    <SelectItem key={source} value={source} className="text-white hover:bg-gray-700">
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="consultant" className="text-white">
                諮詢師
              </Label>
              <Select
                value={formData.consultant}
                onValueChange={(value) => handleChange('consultant', value)}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="選擇諮詢師" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {CONSULTANT_OPTIONS.map(consultant => (
                    <SelectItem key={consultant} value={consultant} className="text-white hover:bg-gray-700">
                      {consultant}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 第七行：跟診人員、主治醫師 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer_source" className="text-white">
                客戶來源
              </Label>
              <Select
                value={formData.customer_source}
                onValueChange={(value) => handleChange('customer_source', value)}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="選擇客戶來源" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {SOURCE_OPTIONS.map(source => (
                    <SelectItem key={source} value={source} className="text-white hover:bg-gray-700">
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="attending_physician" className="text-white">
                主治醫師
              </Label>
              <Select
                value={formData.attending_physician}
                onValueChange={(value) => handleChange('attending_physician', value)}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="選擇醫師" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {DOCTORS.map(doctor => (
                    <SelectItem key={doctor} value={doctor} className="text-white hover:bg-gray-700">
                      {doctor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 第八行：療程時間 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration_hours" className="text-white">
                療程時間（小時）
              </Label>
              <Input
                id="duration_hours"
                type="number"
                step="0.5"
                min="0"
                value={formData.duration_hours}
                onChange={(e) => handleChange('duration_hours', parseFloat(e.target.value) || 0)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="1.0小時"
              />
            </div>
          </div>

          {/* 備註 */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-white">
              備註
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
              placeholder="輸入備註資訊..."
            />
          </div>

          {/* 提交按鈕 */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-700 text-white hover:bg-gray-800"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? '新增中...' : '新增預約'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
