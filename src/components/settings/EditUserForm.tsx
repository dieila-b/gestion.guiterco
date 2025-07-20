
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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, User, Lock } from 'lucide-react';

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
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    prenom: user.prenom || '',
    nom: user.nom || '',
    email: user.email || '',
    telephone: user.telephone || '',
    adresse: user.adresse || '',
    photo_url: user.photo_url || '',
    matricule: user.matricule || '',
    statut: user.statut || 'actif',
    selectedRoleId: user.role?.id || '',
    doit_changer_mot_de_passe: user.doit_changer_mot_de_passe || false,
    nouveauMotDePasse: '',
    modifierMotDePasse: false
  });

  const { data: roles = [], isLoading: rolesLoading } = useRolesForUsers();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      console.log('🔄 Début de la mise à jour utilisateur:', user.id);

      // 1. Mettre à jour les informations du profil utilisateur
      const { error: profileError } = await supabase
        .from('utilisateurs_internes')
        .update({
          prenom: formData.prenom,
          nom: formData.nom,
          email: formData.email,
          telephone: formData.telephone || null,
          adresse: formData.adresse || null,
          photo_url: formData.photo_url || null,
          matricule: formData.matricule || null,
          statut: formData.statut,
          doit_changer_mot_de_passe: formData.doit_changer_mot_de_passe,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('❌ Erreur mise à jour profil:', profileError);
        throw new Error(`Erreur profil: ${profileError.message}`);
      }

      console.log('✅ Profil utilisateur mis à jour');

      // 2. Gérer le changement de rôle si nécessaire
      if (formData.selectedRoleId && formData.selectedRoleId !== user.role?.id) {
        console.log('🔄 Mise à jour du rôle utilisateur...');
        
        // Désactiver l'ancien rôle
        if (user.role?.id) {
          await supabase
            .from('user_roles')
            .update({ is_active: false })
            .eq('user_id', user.user_id)
            .eq('role_id', user.role.id);
        }

        // Assigner le nouveau rôle
        const { error: roleError } = await supabase
          .from('user_roles')
          .upsert({
            user_id: user.user_id,
            role_id: formData.selectedRoleId,
            is_active: true,
            assigned_at: new Date().toISOString()
          });

        if (roleError) {
          console.error('❌ Erreur assignation rôle:', roleError);
          throw new Error(`Erreur rôle: ${roleError.message}`);
        }

        console.log('✅ Rôle utilisateur mis à jour');
      }

      // 3. Gérer le changement de mot de passe si demandé
      if (formData.modifierMotDePasse && formData.nouveauMotDePasse.trim()) {
        console.log('🔐 Mise à jour du mot de passe...');
        
        const { error: passwordError } = await supabase.auth.admin.updateUserById(
          user.user_id,
          { password: formData.nouveauMotDePasse }
        );

        if (passwordError) {
          console.error('❌ Erreur mot de passe:', passwordError);
          throw new Error(`Erreur mot de passe: ${passwordError.message}`);
        }

        console.log('✅ Mot de passe mis à jour');
      }

      // 4. Mettre à jour l'email dans auth.users si changé
      if (formData.email !== user.email) {
        console.log('📧 Mise à jour email auth...');
        
        const { error: emailError } = await supabase.auth.admin.updateUserById(
          user.user_id,
          { email: formData.email }
        );

        if (emailError) {
          console.error('❌ Erreur email auth:', emailError);
          // Ne pas bloquer pour cette erreur
          console.warn('⚠️ Email auth non mis à jour, mais profil sauvegardé');
        } else {
          console.log('✅ Email auth mis à jour');
        }
      }

      toast({
        title: "Utilisateur modifié avec succès",
        description: "Toutes les informations ont été mises à jour.",
      });

      onSuccess();

    } catch (error: any) {
      console.error('❌ Erreur générale:', error);
      toast({
        title: "Erreur de mise à jour",
        description: error.message || "Une erreur est survenue lors de la mise à jour",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* En-tête avec photo de profil */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={formData.photo_url} alt={`${formData.prenom} ${formData.nom}`} />
                <AvatarFallback>
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">
                  {formData.prenom} {formData.nom}
                </CardTitle>
                <p className="text-muted-foreground">{formData.email}</p>
                <p className="text-sm text-muted-foreground">Matricule: {formData.matricule}</p>
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

            <div className="space-y-2">
              <Label htmlFor="matricule">Matricule</Label>
              <Input
                id="matricule"
                value={formData.matricule}
                onChange={(e) => handleInputChange('matricule', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input
                id="telephone"
                value={formData.telephone}
                onChange={(e) => handleInputChange('telephone', e.target.value)}
              />
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
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="modifier-password">Modifier le mot de passe</Label>
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
                <Input
                  id="nouveau-password"
                  type="password"
                  value={formData.nouveauMotDePasse}
                  onChange={(e) => handleInputChange('nouveauMotDePasse', e.target.value)}
                  placeholder="Entrez le nouveau mot de passe"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="force-password-change">Forcer le changement de mot de passe</Label>
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
        <div className="flex justify-end space-x-2 pt-4">
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
