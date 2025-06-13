
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
    type_client: 'occasionnel',
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
        nom_entreprise: formData.statut_client === 'particulier' ? null : formData.nom_entreprise.trim() || null,
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
      nom_entreprise: value === 'particulier' ? '' : formData.nom_entreprise
    });
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg max-w-2xl w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* First Row: Statut Client and Nom de l'entreprise */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="statut_client" className="text-blue-300 mb-2 block">Statut Client</Label>
            <Select value={formData.statut_client} onValueChange={handleStatusChange}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Particulier" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="particulier">Particulier</SelectItem>
                <SelectItem value="entreprise">Entreprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="nom_entreprise" className="text-blue-300 mb-2 block">Nom de l'entreprise</Label>
            <Input
              id="nom_entreprise"
              value={formData.nom_entreprise}
              onChange={(e) => setFormData({ ...formData, nom_entreprise: e.target.value })}
              placeholder="Entreprise ABC"
              disabled={formData.statut_client === 'particulier'}
              className={`bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 ${
                formData.statut_client === 'particulier' ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            />
          </div>
        </div>

        {/* Second Row: Nom du contact and Type de Client */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="nom" className="text-blue-300 mb-2 block">
              Nom du contact <span className="text-red-400">*</span>
            </Label>
            <Input
              id="nom"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              placeholder="John Doe"
              required
              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
            />
          </div>
          
          <div>
            <Label htmlFor="type_client" className="text-blue-300 mb-2 block">Type de Client</Label>
            <Select value={formData.type_client} onValueChange={(value) => setFormData({ ...formData, type_client: value })}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Occasionnel" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="occasionnel">Occasionnel</SelectItem>
                <SelectItem value="regulier">Régulier</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Third Row: Email and WhatsApp */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="email" className="text-blue-300 mb-2 block">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contact@entreprise.com"
              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
            />
          </div>
          
          <div>
            <Label htmlFor="whatsapp" className="text-blue-300 mb-2 block">WhatsApp</Label>
            <Input
              id="whatsapp"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              placeholder="+224 123456789"
              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Fourth Row: Téléphone and Adresse */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="telephone" className="text-blue-300 mb-2 block">Téléphone</Label>
            <Input
              id="telephone"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              placeholder="+224 123456789"
              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
            />
          </div>
          
          <div>
            <Label htmlFor="adresse" className="text-blue-300 mb-2 block">Adresse</Label>
            <Input
              id="adresse"
              value={formData.adresse}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
              placeholder="123 Rue Principale"
              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Fifth Row: Ville and Limite de crédit */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="ville" className="text-blue-300 mb-2 block">Ville</Label>
            <Input
              id="ville"
              value={formData.ville}
              onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
              placeholder="Conakry"
              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
            />
          </div>
          
          <div>
            <Label htmlFor="limite_credit" className="text-blue-300 mb-2 block">Limite de crédit (GNF)</Label>
            <div className="relative">
              <Input
                id="limite_credit"
                type="number"
                min="0"
                value={formData.limite_credit}
                onChange={(e) => setFormData({ ...formData, limite_credit: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 pr-10"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-400 text-sm">GNF</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Annuler
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isSubmitting ? 'Création...' : 'Créer le client'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewClientForm;
