
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldOff } from 'lucide-react';
import { useDevMode } from '@/hooks/useDevMode';

export const DevModeToggle = () => {
  const { isDevMode } = useDevMode();
  
  if (!isDevMode) return null;

  const toggleBypass = () => {
    const current = localStorage.getItem('dev_bypass_auth') === 'true';
    localStorage.setItem('dev_bypass_auth', (!current).toString());
    window.location.reload();
  };

  const bypassEnabled = localStorage.getItem('dev_bypass_auth') === 'true';

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="bg-yellow-100">
            MODE DÉVELOPPEMENT
          </Badge>
        </div>
        <Button
          onClick={toggleBypass}
          size="sm"
          variant={bypassEnabled ? "destructive" : "default"}
          className="w-full"
        >
          {bypassEnabled ? (
            <>
              <ShieldOff className="w-4 h-4 mr-2" />
              Désactiver bypass
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 mr-2" />
              Activer bypass auth
            </>
          )}
        </Button>
        {bypassEnabled && (
          <p className="text-xs text-yellow-700 mt-1">
            Connecté en tant qu'admin test
          </p>
        )}
      </div>
    </div>
  );
};
