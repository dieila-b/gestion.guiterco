
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PasswordResetRequest {
  id: string;
  user_id: string;
  new_password_hash: string;
  require_change?: boolean;
  used?: boolean;
  expires_at?: string;
  created_at?: string;
}

export interface CreatePasswordResetRequest {
  user_id: string;
  new_password_hash: string;
  require_change?: boolean;
}

export const usePasswordResetRequests = () => {
  return useQuery({
    queryKey: ['password-reset-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('password_reset_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PasswordResetRequest[];
    }
  });
};

export const useCreatePasswordResetRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestData: CreatePasswordResetRequest) => {
      const { data, error } = await supabase
        .from('password_reset_requests')
        .insert(requestData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['password-reset-requests'] });
      toast.success('Demande de réinitialisation créée');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la création de la demande');
    }
  });
};

export const useMarkPasswordResetAsUsed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const { data, error } = await supabase
        .from('password_reset_requests')
        .update({ used: true })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['password-reset-requests'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    }
  });
};
