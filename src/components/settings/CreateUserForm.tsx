
import React, { useState } from 'react';
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

interface CreateUserFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface CreateUserFormData {
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  role_id: string;
  doit_changer_mot_de_passe: boolean;
}

const CreateUserForm = ({ onSuccess, onCancel }: CreateUserFormProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: roles = [] } = useRolesForUsers();
  const { assignRole } = useUserRoleAssignment();
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CreateUserFormData>({
    defaultValues: {
      doit_changer_mot_de_passe: true
    }
  });

  const selectedRoleId = watch('role_id');

  const createUser = useMutation({
    mutationFn: async (userData: CreateUserFormData) => {
      setIsCreating(true);
      
      // 1. Créer l'utilisateur dans Auth
      const tempPassword = `Temp${Math.random().toString(36).slice(-8)}!`;
      
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          prenom: userData.prenom,
          nom: userData.nom
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Utilisateur non créé');

      // 2. Créer l'entrée dans utilisateurs_internes
      const { data: userInterne, error: userInterneError } = await supabase
        .from('utilisateurs_internes')
        .insert({
          user_id: authData.user.id,
          prenom: userData.prenom,
          nom: userData.nom,
          email: userData.email,
          telephone: userData.telephone,
          adresse: userData.adresse,
          doit_changer_mot_de_passe: userData.doit_changer_mot_de_passe,
          statut: 'actif',
          type_compte: 'interne'
        })
        .select()
        .single();

      if (userInterneError) throw userInterneError;

      // 3. Assigner le rôle si spécifié
      if (userData.role_id) {
        await assignRole.mutateAsync({
          userId: authData.user.id,
          roleId: userData.role_id
        });
      }

      return { authData, userInterne };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
      toast({
        title: "Utilisateur créé",
        description: "L'utilisateur interne a été créé avec succès.",
      });
      onSuccess();
    },
    onError: (error: any) => {
      console.error('❌ Error creating user:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer l'utilisateur",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsCreating(false);
    }
  });

  const onSubmit = (data: CreateUserFormData) => {
    createUser.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="prenom">Prénom *</Label>
          <Input
            id="prenom"
            {...register("prenom", { required: "Le prénom est requis" })}
            disabled={isCreating}
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
            disabled={isCreating}
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
          disabled={isCreating}
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
            disabled={isCreating}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Rôle *</Label>
          <Select 
            value={selectedRoleId} 
            onValueChange={value => setValue('role_id', value)}
            disabled={isCreating}
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
          {!selectedRoleId && (
            <p className="text-sm text-destructive">Le rôle est requis</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="adresse">Adresse</Label>
        <Textarea
          id="adresse"
          {...register("adresse")}
          rows={3}
          disabled={isCreating}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="doit_changer_mot_de_passe"
          checked={watch('doit_changer_mot_de_passe')}
          onCheckedChange={value => setValue('doit_changer_mot_de_passe', value)}
          disabled={isCreating}
        />
        <Label htmlFor="doit_changer_mot_de_passe">
          Forcer le changement de mot de passe à la première connexion
        </Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isCreating}
        >
          Annuler
        </Button>
        <Button 
          type="submit" 
          disabled={isCreating || !selectedRoleId}
        >
          {isCreating ? 'Création...' : 'Créer l\'utilisateur'}
        </Button>
      </div>
    </form>
  );
};

export default CreateUserForm;
