// This file now re-exports individual sales query hooks.
// This approach improves modularity and maintainability.

export * from './sales/queries/useClientsQuery';
export * from './sales/queries/useCommandesClientsQuery';
export * from './sales/queries/useFacturesVenteQuery';
export * from './sales/queries/usePrecommandesQuery';
export * from './sales/queries/useFacturesPrecommandesQuery';
export * from './sales/queries/useVersementsClientsQuery';
export * from './sales/queries/useDevisVenteQuery';
export * from './sales/queries/useRetoursClientsQuery';

// Ensure all type exports that were previously here are still available or moved appropriately.
// For now, assuming types are primarily defined and exported from '@/types/sales'.
// If useSalesQueries.ts previously exported its own types, those would need to be handled.
// Based on the original file, it primarily imported types, so this should be fine.
