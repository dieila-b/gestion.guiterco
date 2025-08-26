
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUtilisateursInternes } from '@/hooks/useUtilisateursInternes';
import { useAuth } from '@/components/auth/AuthContext';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';

export const SimpleUserDiagnostic: React.FC = () => {
  const { data: users, isLoading, error, refetch } = useUtilisateursInternes();
  const { user, utilisateurInterne, isDevMode, loading: authLoading } = useAuth();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Diagnostic simple - Utilisateurs internes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Auth Status:</strong>
            <div>Mode dev: {isDevMode ? 'Oui' : 'Non'}</div>
            <div>Auth loading: {authLoading ? 'Oui' : 'Non'}</div>
            <div>User: {user?.email || 'Non connecté'}</div>
            <div>User interne: {utilisateurInterne?.email || 'Non'}</div>
          </div>
          
          <div>
            <strong>Data Status:</strong>
            <div>Loading: {isLoading ? 'Oui' : 'Non'}</div>
            <div>Erreur: {error ? 'Oui' : 'Non'}</div>
            <div>Utilisateurs: {users?.length || 0}</div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <div className="text-red-800 text-sm">
              <strong>Erreur:</strong> {error.message}
            </div>
          </div>
        )}

        {users && users.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <div className="text-green-800 text-sm">
              <strong>Utilisateurs chargés:</strong>
              <ul className="mt-2 space-y-1">
                {users.slice(0, 3).map(u => (
                  <li key={u.id}>• {u.prenom} {u.nom} ({u.email}) - {u.role_name}</li>
                ))}
                {users.length > 3 && <li>... et {users.length - 3} autres</li>}
              </ul>
            </div>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Recharger
        </Button>
      </CardContent>
    </Card>
  );
};
