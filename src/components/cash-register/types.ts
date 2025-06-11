
import { Database } from '@/integrations/supabase/types';

// Use Supabase generated types
export type CashRegister = Database['public']['Tables']['cash_registers']['Row'];
export type Transaction = Database['public']['Tables']['transactions']['Row'];

// Insert types for forms
export type CashRegisterInsert = Database['public']['Tables']['cash_registers']['Insert'];
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];

// Enums from Supabase
export type TransactionType = Database['public']['Enums']['transaction_type'];
export type PaymentMethod = Database['public']['Enums']['payment_method'];
export type TransactionCategory = Database['public']['Enums']['transaction_category'];
export type RegisterStatus = Database['public']['Enums']['register_status'];
