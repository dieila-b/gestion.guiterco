
import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';

interface DeleteRoleDialogProps {
  role: any;
  children: React.ReactNode;
}

const DeleteRoleDialog = ({ role, children }: DeleteRoleDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteRole = useMutation({
    mutationFn: async (roleId: string) => {
      // Vérifier d'abord si des utilisateurs sont assignés à ce rôle
      const { data: users, error: usersError } = await supabase
        .from('utilisateurs_internes')
        .select('id')
        .eq('role_id', roleId);

      if (usersError) throw usersError;

      if (users && users.length > 0) {
        throw new Error(`Impossible de supprimer ce rôle car ${users.length} utilisateur(s) y sont encore assignés. Veuillez d'abord réassigner ces utilisateurs à un autre rôle.`);
      }

      // Supprimer les permissions du rôle
      const { error: permissionsError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', roleId);

      if (permissionsError) throw permissionsError;

      // Supprimer le rôle
      const { error: roleError } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleId);

      if (roleError) throw roleError;

      return roleId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast({
        title: "Rôle supprimé",
        description: `Le rôle "${role.name}" a été supprimé avec succès.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le rôle",
        variant: "destructive",
      });
    }
  });

  const handleDelete = () => {
    deleteRole.mutate(role.id);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span>Supprimer le rôle "{role.name}"</span>
          </AlertDialogTitle>
          <AlertDialogDescription>
            <div className="space-y-2">
              <p>
                Cette action est irréversible. Le rôle sera définitivement supprimé et toutes ses permissions seront perdues.
              </p>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div className="text-sm text-amber-700">
                    <p className="font-medium">Attention :</p>
                    <p>Si des utilisateurs sont assignés à ce rôle, ils perdront leurs permissions. Assurez-vous de les réassigner à un autre rôle avant de continuer.</p>
                  </div>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteRole.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteRole.isPending ? 'Suppression...' : 'Supprimer définitivement'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteRoleDialog;
