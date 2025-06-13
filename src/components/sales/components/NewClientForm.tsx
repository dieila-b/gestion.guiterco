
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NewClientFormProps {
  onSuccess: (clientName: string) => void;
  onCancel: () => void;
}

const NewClientForm: React.FC<NewClientFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom.trim()) {
      toast.error('Le nom est requis');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          nom: formData.nom.trim(),
          prenom: formData.prenom.trim(),
          telephone: formData.telephone.trim(),
          email: formData.email.trim(),
          type_client: 'particulier'
        })
        .select()
        .single();

      if (error) throw error;

      const clientName = `${formData.prenom} ${formData.nom}`.trim();
      toast.success('Client créé avec succès');
      onSuccess(clientName);
    } catch (error) {
      console.error('Erreur lors de la création du client:', error);
      toast.error('Erreur lors de la création du client');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="nom">Nom *</Label>
          <Input
            id="nom"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            placeholder="Nom du client"
            required
          />
        </div>
        <div>
          <Label htmlFor="prenom">Prénom</Label>
          <Input
            id="prenom"
            value={formData.prenom}
            onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
            placeholder="Prénom"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="telephone">Téléphone</Label>
        <Input
          id="telephone"
          value={formData.telephone}
          onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
          placeholder="Numéro de téléphone"
        />
      </div>
      
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Adresse email"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Création...' : 'Créer'}
        </Button>
      </div>
    </form>
  );
};

export default NewClientForm;
