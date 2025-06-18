
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, UserCheck } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import CreateUserDialog from './CreateUserDialog';

interface UtilisateurInterne {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  photo_url?: string;
  statut: string;
  doit_changer_mot_de_passe: boolean;
  created_at: string;
  role: {
    nom: string;
    description: string;
  } | null;
}

const UtilisateursInternes = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupérer les utilisateurs internes
  const { data: utilisateurs, isLoading } = useQuery({
    queryKey: ['utilisateurs-internes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('utilisateurs_internes')
        .select(`
          *,
          role:role_id (
            nom,
            description
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UtilisateurInterne[];
    }
  });

  // Mutation pour supprimer un utilisateur
  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('utilisateurs_internes')
        .delete()
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
      toast({ title: "Utilisateur supprimé avec succès" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erreur", 
        description: error.message || "Impossible de supprimer l'utilisateur",
        variant: "destructive" 
      });
    }
  });

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      deleteUser.mutate(id);
    }
  };

  const getRoleLabel = (role: { nom: string } | null) => {
    if (!role) return 'Non défini';
    
    switch (role.nom) {
      case 'employe':
        return 'Employé';
      case 'administrateur':
        return 'Administrateur';
      case 'manager':
        return 'Manager';
      default:
        return role.nom;
    }
  };

  const getStatutBadge = (statut: string) => {
    return statut === 'actif' ? 
      <Badge className="bg-green-100 text-green-800">Actif</Badge> : 
      <Badge variant="secondary">Inactif</Badge>;
  };

  const handleUserCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5" />
              <div>
                <CardTitle>Utilisateurs Internes</CardTitle>
                <CardDescription>
                  Gérez les utilisateurs et leurs droits d'accès
                </CardDescription>
              </div>
            </div>
            <CreateUserDialog onUserCreated={handleUserCreated} />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Photo</TableHead>
                  <TableHead>Nom complet</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Changer MDP</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {utilisateurs && utilisateurs.length > 0 ? (
                  utilisateurs.map((utilisateur) => (
                    <TableRow key={utilisateur.id}>
                      <TableCell>
                        {utilisateur.photo_url ? (
                          <img 
                            src={utilisateur.photo_url} 
                            alt={`${utilisateur.prenom} ${utilisateur.nom}`}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <UserCheck className="h-4 w-4 text-gray-500" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {utilisateur.prenom} {utilisateur.nom}
                      </TableCell>
                      <TableCell>{utilisateur.email}</TableCell>
                      <TableCell>{utilisateur.telephone || '-'}</TableCell>
                      <TableCell>{getRoleLabel(utilisateur.role)}</TableCell>
                      <TableCell>{getStatutBadge(utilisateur.statut)}</TableCell>
                      <TableCell>
                        {utilisateur.doit_changer_mot_de_passe ? (
                          <Badge variant="outline" className="text-orange-600 border-orange-600">
                            Requis
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Non requis
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDelete(utilisateur.id)}
                            disabled={deleteUser.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UtilisateursInternes;
