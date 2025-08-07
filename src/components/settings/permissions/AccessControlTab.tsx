
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, User, Lock, Eye } from 'lucide-react';
import { useUsersWithRoles } from '@/hooks/usePermissionsSystem';

export default function AccessControlTab() {
  const { data: usersWithRoles = [], isLoading } = useUsersWithRoles();

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName?.toLowerCase()) {
      case 'administrateur':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'vendeur':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'caissier':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadgeColor = (statut: string) => {
    switch (statut) {
      case 'actif':
        return 'bg-green-100 text-green-800';
      case 'inactif':
        return 'bg-gray-100 text-gray-800';
      case 'suspendu':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Chargement du contrôle d'accès...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Contrôle d'accès utilisateurs</h3>
          <p className="text-sm text-muted-foreground">
            Vue d'ensemble des accès accordés aux utilisateurs internes
          </p>
        </div>
        <Badge variant="outline">
          {usersWithRoles.length} utilisateur(s)
        </Badge>
      </div>

      <div className="grid gap-4">
        {usersWithRoles.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      {user.prenom} {user.nom}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="outline" 
                    className={getRoleBadgeColor(user.role?.name || '')}
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    {user.role?.name || 'Aucun rôle'}
                  </Badge>
                  <Badge 
                    variant="outline"
                    className={getStatusBadgeColor(user.statut)}
                  >
                    {user.statut}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Informations utilisateur
                  </p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Matricule:</span>
                      <span className="font-mono">{user.matricule}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Type de compte:</span>
                      <span className="capitalize">{user.type_compte}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Niveau d'accès
                  </p>
                  <div className="space-y-2">
                    {user.role?.name === 'Administrateur' && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Lock className="h-4 w-4 text-red-500" />
                        <span>Accès administrateur complet</span>
                      </div>
                    )}
                    {user.role?.name === 'Manager' && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Eye className="h-4 w-4 text-blue-500" />
                        <span>Gestion ventes et stock</span>
                      </div>
                    )}
                    {user.role?.name === 'Vendeur' && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Eye className="h-4 w-4 text-green-500" />
                        <span>Ventes et consultation</span>
                      </div>
                    )}
                    {user.role?.name === 'Caissier' && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Eye className="h-4 w-4 text-purple-500" />
                        <span>Caisse et ventes comptoir</span>
                      </div>
                    )}
                    {!user.role && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Lock className="h-4 w-4" />
                        <span>Aucun accès défini</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {usersWithRoles.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun utilisateur trouvé</h3>
              <p className="text-muted-foreground">
                Aucun utilisateur interne n'est actuellement configuré dans le système.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
