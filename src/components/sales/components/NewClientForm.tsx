import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NewClientFormProps {
  onClientCreated: (clientData: { id: string; nom: string }) => void;
}

const NewClientForm: React.FC<NewClientFormProps> = ({ onClientCreated }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statutClient, setStatutClient] = useState('particulier');
  const [nom, setNom] = useState('');
  const [nomEntreprise, setNomEntreprise] = useState('');
  const [telephone, setTelephone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [adresse, setAdresse] = useState('');
  const [ville, setVille] = useState('');
  const [pays, setPays] = useState('Guinée');
  const [codePostal, setCodePostal] = useState('');
  const [limiteCredit, setLimiteCredit] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    // Validation
    if (!nom.trim()) {
      toast.error('Le nom du client est requis');
      return;
    }
    
    if (statutClient === 'entreprise' && !nomEntreprise.trim()) {
      toast.error('Le nom de l\'entreprise est requis pour un client entreprise');
      return;
    }

    setIsSubmitting(true);

    try {
      const clientData = {
        nom: nom.trim(),
        nom_entreprise: statutClient === 'entreprise' ? nomEntreprise.trim() : null,
        statut_client: statutClient,
        telephone: telephone.trim() || null,
        whatsapp: whatsapp.trim() || null,
        email: email.trim() || null,
        adresse: adresse.trim() || null,
        ville: ville.trim() || null,
        pays: pays.trim() || 'Guinée',
        code_postal: codePostal.trim() || null,
        limite_credit: limiteCredit ? parseFloat(limiteCredit) : 0,
        type_client: statutClient
      };

      console.log('Données à envoyer:', clientData);

      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select('id, nom')
        .single();

      if (error) {
        console.error('Erreur Supabase:', error);
        throw error;
      }

      console.log('Client créé avec succès:', data);
      toast.success('Client créé avec succès');
      
      // Appeler la fonction de callback avec les données du client
      onClientCreated(data);
      
    } catch (error: any) {
      console.error('Erreur lors de la création du client:', error);
      toast.error(`Erreur: ${error.message || 'Impossible de créer le client'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Statut Client */}
        <div className="md:col-span-2">
          <Label htmlFor="statut-client">Statut Client *</Label>
          <Select value={statutClient} onValueChange={setStatutClient}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner le statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="particulier">Particulier</SelectItem>
              <SelectItem value="entreprise">Entreprise</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Nom */}
        <div>
          <Label htmlFor="nom">Nom *</Label>
          <Input
            id="nom"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Nom du client"
            required
          />
        </div>

        {/* Nom d'entreprise */}
        <div>
          <Label htmlFor="nom-entreprise">
            Nom d'entreprise {statutClient === 'entreprise' ? '*' : ''}
          </Label>
          <Input
            id="nom-entreprise"
            value={nomEntreprise}
            onChange={(e) => setNomEntreprise(e.target.value)}
            placeholder="Nom de l'entreprise"
            disabled={statutClient === 'particulier'}
            required={statutClient === 'entreprise'}
          />
        </div>

        {/* Téléphone */}
        <div>
          <Label htmlFor="telephone">Téléphone</Label>
          <Input
            id="telephone"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            placeholder="+224 XXX XXX XXX"
          />
        </div>

        {/* WhatsApp */}
        <div>
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="+224 XXX XXX XXX"
          />
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="client@example.com"
          />
        </div>

        {/* Limite de crédit */}
        <div>
          <Label htmlFor="limite-credit">Limite de crédit (GNF)</Label>
          <Input
            id="limite-credit"
            type="number"
            value={limiteCredit}
            onChange={(e) => setLimiteCredit(e.target.value)}
            placeholder="0"
            min="0"
          />
        </div>

        {/* Adresse */}
        <div className="md:col-span-2">
          <Label htmlFor="adresse">Adresse</Label>
          <Textarea
            id="adresse"
            value={adresse}
            onChange={(e) => setAdresse(e.target.value)}
            placeholder="Adresse complète"
            rows={2}
          />
        </div>

        {/* Ville */}
        <div>
          <Label htmlFor="ville">Ville</Label>
          <Input
            id="ville"
            value={ville}
            onChange={(e) => setVille(e.target.value)}
            placeholder="Conakry"
          />
        </div>

        {/* Pays */}
        <div>
          <Label htmlFor="pays">Pays</Label>
          <Input
            id="pays"
            value={pays}
            onChange={(e) => setPays(e.target.value)}
            placeholder="Guinée"
          />
        </div>

        {/* Code postal */}
        <div>
          <Label htmlFor="code-postal">Code postal</Label>
          <Input
            id="code-postal"
            value={codePostal}
            onChange={(e) => setCodePostal(e.target.value)}
            placeholder="Code postal"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Création...' : 'Créer le client'}
        </Button>
      </div>
    </form>
  );
};

export default NewClientForm;
