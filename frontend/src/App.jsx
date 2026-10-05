import { useState, useEffect } from 'react';
import './App.css';
import { obtenerLabs, accionLab } from './api/agente.js';
import { RUTAS_LAB } from './data/labsInfo.js';
import Landing from './components/Landing.jsx';
import FormularioIp from './components/FormularioIp.jsx';
import NavBar from './components/NavBar.jsx';
import GridLabs from './components/GridLabs.jsx';
import DetalleLab from './components/DetalleLab.jsx';
import Roadmap from './components/Roadmap.jsx';

function App() {
  const [enLanding, setEnLanding] = useState(true);
  const [ip, setIp] = useState(null);
  const [inputIp, setInputIp] = useState('');
  const [labs, setLabs] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [vista, setVista] = useState('labs');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [labSeleccionado, setLabSeleccionado] = useState(null);

  useEffect(() => {
    const ipGuardada = localStorage.getItem('ip_pi');
    setIp(ipGuardada);
  }, []);

  const cargarLabs = () => {
    if (ip) {
      obtenerLabs(ip).then((datos) => setLabs(datos));
    }
  };

  useEffect(() => {
    cargarLabs();
  }, [ip]);

  const guardarIp = () => {
    localStorage.setItem('ip_pi', inputIp);
    setIp(inputIp);
  };

const cambiarIp = () => {
  localStorage.removeItem('ip_pi');
  setIp(null);
};

  const manejarAccion = async (nombre, accion) => {
    setCargando(true);
    await accionLab(ip, nombre, accion);
    await new Promise((r) => setTimeout(r, 1000));
    await cargarLabs();
    setCargando(false);
  };

  const abrirLab = (nombre) => {
    window.open(`http://${ip}${RUTAS_LAB[nombre] || '/'}`, '_blank');
  };

  const irA = (nuevaVista) => {
  setVista(nuevaVista);
  setLabSeleccionado(null);
};

const irAlHome = () => {
  setEnLanding(true);
};

  if (enLanding) {
    return (
      <Landing
        onIrALabs={() => { setVista('labs'); setEnLanding(false); }}
        onIrARoadmap={() => { setVista('roadmap'); setEnLanding(false); }}
      />
    );
  }

  if (!ip) {
    return (
      <FormularioIp
        inputIp={inputIp}
        setInputIp={setInputIp}
        onGuardar={guardarIp}
      />
    );
  }

  return (
   <div className="app-shell">
  <NavBar
    ip={ip}
    vista={vista}
    irA={irA}
    irAlHome={irAlHome}
    cambiarIp={cambiarIp}
  />

  <main className="app-main">
    {vista === 'labs' && !labSeleccionado && (
      <GridLabs labs={labs} onSeleccionar={setLabSeleccionado} />
    )}

    {vista === 'labs' && labSeleccionado && (
      <DetalleLab
        nombreLab={labSeleccionado}
        labs={labs}
        cargando={cargando}
        onVolver={() => setLabSeleccionado(null)}
        onAccion={manejarAccion}
        onAbrir={abrirLab}
      />
    )}

    {vista === 'roadmap' && (
      <Roadmap labs={labs} onAbrir={abrirLab} />
    )}
  </main>
</div>
  );
}

export default App;