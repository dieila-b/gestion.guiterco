import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Edit, Upload, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUpdateUtilisateurInterne, UtilisateurInterne } from '@/hooks/useUtilisateursInternes';
import { useRoles } from '@/hooks/usePermissions';
import { useFileUpload } from '@/hooks/useFileUpload';
import { usePasswordUpdate } from '@/hooks/usePasswordUpdate';

const editUserSchema = z.object({
  prenom: z.string().min(1, 'Le prénom est requis'),
  nom: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  telephone: z.string().optional(),
  role_id: z.string().min(1, 'Le rôle est requis'),
  adresse_complete: z.string().optional(),
  photo_url: z.string().optional(),
  statut: z.enum(['actif', 'inactif']),
  doit_changer_mot_de_passe: z.boolean(),
  // Champs pour la modification du mot de passe
  change_password: z.boolean().default(false),
  new_password: z.string().optional().refine((password) => {
    if (!password || password === '') return true; // Optionnel
    
    return password.length >= 10 &&
           /[A-Z]/.test(password) &&
           /[a-z]/.test(password) &&
           /[0-9]/.test(password) &&
           /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  }, {
    message: "Le mot de passe doit contenir au moins 10 caractères avec une majuscule, une minuscule, un chiffre et un caractère spécial"
  }),
  confirm_new_password: z.string().optional(),
}).refine((data) => {
  if (data.change_password) {
    return data.new_password === data.confirm_new_password;
  }
  return true;
}, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirm_new_password"],
});

type EditUserFormData = z.infer<typeof editUserSchema>;

interface EditUserDialogProps {
  user: UtilisateurInterne;
  children: React.ReactNode;
}

export function EditUserDialog({ user, children }: EditUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const updateUser = useUpdateUtilisateurInterne();
  const { data: roles, isLoading: rolesLoading } = useRoles();
  const { uploadFile, uploading } = useFileUpload();
  const { updatePassword, isLoading: isUpdatingPassword } = usePasswordUpdate();

  const form = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      prenom: user.prenom,
      nom: user.nom,
      email: user.email,
      telephone: user.telephone || '',
      role_id: user.role_id || '',
      adresse_complete: user.adresse_complete || '',
      photo_url: user.photo_url || '',
      statut: user.statut,
      doit_changer_mot_de_passe: user.doit_changer_mot_de_passe,
      change_password: false,
      new_password: '',
      confirm_new_password: '',
    },
  });

  // Reset form when user changes
  useEffect(() => {
    form.reset({
      prenom: user.prenom,
      nom: user.nom,
      email: user.email,
      telephone: user.telephone || '',
      role_id: user.role_id || '',
      adresse_complete: user.adresse_complete || '',
      photo_url: user.photo_url || '',
      statut: user.statut,
      doit_changer_mot_de_passe: user.doit_changer_mot_de_passe,
      change_password: false,
      new_password: '',
      confirm_new_password: '',
    });
  }, [user, form]);

  const onSubmit = async (data: EditUserFormData) => {
    try {
      // Mettre à jour les informations de base
      await updateUser.mutateAsync({
        id: user.id,
        data: {
          prenom: data.prenom,
          nom: data.nom,
          email: data.email,
          telephone: data.telephone,
          role_id: data.role_id,
          adresse_complete: data.adresse_complete,
          photo_url: data.photo_url,
          statut: data.statut,
          doit_changer_mot_de_passe: data.doit_changer_mot_de_passe,
        }
      });

      // Mettre à jour le mot de passe si demandé
      if (data.change_password && data.new_password && user.user_id) {
        await updatePassword({
          userId: user.user_id,
          newPassword: data.new_password,
          requireChange: data.doit_changer_mot_de_passe
        });
      }
      
      setOpen(false);
    } catch (error) {
      console.error('Erreur lors de la modification de l\'utilisateur:', error);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const imageUrl = await uploadFile(file, 'user-avatars');
      form.setValue('photo_url', imageUrl);
    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'image:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier l'utilisateur</DialogTitle>
          <DialogDescription>
            Modifiez les informations de l'utilisateur interne.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Photo de profil */}
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={form.watch('photo_url')} />
                <AvatarFallback className="text-lg">
                  {form.watch('prenom')?.charAt(0)}{form.watch('nom')?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <FormField
                control={form.control}
                name="photo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Photo de profil</FormLabel>
                    <div className="flex space-x-2">
                      <FormControl>
                        <Input
                          placeholder="URL de la photo"
                          {...field}
                        />
                      </FormControl>
                      <div className="relative">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon"
                          disabled={uploading}
                          className="relative overflow-hidden"
                        >
                          <Upload className="h-4 w-4" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </Button>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Prénom */}
              <FormField
                control={form.control}
                name="prenom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom *</FormLabel>
                    <FormControl>
                      <Input placeholder="Issa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Nom */}
              <FormField
                control={form.control}
                name="nom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom *</FormLabel>
                    <FormControl>
                      <Input placeholder="BAH" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input placeholder="issabah@gmail.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Téléphone */}
            <FormField
              control={form.control}
              name="telephone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone</FormLabel>
                  <FormControl>
                    <Input placeholder="233456788" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Matricule - Information seulement */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Matricule (généré automatiquement)
              </label>
              <Input
                value={user.matricule || 'ISB-XX'}
                disabled
                className="bg-muted text-muted-foreground"
              />
            </div>

            {/* Rôle */}
            <FormField
              control={form.control}
              name="role_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rôle *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {!rolesLoading && roles?.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name} - {role.description || 'Pas de description'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Adresse complète */}
            <FormField
              control={form.control}
              name="adresse_complete"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse complète</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Adresse complète..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Statut */}
            <FormField
              control={form.control}
              name="statut"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="actif">Actif</SelectItem>
                      <SelectItem value="inactif">Inactif</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Modification du mot de passe */}
            <FormField
              control={form.control}
              name="change_password"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Modifier le mot de passe
                    </FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Activer pour définir un nouveau mot de passe pour cet utilisateur
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Champs de mot de passe conditionnels */}
            {form.watch('change_password') && (
              <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
                <div className="grid grid-cols-2 gap-4">
                  {/* Nouveau mot de passe */}
                  <FormField
                    control={form.control}
                    name="new_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nouveau mot de passe *</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type={showNewPassword ? "text" : "password"}
                              placeholder="Min. 10 caractères avec maj, min, chiffre et symbole"
                              {...field}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Confirmer le nouveau mot de passe */}
                  <FormField
                    control={form.control}
                    name="confirm_new_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmer le nouveau mot de passe *</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirmer le mot de passe"
                              {...field}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Forcer le changement de mot de passe */}
            <FormField
              control={form.control}
              name="doit_changer_mot_de_passe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Forcer le changement de mot de passe à la première connexion
                    </FormLabel>
                    <div className="text-sm text-muted-foreground">
                      L'utilisateur devra changer son mot de passe lors de sa première connexion
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={updateUser.isPending || isUpdatingPassword}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {(updateUser.isPending || isUpdatingPassword) ? 'Modification...' : 'Modifier l\'utilisateur'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}