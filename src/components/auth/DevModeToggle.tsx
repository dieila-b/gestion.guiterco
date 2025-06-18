
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldOff, Info } from 'lucide-react';
import { useDevMode } from '@/hooks/useDevMode';

export const DevModeToggle = () => {
  const { isDevMode, bypassAuth, toggleBypass } = useDevMode();
  
  if (!isDevMode) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 shadow-lg max-w-xs">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            MODE DÉVELOPPEMENT
          </Badge>
        </div>
        
        <div className="flex items-start gap-2 mb-3 text-xs text-yellow-700">
          <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>
            Environnement détecté : {window.location.hostname}
          </span>
        </div>

        <Button
          onClick={toggleBypass}
          size="sm"
          variant={bypassAuth ? "destructive" : "default"}
          className="w-full"
        >
          {bypassAuth ? (
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
        
        {bypassAuth && (
          <p className="text-xs text-yellow-700 mt-2">
            ✅ Connecté automatiquement en tant qu'admin test
          </p>
        )}
        
        {!bypassAuth && (
          <p className="text-xs text-yellow-700 mt-2">
            🔒 Authentification normale requise
          </p>
        )}
      </div>
    </div>
  );
};
