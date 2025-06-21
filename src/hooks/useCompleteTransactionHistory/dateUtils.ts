
import type { CompleteTransactionFilters } from './types';

export const buildDateRange = (filters: CompleteTransactionFilters) => {
  let startDate: Date;
  let endDate: Date;

  if (filters.startDate && filters.endDate) {
    startDate = new Date(filters.startDate);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(filters.endDate);
    endDate.setHours(23, 59, 59, 999);
  } else {
    startDate = new Date(filters.year, filters.month - 1, filters.day || 1);
    endDate = filters.day 
      ? new Date(filters.year, filters.month - 1, filters.day, 23, 59, 59)
      : new Date(filters.year, filters.month, 0, 23, 59, 59);
  }

  return { startDate, endDate };
};
