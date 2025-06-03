import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TEMPORADAS = [
  'Todo el año', 'Primavera', 'Verano', 'Otoño', 'Invierno'
];
const ZONAS = [
  'Baja', 'Media', 'Alta', 'Riego', 'Secano', 'Otra'
];

export default function Gramineas() {
  const navigate = useNavigate();
  const [gramineas, setGramineas] = useState([]);
  const [nueva, setNueva] = useState({ nombre: '', caracteristicas: '', beneficios: '', temporadas: '', zonasRecomendadas: '', imagenUrl: '' });
  const [imagenFile, setImagenFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    fetch('/api/gramineas')
      .then(res => res.json())
      .then(data => setGramineas(data));
  }, []);

  const handleChange = e => {
    setNueva({ ...nueva, [e.target.name]: e.target.value });
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

  const handleSubmit = async e => {
    e.preventDefault();
    let imagenUrl = '';
    if (imagenFile) {
      const formData = new FormData();
      formData.append('file', imagenFile);
      // Subir imagen al backend (debes crear el endpoint /api/gramineas/upload en el backend)
      const resImg = await fetch('/api/gramineas/upload', {
        method: 'POST',
        body: formData
      });
      if (resImg.ok) {
        const data = await resImg.json();
        imagenUrl = data.url;
      }
    }
    const res = await fetch('/api/gramineas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...nueva, imagenUrl })
    });
    if (res.ok) {
      const graminea = await res.json();
      setGramineas([...gramineas, graminea]);
      setNueva({ nombre: '', caracteristicas: '', beneficios: '', temporadas: '', zonasRecomendadas: '', imagenUrl: '' });
      setImagenFile(null);
      setPreview(null);
    }
  };

  // Convierte texto separado por salto de línea o coma en lista
  function toList(str) {
    if (!str) return [];
    return str.split(/\n|,/).map(s => s.trim()).filter(Boolean);
  }

  return (
    <div className="container">
      <button onClick={() => navigate('/')} style={{marginBottom:20, background:'#1976d2', color:'#fff', border:'none', borderRadius:8, padding:'0.5rem 1.2rem', fontWeight:600, cursor:'pointer'}}>← Volver al menú principal</button>
      <h2>Galería de Gramíneas</h2>
      <form onSubmit={handleSubmit}>
        <input name="nombre" placeholder="Nombre de la gramínea" value={nueva.nombre} onChange={handleChange} required />
        <textarea name="caracteristicas" placeholder="Características principales (una por línea o separadas por coma)" value={nueva.caracteristicas} onChange={handleChange} rows={2} style={{resize:'vertical'}} />
        <textarea name="beneficios" placeholder="Beneficios (uno por línea o separados por coma)" value={nueva.beneficios} onChange={handleChange} rows={2} style={{resize:'vertical'}} />
        <select name="temporadas" value={nueva.temporadas} onChange={handleChange} required>
          <option value="">Temporada recomendada</option>
          {TEMPORADAS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select name="zonasRecomendadas" value={nueva.zonasRecomendadas} onChange={handleChange} required>
          <option value="">Zona recomendada</option>
          {ZONAS.map(z => <option key={z} value={z}>{z}</option>)}
        </select>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {preview && (
          <div style={{margin:'0.5rem 0'}}>
            <img src={preview} alt="Vista previa" style={{width:120, height:80, objectFit:'cover', borderRadius:8, boxShadow:'0 2px 8px #0001'}} />
          </div>
        )}
        <button type="submit">Agregar Gramínea</button>
      </form>
      <div className="card-list" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1.2rem',
        justifyContent: 'center',
        alignItems: 'stretch',
        margin: '0 auto',
        maxWidth: 1100
      }}>
        {gramineas.map(g => (
          <div key={g._id} className="card" style={{alignItems:'center', textAlign:'center', minWidth:220, maxWidth:320, background:'#f8fafc', border:'1.5px solid #e0e0e0', boxShadow:'0 2px 12px #0001', margin:'0.5rem', position:'relative'}}>
            {g.imagenUrl && <img src={g.imagenUrl} alt={g.nombre} style={{width:180, height:120, objectFit:'cover', borderRadius:10, marginBottom:8, boxShadow:'0 2px 8px #0001'}} />}
            <h4 style={{color:'#1976d2', marginBottom:6, fontSize:'1.2rem'}}>{g.nombre}</h4>
            <div style={{margin:'4px 0'}}>
              <b style={{color:'#1976d2'}}>Características:</b>
              <div style={{display:'flex', flexWrap:'wrap', gap:'6px', justifyContent:'center', marginTop:4}}>
                {toList(g.caracteristicas).map((c, i) => (
                  <span key={i} style={{background:'#e3f2fd', color:'#1976d2', borderRadius:6, padding:'2px 10px', fontSize:'0.97rem', margin:0}}>{c}</span>
                ))}
              </div>
            </div>
            <div style={{margin:'4px 0'}}>
              <b style={{color:'#388e3c'}}>Beneficios:</b>
              <div style={{display:'flex', flexWrap:'wrap', gap:'6px', justifyContent:'center', marginTop:4}}>
                {toList(g.beneficios).map((b, i) => (
                  <span key={i} style={{background:'#e8f5e9', color:'#388e3c', borderRadius:6, padding:'2px 10px', fontSize:'0.97rem', margin:0}}>{b}</span>
                ))}
              </div>
            </div>
            <div style={{margin:'8px 0 0 0', fontSize:'0.97rem', color:'#555'}}>
              <b>Temporada:</b> {g.temporadas}<br/>
              <b>Zona:</b> {g.zonasRecomendadas}
            </div>
            <button onClick={async () => {
              if(window.confirm('¿Seguro que deseas eliminar esta gramínea?')) {
                try {
                  const res = await fetch(`/api/gramineas/${g._id}`, { method: 'DELETE' });
                  if(res.ok) {
                    setGramineas(gramineas.filter(x => x._id !== g._id));
                  } else {
                    const data = await res.json();
                    alert('No se pudo eliminar: ' + (data.error || 'Error desconocido.'));
                  }
                } catch (err) {
                  alert('Error de red al eliminar la gramínea.');
                }
              }
            }}
              style={{position:'absolute', top:10, right:10, background:'#d32f2f', color:'#fff', border:'none', borderRadius:6, padding:'4px 10px', fontWeight:600, cursor:'pointer', fontSize:'0.95rem'}}
            >Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  );
}
