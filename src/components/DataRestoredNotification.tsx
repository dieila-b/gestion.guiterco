import React, { useEffect, useState } from 'react';
import { CheckCircle, X } from 'lucide-react';

const DataRestoredNotification = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-hide after 8 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-green-800">
            Données restaurées !
          </h4>
          <p className="text-xs text-green-700 mt-1">
            Les problèmes de chargement des données depuis Supabase ont été résolus. Votre application devrait maintenant fonctionner normalement.
          </p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-green-400 hover:text-green-600 flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default DataRestoredNotification;