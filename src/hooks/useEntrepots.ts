// Import hook ultra-optimisé
import { useFastEntrepots } from './useUltraOptimizedHooks';

export interface Entrepot {
  id: string;
  nom: string;
  adresse?: string;
  capacite_max?: number;
  gestionnaire?: string;
  statut: string;
  created_at?: string;
  updated_at?: string;
}

// Utiliser le hook ultra-optimisé
export const useEntrepots = useFastEntrepots;