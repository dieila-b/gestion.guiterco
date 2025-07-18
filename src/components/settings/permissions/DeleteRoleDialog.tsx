
import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DeleteRoleDialogProps {
  role: {
    id: string;
    name: string;
    is_system?: boolean;
  };
  children: React.ReactNode;
}

const DeleteRoleDialog = ({ role, children }: DeleteRoleDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteRole = useMutation({
    mutationFn: async (roleId: string) => {
      console.log('🗑️ Deleting role:', roleId);
      
      // Vérifier d'abord s'il y a des utilisateurs avec ce rôle
      const { data: usersWithRole, error: checkError } = await supabase
        .from('utilisateurs_internes')
        .select('id')
        .eq('role_id', roleId)
        .limit(1);

      if (checkError) throw checkError;

      if (usersWithRole && usersWithRole.length > 0) {
        throw new Error('Impossible de supprimer ce rôle car il est assigné à des utilisateurs.');
      }

      // Supprimer d'abord les permissions du rôle
      await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', roleId);

      // Supprimer ensuite le rôle
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
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

  const handleDelete = () => {
    deleteRole.mutate(role.id);
  };

  // Ne pas permettre la suppression des rôles système
  if (role.is_system) {
    return null;
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer le rôle</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer le rôle "{role.name}" ?
            Cette action est irréversible et supprimera également toutes les permissions associées à ce rôle.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteRole.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteRole.isPending ? 'Suppression...' : 'Supprimer'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteRoleDialog;
