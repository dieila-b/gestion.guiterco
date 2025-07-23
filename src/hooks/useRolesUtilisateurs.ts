
// Hook temporaire pour maintenir la compatibilité
export interface RoleUtilisateur {
  id: string;
  nom: string;
  description: string;
  is_system: boolean;
}

export const useRolesUtilisateurs = () => {
  return {
    data: [],
    isLoading: false,
    error: null
  };
};
