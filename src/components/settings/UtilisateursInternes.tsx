
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users, Mail, Phone, Edit, UserCheck, UserX } from 'lucide-react'
import { useUtilisateursInternes } from '@/hooks/useUtilisateursInternes'
import { useRealTimeUserManagement } from '@/hooks/useRealTimeUserManagement'
import CreateUserDialog from './CreateUserDialog'
import EditUserDialog from './EditUserDialog'
import { Button } from '@/components/ui/button'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export default function UtilisateursInternes() {
  const { data: users = [], isLoading } = useUtilisateursInternes()
  const queryClient = useQueryClient()
  
  // Activer la synchronisation en temps réel
  useRealTimeUserManagement()

  // Mutation pour mettre à jour le statut d'un utilisateur
  const updateUserStatus = useMutation({
    mutationFn: async ({ userId, newStatus }: { userId: string; newStatus: string }) => {
      const { error } = await supabase
        .from('utilisateurs_internes')
        .update({ statut: newStatus })
        .eq('id', userId)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] })
      toast.success('Statut utilisateur mis à jour')
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la mise à jour: ' + error.message)
    }
  })

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

  const handleToggleStatus = (user: any) => {
    const newStatus = user.statut === 'actif' ? 'suspendu' : 'actif'
    updateUserStatus.mutate({ userId: user.id, newStatus })
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
            <CreateUserDialog onUserCreated={() => {
              queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] })
            }} />
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
                    {user.role?.name && (
                      <Badge variant="outline">
                        {user.role.name}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(user.statut)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <EditUserDialog user={user} onUserUpdated={() => {
                        queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] })
                      }}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </EditUserDialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(user)}
                        disabled={updateUserStatus.isPending}
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
    </div>
  )
}
