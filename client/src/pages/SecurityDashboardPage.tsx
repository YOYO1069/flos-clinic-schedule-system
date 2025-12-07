import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '../lib/supabase.ts';
import { getRiskLevelColor, getRiskLevelIcon, getRiskLevelText, getFlagDescription } from '../utils/riskScoring';

/**
 * 管理員安全儀表板
 * 即時監控所有訪客、分析可疑行為、IP 封鎖功能
 */
export default function SecurityDashboardPage() {
  const [, setLocation] = useLocation();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 資料狀態
  const [visitors, setVisitors] = useState([]);
  const [securityEvents, setSecurityEvents] = useState([]);
  const [blacklistedIPs, setBlacklistedIPs] = useState([]);
  
  // 統計資料
  const [stats, setStats] = useState({
    totalVisitors: 0,
    suspiciousVisitors: 0,
    blockedIPs: 0,
    securityEvents: 0
  });
  
  // 篩選狀態
  const [filter, setFilter] = useState('all'); // all, low, medium, high, critical
  const [timeRange, setTimeRange] = useState('24h'); // 1h, 24h, 7d, 30d
  
  // UI 狀態
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [showBlockIPModal, setShowBlockIPModal] = useState(false);
  const [blockIPData, setBlockIPData] = useState({ ip: '', reason: '', type: 'temporary' });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (employee) {
      loadData();
      
      // 每 30 秒自動刷新
      const interval = setInterval(loadData, 30000);
      return () => clearInterval(interval);
    }
  }, [employee, filter, timeRange]);

  // 檢查管理員權限
  const checkAuth = async () => {
    try {
      const storedEmployee = localStorage.getItem('employee');
      if (!storedEmployee) {
        setLocation('/login');
        return;
      }

      const emp = JSON.parse(storedEmployee);
      
      // 檢查是否為管理員
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_id', emp.employee_id)
        .single();

      if (error || !data || data.role !== 'admin') {
        alert('您沒有權限訪問此頁面');
        navigate('/');
        return;
      }

      setEmployee(data);
    } catch (error) {
      console.error('Auth check failed:', error);
      setLocation('/login');
    } finally {
      setLoading(false);
    }
  };

  // 載入所有資料
  const loadData = async () => {
    await Promise.all([
      loadVisitors(),
      loadSecurityEvents(),
      loadBlacklistedIPs(),
      loadStats()
    ]);
  };

  // 載入訪客資料
  const loadVisitors = async () => {
    try {
      let query = supabase
        .from('visitor_tracking')
        .select('*')
        .order('created_at', { ascending: false });

      // 時間範圍篩選
      const timeFilter = getTimeFilter(timeRange);
      if (timeFilter) {
        query = query.gte('created_at', timeFilter);
      }

      // 風險等級篩選
      if (filter !== 'all') {
        query = query.eq('risk_level', filter);
      }

      const { data, error } = await query.limit(100);

      if (error) {
        console.error('Error loading visitors:', error);
        return;
      }

      setVisitors(data || []);
    } catch (error) {
      console.error('Failed to load visitors:', error);
    }
  };

  // 載入安全事件
  const loadSecurityEvents = async () => {
    try {
      const timeFilter = getTimeFilter(timeRange);
      let query = supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false });

      if (timeFilter) {
        query = query.gte('created_at', timeFilter);
      }

      const { data, error } = await query.limit(50);

      if (error) {
        console.error('Error loading security events:', error);
        return;
      }

      setSecurityEvents(data || []);
    } catch (error) {
      console.error('Failed to load security events:', error);
    }
  };

  // 載入黑名單 IP
  const loadBlacklistedIPs = async () => {
    try {
      const { data, error } = await supabase
        .from('ip_blacklist')
        .select('*')
        .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
        .order('blocked_at', { ascending: false });

      if (error) {
        console.error('Error loading blacklisted IPs:', error);
        return;
      }

      setBlacklistedIPs(data || []);
    } catch (error) {
      console.error('Failed to load blacklisted IPs:', error);
    }
  };

  // 載入統計資料
  const loadStats = async () => {
    try {
      const timeFilter = getTimeFilter(timeRange);

      // 總訪客數
      let visitorsQuery = supabase
        .from('visitor_tracking')
        .select('id', { count: 'exact', head: true });
      if (timeFilter) {
        visitorsQuery = visitorsQuery.gte('created_at', timeFilter);
      }
      const { count: totalVisitors } = await visitorsQuery;

      // 可疑訪客數
      let suspiciousQuery = supabase
        .from('visitor_tracking')
        .select('id', { count: 'exact', head: true })
        .in('risk_level', ['medium', 'high', 'critical']);
      if (timeFilter) {
        suspiciousQuery = suspiciousQuery.gte('created_at', timeFilter);
      }
      const { count: suspiciousVisitors } = await suspiciousQuery;

      // 被封鎖的 IP 數
      const { count: blockedIPs } = await supabase
        .from('ip_blacklist')
        .select('id', { count: 'exact', head: true })
        .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

      // 安全事件數
      let eventsQuery = supabase
        .from('security_events')
        .select('id', { count: 'exact', head: true });
      if (timeFilter) {
        eventsQuery = eventsQuery.gte('created_at', timeFilter);
      }
      const { count: securityEventsCount } = await eventsQuery;

      setStats({
        totalVisitors: totalVisitors || 0,
        suspiciousVisitors: suspiciousVisitors || 0,
        blockedIPs: blockedIPs || 0,
        securityEvents: securityEventsCount || 0
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  // 獲取時間篩選條件
  const getTimeFilter = (range) => {
    const now = new Date();
    switch (range) {
      case '1h':
        return new Date(now.getTime() - 60 * 60 * 1000).toISOString();
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return null;
    }
  };

  // 封鎖 IP
  const blockIP = async () => {
    if (!blockIPData.ip || !blockIPData.reason) {
      alert('請填寫 IP 地址和封鎖原因');
      return;
    }

    try {
      const expiresAt = blockIPData.type === 'temporary'
        ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 小時後
        : null;

      const { error } = await supabase.from('ip_blacklist').insert({
        ip_address: blockIPData.ip,
        reason: blockIPData.reason,
        block_type: blockIPData.type,
        blocked_by: employee.employee_id,
        expires_at: expiresAt
      });

      if (error) {
        console.error('Error blocking IP:', error);
        alert('封鎖 IP 失敗');
        return;
      }

      // 記錄安全事件
      await supabase.from('security_events').insert({
        event_type: 'blocked_ip',
        severity: 'high',
        ip_address: blockIPData.ip,
        employee_id: employee.employee_id,
        title: 'IP 已被封鎖',
        description: `管理員 ${employee.name} 封鎖了 IP ${blockIPData.ip}`,
        metadata: { reason: blockIPData.reason, type: blockIPData.type }
      });

      alert('IP 已成功封鎖');
      setShowBlockIPModal(false);
      setBlockIPData({ ip: '', reason: '', type: 'temporary' });
      loadData();
    } catch (error) {
      console.error('Failed to block IP:', error);
      alert('封鎖 IP 失敗');
    }
  };

  // 解除 IP 封鎖
  const unblockIP = async (ipId) => {
    if (!confirm('確定要解除此 IP 的封鎖嗎？')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('ip_blacklist')
        .delete()
        .eq('id', ipId);

      if (error) {
        console.error('Error unblocking IP:', error);
        alert('解除封鎖失敗');
        return;
      }

      alert('IP 已解除封鎖');
      loadData();
    } catch (error) {
      console.error('Failed to unblock IP:', error);
      alert('解除封鎖失敗');
    }
  };

  // 格式化時間
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return '剛剛';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分鐘前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小時前`;
    return date.toLocaleString('zh-TW');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">載入中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
      {/* 標題列 */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              🛡️ 安全監控儀表板
            </h1>
            <p className="text-gray-300">
              即時監控系統安全狀態 • 管理員：{employee?.name}
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
          >
            返回首頁
          </button>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="總訪客數"
          value={stats.totalVisitors}
          icon="👥"
          color="from-blue-500 to-cyan-500"
        />
        <StatCard
          title="可疑訪客"
          value={stats.suspiciousVisitors}
          icon="⚠️"
          color="from-yellow-500 to-orange-500"
        />
        <StatCard
          title="被封鎖 IP"
          value={stats.blockedIPs}
          icon="🚫"
          color="from-red-500 to-pink-500"
        />
        <StatCard
          title="安全事件"
          value={stats.securityEvents}
          icon="🔔"
          color="from-purple-500 to-indigo-500"
        />
      </div>

      {/* 篩選列 */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'all'
                  ? 'bg-white text-gray-900'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilter('low')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'low'
                  ? 'bg-green-500 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              🟢 低風險
            </button>
            <button
              onClick={() => setFilter('medium')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'medium'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              🟡 中風險
            </button>
            <button
              onClick={() => setFilter('high')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'high'
                  ? 'bg-red-500 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              🔴 高風險
            </button>
            <button
              onClick={() => setFilter('critical')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'critical'
                  ? 'bg-red-700 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              🚨 極高風險
            </button>
          </div>

          <div className="flex gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20"
            >
              <option value="1h">過去 1 小時</option>
              <option value="24h">過去 24 小時</option>
              <option value="7d">過去 7 天</option>
              <option value="30d">過去 30 天</option>
            </select>

            <button
              onClick={loadData}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
            >
              🔄 重新整理
            </button>

            <button
              onClick={() => setShowBlockIPModal(true)}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
            >
              🚫 封鎖 IP
            </button>
          </div>
        </div>
      </div>

      {/* 主要內容區 */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 訪客列表 */}
        <div className="lg:col-span-2">
          <VisitorsList
            visitors={visitors}
            onSelectVisitor={setSelectedVisitor}
            selectedVisitor={selectedVisitor}
            formatTime={formatTime}
          />
        </div>

        {/* 側邊欄 */}
        <div className="space-y-6">
          {/* 訪客詳情 */}
          {selectedVisitor && (
            <VisitorDetails
              visitor={selectedVisitor}
              onClose={() => setSelectedVisitor(null)}
              onBlockIP={(ip) => {
                setBlockIPData({ ...blockIPData, ip });
                setShowBlockIPModal(true);
              }}
            />
          )}

          {/* 安全事件 */}
          <SecurityEventsList
            events={securityEvents}
            formatTime={formatTime}
          />

          {/* 黑名單 IP */}
          <BlacklistedIPsList
            ips={blacklistedIPs}
            onUnblock={unblockIP}
            formatTime={formatTime}
          />
        </div>
      </div>

      {/* 封鎖 IP 對話框 */}
      {showBlockIPModal && (
        <BlockIPModal
          data={blockIPData}
          onChange={setBlockIPData}
          onBlock={blockIP}
          onClose={() => {
            setShowBlockIPModal(false);
            setBlockIPData({ ip: '', reason: '', type: 'temporary' });
          }}
        />
      )}
    </div>
  );
}

// 統計卡片組件
function StatCard({ title, value, icon, color }) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-xl p-6 text-white shadow-lg`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{icon}</span>
        <span className="text-4xl font-bold">{value}</span>
      </div>
      <p className="text-white/80 font-medium">{title}</p>
    </div>
  );
}

// 訪客列表組件（將在下一部分繼續）
function VisitorsList({ visitors, onSelectVisitor, selectedVisitor, formatTime }) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-4">
        訪客列表 ({visitors.length})
      </h2>
      
      <div className="space-y-3 max-h-[800px] overflow-y-auto">
        {visitors.length === 0 ? (
          <p className="text-gray-300 text-center py-8">暫無訪客記錄</p>
        ) : (
          visitors.map((visitor) => (
            <VisitorCard
              key={visitor.id}
              visitor={visitor}
              isSelected={selectedVisitor?.id === visitor.id}
              onClick={() => onSelectVisitor(visitor)}
              formatTime={formatTime}
            />
          ))
        )}
      </div>
    </div>
  );
}

