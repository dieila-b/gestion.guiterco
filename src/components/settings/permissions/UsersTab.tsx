
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Search, UserCheck, UserX, AlertCircle } from 'lucide-react';
import { useUtilisateursInternes, useUpdateUtilisateurInterne } from '@/hooks/useUtilisateursInternes';
import { useRoles } from '@/hooks/usePermissionsSystem';
import { QuickUserCheck } from '@/components/debug/QuickUserCheck';

export default function UsersTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  const { data: users = [], isLoading: usersLoading, error: usersError, refetch } = useUtilisateursInternes();
  const { data: roles = [] } = useRoles();
  const updateUser = useUpdateUtilisateurInterne();

  const handleRoleChange = (userId: string, roleId: string) => {
    updateUser.mutate({ 
      id: userId, 
      role_id: roleId === 'none' ? null : roleId 
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || 
                       (roleFilter === 'none' && !user.role_id) ||
                       user.role_id === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getRoleName = (roleId?: string) => {
    if (!roleId) return null;
    const role = roles.find(r => r.id === roleId);
    return role?.name || 'Rôle inconnu';
  };

  const getRoleColor = (roleName?: string | null) => {
    if (!roleName) return 'bg-gray-100 text-gray-800';
    
    switch (roleName.toLowerCase()) {
      case 'super administrateur':
        return 'bg-red-100 text-red-800';
      case 'administrateur':
        return 'bg-orange-100 text-orange-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'employé':
        return 'bg-green-100 text-green-800';
      case 'caissier':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Composant de diagnostic rapide */}
      <QuickUserCheck />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Utilisateurs et Rôles ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {usersError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800 font-medium">
                <AlertCircle className="h-5 w-5" />
                Erreur de chargement
              </div>
              <p className="text-red-700 text-sm mt-1">{usersError.message}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="mt-2"
              >
                Réessayer
              </Button>
            </div>
          )}

          {usersLoading && (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Chargement des utilisateurs...</span>
            </div>
          )}

          {!usersLoading && !usersError && (
            <>
              {/* Filtres */}
              <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Rechercher un utilisateur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrer par rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les rôles</SelectItem>
                    <SelectItem value="none">Sans rôle</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Statistiques */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{users.length}</div>
                  <div className="text-sm text-muted-foreground">Total utilisateurs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{users.filter(u => u.statut === 'actif').length}</div>
                  <div className="text-sm text-muted-foreground">Actifs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{users.filter(u => u.role_id).length}</div>
                  <div className="text-sm text-muted-foreground">Avec rôle</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{users.filter(u => !u.role_id).length}</div>
                  <div className="text-sm text-muted-foreground">Sans rôle</div>
                </div>
              </div>

              {/* Tableau des utilisateurs */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Rôle actuel</TableHead>
                      <TableHead>Changer le rôle</TableHead>
                      <TableHead>Type de compte</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              {user.role_id ? (
                                <UserCheck className="w-4 h-4 text-primary" />
                              ) : (
                                <UserX className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{user.prenom} {user.nom}</div>
                              <div className="text-sm text-muted-foreground">{user.matricule}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.statut === 'actif' ? 'default' : 'secondary'}>
                            {user.statut}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.role_id ? (
                            <Badge className={getRoleColor(getRoleName(user.role_id))}>
                              {getRoleName(user.role_id)}
                            </Badge>
                          ) : (
                            <Badge variant="outline">Aucun rôle</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.role_id || 'none'}
                            onValueChange={(value) => handleRoleChange(user.id, value)}
                            disabled={updateUser.isPending}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Aucun rôle</SelectItem>
                              {roles.map((role) => (
                                <SelectItem key={role.id} value={role.id}>
                                  {role.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {user.type_compte}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredUsers.length === 0 && users.length > 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun utilisateur ne correspond aux filtres</p>
                </div>
              )}

              {users.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun utilisateur trouvé dans la base de données</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
