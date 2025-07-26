
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldOff, Info, Lock } from 'lucide-react';
import { useDevMode } from '@/hooks/useDevMode';

export const DevModeToggle = () => {
  const { isDevMode, bypassAuth, toggleBypass } = useDevMode();
  
  if (!isDevMode) return null;

  const isProduction = import.meta.env.MODE === 'production';

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 shadow-lg max-w-xs">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            {isProduction ? 'PRODUCTION' : 'DÉVELOPPEMENT'}
          </Badge>
        </div>
        
        <div className="flex items-start gap-2 mb-3 text-xs text-yellow-700">
          <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>
            Environnement : {window.location.hostname}
          </span>
        </div>

        {isProduction ? (
          <div className="flex items-center gap-2 text-xs text-red-700">
            <Lock className="w-3 h-3" />
            <span>Authentification obligatoire</span>
          </div>
        ) : (
          <>
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
              <p className="text-xs text-green-700 mt-2">
                ✅ Accès libre activé pour les tests
              </p>
            )}
            
            {!bypassAuth && (
              <p className="text-xs text-yellow-700 mt-2">
                🔒 Authentification requise (utilisateurs internes uniquement)
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};
