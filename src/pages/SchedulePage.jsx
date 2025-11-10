import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Users, UserCog, BarChart3, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DoctorSchedule from '@/components/schedule/DoctorSchedule'
import StaffSchedule from '@/components/schedule/StaffSchedule'
import StaffManagement from '@/components/schedule/StaffManagement'
import ScheduleCalendar from '@/components/schedule/ScheduleCalendar'

export default function SchedulePage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('calendar')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* 頂部導航欄 */}
      <header className="bg-gradient-to-r from-slate-900/60 via-blue-900/60 to-slate-900/60 backdrop-blur-xl border-b border-slate-700/30 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 md:space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.location.href = 'https://classy-biscotti-42a418.netlify.app/'}
                className="text-white hover:bg-white/10 w-8 h-8 md:w-10 md:h-10"
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-white">排班系統</h1>
                <p className="text-xs text-blue-200 hidden sm:block">醫師與員工排班管理</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-white border-white/20 hover:bg-white/10"
                onClick={() => setActiveTab('calendar')}
              >
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">匯出月曆</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 md:py-6">
        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-blue-900/40 backdrop-blur-xl border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-200">醫師總數</p>
                  <p className="text-2xl font-bold text-white">12</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-900/40 backdrop-blur-xl border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-200">員工總數</p>
                  <p className="text-2xl font-bold text-white">14</p>
                </div>
                <UserCog className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-900/40 backdrop-blur-xl border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-200">本月班表</p>
                  <p className="text-2xl font-bold text-white">30天</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-900/40 backdrop-blur-xl border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-200">排班完成率</p>
                  <p className="text-2xl font-bold text-white">85%</p>
                </div>
                <BarChart3 className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 主要內容區 - 標籤頁 */}
        <Card className="bg-blue-900/40 backdrop-blur-xl border-white/10">
          <CardContent className="p-4 md:p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
                <TabsTrigger value="calendar" className="data-[state=active]:bg-blue-600">
                  📅 日曆排班
                </TabsTrigger>
                <TabsTrigger value="doctor" className="data-[state=active]:bg-green-600">
                  👨‍⚕️ 醫師排班
                </TabsTrigger>
                <TabsTrigger value="staff" className="data-[state=active]:bg-purple-600">
                  👤 員工排班
                </TabsTrigger>
                <TabsTrigger value="management" className="data-[state=active]:bg-orange-600">
                  📊 人員管理
                </TabsTrigger>
              </TabsList>

              <TabsContent value="calendar" className="mt-6">
                <ScheduleCalendar />
              </TabsContent>

              <TabsContent value="doctor" className="mt-6">
                <DoctorSchedule />
              </TabsContent>

              <TabsContent value="staff" className="mt-6">
                <StaffSchedule />
              </TabsContent>

              <TabsContent value="management" className="mt-6">
                <StaffManagement />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
