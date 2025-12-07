import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Activity, FileText, AlertCircle, CheckCircle2, Shield, Users } from "lucide-react";
import { toast } from "sonner";

export default function NurseSOP() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setLocation('/login');
      return;
    }
    setCurrentUser(JSON.parse(userStr));
  }, [setLocation]);

  const sopCategories = [
    {
      id: 1,
      icon: Shield,
      title: '基礎護理規範',
      items: ['無菌技術操作規範', '手部衛生標準流程', '個人防護裝備使用', '病患隱私保護'],
      color: 'from-blue-500 to-cyan-600',
    },
    {
      id: 2,
      icon: FileText,
      title: '醫療器材操作',
      items: ['生命徵象監測儀器', '注射器材使用規範', '傷口護理用品', '器械消毒流程'],
      color: 'from-indigo-500 to-purple-600',
    },
    {
      id: 3,
      icon: Users,
      title: '病患照護流程',
      items: ['術前準備檢查清單', '術後照護注意事項', '病患衛教指導', '緊急狀況處理'],
      color: 'from-pink-500 to-rose-600',
    },
    {
      id: 4,
      icon: AlertCircle,
      title: '安全與風險管理',
      items: ['跌倒預防措施', '感染控制規範', '藥物管理安全', '異常事件通報'],
      color: 'from-amber-500 to-orange-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => setLocation('/')} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                返回首頁
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-md">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">護理師守則</h1>
                  <p className="text-sm text-gray-500">護理標準作業流程</p>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              登入者：<span className="font-semibold text-gray-900">{currentUser?.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-8 mb-8 text-white shadow-lg">
          <h2 className="text-3xl font-bold mb-2">護理師標準作業流程</h2>
          <p className="text-blue-50 text-lg">提供完整的護理操作規範與安全指引</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {sopCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Card key={category.id} className="overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className={`h-24 bg-gradient-to-br ${category.color} p-4 flex items-center justify-between`}>
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <Badge className="bg-white text-gray-700">{category.items.length} 項目</Badge>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{category.title}</h3>
                  <ul className="space-y-2">
                    {category.items.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => toast.info('詳細內容開發中')}>
                    查看詳細內容
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">重要提醒</h3>
              <ul className="text-sm text-blue-800 space-y-1.5">
                <li>• 所有護理操作必須嚴格遵守標準作業流程</li>
                <li>• 遇到不確定的情況，請立即向資深護理師或主管請教</li>
                <li>• 定期參加護理技能培訓與更新課程</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
