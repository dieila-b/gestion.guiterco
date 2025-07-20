
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRolesForUsers } from '@/hooks/useUtilisateursInternes';
import { useSecureUserManagement } from '@/hooks/useSecureUserManagement';
import { RefreshCw, User, Lock, Mail, Phone, MapPin, CreditCard } from 'lucide-react';

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
    role?: {
      id: string;
      name: string;
    } | null;
    matricule?: string;
    statut: string;
    doit_changer_mot_de_passe: boolean;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const EditUserForm = ({ user, onSuccess, onCancel }: EditUserFormProps) => {
  const { data: roles = [], isLoading: rolesLoading } = useRolesForUsers();
  const { assignRoleSecure, updateUserSecure, updatePasswordSecure, updateEmailSecure } = useSecureUserManagement();
  
  const [formData, setFormData] = useState({
    prenom: user.prenom || '',
    nom: user.nom || '',
    email: user.email || '',
    telephone: user.telephone || '',
    adresse: user.adresse || '',
    photo_url: user.photo_url || '',
    matricule: user.matricule || '',
    statut: user.statut || 'actif',
    selectedRoleId: user.role?.id || 'no-role',
    doit_changer_mot_de_passe: user.doit_changer_mot_de_passe || false,
    nouveauMotDePasse: '',
    modifierMotDePasse: false
  });

  const [isUpdating, setIsUpdating] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      console.log('🔄 Début de la mise à jour sécurisée utilisateur:', user.id);

      // 1. Mettre à jour les informations du profil utilisateur avec la fonction sécurisée
      await updateUserSecure.mutateAsync({
        userInternalId: user.id,
        userData: {
          prenom: formData.prenom,
          nom: formData.nom,
          email: formData.email,
          telephone: formData.telephone || '',
          adresse: formData.adresse || '',
          photo_url: formData.photo_url || '',
          matricule: formData.matricule || '',
          statut: formData.statut,
          doit_changer_mot_de_passe: formData.doit_changer_mot_de_passe
        }
      });

      console.log('✅ Profil utilisateur mis à jour avec fonction sécurisée');

      // 2. Gérer le changement de rôle si nécessaire
      if (formData.selectedRoleId !== user.role?.id) {
        console.log('🔄 Assignation sécurisée du rôle utilisateur...');
        
        await assignRoleSecure.mutateAsync({
          userId: user.user_id,
          roleId: formData.selectedRoleId
        });

        console.log('✅ Rôle utilisateur assigné avec fonction sécurisée');
      }

      // 3. Gérer le changement de mot de passe si demandé
      if (formData.modifierMotDePasse && formData.nouveauMotDePasse.trim()) {
        console.log('🔐 Mise à jour sécurisée du mot de passe...');
        
        await updatePasswordSecure.mutateAsync({
          authUserId: user.user_id,
          newPassword: formData.nouveauMotDePasse
        });

        console.log('✅ Mot de passe mis à jour avec fonction sécurisée');
      }

      // 4. Mettre à jour l'email dans auth.users si changé
      if (formData.email !== user.email) {
        console.log('📧 Mise à jour sécurisée email auth...');
        
        try {
          await updateEmailSecure.mutateAsync({
            authUserId: user.user_id,
            newEmail: formData.email
          });

          console.log('✅ Email auth mis à jour avec fonction sécurisée');
        } catch (emailError) {
          console.warn('⚠️ Email auth non mis à jour, mais profil sauvegardé:', emailError);
        }
      }

      console.log('🎉 TOUS LES CHANGEMENTS APPLIQUÉS AVEC SUCCÈS');
      onSuccess();

    } catch (error: any) {
      console.error('❌ Erreur générale lors de la mise à jour sécurisée:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const isLoading = isUpdating || assignRoleSecure.isPending || updateUserSecure.isPending || updatePasswordSecure.isPending || updateEmailSecure.isPending;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* En-tête avec photo de profil */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={formData.photo_url} alt={`${formData.prenom} ${formData.nom}`} />
                <AvatarFallback className="bg-primary/10">
                  <User className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-2xl">
                  {formData.prenom} {formData.nom}
                </CardTitle>
                <p className="text-muted-foreground flex items-center space-x-2 mt-1">
                  <Mail className="h-4 w-4" />
                  <span>{formData.email}</span>
                </p>
                <p className="text-sm text-muted-foreground flex items-center space-x-2 mt-1">
                  <CreditCard className="h-4 w-4" />
                  <span>Matricule: {formData.matricule}</span>
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Informations personnelles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Informations personnelles</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom *</Label>
                <Input
                  id="prenom"
                  value={formData.prenom}
                  onChange={(e) => handleInputChange('prenom', e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nom">Nom *</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => handleInputChange('nom', e.target.value)}
                  required
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="pl-10 h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="matricule">Matricule</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="matricule"
                  value={formData.matricule}
                  onChange={(e) => handleInputChange('matricule', e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="telephone"
                  value={formData.telephone}
                  onChange={(e) => handleInputChange('telephone', e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo_url">Photo de profil (URL)</Label>
              <Input
                id="photo_url"
                type="url"
                value={formData.photo_url}
                onChange={(e) => handleInputChange('photo_url', e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adresse">Adresse complète</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="adresse"
                  value={formData.adresse}
                  onChange={(e) => handleInputChange('adresse', e.target.value)}
                  rows={3}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rôle et statut */}
        <Card>
          <CardHeader>
            <CardTitle>Rôle et statut</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              {rolesLoading ? (
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Chargement des rôles...</span>
                </div>
              ) : (
                <Select
                  value={formData.selectedRoleId}
                  onValueChange={(value) => handleInputChange('selectedRoleId', value)}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-role">Aucun rôle</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name} {role.description && `- ${role.description}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="statut">Statut</Label>
              <Select
                value={formData.statut}
                onValueChange={(value) => handleInputChange('statut', value)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="inactif">Inactif</SelectItem>
                  <SelectItem value="suspendu">Suspendu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Sécurité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lock className="h-5 w-5" />
              <span>Sécurité</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="modifier-password" className="text-base font-medium">Modifier le mot de passe</Label>
                <p className="text-sm text-muted-foreground">
                  Activer pour définir un nouveau mot de passe
                </p>
              </div>
              <Switch
                id="modifier-password"
                checked={formData.modifierMotDePasse}
                onCheckedChange={(checked) => handleInputChange('modifierMotDePasse', checked)}
              />
            </div>

            {formData.modifierMotDePasse && (
              <div className="space-y-2">
                <Label htmlFor="nouveau-password">Nouveau mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="nouveau-password"
                    type="password"
                    value={formData.nouveauMotDePasse}
                    onChange={(e) => handleInputChange('nouveauMotDePasse', e.target.value)}
                    placeholder="Entrez le nouveau mot de passe"
                    className="pl-10 h-11"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="force-password-change" className="text-base font-medium">Forcer le changement de mot de passe</Label>
                <p className="text-sm text-muted-foreground">
                  L'utilisateur devra changer son mot de passe lors de sa prochaine connexion
                </p>
              </div>
              <Switch
                id="force-password-change"
                checked={formData.doit_changer_mot_de_passe}
                onCheckedChange={(checked) => handleInputChange('doit_changer_mot_de_passe', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onCancel} className="px-6">
            Annuler
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="px-6 flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Modification en cours...</span>
              </>
            ) : (
              <span>Modifier l'utilisateur</span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditUserForm;
