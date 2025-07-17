import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Users, Plus, Trash2, Shield, Crown, User, Briefcase, AlertCircle } from 'lucide-react';
import { useRoles, useCreateRole } from '@/hooks/usePermissions';
import { useForm } from "react-hook-form";

interface CreateRoleFormData {
  name: string;
  description: string;
}

const RolesManagement = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { data: roles = [], isLoading } = useRoles();
  const createRole = useCreateRole();
  // const deleteRole = useDeleteRole();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateRoleFormData>();

  const onCreateRole = async (data: CreateRoleFormData) => {
    try {
      await createRole.mutateAsync(data);
      setCreateDialogOpen(false);
      reset();
    } catch (error) {
      console.error('Error creating role:', error);
    }
  };

  const onDeleteRole = async (roleId: string) => {
    // TODO: Implement delete role functionality
    console.log('Delete role:', roleId);
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'administrateur':
        return <Crown className="h-5 w-5" />;
      case 'manager':
        return <Briefcase className="h-5 w-5" />;
      case 'vendeur':
        return <User className="h-5 w-5" />;
      case 'caissier':
        return <User className="h-5 w-5" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'administrateur':
        return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100';
      case 'manager':
        return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
      case 'vendeur':
        return 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100';
      case 'caissier':
        return 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';
    }
  };

  const getRoleDescription = (role: any) => {
    if (role.description) return role.description;
    
    switch (role.name.toLowerCase()) {
      case 'administrateur':
        return 'Accès complet à toutes les fonctionnalités du système';
      case 'manager':
        return 'Gestion et supervision des opérations commerciales';
      case 'vendeur':
        return 'Gestion des ventes et relations clients';
      case 'caissier':
        return 'Gestion de la caisse et opérations de vente';
      default:
        return 'Rôle personnalisé avec permissions spécifiques';
    }
  };

  const getUserCount = (roleId: string) => {
    // This would need to be implemented with actual user data
    return Math.floor(Math.random() * 10); // Placeholder
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement des rôles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Gestion des Rôles</h3>
          <p className="text-sm text-muted-foreground">
            Configurez les rôles utilisateurs et leurs permissions d'accès
          </p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Rôle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un nouveau rôle</DialogTitle>
              <DialogDescription>
                Définissez un nouveau rôle avec ses informations de base
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onCreateRole)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du rôle</Label>
                <Input
                  id="name"
                  {...register("name", { required: "Le nom du rôle est requis" })}
                  placeholder="Ex: Superviseur"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Description détaillée du rôle et de ses responsabilités"
                  rows={3}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={createRole.isPending}
                >
                  {createRole.isPending ? 'Création...' : 'Créer le rôle'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <Card key={role.id} className={`hover:shadow-md transition-all duration-200 ${getRoleColor(role.name)}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getRoleIcon(role.name)}
                  <CardTitle className="text-lg capitalize">{role.name}</CardTitle>
                </div>
                <div className="flex items-center space-x-1">
                  {role.is_system && (
                    <Badge variant="secondary" className="text-xs">
                      Système
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {getUserCount(role.id)} utilisateurs
                  </Badge>
                </div>
              </div>
              <CardDescription className="text-sm mt-2">
                {getRoleDescription(role)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between space-x-2">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Users className="h-4 w-4 mr-1" />
                    Utilisateurs
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Permissions
                  </Button>
                </div>
                
                {!role.is_system && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center space-x-2">
                          <AlertCircle className="h-5 w-5 text-destructive" />
                          <span>Supprimer le rôle "{role.name}"</span>
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action est irréversible. Le rôle sera supprimé et tous les utilisateurs 
                          assignés à ce rôle perdront leurs permissions associées.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDeleteRole(role.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
              
              {role.is_system && (
                <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-md">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <p className="text-xs text-amber-700">
                      Rôle système protégé
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {roles.length === 0 && (
        <div className="text-center py-12">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucun rôle trouvé</h3>
          <p className="text-muted-foreground mb-4">
            Commencez par créer votre premier rôle pour organiser les permissions
          </p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Créer un rôle
          </Button>
        </div>
      )}
    </div>
  );
};

export default RolesManagement;