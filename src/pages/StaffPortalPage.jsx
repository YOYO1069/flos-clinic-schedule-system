import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, DollarSign, Award, TrendingUp, Gift, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

// 員工資料
const STAFF_MEMBERS = [
  { name: '鍾醫師', position: '主治醫師', role: 'doctor' },
  { name: '王醫師', position: '主治醫師', role: 'doctor' },
  { name: '萬晴', position: '資深諮詢師', role: 'senior_consultant' },
  { name: '陳韻安', position: '資深諮詢師', role: 'senior_consultant' },
  { name: '劉哲軒', position: '專業諮詢師', role: 'consultant' },
  { name: '李文華', position: '專業諮詢師', role: 'consultant' },
  { name: '張耿齊', position: '專業諮詢師', role: 'consultant' },
  { name: '洪揚程', position: '專業諮詢師', role: 'consultant' },
  { name: '謝鑵翹', position: '專業諾詢師', role: 'consultant' },
  { name: '王筑句', position: '專業諾詢師', role: 'consultant' },
  { name: '米米', position: '專業諮詢師', role: 'consultant' },
  { name: '花', position: '專業諮詢師', role: 'consultant' },
  { name: '劉道玄', position: '護理師', role: 'nurse' },
  { name: '黃柏翰', position: '技術師', role: 'technician' },
  { name: '周稚凱', position: '專業諾詢師', role: 'consultant' },
  { name: '郭郁承', position: '專業諾詢師', role: 'consultant' },
  { name: '鐘曜任', position: '技術師', role: 'technician' },
]

// 職位顏色配置
const ROLE_COLORS = {
  doctor: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/30',
  senior_consultant: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-400/30',
  consultant: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-400/30',
  nurse: 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 border-orange-400/30',
  technician: 'bg-gradient-to-r from-rose-500/20 to-red-500/20 border-rose-400/30',
}

const ROLE_BADGE_COLORS = {
  doctor: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
  senior_consultant: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
  consultant: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
  nurse: 'bg-orange-500/20 text-orange-300 border-orange-400/30',
  technician: 'bg-rose-500/20 text-rose-300 border-rose-400/30',
}

