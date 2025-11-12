import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { Calendar, FileText, CheckCircle, XCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'

const LEAVE_TYPES = {
  annual: '年假',
  sick: '病假',
  personal: '事假',
  marriage: '婚假',
  maternity: '產假',
  paternity: '陪產假',
  bereavement: '喪假',
  other: '其他'
}

const STATUS_CONFIG = {
  pending: { label: '待審核', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  approved: { label: '已核准', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: '已拒絕', color: 'bg-red-100 text-red-800', icon: XCircle },
  cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-800', icon: XCircle }
}

export default function LeavePage() {
  const [loading, setLoading] = useState(false)
  const [leaveRequests, setLeaveRequests] = useState([])
  const [formData, setFormData] = useState({
    leave_type: 'annual',
    start_date: '',
    end_date: '',
    reason: ''
  })

  useEffect(() => {
    fetchLeaveRequests()
  }, [])

  const fetchLeaveRequests = async () => {
    const { data, error } = await supabase
      .from('leave_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) {
      setLeaveRequests(data || [])
    }
  }

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.start_date || !formData.end_date || !formData.reason) {
      alert('請填寫完整資訊')
      return
    }

    setLoading(true)
    try {
      const days = calculateDays(formData.start_date, formData.end_date)

      const { data, error } = await supabase
        .from('leave_requests')
        .insert([
          {
            employee_id: 1, // 暫時使用固定 ID
            leave_type: formData.leave_type,
            start_date: formData.start_date,
            end_date: formData.end_date,
            days: days,
            reason: formData.reason,
            status: 'pending'
          }
        ])
        .select()

      if (error) throw error

      alert('請假申請已提交!')
      setFormData({
        leave_type: 'annual',
        start_date: '',
        end_date: '',
        reason: ''
      })
      fetchLeaveRequests()
    } catch (error) {
      alert('提交失敗: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 標題 */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">請假管理系統</h1>
          <p className="text-slate-600 mt-1">FLOS 曜診所請假申請與查詢</p>
        </div>

        {/* 請假申請表單 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              請假申請
            </CardTitle>
            <CardDescription>填寫以下資訊提交請假申請</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leave_type">請假類型</Label>
                  <Select
                    value={formData.leave_type}
                    onValueChange={(value) => setFormData({ ...formData, leave_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(LEAVE_TYPES).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>請假天數</Label>
                  <div className="p-2 bg-slate-100 rounded-md text-center font-semibold">
                    {formData.start_date && formData.end_date
                      ? `${calculateDays(formData.start_date, formData.end_date)} 天`
                      : '請選擇日期'}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start_date">開始日期</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">結束日期</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">請假事由</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="請詳細說明請假原因..."
                  rows={4}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700"
                size="lg"
                disabled={loading}
              >
                {loading ? '提交中...' : '提交請假申請'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 請假記錄 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              請假記錄
            </CardTitle>
            <CardDescription>查看所有請假申請記錄</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaveRequests.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  尚無請假記錄
                </div>
              ) : (
                leaveRequests.map((request) => {
                  const StatusIcon = STATUS_CONFIG[request.status].icon
                  return (
                    <div
                      key={request.id}
                      className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-lg">
                              {LEAVE_TYPES[request.leave_type]}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${STATUS_CONFIG[request.status].color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {STATUS_CONFIG[request.status].label}
                            </span>
                          </div>
                          <div className="text-sm text-slate-600 space-y-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(request.start_date), 'yyyy/MM/dd')} - {format(new Date(request.end_date), 'yyyy/MM/dd')}
                              <span className="text-purple-600 font-medium">({request.days} 天)</span>
                            </div>
                            <div className="text-slate-700">
                              事由: {request.reason}
                            </div>
                            <div className="text-xs text-slate-500">
                              申請時間: {format(new Date(request.created_at), 'yyyy/MM/dd HH:mm')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
