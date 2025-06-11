
import { useState, useEffect } from 'react';
import { usePays } from '@/hooks/usePays';
import { useVilles } from '@/hooks/useVilles';
import { Fournisseur } from '@/types/fournisseurs';

interface FournisseurFormData {
  nom_entreprise: string;
  contact_principal: string;
  email: string;
  telephone_mobile: string;
  telephone_fixe: string;
  pays_id: string;
  ville_id: string;
  ville_personnalisee: string;
  adresse_complete: string;
  boite_postale: string;
  site_web: string;
  statut: string;
}

export const useFournisseurForm = (fournisseur?: Fournisseur) => {
  const { pays } = usePays();
  const [selectedPaysId, setSelectedPaysId] = useState<string>('');
  const [selectedPays, setSelectedPays] = useState<any>(null);
  const { villes } = useVilles(selectedPaysId);
  const [useCustomVille, setUseCustomVille] = useState(false);

  const [formData, setFormData] = useState<FournisseurFormData>({
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

  const handlePaysChange = (paysId: string) => {
    const paysFound = pays?.find(p => p.id === paysId);
    setSelectedPaysId(paysId);
    setSelectedPays(paysFound);
    
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

  const handleTelephoneChange = (field: 'telephone_mobile' | 'telephone_fixe', value: string) => {
    const indicatif = selectedPays?.indicatif_tel || '';
    
    if (value === '' && indicatif) {
      setFormData(prev => ({ ...prev, [field]: indicatif }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const updateFormData = (updates: Partial<FournisseurFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return {
    formData,
    updateFormData,
    selectedPays,
    selectedPaysId,
    villes,
    useCustomVille,
    setUseCustomVille,
    handlePaysChange,
    handleTelephoneChange
  };
};
