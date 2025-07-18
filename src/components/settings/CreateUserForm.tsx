import React, { useState } from 'react';
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

interface CreateUserFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface CreateUserFormData {
  prenom: string;
  nom: string;
  email: string;
  password: string;
  confirmPassword: string;
  telephone?: string;
  adresse?: string;
  role_id: string;
  statut: string;
  doit_changer_mot_de_passe: boolean;
  photo_url?: string;
}

const CreateUserForm = ({ onSuccess, onCancel }: CreateUserFormProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: roles = [] } = useRolesForUsers();
  const { assignRole } = useUserRoleAssignment();
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CreateUserFormData>({
    defaultValues: {
      doit_changer_mot_de_passe: true,
      statut: 'actif'
    }
  });

  const selectedRoleId = watch('role_id');
  const selectedStatut = watch('statut');
  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

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

  const createUser = useMutation({
    mutationFn: async (userData: CreateUserFormData) => {
      setIsCreating(true);
      
      // Vérifier que les mots de passe correspondent
      if (userData.password !== userData.confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas');
      }
      
      console.log('🔄 Création de l\'utilisateur...', { email: userData.email });
      
      // 1. Créer l'utilisateur dans Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          prenom: userData.prenom,
          nom: userData.nom
        }
      });

      if (authError) {
        console.error('❌ Erreur création Auth:', authError);
        throw authError;
      }
      if (!authData.user) throw new Error('Utilisateur non créé');

      console.log('✅ Utilisateur Auth créé:', authData.user.id);

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
          photo_url: userData.photo_url,
          doit_changer_mot_de_passe: userData.doit_changer_mot_de_passe,
          statut: userData.statut,
          type_compte: 'interne'
        })
        .select()
        .single();

      if (userInterneError) {
        console.error('❌ Erreur création utilisateur interne:', userInterneError);
        throw userInterneError;
      }

      console.log('✅ Utilisateur interne créé:', userInterne.id);

      // 3. Assigner le rôle
      if (userData.role_id) {
        console.log('🔄 Attribution du rôle:', userData.role_id);
        await assignRole.mutateAsync({
          userId: authData.user.id,
          roleId: userData.role_id
        });
        console.log('✅ Rôle attribué');
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
      console.error('❌ Erreur lors de la création de l\'utilisateur:', error);
      
      let errorMessage = "Impossible de créer l'utilisateur";
      
      if (error.message?.includes('User already registered')) {
        errorMessage = "Un utilisateur avec cette adresse email existe déjà";
      } else if (error.message?.includes('Email already registered')) {
        errorMessage = "Cette adresse email est déjà utilisée";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsCreating(false);
    }
  });

  const onSubmit = (data: CreateUserFormData) => {
    if (!selectedRoleId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un rôle",
        variant: "destructive",
      });
      return;
    }
    
    if (data.password !== data.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }
    
    createUser.mutate(data);
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
          <Label htmlFor="password">Mot de passe *</Label>
          <Input
            id="password"
            type="password"
            {...register("password", { 
              required: "Le mot de passe est requis",
              minLength: {
                value: 6,
                message: "Le mot de passe doit contenir au moins 6 caractères"
              }
            })}
            disabled={isCreating}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
          <Input
            id="confirmPassword"
            type="password"
            {...register("confirmPassword", { 
              required: "La confirmation du mot de passe est requise",
              validate: value => value === password || "Les mots de passe ne correspondent pas"
            })}
            disabled={isCreating}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="statut">Statut *</Label>
          <Select 
            value={selectedStatut} 
            onValueChange={value => setValue('statut', value)}
            disabled={isCreating}
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
            disabled={isCreating}
          />
          <Label htmlFor="doit_changer_mot_de_passe">
            Forcer le changement de mot de passe à la première connexion
          </Label>
        </div>
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
          disabled={isCreating || !selectedRoleId || isUploadingPhoto}
        >
          {isCreating ? 'Création...' : 'Créer l\'utilisateur'}
        </Button>
      </div>
    </form>
  );
};

export default CreateUserForm;
