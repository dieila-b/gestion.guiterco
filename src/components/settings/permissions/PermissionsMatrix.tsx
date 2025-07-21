
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Grid3x3, Settings, Shield, Users } from 'lucide-react'
import { usePermissions, useRoles, useRolePermissions, useUpdateRolePermissions } from '@/hooks/usePermissions'
import { useState } from 'react'

export default function PermissionsMatrix() {
  const { data: permissions = [], isLoading: permissionsLoading } = usePermissions()
  const { data: roles = [], isLoading: rolesLoading } = useRoles()
  const [selectedRole, setSelectedRole] = useState<string>('')
  const { data: rolePermissions = [] } = useRolePermissions(selectedRole)
  const updateRolePermissions = useUpdateRolePermissions()

  const isLoading = permissionsLoading || rolesLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Organiser les permissions par menu et sous-menu
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const key = permission.menu
    if (!acc[key]) acc[key] = {}
    
    const subkey = permission.submenu || 'default'
    if (!acc[key][subkey]) acc[key][subkey] = []
    
    acc[key][subkey].push(permission)
    return acc
  }, {} as Record<string, Record<string, typeof permissions>>)

  const handlePermissionToggle = (permissionId: string, canAccess: boolean) => {
    if (!selectedRole) return
    
    updateRolePermissions.mutate({
      roleId: selectedRole,
      permissionId,
      canAccess
    })
  }

  const hasPermission = (permissionId: string) => {
    return rolePermissions.some(rp => rp.permission_id === permissionId && rp.can_access)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3x3 className="w-5 h-5" />
            Matrice des Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Sélection du rôle */}
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="text-sm">
                <Users className="w-4 h-4 mr-1" />
                Sélectionner un rôle:
              </Badge>
              {roles.map(role => (
                <Badge
                  key={role.id}
                  variant={selectedRole === role.id ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => setSelectedRole(role.id)}
                >
                  {role.name}
                  {role.is_system && <Shield className="w-3 h-3 ml-1" />}
                </Badge>
              ))}
            </div>

            {selectedRole && (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/3">Module</TableHead>
                      <TableHead className="w-1/3">Sous-module</TableHead>
                      <TableHead className="w-1/6">Action</TableHead>
                      <TableHead className="w-1/6 text-center">Accès</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(groupedPermissions).map(([menu, submenus]) => (
                      Object.entries(submenus).map(([submenu, perms]) => (
                        perms.map((permission, index) => (
                          <TableRow key={permission.id}>
                            <TableCell className="font-medium">
                              {index === 0 ? (
                                <div className="flex items-center gap-2">
                                  <Settings className="w-4 h-4" />
                                  {menu}
                                </div>
                              ) : ''}
                            </TableCell>
                            <TableCell>
                              {submenu !== 'default' ? submenu : ''}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {permission.action}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Switch
                                checked={hasPermission(permission.id)}
                                onCheckedChange={(checked) => 
                                  handlePermissionToggle(permission.id, checked)
                                }
                                disabled={updateRolePermissions.isPending}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      ))
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {!selectedRole && (
              <div className="text-center text-muted-foreground py-8">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Sélectionnez un rôle pour voir et modifier ses permissions</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
