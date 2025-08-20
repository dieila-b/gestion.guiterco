import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Database, AlertCircle } from 'lucide-react';

const AppNotification = () => {
  const { toast } = useToast();

  useEffect(() => {
    // Afficher une notification après un court délai pour s'assurer que l'app est chargée
    const timer = setTimeout(() => {
      toast({
        title: "Application restaurée",
        description: "Toutes vos données sont maintenant accessibles et synchronisées.",
        duration: 5000,
        action: (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <Database className="h-5 w-5 text-blue-600" />
          </div>
        ),
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [toast]);

  return null;
};

export default AppNotification;