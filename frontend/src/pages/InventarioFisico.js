import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TIPOS_RECURSO = [
  'Herramienta', 'Maquinaria', 'Alimento', 'Suplemento', 'Cercado', 'Bebedero', 'Otro'
];
const CONDICIONES = [
  'Nueva', 'Buena', 'Regular', 'Mala', 'En reparación', 'Fuera de servicio'
];
const UBICACIONES = [
  'Bodega', 'Campo', 'Taller', 'Oficina', 'Otro'
];
const PROVEEDORES = [
  'Proveedor A', 'Proveedor B', 'Proveedor C', 'Otro'
];
const TIPOS_MEDICINA = [
  'Vacuna', 'Antibiótico', 'Desparasitante', 'Vitaminas', 'Otro'
];

export default function InventarioFisico() {
  const navigate = useNavigate();
  const [recursos, setRecursos] = useState([]);
  const [medicinas, setMedicinas] = useState([]);
  const [nuevoRecurso, setNuevoRecurso] = useState({ tipo: '', nombre: '', cantidad: '', fechaAdquisicion: '', proveedor: '', fechaVencimiento: '', observaciones: '', condicion: '', ultimaRevision: '', ubicacion: '' });
  const [nuevaMedicina, setNuevaMedicina] = useState({ nombre: '', tipo: '', cantidad: '', fechaIngreso: '', fechaVencimiento: '', proveedor: '', observaciones: '' });
  const [imagenFile, setImagenFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [medicinaImagenFile, setMedicinaImagenFile] = useState(null);
  const [medicinaPreview, setMedicinaPreview] = useState(null);

  useEffect(() => {
    fetch('/api/recursos').then(res => res.json()).then(setRecursos);
    fetch('/api/medicinas').then(res => res.json()).then(setMedicinas);
  }, []);

  const handleRecursoChange = e => {
    setNuevoRecurso({ ...nuevoRecurso, [e.target.name]: e.target.value });
  };
  const handleMedicinaChange = e => {
    setNuevaMedicina({ ...nuevaMedicina, [e.target.name]: e.target.value });
  };
  const handleFileChange = e => {
    const file = e.target.files[0];
    setImagenFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };
  const handleMedicinaFileChange = e => {
    const file = e.target.files[0];
    setMedicinaImagenFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setMedicinaPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setMedicinaPreview(null);
    }
  };

  const handleRecursoSubmit = async e => {
    e.preventDefault();
    let imagenUrl = '';
    if (imagenFile) {
      const formData = new FormData();
      formData.append('file', imagenFile);
      // Subir imagen al backend (debes crear el endpoint /api/recursos/upload en el backend)
      const resImg = await fetch('/api/recursos/upload', {
        method: 'POST',
        body: formData
      });
      if (resImg.ok) {
        const data = await resImg.json();
        imagenUrl = data.url;
      }
    }
    const res = await fetch('/api/recursos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...nuevoRecurso, imagenUrl })
    });
    if (res.ok) {
      const recurso = await res.json();
      setRecursos([...recursos, recurso]);
      setNuevoRecurso({ tipo: '', nombre: '', cantidad: '', fechaAdquisicion: '', proveedor: '', fechaVencimiento: '', observaciones: '', condicion: '', ultimaRevision: '', ubicacion: '' });
      setImagenFile(null);
      setPreview(null);
    }
  };

  const handleMedicinaSubmit = async e => {
    e.preventDefault();
    let imagenUrl = '';
    if (medicinaImagenFile) {
      const formData = new FormData();
      formData.append('file', medicinaImagenFile);
      // Subir imagen al backend (debes crear el endpoint /api/medicinas/upload en el backend)
      const resImg = await fetch('/api/medicinas/upload', {
        method: 'POST',
        body: formData
      });
      if (resImg.ok) {
        const data = await resImg.json();
        imagenUrl = data.url;
      }
    }
    const res = await fetch('/api/medicinas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...nuevaMedicina, imagenUrl })
    });
    if (res.ok) {
      const medicina = await res.json();
      setMedicinas([...medicinas, medicina]);
      setNuevaMedicina({ nombre: '', tipo: '', cantidad: '', fechaIngreso: '', fechaVencimiento: '', proveedor: '', observaciones: '' });
      setMedicinaImagenFile(null);
      setMedicinaPreview(null);
    }
  };

  return (
    <div className="container">
      <button onClick={() => navigate('/')} style={{marginBottom:20, background:'#1976d2', color:'#fff', border:'none', borderRadius:8, padding:'0.5rem 1.2rem', fontWeight:600, cursor:'pointer'}}>← Volver al menú principal</button>
      <h2>Inventario Físico</h2>
      <h3>Agregar Recurso</h3>
      <form onSubmit={handleRecursoSubmit}>
        <select name="tipo" value={nuevoRecurso.tipo} onChange={handleRecursoChange} required>
          <option value="">Tipo</option>
          {TIPOS_RECURSO.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input name="nombre" placeholder="Nombre" value={nuevoRecurso.nombre} onChange={handleRecursoChange} required />
        <input name="cantidad" placeholder="Cantidad" value={nuevoRecurso.cantidad} onChange={handleRecursoChange} type="number" min="0" />
        <label style={{fontSize:'0.95rem', color:'#555'}}>Fecha de adquisición
          <input name="fechaAdquisicion" type="date" value={nuevoRecurso.fechaAdquisicion} onChange={handleRecursoChange} />
        </label>
        <select name="proveedor" value={nuevoRecurso.proveedor} onChange={handleRecursoChange}>
          <option value="">Proveedor</option>
          {PROVEEDORES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        {/* Mostrar fecha de vencimiento solo si aplica */}
        {(nuevoRecurso.tipo === 'Alimento' || nuevoRecurso.tipo === 'Suplemento') && (
          <label style={{fontSize:'0.95rem', color:'#555'}}>Fecha de vencimiento
            <input name="fechaVencimiento" type="date" value={nuevoRecurso.fechaVencimiento} onChange={handleRecursoChange} />
          </label>
        )}
        <textarea name="observaciones" placeholder="Observaciones" value={nuevoRecurso.observaciones} onChange={handleRecursoChange} rows={2} style={{resize:'vertical'}} />
        <select name="condicion" value={nuevoRecurso.condicion} onChange={handleRecursoChange}>
          <option value="">Condición</option>
          {CONDICIONES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <label style={{fontSize:'0.95rem', color:'#555'}}>Última revisión
          <input name="ultimaRevision" type="date" value={nuevoRecurso.ultimaRevision} onChange={handleRecursoChange} />
        </label>
        <select name="ubicacion" value={nuevoRecurso.ubicacion} onChange={handleRecursoChange}>
          <option value="">Ubicación</option>
          {UBICACIONES.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {preview && (
          <div style={{margin:'0.5rem 0'}}>
            <img src={preview} alt="Vista previa" style={{width:80, height:60, objectFit:'cover', borderRadius:8, boxShadow:'0 2px 8px #0001'}} />
          </div>
        )}
        <button type="submit">Agregar Recurso</button>
      </form>
      <h3>Agregar Medicina</h3>
      <form onSubmit={handleMedicinaSubmit}>
        <input name="nombre" placeholder="Nombre" value={nuevaMedicina.nombre} onChange={handleMedicinaChange} required />
        <select name="tipo" value={nuevaMedicina.tipo} onChange={handleMedicinaChange} required>
          <option value="">Tipo</option>
          {TIPOS_MEDICINA.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input name="cantidad" placeholder="Cantidad" value={nuevaMedicina.cantidad} onChange={handleMedicinaChange} type="number" min="0" />
        <label style={{fontSize:'0.95rem', color:'#555'}}>Fecha de ingreso
          <input name="fechaIngreso" type="date" value={nuevaMedicina.fechaIngreso} onChange={handleMedicinaChange} />
        </label>
        <label style={{fontSize:'0.95rem', color:'#555'}}>Fecha de vencimiento
          <input name="fechaVencimiento" type="date" value={nuevaMedicina.fechaVencimiento} onChange={handleMedicinaChange} />
        </label>
        <select name="proveedor" value={nuevaMedicina.proveedor} onChange={handleMedicinaChange}>
          <option value="">Proveedor</option>
          {PROVEEDORES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <textarea name="observaciones" placeholder="Observaciones" value={nuevaMedicina.observaciones} onChange={handleMedicinaChange} rows={2} style={{resize:'vertical'}} />
        <input type="file" accept="image/*" onChange={handleMedicinaFileChange} />
        {medicinaPreview && (
          <div style={{margin:'0.5rem 0'}}>
            <img src={medicinaPreview} alt="Vista previa" style={{width:80, height:60, objectFit:'cover', borderRadius:8, boxShadow:'0 2px 8px #0001'}} />
          </div>
        )}
        <button type="submit">Agregar Medicina</button>
      </form>
      <div style={{display:'flex', gap:'2rem', flexWrap:'wrap', marginTop:'2rem', justifyContent:'center'}}>
        <div style={{flex:1, minWidth:320, maxWidth:600}}>
          <h3 style={{color:'#1976d2'}}>Medicinas</h3>
          <ul className="card-list" style={{display:'grid', gridTemplateColumns:'repeat(1, 1fr)', gap:'1.2rem'}}>
            {medicinas.length ? medicinas.map(m => (
              <li key={m._id} className="card" style={{alignItems:'center',textAlign:'center',position:'relative',background:'#f8fafc',border:'1.5px solid #e0e0e0',boxShadow:'0 2px 12px #0001',padding:'1.2rem 1rem'}}>
                {m.imagenUrl && <img src={m.imagenUrl.startsWith('http') ? m.imagenUrl : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${m.imagenUrl}`} alt={m.nombre} style={{width:120,height:80,objectFit:'cover',borderRadius:10,marginBottom:8,boxShadow:'0 2px 8px #0001'}} />}
                <h4 style={{color:'#1976d2',marginBottom:6,fontSize:'1.1rem'}}>{m.nombre}</h4>
                <div style={{fontSize:'0.97rem',color:'#444',margin:'6px 0'}}>
                  <b>Tipo:</b> {m.tipo}<br/>
                  <b>Cantidad:</b> {m.cantidad || '-'}<br/>
                  {m.fechaVencimiento && <><b>Vencimiento:</b> {new Date(m.fechaVencimiento).toLocaleDateString()}<br/></>}
                  <b>Proveedor:</b> {m.proveedor}<br/>
                  {m.observaciones && <><b>Obs.:</b> {m.observaciones}</>}
                </div>
                <button onClick={async () => {
                  if(window.confirm('¿Seguro que deseas eliminar esta medicina?')) {
                    try {
                      const res = await fetch(`/api/medicinas/${m._id}`, { method: 'DELETE' });
                      if(res.ok) {
                        setMedicinas(medicinas.filter(x => x._id !== m._id));
                      } else {
                        const data = await res.json();
                        alert('No se pudo eliminar: ' + (data.error || 'Error desconocido.'));
                      }
                    } catch (err) {
                      alert('Error de red al eliminar la medicina.');
                    }
                  }
                }}
                  style={{position:'absolute', top:10, right:10, background:'#d32f2f', color:'#fff', border:'none', borderRadius:6, padding:'4px 10px', fontWeight:600, cursor:'pointer', fontSize:'0.95rem'}}
                >Eliminar</button>
              </li>
            )) : <span style={{color:'#888'}}>No hay medicinas registradas.</span>}
          </ul>
        </div>
        <div style={{flex:1, minWidth:320, maxWidth:600}}>
          <h3 style={{color:'#1976d2'}}>Recursos</h3>
          <ul className="card-list" style={{display:'grid', gridTemplateColumns:'repeat(1, 1fr)', gap:'1.2rem'}}>
            {recursos.length ? recursos.map(r => (
              <li key={r._id} className="card" style={{alignItems:'center',textAlign:'center',position:'relative',background:'#f8fafc',border:'1.5px solid #e0e0e0',boxShadow:'0 2px 12px #0001',padding:'1.2rem 1rem'}}>
                {r.imagenUrl && <img src={r.imagenUrl.startsWith('http') ? r.imagenUrl : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${r.imagenUrl}`} alt={r.nombre} style={{width:120,height:80,objectFit:'cover',borderRadius:10,marginBottom:8,boxShadow:'0 2px 8px #0001'}} />}
                <h4 style={{color:'#1976d2',marginBottom:6,fontSize:'1.1rem'}}>{r.nombre}</h4>
                <div style={{fontSize:'0.97rem',color:'#444',margin:'6px 0'}}>
                  <b>Tipo:</b> {r.tipo}<br/>
                  <b>Cantidad:</b> {r.cantidad || '-'}<br/>
                  {r.fechaAdquisicion && <><b>Adquisición:</b> {new Date(r.fechaAdquisicion).toLocaleDateString()}<br/></>}
                  {r.fechaVencimiento && <><b>Vencimiento:</b> {new Date(r.fechaVencimiento).toLocaleDateString()}<br/></>}
                  {r.ultimaRevision && <><b>Últ. revisión:</b> {new Date(r.ultimaRevision).toLocaleDateString()}<br/></>}
                  <b>Proveedor:</b> {r.proveedor}<br/>
                  <b>Condición:</b> {r.condicion}<br/>
                  <b>Ubicación:</b> {r.ubicacion}<br/>
                  {r.observaciones && <><b>Obs.:</b> {r.observaciones}</>}
                </div>
                <button onClick={async () => {
                  if(window.confirm('¿Seguro que deseas eliminar este recurso?')) {
                    try {
                      const res = await fetch(`/api/recursos/${r._id}`, { method: 'DELETE' });
                      if(res.ok) {
                        setRecursos(recursos.filter(x => x._id !== r._id));
                      } else {
                        const data = await res.json();
                        alert('No se pudo eliminar: ' + (data.error || 'Error desconocido.'));
                      }
                    } catch (err) {
                      alert('Error de red al eliminar el recurso.');
                    }
                  }
                }}
                  style={{position:'absolute', top:10, right:10, background:'#d32f2f', color:'#fff', border:'none', borderRadius:6, padding:'4px 10px', fontWeight:600, cursor:'pointer', fontSize:'0.95rem'}}
                >Eliminar</button>
              </li>
            )) : <span style={{color:'#888'}}>No hay recursos registrados.</span>}
          </ul>
        </div>
      </div>
    </div>
  );
}
