import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Dashboard from './pages/Dashboard';
import Agenda from './pages/Agenda';
import InventarioBovino from './pages/InventarioBovino';
import Gramineas from './pages/Gramineas';
import InventarioFisico from './pages/InventarioFisico';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/bovinos" element={<InventarioBovino />} />
        <Route path="/gramineas" element={<Gramineas />} />
        <Route path="/fisico" element={<InventarioFisico />} />
      </Routes>
    </Router>
  );
}

export default App;
