
import React from 'react';

const UsersLoadingState = () => {
  return (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p>Chargement des utilisateurs...</p>
    </div>
  );
};

export default UsersLoadingState;
