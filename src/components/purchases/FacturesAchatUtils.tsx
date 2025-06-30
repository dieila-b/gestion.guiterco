
export const getStatusBadgeColor = (statut: string) => {
  switch (statut) {
    case 'en_attente': return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'paye': return 'bg-green-100 text-green-800 border-green-300';
    case 'partiellement_paye': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'en_retard': return 'bg-red-100 text-red-800 border-red-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

export const getStatusLabel = (statut: string) => {
  switch (statut) {
    case 'en_attente': return 'Non réglé';
    case 'paye': return 'Réglé';
    case 'partiellement_paye': return 'Partiel';
    case 'en_retard': return 'En retard';
    default: return statut;
  }
};
