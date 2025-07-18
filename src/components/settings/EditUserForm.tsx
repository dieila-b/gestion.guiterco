
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, User } from 'lucide-react';
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
    matricule?: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

interface EditUserFormData {
  prenom: string;
  nom: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  telephone?: string;
  adresse?: string;
  role_id: string;
  doit_changer_mot_de_passe: boolean;
  statut: string;
  matricule?: string;
  photo_url?: string;
}

const EditUserForm = ({ user, onSuccess, onCancel }: EditUserFormProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(user.photo_url || null);
  const [updatePassword, setUpdatePassword] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: roles = [] } = useRolesForUsers();
  const { assignRole } = useUserRoleAssignment();
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<EditUserFormData>();

  const selectedRoleId = watch('role_id');
  const selectedStatut = watch('statut');
  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

  // Initialiser le formulaire avec les données utilisateur
  useEffect(() => {
    setValue('prenom', user.prenom);
    setValue('nom', user.nom);
    setValue('email', user.email);
    setValue('telephone', user.telephone || '');
    setValue('adresse', user.adresse || '');
    setValue('doit_changer_mot_de_passe', user.doit_changer_mot_de_passe);
    setValue('statut', user.statut);
    setValue('matricule', user.matricule || '');
    setValue('photo_url', user.photo_url || '');
    
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

  // Handle photo upload
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setPhotoPreview(publicUrl);
      setValue('photo_url', publicUrl);
      
      toast({
        title: "Succès",
        description: "Photo téléchargée avec succès.",
      });
    } catch (error) {
      console.error('Erreur lors du téléchargement de la photo:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger la photo",
        variant: "destructive",
      });
    }
  };

  const updateUser = useMutation({
    mutationFn: async (userData: EditUserFormData) => {
      setIsUpdating(true);
      
      // Vérifier que les mots de passe correspondent si on les change
      if (updatePassword && userData.password !== userData.confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas');
      }
      
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
          matricule: userData.matricule,
          photo_url: userData.photo_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // 2. Mettre à jour le mot de passe si demandé
      if (updatePassword && userData.password && user.user_id) {
        const { error: passwordError } = await supabase.auth.admin.updateUserById(
          user.user_id,
          { password: userData.password }
        );
        if (passwordError) throw passwordError;
      }

      // 3. Mettre à jour le rôle si nécessaire
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
      console.error('❌ Erreur lors de la modification de l\'utilisateur:', error);
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
    if (updatePassword && data.password !== data.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }
    
    updateUser.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Photo de profil */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Avatar className="h-24 w-24">
            <AvatarImage src={photoPreview || undefined} />
            <AvatarFallback className="bg-muted">
              <User className="h-12 w-12 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <label
            htmlFor="photo-upload"
            className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
          >
            <Upload className="h-4 w-4" />
          </label>
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>
        <Label className="text-sm text-muted-foreground">Photo de profil</Label>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div className="space-y-2">
          <Label htmlFor="matricule">Matricule</Label>
          <Input
            id="matricule"
            {...register("matricule")}
            disabled={isUpdating}
            placeholder="Généré automatiquement"
          />
        </div>
      </div>

      {/* Section mot de passe */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="updatePassword"
            checked={updatePassword}
            onCheckedChange={setUpdatePassword}
            disabled={isUpdating}
          />
          <Label htmlFor="updatePassword">Modifier le mot de passe</Label>
        </div>

        {updatePassword && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nouveau mot de passe</Label>
              <Input
                id="password"
                type="password"
                {...register("password", { 
                  required: updatePassword ? "Le mot de passe est requis" : false,
                  minLength: {
                    value: 6,
                    message: "Le mot de passe doit contenir au moins 6 caractères"
                  }
                })}
                disabled={isUpdating}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword", { 
                  required: updatePassword ? "La confirmation du mot de passe est requise" : false,
                  validate: value => !updatePassword || value === password || "Les mots de passe ne correspondent pas"
                })}
                disabled={isUpdating}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>
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
        <div className="space-y-2">
          <Label htmlFor="statut">Statut</Label>
          <Select 
            value={selectedStatut} 
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
