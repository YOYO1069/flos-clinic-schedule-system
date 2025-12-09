import { useMemo } from 'react';
import { getUserPermissions, hasPermission, UserRole, Permission } from '@/lib/permissions';

export function usePermissions(userRole: UserRole | null | undefined) {
  const permissions = useMemo(() => {
    if (!userRole) {
      // 未登入用戶沒有任何權限
      return Object.keys(getUserPermissions('employee')).reduce((acc, key) => {
        acc[key as keyof Permission] = false;
        return acc;
      }, {} as Permission);
    }
    return getUserPermissions(userRole);
  }, [userRole]);

  const checkPermission = (permission: keyof Permission) => {
    if (!userRole) return false;
    return hasPermission(userRole, permission);
  };

  return {
    permissions,
    checkPermission,
  };
}
