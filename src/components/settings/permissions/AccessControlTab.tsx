
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Shield, Users } from 'lucide-react';
import { useUsersWithRoles, useAssignUserRole, useRevokeUserRole, useRoles } from '@/hooks/usePermissionsSystem';

const AccessControlTab = () => {
  const { data: users = [], isLoading: usersLoading } = useUsersWithRoles();
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const assignRole = useAssignUserRole();
  const revokeRole = useRevokeUserRole();

  const handleAssignRole = async (userId: string, roleId: string) => {
    try {
      await assignRole.mutateAsync({ userId, roleId });
    } catch (error) {
      console.error('Erreur lors de l\'assignation du rôle:', error);
    }
  };

  const handleRevokeRole = async (userId: string) => {
    try {
      await revokeRole.mutateAsync(userId);
    } catch (error) {
      console.error('Erreur lors de la révocation du rôle:', error);
    }
  };

  if (usersLoading || rolesLoading) {
    return <div className="p-6">Chargement des utilisateurs...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestion des utilisateurs et rôles
          </CardTitle>
          <CardDescription>
            Assignez des rôles aux utilisateurs internes pour contrôler leurs accès
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{user.prenom} {user.nom}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                  <div className="text-xs text-gray-400">Matricule: {user.matricule}</div>
                </div>
                
                <div className="flex items-center gap-3">
                  {user.role ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        {user.role.name}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevokeRole(user.id)}
                        disabled={revokeRole.isPending}
                      >
                        Révoquer
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Select onValueChange={(roleId) => handleAssignRole(user.id, roleId)}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Assigner un rôle" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessControlTab;