function StaffPortalPage() {
  const navigate = useNavigate()
  const [currentTab, setCurrentTab] = useState('overview')
  const [staffBenefits, setStaffBenefits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStaffBenefits()
  }, [])

  const loadStaffBenefits = async () => {
    try {
      setLoading(true)
      // 這裡可以從資料庫載入員工福利資料
      // 目前使用模擬資料
      const mockData = STAFF_MEMBERS.map(staff => ({
        ...staff,
        annualLeave: Math.floor(Math.random() * 10) + 5,
        sickLeave: Math.floor(Math.random() * 30) + 10,
        mealAllowance: staff.role === 'doctor' ? 3000 : staff.role === 'senior_consultant' ? 2500 : 2000,
        transportAllowance: staff.role === 'doctor' ? 2000 : 1500,
        leaveUsageRate: Math.floor(Math.random() * 60) + 10,
        performanceScore: Math.floor(Math.random() * 30) + 70,
      }))
      setStaffBenefits(mockData)
    } catch (error) {
      console.error('載入員工福利資料失敗:', error)
      toast.error('載入資料失敗')
    } finally {
      setLoading(false)
    }
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-orange-400 mb-6">📊 員工福利總覽</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {staffBenefits.map((staff, index) => (
          <Card 
            key={index}
            className={`${ROLE_COLORS[staff.role]} backdrop-blur-xl border transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20`}
          >
            <CardContent className="p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xl font-bold text-orange-400">{staff.name}</h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${ROLE_BADGE_COLORS[staff.role]}`}>
                    {staff.position}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-3 text-center border border-white/10">
                  <div className="text-2xl font-bold text-orange-400">{staff.annualLeave}</div>
                  <div className="text-xs text-slate-400 mt-1">剩餘特休</div>
                </div>
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-3 text-center border border-white/10">
                  <div className="text-2xl font-bold text-orange-400">{staff.sickLeave}</div>
                  <div className="text-xs text-slate-400 mt-1">剩餘病假</div>
                </div>
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-3 text-center border border-white/10">
                  <div className="text-2xl font-bold text-orange-400">${staff.mealAllowance.toLocaleString()}</div>
                  <div className="text-xs text-slate-400 mt-1">餐費補助</div>
                </div>
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-3 text-center border border-white/10">
                  <div className="text-2xl font-bold text-orange-400">${staff.transportAllowance.toLocaleString()}</div>
                  <div className="text-xs text-slate-400 mt-1">交通補助</div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">特休使用率</span>
                    <span className="text-orange-400 font-bold">{staff.leaveUsageRate}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-900/50 rounded-full overflow-hidden border border-white/10">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${staff.leaveUsageRate}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">績效評分</span>
                    <span className="text-emerald-400 font-bold">{staff.performanceScore}分</span>
                  </div>
                  <div className="w-full h-3 bg-slate-900/50 rounded-full overflow-hidden border border-white/10">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${staff.performanceScore}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                  onClick={() => toast.info(`查看 ${staff.name} 的詳細資料`)}
                >
                  查看詳情
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-orange-400/30 text-orange-400 hover:bg-orange-500/10"
                  onClick={() => toast.info(`編輯 ${staff.name} 的福利設定`)}
                >
                  編輯福利
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderLeaveManagementTab = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-orange-400 mb-6">🏖️ 假期管理</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900/40 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-orange-400">📝 請假申請</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-orange-400 font-bold mb-2">申請人員</label>
              <select className="w-full px-4 py-2 bg-slate-900/50 border border-orange-400/30 rounded-lg text-white focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20">
                <option>請選擇員工</option>
                {STAFF_MEMBERS.map((staff, index) => (
                  <option key={index} value={staff.name}>{staff.name} ({staff.position})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-orange-400 font-bold mb-2">假期類型</label>
              <select className="w-full px-4 py-2 bg-slate-900/50 border border-orange-400/30 rounded-lg text-white focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20">
                <option>特休假</option>
                <option>病假</option>
                <option>事假</option>
                <option>產假</option>
                <option>陪產假</option>
                <option>喪假</option>
                <option>婚假</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-orange-400 font-bold mb-2">開始日期</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-2 bg-slate-900/50 border border-orange-400/30 rounded-lg text-white focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                />
              </div>
              <div>
                <label className="block text-orange-400 font-bold mb-2">結束日期</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-2 bg-slate-900/50 border border-orange-400/30 rounded-lg text-white focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-orange-400 font-bold mb-2">請假原因</label>
              <textarea 
                rows="3"
                placeholder="請說明請假原因"
                className="w-full px-4 py-2 bg-slate-900/50 border border-orange-400/30 rounded-lg text-white focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
              />
            </div>

            <Button
              className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white"
              onClick={() => toast.success('請假申請已提交')}
            >
              📤 提交申請
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-orange-400">📅 假期行事曆</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-slate-400 py-8">
              假期行事曆功能開發中...
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderAllowanceTab = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-orange-400 mb-6">💰 津貼補助管理</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-slate-900/40 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-orange-400 flex items-center gap-2">
              <span>🍽️</span>
              <span>餐費補助</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1">醫師餐費補助</label>
              <input 
                type="number" 
                defaultValue="3000"
                className="w-full px-3 py-2 bg-slate-900/50 border border-orange-400/30 rounded-lg text-white focus:outline-none focus:border-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">諮詢師餐費補助</label>
              <input 
                type="number" 
                defaultValue="2500"
                className="w-full px-3 py-2 bg-slate-900/50 border border-orange-400/30 rounded-lg text-white focus:outline-none focus:border-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">護理師餐費補助</label>
              <input 
                type="number" 
                defaultValue="2000"
                className="w-full px-3 py-2 bg-slate-900/50 border border-orange-400/30 rounded-lg text-white focus:outline-none focus:border-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">技術師餐費補助</label>
              <input 
                type="number" 
                defaultValue="2000"
                className="w-full px-3 py-2 bg-slate-900/50 border border-orange-400/30 rounded-lg text-white focus:outline-none focus:border-orange-400"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-orange-400 flex items-center gap-2">
              <span>🚗</span>
              <span>交通補助</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1">醫師交通補助</label>
              <input 
                type="number" 
                defaultValue="2000"
                className="w-full px-3 py-2 bg-slate-900/50 border border-orange-400/30 rounded-lg text-white focus:outline-none focus:border-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">諮詢師交通補助</label>
              <input 
                type="number" 
                defaultValue="1500"
                className="w-full px-3 py-2 bg-slate-900/50 border border-orange-400/30 rounded-lg text-white focus:outline-none focus:border-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">護理師交通補助</label>
              <input 
                type="number" 
                defaultValue="1500"
                className="w-full px-3 py-2 bg-slate-900/50 border border-orange-400/30 rounded-lg text-white focus:outline-none focus:border-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">技術師交通補助</label>
              <input 
                type="number" 
                defaultValue="1500"
                className="w-full px-3 py-2 bg-slate-900/50 border border-orange-400/30 rounded-lg text-white focus:outline-none focus:border-orange-400"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-orange-400 flex items-center gap-2">
              <span>📚</span>
              <span>教育訓練</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1">年度教育訓練預算</label>
              <input 
                type="number" 
                placeholder="每人年度預算"
                className="w-full px-3 py-2 bg-slate-900/50 border border-orange-400/30 rounded-lg text-white focus:outline-none focus:border-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">外部課程補助比例</label>
              <input 
                type="number" 
                placeholder="補助百分比"
                className="w-full px-3 py-2 bg-slate-900/50 border border-orange-400/30 rounded-lg text-white focus:outline-none focus:border-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">證照考試補助</label>
              <input 
                type="number" 
                placeholder="每次補助金額"
                className="w-full px-3 py-2 bg-slate-900/50 border border-orange-400/30 rounded-lg text-white focus:outline-none focus:border-orange-400"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white"
          onClick={() => toast.success('津貼設定已儲存')}
        >
          💾 儲存設定
        </Button>
      </div>
    </div>
  )

  const renderInsuranceTab = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-orange-400 mb-6">🛡️ 保險福利</h3>
      
      <Card className="bg-slate-900/40 backdrop-blur-xl border-white/10">
        <CardContent className="p-8 text-center">
          <div className="text-slate-400 text-lg">保險福利功能開發中...</div>
          <div className="mt-4 flex gap-4 justify-center">
            <Button
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
              onClick={() => toast.info('計算保險成本功能開發中')}
            >
              📊 計算保險成本
            </Button>
            <Button
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
              onClick={() => toast.info('管理團保功能開發中')}
            >
              🛡️ 管理團保
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderRewardTab = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-orange-400 mb-6">🏆 獎勵制度</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-900/40 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-orange-400">🎯 績效獎金</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-orange-400 font-bold mb-2">績效評核週期</label>
              <select className="w-full px-4 py-2 bg-slate-900/50 border border-orange-400/30 rounded-lg text-white focus:outline-none focus:border-orange-400">
                <option>月度評核</option>
                <option>季度評核</option>
                <option>年度評核</option>
              </select>
            </div>

            <div>
              <label className="block text-orange-400 font-bold mb-2">優秀績效獎金</label>
              <input 
                type="number" 
                placeholder="獎金金額"
                className="w-full px-4 py-2 bg-slate-900/50 border border-orange-400/30 rounded-lg text-white focus:outline-none focus:border-orange-400"
              />
            </div>

            <div>
              <label className="block text-orange-400 font-bold mb-2">良好績效獎金</label>
              <input 
                type="number" 
                placeholder="獎金金額"
                className="w-full px-4 py-2 bg-slate-900/50 border border-orange-400/30 rounded-lg text-white focus:outline-none focus:border-orange-400"
              />
            </div>

            <Button
              className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white"
              onClick={() => toast.success('績效獎金設定已儲存')}
            >
              💾 儲存設定
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-orange-400">🎁 節日獎金</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-orange-400 font-bold mb-2">春節獎金</label>
              <input 
                type="number" 
                placeholder="獎金金額"
                className="w-full px-4 py-2 bg-slate-900/50 border border-orange-400/30 rounded-lg text-white focus:outline-none focus:border-orange-400"
              />
            </div>

            <div>
              <label className="block text-orange-400 font-bold mb-2">端午獎金</label>
              <input 
                type="number" 
                placeholder="獎金金額"
                className="w-full px-4 py-2 bg-slate-900/50 border border-orange-400/30 rounded-lg text-white focus:outline-none focus:border-orange-400"
              />
            </div>

            <div>
              <label className="block text-orange-400 font-bold mb-2">中秋獎金</label>
              <input 
                type="number" 
                placeholder="獎金金額"
                className="w-full px-4 py-2 bg-slate-900/50 border border-orange-400/30 rounded-lg text-white focus:outline-none focus:border-orange-400"
              />
            </div>

            <div>
              <label className="block text-orange-400 font-bold mb-2">年終獎金</label>
              <input 
                type="number" 
                placeholder="獎金金額"
                className="w-full px-4 py-2 bg-slate-900/50 border border-orange-400/30 rounded-lg text-white focus:outline-none focus:border-orange-400"
              />
            </div>

            <Button
              className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white"
              onClick={() => toast.success('節日獎金設定已儲存')}
            >
              💾 儲存設定
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderReportTab = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-orange-400 mb-6">📈 福利報告</h3>
      
      <Card className="bg-slate-900/40 backdrop-blur-xl border-white/10">
        <CardContent className="p-8 text-center">
          <div className="text-slate-400 text-lg">福利報告功能開發中...</div>
          <div className="text-sm text-slate-500 mt-2">即將推出員工福利統計分析報表</div>
        </CardContent>
      </Card>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <div className="text-white text-xl">載入中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* 頂部導航欄 */}
      <header className="bg-gradient-to-r from-slate-900/60 via-blue-900/60 to-slate-900/60 backdrop-blur-xl border-b border-slate-700/30 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  🎁 員工福利追蹤系統
                </h1>
                <p className="text-xs text-blue-200 hidden sm:block">完整管理員工福利、假期、津貼與獎勵制度</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主要內容區 */}
      <main className="container mx-auto px-4 py-6">
        {/* 功能標籤 */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button
            onClick={() => setCurrentTab('overview')}
            className={`px-6 py-3 rounded-full font-bold transition-all duration-300 border-2 ${
              currentTab === 'overview'
                ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/50'
                : 'bg-orange-500/10 text-orange-400 border-orange-400/30 hover:bg-orange-500/20'
            }`}
          >
            📊 福利總覽
          </button>
          <button
            onClick={() => setCurrentTab('leave')}
            className={`px-6 py-3 rounded-full font-bold transition-all duration-300 border-2 ${
              currentTab === 'leave'
                ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/50'
                : 'bg-blue-500/10 text-blue-400 border-blue-400/30 hover:bg-blue-500/20'
            }`}
          >
            🏖️ 假期管理
          </button>
          <button
            onClick={() => setCurrentTab('allowance')}
            className={`px-6 py-3 rounded-full font-bold transition-all duration-300 border-2 ${
              currentTab === 'allowance'
                ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/50'
                : 'bg-amber-500/10 text-amber-400 border-amber-400/30 hover:bg-amber-500/20'
            }`}
          >
            💰 津貼補助
          </button>
          <button
            onClick={() => setCurrentTab('insurance')}
            className={`px-6 py-3 rounded-full font-bold transition-all duration-300 border-2 ${
              currentTab === 'insurance'
                ? 'bg-purple-500 text-white border-purple-500 shadow-lg shadow-purple-500/50'
                : 'bg-purple-500/10 text-purple-400 border-purple-400/30 hover:bg-purple-500/20'
            }`}
          >
            🛡️ 保險福利
          </button>
          <button
            onClick={() => setCurrentTab('reward')}
            className={`px-6 py-3 rounded-full font-bold transition-all duration-300 border-2 ${
              currentTab === 'reward'
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/50'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-400/30 hover:bg-emerald-500/20'
            }`}
          >
            🏆 獎勵制度
          </button>
          <button
            onClick={() => setCurrentTab('report')}
            className={`px-6 py-3 rounded-full font-bold transition-all duration-300 border-2 ${
              currentTab === 'report'
                ? 'bg-pink-500 text-white border-pink-500 shadow-lg shadow-pink-500/50'
                : 'bg-pink-500/10 text-pink-400 border-pink-400/30 hover:bg-pink-500/20'
            }`}
          >
            📈 福利報告
          </button>
        </div>

        {/* 內容區域 */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          {currentTab === 'overview' && renderOverviewTab()}
          {currentTab === 'leave' && renderLeaveManagementTab()}
          {currentTab === 'allowance' && renderAllowanceTab()}
          {currentTab === 'insurance' && renderInsuranceTab()}
          {currentTab === 'reward' && renderRewardTab()}
          {currentTab === 'report' && renderReportTab()}
        </div>
      </main>
    </div>
  )
}

export default StaffPortalPage
