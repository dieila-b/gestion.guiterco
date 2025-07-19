
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Key, Mail } from 'lucide-react';

interface PasswordResetInstructionsProps {
  show: boolean;
}

const PasswordResetInstructions = ({ show }: PasswordResetInstructionsProps) => {
  if (!show) return null;

  return (
    <Alert className="mt-4">
      <Info className="h-4 w-4" />
      <AlertDescription className="space-y-2">
        <p className="font-medium">Instructions pour le changement de mot de passe :</p>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <Key className="h-3 w-3" />
            <span>L'utilisateur devra changer son mot de passe à la prochaine connexion</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-3 w-3" />
            <span>Un email de réinitialisation a été envoyé (si possible)</span>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default PasswordResetInstructions;
