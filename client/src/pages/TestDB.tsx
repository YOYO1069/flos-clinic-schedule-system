import { useEffect, useState } from 'react';
import { doctorScheduleClient, supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export default function TestDB() {
  const [, setLocation] = useLocation();
  const [doctorData, setDoctorData] = useState<any>(null);
  const [staffData, setStaffData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testConnections();
  }, []);

  async function testConnections() {
    setLoading(true);
    
    // 測試醫師排班資料庫
    try {
      const { data, error, count } = await doctorScheduleClient
        .from('doctor_shift_schedules')
        .select('*', { count: 'exact' })
        .limit(5);
      
      setDoctorData({
        success: !error,
        error: error?.message,
        count,
        sample: data
      });
    } catch (err: any) {
      setDoctorData({
        success: false,
        error: err.message,
        count: 0,
        sample: null
      });
    }

    // 測試員工系統資料庫
    try {
      const { data, error, count } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .limit(5);
      
      setStaffData({
        success: !error,
        error: error?.message,
        count,
        sample: data
      });
    } catch (err: any) {
      setStaffData({
        success: false,
        error: err.message,
        count: 0,
        sample: null
      });
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">資料庫連線測試</h1>
          <Button onClick={() => setLocation('/')}>返回首頁</Button>
        </div>

        {loading ? (
          <p>測試中...</p>
        ) : (
          <div className="space-y-6">
            {/* 醫師排班資料庫 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">
                醫師排班資料庫 (clzjdlykhjwrlksyjlfz)
              </h2>
              <div className="space-y-2">
                <p>
                  <strong>狀態:</strong>{' '}
                  <span className={doctorData?.success ? 'text-green-600' : 'text-red-600'}>
                    {doctorData?.success ? '✅ 連線成功' : '❌ 連線失敗'}
                  </span>
                </p>
                {doctorData?.error && (
                  <p className="text-red-600">
                    <strong>錯誤:</strong> {doctorData.error}
                  </p>
                )}
                <p>
                  <strong>資料筆數:</strong> {doctorData?.count || 0}
                </p>
                {doctorData?.sample && (
                  <details>
                    <summary className="cursor-pointer font-semibold">查看範例資料</summary>
                    <pre className="mt-2 p-4 bg-gray-100 rounded overflow-auto text-xs">
                      {JSON.stringify(doctorData.sample, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>

            {/* 員工系統資料庫 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">
                員工系統資料庫 (pizzpwesrbulfjylejlu)
              </h2>
              <div className="space-y-2">
                <p>
                  <strong>狀態:</strong>{' '}
                  <span className={staffData?.success ? 'text-green-600' : 'text-red-600'}>
                    {staffData?.success ? '✅ 連線成功' : '❌ 連線失敗'}
                  </span>
                </p>
                {staffData?.error && (
                  <p className="text-red-600">
                    <strong>錯誤:</strong> {staffData.error}
                  </p>
                )}
                <p>
                  <strong>資料筆數:</strong> {staffData?.count || 0}
                </p>
                {staffData?.sample && (
                  <details>
                    <summary className="cursor-pointer font-semibold">查看範例資料</summary>
                    <pre className="mt-2 p-4 bg-gray-100 rounded overflow-auto text-xs">
                      {JSON.stringify(staffData.sample, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>

            <Button onClick={testConnections} className="w-full">
              重新測試
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
