
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Shield, User, Search, Crown, Briefcase, AlertCircle, UserCheck, Settings, Users, Lock } from 'lucide-react';
import { useUtilisateursInternes } from '@/hooks/useUtilisateursInternes';
import { useRoles, useAssignUserRole } from '@/hooks/usePermissionsSystem';

export default function AccessControl() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const { data: usersWithRoles = [], isLoading: usersLoading, error: usersError } = useUtilisateursInternes();
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const assignRole = useAssignUserRole();

  const handleRoleAssignment = async (userId: string, roleId: string) => {
    try {
      await assignRole.mutateAsync({ userId, roleId });
    } catch (error) {
      console.error('Error assigning role:', error);
    }
  };

  // Filtrer les utilisateurs
  const filteredUsers = usersWithRoles.filter(user => {
    const matchesSearch = !searchTerm || 
      user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role?.name === filterRole;
    const matchesStatus = filterStatus === 'all' || user.statut === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleIcon = (roleName: string) => {
    switch (roleName?.toLowerCase()) {
      case 'administrateur':
        return <Crown className="h-4 w-4 text-red-500" />;
      case 'manager':
        return <Briefcase className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
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

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'actif':
        return <Badge variant="default" className="bg-green-100 text-green-800">Actif</Badge>;
      case 'inactif':
        return <Badge variant="secondary">Inactif</Badge>;
      case 'suspendu':
        return <Badge variant="destructive">Suspendu</Badge>;
      default:
        return <Badge variant="secondary">{statut}</Badge>;
    }
  };

  // Calculer les statistiques
  const userStats = {
    total: usersWithRoles.length,
    byRole: roles.reduce((acc, role) => {
      acc[role.name] = usersWithRoles.filter(user => user.role?.name === role.name).length;
      return acc;
    }, {} as Record<string, number>),
    byStatus: {
      actif: usersWithRoles.filter(user => user.statut === 'actif').length,
      inactif: usersWithRoles.filter(user => user.statut === 'inactif').length,
      suspendu: usersWithRoles.filter(user => user.statut === 'suspendu').length
    }
  };

  const isLoading = usersLoading || rolesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement des utilisateurs...</p>
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
      {/* Statistiques d'accès */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{userStats.byStatus.actif}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Administrateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{userStats.byRole.Administrateur || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Managers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{userStats.byRole.Manager || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Gestion des utilisateurs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <div>
                <CardTitle>Contrôle d'Accès</CardTitle>
                <CardDescription>
                  Gérez les rôles et permissions des utilisateurs du système
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Filtrer par statut</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="inactif">Inactif</SelectItem>
                  <SelectItem value="suspendu">Suspendu</SelectItem>
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
                <TableHead>Statut</TableHead>
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
                      <Badge variant="outline" className={`${getRoleColor(user.role.name)} capitalize`}>
                        <div className="flex items-center space-x-1">
                          {getRoleIcon(user.role.name)}
                          <span>{user.role.name}</span>
                        </div>
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Aucun rôle
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(user.statut)}
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
              <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun utilisateur trouvé</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterRole !== 'all' || filterStatus !== 'all'
                  ? 'Aucun utilisateur ne correspond à vos critères de recherche'
                  : 'Aucun utilisateur configuré dans le système'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