// 訪客卡片組件（將在下一部分繼續）
function VisitorCard({ visitor, isSelected, onClick, formatTime }) {
  const riskColor = getRiskLevelColor(visitor.risk_level);
  const riskIcon = getRiskLevelIcon(visitor.risk_level);
  const riskText = getRiskLevelText(visitor.risk_level);

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg cursor-pointer transition-all ${
        isSelected
          ? 'bg-white/30 ring-2 ring-white'
          : 'bg-white/5 hover:bg-white/10'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{visitor.is_employee ? '👤' : '👁️'}</span>
            <span className="text-white font-medium">
              {visitor.is_employee ? `員工 ${visitor.employee_id}` : 'Anonymous'}
            </span>
            {visitor.is_blocked && (
              <span className="px-2 py-1 bg-red-500 text-white text-xs rounded">
                已封鎖
              </span>
            )}
          </div>
          <p className="text-gray-300 text-sm">
            IP: {visitor.ip_address} • {visitor.city}, {visitor.country}
          </p>
        </div>
        <div className="text-right">
          <div
            className="px-3 py-1 rounded-full text-white text-sm font-medium mb-1"
            style={{ backgroundColor: riskColor }}
          >
            {riskIcon} {riskText}
          </div>
          <p className="text-gray-400 text-xs">{formatTime(visitor.created_at)}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-300">
        <span>🖱️ {visitor.mouse_movements}</span>
        <span>⌨️ {visitor.keyboard_events}</span>
        <span>📜 {visitor.scroll_events}</span>
        <span>⏱️ {visitor.idle_time}s</span>
      </div>

      {visitor.suspicious_flags && visitor.suspicious_flags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {visitor.suspicious_flags.slice(0, 3).map((flag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded"
            >
              {getFlagDescription(flag)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// 其他組件將在下一個檔案繼續...

// 訪客詳情組件
function VisitorDetails({ visitor, onClose, onBlockIP }) {
  const riskColor = getRiskLevelColor(visitor.risk_level);
  const riskIcon = getRiskLevelIcon(visitor.risk_level);
  const riskText = getRiskLevelText(visitor.risk_level);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">訪客詳情</h3>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        {/* 風險評估 */}
        <div
          className="p-4 rounded-lg text-white"
          style={{ backgroundColor: riskColor }}
        >
          <div className="text-center">
            <div className="text-4xl mb-2">{riskIcon}</div>
            <div className="text-2xl font-bold">{riskText}</div>
            <div className="text-sm opacity-80">風險評分：{visitor.risk_score}/100</div>
          </div>
        </div>

        {/* 基本資訊 */}
        <div className="space-y-2">
          <DetailItem label="IP 地址" value={visitor.ip_address} />
          <DetailItem label="位置" value={`${visitor.city}, ${visitor.region}, ${visitor.country}`} />
          <DetailItem label="ISP" value={visitor.isp} />
          <DetailItem label="時區" value={visitor.timezone} />
        </div>

        {/* 設備資訊 */}
        <div className="space-y-2">
          <h4 className="text-white font-medium">設備資訊</h4>
          <DetailItem label="瀏覽器" value={`${visitor.browser} ${visitor.browser_version}`} />
          <DetailItem label="作業系統" value={`${visitor.os} ${visitor.os_version}`} />
          <DetailItem label="螢幕解析度" value={visitor.screen_resolution} />
          <DetailItem label="語言" value={visitor.languages?.join(', ')} />
        </div>

        {/* 行為分析 */}
        <div className="space-y-2">
          <h4 className="text-white font-medium">行為分析</h4>
          <DetailItem label="滑鼠移動" value={`${visitor.mouse_movements} 次`} />
          <DetailItem label="鍵盤事件" value={`${visitor.keyboard_events} 次`} />
          <DetailItem label="滾動事件" value={`${visitor.scroll_events} 次`} />
          <DetailItem label="閒置時間" value={`${visitor.idle_time} 秒`} />
          <DetailItem label="總停留時間" value={`${visitor.total_time} 秒`} />
        </div>

        {/* 可疑標記 */}
        {visitor.suspicious_flags && visitor.suspicious_flags.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-white font-medium">可疑標記</h4>
            {visitor.suspicious_flags.map((flag, index) => (
              <div
                key={index}
                className="px-3 py-2 bg-yellow-500/20 text-yellow-300 text-sm rounded"
              >
                ⚠️ {getFlagDescription(flag)}
              </div>
            ))}
          </div>
        )}

        {/* 操作按鈕 */}
        {!visitor.is_employee && !visitor.is_blocked && (
          <button
            onClick={() => onBlockIP(visitor.ip_address)}
            className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all"
          >
            🚫 封鎖此 IP
          </button>
        )}
      </div>
    </div>
  );
}

// 詳情項目組件
function DetailItem({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">{label}:</span>
      <span className="text-white font-medium">{value || 'N/A'}</span>
    </div>
  );
}

// 安全事件列表組件
function SecurityEventsList({ events, formatTime }) {
  const getSeverityColor = (severity) => {
    const colors = {
      low: 'bg-green-500/20 text-green-300',
      medium: 'bg-yellow-500/20 text-yellow-300',
      high: 'bg-red-500/20 text-red-300',
      critical: 'bg-red-700/20 text-red-200'
    };
    return colors[severity] || colors.low;
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">
        安全事件 ({events.length})
      </h3>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-gray-300 text-center py-4">暫無安全事件</p>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="p-3 bg-white/5 rounded-lg"
            >
              <div className="flex items-start justify-between mb-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(event.severity)}`}
                >
                  {event.severity?.toUpperCase()}
                </span>
                <span className="text-gray-400 text-xs">
                  {formatTime(event.created_at)}
                </span>
              </div>
              <p className="text-white font-medium text-sm mb-1">
                {event.title}
              </p>
              <p className="text-gray-300 text-xs">
                {event.description}
              </p>
              {event.ip_address && (
                <p className="text-gray-400 text-xs mt-1">
                  IP: {event.ip_address}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// 黑名單 IP 列表組件
function BlacklistedIPsList({ ips, onUnblock, formatTime }) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">
        黑名單 IP ({ips.length})
      </h3>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {ips.length === 0 ? (
          <p className="text-gray-300 text-center py-4">暫無黑名單 IP</p>
        ) : (
          ips.map((ip) => (
            <div
              key={ip.id}
              className="p-3 bg-white/5 rounded-lg"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-white font-medium">{ip.ip_address}</p>
                  <p className="text-gray-400 text-xs">
                    {ip.city}, {ip.country}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    ip.block_type === 'permanent'
                      ? 'bg-red-500/20 text-red-300'
                      : 'bg-yellow-500/20 text-yellow-300'
                  }`}
                >
                  {ip.block_type === 'permanent' ? '永久' : '臨時'}
                </span>
              </div>
              <p className="text-gray-300 text-sm mb-2">
                原因：{ip.reason}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{formatTime(ip.blocked_at)}</span>
                <button
                  onClick={() => onUnblock(ip.id)}
                  className="px-3 py-1 bg-green-500/20 text-green-300 rounded hover:bg-green-500/30 transition-all"
                >
                  解除封鎖
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// 封鎖 IP 對話框組件
function BlockIPModal({ data, onChange, onBlock, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🚫</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            封鎖 IP 地址
          </h2>
          <p className="text-gray-600">
            封鎖後，該 IP 將無法訪問系統
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IP 地址 *
            </label>
            <input
              type="text"
              value={data.ip}
              onChange={(e) => onChange({ ...data, ip: e.target.value })}
              placeholder="例如：192.168.1.1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              封鎖原因 *
            </label>
            <textarea
              value={data.reason}
              onChange={(e) => onChange({ ...data, reason: e.target.value })}
              placeholder="請說明封鎖原因..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              封鎖類型
            </label>
            <select
              value={data.type}
              onChange={(e) => onChange({ ...data, type: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="temporary">臨時封鎖（24 小時）</option>
              <option value="permanent">永久封鎖</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onBlock}
            className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all"
          >
            確認封鎖
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-all"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
