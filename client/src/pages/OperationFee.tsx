import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { Calculator, Plus, History, TrendingUp, ArrowLeft, LogOut } from "lucide-react";
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { useLocation } from "wouter";
import { toast } from "sonner";

// 操作費項目定義
const OPERATION_ITEMS = {
  美容師: [
    { name: "卸洗敷麻", fee: 60, note: "同一人" },
    { name: "清粉刺", fee: 300 },
    { name: "海菲秀", fee: 70 },
    { name: "Seyo", fee: 50 },
    { name: "潔比爾", fee: 100 },
    { name: "鑽石超塑", fee: 250 },
    { name: "英特波", fee: 400 },
    { name: "電波、音波（跟診）", fee: 100 },
    { name: "光電雷射（跟診）", fee: 50 }
  ],
  護理師: [
    { name: "鑽石超塑", fee: 450 },
    { name: "英特波", fee: 600 },
    { name: "點滴", fee: 200 },
    { name: "Embody or Neo", fee: 50 },
    { name: "震波", fee: 500 },
    { name: "猛健樂", fee: 200, note: "第一次含衛教" },
    { name: "電波、音波（跟診）", fee: 100 },
    { name: "光電雷射（跟診）", fee: 50 }
  ]
};

interface OperationFeeRecord {
  id: number;
  employee_id: string;
  employee_name: string;
  operation_date: string;
  operation_item: string;
  operation_category: string;
  quantity: number;
  unit_fee: number;
  total_fee: number;
  notes: string | null;
  created_at: string;
}

