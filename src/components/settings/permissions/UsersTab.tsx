
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, Calendar, Shield } from 'lucide-react';
import { useUtilisateursInternes, useUpdateUtilisateurInterne } from '@/hooks/useUtilisateursInternes';
import { useRoles } from '@/hooks/usePermissionsSystem';
import { toast } from 'sonner';

export default function UsersTab() {
  const { data: users = [], isLoading: usersLoading } = useUtilisateursInternes();
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const updateUser = useUpdateUtilisateurInterne();

  const handleRoleChange = async (userId: string, roleId: string) => {
    try {
      await updateUser.mutateAsync({
        id: userId,
        role_id: roleId
      });
      toast.success('Rôle utilisateur mis à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du rôle');
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'actif': return 'bg-green-100 text-green-800';
      case 'inactif': return 'bg-gray-100 text-gray-800';
      case 'suspendu': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (prenom: string, nom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  };

  if (usersLoading || rolesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Attribution des Rôles</h3>
        <div className="text-sm text-muted-foreground">
          {users.length} utilisateur{users.length > 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user.photo_url} />
                  <AvatarFallback>
                    {getInitials(user.prenom, user.nom)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base flex items-center gap-2">
                    {user.prenom} {user.nom}
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(user.statut)}
                    >
                      {user.statut}
                    </Badge>
                  </CardTitle>
                  
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <Mail className="w-3 h-3" />
                    {user.email}
                  </div>
                  
                  {user.matricule && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <User className="w-3 h-3" />
                      {user.matricule}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Rôle assigné
                </label>
                <Select
                  value={user.role_id || ''}
                  onValueChange={(roleId) => handleRoleChange(user.id, roleId)}
                  disabled={updateUser.isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        <div className="flex items-center gap-2">
                          <Shield className="w-3 h-3" />
                          {role.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {user.role_name && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Rôle actuel: </span>
                  <Badge variant="secondary">{user.role_name}</Badge>
                </div>
              )}
              
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                Créé le {new Date(user.created_at).toLocaleDateString('fr-FR')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
