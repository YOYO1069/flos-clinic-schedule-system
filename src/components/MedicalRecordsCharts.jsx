import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

/**
 * 病歷數據視覺化組件
 * 將統計數據製作成視覺化圖表
 */
const MedicalRecordsCharts = ({ appointments = [] }) => {
  // 計算統計數據
  const calculateStats = () => {
    const uniquePatients = new Set(appointments.map(apt => apt.user_name)).size;
    const totalVisits = appointments.length;
    
    // 活躍病患 (近3個月有就診)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const activePatients = new Set(
      appointments
        .filter(apt => new Date(apt.date) >= threeMonthsAgo)
        .map(apt => apt.user_name)
    ).size;
    
    // 新增病患 (近3個月首次就診)
    const patientFirstVisit = {};
    appointments.forEach(apt => {
      const name = apt.user_name;
      const date = new Date(apt.date);
      if (!patientFirstVisit[name] || date < patientFirstVisit[name]) {
        patientFirstVisit[name] = date;
      }
    });
    const newPatients = Object.values(patientFirstVisit)
      .filter(date => date >= threeMonthsAgo).length;
    
    return { uniquePatients, totalVisits, activePatients, newPatients };
  };

  const stats = calculateStats();

  // 準備圓餅圖數據 (病患活躍度)
  const pieData = [
    { name: '活躍病患', value: stats.activePatients, color: '#10b981' },
    { name: '非活躍病患', value: stats.uniquePatients - stats.activePatients, color: '#6b7280' }
  ];

  // 準備長條圖數據 (統計對比)
  const barData = [
    { name: '總病患數', value: stats.uniquePatients, color: '#3b82f6' },
    { name: '活躍病患', value: stats.activePatients, color: '#10b981' },
    { name: '新增病患', value: stats.newPatients, color: '#f59e0b' }
  ];

  // 準備折線圖數據 (每月就診趨勢)
  const getMonthlyTrend = () => {
    const monthlyData = {};
    appointments.forEach(apt => {
      const date = new Date(apt.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });
    
    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6) // 最近6個月
      .map(([month, count]) => ({
        month: month.substring(5), // 只顯示月份
        visits: count
      }));
  };

  const monthlyTrend = getMonthlyTrend();

  // 準備區域圖數據 (累積病患成長)
  const getCumulativeGrowth = () => {
    const patientFirstVisit = {};
    appointments.forEach(apt => {
      const name = apt.user_name;
      const date = new Date(apt.date);
      if (!patientFirstVisit[name] || date < patientFirstVisit[name]) {
        patientFirstVisit[name] = date;
      }
    });

    const monthlyNew = {};
    Object.values(patientFirstVisit).forEach(date => {
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyNew[monthKey] = (monthlyNew[monthKey] || 0) + 1;
    });

    let cumulative = 0;
    return Object.entries(monthlyNew)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, count]) => {
        cumulative += count;
        return {
          month: month.substring(5),
          total: cumulative,
          new: count
        };
      });
  };

  const cumulativeGrowth = getCumulativeGrowth();

  return (
    <div className="space-y-6">
      {/* 折線圖 - 每月就診趨勢 */}
      <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">📈</span>
            每月就診趨勢
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="visits" 
                name="就診次數"
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 長條圖 - 統計對比 */}
      <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            病患統計對比
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Bar 
                dataKey="value" 
                name="數量"
                radius={[8, 8, 0, 0]}
              >
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 圓餅圖 - 病患活躍度 */}
        <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🥧</span>
              病患活躍度分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 區域圖 - 累積病患成長 */}
        <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📉</span>
              累積病患成長
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={cumulativeGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  name="累積病患"
                  stroke="#8b5cf6" 
                  fill="url(#colorTotal)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 統計摘要卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="backdrop-blur-xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 border-white/20 shadow-xl text-white">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{stats.uniquePatients}</div>
              <div className="text-sm opacity-90">總病患數</div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-gradient-to-br from-green-500/90 to-green-600/90 border-white/20 shadow-xl text-white">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{stats.totalVisits}</div>
              <div className="text-sm opacity-90">總就診次數</div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-gradient-to-br from-emerald-500/90 to-emerald-600/90 border-white/20 shadow-xl text-white">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{stats.activePatients}</div>
              <div className="text-sm opacity-90">活躍病患</div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-gradient-to-br from-orange-500/90 to-orange-600/90 border-white/20 shadow-xl text-white">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{stats.newPatients}</div>
              <div className="text-sm opacity-90">新增病患</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MedicalRecordsCharts;
