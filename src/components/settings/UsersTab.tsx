
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Users, AlertCircle } from 'lucide-react';
import UsersList from './UsersList';
import CreateUserDialog from './CreateUserDialog';
import { useUtilisateursInternes } from '@/hooks/useUtilisateursInternes';
import { useRealTimeUserManagement } from '@/hooks/useRealTimeUserManagement';

const UsersTab = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { data: users, isLoading, error, refetch } = useUtilisateursInternes();
  
  // Activer la synchronisation temps réel
  useRealTimeUserManagement();

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
          <p className="text-muted-foreground mb-4">
            Impossible de charger les utilisateurs internes
          </p>
          <Button onClick={() => refetch()} variant="outline">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center space-x-2">
            <Users className="h-6 w-6" />
            <span>Utilisateurs Internes</span>
          </h2>
          <p className="text-muted-foreground">
            Gérez les comptes et permissions des utilisateurs internes
          </p>
        </div>
        
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel utilisateur
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des utilisateurs...</p>
          </div>
        </div>
      ) : (
        <UsersList users={users || []} />
      )}

      <CreateUserDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
      />
    </div>
  );
};

export default UsersTab;
