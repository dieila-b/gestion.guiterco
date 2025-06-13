
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

    if (formData.statut_client === 'entreprise' && !formData.nom_entreprise.trim()) {
      toast.error('Le nom de l\'entreprise est requis pour un client entreprise');
      return;
    }

    setIsSubmitting(true);

    try {
      const clientData = {
        nom: formData.nom.trim(),
        nom_entreprise: formData.statut_client === 'entreprise' ? formData.nom_entreprise.trim() : null,
        type_client: formData.type_client,
        statut_client: formData.statut_client,
        email: formData.email.trim() || null,
        whatsapp: formData.whatsapp.trim() || null,
        telephone: formData.telephone.trim() || null,
        adresse: formData.adresse.trim() || null,
        ville: formData.ville.trim() || null,
        limite_credit: formData.limite_credit || 0
      };

      console.log('Création du client avec les données:', clientData);

      const { data, error } = await supabase
        .from('clients')
        .insert(clientData)
        .select()
        .single();

      if (error) {
        console.error('Erreur Supabase lors de la création du client:', error);
        throw error;
      }

      console.log('Client créé avec succès:', data);

      const clientName = formData.statut_client === 'entreprise' && formData.nom_entreprise 
        ? `${formData.nom_entreprise} (${formData.nom})`
        : formData.nom;
      
      toast.success('Client créé avec succès');
      onSuccess(clientName);
    } catch (error) {
      console.error('Erreur lors de la création du client:', error);
      toast.error('Erreur lors de la création du client. Veuillez réessayer.');
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
    <div className="bg-white p-8 rounded-lg max-w-4xl w-full mx-auto shadow-lg border">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-8">
          
          {/* Colonne de gauche */}
          <div className="space-y-4">
            {/* Statut Client */}
            <div>
              <Label htmlFor="statut_client" className="text-gray-700 mb-2 block text-sm font-medium">
                Statut Client <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.statut_client} onValueChange={handleStatusChange}>
                <SelectTrigger className="bg-white border-gray-300 text-gray-900 h-10">
                  <SelectValue placeholder="Sélectionner le statut" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300">
                  <SelectItem value="particulier">Particulier</SelectItem>
                  <SelectItem value="entreprise">Entreprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Nom du contact */}
            <div>
              <Label htmlFor="nom" className="text-gray-700 mb-2 block text-sm font-medium">
                Nom du contact <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="John Doe"
                required
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 h-10"
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-gray-700 mb-2 block text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@entreprise.com"
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 h-10"
              />
            </div>

            {/* Téléphone */}
            <div>
              <Label htmlFor="telephone" className="text-gray-700 mb-2 block text-sm font-medium">
                Téléphone
              </Label>
              <Input
                id="telephone"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                placeholder="+224 123456789"
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 h-10"
              />
            </div>

            {/* Ville */}
            <div>
              <Label htmlFor="ville" className="text-gray-700 mb-2 block text-sm font-medium">
                Ville
              </Label>
              <Input
                id="ville"
                value={formData.ville}
                onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                placeholder="Conakry"
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 h-10"
              />
            </div>
          </div>

          {/* Colonne de droite */}
          <div className="space-y-4">
            {/* Nom de l'entreprise */}
            <div>
              <Label htmlFor="nom_entreprise" className="text-gray-700 mb-2 block text-sm font-medium">
                Nom de l'entreprise {formData.statut_client === 'entreprise' && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="nom_entreprise"
                value={formData.nom_entreprise}
                onChange={(e) => setFormData({ ...formData, nom_entreprise: e.target.value })}
                placeholder="Entreprise ABC"
                disabled={formData.statut_client === 'particulier'}
                required={formData.statut_client === 'entreprise'}
                className={`border-gray-300 text-gray-900 placeholder:text-gray-400 h-10 ${
                  formData.statut_client === 'particulier' 
                    ? 'opacity-50 cursor-not-allowed bg-gray-100' 
                    : 'bg-white'
                }`}
              />
            </div>

            {/* Type de Client */}
            <div>
              <Label htmlFor="type_client" className="text-gray-700 mb-2 block text-sm font-medium">
                Type de Client
              </Label>
              <Select value={formData.type_client} onValueChange={(value) => setFormData({ ...formData, type_client: value })}>
                <SelectTrigger className="bg-white border-gray-300 text-gray-900 h-10">
                  <SelectValue placeholder="Occasionnel" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300">
                  <SelectItem value="occasionnel">Occasionnel</SelectItem>
                  <SelectItem value="regulier">Régulier</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* WhatsApp */}
            <div>
              <Label htmlFor="whatsapp" className="text-gray-700 mb-2 block text-sm font-medium">
                WhatsApp
              </Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="+224 123456789"
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 h-10"
              />
            </div>

            {/* Adresse */}
            <div>
              <Label htmlFor="adresse" className="text-gray-700 mb-2 block text-sm font-medium">
                Adresse
              </Label>
              <Input
                id="adresse"
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                placeholder="123 Rue Principale"
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 h-10"
              />
            </div>

            {/* Limite de crédit */}
            <div>
              <Label htmlFor="limite_credit" className="text-gray-700 mb-2 block text-sm font-medium">
                Limite de crédit (GNF)
              </Label>
              <div className="relative">
                <Input
                  id="limite_credit"
                  type="number"
                  min="0"
                  value={formData.limite_credit}
                  onChange={(e) => setFormData({ ...formData, limite_credit: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 h-10 pr-12"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-400 text-sm">GNF</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 px-6"
          >
            Annuler
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          >
            {isSubmitting ? 'Création...' : 'Créer le client'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewClientForm;
