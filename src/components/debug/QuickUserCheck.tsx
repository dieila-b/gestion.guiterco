
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUtilisateursInternes } from '@/hooks/useUtilisateursInternes';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, Users, Database } from 'lucide-react';

export const QuickUserCheck: React.FC = () => {
  const { data: users, isLoading, error } = useUtilisateursInternes();

  const testDirectQuery = async () => {
    console.log('🧪 Test requête directe...');
    
    const { data, error } = await supabase
      .from('utilisateurs_internes')
      .select('id, email, prenom, nom, statut, created_at')
      .limit(10);
    
    console.log('Résultat direct:', { data, error, count: data?.length });
    
    if (data && data.length > 0) {
      console.log('Premier utilisateur:', data[0]);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Vérification rapide - Utilisateurs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-slate-50 rounded">
            <div className="font-medium">État du hook</div>
            <div>Loading: {isLoading ? '✅' : '❌'}</div>
            <div>Error: {error ? '✅' : '❌'}</div>
            <div>Data: {users ? '✅' : '❌'}</div>
          </div>
          
          <div className="p-3 bg-blue-50 rounded">
            <div className="font-medium">Données</div>
            <div>Utilisateurs: {users?.length || 0}</div>
            <div>Erreur: {error?.message || 'Aucune'}</div>
          </div>
          
          <div className="p-3 bg-green-50 rounded">
            <div className="font-medium">Actions</div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={testDirectQuery}
              className="w-full"
            >
              <Database className="h-4 w-4 mr-1" />
              Test direct
            </Button>
          </div>
        </div>

        {users && users.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Utilisateurs trouvés:</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {users.slice(0, 5).map((user) => (
                <div key={user.id} className="text-xs p-2 bg-gray-50 rounded">
                  {user.prenom} {user.nom} ({user.email}) - {user.statut}
                </div>
              ))}
              {users.length > 5 && (
                <div className="text-xs text-muted-foreground">
                  ... et {users.length - 5} autres
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
            <div className="flex items-center gap-2 text-red-800 font-medium">
              <AlertCircle className="h-4 w-4" />
              Erreur détectée
            </div>
            <div className="text-red-700 text-sm mt-1">{error.message}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
