import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// 統一的資料庫表格名稱
const APPOINTMENTS_TABLE = 'flos_appointments_v2';

// 直接使用資料庫欄位，不進行映射
const mapDbToFrontend = (dbRecord) => {
  return dbRecord;
};

// 直接使用資料庫欄位，不進行映射
const mapFrontendToDb = (frontendData) => {
  return {
    taiwan_date: frontendData.taiwan_date,
    time_24h: frontendData.time_24h,
    customer_name: frontendData.customer_name,
    customer_birthday: frontendData.customer_birthday || null,
    contact_phone: frontendData.contact_phone || null,
    treatment_item: frontendData.treatment_item,
    room_used: frontendData.room_used || null,
    equipment_used: frontendData.equipment_used || null,
    customer_source: frontendData.customer_source || null,
    appointment_status: frontendData.appointment_status || '尚未報到',
    data_source: frontendData.data_source || '手動新增',
    consultant: frontendData.consultant || null,
    assistant: frontendData.assistant || null,
    attending_physician: frontendData.attending_physician || null,
    treatment_duration_hours: frontendData.duration_hours || frontendData.treatment_duration_hours || null,
    notes: frontendData.notes || null,
  };
};

export const useAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [holidays, setHolidays] = useState([]);
  // 新增狀態來儲存總預約數
  const [totalAppointmentsCount, setTotalAppointmentsCount] = useState(0);

  // 專門用於獲取總筆數的函數
  const fetchTotalCount = useCallback(async () => {
    try {
      const { count, error: countError } = await supabase
        .from(APPOINTMENTS_TABLE)
        .select('*', { count: 'exact', head: true });

      if (countError) {
        throw countError;
      }

      setTotalAppointmentsCount(count || 0);
    } catch (err) {
      console.error('❌ 載入總筆數失敗:', err);
      setTotalAppointmentsCount(0);
    }
  }, []);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`📊 開始從 ${APPOINTMENTS_TABLE} 載入所有預約資料...`);

      // 獲取總筆數
      await fetchTotalCount();

      // 使用分頁查詢突破Supabase 1000筆限制
      let allData = []
      let from = 0
      const pageSize = 1000
      let hasMore = true

      console.log('📥 開始分頁載入資料...')

      while (hasMore) {
        const { data, error: fetchError } = await supabase
          .from(APPOINTMENTS_TABLE)
          .select('*')
          .order('taiwan_date', { ascending: false })
          .order('time_24h', { ascending: true })
          .range(from, from + pageSize - 1)

        if (fetchError) {
          console.error('❌ Supabase 查詢錯誤:', fetchError)
          throw fetchError
        }

        if (!data || data.length === 0) {
          hasMore = false
          break
        }

        allData = allData.concat(data)
        console.log(`📥 已載入 ${allData.length} 筆資料...`)

        // 如果返回的資料少於pageSize,表示已經是最後一頁
        if (data.length < pageSize) {
          hasMore = false
        } else {
          from += pageSize
        }
      }

      // 將資料庫欄位映射到前端欄位
      const mappedData = allData.map(mapDbToFrontend)

      console.log(`✅ 成功載入 ${mappedData.length} 筆預約資料`)
      setAppointments(mappedData)

    } catch (err) {
      console.error('❌ 載入預約失敗:', err);
      setError(`無法載入預約資料: ${err.message || '請檢查網路連線或聯絡管理員'}`);
      setAppointments([]); // 設置空陣列避免 undefined 錯誤
    } finally {
      setLoading(false);
    }
  }, [fetchTotalCount]);

  useEffect(() => {
    fetchAppointments();

    // 設定即時訂閱
    const channel = supabase
      .channel('appointments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: APPOINTMENTS_TABLE,
        },
        (payload) => {
          console.log('📡 資料庫變更:', payload);
          fetchAppointments(); // 重新載入資料
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAppointments]);

  // 新增預約
  const addAppointment = useCallback(async (appointmentData) => {
    try {
      console.log('📝 新增預約:', appointmentData);
      
      const dbData = mapFrontendToDb(appointmentData);
      
      const { data, error: insertError } = await supabase
        .from(APPOINTMENTS_TABLE)
        .insert([dbData])
        .select();

      if (insertError) {
        throw insertError;
      }

      const newAppointment = mapDbToFrontend(data[0]);
      console.log('✅ 新增預約成功:', newAppointment);
      
      // 更新本地狀態
      setAppointments(prev => [newAppointment, ...prev]);
      // 更新總數
      setTotalAppointmentsCount(prev => prev + 1);
      
      return { success: true, data: newAppointment };
    } catch (err) {
      console.error('❌ 新增預約失敗:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // 更新預約
  const updateAppointment = useCallback(async (id, updates) => {
    try {
      console.log(`📝 更新預約 ${id}:`, updates);
      
      const dbUpdates = mapFrontendToDb(updates);
      
      const { data, error: updateError } = await supabase
        .from(APPOINTMENTS_TABLE)
        .update(dbUpdates)
        .eq('id', id)
        .select();

      if (updateError) {
        throw updateError;
      }

      const updatedAppointment = mapDbToFrontend(data[0]);
      console.log('✅ 更新預約成功:', updatedAppointment);
      
      // 更新本地狀態
      setAppointments(prev =>
        prev.map(apt => (apt.id === id ? updatedAppointment : apt))
      );
      
      return { success: true, data: updatedAppointment };
    } catch (err) {
      console.error('❌ 更新預約失敗:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // 刪除預約
  const deleteAppointment = useCallback(async (id) => {
    try {
      console.log(`🗑️ 刪除預約 ${id}`);
      
      const { error: deleteError } = await supabase
        .from(APPOINTMENTS_TABLE)
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      console.log('✅ 刪除預約成功');
      
      // 更新本地狀態
      setAppointments(prev => prev.filter(apt => apt.id !== id));
      // 更新總數
      setTotalAppointmentsCount(prev => prev - 1);
      
      return { success: true };
    } catch (err) {
      console.error('❌ 刪除預約失敗:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // 取得指定日期的預約
  const getAppointmentsByDate = useCallback((date) => {
    if (!appointments) return []; // 新增 null 檢查
    return appointments.filter(apt => apt.taiwan_date === date);
  }, [appointments]);

  // 取得指定日期範圍的預約
  const getAppointmentsByDateRange = useCallback((startDate, endDate) => {
    if (!appointments) return []; // 新增 null 檢查
    return appointments.filter(apt =>
      apt.taiwan_date >= startDate && apt.taiwan_date <= endDate
    );
  }, [appointments]);

  // 計算統計資料
  const statistics = {
    // 現在使用獨立的狀態變數
    totalAppointments: totalAppointmentsCount, 
    pendingAppointments: appointments ? appointments.filter(apt => apt.appointment_status === '尚未報到' || apt.appointment_status === 'pending').length : 0,
    completedAppointments: appointments ? appointments.filter(apt => apt.appointment_status === '已完成' || apt.appointment_status === 'completed').length : 0,
    cancelledAppointments: appointments ? appointments.filter(apt => apt.appointment_status === '已取消' || apt.appointment_status === 'cancelled').length : 0,
    uniquePatients: appointments ? new Set(appointments.map(apt => apt.customer_name).filter(Boolean)).size : 0,
    uniqueTreatments: appointments ? new Set(appointments.map(apt => apt.treatment_item).filter(Boolean)).size : 0,
  };

  return {
    appointments,
    loading,
    error,
    statistics,
    holidays,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentsByDate,
    getAppointmentsByDateRange,
    refreshAppointments: fetchAppointments,
  };
};
