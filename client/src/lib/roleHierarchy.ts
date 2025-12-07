// 角色層級定義
// 用於判斷是否可以管理其他角色

import { UserRole } from './permissions';

// 角色層級 (數字越大權限越高)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  employee: 1,
  supervisor: 2,
  senior_supervisor: 3,
  admin: 4,
};

/**
 * 檢查是否可以管理目標角色
 * @param managerRole 管理者角色
 * @param targetRole 目標角色
 * @returns 是否可以管理
 */
export function canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
  const managerLevel = ROLE_HIERARCHY[managerRole];
  const targetLevel = ROLE_HIERARCHY[targetRole];
  
  // 只能管理比自己低階的角色
  return managerLevel > targetLevel;
}

/**
 * 檢查是否可以修改目標用戶
 * @param managerRole 管理者角色
 * @param targetRole 目標用戶角色
 * @returns 是否可以修改
 */
export function canModifyUser(managerRole: UserRole, targetRole: UserRole): boolean {
  // 管理者可以修改所有人
  if (managerRole === 'admin') {
    return true;
  }
  
  // 其他角色只能修改比自己低階的
  return canManageRole(managerRole, targetRole);
}

/**
 * 過濾可管理的用戶列表
 * @param managerRole 管理者角色
 * @param users 用戶列表
 * @returns 可管理的用戶列表
 */
export function filterManageableUsers<T extends { role: string }>(
  managerRole: UserRole,
  users: T[]
): T[] {
  // 管理者可以看到所有人
  if (managerRole === 'admin') {
    return users;
  }
  
  // 其他角色只能看到比自己低階的
  return users.filter(user => 
    canManageRole(managerRole, user.role as UserRole)
  );
}
