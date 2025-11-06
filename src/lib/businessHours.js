// FLOS曜診所營業時間設定

export const BUSINESS_HOURS = {
  // 週一到週五
  weekday: {
    start: '12:00',
    end: '20:30',
    days: [1, 2, 3, 4, 5] // 1=週一, 5=週五
  },
  // 週六
  saturday: {
    start: '10:30',
    end: '19:00',
    days: [6]
  },
  // 週日休診
  sunday: {
    closed: true,
    days: [0]
  }
}

// 取得指定日期的營業時間
export const getBusinessHours = (date) => {
  const dayOfWeek = new Date(date).getDay()
  
  // 週日休診
  if (dayOfWeek === 0) {
    return { closed: true, message: '週日休診' }
  }
  
  // 週六
  if (dayOfWeek === 6) {
    return {
      closed: false,
      start: BUSINESS_HOURS.saturday.start,
      end: BUSINESS_HOURS.saturday.end,
      message: '週六 10:30–19:00'
    }
  }
  
  // 週一到週五
  return {
    closed: false,
    start: BUSINESS_HOURS.weekday.start,
    end: BUSINESS_HOURS.weekday.end,
    message: '週一～週五 12:00–20:30'
  }
}

// 檢查指定日期是否為營業日
export const isBusinessDay = (date) => {
  const dayOfWeek = new Date(date).getDay()
  return dayOfWeek !== 0 // 週日不營業
}

// 取得建議的排班時間
export const getSuggestedShiftTimes = (date) => {
  const businessHours = getBusinessHours(date)
  
  if (businessHours.closed) {
    return null
  }
  
  return {
    morning: {
      start: businessHours.start,
      end: '16:00',
      label: '早班'
    },
    afternoon: {
      start: '16:00',
      end: businessHours.end,
      label: '午班'
    },
    full: {
      start: businessHours.start,
      end: businessHours.end,
      label: '全天'
    }
  }
}
