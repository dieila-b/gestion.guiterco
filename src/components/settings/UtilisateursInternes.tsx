import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Shield,
  Mail,
  Phone,
  Calendar,
  Building,
  Upload,
  Eye,
  EyeOff,
  MapPin
} from 'lucide-react';
import { 
  useUtilisateursInternes, 
  useCreateUtilisateurInterne, 
  useUpdateUtilisateurInterne, 
  useDeleteUtilisateurInterne,
  type CreateUtilisateurInterne,
  type UtilisateurInterne
} from '@/hooks/useUtilisateursInternes';
import { useRoles } from '@/hooks/usePermissionsSystem';
import { useFileUpload } from '@/hooks/useFileUpload';
import { validatePassword, validatePasswordMatch, hashPassword } from '@/utils/passwordValidation';
import { toast } from 'sonner';

interface UserFormData extends CreateUtilisateurInterne {}

const UtilisateursInternes = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UtilisateurInterne | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({ isValid: true, errors: [] });
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    prenom: '',
    nom: '',
    matricule: '',
    role_id: '',
    statut: 'actif',
    type_compte: 'employe',
    telephone: '',
    date_embauche: '',
    department: '',
    photo_url: '',
    password: '',
    confirmPassword: ''
  });

  const { data: users, isLoading, error } = useUtilisateursInternes();
  const { data: roles } = useRoles();
  const createUser = useCreateUtilisateurInterne();
  const updateUser = useUpdateUtilisateurInterne();
  const deleteUser = useDeleteUtilisateurInterne();
  const { uploadFile, uploading } = useFileUpload();

  const resetForm = () => {
    setFormData({
      email: '',
      prenom: '',
      nom: '',
      matricule: '',
      role_id: '',
      statut: 'actif',
      type_compte: 'employe',
      telephone: '',
      date_embauche: '',
      department: '',
      photo_url: '',
      password: '',
      confirmPassword: ''
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setPasswordValidation({ isValid: true, errors: [] });
    setPasswordMatch(true);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = (password: string) => {
    setFormData({ ...formData, password });
    const validation = validatePassword(password);
    setPasswordValidation(validation);
    setPasswordMatch(validatePasswordMatch(password, formData.confirmPassword || ''));
  };

  const handleConfirmPasswordChange = (confirmPassword: string) => {
    setFormData({ ...formData, confirmPassword });
    setPasswordMatch(validatePasswordMatch(formData.password || '', confirmPassword));
  };

  const handleCreate = async () => {
    try {
      // Validation côté client
      if (formData.password && !passwordValidation.isValid) {
        toast.error('Le mot de passe ne respecte pas les critères requis');
        return;
      }
      
      if (formData.password && !passwordMatch) {
        toast.error('Les mots de passe ne correspondent pas');
        return;
      }

      let photoUrl = formData.photo_url;
      
      // Upload de la photo si présente
      if (selectedFile) {
        photoUrl = await uploadFile(selectedFile, 'user-avatars') || '';
      }

      // Hash du mot de passe si présent
      let passwordHash = '';
      if (formData.password) {
        passwordHash = await hashPassword(formData.password);
      }

      const userData = {
        ...formData,
        photo_url: photoUrl,
        password_hash: passwordHash
      };
      
      // Supprimer les champs de mot de passe du form data avant envoi
      delete userData.password;
      delete userData.confirmPassword;

      await createUser.mutateAsync(userData);
      setShowCreateDialog(false);
      resetForm();
    } catch (error) {
      console.error('Erreur création:', error);
    }
  };

  const handleEdit = (user: UtilisateurInterne) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      prenom: user.prenom,
      nom: user.nom,
      matricule: user.matricule || '',
      role_id: user.role_id || '',
      statut: user.statut,
      type_compte: user.type_compte,
      telephone: user.telephone || '',
      date_embauche: user.date_embauche || '',
      department: user.department || '',
      photo_url: user.photo_url || '',
      password: '',
      confirmPassword: ''
    });
    setPreviewUrl(user.photo_url || null);
    setShowEditDialog(true);
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;
    
    try {
      // Validation côté client pour les mots de passe si fournis
      if (formData.password && !passwordValidation.isValid) {
        toast.error('Le mot de passe ne respecte pas les critères requis');
        return;
      }
      
      if (formData.password && !passwordMatch) {
        toast.error('Les mots de passe ne correspondent pas');
        return;
      }

      let photoUrl = formData.photo_url;
      
      // Upload de la photo si une nouvelle photo est sélectionnée
      if (selectedFile) {
        photoUrl = await uploadFile(selectedFile, 'user-avatars') || formData.photo_url;
      }

      // Hash du mot de passe si fourni
      let passwordHash = '';
      if (formData.password) {
        passwordHash = await hashPassword(formData.password);
      }

      const userData = {
        ...formData,
        photo_url: photoUrl,
        ...(passwordHash && { password_hash: passwordHash })
      };
      
      // Supprimer les champs de mot de passe du form data avant envoi
      delete userData.password;
      delete userData.confirmPassword;

      await updateUser.mutateAsync({ id: selectedUser.id, ...userData });
      // Reset immédiat pour éviter les boucles
      setShowEditDialog(false);
      setSelectedUser(null);
      setSelectedFile(null);
      resetForm();
    } catch (error) {
      console.error('Erreur mise à jour:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await deleteUser.mutateAsync(id);
      } catch (error) {
        console.error('Erreur suppression:', error);
      }
    }
  };

  const getStatusBadge = (statut: string) => {
    const variants = {
      actif: 'default',
      inactif: 'secondary',
      suspendu: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[statut as keyof typeof variants] || 'secondary'}>
        {statut.charAt(0).toUpperCase() + statut.slice(1)}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      admin: 'destructive',
      gestionnaire: 'default',
      employe: 'secondary'
    } as const;
    
    return (
      <Badge variant={variants[type as keyof typeof variants] || 'secondary'}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Utilisateurs Internes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des utilisateurs...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Utilisateurs Internes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <Shield className="w-5 h-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Erreur de chargement</p>
              <p className="text-sm text-destructive/80">
                {error.message || 'Impossible de charger les données des utilisateurs.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Utilisateurs Internes
          </CardTitle>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Nouvel utilisateur
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Créer un nouvel utilisateur interne</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4 overflow-y-auto max-h-[70vh]">
                {/* Photo de profil */}
                <div className="space-y-2">
                  <Label>Photo de profil</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={previewUrl || formData.photo_url} />
                      <AvatarFallback>
                        <User className="w-8 h-8" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="photo-upload"
                      />
                      <Label htmlFor="photo-upload" className="cursor-pointer">
                        <Button type="button" variant="outline" size="sm" asChild>
                          <span>
                            <Upload className="w-4 h-4 mr-2" />
                            Choisir une photo
                          </span>
                        </Button>
                      </Label>
                      {uploading && <p className="text-sm text-muted-foreground">Upload en cours...</p>}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prenom">Prénom *</Label>
                    <Input
                      id="prenom"
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                      placeholder="Prénom"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom *</Label>
                    <Input
                      id="nom"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      placeholder="Nom"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@exemple.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="matricule">Matricule</Label>
                    <Input
                      id="matricule"
                      value={formData.matricule}
                      onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                      placeholder="Généré automatiquement si vide"
                      className="bg-muted/50"
                    />
                    <p className="text-xs text-muted-foreground">
                      Format: {formData.prenom && formData.nom ? 
                        `${formData.prenom.charAt(0).toUpperCase()}${formData.nom.substring(0, 3).toUpperCase()}-01` : 
                        'XAAA-01'
                      }
                    </p>
                  </div>
                </div>

                {/* Mots de passe */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        placeholder="Mot de passe"
                        className={!passwordValidation.isValid && formData.password ? "border-destructive" : ""}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {!passwordValidation.isValid && formData.password && (
                      <div className="text-xs text-destructive space-y-1">
                        {passwordValidation.errors.map((error, index) => (
                          <p key={index}>• {error}</p>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                        placeholder="Confirmer le mot de passe"
                        className={!passwordMatch && formData.confirmPassword ? "border-destructive" : ""}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {!passwordMatch && formData.confirmPassword && (
                      <p className="text-xs text-destructive">Les mots de passe ne correspondent pas</p>
                    )}
                  </div>
                </div>

                {/* Critères de validation du mot de passe */}
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm font-medium mb-2">Critères du mot de passe :</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Minimum 8 caractères</li>
                    <li>• Au moins une majuscule (A-Z)</li>
                    <li>• Au moins une minuscule (a-z)</li>
                    <li>• Au moins un chiffre (0-9)</li>
                    <li>• Au moins un caractère spécial (!@#$%^&*)</li>
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Rôle</Label>
                    <Select value={formData.role_id} onValueChange={(value) => setFormData({ ...formData, role_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles?.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="statut">Statut</Label>
                    <Select value={formData.statut} onValueChange={(value: any) => setFormData({ ...formData, statut: value })}>
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
                  <div className="space-y-2">
                    <Label htmlFor="type_compte">Type de compte</Label>
                    <Select value={formData.type_compte} onValueChange={(value: any) => setFormData({ ...formData, type_compte: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employe">Employé</SelectItem>
                        <SelectItem value="gestionnaire">Gestionnaire</SelectItem>
                        <SelectItem value="admin">Administrateur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telephone">Téléphone</Label>
                    <Input
                      id="telephone"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      placeholder="Téléphone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_embauche">Date d'embauche</Label>
                    <Input
                      id="date_embauche"
                      type="date"
                      value={formData.date_embauche}
                      onChange={(e) => setFormData({ ...formData, date_embauche: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Adresse</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="Adresse"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Annuler
                </Button>
                <Button 
                  onClick={handleCreate}
                  disabled={createUser.isPending || !formData.email || !formData.prenom || !formData.nom}
                >
                  {createUser.isPending ? 'Création...' : 'Créer'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Matricule</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.id}>
                     <TableCell>
                       <div className="flex items-center gap-3">
                         <Avatar className="w-8 h-8">
                           <AvatarImage src={user.photo_url} />
                           <AvatarFallback>
                             <User className="w-4 h-4" />
                           </AvatarFallback>
                         </Avatar>
                         <div>
                           <p className="font-medium">{user.prenom} {user.nom}</p>
                           {user.department && (
                             <p className="text-sm text-muted-foreground flex items-center gap-1">
                               <MapPin className="w-3 h-3" />
                               {user.department}
                             </p>
                           )}
                         </div>
                       </div>
                     </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {user.matricule || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-medium">
                        {user.role_name || 'Aucun'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(user.statut)}
                    </TableCell>
                    <TableCell>
                      {getTypeBadge(user.type_compte)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(user)}
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                          title="Supprimer"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de modification */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 overflow-y-auto max-h-[70vh]">
            {/* Photo de profil */}
            <div className="space-y-2">
              <Label>Photo de profil</Label>
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={previewUrl || formData.photo_url} />
                  <AvatarFallback>
                    <User className="w-8 h-8" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="photo-upload-edit"
                  />
                  <Label htmlFor="photo-upload-edit" className="cursor-pointer">
                    <Button type="button" variant="outline" size="sm" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Changer la photo
                      </span>
                    </Button>
                  </Label>
                  {uploading && <p className="text-sm text-muted-foreground">Upload en cours...</p>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-prenom">Prénom *</Label>
                <Input
                  id="edit-prenom"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  placeholder="Prénom"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-nom">Nom *</Label>
                <Input
                  id="edit-nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Nom"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemple.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-matricule">Matricule</Label>
                <Input
                  id="edit-matricule"
                  value={formData.matricule}
                  onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                  placeholder="Matricule"
                  className="bg-muted/50"
                />
              </div>
            </div>

            {/* Mots de passe */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-password">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="edit-password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    placeholder="Laisser vide pour conserver"
                    className={!passwordValidation.isValid && formData.password ? "border-destructive" : ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {!passwordValidation.isValid && formData.password && (
                  <div className="text-xs text-destructive space-y-1">
                    {passwordValidation.errors.map((error, index) => (
                      <p key={index}>• {error}</p>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-confirmPassword">Confirmer le nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="edit-confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                    placeholder="Confirmer le nouveau mot de passe"
                    className={!passwordMatch && formData.confirmPassword ? "border-destructive" : ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {!passwordMatch && formData.confirmPassword && (
                  <p className="text-xs text-destructive">Les mots de passe ne correspondent pas</p>
                )}
              </div>
            </div>

            {/* Critères de validation du mot de passe si password rempli */}
            {formData.password && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm font-medium mb-2">Critères du mot de passe :</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Minimum 8 caractères</li>
                  <li>• Au moins une majuscule (A-Z)</li>
                  <li>• Au moins une minuscule (a-z)</li>
                  <li>• Au moins un chiffre (0-9)</li>
                  <li>• Au moins un caractère spécial (!@#$%^&*)</li>
                </ul>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-role">Rôle</Label>
                <Select value={formData.role_id} onValueChange={(value) => setFormData({ ...formData, role_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles?.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-statut">Statut</Label>
                <Select value={formData.statut} onValueChange={(value: any) => setFormData({ ...formData, statut: value })}>
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
              <div className="space-y-2">
                <Label htmlFor="edit-type_compte">Type de compte</Label>
                <Select value={formData.type_compte} onValueChange={(value: any) => setFormData({ ...formData, type_compte: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employe">Employé</SelectItem>
                    <SelectItem value="gestionnaire">Gestionnaire</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-telephone">Téléphone</Label>
                <Input
                  id="edit-telephone"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  placeholder="Téléphone"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-date_embauche">Date d'embauche</Label>
                <Input
                  id="edit-date_embauche"
                  type="date"
                  value={formData.date_embauche}
                  onChange={(e) => setFormData({ ...formData, date_embauche: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-department">Adresse</Label>
                <Input
                  id="edit-department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Adresse"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleUpdate}
              disabled={updateUser.isPending || !formData.email || !formData.prenom || !formData.nom}
            >
              {updateUser.isPending ? 'Mise à jour...' : 'Mettre à jour'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UtilisateursInternes;