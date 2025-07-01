
import { supabase } from '@/integrations/supabase/client';

// Cache pour les statuts de livraison pour éviter les requêtes répétées
let livraisonStatutsCache: { [key: string]: number } | null = null;

const loadLivraisonStatuts = async () => {
  if (livraisonStatutsCache) {
    return livraisonStatutsCache;
  }

  const { data, error } = await supabase
    .from('livraison_statut')
    .select('id, nom');

  if (error) {
    console.error('❌ Erreur lors du chargement des statuts de livraison:', error);
    // Valeurs par défaut en cas d'erreur
    return {
      'en_attente': 1,
      'partiellement_livree': 2,
      'livree': 3
    };
  }

  // Créer un mapping nom -> id
  const statuts: { [key: string]: number } = {};
  data.forEach(statut => {
    switch (statut.nom.toLowerCase()) {
      case 'en attente':
        statuts['en_attente'] = statut.id;
        break;
      case 'partiellement livrée':
        statuts['partiellement_livree'] = statut.id;
        break;
      case 'livrée':
        statuts['livree'] = statut.id;
        break;
    }
  });

  livraisonStatutsCache = statuts;
  return statuts;
};

export const mapDeliveryStatus = async (paymentData: any): Promise<number> => {
  console.log('📦 Statut livraison demandé:', paymentData?.statut_livraison);
  
  const statuts = await loadLivraisonStatuts();
  
  let statutId = statuts['en_attente']; // Valeur par défaut
  
  if (paymentData && paymentData.statut_livraison) {
    // Mapper exactement les valeurs sélectionnées vers les IDs
    switch (paymentData.statut_livraison) {
      case 'livree':
      case 'livre':
      case 'complete':
        statutId = statuts['livree'];
        console.log('✅ Livraison complète - Statut ID défini:', statutId);
        break;
      case 'partiellement_livree':
      case 'partielle':
        statutId = statuts['partiellement_livree'];
        console.log('📦 Livraison partielle - Statut ID défini:', statutId);
        break;
      case 'en_attente':
      default:
        statutId = statuts['en_attente'];
        console.log('⏳ Livraison en attente - Statut ID défini:', statutId);
    }
  }

  console.log('📦 STATUT FINAL DE LIVRAISON ID CONFIRMÉ:', statutId);
  return statutId;
};

// Nouvelle fonction pour mapper les IDs vers les noms
export const mapDeliveryStatusIdToName = async (statutId: number): Promise<string> => {
  const { data, error } = await supabase
    .from('livraison_statut')
    .select('nom')
    .eq('id', statutId)
    .single();

  if (error || !data) {
    console.error('❌ Erreur lors de la récupération du nom du statut:', error);
    return 'En attente'; // Fallback
  }

  return data.nom;
};

// Fonction pour mapper les noms vers les IDs (pour les mises à jour)
export const mapDeliveryStatusNameToId = async (statutNom: string): Promise<number> => {
  const statuts = await loadLivraisonStatuts();
  
  switch (statutNom.toLowerCase()) {
    case 'livree':
    case 'livrée':
      return statuts['livree'];
    case 'partiellement_livree':
    case 'partiellement livrée':
      return statuts['partiellement_livree'];
    case 'en_attente':
    default:
      return statuts['en_attente'];
  }
};
