
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, UserPlus } from 'lucide-react';
import CreateUserDialog from '../CreateUserDialog';

interface UsersErrorStateProps {
  error: any;
  onUserCreated: () => void;
}

const UsersErrorState = ({ error, onUserCreated }: UsersErrorStateProps) => {
  const handleRetry = () => {
    window.location.reload();
  };

  const getErrorMessage = (error: any) => {
    if (error?.message?.includes('infinite recursion')) {
      return "Erreur de configuration RLS détectée. Les politiques de sécurité ont un problème de récursion.";
    } else if (error?.message?.includes('relation') && error?.message?.includes('does not exist')) {
      return "Table manquante dans la base de données. La structure de la base de données semble incomplète.";
    } else if (error?.message?.includes('permission denied')) {
      return "Accès refusé. Vous n'avez pas les permissions nécessaires pour voir les utilisateurs.";
    } else {
      return error?.message || "Une erreur inconnue s'est produite lors du chargement des utilisateurs.";
    }
  };

  const getErrorSolution = (error: any) => {
    if (error?.message?.includes('infinite recursion')) {
      return "Contactez l'administrateur système pour corriger les politiques RLS.";
    } else if (error?.message?.includes('relation') && error?.message?.includes('does not exist')) {
      return "Contactez l'administrateur pour vérifier la structure de la base de données.";
    } else if (error?.message?.includes('permission denied')) {
      return "Contactez l'administrateur pour obtenir les permissions appropriées.";
    } else {
      return "Essayez de recharger la page ou contactez le support technique.";
    }
  };

  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>Erreur lors du chargement des utilisateurs</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Détails de l'erreur :</p>
          <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
            {getErrorMessage(error)}
          </p>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium">Solution recommandée :</p>
          <p className="text-sm text-muted-foreground">
            {getErrorSolution(error)}
          </p>
        </div>

        <div className="flex space-x-2 pt-4">
          <Button 
            onClick={handleRetry}
            variant="outline"
            className="flex-1"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Recharger la page
          </Button>
          
          <CreateUserDialog onUserCreated={onUserCreated}>
            <Button variant="default" className="flex-1">
              <UserPlus className="h-4 w-4 mr-2" />
              Créer un utilisateur
            </Button>
          </CreateUserDialog>
        </div>

        <div className="mt-4 p-3 bg-muted rounded-md">
          <p className="text-xs text-muted-foreground">
            <strong>Informations techniques :</strong><br/>
            {JSON.stringify(error, null, 2)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UsersErrorState;
