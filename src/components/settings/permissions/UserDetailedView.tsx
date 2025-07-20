
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, User, Shield, BarChart3 } from 'lucide-react';
import UserPermissionsDisplay from './UserPermissionsDisplay';
import AccessStatistics from './AccessStatistics';

interface UserDetailedViewProps {
  user: {
    id: string;
    user_id: string;
    prenom: string;
    nom: string;
    email: string;
    role: {
      id: string;
      name: string;
    } | null;
    statut: string;
  };
  children: React.ReactNode;
}

const UserDetailedView = ({ user, children }: UserDetailedViewProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Détails - {user.prenom} {user.nom}</span>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="permissions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="permissions" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Permissions Détaillées</span>
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Statistiques d'Accès</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="permissions" className="mt-6">
            {user.role ? (
              <UserPermissionsDisplay
                userId={user.user_id}
                userName={`${user.prenom} ${user.nom}`}
                userRole={user.role.name}
              />
            ) : (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun rôle assigné</h3>
                <p className="text-muted-foreground">
                  Cet utilisateur n'a pas de rôle assigné et n'a donc aucune permission
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="statistics" className="mt-6">
            <AccessStatistics />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailedView;
