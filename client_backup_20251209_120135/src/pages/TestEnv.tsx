import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function TestEnv() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function testConnection() {
      try {
        // 測試 Supabase 連線
        const { data, error } = await supabase
          .from('employees')
          .select('employee_id, name')
          .limit(1);

        setTestResult({
          supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '未設定',
          supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 
            `${import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 20)}...` : 
            '未設定',
          connectionTest: error ? `失敗: ${error.message}` : '成功',
          sampleData: data || null,
          error: error || null
        });
      } catch (err: any) {
        setTestResult({
          error: err.message
        });
      } finally {
        setLoading(false);
      }
    }

    testConnection();
  }, []);

  if (loading) {
    return <div className="p-8">測試中...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">環境變數測試</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(testResult, null, 2)}
      </pre>
    </div>
  );
}
