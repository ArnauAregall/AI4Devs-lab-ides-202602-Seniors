import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import AddCandidatePage from './pages/AddCandidatePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/candidates/new" element={<AddCandidatePage />} />
    </Routes>
  );
}

export default App;
