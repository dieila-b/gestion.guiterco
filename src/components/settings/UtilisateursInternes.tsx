
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import UsersHeader from './users/UsersHeader';
import UsersTable from './users/UsersTable';
import UsersErrorState from './users/UsersErrorState';
import UsersLoadingState from './users/UsersLoadingState';

interface UtilisateurInterne {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  photo_url?: string;
  statut: string;
  doit_changer_mot_de_passe: boolean;
  created_at: string;
  role_id?: string;
  role: {
    nom: string;
    description: string;
  } | null;
}

const UtilisateursInternes = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupérer les utilisateurs internes
  const { data: utilisateurs, isLoading, error } = useQuery({
    queryKey: ['utilisateurs-internes'],
    queryFn: async () => {
      console.log('🔍 Chargement des utilisateurs internes...');
      
      const { data, error } = await supabase
        .from('utilisateurs_internes')
        .select(`
          *,
          role:role_id (
            nom,
            description
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur lors du chargement des utilisateurs:', error);
        throw error;
      }

      console.log('✅ Utilisateurs chargés:', data?.length || 0, 'utilisateurs trouvés');
      return data as UtilisateurInterne[];
    }
  });

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
