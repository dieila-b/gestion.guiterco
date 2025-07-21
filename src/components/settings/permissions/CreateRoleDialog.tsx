
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/hooks/use-toast';

interface CreateRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRoleId?: string | null;
  onEditComplete?: () => void;
}

export function CreateRoleDialog({ open, onOpenChange, editingRoleId, onEditComplete }: CreateRoleDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { roles, createRole, updateRole } = usePermissions();
  const { toast } = useToast();

  const isEditing = Boolean(editingRoleId);
  const editingRole = roles.find(r => r.id === editingRoleId);

  useEffect(() => {
    if (isEditing && editingRole) {
      setName(editingRole.name);
      setDescription(editingRole.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [isEditing, editingRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      let result;
      if (isEditing && editingRoleId) {
        result = await updateRole(editingRoleId, name.trim(), description.trim());
      } else {
        result = await createRole(name.trim(), description.trim());
      }

      if (result.success) {
        toast({
          title: isEditing ? "Rôle modifié" : "Rôle créé",
          description: `Le rôle "${name}" a été ${isEditing ? 'modifié' : 'créé'} avec succès.`,
        });
        onOpenChange(false);
        if (onEditComplete) onEditComplete();
      } else {
        toast({
          title: "Erreur",
          description: result.error || `Erreur lors de la ${isEditing ? 'modification' : 'création'} du rôle.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    if (onEditComplete) onEditComplete();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Modifier le rôle' : 'Créer un nouveau rôle'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du rôle</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Gestionnaire de stock"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description du rôle et de ses responsabilités..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? 'Traitement...' : (isEditing ? 'Modifier' : 'Créer')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
