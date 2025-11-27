import { ScheduleProvider } from "@/contexts/ScheduleContext";
import { CalendarView } from "@/components/CalendarView";
import { MonthNavigation } from "@/components/MonthNavigation";
import { Toolbar } from "@/components/Toolbar";
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function DoctorSchedule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [, setLocation] = useLocation();

  return (
    <ScheduleProvider>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation("/")}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  返回首頁
                </Button>
              </div>
              <h1 className="text-4xl font-bold text-teal-900 mb-2">
                醫生排班表系統
              </h1>
              <p className="text-teal-700">
                點擊日期右上角的 + 號新增排班,點擊排班卡片可編輯或刪除
              </p>
            </div>

            {/* Month Navigation */}
            <MonthNavigation
              currentDate={currentDate}
              onDateChange={setCurrentDate}
            />

            {/* Toolbar */}
            <Toolbar currentDate={currentDate} />

            {/* Calendar */}
            <CalendarView />
          </div>
        </div>
      </div>
    </ScheduleProvider>
  );
}
