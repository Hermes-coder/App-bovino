import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useNavigate } from 'react-router-dom';

const EVENT_TYPES = [
  { value: 'Nacimiento', label: 'Nacimiento', icon: '🐣', manual: true },
  // { value: 'Ingreso', label: 'Ingreso a la finca', icon: '🏡' }, // solo automático
  // { value: 'Llegada', label: 'Llegada de ganado', icon: '🚚' }, // solo automático
  { value: 'Vacunación', label: 'Vacunación', icon: '💉', manual: true },
  { value: 'Control sanitario', label: 'Control sanitario', icon: '🩺', manual: true },
  { value: 'Revisión veterinaria', label: 'Revisión veterinaria', icon: '👨‍⚕️', manual: true },
  { value: 'Parto', label: 'Parto', icon: '🐮', manual: true },
  { value: 'Ingreso de recurso', label: 'Ingreso de recurso', icon: '📦' }, // cambiado a caja
  { value: 'Revisión de recurso', label: 'Revisión de recurso', icon: '🔧' }, // cambiado a llave inglesa
  { value: 'Ingreso de medicina', label: 'Ingreso de medicina', icon: '🧪' }, // icono cambiado a tubo de ensayo
  { value: 'Vencimiento de medicina', label: 'Vencimiento de medicina', icon: '⌛' }, // icono cambiado a reloj de arena
  { value: 'Otro', label: 'Otro', icon: '📌', manual: true },
];

function getEventIcon(tipo) {
  const found = EVENT_TYPES.find(e => e.value === tipo);
  return found ? found.icon : '📌';
}

export default function Agenda() {
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [nuevoEvento, setNuevoEvento] = useState({ tipo: '', descripcion: '', fecha: '' });
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetch('/api/eventos')
      .then(res => res.json())
      .then(data => setEventos(data));
    // Permitir refresco global desde otros módulos
    window.refreshAgendaEventos = () => {
      fetch('/api/eventos')
        .then(res => res.json())
        .then(data => setEventos(data));
    };
    return () => { window.refreshAgendaEventos = null; };
  }, []);

  const handleChange = e => {
    setNuevoEvento({ ...nuevoEvento, [e.target.name]: e.target.value });
  };

  const handleDateChange = date => {
    setSelectedDate(date);
    // Formatear la fecha seleccionada como YYYY-MM-DD y forzar hora 12:00:00 local para evitar desfase por zona horaria
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    // Crear un string de fecha absoluta
    setNuevoEvento({ ...nuevoEvento, fecha: `${year}-${month}-${day}T12:00:00` });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    // Si la fecha viene en formato YYYY-MM-DD, forzar a YYYY-MM-DDT12:00:00
    let eventoAEnviar = { ...nuevoEvento };
    if (/^\d{4}-\d{2}-\d{2}$/.test(eventoAEnviar.fecha)) {
      eventoAEnviar.fecha = eventoAEnviar.fecha + 'T12:00:00';
    }
    const res = await fetch('/api/eventos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventoAEnviar)
    });
    if (res.ok) {
      const evento = await res.json();
      setEventos([...eventos, evento]);
      setNuevoEvento({ tipo: '', descripcion: '', fecha: eventoAEnviar.fecha });
    }
  };

  // Eventos del día seleccionado (mostrar todos los eventos cuyo bovino no es null o no tiene bovino)
  const eventosDelDia = eventos.filter(ev =>
    ev.fecha && new Date(ev.fecha).toDateString() === selectedDate.toDateString() &&
    (ev.bovino === undefined || ev.bovino !== null)
  ).filter(ev => ev.bovino !== null); // filtra eventos de bovinos eliminados

  // Pines en el calendario (mostrar todos los eventos cuyo bovino no es null o no tiene bovino)
  function tileContent({ date, view }) {
    if (view === 'month') {
      const eventosDia = eventos.filter(ev =>
        ev.fecha && new Date(ev.fecha).toDateString() === date.toDateString() &&
        (ev.bovino === undefined || ev.bovino !== null)
      );
      return (
        <span>
          {eventosDia.map(ev => (
            <span key={ev._id} title={ev.tipo} style={{fontSize:'1.1rem', marginRight:2}}>{getEventIcon(ev.tipo)}</span>
          ))}
        </span>
      );
    }
    return null;
  }

  return (
    <div className="container">
      <button onClick={() => navigate('/')} style={{marginBottom:20, background:'#1976d2', color:'#fff', border:'none', borderRadius:8, padding:'0.5rem 1.2rem', fontWeight:600, cursor:'pointer'}}>← Volver al menú principal</button>
      <h2>Agenda de Actividades</h2>
      <div style={{display:'flex', flexWrap:'wrap', gap:'2rem'}}>
        <div style={{minWidth:320, flex:2}}>
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            tileContent={tileContent}
            calendarType="ISO 8601"
          />
        </div>
        <div style={{flex:1, minWidth:260}}>
          <form onSubmit={handleSubmit}>
            <select name="tipo" value={nuevoEvento.tipo} onChange={handleChange} required>
              <option value="">Tipo de evento</option>
              {EVENT_TYPES.filter(e => e.manual).map(e => (
                <option key={e.value} value={e.value}>{e.icon} {e.label}</option>
              ))}
            </select>
            <input name="descripcion" placeholder="Descripción" value={nuevoEvento.descripcion} onChange={handleChange} />
            <button type="submit">Agregar Evento</button>
          </form>
          <div style={{marginTop:'2rem'}}>
            <h4 style={{marginBottom:8}}>Eventos del {selectedDate.toLocaleDateString()}:</h4>
            <ul>
              {eventosDelDia.length ? eventosDelDia.map(ev => (
                <li key={ev._id} style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontSize:'1.2rem', marginRight:6}}>{getEventIcon(ev.tipo)}</span>
                  <b style={{color:'#1976d2'}}>{ev.tipo}</b> - {ev.descripcion}
                  <button
                    onClick={async () => {
                      if(window.confirm('¿Seguro que deseas eliminar este evento?')) {
                        try {
                          const res = await fetch(`/api/eventos/${ev._id}`, { method: 'DELETE' });
                          if(res.ok) {
                            setEventos(eventos.filter(x => x._id !== ev._id));
                          } else {
                            const data = await res.json();
                            alert('No se pudo eliminar: ' + (data.error || 'Error desconocido.'));
                          }
                        } catch (err) {
                          alert('Error de red al eliminar el evento.');
                        }
                      }
                    }}
                    style={{marginLeft:10, background:'#d32f2f', color:'#fff', border:'none', borderRadius:6, padding:'2px 8px', fontWeight:600, cursor:'pointer', fontSize:'0.95rem'}}
                  >Eliminar</button>
                </li>
              )) : <span style={{color:'#888'}}>No hay eventos para este día.</span>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
