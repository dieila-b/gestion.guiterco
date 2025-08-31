
import React from 'react';
import { useDevMode } from '@/hooks/useDevMode';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const DevModeToggle = () => {
  const { isDevMode } = useDevMode();

  if (!isDevMode) return null;

  const toggleBypass = () => {
    const current = localStorage.getItem('dev_bypass_auth') !== 'false';
    localStorage.setItem('dev_bypass_auth', (!current).toString());
    window.location.reload();
  };

  const currentBypass = localStorage.getItem('dev_bypass_auth') !== 'false';

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
        DEV MODE
      </Badge>
      <Button
        onClick={toggleBypass}
        variant={currentBypass ? "default" : "outline"}
        size="sm"
      >
        {currentBypass ? 'Bypass ON' : 'Bypass OFF'}
      </Button>
    </div>
  );
};
