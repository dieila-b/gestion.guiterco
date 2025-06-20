
// Re-export all sales-related hooks for backward compatibility
export * from './useSalesQueries';
export * from './useSalesMutations';
export * from './useSalesOptimized';
export type * from '@/types/sales-mutations';

// Ajouter les nouvelles mutations refactorisées
export * from './sales/mutations';

// Re-export des queries spécifiques
export * from './sales/queries/useFacturesVenteQuery';

// Export des hooks précommandes
export * from './precommandes/usePrecommandesComplete';
export * from './precommandes/useNotificationsPrecommandes';
export * from './precommandes/usePrecommandeMutations';
export * from './precommandes/useStockDisponibilite';
