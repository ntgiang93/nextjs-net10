import { useAuthStore } from '@/store/auth-store';
import { EPermission } from '@/types/base/Permission';
import { ESysModule } from '@/types/constant/SysModule';
import { SysRoles } from '@/types/constant/SysRoles';
import { RolePermissionDto } from '@/types/sys/Role';

export const hasPermission = (sysModule: string | ESysModule, required: EPermission): boolean => {
  // Assuming you have an auth store that provides user permissions
  // You'll need to import your auth store here
  // import { useAuthStore } from 'path/to/your/authstore';

  const authStore = useAuthStore(); // or however you access your auth store
  const userPermissions = authStore.permissions || [];
  const userClaim = authStore.user || undefined;
  if (userClaim) {
    const userRoleCodes = userClaim.roleCode.split(';');
    return userRoleCodes.includes(SysRoles.SuperAdmin); // SuperAdmin has all permissions
  } else
    // Check if user has the required permission for the specific module
    return (
      userPermissions?.some(
        (permission: RolePermissionDto) =>
          permission.sysModule === sysModule.toString() &&
          (permission.permission && required) === required,
      ) || false
    );
};
