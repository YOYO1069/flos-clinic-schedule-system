import { useState, useEffect } from 'react'
import { 
  Calendar, FileText, Stethoscope, Trophy, 
  UserCog, Package, FileCheck,
  TrendingUp, Settings
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { useAppointments } from '@/hooks/useAppointments'

function HomePage() {
  const navigate = useNavigate()
  const { statistics } = useAppointments()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const functionCards = [
    {
      id: 'calendar',
      title: '預約管理',
      description: '智能排程系統\n醫師在場檢查',
      icon: Calendar,
      stats: `${statistics.totalAppointments} 今日預約`,
      color: 'primary',
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-500/20 to-blue-600/20',
      path: '/appointments',
      available: true
    },
    {
      id: 'medical-records',
      title: '病歷系統',
      description: '電子病歷管理\n療程記錄追蹤',
      icon: FileText,
      stats: `${statistics.uniquePatients} 總病患數`,
      color: 'secondary',
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-500/20 to-green-600/20',
      path: '/medical-records',
      available: true
    },
    {
      id: 'treatments',
      title: '療程管理',
      description: '療程項目設定\n價格體系管理',
      icon: Stethoscope,
      stats: `${statistics.uniqueTreatments} 進行中療程`,
      color: 'accent',
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-500/20 to-purple-600/20',
      path: '/treatments',
      available: false
    },
    {
      id: 'performance',
      title: '業績管理',
      description: '績效追蹤分析\n佣金計算系統',
      icon: Trophy,
      stats: '$0 本月營收',
      color: 'success',
      gradient: 'from-yellow-500 to-orange-500',
      bgGradient: 'from-yellow-500/20 to-orange-500/20',
      path: '/performance',
      available: false
    }
  ]

  const advancedCards = [
    {
      id: 'staff-portal',
      title: '員工專區',
      description: '員工打卡簽到 • 出勤記錄查詢',
      icon: UserCog,
      badge: 'NEW',
      badgeColor: 'bg-gradient-to-r from-green-500 to-emerald-500',
      gradient: 'from-teal-500 to-cyan-600',
      path: '/staff-portal',
      available: true,
      external: false
    },
    {
      id: 'scheduling',
      title: '排班系統',
      description: '醫師與員工排班管理 • 月曆輸出功能',
      icon: UserCog,
      badge: 'NEW',
      badgeColor: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      gradient: 'from-indigo-500 to-indigo-600',
      path: '/schedule',
      available: true,
      external: false
    },
    {
      id: 'inventory',
      title: '庫存管理',
      description: '智能庫存追蹤 • NFC掃描 • 自動補貨提醒',
      icon: Package,
      badge: 'HOT',
      badgeColor: 'bg-gradient-to-r from-red-500 to-pink-500',
      gradient: 'from-green-500 to-emerald-600',
      url: 'https://dulcet-pie-b9b0cc.netlify.app/',
      available: true,
      external: true
    },
    // 同意書範本已移至B方案開發階段
    // {
    //   id: 'consent',
    //   title: '同意書範本',
    //   description: '快速建立標準表單 • 多種治療同意書',
    //   icon: FileCheck,
    //   badge: 'PRO',
    //   badgeColor: 'bg-gradient-to-r from-purple-500 to-violet-500',
    //   gradient: 'from-violet-500 to-purple-600',
    //   path: '/consent-forms',
    //   available: true,
    //   external: false
    // }
  ]

  const handleCardClick = (card) => {
    if (card.available) {
      if (card.external) {
        window.open(card.url, '_blank')
      } else {
        navigate(card.path)
      }
    } else {
      alert('此功能尚在開發中,敬請期待!')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-x-hidden">
      {/* 背景星空效果 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-blue-900/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[20%] right-[20%] w-96 h-96 bg-slate-800/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
        <div className="absolute top-[50%] left-[50%] w-96 h-96 bg-blue-800/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
      </div>

      {/* 主要內容 */}
      <div className="relative z-10">
        {/* 品牌頭部 - 磨砂玻璃效果 */}
        <div className="border-b border-orange-500/20 bg-black/30 backdrop-blur-xl shadow-2xl">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2">
                  <span className="text-orange-500 drop-shadow-[0_0_20px_rgba(255,149,0,0.6)]">曜</span>
                  <span className="text-white">醫美診所</span>
                </h1>
                <p className="text-lg sm:text-xl text-gray-400 tracking-[2px] font-light mb-4">
                  Flos Medical Clinic
                </p>
              </div>

              <div className="flex items-center gap-4">
                <img 
                  src="/logo.png" 
                  alt="FLOS Logo" 
                  className="w-24 h-24 sm:w-32 sm:h-32 object-contain drop-shadow-[0_0_30px_rgba(100,200,200,0.5)]" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* 功能卡片區域 */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* 主要功能卡片 - 磨砂玻璃效果 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {functionCards.map((card) => {
              const Icon = card.icon
              return (
                <Card
                  key={card.id}
                  className={`
                    relative overflow-hidden cursor-pointer group
                    bg-gradient-to-br ${card.bgGradient}
                    border-2 border-white/10
                    backdrop-blur-xl
                    transition-all duration-500 ease-out
                    ${card.available 
                      ? 'hover:scale-105 hover:border-white/40 hover:shadow-[0_20px_60px_rgba(255,255,255,0.1)] hover:backdrop-blur-2xl' 
                      : 'opacity-60 cursor-not-allowed'
                    }
                  `}
                  onClick={() => handleCardClick(card)}
                >
                  {/* 卡片背景漸層動畫 */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                  
                  {/* 磨砂玻璃層 */}
                  <div className="absolute inset-0 bg-white/5 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <CardContent className="p-4 sm:p-6 relative z-10">
                    {/* 圖標 */}
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-3 sm:mb-4 shadow-lg group-hover:shadow-2xl transition-shadow duration-500`}>
                      <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>

                    {/* 內容 */}
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-300 mb-3 sm:mb-4 whitespace-pre-line leading-relaxed">
                      {card.description}
                    </p>

                    {/* 統計 */}
                    <div className="flex items-center justify-between">
                      <div className="text-orange-400 font-semibold text-sm sm:text-base">
                        {card.stats}
                      </div>
                      <div className="text-white/60 group-hover:text-white/90 transition-colors">
                        →
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* 進階功能卡片 - 磨砂玻璃效果 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {advancedCards.map((card) => {
              const Icon = card.icon
              return (
                <Card
                  key={card.id}
                  className={`
                    relative overflow-hidden cursor-pointer group
                    bg-black/40 border-2 border-white/10
                    backdrop-blur-xl
                    transition-all duration-500 ease-out
                    ${card.available 
                      ? 'hover:scale-105 hover:border-white/40 hover:shadow-[0_20px_60px_rgba(255,255,255,0.1)] hover:backdrop-blur-2xl' 
                      : 'opacity-60 cursor-not-allowed'
                    }
                  `}
                  onClick={() => handleCardClick(card)}
                >
                  {/* 磨砂玻璃層 */}
                  <div className="absolute inset-0 bg-white/5 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <CardContent className="p-4 sm:p-6 relative z-10">
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-shadow duration-500`}>
                        <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      </div>
                      <span className={`${card.badgeColor} text-white text-xs px-2 sm:px-3 py-1 rounded-full font-bold shadow-lg`}>
                        {card.badge}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                      {card.description}
                    </p>

                    <div className="mt-3 sm:mt-4 flex items-center text-orange-400 text-xs sm:text-sm font-medium group-hover:text-orange-300 transition-colors">
                      <span>{card.available ? '開啟系統' : '即將推出'}</span>
                      <span className="ml-2 group-hover:ml-3 transition-all">🔗</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* 統計儀表板 - 磨砂玻璃效果 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* 營運概況 */}
            <Card className="lg:col-span-2 bg-black/40 border-white/10 backdrop-blur-xl hover:backdrop-blur-2xl transition-all duration-500">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h4 className="text-lg sm:text-xl font-bold text-white flex items-center">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-orange-500" />
                    營運概況
                  </h4>
                  <button className="text-xs sm:text-sm text-orange-400 hover:text-orange-300 transition-colors">
                    查看詳細 →
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  <div className="text-center p-3 sm:p-4 bg-white/5 rounded-lg backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1">LINE</div>
                    <div className="text-xs text-gray-400">主要來源</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-white/5 rounded-lg backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1">7天</div>
                    <div className="text-xs text-gray-400">平均轉換週期</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-white/5 rounded-lg backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1">{statistics.uniquePatients}</div>
                    <div className="text-xs text-gray-400">高價值客戶</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-white/5 rounded-lg backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1">85%</div>
                    <div className="text-xs text-gray-400">客戶滿意度</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 系統資訊 */}
            <Card className="bg-black/40 border-white/10 backdrop-blur-xl hover:backdrop-blur-2xl transition-all duration-500">
              <CardContent className="p-4 sm:p-6">
                <h4 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-orange-500" />
                  系統資訊
                </h4>

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-all duration-300">
                    <span className="text-gray-400 text-xs sm:text-sm">系統版本</span>
                    <span className="text-white font-medium text-sm sm:text-base">v2.1</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-all duration-300">
                    <span className="text-gray-400 text-xs sm:text-sm">資料庫狀態</span>
                    <span className="text-green-400 font-medium text-sm sm:text-base">● 正常</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-all duration-300">
                    <span className="text-gray-400 text-xs sm:text-sm">最後更新</span>
                    <span className="text-white font-medium text-sm sm:text-base">
                      {currentTime.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-all duration-300">
                    <span className="text-gray-400 text-xs sm:text-sm">線上用戶</span>
                    <span className="text-white font-medium text-sm sm:text-base">1</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 底部資訊 - 磨砂玻璃效果 */}
        <div className="border-t border-white/10 bg-black/30 backdrop-blur-xl mt-8 sm:mt-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-center">
            <p className="text-gray-400 text-xs sm:text-sm mb-2">
              © 2025 FLOS曜診所管理系統 | 專業醫美服務 • 智能化管理 • 安全可靠
            </p>
            <p className="text-gray-500 text-xs">
              營業時間: 週一至週五 12:00-20:00, 週六 11:00-20:00 | 週日休診
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
