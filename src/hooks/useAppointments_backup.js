import { useState, useEffect, useCallback } from 'react'
import { supabase, TABLES } from '@/lib/supabase'

export const useAppointments = () => {
  const [appointments, setAppointments] = useState([])
  const [holidays, setHolidays] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 載入假日資料（暫時停用）
  const fetchHolidays = useCallback(async () => {
    // 暫時不載入假日資料，避免資料表不存在的錯誤
    setHolidays([])
  }, [])
	
	  // 載入預約資料（使用分頁查詢突破1000筆限制）
	  const fetchAppointments = useCallback(async () => {
	    try {
      setLoading(true)
      setError(null)

      // 使用分頁查詢載入所有資料
      let allData = []
      let from = 0
      const pageSize = 1000
      let hasMore = true

      while (hasMore) {
        const { data, error: fetchError, count } = await supabase
          .from(TABLES.APPOINTMENTS)
          .select('*', { count: 'exact' })
          .order('date', { ascending: false })
          .order('time', { ascending: true })
          .range(from, from + pageSize - 1)

        if (fetchError) throw fetchError

        allData = [...allData, ...(data || [])]
        from += pageSize
        hasMore = data && data.length === pageSize

        console.log(`✅ Loaded ${allData.length} appointments (total: ${count})`)  
      }

      const data = allData
      const fetchError = null

      // 轉換欄位名稱以匹配UI
      // ...apt 已經包含所有原始欄位，只需添加別名即可
      // 調試：輸出第一筆資料的欄位
      if (data && data.length > 0) {
        console.log('=== useAppointments: 第一筆預約資料 ===', data[0]);
        console.log('user_name:', data[0].user_name);
        console.log('phone:', data[0].phone);
        console.log('appointment_item:', data[0].appointment_item);
      }

      const transformedData = (data || []).map(apt => ({
        ...apt,
        // 添加別名以兼容不同的欄位名稱
        appointment_date: apt.date || apt.appointment_date,
        appointment_time: apt.time || apt.appointment_time
      }))

      setAppointments(transformedData)
    } catch (err) {
      console.error('載入預約失敗:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

	  // 初始載入
	  useEffect(() => {
	    fetchAppointments()
	    fetchHolidays()
	  }, [fetchAppointments, fetchHolidays])

  // 訂閱即時更新
  useEffect(() => {
    const channel = supabase
      .channel('appointments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLES.APPOINTMENTS,
        },
        (payload) => {
          console.log('預約資料變更:', payload)
          fetchAppointments()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchAppointments])

  // 新增預約
  const addAppointment = useCallback(async (appointmentData) => {
    try {
      // 轉換欄位名稱以匹配資料表
      const dbData = {
        date: appointmentData.appointment_date || appointmentData.date,
        time: appointmentData.appointment_time || appointmentData.time,
        customer_name: appointmentData.customer_name,
        patient_name: appointmentData.patient_name,
        phone: appointmentData.phone,
        line_id: appointmentData.line_id,
        treatment: appointmentData.treatment,
        room: appointmentData.room,
        staff: appointmentData.staff,
        equipment: appointmentData.equipment,
        status: appointmentData.status || '尚未報到',
        source: appointmentData.source || '手動新增',
        referrer: appointmentData.referrer,
        notes: appointmentData.notes,
      }

      const { data, error: insertError } = await supabase
        .from(TABLES.APPOINTMENTS)
        .insert([dbData])
        .select()
        .single()

      if (insertError) throw insertError

      return { success: true, data }
    } catch (err) {
      console.error('新增預約失敗:', err)
      return { success: false, error: err.message }
    }
  }, [])

  // 更新預約
  const updateAppointment = useCallback(async (id, updates) => {
    try {
      // 轉換欄位名稱
      const dbUpdates = { ...updates }
      if (updates.appointment_date) {
        dbUpdates.date = updates.appointment_date
        delete dbUpdates.appointment_date
      }
      if (updates.appointment_time) {
        dbUpdates.time = updates.appointment_time
        delete dbUpdates.appointment_time
      }

      const { data, error: updateError } = await supabase
        .from(TABLES.APPOINTMENTS)
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      return { success: true, data }
    } catch (err) {
      console.error('更新預約失敗:', err)
      return { success: false, error: err.message }
    }
  }, [])

  // 刪除預約 (實際刪除,因為沒有deleted_at欄位)
  const deleteAppointment = useCallback(async (id) => {
    try {
      const { error: deleteError } = await supabase
        .from(TABLES.APPOINTMENTS)
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      return { success: true }
    } catch (err) {
      console.error('刪除預約失敗:', err)
      return { success: false, error: err.message }
    }
  }, [])

  // 取得指定日期的預約
  const getAppointmentsByDate = useCallback((date) => {
    return appointments.filter(apt => apt.appointment_date === date)
  }, [appointments])

  // 取得指定日期範圍的預約
  const getAppointmentsByDateRange = useCallback((startDate, endDate) => {
    return appointments.filter(apt => 
      apt.appointment_date >= startDate && apt.appointment_date <= endDate
    )
  }, [appointments])

  // 計算統計資料
  const statistics = {
    totalAppointments: appointments.length,
    pendingAppointments: appointments.filter(apt => apt.status === '尚未報到').length,
    completedAppointments: appointments.filter(apt => apt.status === '已完成').length,
    cancelledAppointments: appointments.filter(apt => apt.status === '已取消').length,
    uniquePatients: new Set(appointments.map(apt => apt.patient_name).filter(Boolean)).size,
    uniqueTreatments: new Set(appointments.map(apt => apt.treatment).filter(Boolean)).size,
  }

	  return {
	    appointments,
	    holidays, // 新增 holidays
	    loading,
	    error,
	    statistics,
	    addAppointment,
	    updateAppointment,
	    deleteAppointment,
	    getAppointmentsByDate,
	    getAppointmentsByDateRange,
	    refreshAppointments: fetchAppointments,
	  }
}
