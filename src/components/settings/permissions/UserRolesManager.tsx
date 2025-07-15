
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRoles, useAssignUserRole, useUserRole } from '@/hooks/usePermissions';
import { useUtilisateursInternes } from '@/hooks/useUtilisateursInternes';
import { User, UserPlus } from 'lucide-react';

const UserRolesManager = () => {
  const { data: roles, isLoading: rolesLoading } = useRoles();
  const { data: utilisateurs, isLoading: utilisateursLoading } = useUtilisateursInternes();
  const assignRole = useAssignUserRole();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');

  // Récupérer le rôle actuel de l'utilisateur sélectionné
  const { data: currentUserRole, isLoading: userRoleLoading } = useUserRole(selectedUserId);

  // Mettre à jour le rôle sélectionné quand l'utilisateur change
  useEffect(() => {
    if (currentUserRole?.role) {
      setSelectedRoleId(currentUserRole.role.id);
    } else {
      setSelectedRoleId('');
    }
  }, [currentUserRole]);

  const handleUserChange = (userId: string) => {
    setSelectedUserId(userId);
    // Le rôle sera automatiquement mis à jour via useEffect
  };

  const handleAssignRole = () => {
    if (!selectedUserId || !selectedRoleId) return;
    
    assignRole.mutate({
      userId: selectedUserId,
      roleId: selectedRoleId
    });
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'Administrateur':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Vendeur':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Caissier':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  // Filtrer les utilisateurs actifs uniquement
  const utilisateursActifs = utilisateurs?.filter(user => user.statut === 'actif') || [];

  if (rolesLoading || utilisateursLoading) {
    return <div>Chargement des données...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Gestion des Rôles Utilisateurs</h3>
        <p className="text-sm text-muted-foreground">
          Assignez des rôles aux utilisateurs de l'application
        </p>
      </div>

      {/* Section d'assignation de rôle */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <UserPlus className="h-4 w-4" />
            <span>Assigner un rôle à un utilisateur</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Utilisateur</label>
              <Select value={selectedUserId} onValueChange={handleUserChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un utilisateur" />
                </SelectTrigger>
                <SelectContent>
                  {utilisateursActifs.map((user) => (
                    <SelectItem key={user.id} value={user.user_id}>
                      {user.prenom} {user.nom} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Rôle {currentUserRole?.role && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (Actuel: {currentUserRole.role.name})
                  </span>
                )}
              </label>
              <Select 
                value={selectedRoleId} 
                onValueChange={setSelectedRoleId}
                disabled={userRoleLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {roles?.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleAssignRole}
              disabled={!selectedUserId || !selectedRoleId || assignRole.isPending || userRoleLoading}
            >
              {assignRole.isPending ? 'Assignation...' : 
               currentUserRole?.role ? 'Modifier le rôle' : 'Assigner le rôle'}
            </Button>
          </div>

          {/* Affichage du rôle actuel */}
          {selectedUserId && currentUserRole?.role && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Rôle actuel :</p>
              <Badge className={getRoleColor(currentUserRole.role.name)} variant="outline">
                {currentUserRole.role.name}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                Assigné le {new Date(currentUserRole.assigned_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Liste des rôles disponibles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Rôles disponibles</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles?.map((role) => (
              <div 
                key={role.id} 
                className="p-4 border rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge className={getRoleColor(role.name)} variant="outline">
                    {role.name}
                  </Badge>
                  {role.is_system_role && (
                    <Badge variant="secondary" className="text-xs">
                      Système
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {role.description}
                </p>
                {role.name === 'Administrateur' && (
                  <p className="text-xs text-amber-600 mt-2">
                    ⚠️ Ce rôle dispose de tous les droits par défaut
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserRolesManager;
