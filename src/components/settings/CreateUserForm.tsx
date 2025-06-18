
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
import { ImageUpload } from '@/components/ui/image-upload';
import { useRolesUtilisateurs, useCreateUtilisateurInterne } from '@/hooks/useRolesUtilisateurs';
import { User, Lock, Mail, Phone, MapPin, Camera, UserCheck } from 'lucide-react';

// Schéma de validation selon les exigences
const userSchema = z.object({
  prenom: z.string().min(1, 'Le prénom est obligatoire'),
  nom: z.string().min(1, 'Le nom est obligatoire'),
  email: z.string().email('Email invalide'),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'),
  confirmPassword: z.string(),
  telephone: z.string().optional(),
  adresse: z.string().optional(),
  role_id: z.string().min(1, 'Le rôle est obligatoire'),
  doit_changer_mot_de_passe: z.boolean(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type UserFormData = z.infer<typeof userSchema>;

interface CreateUserFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CreateUserForm = ({ onSuccess, onCancel }: CreateUserFormProps) => {
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const { data: roles, isLoading: rolesLoading } = useRolesUtilisateurs();
  const createUser = useCreateUtilisateurInterne();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      doit_changer_mot_de_passe: true, // Cochée par défaut
    }
  });

  const doitChangerMotDePasse = watch('doit_changer_mot_de_passe');

  const onSubmit = async (data: UserFormData) => {
    try {
      await createUser.mutateAsync({
        prenom: data.prenom,
        nom: data.nom,
        email: data.email,
        password: data.password,
        telephone: data.telephone,
        adresse: data.adresse,
        photo_url: photoUrl,
        role_id: data.role_id,
        doit_changer_mot_de_passe: data.doit_changer_mot_de_passe,
      });
      onSuccess?.();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Créer un nouvel utilisateur
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

          {/* Mot de passe et Confirmation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Mot de passe *
              </Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                placeholder="8 caractères minimum"
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Confirmer le mot de passe *
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                placeholder="Confirmez le mot de passe"
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

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
              Obliger l'utilisateur à changer son mot de passe à la première connexion
            </Label>
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
            <Select onValueChange={(value) => setValue('role_id', value)} disabled={rolesLoading}>
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
              disabled={isSubmitting || createUser.isPending}
            >
              {isSubmitting || createUser.isPending ? 'Création...' : 'Créer l\'utilisateur'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateUserForm;
