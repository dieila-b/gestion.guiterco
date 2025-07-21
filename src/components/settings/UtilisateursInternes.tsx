
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Plus, Edit, Trash2, Users, Mail, Phone, UserCheck, UserX } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { useRoles, useUserRoles, useAssignUserRole, useRevokeUserRole } from '@/hooks/usePermissions'

interface UtilisateurInterne {
  id: string
  user_id: string
  prenom: string
  nom: string
  email: string
  telephone: string | null
  matricule: string | null
  statut: string
  photo_url: string | null
  role_id: string | null
  created_at: string
  updated_at: string
}

export default function UtilisateursInternes() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UtilisateurInterne | null>(null)
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    statut: 'actif',
    role_id: ''
  })

  const queryClient = useQueryClient()
  const { data: roles = [] } = useRoles()
  const assignUserRole = useAssignUserRole()
  const revokeUserRole = useRevokeUserRole()

  // Récupération des utilisateurs internes
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['utilisateurs-internes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('utilisateurs_internes')
        .select(`
          *,
          user_roles!inner (
            id,
            role_id,
            is_active,
            roles!inner (
              id,
              name
            )
          )
        `)
        .order('nom')
      
      if (error) throw error
      return data as any[]
    }
  })

  // Mutation pour créer un utilisateur
  const createUser = useMutation({
    mutationFn: async (userData: any) => {
      // Créer l'utilisateur dans Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: 'TempPassword123!', // Mot de passe temporaire
        email_confirm: true
      })

      if (authError) throw authError

      // Créer le profil utilisateur interne
      const { data, error } = await supabase
        .from('utilisateurs_internes')
        .insert([{
          user_id: authData.user.id,
          prenom: userData.prenom,
          nom: userData.nom,
          email: userData.email,
          telephone: userData.telephone,
          statut: userData.statut,
          doit_changer_mot_de_passe: true
        }])
        .select()
        .single()

      if (error) throw error

      // Attribuer le rôle si spécifié
      if (userData.role_id) {
        await supabase
          .from('user_roles')
          .insert([{
            user_id: authData.user.id,
            role_id: userData.role_id,
            is_active: true
          }])
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] })
      toast.success('Utilisateur créé avec succès')
      setIsCreateOpen(false)
      setFormData({
        prenom: '',
        nom: '',
        email: '',
        telephone: '',
        statut: 'actif',
        role_id: ''
      })
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la création: ' + error.message)
    }
  })

  // Mutation pour mettre à jour un utilisateur
  const updateUser = useMutation({
    mutationFn: async (userData: any) => {
      const { data, error } = await supabase
        .from('utilisateurs_internes')
        .update({
          prenom: userData.prenom,
          nom: userData.nom,
          email: userData.email,
          telephone: userData.telephone,
          statut: userData.statut
        })
        .eq('id', userData.id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] })
      toast.success('Utilisateur mis à jour avec succès')
      setIsEditOpen(false)
      setSelectedUser(null)
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la mise à jour: ' + error.message)
    }
  })

  const handleCreate = async () => {
    if (!formData.prenom.trim() || !formData.nom.trim() || !formData.email.trim()) {
      toast.error('Les champs prénom, nom et email sont requis')
      return
    }

    await createUser.mutateAsync(formData)
  }

  const handleEdit = (user: UtilisateurInterne) => {
    setSelectedUser(user)
    setFormData({
      prenom: user.prenom,
      nom: user.nom,
      email: user.email,
      telephone: user.telephone || '',
      statut: user.statut,
      role_id: user.role_id || ''
    })
    setIsEditOpen(true)
  }

  const handleUpdate = async () => {
    if (!selectedUser || !formData.prenom.trim() || !formData.nom.trim() || !formData.email.trim()) {
      toast.error('Les champs prénom, nom et email sont requis')
      return
    }

    await updateUser.mutateAsync({
      id: selectedUser.id,
      ...formData
    })
  }

  const getInitials = (prenom: string, nom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase()
  }

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'actif':
        return <Badge variant="default" className="bg-green-100 text-green-800">Actif</Badge>
      case 'inactif':
        return <Badge variant="secondary">Inactif</Badge>
      case 'suspendu':
        return <Badge variant="destructive">Suspendu</Badge>
      default:
        return <Badge variant="outline">{statut}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Utilisateurs Internes
            </CardTitle>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvel Utilisateur
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="prenom">Prénom</Label>
                      <Input
                        id="prenom"
                        value={formData.prenom}
                        onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="nom">Nom</Label>
                      <Input
                        id="nom"
                        value={formData.nom}
                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="telephone">Téléphone</Label>
                    <Input
                      id="telephone"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Rôle</Label>
                    <Select value={formData.role_id} onValueChange={(value) => setFormData({ ...formData, role_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(role => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleCreate} disabled={createUser.isPending}>
                      {createUser.isPending ? 'Création...' : 'Créer'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.photo_url || undefined} />
                        <AvatarFallback>{getInitials(user.prenom, user.nom)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.prenom} {user.nom}</div>
                        {user.matricule && (
                          <div className="text-sm text-muted-foreground">
                            Mat: {user.matricule}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4" />
                        {user.email}
                      </div>
                      {user.telephone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          {user.telephone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.user_roles?.[0]?.roles?.name && (
                      <Badge variant="outline">
                        {user.user_roles[0].roles.name}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(user.statut)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (user.statut === 'actif') {
                            updateUser.mutate({
                              id: user.id,
                              ...user,
                              statut: 'suspendu'
                            })
                          } else {
                            updateUser.mutate({
                              id: user.id,
                              ...user,
                              statut: 'actif'
                            })
                          }
                        }}
                      >
                        {user.statut === 'actif' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog d'édition */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-prenom">Prénom</Label>
                <Input
                  id="edit-prenom"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-nom">Nom</Label>
                <Input
                  id="edit-nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-telephone">Téléphone</Label>
              <Input
                id="edit-telephone"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-statut">Statut</Label>
              <Select value={formData.statut} onValueChange={(value) => setFormData({ ...formData, statut: value })}>
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
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleUpdate} disabled={updateUser.isPending}>
                {updateUser.isPending ? 'Mise à jour...' : 'Mettre à jour'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
