
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDiagnosticUtilisateurs } from '@/hooks/useDiagnosticUtilisateurs';
import { useUtilisateursInternes } from '@/hooks/useUtilisateursInternes';
import { useAuth } from '@/components/auth/AuthContext';
import { Loader2, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const UserLoadingDiagnostic: React.FC = () => {
  const { refetch: runDiagnostic, data: diagnostic, isLoading: diagnosticLoading } = useDiagnosticUtilisateurs();
  const { data: users, isLoading: usersLoading, error: usersError, refetch: refetchUsers } = useUtilisateursInternes();
  const { user, utilisateurInterne, isDevMode } = useAuth();

  const getStatusIcon = (accessible: boolean, error?: string) => {
    if (error) return <XCircle className="h-4 w-4 text-red-500" />;
    if (accessible) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <AlertCircle className="h-4 w-4 text-yellow-500" />;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Diagnostic de chargement des utilisateurs
          </CardTitle>
          <CardDescription>
            Diagnostic pour résoudre les problèmes de chargement infini
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* État de l'authentification */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Authentification</h4>
              <div className="text-sm space-y-1">
                <div className="flex items-center gap-2">
                  {getStatusIcon(!!user)}
                  <span>Utilisateur connecté: {user?.email || 'Non'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(!!utilisateurInterne)}
                  <span>Utilisateur interne: {utilisateurInterne?.prenom} {utilisateurInterne?.nom || 'Non'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(isDevMode)}
                  <span>Mode développement: {isDevMode ? 'Oui' : 'Non'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Chargement des utilisateurs</h4>
              <div className="text-sm space-y-1">
                <div className="flex items-center gap-2">
                  {usersLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : getStatusIcon(!usersError)}
                  <span>État: {usersLoading ? 'Chargement...' : usersError ? 'Erreur' : 'Chargé'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(!!users && users.length > 0)}
                  <span>Utilisateurs trouvés: {users?.length || 0}</span>
                </div>
                {usersError && (
                  <div className="text-red-600 text-xs mt-1">
                    Erreur: {usersError.message}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Diagnostic des tables */}
          {diagnostic && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Diagnostic des tables Supabase</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(diagnostic.direct_table_accessible, diagnostic.direct_table_error)}
                    <span>Table directe</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Count: {diagnostic.direct_table_count}
                  </div>
                  {diagnostic.direct_table_error && (
                    <div className="text-xs text-red-600">
                      {diagnostic.direct_table_error}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(diagnostic.view_accessible, diagnostic.view_error)}
                    <span>Vue optimisée</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Count: {diagnostic.view_count}
                  </div>
                  {diagnostic.view_error && (
                    <div className="text-xs text-red-600">
                      {diagnostic.view_error}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(diagnostic.roles_accessible, diagnostic.roles_error)}
                    <span>Table des rôles</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Count: {diagnostic.roles_count}
                  </div>
                  {diagnostic.roles_error && (
                    <div className="text-xs text-red-600">
                      {diagnostic.roles_error}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => runDiagnostic()}
              disabled={diagnosticLoading}
            >
              {diagnosticLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Lancer diagnostic
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchUsers()}
              disabled={usersLoading}
            >
              {usersLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Recharger utilisateurs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
