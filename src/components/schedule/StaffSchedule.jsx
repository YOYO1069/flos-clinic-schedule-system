import { useState, useEffect } from 'react'
import { Calendar, Clock, Plus, Edit, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

export default function StaffSchedule() {
  const [staff, setStaff] = useState([])
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [saving, setSaving] = useState(false)

  // 表單狀態
  const [formData, setFormData] = useState({
    date: '',
    start_time: '',
    end_time: '',
    notes: ''
  })

  useEffect(() => {
    loadStaff()
    loadSchedules()
  }, [])

  const loadStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('name')

      if (error) throw error
      setStaff(data || [])
    } catch (error) {
      console.error('載入員工列表失敗:', error)
      alert('載入員工列表失敗: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadSchedules = async () => {
    try {
      // 載入本月和下個月的排班
      const today = new Date()
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1)
      const endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0)

      const { data, error } = await supabase
        .from('staff_schedules')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: false })

      if (error) throw error
      setSchedules(data || [])
    } catch (error) {
      console.error('載入排班資料失敗:', error)
    }
  }

  const getStaffSchedules = (staffId) => {
    return schedules.filter(s => s.staff_id === staffId)
  }

  const getTodaySchedule = (staffId) => {
    const today = new Date().toISOString().split('T')[0]
    return schedules.find(s => s.staff_id === staffId && s.date === today)
  }

  const toggleStaffStatus = async (staffId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('staff')
        .update({ is_active: !currentStatus })
        .eq('id', staffId)

      if (error) throw error
      
      loadStaff()
    } catch (error) {
      console.error('更新員工狀態失敗:', error)
      alert('更新失敗: ' + error.message)
    }
  }

  const handleAdd = (member) => {
    setSelectedStaff(member)
    setEditingSchedule(null)
    setFormData({
      date: new Date().toISOString().split('T')[0],
      start_time: '12:00',
      end_time: '20:30',
      notes: ''
    })
    setShowModal(true)
  }

  const handleEdit = (member, schedule) => {
    setSelectedStaff(member)
    setEditingSchedule(schedule)
    setFormData({
      date: schedule.date,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      notes: schedule.notes || ''
    })
    setShowModal(true)
  }

  const checkConflict = async (staffId, date, startTime, endTime, excludeId = null) => {
    try {
      let query = supabase
        .from('staff_schedules')
        .select('*')
        .eq('staff_id', staffId)
        .eq('date', date)

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      const { data, error } = await query

      if (error) throw error

      // 檢查時間衝突
      for (const schedule of data || []) {
        const existingStart = schedule.start_time
        const existingEnd = schedule.end_time

        // 檢查是否有重疊
        if (
          (startTime >= existingStart && startTime < existingEnd) ||
          (endTime > existingStart && endTime <= existingEnd) ||
          (startTime <= existingStart && endTime >= existingEnd)
        ) {
          return true // 有衝突
        }
      }

      return false // 無衝突
    } catch (error) {
      console.error('檢查衝突失敗:', error)
      return false
    }
  }

  const handleSave = async () => {
    // 驗證表單
    if (!formData.date || !formData.start_time || !formData.end_time) {
      alert('請填寫所有必填欄位')
      return
    }

    // 驗證時間邏輯
    if (formData.start_time >= formData.end_time) {
      alert('結束時間必須晚於開始時間')
      return
    }

    setSaving(true)

    try {
      // 檢查衝突
      const hasConflict = await checkConflict(
        selectedStaff.id,
        formData.date,
        formData.start_time,
        formData.end_time,
        editingSchedule?.id
      )

      if (hasConflict) {
        alert('此時段與現有排班衝突,請選擇其他時間')
        setSaving(false)
        return
      }

      if (editingSchedule) {
        // 更新
        const { error } = await supabase
          .from('staff_schedules')
          .update({
            date: formData.date,
            start_time: formData.start_time,
            end_time: formData.end_time,
            notes: formData.notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingSchedule.id)

        if (error) throw error
        alert('排班更新成功!')
      } else {
        // 新增
        const { error } = await supabase
          .from('staff_schedules')
          .insert([{
            staff_id: selectedStaff.id,
            date: formData.date,
            start_time: formData.start_time,
            end_time: formData.end_time,
            notes: formData.notes
          }])

        if (error) throw error
        alert('排班新增成功!')
      }

      setShowModal(false)
      loadSchedules()
    } catch (error) {
      console.error('儲存失敗:', error)
      alert('儲存失敗: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (scheduleId) => {
    if (!confirm('確定要刪除此排班嗎?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('staff_schedules')
        .delete()
        .eq('id', scheduleId)

      if (error) throw error

      alert('排班刪除成功!')
      loadSchedules()
    } catch (error) {
      console.error('刪除失敗:', error)
      alert('刪除失敗: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">載入中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 員工列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map((member) => {
          const memberSchedules = getStaffSchedules(member.id)
          const todaySchedule = getTodaySchedule(member.id)

          return (
            <Card 
              key={member.id}
              className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-all"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg flex items-center justify-between">
                  <span>{member.name}</span>
                  <div className="flex items-center gap-2">
                    {member.is_active ? (
                      <span className="text-xs bg-green-600 px-2 py-1 rounded">在班</span>
                    ) : (
                      <span className="text-xs bg-gray-600 px-2 py-1 rounded">休假</span>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-blue-200">
                  <p>近期班次: {memberSchedules.length} 次</p>
                </div>

                {todaySchedule && (
                  <div className="bg-green-900/30 rounded p-2 text-xs text-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>{todaySchedule.start_time} - {todaySchedule.end_time}</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(member, todaySchedule)}
                          className="p-1 hover:bg-green-700/50 rounded"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(todaySchedule.id)}
                          className="p-1 hover:bg-red-700/50 rounded text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 顯示近期排班 */}
                {memberSchedules.length > 0 && (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {memberSchedules.slice(0, 5).map((schedule) => (
                      <div
                        key={schedule.id}
                        className="bg-slate-700/30 rounded p-2 text-xs text-gray-300 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold">{schedule.date}</div>
                          <div className="text-green-300">{schedule.start_time} - {schedule.end_time}</div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(member, schedule)}
                            className="p-1 hover:bg-slate-600 rounded"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(schedule.id)}
                            className="p-1 hover:bg-red-700/50 rounded text-red-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleAdd(member)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    新增班表
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className={`border-slate-600 hover:bg-slate-700 ${
                      member.is_active ? 'text-green-400' : 'text-gray-400'
                    }`}
                    onClick={() => toggleStaffStatus(member.id, member.is_active)}
                  >
                    {member.is_active ? (
                      <ToggleRight className="w-5 h-5" />
                    ) : (
                      <ToggleLeft className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 如果沒有員工資料 */}
      {staff.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">尚未新增員工資料</p>
          <Button
            onClick={() => alert('請先到人員管理頁面新增員工')}
            className="bg-green-600 hover:bg-green-700"
          >
            前往人員管理
          </Button>
        </div>
      )}

      {/* 新增/編輯排班對話框 */}
      {showModal && selectedStaff && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">
                {editingSchedule ? '編輯排班' : '新增排班'} - {selectedStaff.name}
              </CardTitle>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm text-blue-200 mb-2">日期 *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-blue-200 mb-2">開始時間 *</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-blue-200 mb-2">結束時間 *</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  />
                </div>
              </div>



              <div>
                <label className="block text-sm text-blue-200 mb-2">備註</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  rows="3"
                  placeholder="選填,可記錄特殊事項"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 border-slate-600 text-white"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  取消
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? '儲存中...' : editingSchedule ? '更新' : '新增'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
