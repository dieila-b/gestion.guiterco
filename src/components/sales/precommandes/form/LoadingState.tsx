
import React from 'react';

export const LoadingState = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Chargement des données...</p>
      </div>
    </div>
  );
};
