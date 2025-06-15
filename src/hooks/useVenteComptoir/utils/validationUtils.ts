
// Utility functions for validation
export const isValidUUID = (uuid: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const validateVenteData = (venteData: any) => {
  if (!isValidUUID(venteData.client_id)) {
    throw new Error(`ID client invalide: ${venteData.client_id}. Veuillez sélectionner un client valide.`);
  }

  if (!venteData.articles || venteData.articles.length === 0) {
    throw new Error('Aucun article dans le panier.');
  }

  if (venteData.montant_total <= 0) {
    throw new Error('Le montant total doit être supérieur à 0.');
  }

  if (venteData.montant_paye < 0) {
    throw new Error('Le montant payé ne peut pas être négatif.');
  }
};
