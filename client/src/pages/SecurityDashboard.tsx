import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Shield, Globe, Clock, AlertTriangle, ArrowLeft, RefreshCw, Ban, Eye } from "lucide-react";
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
  const [strangerLogs, setStrangerLogs] = useState<VisitorLog[]>([]);
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
    // 每10秒自動重新載入
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  // 搜尋過濾
  useEffect(() => {
    if (searchTerm) {
      const filtered = strangerLogs.filter(log =>
        log.ip_address.includes(searchTerm) ||
        log.page_path.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLogs(filtered);
    } else {
      setFilteredLogs(strangerLogs);
    }
  }, [searchTerm, strangerLogs]);

  async function loadData() {
    try {
      // 只載入陌生訪客記錄 (沒有 employee_id 的記錄)
      const { data, error } = await supabase
        .from('visitor_logs')
        .select('*')
        .is('employee_id', null)
        .order('visited_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      setStrangerLogs(data || []);
      setFilteredLogs(data || []);
    } catch (error) {
      console.error('載入陌生訪客記錄失敗:', error);
    } finally {
      setLoading(false);
    }
  }

  // 統計資料
  const totalStrangerVisits = strangerLogs.length;
  const uniqueStrangerIPs = new Set(strangerLogs.map(log => log.ip_address)).size;
  
  // 最近24小時的陌生訪客
  const last24Hours = strangerLogs.filter(log => {
    const visitTime = new Date(log.visited_at);
    const now = new Date();
    const diff = now.getTime() - visitTime.getTime();
    return diff < 24 * 60 * 60 * 1000;
  }).length;

  // 最常訪問的陌生 IP
  const ipCounts = strangerLogs.reduce((acc, log) => {
    acc[log.ip_address] = (acc[log.ip_address] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topStrangerIPs = Object.entries(ipCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // 格式化時間
  function formatTime(timeStr: string): string {
    try {
      const date = new Date(timeStr);
      return format(date, 'yyyy-MM-dd HH:mm:ss');
    } catch {
      return timeStr;
    }
  }

  // 計算時間差
  function getTimeAgo(timeStr: string): string {
    try {
      const visitTime = new Date(timeStr);
      const now = new Date();
      const diff = now.getTime() - visitTime.getTime();
      const minutes = Math.floor(diff / 60000);
      
      if (minutes < 1) return '剛剛';
      if (minutes < 60) return `${minutes} 分鐘前`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours} 小時前`;
      const days = Math.floor(hours / 24);
      return `${days} 天前`;
    } catch {
      return '-';
    }
  }

  // 判斷是否為最近訪問 (5分鐘內)
  function isRecentVisit(timeStr: string): boolean {
    try {
      const visitTime = new Date(timeStr);
      const now = new Date();
      const diff = now.getTime() - visitTime.getTime();
      return diff < 5 * 60 * 1000; // 5分鐘
    } catch {
      return false;
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-950 to-slate-900 flex items-center justify-center">
        <p className="text-xl text-white">載入中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 標題列 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setLocation('/')} className="text-white hover:bg-red-900/50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首頁
            </Button>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-12 h-12 text-red-500 animate-pulse" />
              <div>
                <h1 className="text-4xl font-bold text-white">陌生IP監控看板</h1>
                <p className="text-sm text-red-300 mt-1">即時監控未授權訪問</p>
              </div>
            </div>
          </div>
          <Button onClick={loadData} variant="outline" className="text-white border-red-500 hover:bg-red-900/50">
            <RefreshCw className="w-4 h-4 mr-2" />
            重新整理
          </Button>
        </div>

        {/* 當前時間卡片 */}
        <Card className="mb-6 bg-red-900/30 backdrop-blur border-red-700">
          <CardContent className="py-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-red-400 mb-2">
                {format(currentTime, 'HH:mm:ss')}
              </div>
              <div className="text-xl text-red-200">
                {format(currentTime, 'yyyy年MM月dd日 EEEE', { locale: zhTW })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-red-900/40 border-red-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-200 flex items-center gap-2">
                <Ban className="w-4 h-4" />
                陌生訪客總數
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-red-400">{totalStrangerVisits}</div>
              <p className="text-xs text-red-300 mt-1">最近 200 筆記錄</p>
            </CardContent>
          </Card>

          <Card className="bg-red-900/40 border-red-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-200 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                不重複陌生 IP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-orange-400">{uniqueStrangerIPs}</div>
              <p className="text-xs text-red-300 mt-1">需要關注的 IP 數量</p>
            </CardContent>
          </Card>

          <Card className="bg-red-900/40 border-red-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-200 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                24小時內訪問
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-yellow-400">{last24Hours}</div>
              <p className="text-xs text-red-300 mt-1">最近一天的陌生訪問</p>
            </CardContent>
          </Card>
        </div>

        {/* 最常訪問的陌生 IP */}
        <Card className="mb-6 bg-red-900/30 backdrop-blur border-red-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-red-400" />
              高頻陌生 IP (Top 10)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topStrangerIPs.length > 0 ? (
                topStrangerIPs.map(([ip, count], index) => (
                  <div key={ip} className="flex items-center justify-between p-3 bg-red-950/50 rounded-lg border border-red-800">
                    <div className="flex items-center gap-3">
                      <Badge variant="destructive" className="w-8 h-8 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <span className="font-mono text-lg text-red-200">{ip}</span>
                    </div>
                    <Badge className="bg-red-600 text-white">
                      {count} 次訪問
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-center text-red-300 py-4">暫無陌生訪客記錄</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 搜尋列 */}
        <Card className="mb-6 bg-red-900/30 backdrop-blur border-red-700">
          <CardContent className="pt-6">
            <Input
              type="text"
              placeholder="搜尋 IP 地址或頁面路徑..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-red-950/50 text-white border-red-700 placeholder:text-red-400"
            />
          </CardContent>
        </Card>

        {/* 陌生訪客記錄列表 */}
        <Card className="bg-red-900/30 backdrop-blur border-red-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                陌生訪客記錄 ({filteredLogs.length})
              </span>
              <Badge variant="outline" className="text-red-300 border-red-600">
                即時監控
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  const isRecent = isRecentVisit(log.visited_at);
                  return (
                    <div
                      key={log.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isRecent
                          ? 'bg-red-800/40 border-red-500 shadow-lg shadow-red-500/20'
                          : 'bg-red-950/40 border-red-800'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <AlertTriangle className={`w-6 h-6 ${isRecent ? 'text-red-400 animate-pulse' : 'text-red-500'}`} />
                            <span className="font-mono text-xl text-red-200">{log.ip_address}</span>
                            {isRecent && (
                              <Badge className="bg-red-600 text-white animate-pulse">
                                最新
                              </Badge>
                            )}
                            <span className="text-sm text-red-400">
                              {getTimeAgo(log.visited_at)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-red-200 ml-9">
                            <div className="flex items-center gap-2">
                              <span className="text-red-400">訪問頁面：</span>
                              <span className="font-mono bg-red-950/50 px-2 py-1 rounded">{log.page_path}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-red-400">訪問時間：</span>
                              <span className="font-mono">{formatTime(log.visited_at)}</span>
                            </div>
                            <div className="col-span-2 flex items-start gap-2">
                              <span className="text-red-400 whitespace-nowrap">User Agent：</span>
                              <span className="text-xs text-red-300 break-all">{log.user_agent}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-xl text-green-400 font-semibold">目前沒有陌生訪客</p>
                  <p className="text-sm text-green-300 mt-2">系統安全運作中</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
