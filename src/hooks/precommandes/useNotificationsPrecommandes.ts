
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { NotificationPrecommande } from '@/types/precommandes';

export const useNotificationsPrecommandes = (precommandeId?: string) => {
  return useQuery({
    queryKey: ['notifications-precommandes', precommandeId],
    queryFn: async () => {
      let query = supabase
        .from('notifications_precommandes')
        .select('*')
        .order('date_creation', { ascending: false });
      
      if (precommandeId) {
        query = query.eq('precommande_id', precommandeId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as NotificationPrecommande[];
    },
    enabled: !precommandeId || !!precommandeId
  });
};
