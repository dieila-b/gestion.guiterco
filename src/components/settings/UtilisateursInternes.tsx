
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUtilisateursInternes } from '@/hooks/useUtilisateursInternes';
import { useRealTimeUserManagement } from '@/hooks/useRealTimeUserManagement';
import UsersHeader from './users/UsersHeader';
import UsersTable from './users/UsersTable';
import UsersErrorState from './users/UsersErrorState';
import UsersLoadingState from './users/UsersLoadingState';

const UtilisateursInternes = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Activer la synchronisation temps réel complète
  useRealTimeUserManagement();

  // Récupérer les utilisateurs internes avec les rôles unifiés
  const { data: utilisateurs, isLoading, error } = useUtilisateursInternes();

  // Mutation pour supprimer un utilisateur
  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      console.log('🗑️ Deleting user:', userId);
      
      // Supprimer d'abord les rôles associés
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', (await supabase
          .from('utilisateurs_internes')
          .select('user_id')
          .eq('id', userId)
          .single()
        ).data?.user_id);

      if (roleError) {
        console.warn('⚠️ Warning deleting user roles:', roleError);
      }

      // Supprimer l'utilisateur interne
      const { error } = await supabase
        .from('utilisateurs_internes')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      
      console.log('✅ User deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast({ title: "Utilisateur supprimé avec succès" });
    },
    onError: (error: any) => {
      console.error('❌ Error deleting user:', error);
      toast({ 
        title: "Erreur", 
        description: error.message || "Impossible de supprimer l'utilisateur",
        variant: "destructive" 
      });
    }
  });

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
      deleteUser.mutate(id);
    }
  };

  const handleUserCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
    queryClient.invalidateQueries({ queryKey: ['user-roles'] });
  };

  const handleUserUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
    queryClient.invalidateQueries({ queryKey: ['user-roles'] });
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
                    ✅ Synchronisation temps réel complète activée
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
