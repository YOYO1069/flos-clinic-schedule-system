export interface DoctorShift {
  id: string;
  doctorName: string;
  startTime: string;
  endTime: string;
}

export interface DaySchedule {
  date: string; // YYYY-MM-DD format
  shifts: DoctorShift[];
}

export interface MonthSchedule {
  year: number;
  month: number; // 1-12
  schedules: Record<string, DaySchedule>; // key: YYYY-MM-DD
}
