
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useRolesForUsers } from '@/hooks/useUtilisateursInternes';
import { useSecureUserOperations } from '@/hooks/useSecureUserOperations';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Shield, User, AlertCircle } from 'lucide-react';

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
  const [formData, setFormData] = useState({
    prenom: user.prenom,
    nom: user.nom,
    email: user.email,
    telephone: user.telephone || '',
    adresse: user.adresse || '',
    photo_url: user.photo_url || '',
    matricule: user.matricule || '',
    statut: user.statut,
    selectedRoleId: user.role?.id || '',
    doit_changer_mot_de_passe: user.doit_changer_mot_de_passe
  });

  const { data: roles = [], isLoading: rolesLoading } = useRolesForUsers();
  const { 
    securePasswordUpdate, 
    secureRoleAssignment, 
    refreshSession,
    systemDiagnostic 
  } = useSecureUserOperations();

  const [isUpdating, setIsUpdating] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      console.log('🔄 Starting secure user update process...');

      // 1. Renouveler la session en premier
      await refreshSession.mutateAsync();

      // 2. Mettre à jour les paramètres de mot de passe si changés
      if (formData.doit_changer_mot_de_passe !== user.doit_changer_mot_de_passe) {
        await securePasswordUpdate.mutateAsync({
          targetUserId: user.user_id,
          forceChange: formData.doit_changer_mot_de_passe
        });
      }

      // 3. Assigner le nouveau rôle si changé
      if (formData.selectedRoleId && formData.selectedRoleId !== user.role?.id) {
        await secureRoleAssignment.mutateAsync({
          targetUserId: user.user_id,
          newRoleId: formData.selectedRoleId
        });
      }

      // 4. Mettre à jour les autres informations via l'API standard
      const { error: profileError } = await supabase
        .from('utilisateurs_internes')
        .update({
          prenom: formData.prenom,
          nom: formData.nom,
          email: formData.email,
          telephone: formData.telephone,
          adresse: formData.adresse,
          photo_url: formData.photo_url,
          matricule: formData.matricule,
          statut: formData.statut,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('❌ Profile update error:', profileError);
        throw profileError;
      }

      console.log('✅ User update completed successfully');
      onSuccess();

    } catch (error: any) {
      console.error('❌ User update failed:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDiagnostic = async () => {
    try {
      const results = await systemDiagnostic.mutateAsync();
      console.log('📊 Diagnostic results:', results);
    } catch (error) {
      console.error('❌ Diagnostic failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* En-tête avec informations système */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Modification de l'utilisateur</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="flex items-center space-x-1">
                <Shield className="h-3 w-3" />
                <span>Sécurisé</span>
              </Badge>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDiagnostic}
                disabled={systemDiagnostic.isPending}
              >
                {systemDiagnostic.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                Diagnostic
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Informations personnelles */}
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nom">Nom *</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => handleInputChange('nom', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input
                id="telephone"
                value={formData.telephone}
                onChange={(e) => handleInputChange('telephone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="matricule">Matricule</Label>
              <Input
                id="matricule"
                value={formData.matricule}
                onChange={(e) => handleInputChange('matricule', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adresse">Adresse</Label>
            <Textarea
              id="adresse"
              value={formData.adresse}
              onChange={(e) => handleInputChange('adresse', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Rôle et sécurité */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Rôle et sécurité</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Rôle</Label>
            <Select
              value={formData.selectedRoleId}
              onValueChange={(value) => handleInputChange('selectedRoleId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                {rolesLoading ? (
                  <SelectItem value="" disabled>Chargement...</SelectItem>
                ) : (
                  roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name} - {role.description}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="password-change">Forcer le changement de mot de passe</Label>
              <p className="text-sm text-muted-foreground">
                L'utilisateur devra changer son mot de passe lors de sa prochaine connexion
              </p>
            </div>
            <Switch
              id="password-change"
              checked={formData.doit_changer_mot_de_passe}
              onCheckedChange={(checked) => handleInputChange('doit_changer_mot_de_passe', checked)}
            />
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

      <Separator />

      {/* Actions */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button 
          type="submit" 
          disabled={isUpdating}
          className="flex items-center space-x-2"
        >
          {isUpdating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Mise à jour sécurisée...</span>
            </>
          ) : (
            <>
              <Shield className="h-4 w-4" />
              <span>Sauvegarder</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default EditUserForm;
