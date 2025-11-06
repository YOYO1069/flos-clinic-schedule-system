import { useState, useEffect, useCallback } from 'react'
import { supabase, TABLES } from '@/lib/supabase'

// 定義資料庫切換日期 (2025-11-01)
const CUTOFF_DATE = '2025-11-01'

export const useAppointments = () => {
  const [appointments, setAppointments] = useState([])
  const [holidays, setHolidays] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 載入假日資料（暫時停用）
  const fetchHolidays = useCallback(async () => {
    setHolidays([])
  }, [])

  // 載入預約資料（整合舊資料庫和新資料庫）
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // 1. 從舊資料庫 (appointments) 載入 2025-10-31 之前的資料
      let oldData = []
      let from = 0
      const pageSize = 1000
      let hasMore = true

      console.log('📊 開始載入舊資料庫 (appointments) - 2025-10-31 之前的資料...')
      while (hasMore) {
        const { data, error: fetchError } = await supabase
          .from(TABLES.APPOINTMENTS)
          .select('*')
          .lt('date', CUTOFF_DATE)
          .order('date', { ascending: false })
          .order('time_slot', { ascending: true })
          .range(from, from + pageSize - 1)

        if (fetchError) {
          console.warn('⚠️ 載入舊資料庫失敗:', fetchError)
          break
        }

        oldData = [...oldData, ...(data || [])]
        from += pageSize
        hasMore = data && data.length === pageSize
      }

      console.log(`✅ 舊資料庫載入完成: ${oldData.length} 筆`)

      // 2. 從新資料庫 (appointments_new) 載入 2025-11-01 之後的資料
      let newData = []
      from = 0
      hasMore = true

      console.log('📊 開始載入新資料庫 (appointments_new) - 2025-11-01 之後的資料...')
      while (hasMore) {
        const { data, error: fetchError } = await supabase
          .from('appointments_new')
          .select('*')
          .gte('date', CUTOFF_DATE)
          .order('date', { ascending: false })
          .order('time_slot', { ascending: true })
          .range(from, from + pageSize - 1)

        if (fetchError) {
          console.warn('⚠️ 載入新資料庫失敗:', fetchError)
          break
        }

        newData = [...newData, ...(data || [])]
        from += pageSize
        hasMore = data && data.length === pageSize
      }

      console.log(`✅ 新資料庫載入完成: ${newData.length} 筆`)

      // 3. 整合兩個資料庫的資料
      const allData = [...oldData, ...newData]
      console.log(`🎯 總共載入: ${allData.length} 筆預約資料`)

      // 4. 轉換欄位名稱以匹配UI (統一欄位名稱)
      const transformedData = allData.map(apt => ({
        ...apt,
        // 統一欄位名稱
        appointment_date: apt.date,
        appointment_time: apt.time_slot,
        // 標記資料來源
        _source_table: apt.date < CUTOFF_DATE ? 'appointments' : 'appointments_new'
      }))

      // 5. 按日期和時間排序
      transformedData.sort((a, b) => {
        const dateCompare = b.appointment_date.localeCompare(a.appointment_date)
        if (dateCompare !== 0) return dateCompare
        return (a.appointment_time || '').localeCompare(b.appointment_time || '')
      })

      setAppointments(transformedData)
    } catch (err) {
      console.error('❌ 載入預約失敗:', err)
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

  // 訂閱即時更新 (同時監聽兩個資料表)
  useEffect(() => {
    // 監聽舊資料庫
    const oldChannel = supabase
      .channel('appointments_old_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLES.APPOINTMENTS,
        },
        (payload) => {
          console.log('📢 舊資料庫變更:', payload)
          fetchAppointments()
        }
      )
      .subscribe()

    // 監聽新資料庫
    const newChannel = supabase
      .channel('appointments_new_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments_new',
        },
        (payload) => {
          console.log('📢 新資料庫變更:', payload)
          fetchAppointments()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(oldChannel)
      supabase.removeChannel(newChannel)
    }
  }, [fetchAppointments])

  // 新增預約 (根據日期自動選擇資料庫)
  const addAppointment = useCallback(async (appointmentData) => {
    try {
      const appointmentDate = appointmentData.appointment_date || appointmentData.date

      // 根據日期決定使用哪個資料庫
      const useNewTable = appointmentDate >= CUTOFF_DATE
      const tableName = useNewTable ? 'appointments_new' : TABLES.APPOINTMENTS

      console.log(`📝 新增預約到 ${tableName} (日期: ${appointmentDate})`)

      // 準備資料
      const dbData = {
        date: appointmentDate,
        time_slot: appointmentData.appointment_time || appointmentData.time_slot,
        user_name: appointmentData.user_name || appointmentData.customer_name,
        service_type: appointmentData.service_type || appointmentData.treatment,
        status: appointmentData.status || 'pending',
        phone: appointmentData.phone,
        line_user_id: appointmentData.line_user_id || appointmentData.line_id,
        birthday: appointmentData.birthday || appointmentData.customer_dob,
        appointment_type: appointmentData.appointment_type || appointmentData.category,
        room: appointmentData.room,
        equipment: appointmentData.equipment,
        executor: appointmentData.executor || appointmentData.staff,
        consultant: appointmentData.consultant,
        on_duty_doctor: appointmentData.on_duty_doctor,
        source: appointmentData.source || '手動新增',
        notes: appointmentData.notes,
      }

      const { data, error: insertError } = await supabase
        .from(tableName)
        .insert([dbData])
        .select()
        .single()

      if (insertError) throw insertError

      console.log('✅ 預約新增成功:', data)
      return { success: true, data }
    } catch (err) {
      console.error('❌ 新增預約失敗:', err)
      return { success: false, error: err.message }
    }
  }, [])

  // 更新預約 (根據原始資料來源更新對應的資料庫)
  const updateAppointment = useCallback(async (id, updates) => {
    try {
      // 找到原始預約資料以確定使用哪個資料庫
      const originalAppointment = appointments.find(apt => apt.id === id)
      if (!originalAppointment) {
        throw new Error('找不到原始預約資料')
      }

      const tableName = originalAppointment._source_table || TABLES.APPOINTMENTS

      console.log(`📝 更新預約 ${id} 在 ${tableName}`)

      // 準備更新資料
      const dbUpdates = { ...updates }
      if (updates.appointment_date) {
        dbUpdates.date = updates.appointment_date
        delete dbUpdates.appointment_date
      }
      if (updates.appointment_time) {
        dbUpdates.time_slot = updates.appointment_time
        delete dbUpdates.appointment_time
      }

      const { data, error: updateError } = await supabase
        .from(tableName)
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      console.log('✅ 預約更新成功:', data)
      return { success: true, data }
    } catch (err) {
      console.error('❌ 更新預約失敗:', err)
      return { success: false, error: err.message }
    }
  }, [appointments])

  // 刪除預約 (根據原始資料來源刪除對應的資料庫)
  const deleteAppointment = useCallback(async (id) => {
    try {
      const originalAppointment = appointments.find(apt => apt.id === id)
      if (!originalAppointment) {
        throw new Error('找不到原始預約資料')
      }

      const tableName = originalAppointment._source_table || TABLES.APPOINTMENTS

      console.log(`🗑️ 刪除預約 ${id} 從 ${tableName}`)

      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      console.log('✅ 預約刪除成功')
      return { success: true }
    } catch (err) {
      console.error('❌ 刪除預約失敗:', err)
      return { success: false, error: err.message }
    }
  }, [appointments])

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
    pendingAppointments: appointments.filter(apt => apt.status === '尚未報到' || apt.status === 'pending').length,
    completedAppointments: appointments.filter(apt => apt.status === '已完成' || apt.status === 'completed').length,
    cancelledAppointments: appointments.filter(apt => apt.status === '已取消' || apt.status === 'cancelled').length,
    uniquePatients: new Set(appointments.map(apt => apt.user_name || apt.patient_name).filter(Boolean)).size,
    uniqueTreatments: new Set(appointments.map(apt => apt.service_type || apt.treatment).filter(Boolean)).size,
  }

  return {
    appointments,
    holidays,
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
