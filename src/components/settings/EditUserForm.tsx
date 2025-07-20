import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Save, X, Crown, Briefcase, Upload, Key } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRolesForUsers } from '@/hooks/useUtilisateursInternes';
import { useUserRoleAssignment } from '@/hooks/useUserRoleAssignment';
import { usePasswordUpdate } from '@/hooks/usePasswordUpdate';

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
    matricule: user.matricule || '',
    statut: user.statut,
    doit_changer_mot_de_passe: user.doit_changer_mot_de_passe,
    photo_url: user.photo_url || '',
  });
  const [selectedRoleId, setSelectedRoleId] = useState(user.role?.id || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePassword, setChangePassword] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: roles = [] } = useRolesForUsers();
  const { assignRole } = useUserRoleAssignment();
  const { updatePassword, isLoading: isUpdatingPassword } = usePasswordUpdate();

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
          matricule: data.matricule || null,
          statut: data.statut,
          doit_changer_mot_de_passe: data.doit_changer_mot_de_passe,
          photo_url: data.photo_url || null,
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
    
    // Validation du mot de passe si changement demandé
    if (changePassword) {
      if (newPassword.length < 6) {
        toast({
          title: "Erreur",
          description: "Le mot de passe doit contenir au moins 6 caractères",
          variant: "destructive",
        });
        return;
      }
      
      if (newPassword !== confirmPassword) {
        toast({
          title: "Erreur",
          description: "Les mots de passe ne correspondent pas",
          variant: "destructive",
        });
        return;
      }
    }
    
    try {
      // 1. Mettre à jour les informations utilisateur
      await updateUser.mutateAsync(formData);
      
      // 2. Changer le mot de passe si demandé
      if (changePassword && newPassword) {
        console.log('🔐 Changing password for user:', user.user_id);
        await updatePassword({
          userId: user.user_id,
          newPassword: newPassword,
          requireChange: formData.doit_changer_mot_de_passe
        });
      }
      
      // 3. Mettre à jour le rôle si changé
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

  const getInitials = (prenom: string, nom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  };

  const isLoading = updateUser.isPending || assignRole.isPending || isUpdatingPassword;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Photo de profil et informations de base</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Photo de profil */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={formData.photo_url} alt={`${formData.prenom} ${formData.nom}`} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {getInitials(formData.prenom, formData.nom)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Label htmlFor="photo_url">URL de la photo</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="photo_url"
                  value={formData.photo_url}
                  onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                  placeholder="https://exemple.com/photo.jpg"
                  className="w-64"
                />
                <Button type="button" variant="outline" size="sm">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="matricule">Matricule</Label>
              <Input
                id="matricule"
                value={formData.matricule}
                onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                placeholder="Auto-généré si vide"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input
                id="telephone"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                placeholder="+33 1 23 45 67 89"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="statut">Statut</Label>
              <Select value={formData.statut} onValueChange={(value) => setFormData({ ...formData, statut: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="actif">
                    <Badge variant="default" className="bg-green-100 text-green-800">Actif</Badge>
                  </SelectItem>
                  <SelectItem value="inactif">
                    <Badge variant="secondary">Inactif</Badge>
                  </SelectItem>
                  <SelectItem value="suspendu">
                    <Badge variant="destructive">Suspendu</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="adresse">Adresse complète</Label>
              <Textarea
                id="adresse"
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                rows={3}
                placeholder="Adresse, ville, code postal, pays..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>Sécurité et mot de passe</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="change-password"
              checked={changePassword}
              onCheckedChange={setChangePassword}
            />
            <Label htmlFor="change-password">Modifier le mot de passe</Label>
          </div>

          {changePassword && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 caractères"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmer le mot de passe"
                />
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="force-password-change"
              checked={formData.doit_changer_mot_de_passe}
              onCheckedChange={(checked) => setFormData({ ...formData, doit_changer_mot_de_passe: checked })}
            />
            <Label htmlFor="force-password-change">Forcer le changement de mot de passe à la prochaine connexion</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rôle et permissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Rôle attribué</Label>
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
          </div>

          {user.role && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Rôle actuel :</p>
              <Badge variant="outline" className={`${getRoleColor(user.role.name)} capitalize`}>
                <div className="flex items-center space-x-1">
                  {getRoleIcon(user.role.name)}
                  <span>{user.role.name}</span>
                </div>
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          <X className="h-4 w-4 mr-2" />
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </Button>
      </div>
    </form>
  );
};

export default EditUserForm;
