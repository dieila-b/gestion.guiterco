
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { usePays } from '@/hooks/usePays';
import { useVilles } from '@/hooks/useVilles';
import { Fournisseur } from '@/types/fournisseurs';

interface FournisseurFormProps {
  fournisseur?: Fournisseur;
  onSubmit: (data: Partial<Fournisseur>) => void;
  onCancel: () => void;
}

const FournisseurForm: React.FC<FournisseurFormProps> = ({ fournisseur, onSubmit, onCancel }) => {
  const { pays } = usePays();
  const [selectedPaysId, setSelectedPaysId] = useState<string>('');
  const [selectedPays, setSelectedPays] = useState<any>(null);
  const { villes } = useVilles(selectedPaysId);
  const [useCustomVille, setUseCustomVille] = useState(false);

  const [formData, setFormData] = useState({
    nom_entreprise: '',
    contact_principal: '',
    email: '',
    telephone_mobile: '',
    telephone_fixe: '',
    pays_id: '',
    ville_id: '',
    ville_personnalisee: '',
    adresse_complete: '',
    boite_postale: '',
    site_web: '',
    statut: 'en_attente'
  });

  useEffect(() => {
    if (fournisseur) {
      setFormData({
        nom_entreprise: fournisseur.nom_entreprise || fournisseur.nom || '',
        contact_principal: fournisseur.contact_principal || '',
        email: fournisseur.email || '',
        telephone_mobile: fournisseur.telephone_mobile || '',
        telephone_fixe: fournisseur.telephone_fixe || fournisseur.telephone || '',
        pays_id: fournisseur.pays_id || '',
        ville_id: fournisseur.ville_id || '',
        ville_personnalisee: fournisseur.ville_personnalisee || '',
        adresse_complete: fournisseur.adresse_complete || fournisseur.adresse || '',
        boite_postale: fournisseur.boite_postale || '',
        site_web: fournisseur.site_web || '',
        statut: fournisseur.statut || 'en_attente'
      });
      if (fournisseur.pays_id) {
        setSelectedPaysId(fournisseur.pays_id);
        const paysFound = pays?.find(p => p.id === fournisseur.pays_id);
        if (paysFound) {
          setSelectedPays(paysFound);
        }
      }
      setUseCustomVille(!!fournisseur.ville_personnalisee);
    }
  }, [fournisseur, pays]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      ville_id: useCustomVille ? null : formData.ville_id,
      ville_personnalisee: useCustomVille ? formData.ville_personnalisee : null
    };
    onSubmit(submitData);
  };

  const handlePaysChange = (paysId: string) => {
    const paysFound = pays?.find(p => p.id === paysId);
    setSelectedPaysId(paysId);
    setSelectedPays(paysFound);
    
    // Mettre à jour l'indicatif téléphonique si les champs téléphone sont vides
    const indicatif = paysFound?.indicatif_tel || '';
    setFormData(prev => ({
      ...prev,
      pays_id: paysId,
      ville_id: '',
      ville_personnalisee: '',
      telephone_mobile: prev.telephone_mobile || indicatif,
      telephone_fixe: prev.telephone_fixe || indicatif
    }));
    setUseCustomVille(false);
  };

  const handleCustomVilleChange = (checked: boolean | "indeterminate") => {
    const isChecked = checked === true;
    setUseCustomVille(isChecked);
  };

  const handleTelephoneChange = (field: 'telephone_mobile' | 'telephone_fixe', value: string) => {
    const indicatif = selectedPays?.indicatif_tel || '';
    
    // Si l'utilisateur efface tout et qu'un pays est sélectionné, remettre l'indicatif
    if (value === '' && indicatif) {
      setFormData(prev => ({ ...prev, [field]: indicatif }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nom de l'entreprise */}
        <div className="md:col-span-2">
          <Label htmlFor="nom_entreprise">Nom de l'entreprise *</Label>
          <Input
            id="nom_entreprise"
            value={formData.nom_entreprise}
            onChange={(e) => setFormData({ ...formData, nom_entreprise: e.target.value })}
            required
            className="mt-1"
          />
        </div>

        {/* Contact principal */}
        <div>
          <Label htmlFor="contact_principal">Contact principal</Label>
          <Input
            id="contact_principal"
            value={formData.contact_principal}
            onChange={(e) => setFormData({ ...formData, contact_principal: e.target.value })}
            className="mt-1"
          />
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="mt-1"
          />
        </div>

        {/* Pays */}
        <div>
          <Label htmlFor="pays">Pays</Label>
          <Select value={formData.pays_id} onValueChange={handlePaysChange}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Sélectionner un pays" />
            </SelectTrigger>
            <SelectContent>
              {pays?.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nom} ({p.indicatif_tel})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ville */}
        <div>
          <Label htmlFor="ville">Ville</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 mt-1">
              <Checkbox 
                id="ville_personnalisee" 
                checked={useCustomVille}
                onCheckedChange={handleCustomVilleChange}
              />
              <Label htmlFor="ville_personnalisee" className="text-sm">
                Saisie personnalisée
              </Label>
            </div>
            
            {useCustomVille ? (
              <Input
                value={formData.ville_personnalisee}
                onChange={(e) => setFormData({ ...formData, ville_personnalisee: e.target.value })}
                placeholder="Saisir le nom de la ville"
              />
            ) : (
              <Select 
                value={formData.ville_id} 
                onValueChange={(value) => setFormData({ ...formData, ville_id: value })}
                disabled={!selectedPaysId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une ville" />
                </SelectTrigger>
                <SelectContent>
                  {villes?.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.nom} {v.code_postal ? `(${v.code_postal})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Téléphone mobile */}
        <div>
          <Label htmlFor="telephone_mobile">Téléphone mobile</Label>
          <Input
            id="telephone_mobile"
            value={formData.telephone_mobile}
            onChange={(e) => handleTelephoneChange('telephone_mobile', e.target.value)}
            placeholder={selectedPays ? `${selectedPays.indicatif_tel}123456789` : "Téléphone mobile"}
            className="mt-1"
          />
        </div>

        {/* Téléphone fixe */}
        <div>
          <Label htmlFor="telephone_fixe">Téléphone fixe</Label>
          <Input
            id="telephone_fixe"
            value={formData.telephone_fixe}
            onChange={(e) => handleTelephoneChange('telephone_fixe', e.target.value)}
            placeholder={selectedPays ? `${selectedPays.indicatif_tel}123456789` : "Téléphone fixe"}
            className="mt-1"
          />
        </div>

        {/* Adresse complète */}
        <div className="md:col-span-2">
          <Label htmlFor="adresse_complete">Adresse complète</Label>
          <Textarea
            id="adresse_complete"
            value={formData.adresse_complete}
            onChange={(e) => setFormData({ ...formData, adresse_complete: e.target.value })}
            className="mt-1"
            rows={3}
          />
        </div>

        {/* Boîte postale */}
        <div>
          <Label htmlFor="boite_postale">Boîte postale</Label>
          <Input
            id="boite_postale"
            value={formData.boite_postale}
            onChange={(e) => setFormData({ ...formData, boite_postale: e.target.value })}
            className="mt-1"
          />
        </div>

        {/* Site web */}
        <div>
          <Label htmlFor="site_web">Site web</Label>
          <Input
            id="site_web"
            type="url"
            value={formData.site_web}
            onChange={(e) => setFormData({ ...formData, site_web: e.target.value })}
            placeholder="https://"
            className="mt-1"
          />
        </div>

        {/* Statut */}
        <div className="md:col-span-2">
          <Label htmlFor="statut">Statut</Label>
          <Select value={formData.statut} onValueChange={(value) => setFormData({ ...formData, statut: value })}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en_attente">En attente</SelectItem>
              <SelectItem value="approuve">Approuvé</SelectItem>
              <SelectItem value="refuse">Refusé</SelectItem>
              <SelectItem value="suspendu">Suspendu</SelectItem>
              <SelectItem value="inactif">Inactif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          {fournisseur ? 'Modifier' : 'Ajouter'}
        </Button>
      </div>
    </form>
  );
};

export default FournisseurForm;
