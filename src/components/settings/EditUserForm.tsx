import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { ImageUpload } from '@/components/ui/image-upload';
import { useRolesUtilisateurs } from '@/hooks/useRolesUtilisateurs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Lock, Mail, Phone, MapPin, Camera, UserCheck, Power } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Schéma de validation pour l'édition
const editUserSchema = z.object({
  prenom: z.string().min(1, 'Le prénom est obligatoire'),
  nom: z.string().min(1, 'Le nom est obligatoire'),
  email: z.string().email('Email invalide'),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  telephone: z.string().optional(),
  adresse: z.string().optional(),
  role_id: z.string().min(1, 'Le rôle est obligatoire'),
  doit_changer_mot_de_passe: z.boolean(),
  statut: z.enum(['actif', 'inactif']),
}).refine((data) => {
  if (data.password && data.password.length > 0) {
    // Si un mot de passe est fourni, vérifier sa validité
    if (data.password.length < 8) return false;
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(data.password)) return false;
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Le mot de passe doit contenir au moins 8 caractères avec une majuscule, une minuscule, un chiffre et un caractère spécial. Les mots de passe doivent correspondre.",
  path: ["confirmPassword"],
});

type EditUserFormData = z.infer<typeof editUserSchema>;

interface EditUserFormProps {
  user: {
    id: string;
    prenom: string;
    nom: string;
    email: string;
    telephone?: string;
    adresse?: string;
    photo_url?: string;
    role: { nom: string } | null;
    role_id?: string;
    doit_changer_mot_de_passe: boolean;
    statut: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

const EditUserForm = ({ user, onSuccess, onCancel }: EditUserFormProps) => {
  const [photoUrl, setPhotoUrl] = useState<string>(user.photo_url || '');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const { data: roles, isLoading: rolesLoading } = useRolesUtilisateurs();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      prenom: user.prenom,
      nom: user.nom,
      email: user.email,
      telephone: user.telephone || '',
      adresse: user.adresse || '',
      role_id: user.role_id || '',
      doit_changer_mot_de_passe: user.doit_changer_mot_de_passe,
      statut: user.statut as 'actif' | 'inactif',
    }
  });

  const doitChangerMotDePasse = watch('doit_changer_mot_de_passe');
  const statut = watch('statut');

  // Mutation pour mettre à jour l'utilisateur
  const updateUser = useMutation({
    mutationFn: async (data: EditUserFormData) => {
      console.log('🔄 Mise à jour utilisateur:', data);
      
      // 1. Mettre à jour les informations de base dans utilisateurs_internes
      const updateData: any = {
        prenom: data.prenom,
        nom: data.nom,
        email: data.email,
        telephone: data.telephone,
        adresse: data.adresse,
        photo_url: photoUrl,
        role_id: data.role_id,
        doit_changer_mot_de_passe: data.doit_changer_mot_de_passe,
        statut: data.statut,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from('utilisateurs_internes')
        .update(updateData)
        .eq('id', user.id);

      if (updateError) {
        console.error('❌ Erreur mise à jour utilisateur:', updateError);
        throw updateError;
      }

      // 2. Pour la mise à jour du mot de passe, on ne peut pas utiliser l'API Admin
      // On va plutôt demander à l'utilisateur de changer son mot de passe lors de sa prochaine connexion
      if (data.password && data.password.length > 0) {
        // Marquer que l'utilisateur doit changer son mot de passe
        const { error: passwordFlagError } = await supabase
          .from('utilisateurs_internes')
          .update({ 
            doit_changer_mot_de_passe: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (passwordFlagError) {
          console.error('❌ Erreur flag mot de passe:', passwordFlagError);
          throw passwordFlagError;
        }

        // Informer l'utilisateur que le changement de mot de passe sera requis
        toast({
          title: "Mot de passe",
          description: "L'utilisateur devra définir un nouveau mot de passe lors de sa prochaine connexion.",
        });
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
      toast({ 
        title: "Utilisateur mis à jour avec succès",
        description: "Les modifications ont été enregistrées."
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error('❌ Erreur lors de la mise à jour:', error);
      toast({ 
        title: "Erreur", 
        description: error.message || "Impossible de mettre à jour l'utilisateur",
        variant: "destructive" 
      });
    }
  });

  const onSubmit = async (data: EditUserFormData) => {
    try {
      await updateUser.mutateAsync(data);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Modifier l'utilisateur
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Statut actif/inactif */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              <Power className="h-4 w-4" />
              <div>
                <Label className="text-base font-medium">Statut du compte</Label>
                <p className="text-sm text-muted-foreground">
                  Contrôle l'accès à l'application
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="statut-switch" className={statut === 'actif' ? 'text-green-600' : 'text-red-600'}>
                {statut === 'actif' ? 'Actif' : 'Inactif'}
              </Label>
              <Switch
                id="statut-switch"
                checked={statut === 'actif'}
                onCheckedChange={(checked) => 
                  setValue('statut', checked ? 'actif' : 'inactif')
                }
              />
            </div>
          </div>

          {/* Prénom et Nom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prenom" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Prénom *
              </Label>
              <Input
                id="prenom"
                {...register('prenom')}
                placeholder="Entrez le prénom"
                className={errors.prenom ? 'border-red-500' : ''}
              />
              {errors.prenom && (
                <p className="text-sm text-red-500">{errors.prenom.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nom" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nom *
              </Label>
              <Input
                id="nom"
                {...register('nom')}
                placeholder="Entrez le nom"
                className={errors.nom ? 'border-red-500' : ''}
              />
              {errors.nom && (
                <p className="text-sm text-red-500">{errors.nom.message}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="exemple@domaine.com"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Modification du mot de passe */}
          <div className="space-y-4 border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-base font-medium">
                <Lock className="h-4 w-4" />
                Mot de passe
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsChangingPassword(!isChangingPassword)}
              >
                {isChangingPassword ? 'Annuler' : 'Forcer le changement'}
              </Button>
            </div>

            {isChangingPassword && (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    📝 L'utilisateur sera obligé de définir un nouveau mot de passe lors de sa prochaine connexion.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Nouveau mot de passe (optionnel)</Label>
                    <Input
                      id="password"
                      type="password"
                      {...register('password')}
                      placeholder="8 caractères minimum"
                      className={errors.password ? 'border-red-500' : ''}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...register('confirmPassword')}
                      placeholder="Confirmez le mot de passe"
                      className={errors.confirmPassword ? 'border-red-500' : ''}
                    />
                  </div>
                  
                  {errors.confirmPassword && (
                    <div className="col-span-2">
                      <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Option changement de mot de passe */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="doit_changer_mot_de_passe"
                checked={doitChangerMotDePasse}
                onCheckedChange={(checked) => 
                  setValue('doit_changer_mot_de_passe', checked as boolean)
                }
              />
              <Label htmlFor="doit_changer_mot_de_passe" className="text-sm">
                Obliger l'utilisateur à changer son mot de passe à la prochaine connexion
              </Label>
            </div>
          </div>

          {/* Téléphone */}
          <div className="space-y-2">
            <Label htmlFor="telephone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Téléphone
            </Label>
            <Input
              id="telephone"
              {...register('telephone')}
              placeholder="+33 1 23 45 67 89"
            />
          </div>

          {/* Adresse */}
          <div className="space-y-2">
            <Label htmlFor="adresse" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Adresse
            </Label>
            <Textarea
              id="adresse"
              {...register('adresse')}
              placeholder="Adresse complète"
              rows={3}
            />
          </div>

          {/* Photo de l'utilisateur */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Photo de l'utilisateur
            </Label>
            <ImageUpload
              onImageUploaded={setPhotoUrl}
              currentImageUrl={photoUrl}
              label=""
            />
          </div>

          {/* Rôle */}
          <div className="space-y-2">
            <Label htmlFor="role" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Rôle *
            </Label>
            <Select 
              value={watch('role_id')} 
              onValueChange={(value) => setValue('role_id', value)} 
              disabled={rolesLoading}
            >
              <SelectTrigger className={errors.role_id ? 'border-red-500' : ''}>
                <SelectValue placeholder={rolesLoading ? "Chargement..." : "Sélectionnez un rôle"} />
              </SelectTrigger>
              <SelectContent>
                {roles?.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.nom === 'employe' ? 'Employé' :
                     role.nom === 'administrateur' ? 'Administrateur' :
                     role.nom === 'manager' ? 'Manager' : role.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role_id && (
              <p className="text-sm text-red-500">{errors.role_id.message}</p>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || updateUser.isPending}
            >
              {isSubmitting || updateUser.isPending ? 'Mise à jour...' : 'Mettre à jour'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditUserForm;
