import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Clock, ArrowRight } from "lucide-react";
import { useLocation } from 'wouter';

export default function Dashboard() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* 標題 */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
            FLOS 曜診所排班系統
          </h1>
          <p className="text-slate-600">管理員儀表板</p>
        </div>

        {/* 主要功能卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 醫師排班 */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-teal-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">醫師排班</CardTitle>
                  <CardDescription>管理醫師值班時間</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-teal-600 hover:bg-teal-700"
                onClick={() => setLocation('/doctor-schedule')}
              >
                進入醫師排班管理
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* 員工排班 */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">員工排班</CardTitle>
                  <CardDescription>管理員工請假與排班</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => setLocation('/leave-calendar')}
              >
                進入員工排班管理
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 快速訪問提示 */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-teal-600" />
              <CardTitle>近期值班醫師</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 space-y-4">
              <p className="text-slate-600">
                點擊上方「醫師排班」按鈕查看完整的醫師排班表
              </p>
              <Button 
                variant="outline"
                className="border-teal-600 text-teal-600 hover:bg-teal-50"
                onClick={() => setLocation('/doctor-schedule')}
              >
                查看醫師排班表
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
