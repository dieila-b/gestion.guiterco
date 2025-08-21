
// Import hook optimisé
import { useFastCatalogue } from './useUltraOptimizedHooks';

export interface Article {
  id: string;
  nom: string;
  reference: string;
  prix_achat?: number;
  prix_vente?: number;
  prix_unitaire?: number; // Maintenu pour compatibilité
  categorie?: string;
  unite_mesure?: string;
  description?: string;
  image_url?: string;
  statut?: string;
  seuil_alerte?: number;
  categorie_id?: string;
  unite_id?: string;
}

// Utiliser le hook ultra-optimisé
export const useCatalogue = useFastCatalogue;

// Re-export optimized version
export * from './useCatalogueOptimized';
