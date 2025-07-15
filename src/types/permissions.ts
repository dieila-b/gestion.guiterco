export interface Role {
  id: string;
  name: string;
  description: string;
  is_system_role: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  menu: string;
  submenu: string | null;
  action: string;
  description: string;
  created_at: string;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  can_access: boolean;
  created_at: string;
  permission?: Permission;
  role?: Role;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  assigned_at: string;
  assigned_by: string | null;
  is_active: boolean;
  role?: Role;
}

export interface PermissionMatrix {
  menu: string;
  submenu: string | null;
  permissions: {
    read: Permission | null;
    write: Permission | null;
    delete: Permission | null;
  };
  roleAccess: {
    [roleId: string]: {
      read: boolean;
      write: boolean;
      delete: boolean;
    };
  };
}