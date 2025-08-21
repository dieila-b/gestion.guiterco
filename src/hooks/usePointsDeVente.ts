// Import hook ultra-optimisé
import { useFastPointsDeVente } from './useUltraOptimizedHooks';

export interface PointDeVente {
  id: string;
  nom: string;
  adresse?: string;
  type_pdv?: string;
  responsable?: string;
  statut: string;
  created_at?: string;
  updated_at?: string;
}

// Utiliser le hook ultra-optimisé
export const usePointsDeVente = useFastPointsDeVente;