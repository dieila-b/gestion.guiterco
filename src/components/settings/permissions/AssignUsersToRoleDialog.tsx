
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from 'lucide-react';
import { RoleUtilisateur } from '@/hooks/useRolesUtilisateurs';

interface AssignUsersToRoleDialogProps {
  role: RoleUtilisateur;
  children: React.ReactNode;
}

const AssignUsersToRoleDialog = ({ role, children }: AssignUsersToRoleDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Associer des utilisateurs au rôle "{role.nom}"
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800">Fonctionnalité temporairement indisponible</p>
              <p className="text-sm text-amber-700">
                L'assignation d'utilisateurs aux rôles sera disponible après reconstruction du système.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
          >
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignUsersToRoleDialog;
