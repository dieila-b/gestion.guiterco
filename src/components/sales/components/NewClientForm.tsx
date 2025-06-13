
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NewClientFormProps {
  onSuccess: (clientName: string) => void;
  onCancel: () => void;
}

const NewClientForm: React.FC<NewClientFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    statut_client: 'particulier',
    nom: '',
    nom_entreprise: '',
    type_client: 'particulier',
    email: '',
    whatsapp: '',
    telephone: '',
    adresse: '',
    ville: '',
    limite_credit: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom.trim()) {
      toast.error('Le nom du contact est requis');
      return;
    }

    setIsSubmitting(true);

    try {
      const clientData = {
        nom: formData.nom.trim(),
        nom_entreprise: formData.statut_client === 'particulier' ? null : formData.nom_entreprise.trim(),
        type_client: formData.type_client,
        statut_client: formData.statut_client,
        email: formData.email.trim() || null,
        whatsapp: formData.whatsapp.trim() || null,
        telephone: formData.telephone.trim() || null,
        adresse: formData.adresse.trim() || null,
        ville: formData.ville.trim() || null,
        limite_credit: formData.limite_credit || 0
      };

      const { data, error } = await supabase
        .from('clients')
        .insert(clientData)
        .select()
        .single();

      if (error) throw error;

      const clientName = formData.statut_client === 'entreprise' && formData.nom_entreprise 
        ? `${formData.nom_entreprise} (${formData.nom})`
        : formData.nom;
      
      toast.success('Client créé avec succès');
      onSuccess(clientName);
    } catch (error) {
      console.error('Erreur lors de la création du client:', error);
      toast.error('Erreur lors de la création du client');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = (value: string) => {
    setFormData({ 
      ...formData, 
      statut_client: value,
      type_client: value,
      nom_entreprise: value === 'particulier' ? '' : formData.nom_entreprise
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="statut_client">Statut client *</Label>
          <Select value={formData.statut_client} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner le statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="particulier">Particulier</SelectItem>
              <SelectItem value="entreprise">Entreprise</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="nom">Nom du contact *</Label>
          <Input
            id="nom"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            placeholder="Nom du contact"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="nom_entreprise">Nom de l'entreprise</Label>
        <Input
          id="nom_entreprise"
          value={formData.nom_entreprise}
          onChange={(e) => setFormData({ ...formData, nom_entreprise: e.target.value })}
          placeholder="Nom de l'entreprise"
          disabled={formData.statut_client === 'particulier'}
          className={formData.statut_client === 'particulier' ? 'bg-gray-100 text-gray-500' : ''}
        />
      </div>

      <div>
        <Label htmlFor="type_client">Type de client</Label>
        <Select value={formData.type_client} onValueChange={(value) => setFormData({ ...formData, type_client: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner le type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="particulier">Particulier</SelectItem>
            <SelectItem value="entreprise">Entreprise</SelectItem>
            <SelectItem value="professionnel">Professionnel</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
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
        
        <div>
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            value={formData.whatsapp}
            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
            placeholder="Numéro WhatsApp"
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
        <Label htmlFor="adresse">Adresse</Label>
        <Input
          id="adresse"
          value={formData.adresse}
          onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
          placeholder="Adresse complète"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="ville">Ville</Label>
          <Input
            id="ville"
            value={formData.ville}
            onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
            placeholder="Ville"
          />
        </div>
        
        <div>
          <Label htmlFor="limite_credit">Limite de crédit (GNF)</Label>
          <Input
            id="limite_credit"
            type="number"
            min="0"
            value={formData.limite_credit}
            onChange={(e) => setFormData({ ...formData, limite_credit: parseFloat(e.target.value) || 0 })}
            placeholder="0"
          />
        </div>
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
