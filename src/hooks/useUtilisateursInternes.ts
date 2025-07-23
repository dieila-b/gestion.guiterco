
// Hook temporaire pour maintenir la compatibilité
export interface UtilisateurInterne {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  role: {
    id: string;
    name: string;
  } | null;
  statut: string;
}

export const useUtilisateursInternes = () => {
  return {
    data: [],
    isLoading: false,
    error: null,
    refetch: () => Promise.resolve()
  };
};

export const useDeleteUtilisateurInterne = () => {
  return {
    mutate: (id: string) => {
      console.log('⚠️ Système d\'utilisateurs internes supprimé');
    },
    isLoading: false
  };
};
