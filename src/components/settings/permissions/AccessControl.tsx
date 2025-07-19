
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/components/auth/AuthContext';
import { Shield, Check, X, AlertCircle, Users, Search, Crown, Briefcase, User, Eye, Edit, Trash2 } from 'lucide-react';
import { useUtilisateursInternes, useRolesForUsers } from '@/hooks/useUtilisateursInternes';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useUserRoleAssignment } from '@/hooks/useUserRoleAssignment';

const AccessControl = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  
  const { user, utilisateurInterne } = useAuth();
  const { data: userPermissions = [], isLoading: permissionsLoading, error: permissionsError } = useUserPermissions(user?.id);
  const { data: usersWithRoles = [], isLoading: usersLoading, error: usersError } = useUtilisateursInternes();
  const { data: roles = [], isLoading: rolesLoading } = useRolesForUsers();
  const { assignRole } = useUserRoleAssignment();

  const handleRoleAssignment = async (userId: string, roleId: string) => {
    try {
      console.log('🔄 Assigning role:', { userId, roleId });
      await assignRole.mutateAsync({ userId, roleId });
    } catch (error) {
      console.error('❌ Error assigning role:', error);
    }
  };

  // Filtrer les utilisateurs
  const filteredUsers = usersWithRoles.filter(user => {
    const matchesSearch = !searchTerm || 
      user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role?.nom === filterRole;
    
    return matchesSearch && matchesRole;
  });

  // Grouper les permissions par menu
  const groupedPermissions = userPermissions.reduce((acc, permission) => {
    const menuName = permission.menu || 'Général';
    if (!acc[menuName]) {
      acc[menuName] = [];
    }
    acc[menuName].push(permission);
    return acc;
  }, {} as Record<string, typeof userPermissions>);

  const getPermissionTypeColor = (action: string) => {
    switch (action) {
      case 'read':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'write':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'delete':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPermissionIcon = (action: string) => {
    switch (action) {
      case 'read':
        return <Eye className="h-3 w-3" />;
      case 'write':
        return <Edit className="h-3 w-3" />;
      case 'delete':
        return <Trash2 className="h-3 w-3" />;
      default:
        return <Shield className="h-3 w-3" />;
    }
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName?.toLowerCase()) {
      case 'administrateur':
        return <Crown className="h-4 w-4" />;
      case 'manager':
        return <Briefcase className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName?.toLowerCase()) {
      case 'administrateur':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'manager':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'vendeur':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'caissier':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const isLoading = permissionsLoading || usersLoading || rolesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement des données d'accès...</p>
        </div>
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Erreur de chargement</h3>
          <p className="text-muted-foreground mb-4">
            Impossible de charger les utilisateurs : {usersError.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Contrôle d'Accès</h3>
        <p className="text-sm text-muted-foreground">
          Gérez les rôles des utilisateurs et consultez les permissions du système
        </p>
      </div>

      {/* Informations utilisateur actuel */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <div>
              <CardTitle>Votre Profil d'Accès</CardTitle>
              <CardDescription>
                Informations sur votre compte et vos permissions actuelles
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Nom complet</label>
              <p className="text-sm font-medium">
                {utilisateurInterne?.prenom} {utilisateurInterne?.nom}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-sm">{user?.email}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Rôle assigné</label>
              {utilisateurInterne?.role?.nom ? (
                <Badge variant="outline" className={`${getRoleColor(utilisateurInterne.role.nom)} capitalize`}>
                  <div className="flex items-center space-x-1">
                    {getRoleIcon(utilisateurInterne.role.nom)}
                    <span>{utilisateurInterne.role.nom}</span>
                  </div>
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                  Aucun rôle
                </Badge>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Statut</label>
              <Badge variant="default" className="bg-green-100 text-green-800">
                Actif
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gestion des rôles utilisateurs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <div>
                <CardTitle>Gestion des Utilisateurs</CardTitle>
                <CardDescription>
                  Assignez et gérez les rôles des utilisateurs système
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline">
              {filteredUsers.length} utilisateur(s)
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtres */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Recherche</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Filtrer par rôle</label>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les rôles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(role.name)}
                        <span>{role.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table des utilisateurs */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle Actuel</TableHead>
                <TableHead>Modifier le Rôle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{user.prenom} {user.nom}</p>
                        <p className="text-sm text-muted-foreground">Utilisateur interne</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.role ? (
                      <Badge variant="outline" className={`${getRoleColor(user.role.nom)} capitalize`}>
                        <div className="flex items-center space-x-1">
                          {getRoleIcon(user.role.nom)}
                          <span>{user.role.nom}</span>
                        </div>
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                        Aucun rôle
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={user.role?.id || ''} 
                      onValueChange={(roleId) => handleRoleAssignment(user.user_id, roleId)}
                      disabled={assignRole.isPending}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Choisir un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            <div className="flex items-center space-x-2">
                              {getRoleIcon(role.name)}
                              <span>{role.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun utilisateur trouvé</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterRole !== 'all'
                  ? 'Aucun utilisateur ne correspond à vos critères de recherche'
                  : 'Aucun utilisateur configuré dans le système'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vos permissions détaillées */}
      <Card>
        <CardHeader>
          <CardTitle>Vos Permissions Détaillées</CardTitle>
          <CardDescription>
            Vue complète de toutes vos permissions par module
          </CardDescription>
        </CardHeader>
        <CardContent>
          {permissionsError ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">Permissions indisponibles</h3>
              <p className="text-muted-foreground">
                ID utilisateur invalide ou permissions non configurées
              </p>
            </div>
          ) : Object.entries(groupedPermissions).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([menuName, permissions]) => (
                <div key={menuName} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium capitalize">{menuName}</h4>
                    <Badge variant="outline">
                      {permissions.length} permission(s)
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {permissions.map((permission, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <Badge 
                          variant="outline"
                          className={`${getPermissionTypeColor(permission.action)} text-xs`}
                        >
                          <div className="flex items-center space-x-1">
                            {getPermissionIcon(permission.action)}
                            <span className="capitalize">{permission.action}</span>
                          </div>
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucune permission configurée</h3>
              <p className="text-muted-foreground">
                Contactez votre administrateur pour obtenir les permissions nécessaires
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Résumé statistique */}
      <Card>
        <CardHeader>
          <CardTitle>Statistiques d'Accès</CardTitle>
          <CardDescription>
            Vue d'ensemble des permissions et utilisateurs système
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{usersWithRoles.length}</div>
              <div className="text-sm text-muted-foreground">Total Utilisateurs</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">{roles.length}</div>
              <div className="text-sm text-muted-foreground">Rôles Configurés</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {userPermissions.filter(p => p.action === 'read').length}
              </div>
              <div className="text-sm text-muted-foreground">Permissions Lecture</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {userPermissions.filter(p => p.action === 'write').length}
              </div>
              <div className="text-sm text-muted-foreground">Permissions Écriture</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessControl;
