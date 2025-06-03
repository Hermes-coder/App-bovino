import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RAZAS = [
  'Holstein', 'Jersey', 'Angus', 'Hereford', 'Charolais', 'Simmental', 'Brahman', 'Limousin', 'Otra'
];
const PROCEDENCIAS = [
  'Nacido en finca', 'Compra local', 'Compra nacional', 'Importado', 'Otra'
];
const ESTADOS = [
  'Saludable', 'Enfermo', 'En tratamiento', 'Recuperado', 'Fallecido'
];

export default function InventarioBovino() {
  const navigate = useNavigate();
  const [bovinos, setBovinos] = useState([]);
  const [nuevo, setNuevo] = useState({ tipo: '', nombre: '', edad: '', raza: '', fechaNacimiento: '', fechaIngreso: '', procedencia: '', estadoSalud: '', fotoUrl: '' });
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);

  useEffect(() => {
    fetch('/api/bovinos')
      .then(res => res.json())
      .then(data => setBovinos(data));
  }, []);

  const handleChange = e => {
    setNuevo({ ...nuevo, [e.target.name]: e.target.value });
  };

  const handleFotoChange = e => {
    const file = e.target.files[0];
    setFotoFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFotoPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFotoPreview(null);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    let fotoUrl = '';
    if (fotoFile) {
      const formData = new FormData();
      formData.append('file', fotoFile);
      // Subir imagen al backend (debes crear el endpoint /api/bovinos/upload en el backend)
      const resImg = await fetch('/api/bovinos/upload', {
        method: 'POST',
        body: formData
      });
      if (resImg.ok) {
        const data = await resImg.json();
        fotoUrl = data.url;
      }
    }
    const res = await fetch('/api/bovinos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...nuevo, fotoUrl })
    });
    if (res.ok) {
      const bovino = await res.json();
      setBovinos([...bovinos, bovino]);
      setNuevo({ tipo: '', nombre: '', edad: '', raza: '', fechaNacimiento: '', fechaIngreso: '', procedencia: '', estadoSalud: '', fotoUrl: '' });
      setFotoFile(null);
      setFotoPreview(null);
    }
  };

  const handleEliminar = async (id) => {
    if(window.confirm('¿Seguro que deseas eliminar este bovino?')) {
      try {
        const res = await fetch(`/api/bovinos/${id}`, { method: 'DELETE' });
        if(res.ok) {
          setBovinos(bovinos.filter(x => x._id !== id));
          // Refrescar eventos en agenda si existe la función global
          if (window.refreshAgendaEventos) window.refreshAgendaEventos();
        }
        else {
          const data = await res.json();
          alert('No se pudo eliminar: ' + (data.error || 'Error desconocido.'));
        }
      } catch (err) {
        alert('Error de red al eliminar el bovino.');
      }
    }
  };

  const vacas = bovinos.filter(b => b.tipo === 'vaca');
  const toros = bovinos.filter(b => b.tipo === 'toro');

  const renderBovinoCard = b => (
    <div key={b._id} className="card" style={{minWidth:220, maxWidth:320, position:'relative', alignItems:'center', textAlign:'center'}}>
      {b.fotoUrl && <img src={b.fotoUrl} alt={b.nombre} style={{width:120, height:90, objectFit:'cover', borderRadius:10, marginBottom:8, boxShadow:'0 2px 8px #0001'}} />}
      <div style={{display:'flex', alignItems:'center', gap:10, justifyContent:'center'}}>
        <span style={{fontWeight:700, color:'#1976d2', fontSize:'1.1rem'}}>{b.tipo === 'vaca' ? '🐄' : '🐂'} {b.nombre || '(Sin nombre)'}</span>
        <span style={{background:'#e3f2fd', color:'#1976d2', borderRadius:6, padding:'2px 8px', fontSize:'0.9rem'}}>{b.raza}</span>
      </div>
      <div style={{fontSize:'0.97rem', color:'#444', margin:'6px 0'}}>
        Edad: <b>{b.edad || '-'}</b> años<br/>
        Nacimiento: {b.fechaNacimiento ? new Date(b.fechaNacimiento).toLocaleDateString() : '-'}<br/>
        Ingreso: {b.fechaIngreso ? new Date(b.fechaIngreso).toLocaleDateString() : '-'}<br/>
        Procedencia: {b.procedencia}<br/>
        Estado: <span style={{color: b.estadoSalud === 'Saludable' ? '#388e3c' : '#d32f2f', fontWeight:600}}>{b.estadoSalud}</span>
      </div>
      <button onClick={() => handleEliminar(b._id)}
        style={{position:'absolute', top:10, right:10, background:'#d32f2f', color:'#fff', border:'none', borderRadius:6, padding:'4px 10px', fontWeight:600, cursor:'pointer', fontSize:'0.95rem'}}
      >Eliminar</button>
    </div>
  );

  return (
    <div className="container">
      <button onClick={() => navigate('/')} style={{marginBottom:20, background:'#1976d2', color:'#fff', border:'none', borderRadius:8, padding:'0.5rem 1.2rem', fontWeight:600, cursor:'pointer'}}>← Volver al menú principal</button>
      <h2>Inventario Bovino</h2>
      <form onSubmit={handleSubmit}>
        <select name="tipo" value={nuevo.tipo} onChange={handleChange} required>
          <option value="">Tipo</option>
          <option value="vaca">Vaca</option>
          <option value="toro">Toro</option>
        </select>
        <input name="nombre" placeholder="Nombre" value={nuevo.nombre} onChange={handleChange} />
        <input name="edad" placeholder="Edad" value={nuevo.edad} onChange={handleChange} type="number" min="0" />
        <select name="raza" value={nuevo.raza} onChange={handleChange} required>
          <option value="">Raza</option>
          {RAZAS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <label style={{fontSize:'0.95rem', color:'#555'}}>Fecha de nacimiento
          <input name="fechaNacimiento" type="date" value={nuevo.fechaNacimiento} onChange={handleChange} />
        </label>
        <label style={{fontSize:'0.95rem', color:'#555'}}>Fecha de ingreso a la finca
          <input name="fechaIngreso" type="date" value={nuevo.fechaIngreso} onChange={handleChange} />
        </label>
        <select name="procedencia" value={nuevo.procedencia} onChange={handleChange} required>
          <option value="">Procedencia</option>
          {PROCEDENCIAS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select name="estadoSalud" value={nuevo.estadoSalud} onChange={handleChange} required>
          <option value="">Estado de salud</option>
          {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <input type="file" accept="image/*" onChange={handleFotoChange} />
        {fotoPreview && (
          <div style={{margin:'0.5rem 0'}}>
            <img src={fotoPreview} alt="Vista previa" style={{width:80, height:60, objectFit:'cover', borderRadius:8, boxShadow:'0 2px 8px #0001'}} />
          </div>
        )}
        <button type="submit">Agregar Bovino</button>
      </form>
      <div style={{display:'flex', gap:'2rem', flexWrap:'wrap', marginTop:'2rem', justifyContent:'center'}}>
        <div style={{flex:1, minWidth:320, maxWidth:600}}>
          <h3 style={{color:'#1976d2'}}>Vacas</h3>
          <div className="card-list" style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'1.2rem'}}>
            {vacas.length ? vacas.map(renderBovinoCard) : <span style={{color:'#888'}}>No hay vacas registradas.</span>}
          </div>
        </div>
        <div style={{flex:1, minWidth:320, maxWidth:600}}>
          <h3 style={{color:'#1976d2'}}>Toros</h3>
          <div className="card-list" style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'1.2rem'}}>
            {toros.length ? toros.map(renderBovinoCard) : <span style={{color:'#888'}}>No hay toros registrados.</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
