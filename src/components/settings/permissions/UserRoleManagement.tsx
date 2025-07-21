
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { useUtilisateursInternes } from '@/hooks/useUtilisateursInternes';
import { useRoles } from '@/hooks/useRolesManagement';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

const UserRoleManagement = () => {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);
  
  const { data: users, isLoading: usersLoading } = useUtilisateursInternes();
  const { data: roles, isLoading: rolesLoading } = useRoles();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) {
      toast({
        title: "Sélection incomplète",
        description: "Veuillez sélectionner un utilisateur et un rôle",
        variant: "destructive"
      });
      return;
    }

    setIsAssigning(true);
    
    try {
      console.log('🔄 Assigning role:', { user: selectedUser, role: selectedRole });
      
      const { data, error } = await supabase.rpc('assign_user_role_admin', {
        p_user_id: selectedUser,
        p_role_id: selectedRole === 'no-role' ? null : selectedRole
      });

      if (error) throw error;

      // Invalider les caches pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] });

      toast({
        title: "Rôle assigné",
        description: "Le rôle a été assigné avec succès à l'utilisateur",
      });

      // Reset selections
      setSelectedUser('');
      setSelectedRole('');
      
    } catch (error: any) {
      console.error('❌ Error assigning role:', error);
      toast({
        title: "Erreur d'assignation",
        description: error.message || "Impossible d'assigner le rôle",
        variant: "destructive"
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'actif':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" />Actif</Badge>;
      case 'inactif':
        return <Badge className="bg-gray-100 text-gray-800"><AlertCircle className="h-3 w-3 mr-1" />Inactif</Badge>;
      case 'suspendu':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="h-3 w-3 mr-1" />Suspendu</Badge>;
      default:
        return <Badge variant="outline">{statut}</Badge>;
    }
  };

  if (usersLoading || rolesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section d'assignation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Assignation de Rôles</span>
          </CardTitle>
          <CardDescription>
            Assignez ou modifiez les rôles des utilisateurs internes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Utilisateur</label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un utilisateur" />
                </SelectTrigger>
                <SelectContent>
                  {users?.map((user) => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>{user.prenom} {user.nom}</span>
                        {user.matricule && (
                          <Badge variant="outline" className="text-xs">
                            {user.matricule}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Rôle</label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-role">
                    <span className="text-muted-foreground">Aucun rôle</span>
                  </SelectItem>
                  {roles?.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4" />
                        <span>{role.name}</span>
                        {role.is_system && (
                          <Badge variant="secondary" className="text-xs">
                            Système
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleAssignRole}
              disabled={!selectedUser || !selectedRole || isAssigning}
              className="w-full"
            >
              {isAssigning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Attribution...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Assigner le Rôle
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des utilisateurs avec leurs rôles actuels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Utilisateurs et Rôles Actuels</span>
          </CardTitle>
          <CardDescription>
            Vue d'ensemble des utilisateurs internes et de leurs rôles assignés
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users && users.length > 0 ? (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.user_id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{user.prenom} {user.nom}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                      {user.matricule && (
                        <div className="text-xs text-muted-foreground">Matricule: {user.matricule}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(user.statut)}
                    {user.role_name ? (
                      <Badge className="bg-blue-100 text-blue-800">
                        <Shield className="h-3 w-3 mr-1" />
                        {user.role_name}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Aucun rôle
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun utilisateur interne trouvé</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserRoleManagement;
