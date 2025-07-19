
import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDataProvider } from '@/providers/DataProvider';

interface RealtimeConfig {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  onUpdate?: (payload: any) => void;
}

export const useOptimizedRealtime = (configs: RealtimeConfig[]) => {
  const { invalidateCache } = useDataProvider();
  const channelRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 3;
  const reconnectAttemptsRef = useRef(0);

  const setupChannel = useCallback(() => {
    // Nettoyer l'ancien channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Créer un seul channel pour toutes les tables
    const channel = supabase.channel('optimized-realtime-channel');

    // Configurer les listeners pour chaque table
    configs.forEach(({ table, event = '*', onUpdate }) => {
      channel.on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table
        },
        (payload) => {
          console.log(`Changement détecté sur ${table}:`, payload);
          
          // Invalider le cache pour cette table
          invalidateCache(table);
          invalidateCache(`${table}-operations`);
          
          // Callback personnalisé si fourni
          if (onUpdate) {
            onUpdate(payload);
          }
        }
      );
    });

    // Gérer la connexion
    channel.subscribe((status) => {
      console.log('Statut WebSocket:', status);
      
      if (status === 'SUBSCRIBED') {
        reconnectAttemptsRef.current = 0; // Reset sur succès
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        // Tentative de reconnexion avec délai
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const delay = Math.pow(2, reconnectAttemptsRef.current) * 1000; // Backoff exponentiel
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Tentative de reconnexion ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
            setupChannel();
          }, delay);
        } else {
          console.warn('Échec de reconnexion après plusieurs tentatives');
        }
      }
    });

    channelRef.current = channel;
  }, [configs, invalidateCache]);

  useEffect(() => {
    if (configs.length > 0) {
      setupChannel();
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [setupChannel]);

  return {
    isConnected: channelRef.current?.state === 'joined',
    reconnect: setupChannel
  };
};

// Hook spécialisé pour les données financières
export const useFinancialRealtime = () => {
  const { invalidateCache } = useDataProvider();

  return useOptimizedRealtime([
    {
      table: 'transactions',
      onUpdate: () => {
        invalidateCache('all-financial-transactions');
        invalidateCache('cash-balance');
      }
    },
    {
      table: 'cash_operations',
      onUpdate: () => {
        invalidateCache('all-financial-transactions');
        invalidateCache('cash-balance');
      }
    },
    {
      table: 'cash_registers',
      onUpdate: () => {
        invalidateCache('cash-registers');
        invalidateCache('cash-balance');
      }
    }
  ]);
};
