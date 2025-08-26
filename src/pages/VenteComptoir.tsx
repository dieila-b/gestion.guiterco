
import React from 'react';
import { Navigate } from 'react-router-dom';

// Redirection vers la page Sales qui contient la vente comptoir
const VenteComptoir = () => {
  return <Navigate to="/vente-comptoir" replace />;
};

export default VenteComptoir;
