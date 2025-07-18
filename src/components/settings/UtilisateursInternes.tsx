
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUtilisateursInternes } from '@/hooks/useUtilisateursInternes';
import { useRealTimeRoles } from '@/hooks/useRealTimeRoles';
import UsersHeader from './users/UsersHeader';
import UsersTable from './users/UsersTable';
import UsersErrorState from './users/UsersErrorState';
import UsersLoadingState from './users/UsersLoadingState';

const UtilisateursInternes = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Activer la synchronisation temps réel
  useRealTimeRoles();

  // Récupérer les utilisateurs internes avec les rôles unifiés
  const { data: utilisateurs, isLoading, error } = useUtilisateursInternes();

  // Mutation pour supprimer un utilisateur
  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('utilisateurs_internes')
        .delete()
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
      toast({ title: "Utilisateur supprimé avec succès" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erreur", 
        description: error.message || "Impossible de supprimer l'utilisateur",
        variant: "destructive" 
      });
    }
  });

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      deleteUser.mutate(id);
    }
  };

  const handleUserCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
  };

  const handleUserUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
  };

  // Afficher l'erreur s'il y en a une
  if (error) {
    return <UsersErrorState error={error} onUserCreated={handleUserCreated} />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <UsersHeader onUserCreated={handleUserCreated} />
        <CardContent>
          {isLoading ? (
            <UsersLoadingState />
          ) : (
            <>
              {utilisateurs && utilisateurs.length > 0 && (
                <div className="mb-4 text-sm text-muted-foreground">
                  {utilisateurs.length} utilisateur{utilisateurs.length > 1 ? 's' : ''} trouvé{utilisateurs.length > 1 ? 's' : ''}
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    ✅ Synchronisation temps réel activée
                  </span>
                </div>
              )}
              
              <UsersTable
                utilisateurs={utilisateurs}
                onDelete={handleDelete}
                onUserUpdated={handleUserUpdated}
                isDeleting={deleteUser.isPending}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UtilisateursInternes;
