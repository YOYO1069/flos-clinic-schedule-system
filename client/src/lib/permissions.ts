// 權限配置檔案

export type UserRole = 'admin' | 'senior_supervisor' | 'supervisor' | 'employee' | 'staff';

export interface Permission {
  // 頁面存取權限
  canAccessAttendance: boolean; // 我的打卡
  canAccessAttendanceManagement: boolean; // 打卡記錄/打卡記錄管理
  canAccessLeaveCalendar: boolean; // 休假月曆
  canAccessLeaveManagement: boolean; // 請假管理
  canAccessEmployeeManagement: boolean; // 員工管理
  canAccessLeaveApproval: boolean; // 請假審核
  canAccessAttendanceDashboard: boolean; // 電子看板
  canAccessAccountManagement: boolean; // 帳號密碼管理
  canAccessPermissionManagement: boolean; // 權限分配
  canAccessAttendanceSettings: boolean; // 打卡設定
  canAccessAdminPanel: boolean; // 管理者面板
  canAccessDoctorSchedule: boolean; // 醫師排班
  
  // 功能權限
  canApproveLeave: boolean;
  canManageAllUsers: boolean;
  canViewAllPasswords: boolean;
  canModifyOthersPassword: boolean;
  canExportReports: boolean;
  canManageDoctorSchedule: boolean;
  canManageStaffSchedule: boolean;
  canViewOthersPerformance: boolean;
  canViewOwnPerformance: boolean;
}

// 權限矩陣
export const PERMISSIONS: Record<UserRole, Permission> = {
  // 🔴 管理者 - 完整權限
  admin: {
    canAccessAttendance: true,
    canAccessAttendanceManagement: true,
    canAccessLeaveCalendar: true,
    canAccessLeaveManagement: true,
    canAccessEmployeeManagement: true,
    canAccessLeaveApproval: true,
    canAccessAttendanceDashboard: true,
    canAccessAccountManagement: true,
    canAccessPermissionManagement: true,
    canAccessAttendanceSettings: true,
    canAccessAdminPanel: true,
    canAccessDoctorSchedule: true,
    canApproveLeave: true,
    canManageAllUsers: true,
    canViewAllPasswords: true,
    canModifyOthersPassword: true,
    canExportReports: true,
    canManageDoctorSchedule: true,
    canManageStaffSchedule: true,
    canViewOthersPerformance: true,
    canViewOwnPerformance: true,
  },
  
  // 🟠 高階主管 - 大部分功能 + 業績查看 + 員工管理 + 帳號管理
  senior_supervisor: {
    canAccessAttendance: true,
    canAccessAttendanceManagement: true,
    canAccessLeaveCalendar: true,
    canAccessLeaveManagement: true,
    canAccessEmployeeManagement: true,  // 開放員工管理
    canAccessLeaveApproval: true,
    canAccessAttendanceDashboard: true,
    canAccessAccountManagement: true,  // 開放帳號密碼管理
    canAccessPermissionManagement: false,  // 不能修改權限
    canAccessAttendanceSettings: false,
    canAccessAdminPanel: false,
    canAccessDoctorSchedule: true,
    canApproveLeave: true,
    canManageAllUsers: false,
    canViewAllPasswords: false,
    canModifyOthersPassword: false,
    canExportReports: true,
    canManageDoctorSchedule: true,
    canManageStaffSchedule: true,
    canViewOthersPerformance: true,
    canViewOwnPerformance: true,
  },
  
  // 🟡 一般主管 - 審核 + 排班管理 + 員工管理
  supervisor: {
    canAccessAttendance: true,
    canAccessAttendanceManagement: true,
    canAccessLeaveCalendar: true,
    canAccessLeaveManagement: true,
    canAccessEmployeeManagement: true,  // 開放員工管理
    canAccessLeaveApproval: true,
    canAccessAttendanceDashboard: true,
    canAccessAccountManagement: false,  // 不開放帳號密碼管理
    canAccessPermissionManagement: false,  // 不能修改權限
    canAccessAttendanceSettings: false,
    canAccessAdminPanel: false,
    canAccessDoctorSchedule: true,
    canApproveLeave: true,
    canManageAllUsers: false,
    canViewAllPasswords: false,
    canModifyOthersPassword: false,
    canExportReports: true,
    canManageDoctorSchedule: true,
    canManageStaffSchedule: true,
    canViewOthersPerformance: false,
    canViewOwnPerformance: true,
  },
  
  // 💚 員工 - 打卡 + 請假申請 + 個人業績 + 查看排班
  employee: {
    canAccessAttendance: true,
    canAccessAttendanceManagement: false,
    canAccessLeaveCalendar: true,  // 開放查看休假月曆（只讀）
    canAccessLeaveManagement: true,
    canAccessEmployeeManagement: false,
    canAccessLeaveApproval: false,
    canAccessAttendanceDashboard: false,
    canAccessAccountManagement: false,
    canAccessPermissionManagement: false,
    canAccessAttendanceSettings: false,
    canAccessAdminPanel: false,
    canAccessDoctorSchedule: true, // 員工可以查看醫師排班
    canApproveLeave: false,
    canManageAllUsers: false,
    canViewAllPasswords: false,
    canModifyOthersPassword: false,
    canExportReports: false,
    canManageDoctorSchedule: false,
    canManageStaffSchedule: false,
    canViewOthersPerformance: false,
    canViewOwnPerformance: true,
  },
};

// 獲取用戶權限
export function getUserPermissions(role: UserRole): Permission {
  // staff 是 employee 的別名，兼容舊資料庫
  const normalizedRole = role === 'staff' ? 'employee' : role;
  return PERMISSIONS[normalizedRole as keyof typeof PERMISSIONS];
}

// 檢查是否有特定權限
export function hasPermission(role: UserRole, permission: keyof Permission): boolean {
  // staff 是 employee 的別名，兼容舊資料庫
  const normalizedRole = role === 'staff' ? 'employee' : role;
  return PERMISSIONS[normalizedRole as keyof typeof PERMISSIONS][permission];
}

// 角色顯示名稱
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: '管理者',
  senior_supervisor: '高階主管',
  supervisor: '一般主管',
  employee: '員工',
  staff: '員工', // staff 是 employee 的別名
};

// 角色顏色
export const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'text-red-600 bg-red-50',
  senior_supervisor: 'text-orange-600 bg-orange-50',
  supervisor: 'text-yellow-600 bg-yellow-50',
  employee: 'text-green-600 bg-green-50',
  staff: 'text-green-600 bg-green-50', // staff 是 employee 的別名
};
