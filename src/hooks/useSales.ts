
// Re-export all sales-related hooks for backward compatibility
export * from './useSalesQueries';
export * from './useSalesMutations';
export * from './useSalesOptimized';
export type * from '@/types/sales-mutations';

// Ajouter les nouvelles mutations
export * from './sales/mutations/useFactureVenteMutations';

// Re-export des queries spécifiques
export * from './sales/queries/useFacturesVenteQuery';
