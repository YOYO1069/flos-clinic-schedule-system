import { useState, useEffect } from 'react'
import { UserPlus, Trash2, Edit, Users, UserCog } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

export default function StaffManagement() {
  const [doctors, setDoctors] = useState([])
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('doctors')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPerson, setEditingPerson] = useState(null)

  // 表單狀態
  const [formData, setFormData] = useState({
    name: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    await Promise.all([loadDoctors(), loadStaff()])
    setLoading(false)
  }

  const loadDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('name')

      if (error) throw error
      setDoctors(data || [])
    } catch (error) {
      console.error('載入醫師列表失敗:', error)
    }
  }

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
    }
  }

  const handleAdd = () => {
    setEditingPerson(null)
    setFormData({
      name: ''
    })
    setShowAddModal(true)
  }

  const handleEdit = (person) => {
    setEditingPerson(person)
    setFormData({
      name: person.name || ''
    })
    setShowAddModal(true)
  }

  const handleSave = async () => {
    try {
      const table = activeTab === 'doctors' ? 'doctors' : 'staff'
      
      if (editingPerson) {
        // 更新
        const { error } = await supabase
          .from(table)
          .update(formData)
          .eq('id', editingPerson.id)

        if (error) throw error
        alert('更新成功!')
      } else {
        // 新增
        const { error } = await supabase
          .from(table)
          .insert([{
            ...formData,
            is_active: true
          }])

        if (error) throw error
        alert('新增成功!')
      }

      setShowAddModal(false)
      loadData()
    } catch (error) {
      console.error('儲存失敗:', error)
      alert('儲存失敗: ' + error.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('確定要刪除此人員嗎?刪除後相關排班資料也會一併移除。')) {
      return
    }

    try {
      const table = activeTab === 'doctors' ? 'doctors' : 'staff'
      
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)

      if (error) throw error
      
      alert('刪除成功!')
      loadData()
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

  const currentList = activeTab === 'doctors' ? doctors : staff

  return (
    <div className="space-y-6">
      {/* 切換標籤 */}
      <div className="flex gap-4">
        <Button
          variant={activeTab === 'doctors' ? 'default' : 'outline'}
          className={activeTab === 'doctors' ? 'bg-blue-600' : 'border-slate-600 text-white'}
          onClick={() => setActiveTab('doctors')}
        >
          <Users className="w-4 h-4 mr-2" />
          醫師管理 ({doctors.length})
        </Button>
        <Button
          variant={activeTab === 'staff' ? 'default' : 'outline'}
          className={activeTab === 'staff' ? 'bg-green-600' : 'border-slate-600 text-white'}
          onClick={() => setActiveTab('staff')}
        >
          <UserCog className="w-4 h-4 mr-2" />
          員工管理 ({staff.length})
        </Button>
      </div>

      {/* 新增按鈕 */}
      <div className="flex justify-end">
        <Button
          className={activeTab === 'doctors' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}
          onClick={handleAdd}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          新增{activeTab === 'doctors' ? '醫師' : '員工'}
        </Button>
      </div>

      {/* 人員列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentList.map((person) => (
          <Card 
            key={person.id}
            className="bg-slate-800/50 border-slate-700/50"
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg flex items-center justify-between">
                <span>{person.name}</span>
                {person.is_active && (
                  <span className="text-xs bg-green-600 px-2 py-1 rounded">啟用中</span>
                )}
              </CardTitle>
            </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-blue-200 space-y-1">
                  <p>姓名: {person.name}</p>
                </div>

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-slate-600 text-white hover:bg-slate-700"
                  onClick={() => handleEdit(person)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  編輯
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-600 text-red-400 hover:bg-red-900/30"
                  onClick={() => handleDelete(person.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 如果沒有資料 */}
      {currentList.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">
            尚未新增{activeTab === 'doctors' ? '醫師' : '員工'}資料
          </p>
          <Button
            className={activeTab === 'doctors' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}
            onClick={handleAdd}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            新增第一位{activeTab === 'doctors' ? '醫師' : '員工'}
          </Button>
        </div>
      )}

      {/* 新增/編輯對話框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">
                {editingPerson ? '編輯' : '新增'}{activeTab === 'doctors' ? '醫師' : '員工'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm text-blue-200 mb-2">姓名 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  placeholder="請輸入姓名"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 border-slate-600 text-white"
                  onClick={() => setShowAddModal(false)}
                >
                  取消
                </Button>
                <Button
                  className={`flex-1 ${activeTab === 'doctors' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
                  onClick={handleSave}
                  disabled={!formData.name}
                >
                  {editingPerson ? '更新' : '新增'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
