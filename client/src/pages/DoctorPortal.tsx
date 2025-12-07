import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Stethoscope, FileHeart, BookOpen, PenTool, 
  ExternalLink, Clock, CheckCircle2, AlertCircle 
} from "lucide-react";
import { toast } from "sonner";

export default function DoctorPortal() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setLocation('/login');
      return;
    }
    const user = JSON.parse(userStr);
    setCurrentUser(user);
  }, [setLocation]);

  const doctorTools = [
    {
      id: 1,
      icon: FileHeart,
      title: '病例操作系統',
      description: '醫生病例管理與操作平台，提供完整的病例記錄、查詢與管理功能',
      status: 'available',
      statusText: '已上線',
      statusColor: 'bg-green-100 text-green-700 border-green-300',
      url: 'https://deft-heliotrope-9157ff.netlify.app/',
      isExternal: true,
      color: 'from-teal-500 to-cyan-600',
      bgColor: 'bg-teal-50',
      iconColor: 'text-teal-600',
    },
    {
      id: 2,
      icon: BookOpen,
      title: '操作守則網站',
      description: '標準作業流程查詢平台，提供各項醫療操作的標準流程與注意事項',
      status: 'development',
      statusText: '開發中',
      statusColor: 'bg-amber-100 text-amber-700 border-amber-300',
      url: null,
      isExternal: false,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      id: 3,
      icon: PenTool,
      title: '電子病歷繪圖',
      description: '病歷圖示繪製工具，支援手繪標註、圖層管理與病歷圖片編輯',
      status: 'planning',
      statusText: '規劃中',
      statusColor: 'bg-gray-100 text-gray-700 border-gray-300',
      url: null,
      isExternal: false,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ];

  const handleToolClick = (tool: typeof doctorTools[0]) => {
    if (tool.status === 'available' && tool.url) {
      window.open(tool.url, '_blank');
    } else {
      toast.info(`${tool.title}功能${tool.statusText}`, {
        description: '敬請期待！',
        duration: 3000
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'development':
        return <Clock className="w-4 h-4" />;
      case 'planning':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* 頂部導航 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                返回首頁
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 tracking-tight">醫生專區</h1>
                  <p className="text-sm text-gray-500">醫生專用功能與工具</p>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              登入者：<span className="font-semibold text-gray-900">{currentUser?.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 歡迎區 */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 mb-8 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">歡迎使用醫生專區</h2>
              <p className="text-emerald-50 text-lg">
                整合醫療作業所需的各項專業工具與平台
              </p>
            </div>
            <div className="hidden md:block">
              <Stethoscope className="w-24 h-24 text-white opacity-20" />
            </div>
          </div>
        </div>

        {/* 工具卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctorTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card
                key={tool.id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border-gray-200"
                onClick={() => handleToolClick(tool)}
              >
                <div className={`h-32 bg-gradient-to-br ${tool.color} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
                  <div className="absolute top-4 right-4">
                    <Badge className={`${tool.statusColor} border font-semibold flex items-center gap-1.5`}>
                      {getStatusIcon(tool.status)}
                      {tool.statusText}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg">
                      <Icon className={`w-8 h-8 ${tool.iconColor}`} />
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                      {tool.title}
                    </h3>
                    {tool.isExternal && (
                      <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors flex-shrink-0 ml-2" />
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {tool.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-500 font-medium">
                      {tool.status === 'available' ? '點擊進入' : '即將推出'}
                    </span>
                    <div className={`w-8 h-8 rounded-full ${tool.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <ArrowLeft className={`w-4 h-4 ${tool.iconColor} rotate-180`} />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* 說明區 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">使用說明</h3>
              <ul className="text-sm text-blue-800 space-y-1.5 leading-relaxed">
                <li>• <strong>已上線</strong>功能可直接點擊進入使用</li>
                <li>• <strong>開發中</strong>功能正在積極開發，預計近期上線</li>
                <li>• <strong>規劃中</strong>功能已列入開發藍圖，將陸續推出</li>
                <li>• 如有任何問題或建議，請聯繫系統管理員</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
