import { useState, useEffect, useCallback } from 'react';
import './App.css';
import { obtenerUrlLab } from './data/labsInfo.js';
import { MODULO_INSTALACION } from './data/roadmapsData.js';
import Landing from './components/Landing.jsx';
import FormularioIp from './components/FormularioIp.jsx';
import NavBar from './components/NavBar.jsx';
import GridLabs from './components/GridLabs.jsx';
import DetalleLab from './components/DetalleLab.jsx';
import Roadmap from './components/Roadmap.jsx';
import ModuloInstalacion from './components/ModuloInstalacion.jsx';

function App() {
  const [enLanding, setEnLanding] = useState(true);
  const [ip, setIp] = useState(null);
  const [inputIp, setInputIp] = useState('');
  const [vista, setVista] = useState('labs'); // 'labs', 'roadmap', 'config-ip', 'instalacion'
  const [labSeleccionado, setLabSeleccionado] = useState(null);
  const [moduloSeleccionado, setModuloSeleccionado] = useState(null);
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    const ipGuardada = localStorage.getItem('ip_pi');
    if (ipGuardada) {
      setIp(ipGuardada);
      setInputIp(ipGuardada);
    }
  }, []);

  const guardarIp = () => {
    const ipLimpia = inputIp.trim();
    if (!ipLimpia) return;
    localStorage.setItem('ip_pi', ipLimpia);
    setIp(ipLimpia);
    // Volver a la vista previa o a laboratorios
    if (historial.length > 0) {
      volverAtras();
    } else {
      setVista('labs');
      setEnLanding(false);
    }
  };

  const abrirFormularioIp = () => {
    setHistorial((prev) => [...prev, { enLanding, vista, labSeleccionado, moduloSeleccionado }]);
    setEnLanding(false);
    setVista('config-ip');
  };

  const cambiarIp = () => {
    abrirFormularioIp();
  };

  const abrirLab = (nombre) => {
    const url = obtenerUrlLab(ip, nombre);
    window.open(url, '_blank');
  };

  const seleccionarLabConModulo = (nombreLab, moduloId = null) => {
    setHistorial((prev) => [...prev, { enLanding, vista, labSeleccionado, moduloSeleccionado }]);
    setEnLanding(false);
    setVista('labs');
    setLabSeleccionado(nombreLab);
    setModuloSeleccionado(moduloId);
  };

  const irA = (nuevaVista) => {
    setHistorial((prev) => [...prev, { enLanding, vista, labSeleccionado, moduloSeleccionado }]);
    setEnLanding(false);
    setVista(nuevaVista);
    setLabSeleccionado(null);
    setModuloSeleccionado(null);
  };

  const irAlHome = () => {
    setHistorial((prev) => [...prev, { enLanding, vista, labSeleccionado, moduloSeleccionado }]);
    setEnLanding(true);
  };

  const volverAtras = useCallback(() => {
    if (historial.length > 0) {
      const nuevoHistorial = [...historial];
      const estadoAnterior = nuevoHistorial.pop();
      setHistorial(nuevoHistorial);
      setEnLanding(estadoAnterior.enLanding);
      setVista(estadoAnterior.vista);
      setLabSeleccionado(estadoAnterior.labSeleccionado);
      setModuloSeleccionado(estadoAnterior.moduloSeleccionado);
    } else {
      // Si no hay historial previo, volver a la pantalla principal
      if (labSeleccionado) {
        setLabSeleccionado(null);
        setModuloSeleccionado(null);
      } else if (!enLanding) {
        setEnLanding(true);
      }
    }
  }, [historial, labSeleccionado, enLanding]);

  if (enLanding) {
    return (
      <Landing
        ip={ip}
        onIrALabs={() => irA('labs')}
        onIrARoadmap={() => irA('roadmap')}
        onIrAConfigIp={abrirFormularioIp}
      />
    );
  }

  if (vista === 'config-ip' || (!ip && !enLanding)) {
    return (
      <FormularioIp
        inputIp={inputIp}
        setInputIp={setInputIp}
        onGuardar={guardarIp}
        onVolver={volverAtras}
        esCambio={Boolean(ip)}
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
          <GridLabs
            ip={ip}
            onSeleccionar={(nombre) => seleccionarLabConModulo(nombre, null)}
            onVolver={volverAtras}
            onIrAInstalacion={() => irA('instalacion')}
          />
        )}

        {vista === 'labs' && labSeleccionado && (
          <DetalleLab
            nombreLab={labSeleccionado}
            moduloInicialId={moduloSeleccionado}
            ip={ip}
            onVolver={volverAtras}
            onAbrir={abrirLab}
          />
        )}

        {vista === 'roadmap' && (
          <Roadmap
            onSeleccionarLabModulo={seleccionarLabConModulo}
            onSeleccionarInstalacion={() => irA('instalacion')}
            onVolver={volverAtras}
          />
        )}

        {vista === 'instalacion' && (
          <ModuloInstalacion
            modulo={MODULO_INSTALACION}
            onVolver={volverAtras}
          />
        )}
      </main>
    </div>
  );
}

export default App;