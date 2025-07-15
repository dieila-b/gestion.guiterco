
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Users } from 'lucide-react';
import { RoleUtilisateur } from '@/hooks/useRolesUtilisateurs';

interface AssignUsersToRoleDialogProps {
  role: RoleUtilisateur;
  children: React.ReactNode;
}

interface UtilisateurInterne {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  role_id: string;
}

const AssignUsersToRoleDialog = ({ role, children }: AssignUsersToRoleDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupérer tous les utilisateurs internes
  const { data: users } = useQuery({
    queryKey: ['utilisateurs-internes-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('utilisateurs_internes')
        .select('id, prenom, nom, email, role_id')
        .eq('statut', 'actif');

      if (error) throw error;
      return data as UtilisateurInterne[];
    }
  });

  // Initialiser les utilisateurs sélectionnés avec ceux qui ont déjà ce rôle
  useEffect(() => {
    if (users && isOpen) {
      const usersWithThisRole = users
        .filter(user => user.role_id === role.id)
        .map(user => user.id);
      setSelectedUsers(usersWithThisRole);
    }
  }, [users, role.id, isOpen]);

  const updateUserRoles = useMutation({
    mutationFn: async (userIds: string[]) => {
      // D'abord, retirer ce rôle de tous les utilisateurs
      await supabase
        .from('utilisateurs_internes')
        .update({ role_id: null })
        .eq('role_id', role.id);

      // Ensuite, assigner ce rôle aux utilisateurs sélectionnés
      if (userIds.length > 0) {
        const { error } = await supabase
          .from('utilisateurs_internes')
          .update({ role_id: role.id })
          .in('id', userIds);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes-all'] });
      toast({
        title: "Utilisateurs mis à jour",
        description: `Les utilisateurs ont été associés au rôle "${role.nom}" avec succès.`,
      });
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour les utilisateurs",
        variant: "destructive",
      });
    }
  });

  const handleUserToggle = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSave = () => {
    updateUserRoles.mutate(selectedUsers);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Associer des utilisateurs au rôle "{role.nom}"
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Sélectionnez les utilisateurs qui doivent avoir ce rôle :
          </p>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {users?.map((user) => (
              <div key={user.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                <Checkbox
                  id={user.id}
                  checked={selectedUsers.includes(user.id)}
                  onCheckedChange={(checked) => 
                    handleUserToggle(user.id, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={user.id}
                  className="flex-1 cursor-pointer"
                >
                  <div>
                    <p className="font-medium">
                      {user.prenom} {user.nom}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSave}
            disabled={updateUserRoles.isPending}
          >
            {updateUserRoles.isPending ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignUsersToRoleDialog;
