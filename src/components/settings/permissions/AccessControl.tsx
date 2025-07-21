
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, UserCheck, Shield, AlertCircle } from 'lucide-react';
import { useRoles, useAssignUserRole } from '@/hooks/usePermissionsSystem';
import { useUtilisateursInternes } from '@/hooks/useUtilisateursInternes';
import { toast } from 'sonner';

export default function AccessControl() {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  
  const { data: roles = [] } = useRoles();
  const { data: utilisateurs = [] } = useUtilisateursInternes();
  const assignUserRole = useAssignUserRole();

  // Obtenir le rôle actuel d'un utilisateur
  const getUserRole = (userId: string) => {
    const utilisateur = utilisateurs.find(u => u.user_id === userId);
    if (!utilisateur) return null;
    
    const role = roles.find(r => r.id === utilisateur.role_id);
    return role;
  };

  // Assigner un rôle à un utilisateur
  const handleAssignRole = async () => {
    if (!selectedUserId || !selectedRoleId) {
      toast.error('Veuillez sélectionner un utilisateur et un rôle');
      return;
    }

    try {
      await assignUserRole.mutateAsync({
        userId: selectedUserId,
        roleId: selectedRoleId
      });
      setSelectedUserId('');
      setSelectedRoleId('');
    } catch (error) {
      // L'erreur est déjà gérée par le hook
    }
  };

  // Statistiques rapides
  const activeUsers = utilisateurs.filter(u => u.statut === 'actif').length;
  const totalRoles = roles.length;
  const usersWithRoles = utilisateurs.filter(u => u.role_id).length;

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Utilisateurs actifs</p>
                <p className="text-2xl font-bold">{activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Rôles disponibles</p>
                <p className="text-2xl font-bold">{totalRoles}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Utilisateurs avec rôles</p>
                <p className="text-2xl font-bold">{usersWithRoles}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignation de rôles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Assignation de Rôles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">
                Utilisateur
              </label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un utilisateur" />
                </SelectTrigger>
                <SelectContent>
                  {utilisateurs.map((user) => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      {user.prenom} {user.nom} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">
                Rôle
              </label>
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
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
            
            <Button 
              onClick={handleAssignRole}
              disabled={!selectedUserId || !selectedRoleId || assignUserRole.isPending}
            >
              {assignUserRole.isPending ? 'Attribution...' : 'Assigner'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des utilisateurs et leurs rôles */}
      <Card>
        <CardHeader>
          <CardTitle>Contrôle d'Accès - Utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle actuel</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {utilisateurs.map((user) => {
                const currentRole = getUserRole(user.user_id);
                return (
                  <TableRow key={user.user_id}>
                    <TableCell className="font-medium">
                      {user.prenom} {user.nom}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {currentRole ? (
                        <Badge variant={currentRole.is_system ? 'default' : 'secondary'}>
                          {currentRole.name}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-yellow-600">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Aucun rôle
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.statut === 'actif' ? 'default' : 'secondary'}>
                        {user.statut}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUserId(user.user_id);
                          setSelectedRoleId(currentRole?.id || '');
                        }}
                      >
                        Modifier
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
