
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormFieldsSectionProps {
  formData: {
    nom_entreprise: string;
    contact_principal: string;
    email: string;
    statut: string;
  };
  onUpdate: (updates: Partial<FormFieldsSectionProps['formData']>) => void;
}

const FormFieldsSection: React.FC<FormFieldsSectionProps> = ({ formData, onUpdate }) => {
  return (
    <>
      {/* Nom de l'entreprise */}
      <div className="md:col-span-2">
        <Label htmlFor="nom_entreprise">Nom de l'entreprise *</Label>
        <Input
          id="nom_entreprise"
          value={formData.nom_entreprise}
          onChange={(e) => onUpdate({ nom_entreprise: e.target.value })}
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
          onChange={(e) => onUpdate({ contact_principal: e.target.value })}
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
          onChange={(e) => onUpdate({ email: e.target.value })}
          className="mt-1"
        />
      </div>

      {/* Statut */}
      <div className="md:col-span-2">
        <Label htmlFor="statut">Statut</Label>
        <Select value={formData.statut} onValueChange={(value) => onUpdate({ statut: value })}>
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
    </>
  );
};

export default FormFieldsSection;
