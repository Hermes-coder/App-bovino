import React from 'react';
import { useNavigate } from 'react-router-dom';

const MODULOS = [
  {
    ruta: '/agenda',
    titulo: 'Agenda de actividades',
    descripcion: 'Organiza y visualiza todos los eventos importantes de la granja.',
    icono: '📅',
    color: '#1976d2'
  },
  {
    ruta: '/bovinos',
    titulo: 'Inventario Bovino',
    descripcion: 'Registra, consulta y gestiona vacas y toros de tu finca.',
    icono: '🐄',
    color: '#43a047'
  },
  {
    ruta: '/gramineas',
    titulo: 'Galería de Gramíneas',
    descripcion: 'Consulta información visual y técnica sobre los pastos disponibles.',
    icono: '🌱',
    color: '#fbc02d'
  },
  {
    ruta: '/fisico',
    titulo: 'Inventario Físico',
    descripcion: 'Controla herramientas, medicinas y suplementos de la finca.',
    icono: '🛠️',
    color: '#8e24aa'
  }
];

export default function Dashboard() {
  const navigate = useNavigate();
  return (
    <div className="container">
      <h1>Gestión de Ganado Bovino</h1>
      <p style={{fontSize: '1.2rem', color: '#444', marginBottom: '2rem'}}>Bienvenido al sistema integral y profesional para la gestión de tu granja.</p>
      <div
        className="card-list"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: '2.5rem',
          justifyItems: 'center',
          alignItems: 'stretch',
          margin: '0 auto',
          maxWidth: 900
        }}
      >
        {MODULOS.map((mod, idx) => (
          <div
            key={mod.ruta}
            className="card"
            style={{
              width: '100%',
              minHeight: 220,
              maxWidth: 320,
              cursor: 'pointer',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px 0 rgba(0,0,0,0.07)',
              border: `2.5px solid ${mod.color}`,
              transition: 'transform 0.15s, box-shadow 0.15s',
              display: 'flex',
              flexDirection: 'column',
              textAlign: 'center',
              background: '#fff',
              margin: 0
            }}
            onClick={() => navigate(mod.ruta)}
            onKeyDown={e => { if (e.key === 'Enter') navigate(mod.ruta); }}
            tabIndex={0}
            role="button"
            aria-label={mod.titulo}
          >
            <span style={{fontSize:'3rem', marginBottom:10}}>{mod.icono}</span>
            <h3 style={{color:mod.color, marginBottom:8}}>{mod.titulo}</h3>
            <p style={{fontSize:'1.05rem', color:'#555'}}>{mod.descripcion}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
