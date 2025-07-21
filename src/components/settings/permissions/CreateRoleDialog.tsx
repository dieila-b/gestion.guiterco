
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';

interface CreateRoleDialogProps {
  children?: React.ReactNode;
}

const CreateRoleDialog = ({ children }: CreateRoleDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    description: ''
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createRole = useMutation({
    mutationFn: async (data: { nom: string; description: string }) => {
      const { data: role, error } = await supabase
        .from('roles_utilisateurs')
        .insert({
          nom: data.nom.toLowerCase().replace(/\s+/g, '_'),
          description: data.description
        })
        .select()
        .single();

      if (error) throw error;
      return role;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles-utilisateurs'] });
      toast({
        title: "Rôle créé",
        description: "Le nouveau rôle a été créé avec succès.",
      });
      setFormData({ nom: '', description: '' });
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le rôle",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom du rôle est requis",
        variant: "destructive",
      });
      return;
    }
    createRole.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau rôle
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Créer un nouveau rôle</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nom">Nom du rôle *</Label>
            <Input
              id="nom"
              value={formData.nom}
              onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
              placeholder="Ex: Super Admin, Gestionnaire Stock..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description des responsabilités de ce rôle..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
            >
              Annuler
            </Button>
            <Button 
              type="submit"
              disabled={createRole.isPending}
            >
              {createRole.isPending ? 'Création...' : 'Créer le rôle'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoleDialog;
