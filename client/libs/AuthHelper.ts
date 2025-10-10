import { useAuthStore } from "@/store/auth-store";
import { EPermission } from "@/types/base/Permission";
import { RolePermissionDto } from "@/types/sys/Role";


export const hasPermission = (sysModule: string, required: EPermission): boolean => {
  // Assuming you have an auth store that provides user permissions
  // You'll need to import your auth store here
  // import { useAuthStore } from 'path/to/your/authstore';

  const authStore = useAuthStore(); // or however you access your auth store
  const userPermissions = authStore.permissions || [];
  // Check if user has the required permission for the specific module
  return userPermissions?.some((permission: RolePermissionDto) => 
    permission.sysModule === sysModule && (permission.permission && required)=== required
  ) || false;
};
