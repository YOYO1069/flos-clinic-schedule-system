// 診所基本資料常數

// 醫師陣容
export const DOCTORS = [
  '鍾曜任',
  '伍詠聰',
  '林思宇',
  '王昱淞',
  '黃俊堯',
  '藍子軒',
  '何逸群',
  '郭昌浩',
  '宋昀翰'
];

// 員工名單
export const STAFF = [
  '萬晴',
  '陳韻安',
  '劉哲軒',
  '李文華',
  '張耿齊',
  '洪揚程',
  '謝鑵翹',
  '王筑句',
  '米米',
  '花',
  '劉道玄',
  '黃柏翰',
  '周稚凱',
  '郭郁承'
];

// 房間列表
export const ROOMS = [
  'VIP',
  '整容間',
  '美容間',
  '諮詢室',
  '治療室1',
  '治療室2',
  '治療室3'
];

// 預約狀態
export const APPOINTMENT_STATUS = [
  '尚未報到',
  '已報到',
  '進行中',
  '已完成',
  '已取消'
];

// 資料來源
export const DATA_SOURCES = [
  '手動新增',
  '線上預約',
  '電話預約',
  'LINE預約',
  '現場預約',
  '轉介紹'
];

// 療程分類
export const TREATMENT_CATEGORIES = [
  '雷射',
  '保養',
  '針劑',
  '水光',
  '音波',
  '電波',
  '雷射',
  '填充',
  '埋線',
  '其他'
];

// 常見療程項目
export const COMMON_TREATMENTS = [
  'Embody',
  '除毛',
  '皮秒蜂巢',
  '海飛秀',
  '冰光維',
  '電波',
  '音波',
  '水光針',
  '肉毒',
  '玻尿酸',
  '埋線',
  '雷射除斑',
  '雷射除痣',
  '痘疤治療',
  '毛孔治療'
];

// 營業時間
export const BUSINESS_HOURS = {
  weekday: { // 週一～週五
    start: '12:00',
    end: '20:30'
  },
  saturday: { // 週六
    start: '10:30',
    end: '19:00'
  },
  sunday: { // 週日
    closed: true,
    note: '休診（含國定假日）'
  }
};

// 時段列表（30分鐘為單位）
export const TIME_SLOTS = [
  '10:30', '11:00', '11:30',
  '12:00', '12:30',
  '13:00', '13:30',
  '14:00', '14:30',
  '15:00', '15:30',
  '16:00', '16:30',
  '17:00', '17:30',
  '18:00', '18:30',
  '19:00', '19:30',
  '20:00', '20:30'
];

// 根據星期幾獲取營業時間
export const getBusinessHours = (dayOfWeek) => {
  // dayOfWeek: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  if (dayOfWeek === 0) {
    return BUSINESS_HOURS.sunday;
  } else if (dayOfWeek === 6) {
    return BUSINESS_HOURS.saturday;
  } else {
    return BUSINESS_HOURS.weekday;
  }
};

// 檢查時間是否在營業時間內
export const isWithinBusinessHours = (time, dayOfWeek) => {
  const hours = getBusinessHours(dayOfWeek);
  if (hours.closed) return false;
  
  return time >= hours.start && time <= hours.end;
};

