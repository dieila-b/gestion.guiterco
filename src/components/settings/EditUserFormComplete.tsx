
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRolesForUsers } from '@/hooks/useUtilisateursInternes';
import { useSimpleUserManagement } from '@/hooks/useSimpleUserManagement';
import { RefreshCw, User, Lock, Mail, Phone, MapPin, CreditCard, Shield } from 'lucide-react';

interface EditUserFormCompleteProps {
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

const EditUserFormComplete = ({ user, onSuccess, onCancel }: EditUserFormCompleteProps) => {
  const { data: roles = [], isLoading: rolesLoading } = useRolesForUsers();
  const { assignRole, updateUser, updatePassword } = useSimpleUserManagement();
  
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
    confirmerMotDePasse: '',
    modifierMotDePasse: false
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Le prénom est requis';
    }
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide';
    }

    if (formData.modifierMotDePasse) {
      if (!formData.nouveauMotDePasse.trim()) {
        newErrors.nouveauMotDePasse = 'Le nouveau mot de passe est requis';
      } else if (formData.nouveauMotDePasse.length < 6) {
        newErrors.nouveauMotDePasse = 'Le mot de passe doit contenir au moins 6 caractères';
      }
      
      if (formData.nouveauMotDePasse !== formData.confirmerMotDePasse) {
        newErrors.confirmerMotDePasse = 'Les mots de passe ne correspondent pas';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsUpdating(true);

    try {
      console.log('🔄 Début de la mise à jour complète utilisateur:', user.id);

      // 1. Mettre à jour les informations du profil utilisateur
      await updateUser.mutateAsync({
        userId: user.user_id,
        prenom: formData.prenom,
        nom: formData.nom,
        email: formData.email,
        telephone: formData.telephone,
        adresse: formData.adresse,
        photo_url: formData.photo_url,
        matricule: formData.matricule,
        statut: formData.statut,
        doit_changer_mot_de_passe: formData.doit_changer_mot_de_passe
      });

      console.log('✅ Profil utilisateur mis à jour');

      // 2. Gérer le changement de rôle si nécessaire
      if (formData.selectedRoleId !== user.role?.id) {
        console.log('🔄 Assignation du rôle utilisateur...');
        
        await assignRole.mutateAsync({
          userId: user.user_id,
          roleId: formData.selectedRoleId
        });

        console.log('✅ Rôle utilisateur assigné');
      }

      // 3. Gérer le changement de mot de passe si demandé
      if (formData.modifierMotDePasse && formData.nouveauMotDePasse.trim()) {
        console.log('🔐 Mise à jour du mot de passe...');
        
        await updatePassword.mutateAsync({
          authUserId: user.user_id,
          newPassword: formData.nouveauMotDePasse
        });

        console.log('✅ Mot de passe mis à jour');
      }

      console.log('🎉 TOUS LES CHANGEMENTS APPLIQUÉS AVEC SUCCÈS');
      onSuccess();

    } catch (error: any) {
      console.error('❌ Erreur générale lors de la mise à jour:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const isLoading = isUpdating || assignRole.isPending || updateUser.isPending || updatePassword.isPending;

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
                  className={errors.prenom ? 'border-red-500' : ''}
                />
                {errors.prenom && (
                  <p className="text-sm text-red-500">{errors.prenom}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nom">Nom *</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => handleInputChange('nom', e.target.value)}
                  className={errors.nom ? 'border-red-500' : ''}
                />
                {errors.nom && (
                  <p className="text-sm text-red-500">{errors.nom}</p>
                )}
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
                  className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="matricule">Matricule</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="matricule"
                  value={formData.matricule}
                  onChange={(e) => handleInputChange('matricule', e.target.value)}
                  className="pl-10"
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
                  className="pl-10"
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
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Rôle et statut</span>
            </CardTitle>
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
                  <SelectTrigger>
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
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nouveau-password">Nouveau mot de passe *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="nouveau-password"
                      type="password"
                      value={formData.nouveauMotDePasse}
                      onChange={(e) => handleInputChange('nouveauMotDePasse', e.target.value)}
                      placeholder="Entrez le nouveau mot de passe"
                      className={`pl-10 ${errors.nouveauMotDePasse ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.nouveauMotDePasse && (
                    <p className="text-sm text-red-500">{errors.nouveauMotDePasse}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmer-password">Confirmer le mot de passe *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmer-password"
                      type="password"
                      value={formData.confirmerMotDePasse}
                      onChange={(e) => handleInputChange('confirmerMotDePasse', e.target.value)}
                      placeholder="Confirmez le nouveau mot de passe"
                      className={`pl-10 ${errors.confirmerMotDePasse ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.confirmerMotDePasse && (
                    <p className="text-sm text-red-500">{errors.confirmerMotDePasse}</p>
                  )}
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

export default EditUserFormComplete;