export default function OperationFee() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // 新增操作費表單
  const [operationDate, setOperationDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  
  // 記錄列表
  const [records, setRecords] = useState<OperationFeeRecord[]>([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  // 檢查登入狀態
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setLocation('/login');
      return;
    }
    const userData = JSON.parse(userStr);
    setUser(userData);
  }, []);

  // 載入操作費記錄
  useEffect(() => {
    if (user) {
      loadRecords();
      calculateMonthlyTotal();
    }
  }, [user, selectedMonth]);

  // 取得可用的操作項目
  const availableItems = user?.position === '美容師' 
    ? OPERATION_ITEMS.美容師 
    : user?.position === '護理師' 
    ? OPERATION_ITEMS.護理師 
    : [];

  // 取得選中項目的單價
  const getUnitFee = () => {
    const item = availableItems.find(i => i.name === selectedItem);
    return item?.fee || 0;
  };

  // 計算總金額
  const calculateTotal = () => {
    return getUnitFee() * quantity;
  };

  // 載入操作費記錄
  async function loadRecords() {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('operation_fee_records')
        .select('*')
        .eq('employee_id', user.employee_id)
        .order('operation_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('載入操作費記錄失敗:', error);
      } else {
        setRecords(data || []);
      }
    } catch (err) {
      console.error('載入操作費記錄錯誤:', err);
    }
  }

  // 計算每月總額
  async function calculateMonthlyTotal() {
    if (!user || !selectedMonth) return;
    
    try {
      const startDate = `${selectedMonth}-01`;
      const endDate = `${selectedMonth}-31`;
      
      const { data, error } = await supabase
        .from('operation_fee_records')
        .select('total_fee')
        .eq('employee_id', user.employee_id)
        .gte('operation_date', startDate)
        .lte('operation_date', endDate);

      if (error) {
        console.error('計算每月總額失敗:', error);
      } else {
        const total = data?.reduce((sum, record) => sum + record.total_fee, 0) || 0;
        setMonthlyTotal(total);
      }
    } catch (err) {
      console.error('計算每月總額錯誤:', err);
    }
  }

  // 新增操作費記錄
  async function handleAddRecord() {
    if (!user) return;
    
    if (!selectedItem) {
      toast.error('請選擇操作項目');
      return;
    }

    if (quantity < 1) {
      toast.error('數量必須大於 0');
      return;
    }

    setLoading(true);
    try {
      const recordData = {
        employee_id: user.employee_id,
        employee_name: user.name,
        operation_date: operationDate,
        operation_item: selectedItem,
        operation_category: user.position,
        quantity: quantity,
        unit_fee: getUnitFee(),
        total_fee: calculateTotal(),
        notes: notes || null
      };

      const { error } = await supabase
        .from('operation_fee_records')
        .insert(recordData);

      if (error) {
        console.error('新增操作費記錄失敗:', error);
        toast.error('新增失敗');
      } else {
        toast.success(`✅ 新增成功！操作費: ${calculateTotal()} 元`);
        // 重置表單
        setSelectedItem('');
        setQuantity(1);
        setNotes('');
        // 重新載入記錄
        await loadRecords();
        await calculateMonthlyTotal();
      }
    } catch (err) {
      console.error('新增操作費記錄錯誤:', err);
      toast.error('新增失敗');
    } finally {
      setLoading(false);
    }
  }

  // 刪除記錄
  async function handleDeleteRecord(id: number) {
    if (!confirm('確定要刪除這筆記錄嗎？')) return;
    
    try {
      const { error } = await supabase
        .from('operation_fee_records')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('刪除操作費記錄失敗:', error);
        toast.error('刪除失敗');
      } else {
        toast.success('刪除成功');
        await loadRecords();
        await calculateMonthlyTotal();
      }
    } catch (err) {
      console.error('刪除操作費記錄錯誤:', err);
      toast.error('刪除失敗');
    }
  }

  // 登出
  function handleLogout() {
    localStorage.removeItem('user');
    setLocation('/login');
  }

  if (!user) {
    return null;
  }

  // 如果不是美容師或護理師，顯示提示
  if (user.position !== '美容師' && user.position !== '護理師') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Button variant="ghost" onClick={() => setLocation('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首頁
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              登出
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>操作費計算</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-600 py-8">
                此功能僅適用於美容師和護理師
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 標題列 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setLocation('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首頁
            </Button>
            <h1 className="text-3xl font-bold text-gray-800">操作費計算</h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            登出
          </Button>
        </div>

        {/* 員工資訊 */}
        <Card className="mb-6 bg-white/80 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-600">員工姓名</div>
                <div className="text-xl font-bold text-gray-800">{user.name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">職位</div>
                <div className="text-xl font-bold text-purple-600">{user.position}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">員工編號</div>
                <div className="text-lg text-gray-700">{user.employee_id}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 每月統計 */}
        <Card className="mb-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="w-5 h-5" />
              本月操作費統計
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <Input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-white/20 border-white/30 text-white"
                />
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{monthlyTotal.toLocaleString()} 元</div>
                <div className="text-sm opacity-90">總計</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 新增操作費表單 */}
        <Card className="mb-6 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              新增操作費記錄
            </CardTitle>
            <CardDescription>記錄您今天的操作項目和數量</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="operationDate">日期</Label>
                  <Input
                    id="operationDate"
                    type="date"
                    value={operationDate}
                    onChange={(e) => setOperationDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">數量</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="operationItem">操作項目</Label>
                <Select value={selectedItem} onValueChange={setSelectedItem}>
                  <SelectTrigger id="operationItem">
                    <SelectValue placeholder="請選擇操作項目" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableItems.map((item) => (
                      <SelectItem key={item.name} value={item.name}>
                        {item.name} - {item.fee} 元 {item.note ? `(${item.note})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">備註（選填）</Label>
                <Input
                  id="notes"
                  placeholder="輸入備註..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {selectedItem && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-600">單價</div>
                      <div className="text-lg font-semibold">{getUnitFee()} 元</div>
                    </div>
                    <div className="text-2xl text-gray-400">×</div>
                    <div>
                      <div className="text-sm text-gray-600">數量</div>
                      <div className="text-lg font-semibold">{quantity}</div>
                    </div>
                    <div className="text-2xl text-gray-400">=</div>
                    <div>
                      <div className="text-sm text-gray-600">總計</div>
                      <div className="text-2xl font-bold text-purple-600">{calculateTotal()} 元</div>
                    </div>
                  </div>
                </div>
              )}

              <Button
                className="w-full h-12 text-lg bg-purple-500 hover:bg-purple-600"
                onClick={handleAddRecord}
                disabled={loading || !selectedItem}
              >
                <Calculator className="w-5 h-5 mr-2" />
                新增記錄
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 操作費記錄列表 */}
        <Card className="bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              操作費記錄
            </CardTitle>
            <CardDescription>顯示最近 50 筆記錄</CardDescription>
          </CardHeader>
          <CardContent>
            {records.length > 0 ? (
              <div className="space-y-3">
                {records.map((record) => (
                  <div key={record.id} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold text-gray-800">
                          {format(new Date(record.operation_date), 'yyyy-MM-dd EEEE', { locale: zhTW })}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {record.operation_item}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">
                          {record.total_fee.toLocaleString()} 元
                        </div>
                        <div className="text-xs text-gray-500">
                          {record.unit_fee} 元 × {record.quantity}
                        </div>
                      </div>
                    </div>
                    {record.notes && (
                      <div className="text-sm text-gray-600 mt-2 pt-2 border-t">
                        備註: {record.notes}
                      </div>
                    )}
                    <div className="flex justify-end mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteRecord(record.id)}
                      >
                        刪除
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                暫無操作費記錄
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
