import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { DOCTORS, STAFF, ROOMS, APPOINTMENT_STATUS, DATA_SOURCES, TREATMENT_CATEGORIES, COMMON_TREATMENTS } from '@/constants/clinicData';

const EnhancedAppointmentDialog = ({ open, onOpenChange, appointment, onSuccess, mode = 'edit' }) => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    patient_name: '',
    birthday: '',
    phone: '',
    line_id: '',
    treatment: '',
    category: '',
    room: '',
    equipment: '',
    staff: '',
    consultant: '',
    assistant: '',
    doctor: '',
    status: '尚未報到',
    source: '',
    notes: '',
    duration: '1.0',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (appointment && mode === 'edit') {
      setFormData({
        date: appointment.date || '',
        time: appointment.time || '',
        patient_name: appointment.patient_name || '',
        birthday: appointment.birthday || '',
        phone: appointment.phone || '',
        line_id: appointment.line_id || '',
        treatment: appointment.treatment || '',
        category: appointment.category || '',
        room: appointment.room || '',
        equipment: appointment.equipment || '',
        staff: appointment.staff || '',
        consultant: appointment.consultant || '',
        assistant: appointment.assistant || '',
        doctor: appointment.doctor || '',
        status: appointment.status || '尚未報到',
        source: appointment.source || '',
        notes: appointment.notes || '',
        duration: appointment.duration || '1.0',
      });
    } else if (mode === 'create') {
      // 重置表單
      setFormData({
        date: new Date().toISOString().split('T')[0],
        time: '10:30',
        patient_name: '',
        birthday: '',
        phone: '',
        line_id: '',
        treatment: '',
        category: '',
        room: '',
        equipment: '',
        staff: '',
        consultant: '',
        assistant: '',
        doctor: '',
        status: '尚未報到',
        source: '手動新增',
        notes: '',
        duration: '1.0',
      });
    }
  }, [appointment, mode, open]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // 驗證必填欄位
    if (!formData.date || !formData.time || !formData.patient_name || !formData.treatment) {
      toast.error('請填寫必填欄位：日期、時間、姓名、療程');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'edit' && appointment) {
        // 更新預約
        const { error } = await supabase
          .from('flos_appointments')
          .update(formData)
          .eq('id', appointment.id);

        if (error) throw error;
        toast.success('預約已更新');
      } else {
        // 新增預約
        const { error } = await supabase
          .from('flos_appointments')
          .insert([formData]);

        if (error) throw error;
        toast.success('預約已新增');
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast.error(`儲存失敗：${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!appointment || !confirm('確定要刪除此預約嗎？')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('flos_appointments')
        .delete()
        .eq('id', appointment.id);

      if (error) throw error;
      toast.success('預約已刪除');
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error(`刪除失敗：${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? '編輯預約' : '新增預約'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          {/* 日期 */}
          <div className="space-y-2">
            <Label htmlFor="date">日期 *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
            />
          </div>

          {/* 時間 */}
          <div className="space-y-2">
            <Label htmlFor="time">時間 *</Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => handleChange('time', e.target.value)}
            />
          </div>

          {/* 客人姓名 */}
          <div className="space-y-2">
            <Label htmlFor="patient_name">客人姓名 *</Label>
            <Input
              id="patient_name"
              value={formData.patient_name}
              onChange={(e) => handleChange('patient_name', e.target.value)}
            />
          </div>

          {/* 客戶生日 */}
          <div className="space-y-2">
            <Label htmlFor="birthday">客戶生日</Label>
            <Input
              id="birthday"
              type="date"
              value={formData.birthday}
              onChange={(e) => handleChange('birthday', e.target.value)}
            />
          </div>

          {/* 聯絡電話 */}
          <div className="space-y-2">
            <Label htmlFor="phone">聯絡電話</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </div>

          {/* LINE ID */}
          <div className="space-y-2">
            <Label htmlFor="line_id">LINE ID</Label>
            <Input
              id="line_id"
              value={formData.line_id}
              onChange={(e) => handleChange('line_id', e.target.value)}
            />
          </div>

          {/* 療程 */}
          <div className="space-y-2">
            <Label htmlFor="treatment">療程項目 *</Label>
            <Input
              id="treatment"
              value={formData.treatment}
              onChange={(e) => handleChange('treatment', e.target.value)}
              list="treatment-list"
            />
            <datalist id="treatment-list">
              {COMMON_TREATMENTS.map(treatment => (
                <option key={treatment} value={treatment} />
              ))}
            </datalist>
          </div>

          {/* 分類 */}
          <div className="space-y-2">
            <Label htmlFor="category">療程分類</Label>
            <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="選擇分類" />
              </SelectTrigger>
              <SelectContent>
                {TREATMENT_CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 房間 */}
          <div className="space-y-2">
            <Label htmlFor="room">使用房間</Label>
            <Select value={formData.room} onValueChange={(value) => handleChange('room', value)}>
              <SelectTrigger>
                <SelectValue placeholder="選擇房間" />
              </SelectTrigger>
              <SelectContent>
                {ROOMS.map(room => (
                  <SelectItem key={room} value={room}>{room}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 使用設備 */}
          <div className="space-y-2">
            <Label htmlFor="equipment">使用設備</Label>
            <Input
              id="equipment"
              value={formData.equipment}
              onChange={(e) => handleChange('equipment', e.target.value)}
              placeholder="例：皮秒蜂巢機"
            />
          </div>

          {/* 執行人員 */}
          <div className="space-y-2">
            <Label htmlFor="staff">執行人員</Label>
            <Select value={formData.staff} onValueChange={(value) => handleChange('staff', value)}>
              <SelectTrigger>
                <SelectValue placeholder="選擇人員" />
              </SelectTrigger>
              <SelectContent>
                {STAFF.map(staff => (
                  <SelectItem key={staff} value={staff}>{staff}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 預約狀態 */}
          <div className="space-y-2">
            <Label htmlFor="status">預約狀態</Label>
            <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APPOINTMENT_STATUS.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 資料來源 */}
          <div className="space-y-2">
            <Label htmlFor="source">資料來源</Label>
            <Select value={formData.source} onValueChange={(value) => handleChange('source', value)}>
              <SelectTrigger>
                <SelectValue placeholder="選擇來源" />
              </SelectTrigger>
              <SelectContent>
                {DATA_SOURCES.map(source => (
                  <SelectItem key={source} value={source}>{source}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 諮詢師 */}
          <div className="space-y-2">
            <Label htmlFor="consultant">諮詢師</Label>
            <Select value={formData.consultant} onValueChange={(value) => handleChange('consultant', value)}>
              <SelectTrigger>
                <SelectValue placeholder="選擇諮詢師" />
              </SelectTrigger>
              <SelectContent>
                {STAFF.map(staff => (
                  <SelectItem key={staff} value={staff}>{staff}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 跟診人員 */}
          <div className="space-y-2">
            <Label htmlFor="assistant">跟診人員</Label>
            <Select value={formData.assistant} onValueChange={(value) => handleChange('assistant', value)}>
              <SelectTrigger>
                <SelectValue placeholder="選擇跟診人員" />
              </SelectTrigger>
              <SelectContent>
                {STAFF.map(staff => (
                  <SelectItem key={staff} value={staff}>{staff}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 主治醫師 */}
          <div className="space-y-2">
            <Label htmlFor="doctor">主治醫師</Label>
            <Select value={formData.doctor} onValueChange={(value) => handleChange('doctor', value)}>
              <SelectTrigger>
                <SelectValue placeholder="選擇醫師" />
              </SelectTrigger>
              <SelectContent>
                {DOCTORS.map(doctor => (
                  <SelectItem key={doctor} value={doctor}>{doctor}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 療程時間 */}
          <div className="space-y-2">
            <Label htmlFor="duration">療程時間（小時）</Label>
            <Select value={formData.duration} onValueChange={(value) => handleChange('duration', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.5">0.5小時（30分鐘）</SelectItem>
                <SelectItem value="1.0">1.0小時</SelectItem>
                <SelectItem value="1.5">1.5小時</SelectItem>
                <SelectItem value="2.0">2.0小時</SelectItem>
                <SelectItem value="2.5">2.5小時</SelectItem>
                <SelectItem value="3.0">3.0小時</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 備註 */}
          <div className="col-span-2 space-y-2">
            <Label htmlFor="notes">備註</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {mode === 'edit' && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                刪除
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              取消
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? '儲存中...' : '儲存'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedAppointmentDialog;

