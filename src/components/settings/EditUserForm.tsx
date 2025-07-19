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
import { useRolesForUsers } from '@/hooks/useUtilisateursInternes';
import { useUserRoleAssignment } from '@/hooks/useUserRoleAssignment';
import { useUpdateInternalUser } from '@/hooks/useUpdateInternalUser';
import { usePasswordUpdate } from '@/hooks/usePasswordUpdate';
import PasswordResetInstructions from './PasswordResetInstructions';

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
  const [photoPreview, setPhotoPreview] = useState<string | null>(user.photo_url || null);
  const [updatePassword, setUpdatePassword] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showPasswordInstructions, setShowPasswordInstructions] = useState(false);
  const { toast } = useToast();
  const { data: roles = [] } = useRolesForUsers();
  const { assignRole } = useUserRoleAssignment();
  const updateUser = useUpdateInternalUser();
  const { updatePassword: updatePasswordFn, isLoading: isUpdatingPassword } = usePasswordUpdate();
  
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

    // Vérifications du fichier
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier image valide (PNG, JPG, GIF).",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB max
      toast({
        title: "Erreur",
        description: "Le fichier est trop volumineux. Taille maximum: 5MB.",
        variant: "destructive"
      });
      return;
    }

    setIsUploadingPhoto(true);

    try {
      console.log('🔄 Début de l\'upload de la photo...');
      
      // Créer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      console.log('📁 Upload vers le bucket avatars:', fileName);

      // Upload vers Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Erreur upload:', error);
        throw new Error(`Erreur d'upload: ${error.message}`);
      }

      console.log('✅ Upload réussi:', data);

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);

      console.log('🔗 URL publique générée:', publicUrl);

      setPhotoPreview(publicUrl);
      setValue('photo_url', publicUrl);
      
      toast({
        title: "Succès",
        description: "Photo téléchargée avec succès.",
      });
    } catch (error: any) {
      console.error('💥 Erreur complète lors de l\'upload:', error);
      toast({
        title: "Erreur d'upload",
        description: error.message || "Impossible de télécharger la photo. Vérifiez votre connexion.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const onSubmit = async (data: EditUserFormData) => {
    try {
      // Vérifier que les mots de passe correspondent si on les change
      if (updatePassword && data.password !== data.confirmPassword) {
        toast({
          title: "Erreur",
          description: "Les mots de passe ne correspondent pas",
          variant: "destructive",
        });
        return;
      }

      console.log('🔄 Submitting user update:', data);

      // 1. Mettre à jour les informations utilisateur principales
      await updateUser.mutateAsync({
        id: user.id,
        prenom: data.prenom,
        nom: data.nom,
        email: data.email,
        telephone: data.telephone,
        adresse: data.adresse,
        photo_url: data.photo_url,
        matricule: data.matricule,
        statut: data.statut,
        doit_changer_mot_de_passe: data.doit_changer_mot_de_passe
      });

      // 2. Mettre à jour le mot de passe si demandé
      let passwordUpdateResult: { success: boolean; requiresManualReset: boolean } = { success: true, requiresManualReset: false };
      if (updatePassword && data.password && user.user_id) {
        console.log('🔄 Updating password for user:', user.user_id);
        passwordUpdateResult = await updatePasswordFn({
          userId: user.user_id,
          newPassword: data.password
        });
        
        // Afficher les instructions si nécessaire
        if (passwordUpdateResult.requiresManualReset) {
          setShowPasswordInstructions(true);
        }
      }

      // 3. Mettre à jour le rôle si nécessaire
      const currentRoleId = roles.find(r => 
        r.id === user.role?.id || 
        r.name === user.role?.name || 
        r.name === user.role?.nom
      )?.id;

      if (data.role_id !== currentRoleId && user.user_id) {
        console.log('🔄 Updating role from', currentRoleId, 'to', data.role_id);
        await assignRole.mutateAsync({
          userId: user.user_id,
          roleId: data.role_id
        });
      }

      console.log('✅ User update completed successfully');
      
      // Afficher un message spécifique si le mot de passe nécessite une action manuelle
      if (passwordUpdateResult.requiresManualReset) {
        toast({
          title: "Utilisateur mis à jour",
          description: "L'utilisateur devra changer son mot de passe à la prochaine connexion.",
          variant: "default",
        });
      }
      
      onSuccess();
      
    } catch (error: any) {
      console.error('❌ Error in form submission:', error);
      // L'erreur est déjà gérée par les hooks individuels
    }
  };

  const isFormLoading = updateUser.isPending || isUpdatingPassword || isUploadingPhoto;

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
            className={`absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors ${
              isUploadingPhoto ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Upload className="h-4 w-4" />
          </label>
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            disabled={isUploadingPhoto}
            className="hidden"
          />
        </div>
        <Label className="text-sm text-muted-foreground">
          {isUploadingPhoto ? 'Upload en cours...' : 'Photo de profil'}
        </Label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="prenom">Prénom *</Label>
          <Input
            id="prenom"
            {...register("prenom", { required: "Le prénom est requis" })}
            disabled={updateUser.isPending}
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
            disabled={updateUser.isPending}
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
            disabled={updateUser.isPending}
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
            disabled={updateUser.isPending}
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
            disabled={updateUser.isPending}
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
                disabled={updateUser.isPending}
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
                disabled={updateUser.isPending}
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
            disabled={updateUser.isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Rôle *</Label>
          <Select 
            value={selectedRoleId} 
            onValueChange={value => setValue('role_id', value)}
            disabled={updateUser.isPending}
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
          disabled={updateUser.isPending}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="statut">Statut</Label>
          <Select 
            value={selectedStatut} 
            onValueChange={value => setValue('statut', value)}
            disabled={updateUser.isPending}
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
            disabled={updateUser.isPending}
          />
          <Label htmlFor="doit_changer_mot_de_passe">
            Forcer le changement de mot de passe
          </Label>
        </div>
      </div>

      <PasswordResetInstructions show={showPasswordInstructions} />

      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isFormLoading}
        >
          Annuler
        </Button>
        <Button 
          type="submit" 
          disabled={isFormLoading}
        >
          {isFormLoading ? 'Modification...' : 'Modifier l\'utilisateur'}
        </Button>
      </div>
    </form>
  );
};

export default EditUserForm;
