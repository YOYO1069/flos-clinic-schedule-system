import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Shield, Globe, Clock, AlertTriangle, ArrowLeft, RefreshCw, Ban } from "lucide-react";
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface VisitorLog {
  id: number;
  ip_address: string;
  user_agent: string;
  page_path: string;
  employee_id: string | null;
  employee_name: string | null;
  visited_at: string;
  created_at: string;
}

export default function SecurityDashboard() {
  const [, setLocation] = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [visitorLogs, setVisitorLogs] = useState<VisitorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredLogs, setFilteredLogs] = useState<VisitorLog[]>([]);

  // 更新當前時間
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 載入資料
  useEffect(() => {
    loadData();
    // 每15秒自動重新載入
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  // 搜尋過濾
  useEffect(() => {
    if (searchTerm) {
      const filtered = visitorLogs.filter(log =>
        log.ip_address.includes(searchTerm) ||
        log.page_path.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.employee_name && log.employee_name.includes(searchTerm))
      );
      setFilteredLogs(filtered);
    } else {
      setFilteredLogs(visitorLogs);
    }
  }, [searchTerm, visitorLogs]);

  async function loadData() {
    try {
      // 載入最近 100 筆訪客記錄
      const { data, error } = await supabase
        .from('visitor_logs')
        .select('*')
        .order('visited_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setVisitorLogs(data || []);
      setFilteredLogs(data || []);
    } catch (error) {
      console.error('載入訪客記錄失敗:', error);
    } finally {
      setLoading(false);
    }
  }

  // 統計資料
  const totalVisits = visitorLogs.length;
  const uniqueIPs = new Set(visitorLogs.map(log => log.ip_address)).size;
  const anonymousVisits = visitorLogs.filter(log => !log.employee_id).length;
  const employeeVisits = visitorLogs.filter(log => log.employee_id).length;

  // 最常訪問的 IP
  const ipCounts = visitorLogs.reduce((acc, log) => {
    acc[log.ip_address] = (acc[log.ip_address] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topIPs = Object.entries(ipCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // 格式化時間
  function formatTime(timeStr: string): string {
    try {
      const date = new Date(timeStr);
      return format(date, 'yyyy-MM-dd HH:mm:ss');
    } catch {
      return timeStr;
    }
  }

  // 判斷是否為陌生訪客
  function isStrangerVisit(log: VisitorLog): boolean {
    return !log.employee_id;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <p className="text-xl text-white">載入中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 標題列 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setLocation('/')} className="text-white hover:bg-slate-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首頁
            </Button>
            <div className="flex items-center gap-3">
              <Shield className="w-10 h-10 text-red-500" />
              <h1 className="text-4xl font-bold text-white">安全監控看板</h1>
            </div>
          </div>
          <Button onClick={loadData} variant="outline" className="text-white border-white hover:bg-slate-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            重新整理
          </Button>
        </div>

        {/* 當前時間卡片 */}
        <Card className="mb-6 bg-slate-800/90 backdrop-blur border-slate-700">
          <CardContent className="py-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-red-500 mb-2">
                {format(currentTime, 'HH:mm:ss')}
              </div>
              <div className="text-xl text-slate-300">
                {format(currentTime, 'yyyy年MM月dd日 EEEE', { locale: zhTW })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 統計卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-slate-800/90 backdrop-blur border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                總訪問次數
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{totalVisits}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/90 backdrop-blur border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                不重複 IP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">{uniqueIPs}</div>
            </CardContent>
          </Card>

          <Card className="bg-red-900/30 border-red-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                陌生訪客
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400">{anonymousVisits}</div>
            </CardContent>
          </Card>

          <Card className="bg-green-900/30 border-green-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-300 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                員工訪問
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">{employeeVisits}</div>
            </CardContent>
          </Card>
        </div>

        {/* 最常訪問的 IP */}
        <Card className="mb-6 bg-slate-800/90 backdrop-blur border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">最常訪問的 IP 地址</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topIPs.map(([ip, count], index) => (
                <div key={ip} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-white border-white">
                      #{index + 1}
                    </Badge>
                    <span className="font-mono text-white">{ip}</span>
                  </div>
                  <Badge className="bg-red-600 text-white">
                    {count} 次訪問
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 搜尋列 */}
        <Card className="mb-6 bg-slate-800/90 backdrop-blur border-slate-700">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Input
                type="text"
                placeholder="搜尋 IP、頁面路徑或員工姓名..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-slate-700 text-white border-slate-600"
              />
            </div>
          </CardContent>
        </Card>

        {/* 訪客記錄列表 */}
        <Card className="bg-slate-800/90 backdrop-blur border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>訪客記錄 ({filteredLogs.length})</span>
              <Badge variant="outline" className="text-slate-300 border-slate-600">
                最近 100 筆
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-4 rounded-lg border-2 ${
                    isStrangerVisit(log)
                      ? 'bg-red-900/20 border-red-700'
                      : 'bg-green-900/20 border-green-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {isStrangerVisit(log) ? (
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                        ) : (
                          <Shield className="w-5 h-5 text-green-400" />
                        )}
                        <span className="font-mono text-lg text-white">{log.ip_address}</span>
                        {isStrangerVisit(log) && (
                          <Badge className="bg-red-600 text-white">陌生訪客</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-300 ml-8">
                        <div>
                          <span className="text-slate-400">訪問頁面：</span>
                          <span className="font-mono">{log.page_path}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">訪問時間：</span>
                          <span>{formatTime(log.visited_at)}</span>
                        </div>
                        {log.employee_name && (
                          <div>
                            <span className="text-slate-400">員工：</span>
                            <span className="text-green-400">{log.employee_name} ({log.employee_id})</span>
                          </div>
                        )}
                        <div className="col-span-2">
                          <span className="text-slate-400">User Agent：</span>
                          <span className="text-xs">{log.user_agent}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
