// 權限配置檔案

export type UserRole = 'admin' | 'senior_supervisor' | 'supervisor' | 'staff';

export interface Permission {
  // 頁面存取權限
  canAccessAdminPanel: boolean;
  canAccessDoctorSchedule: boolean;
  canAccessLeaveCalendar: boolean;
  canAccessAttendance: boolean;
  canAccessLeaveManagement: boolean;
  canAccessLeaveApproval: boolean;
  canAccessStaffManagement: boolean;
  canAccessPerformanceReport: boolean;
  canAccessFinancialReport: boolean;
  
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
    canAccessAdminPanel: true,
    canAccessDoctorSchedule: true,
    canAccessLeaveCalendar: true,
    canAccessAttendance: true,
    canAccessLeaveManagement: true,
    canAccessLeaveApproval: true,
    canAccessStaffManagement: true,
    canAccessPerformanceReport: true,
    canAccessFinancialReport: true,
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
  
  // 🟠 高階主管 - 大部分功能 + 業績查看
  senior_supervisor: {
    canAccessAdminPanel: false,
    canAccessDoctorSchedule: true,
    canAccessLeaveCalendar: true,
    canAccessAttendance: true,
    canAccessLeaveManagement: true,
    canAccessLeaveApproval: true,
    canAccessStaffManagement: false,
    canAccessPerformanceReport: true,
    canAccessFinancialReport: true,
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
  
  // 🟡 一般主管 - 審核 + 排班管理
  supervisor: {
    canAccessAdminPanel: false,
    canAccessDoctorSchedule: true,
    canAccessLeaveCalendar: true,
    canAccessAttendance: true,
    canAccessLeaveManagement: true,
    canAccessLeaveApproval: true,
    canAccessStaffManagement: false,
    canAccessPerformanceReport: false,
    canAccessFinancialReport: true,
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
  
  // 🟢 員工 - 打卡 + 請假申請 + 個人業績
  staff: {
    canAccessAdminPanel: false,
    canAccessDoctorSchedule: false,
    canAccessLeaveCalendar: false,
    canAccessAttendance: true,
    canAccessLeaveManagement: true,
    canAccessLeaveApproval: false,
    canAccessStaffManagement: false,
    canAccessPerformanceReport: false,
    canAccessFinancialReport: false,
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
  return PERMISSIONS[role];
}

// 檢查是否有特定權限
export function hasPermission(role: UserRole, permission: keyof Permission): boolean {
  return PERMISSIONS[role][permission];
}

// 角色顯示名稱
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: '管理者',
  senior_supervisor: '高階主管',
  supervisor: '一般主管',
  staff: '員工',
};

// 角色顏色
export const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'text-red-600 bg-red-50',
  senior_supervisor: 'text-orange-600 bg-orange-50',
  supervisor: 'text-yellow-600 bg-yellow-50',
  staff: 'text-green-600 bg-green-50',
};
