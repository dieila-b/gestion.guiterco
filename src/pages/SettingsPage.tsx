
import React from 'react';
import { Routes, Route } from 'react-router-dom';

const SettingsPage = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Paramètres</h2>
      <Routes>
        <Route path="/" element={
          <div className="space-y-6">
            <p className="text-gray-600">Configuration générale de l'application</p>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-2">Paramètres système</h3>
              <p className="text-gray-500">Module de paramètres en développement...</p>
            </div>
          </div>
        } />
        <Route path="/*" element={
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <p className="text-gray-500">Section de paramètres en développement...</p>
          </div>
        } />
      </Routes>
    </div>
  );
};

export default SettingsPage;
