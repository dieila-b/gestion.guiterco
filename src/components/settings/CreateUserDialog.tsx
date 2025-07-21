
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Plus, UserPlus } from 'lucide-react'
import { useRolesForUsers } from '@/hooks/useUtilisateursInternes'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

interface CreateUserDialogProps {
  onUserCreated: () => void
}

export default function CreateUserDialog({ onUserCreated }: CreateUserDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    password: '',
    telephone: '',
    adresse: '',
    photo_url: '',
    role_id: '',
    doit_changer_mot_de_passe: false,
    statut: 'actif'
  })

  const { data: roles = [], isLoading: rolesLoading } = useRolesForUsers()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!formData.prenom || !formData.nom || !formData.email || !formData.password || !formData.role_id) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      setIsLoading(false)
      return
    }

    try {
      console.log('🚀 Envoi des données à create-internal-user:', formData)
      
      const { data, error } = await supabase.functions.invoke('create-internal-user', {
        body: formData
      })

      if (error) {
        console.error('❌ Erreur Edge Function:', error)
        throw new Error(`Erreur Edge Function: ${error.message}`)
      }

      if (!data?.success) {
        console.error('❌ Échec de création:', data)
        throw new Error(data?.error || 'Erreur lors de la création de l\'utilisateur')
      }

      console.log('✅ Utilisateur créé avec succès:', data.user)
      
      toast.success('Utilisateur créé avec succès')
      onUserCreated()
      setIsOpen(false)
      setFormData({
        prenom: '',
        nom: '',
        email: '',
        password: '',
        telephone: '',
        adresse: '',
        photo_url: '',
        role_id: '',
        doit_changer_mot_de_passe: false,
        statut: 'actif'
      })
    } catch (error: any) {
      console.error('❌ Erreur lors de la création:', error)
      toast.error(error.message || 'Erreur lors de la création de l\'utilisateur')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nouvel utilisateur
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Créer un nouvel utilisateur interne
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prenom">Prénom *</Label>
              <Input
                id="prenom"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="nom">Nom *</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Mot de passe *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
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
            <Label htmlFor="adresse">Adresse</Label>
            <Input
              id="adresse"
              value={formData.adresse}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="role_id">Rôle *</Label>
            <Select
              value={formData.role_id}
              onValueChange={(value) => setFormData({ ...formData, role_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="photo_url">URL de la photo</Label>
            <Input
              id="photo_url"
              value={formData.photo_url}
              onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="doit_changer_mot_de_passe"
              checked={formData.doit_changer_mot_de_passe}
              onCheckedChange={(checked) => setFormData({ ...formData, doit_changer_mot_de_passe: checked })}
            />
            <Label htmlFor="doit_changer_mot_de_passe">
              Doit changer le mot de passe à la première connexion
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || rolesLoading}>
              {isLoading ? 'Création...' : 'Créer l\'utilisateur'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
