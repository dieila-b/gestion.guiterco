
import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, AlertTriangle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DeleteRoleDialogProps {
  role: {
    id: string;
    name: string;
    description?: string;
    is_system?: boolean;
  };
  children: React.ReactNode;
}

const DeleteRoleDialog = ({ role, children }: DeleteRoleDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteRole = useMutation({
    mutationFn: async () => {
      console.log('🗑️ Deleting role:', role.id);

      // Vérifier s'il y a des utilisateurs avec ce rôle
      const { data: usersWithRole, error: checkError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('role_id', role.id)
        .eq('is_active', true);

      if (checkError) {
        console.error('❌ Error checking users with role:', checkError);
        throw checkError;
      }

      if (usersWithRole && usersWithRole.length > 0) {
        throw new Error(`Impossible de supprimer le rôle "${role.name}" car ${usersWithRole.length} utilisateur(s) l'utilisent encore.`);
      }

      // Supprimer d'abord les permissions du rôle
      const { error: permissionsError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', role.id);

      if (permissionsError) {
        console.error('❌ Error deleting role permissions:', permissionsError);
        throw permissionsError;
      }

      // Supprimer le rôle
      const { error: roleError } = await supabase
        .from('roles')
        .delete()
        .eq('id', role.id);

      if (roleError) {
        console.error('❌ Error deleting role:', roleError);
        throw roleError;
      }

      console.log('✅ Role deleted successfully');
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      
      toast({
        title: "Rôle supprimé",
        description: `Le rôle "${role.name}" a été supprimé avec succès.`,
      });
      setIsOpen(false);
    },
    onError: (error: any) => {
      console.error('❌ Error deleting role:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le rôle.",
        variant: "destructive",
      });
    }
  });

  if (role.is_system) {
    return null; // Les rôles système ne peuvent pas être supprimés
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertDialogTitle>Supprimer le rôle</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3">
            <p>
              Êtes-vous sûr de vouloir supprimer le rôle <strong>"{role.name}"</strong> ?
            </p>
            {role.description && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">{role.description}</p>
              </div>
            )}
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive-foreground">
                <strong>⚠️ Attention :</strong> Cette action est irréversible. 
                Tous les utilisateurs ayant ce rôle perdront leurs permissions associées.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteRole.mutate()}
            disabled={deleteRole.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteRole.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteRoleDialog;
