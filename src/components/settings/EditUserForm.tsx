
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Save, X, Crown, Briefcase, AlertCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRolesForUsers } from '@/hooks/useUtilisateursInternes';
import { useUserRoleAssignment } from '@/hooks/useUserRoleAssignment';

interface EditUserFormProps {
  user: {
    id: string;
    user_id: string;
    prenom: string;
    nom: string;
    email: string;
    telephone?: string;
    adresse?: string;
    photo_url?: string;
    role: { id: string; name: string } | null;
    matricule?: string;
    statut: string;
    doit_changer_mot_de_passe: boolean;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const EditUserForm = ({ user, onSuccess, onCancel }: EditUserFormProps) => {
  const [formData, setFormData] = useState({
    prenom: user.prenom,
    nom: user.nom,
    email: user.email,
    telephone: user.telephone || '',
    adresse: user.adresse || '',
    statut: user.statut,
    doit_changer_mot_de_passe: user.doit_changer_mot_de_passe,
  });
  const [selectedRoleId, setSelectedRoleId] = useState(user.role?.id || '');

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: roles = [] } = useRolesForUsers();
  const { assignRole } = useUserRoleAssignment();

  const updateUser = useMutation({
    mutationFn: async (data: typeof formData) => {
      console.log('🔨 Updating user:', user.id, data);
      
      const { error } = await supabase
        .from('utilisateurs_internes')
        .update({
          prenom: data.prenom,
          nom: data.nom,
          email: data.email,
          telephone: data.telephone || null,
          adresse: data.adresse || null,
          statut: data.statut,
          doit_changer_mot_de_passe: data.doit_changer_mot_de_passe,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('❌ Error updating user:', error);
        throw error;
      }

      console.log('✅ User updated successfully');
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
      toast({
        title: "Utilisateur modifié",
        description: "Les informations ont été mises à jour avec succès",
      });
    },
    onError: (error: any) => {
      console.error('❌ Error in updateUser:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier l'utilisateur",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // 1. Mettre à jour les informations utilisateur
      await updateUser.mutateAsync(formData);
      
      // 2. Mettre à jour le rôle si changé
      if (selectedRoleId && selectedRoleId !== user.role?.id) {
        console.log('🔄 Updating user role...');
        await assignRole.mutateAsync({
          userId: user.user_id,
          roleId: selectedRoleId
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error('❌ Error in handleSubmit:', error);
    }
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'administrateur':
        return <Crown className="h-4 w-4" />;
      case 'manager':
        return <Briefcase className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
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

  const isLoading = updateUser.isPending || assignRole.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Informations personnelles</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="prenom">Prénom *</Label>
            <Input
              id="prenom"
              value={formData.prenom}
              onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nom">Nom *</Label>
            <Input
              id="nom"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telephone">Téléphone</Label>
            <Input
              id="telephone"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="adresse">Adresse</Label>
            <Textarea
              id="adresse"
              value={formData.adresse}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rôle et Statut</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="role">Rôle</Label>
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un rôle" />
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
            {user.role && (
              <div className="mt-2">
                <Badge variant="outline" className={getRoleColor(user.role.name)}>
                  Rôle actuel: {user.role.name}
                </Badge>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="statut">Statut</Label>
            <Select 
              value={formData.statut} 
              onValueChange={(value) => setFormData({ ...formData, statut: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="actif">Actif</SelectItem>
                <SelectItem value="inactif">Inactif</SelectItem>
                <SelectItem value="suspendu">Suspendu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          <X className="h-4 w-4 mr-2" />
          Annuler
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Enregistrer
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default EditUserForm;
