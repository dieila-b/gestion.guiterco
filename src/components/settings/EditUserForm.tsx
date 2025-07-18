
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRolesForUsers } from '@/hooks/useUtilisateursInternes';
import { useUserRoleAssignment } from '@/hooks/useUserRoleAssignment';

interface EditUserFormProps {
  user: {
    id: string;
    user_id?: string;
    prenom: string;
    nom: string;
    email: string;
    telephone?: string;
    adresse?: string;
    photo_url?: string;
    role?: { id?: string; name?: string; nom?: string } | null;
    role_id?: string;
    doit_changer_mot_de_passe: boolean;
    statut: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

interface EditUserFormData {
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  role_id: string;
  doit_changer_mot_de_passe: boolean;
  statut: string;
}

const EditUserForm = ({ user, onSuccess, onCancel }: EditUserFormProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: roles = [] } = useRolesForUsers();
  const { assignRole } = useUserRoleAssignment();
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<EditUserFormData>();

  const selectedRoleId = watch('role_id');

  // Initialiser le formulaire avec les données utilisateur
  useEffect(() => {
    setValue('prenom', user.prenom);
    setValue('nom', user.nom);
    setValue('email', user.email);
    setValue('telephone', user.telephone || '');
    setValue('adresse', user.adresse || '');
    setValue('doit_changer_mot_de_passe', user.doit_changer_mot_de_passe);
    setValue('statut', user.statut);
    
    // Gérer le rôle - chercher l'ID du rôle correspondant
    if (user.role) {
      const currentRole = roles.find(r => 
        r.id === user.role?.id || 
        r.name === user.role?.name || 
        r.name === user.role?.nom
      );
      if (currentRole) {
        setValue('role_id', currentRole.id);
      }
    }
  }, [user, roles, setValue]);

  const updateUser = useMutation({
    mutationFn: async (userData: EditUserFormData) => {
      setIsUpdating(true);
      
      // 1. Mettre à jour les informations utilisateur
      const { error: updateError } = await supabase
        .from('utilisateurs_internes')
        .update({
          prenom: userData.prenom,
          nom: userData.nom,
          email: userData.email,
          telephone: userData.telephone,
          adresse: userData.adresse,
          doit_changer_mot_de_passe: userData.doit_changer_mot_de_passe,
          statut: userData.statut,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // 2. Mettre à jour le rôle si nécessaire
      const currentRoleId = roles.find(r => 
        r.id === user.role?.id || 
        r.name === user.role?.name || 
        r.name === user.role?.nom
      )?.id;

      if (userData.role_id !== currentRoleId && user.user_id) {
        await assignRole.mutateAsync({
          userId: user.user_id,
          roleId: userData.role_id
        });
      }

      return userData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
      toast({
        title: "Utilisateur modifié",
        description: "Les informations de l'utilisateur ont été mises à jour avec succès.",
      });
      onSuccess();
    },
    onError: (error: any) => {
      console.error('❌ Error updating user:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier l'utilisateur",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsUpdating(false);
    }
  });

  const onSubmit = (data: EditUserFormData) => {
    updateUser.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="prenom">Prénom *</Label>
          <Input
            id="prenom"
            {...register("prenom", { required: "Le prénom est requis" })}
            disabled={isUpdating}
          />
          {errors.prenom && (
            <p className="text-sm text-destructive">{errors.prenom.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="nom">Nom *</Label>
          <Input
            id="nom"
            {...register("nom", { required: "Le nom est requis" })}
            disabled={isUpdating}
          />
          {errors.nom && (
            <p className="text-sm text-destructive">{errors.nom.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          {...register("email", { 
            required: "L'email est requis",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Email invalide"
            }
          })}
          disabled={isUpdating}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="telephone">Téléphone</Label>
          <Input
            id="telephone"
            {...register("telephone")}
            disabled={isUpdating}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Rôle *</Label>
          <Select 
            value={selectedRoleId} 
            onValueChange={value => setValue('role_id', value)}
            disabled={isUpdating}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un rôle" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                  {role.description && (
                    <span className="text-muted-foreground ml-2">
                      - {role.description}
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="adresse">Adresse</Label>
        <Textarea
          id="adresse"
          {...register("adresse")}
          rows={3}
          disabled={isUpdating}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="doit_changer_mot_de_passe"
            checked={watch('doit_changer_mot_de_passe')}
            onCheckedChange={value => setValue('doit_changer_mot_de_passe', value)}
            disabled={isUpdating}
          />
          <Label htmlFor="doit_changer_mot_de_passe">
            Forcer le changement de mot de passe
          </Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="statut">Statut</Label>
          <Select 
            value={watch('statut')} 
            onValueChange={value => setValue('statut', value)}
            disabled={isUpdating}
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
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isUpdating}
        >
          Annuler
        </Button>
        <Button 
          type="submit" 
          disabled={isUpdating}
        >
          {isUpdating ? 'Modification...' : 'Modifier l\'utilisateur'}
        </Button>
      </div>
    </form>
  );
};

export default EditUserForm;
