import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Droplets, AlertCircle, CheckCircle2, Scissors, Heart } from "lucide-react";
import { toast } from "sonner";

export default function BeauticianSOP() {
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
      icon: Sparkles,
      title: '基礎美容操作',
      items: ['皮膚分析與評估', '臉部清潔標準流程', '保養品使用規範', '儀器操作安全'],
      color: 'from-pink-500 to-rose-600',
    },
    {
      id: 2,
      icon: Droplets,
      title: '專業療程規範',
      items: ['雷射療程操作', '注射美容流程', '術前諮詢要點', '術後照護指導'],
      color: 'from-purple-500 to-fuchsia-600',
    },
    {
      id: 3,
      icon: Heart,
      title: '客戶服務標準',
      items: ['諮詢溝通技巧', '客戶隱私保護', '服務品質管理', '客訴處理流程'],
      color: 'from-amber-500 to-orange-600',
    },
    {
      id: 4,
      icon: Scissors,
      title: '衛生與安全',
      items: ['工作環境消毒', '器械清潔規範', '個人衛生標準', '緊急狀況處理'],
      color: 'from-teal-500 to-cyan-600',
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
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">美容師守則</h1>
                  <p className="text-sm text-gray-500">美容操作規範指南</p>
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
        <div className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl p-8 mb-8 text-white shadow-lg">
          <h2 className="text-3xl font-bold mb-2">美容師操作規範指南</h2>
          <p className="text-pink-50 text-lg">提供專業美容服務的標準流程與安全守則</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {sopCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Card key={category.id} className="overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className={`h-24 bg-gradient-to-br ${category.color} p-4 flex items-center justify-between`}>
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                    <Icon className="w-6 h-6 text-pink-600" />
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

        <div className="bg-pink-50 border border-pink-200 rounded-xl p-6">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-pink-900 mb-2">重要提醒</h3>
              <ul className="text-sm text-pink-800 space-y-1.5">
                <li>• 所有美容操作必須遵守專業規範與衛生標準</li>
                <li>• 使用儀器前務必確認操作流程與安全注意事項</li>
                <li>• 定期參加專業技能培訓與產品知識更新</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
