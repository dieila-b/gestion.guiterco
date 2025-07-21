
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
import { useRolesForUsers } from '@/hooks/useUtilisateursInternes';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface EditUserFormProps {
  user: any;
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
  statut: string;
  doit_changer_mot_de_passe: boolean;
  photo_url?: string;
}

const EditUserForm = ({ user, onSuccess, onCancel }: EditUserFormProps) => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(user.photo_url);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const { toast } = useToast();
  const { data: roles = [] } = useRolesForUsers();
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<EditUserFormData>({
    defaultValues: {
      prenom: user.prenom,
      nom: user.nom,
      email: user.email,
      telephone: user.telephone || '',
      adresse: user.adresse || '',
      role_id: user.role?.id || '',
      statut: user.statut,
      doit_changer_mot_de_passe: user.doit_changer_mot_de_passe || false,
      photo_url: user.photo_url
    }
  });

  const selectedRoleId = watch('role_id');
  const selectedStatut = watch('statut');
  const doitChangerMotDePasse = watch('doit_changer_mot_de_passe');

  const updateUserMutation = useMutation({
    mutationFn: async (data: EditUserFormData) => {
      // Mettre à jour les données utilisateur
      const { error: userError } = await supabase
        .from('utilisateurs_internes')
        .update({
          prenom: data.prenom,
          nom: data.nom,
          email: data.email,
          telephone: data.telephone || null,
          adresse: data.adresse || null,
          photo_url: data.photo_url || null,
          role_id: data.role_id,
          statut: data.statut,
          doit_changer_mot_de_passe: data.doit_changer_mot_de_passe
        })
        .eq('id', user.id);

      if (userError) throw userError;

      // Mettre à jour le rôle dans user_roles si nécessaire
      if (data.role_id !== user.role?.id) {
        // Désactiver l'ancien rôle
        await supabase
          .from('user_roles')
          .update({ is_active: false })
          .eq('user_id', user.user_id);

        // Activer le nouveau rôle
        await supabase
          .from('user_roles')
          .upsert({
            user_id: user.user_id,
            role_id: data.role_id,
            is_active: true
          });
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
      toast({
        title: "Utilisateur modifié",
        description: "L'utilisateur a été modifié avec succès",
      });
      onSuccess();
    },
    onError: (error: any) => {
      console.error('Erreur lors de la modification:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier l'utilisateur",
        variant: "destructive",
      });
    }
  });

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
      // Créer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload vers Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw new Error(`Erreur d'upload: ${error.message}`);
      }

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);

      setPhotoPreview(publicUrl);
      setValue('photo_url', publicUrl);
      
      toast({
        title: "Succès",
        description: "Photo téléchargée avec succès.",
      });
    } catch (error: any) {
      console.error('Erreur lors de l\'upload:', error);
      toast({
        title: "Erreur d'upload",
        description: error.message || "Impossible de télécharger la photo.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const onSubmit = async (data: EditUserFormData) => {
    if (!selectedRoleId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un rôle",
        variant: "destructive",
      });
      return;
    }

    updateUserMutation.mutate(data);
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
            disabled={updateUserMutation.isPending}
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
            disabled={updateUserMutation.isPending}
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
          disabled={updateUserMutation.isPending}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="telephone">Téléphone</Label>
        <Input
          id="telephone"
          {...register("telephone")}
          disabled={updateUserMutation.isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Rôle *</Label>
        <Select 
          value={selectedRoleId} 
          onValueChange={value => setValue('role_id', value)}
          disabled={updateUserMutation.isPending}
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

      <div className="space-y-2">
        <Label htmlFor="adresse">Adresse complète</Label>
        <Textarea
          id="adresse"
          {...register("adresse")}
          rows={3}
          disabled={updateUserMutation.isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="statut">Statut *</Label>
        <Select 
          value={selectedStatut} 
          onValueChange={value => setValue('statut', value)}
          disabled={updateUserMutation.isPending}
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
          checked={doitChangerMotDePasse}
          onCheckedChange={value => setValue('doit_changer_mot_de_passe', value)}
          disabled={updateUserMutation.isPending}
        />
        <Label htmlFor="doit_changer_mot_de_passe">
          Forcer le changement de mot de passe à la prochaine connexion
        </Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={updateUserMutation.isPending}
        >
          Annuler
        </Button>
        <Button 
          type="submit" 
          disabled={updateUserMutation.isPending || !selectedRoleId || isUploadingPhoto}
        >
          {updateUserMutation.isPending ? 'Modification...' : 'Modifier l\'utilisateur'}
        </Button>
      </div>
    </form>
  );
};

export default EditUserForm;
