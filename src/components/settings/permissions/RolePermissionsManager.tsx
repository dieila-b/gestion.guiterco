import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Settings, Edit, Users, CheckCircle, XCircle } from 'lucide-react';

interface Permission {
  id: string;
  module: string;
  action: string;
  description: string;
}

interface Role {
  id: string;
  nom: string;
  description: string;
}

interface RolePermission {
  role_id: string;
  permission_id: string;
  created_at?: string;
}

const RolePermissionsManager = () => {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupérer tous les rôles
  const { data: roles } = useQuery({
    queryKey: ['roles-utilisateurs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles_utilisateurs')
        .select('*')
        .order('nom');
      if (error) throw error;
      return data as Role[];
    }
  });

  // Récupérer toutes les permissions
  const { data: permissions } = useQuery({
    queryKey: ['permissions-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('module', { ascending: true })
        .order('action', { ascending: true });
      if (error) throw error;
      return data as Permission[];
    }
  });

  // Récupérer les permissions par rôle
  const { data: rolePermissions } = useQuery({
    queryKey: ['role-permissions-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles_permissions')
        .select('*');
      if (error) throw error;
      return data as RolePermission[];
    }
  });

  // Mutation pour mettre à jour les permissions
  const updateRolePermissions = useMutation({
    mutationFn: async ({ 
      roleId, 
      permissionId, 
      enabled 
    }: { 
      roleId: string; 
      permissionId: string; 
      enabled: boolean;
    }) => {
      if (enabled) {
        const { error } = await supabase
          .from('roles_permissions')
          .insert({ 
            role_id: roleId, 
            permission_id: permissionId,
            created_at: new Date().toISOString()
          });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('roles_permissions')
          .delete()
          .eq('role_id', roleId)
          .eq('permission_id', permissionId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions-all'] });
      toast({
        title: "Permission mise à jour",
        description: "La permission a été mise à jour avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour la permission",
        variant: "destructive",
      });
    }
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'lecture':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'écriture':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'suppression':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'admin':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'administrateur':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'manager':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'employe':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };

  // Vérifier si une permission est active pour un rôle
  const hasPermission = (roleId: string, permissionId: string) => {
    return rolePermissions?.some(
      rp => rp.role_id === roleId && rp.permission_id === permissionId
    ) || false;
  };

  // Grouper les permissions par module
  const permissionsByModule = permissions?.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  // Obtenir les permissions actives pour un rôle
  const getActivePermissions = (roleId: string) => {
    const activePermissionIds = rolePermissions
      ?.filter(rp => rp.role_id === roleId)
      .map(rp => rp.permission_id) || [];
    
    return permissions?.filter(p => activePermissionIds.includes(p.id)) || [];
  };

  const handlePermissionToggle = (permissionId: string, enabled: boolean) => {
    if (selectedRole) {
      updateRolePermissions.mutate({
        roleId: selectedRole.id,
        permissionId,
        enabled
      });
    }
  };

  const openPermissionsModal = (role: Role) => {
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Gestion des Permissions par Rôle</h3>
          <p className="text-sm text-muted-foreground">
            Configurez les permissions d'accès pour chaque rôle utilisateur
          </p>
        </div>
      </div>

      {/* Liste des rôles avec leurs permissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {roles?.map((role) => {
          const activePermissions = getActivePermissions(role.id);
          const permissionCount = activePermissions.length;
          const totalPermissions = permissions?.length || 0;

          return (
            <Card key={role.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span className="capitalize">{role.nom}</span>
                    </CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {role.description || `Rôle ${role.nom}`}
                    </CardDescription>
                  </div>
                  <Badge className={getRoleColor(role.nom)}>
                    {role.nom}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Statistiques des permissions */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    {permissionCount > 0 ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm font-medium">
                      {permissionCount} / {totalPermissions} permissions
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {totalPermissions > 0 ? Math.round((permissionCount / totalPermissions) * 100) : 0}%
                  </span>
                </div>

                {/* Aperçu des permissions par module */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Permissions actives:</h5>
                  {Object.entries(permissionsByModule || {}).map(([module, modulePermissions]) => {
                    const activeInModule = modulePermissions.filter(p => 
                      hasPermission(role.id, p.id)
                    );
                    
                    if (activeInModule.length === 0) return null;
                    
                    return (
                      <div key={module} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{module}</span>
                        <div className="flex space-x-1">
                          {activeInModule.map(permission => (
                            <Badge 
                              key={permission.id}
                              variant="outline" 
                              className={`text-xs ${getActionColor(permission.action)}`}
                            >
                              {permission.action}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  
                  {activePermissions.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Aucune permission assignée
                    </p>
                  )}
                </div>

                <Separator />

                {/* Bouton modifier les permissions */}
                <Dialog open={isModalOpen && selectedRole?.id === role.id} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => openPermissionsModal(role)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier les permissions
                    </Button>
                  </DialogTrigger>
                  
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        <Settings className="h-5 w-5" />
                        <span>Permissions pour le rôle "{role.nom}"</span>
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                      {/* Résumé */}
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                          <h4 className="font-medium">Configuration des permissions</h4>
                          <p className="text-sm text-muted-foreground">
                            Activez ou désactivez les permissions pour ce rôle
                          </p>
                        </div>
                        <Badge className={getRoleColor(role.nom)}>
                          {getActivePermissions(role.id).length} permissions actives
                        </Badge>
                      </div>

                      {/* Permissions par module */}
                      <div className="space-y-4">
                        {Object.entries(permissionsByModule || {}).map(([module, modulePermissions]) => (
                          <Card key={module} className="border">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base capitalize">
                                Module {module}
                              </CardTitle>
                              <CardDescription>
                                Configurez les permissions d'accès au module {module}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {modulePermissions.map((permission) => (
                                  <div 
                                    key={permission.id} 
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                  >
                                    <div className="flex items-center space-x-3">
                                      <Badge 
                                        variant="outline"
                                        className={getActionColor(permission.action)}
                                      >
                                        {permission.action}
                                      </Badge>
                                      <div>
                                        <div className="text-sm font-medium">
                                          {permission.action}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {permission.description}
                                        </div>
                                      </div>
                                    </div>
                                    <Switch
                                      checked={hasPermission(role.id, permission.id)}
                                      onCheckedChange={(checked) => 
                                        handlePermissionToggle(permission.id, checked)
                                      }
                                      disabled={updateRolePermissions.isPending}
                                    />
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Statistiques globales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Vue d'ensemble du système de permissions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {roles?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Rôles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {permissions?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Permissions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {Object.keys(permissionsByModule || {}).length}
              </div>
              <div className="text-sm text-muted-foreground">Modules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {rolePermissions?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Associations actives</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RolePermissionsManager;