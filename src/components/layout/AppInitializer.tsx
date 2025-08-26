
import React from 'react';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import { LoadingScreen } from '@/components/ui/loading-screen';

interface AppInitializerProps {
  children: React.ReactNode;
}

export const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const { isInitialized, initProgress, initMessage } = useAppInitialization();

  if (!isInitialized) {
    return (
      <LoadingScreen 
        message={initMessage}
        progress={initProgress}
      />
    );
  }

  return <>{children}</>;
};
