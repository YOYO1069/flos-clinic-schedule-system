import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

export default function ScheduleDialog({ 
  isOpen, 
  onClose, 
  selectedDate, 
  type = 'doctor', // 'doctor' or 'staff'
  onSuccess 
}) {
  const [doctors, setDoctors] = useState([])
  const [staff, setStaff] = useState([])
  const [selectedPersonnel, setSelectedPersonnel] = useState([])
  const [selectedShift, setSelectedShift] = useState(null)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadPersonnel()
      // 重置表單
      setSelectedPersonnel([])
      setSelectedShift(null)
      setNote('')
    }
  }, [isOpen, type])

  const loadPersonnel = async () => {
    try {
      if (type === 'doctor') {
        const { data, error } = await supabase
          .from('doctors')
          .select('*')
          .order('name')
        if (error) throw error
        setDoctors(data || [])
      } else {
        const { data, error } = await supabase
          .from('staff')
          .select('*')
          .order('name')
        if (error) throw error
        setStaff(data || [])
      }
    } catch (error) {
      console.error('載入人員失敗:', error)
      alert('載入人員失敗: ' + error.message)
    }
  }

  const handlePersonnelToggle = (id) => {
    setSelectedPersonnel(prev => {
      if (prev.includes(id)) {
        return prev.filter(p => p !== id)
      } else {
        // 醫師最多選2位
        if (type === 'doctor' && prev.length >= 2) {
          alert('醫師最多只能選擇2位')
          return prev
        }
        return [...prev, id]
      }
    })
  }

  const handleShiftSelect = (shift) => {
    setSelectedShift(shift)
  }

  const handleSubmit = async () => {
    // 驗證
    if (selectedPersonnel.length === 0) {
      alert(`請至少選擇1位${type === 'doctor' ? '醫師' : '員工'}`)
      return
    }
    if (!selectedShift) {
      alert('請選擇班次時間')
      return
    }

    setLoading(true)

    try {
      const dateStr = selectedDate.toISOString().split('T')[0]
      
      // 為每位選中的人員建立排班記錄
      const schedules = selectedPersonnel.map(personnelId => ({
        [type === 'doctor' ? 'doctor_id' : 'staff_id']: personnelId,
        date: dateStr,
        start_time: selectedShift.startTime,
        end_time: selectedShift.endTime,
        note: note || null
      }))

      const tableName = type === 'doctor' ? 'doctor_schedules' : 'staff_schedules'
      
      const { error } = await supabase
        .from(tableName)
        .insert(schedules)

      if (error) throw error

      alert('排班新增成功!')
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('新增排班失敗:', error)
      alert('新增排班失敗: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const personnelList = type === 'doctor' ? doctors : staff
  const shifts = [
    { 
      id: 'weekday', 
      label: '平日班', 
      time: '12:00-20:30',
      startTime: '12:00',
      endTime: '20:30',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    { 
      id: 'saturday', 
      label: '週六班', 
      time: '10:30-19:00',
      startTime: '10:30',
      endTime: '19:00',
      color: 'bg-green-600 hover:bg-green-700'
    },
    { 
      id: 'off', 
      label: '休診', 
      time: '',
      startTime: '00:00',
      endTime: '00:00',
      color: 'bg-gray-600 hover:bg-gray-700'
    }
  ]

  const dateStr = selectedDate?.toLocaleDateString('zh-TW', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 標題列 */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">
            新增{type === 'doctor' ? '醫師' : '員工'}排班 - {dateStr}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 內容 */}
        <div className="p-6 space-y-6">
          {/* 人員選擇 */}
          <div>
            <h3 className="text-white font-semibold mb-3">
              選擇值班{type === 'doctor' ? '醫師' : '員工'} 
              {type === 'doctor' && <span className="text-sm text-gray-400 ml-2">(可選1-2位)</span>}
              {type === 'staff' && <span className="text-sm text-gray-400 ml-2">(可選多位)</span>}
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {personnelList.map((person) => (
                <button
                  key={person.id}
                  onClick={() => handlePersonnelToggle(person.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedPersonnel.includes(person.id)
                      ? 'border-blue-500 bg-blue-600/30 text-white'
                      : 'border-slate-600 bg-slate-700/30 text-gray-300 hover:border-slate-500'
                  }`}
                >
                  <div className="font-medium">{person.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 班次選擇 */}
          <div>
            <h3 className="text-white font-semibold mb-3">選擇班次時間</h3>
            <div className="grid grid-cols-3 gap-3">
              {shifts.map((shift) => (
                <button
                  key={shift.id}
                  onClick={() => handleShiftSelect(shift)}
                  className={`p-4 rounded-lg transition-all ${
                    selectedShift?.id === shift.id
                      ? shift.color + ' ring-2 ring-white'
                      : shift.color + ' opacity-70'
                  }`}
                >
                  <div className="text-white font-bold">{shift.label}</div>
                  {shift.time && (
                    <div className="text-white/80 text-sm mt-1">{shift.time}</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 備註 */}
          <div>
            <h3 className="text-white font-semibold mb-3">備註 (選填)</h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="輸入備註..."
              className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
        </div>

        {/* 按鈕列 */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="border-slate-600 text-white hover:bg-slate-700"
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? '處理中...' : '確認新增'}
          </Button>
        </div>
      </div>
    </div>
  )
}
