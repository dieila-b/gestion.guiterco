
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AddressSectionProps {
  formData: {
    adresse_complete: string;
    boite_postale: string;
  };
  onUpdate: (updates: Partial<AddressSectionProps['formData']>) => void;
}

const AddressSection: React.FC<AddressSectionProps> = ({ formData, onUpdate }) => {
  return (
    <>
      {/* Adresse complète */}
      <div className="md:col-span-2">
        <Label htmlFor="adresse_complete">Adresse complète</Label>
        <Textarea
          id="adresse_complete"
          value={formData.adresse_complete}
          onChange={(e) => onUpdate({ adresse_complete: e.target.value })}
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
          onChange={(e) => onUpdate({ boite_postale: e.target.value })}
          className="mt-1"
        />
      </div>
    </>
  );
};

export default AddressSection;
