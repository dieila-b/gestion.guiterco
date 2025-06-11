
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ContactSectionProps {
  formData: {
    telephone_mobile: string;
    telephone_fixe: string;
    site_web: string;
  };
  selectedPays?: any;
  onTelephoneChange: (field: 'telephone_mobile' | 'telephone_fixe', value: string) => void;
  onUpdate: (updates: Partial<ContactSectionProps['formData']>) => void;
}

const ContactSection: React.FC<ContactSectionProps> = ({
  formData,
  selectedPays,
  onTelephoneChange,
  onUpdate
}) => {
  return (
    <>
      {/* Téléphone mobile */}
      <div>
        <Label htmlFor="telephone_mobile">Téléphone mobile</Label>
        <Input
          id="telephone_mobile"
          value={formData.telephone_mobile}
          onChange={(e) => onTelephoneChange('telephone_mobile', e.target.value)}
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
          onChange={(e) => onTelephoneChange('telephone_fixe', e.target.value)}
          placeholder={selectedPays ? `${selectedPays.indicatif_tel}123456789` : "Téléphone fixe"}
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
          onChange={(e) => onUpdate({ site_web: e.target.value })}
          placeholder="https://"
          className="mt-1"
        />
      </div>
    </>
  );
};

export default ContactSection;
