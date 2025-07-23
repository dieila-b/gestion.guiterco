
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Edit, Trash2, Shield, Users } from 'lucide-react'
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole } from '@/hooks/usePermissions'
import { toast } from 'sonner'

export default function RolesManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_system: false
  })

  const { data: roles = [], isLoading } = useRoles()
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()
  const deleteRole = useDeleteRole()

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error('Le nom du rôle est requis')
      return
    }

    try {
      await createRole.mutateAsync(formData)
      setIsCreateOpen(false)
      setFormData({ name: '', description: '', is_system: false })
    } catch (error) {
      // L'erreur est déjà gérée par le hook
    }
  }

  const handleEdit = (role: any) => {
    setSelectedRole(role)
    setFormData({
      name: role.name,
      description: role.description || '',
      is_system: role.is_system || false
    })
    setIsEditOpen(true)
  }

  const handleUpdate = async () => {
    if (!selectedRole || !formData.name.trim()) {
      toast.error('Le nom du rôle est requis')
      return
    }

    try {
      await updateRole.mutateAsync({
        id: selectedRole.id,
        ...formData
      })
      setIsEditOpen(false)
      setSelectedRole(null)
      setFormData({ name: '', description: '', is_system: false })
    } catch (error) {
      // L'erreur est déjà gérée par le hook
    }
  }

  const handleDelete = async (roleId: string, roleName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le rôle "${roleName}" ?`)) {
      try {
        await deleteRole.mutateAsync(roleId)
      } catch (error) {
        // L'erreur est déjà gérée par le hook
      }
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
              Gestion des Rôles
            </CardTitle>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau Rôle
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer un nouveau rôle</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nom du rôle</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Gestionnaire de stock"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Description du rôle et de ses responsabilités"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleCreate} disabled={createRole.isPending}>
                      {createRole.isPending ? 'Création...' : 'Créer'}
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
                <TableHead>Nom</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {role.is_system && <Shield className="w-4 h-4 text-amber-500" />}
                      {role.name}
                    </div>
                  </TableCell>
                  <TableCell>{role.description || 'Aucune description'}</TableCell>
                  <TableCell>
                    <Badge variant={role.is_system ? 'default' : 'secondary'}>
                      {role.is_system ? 'Système' : 'Personnalisé'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(role)}
                        disabled={role.is_system}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(role.id, role.name)}
                        disabled={role.is_system}
                      >
                        <Trash2 className="w-4 h-4" />
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le rôle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nom du rôle</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Gestionnaire de stock"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du rôle et de ses responsabilités"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleUpdate} disabled={updateRole.isPending}>
                {updateRole.isPending ? 'Mise à jour...' : 'Mettre à jour'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
