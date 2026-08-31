import { useState, useEffect } from 'react';
import './App.css';

async function obtenerLabs(ip) {
  const respuesta = await fetch(`http://${ip}:3001/labs`);
  const datos = await respuesta.json();
  return datos;
}

async function accionLab(ip, nombre, accion) {
  const respuesta = await fetch(
    `http://${ip}:3001/labs/${encodeURIComponent(nombre)}/${accion}`,
    { method: 'POST' }
  );
  return respuesta.json();
}

const RUTAS_LAB = {              
  DVWA: '/dvwa/',                
  'OWASP Juice Shop': ':3000/',  
}; 

const ROADMAP = [
  { nombre: 'DVWA', nivel: 1, descripcion: 'Vulnerabilidades clásicas con niveles de dificultad ajustables.' },
  { nombre: 'OWASP Juice Shop', nivel: 1, descripcion: 'Más de 100 retos gamificados sobre una SPA moderna.' },
  { nombre: 'OWASP WebGoat', nivel: 2, descripcion: 'Lecciones guiadas paso a paso: inyección SQL, XXE, deserialización insegura.' },
  { nombre: 'bWAPP', nivel: 2, descripcion: 'Más de 100 vulnerabilidades distintas, cobertura amplia del OWASP Top 10.' },
  { nombre: 'Mutillidae II', nivel: 2, descripcion: 'Escenarios variados con modo de pistas configurable.' },
  { nombre: 'crAPI', nivel: 3, descripcion: 'Vulnerabilidades específicas de APIs REST modernas: auth rota, IDOR.' },
  { nombre: 'NodeGoat', nivel: 3, descripcion: 'Vulnerabilidades propias del ecosistema Node.js/Express.' },
  { nombre: 'Hackazon', nivel: 3, descripcion: 'Simulación de una tienda e-commerce completa.' },
];

function App() {
  const [vista, setVista] = useState('labs');
  const [ip, setIp] = useState(null);
  const [inputIp, setInputIp] = useState('');
  const [labs, setLabs] = useState([]);
  const [cargando, setCargando] = useState(false);

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

  // Pantalla 1: formulario de IP
  if (!ip) {
    return (
      <div className="pantalla-centrada">
        <div className="tarjeta-formulario">
          <h1 className="titulo">Laboratorio de Hacking Web</h1>
          <p className="subtitulo">Registra la IP de tu Raspberry Pi</p>
          <input
            className="input-ip"
            type="text"
            value={inputIp}
            onChange={(e) => setInputIp(e.target.value)}
            placeholder="192.168.2.200"
          />
          <button className="btn btn-primario" onClick={guardarIp}>
            Conectar
          </button>
        </div>
      </div>
    );
  }

  // Pantalla 2: laboratorios / roadmap
  return (
    <div className="contenedor">
      <header className="encabezado">
        <h1 className="titulo">Laboratorios de Hacking Web</h1>
        <p className="ip-conectada">
          <span className="punto-estado"></span>
          Conectado a {ip}
        </p>
        <nav className="tabs-nav">
          <button
            className={`tab-btn ${vista === 'labs' ? 'tab-activo' : ''}`}
            onClick={() => setVista('labs')}
          >
            Laboratorios
          </button>
          <button
            className={`tab-btn ${vista === 'roadmap' ? 'tab-activo' : ''}`}
            onClick={() => setVista('roadmap')}
          >
            Roadmap
          </button>
        </nav>
      </header>

      {vista === 'labs' && (
        <div className="lista-labs">
          {labs.map((lab) => (
            <div className="tarjeta-lab" key={lab.nombre}>
              <div className="info-lab">
                <h2 className="nombre-lab">{lab.nombre}</h2>
                <span
                  className={`badge-estado ${
                    lab.estado === 'running' ? 'badge-running' : 'badge-exited'
                  }`}
                >
                  {lab.estado === 'running' ? 'Encendido' : 'Apagado'}
                </span>
              </div>

              <div className="acciones-lab">
                <button
                  className="btn btn-icono btn-encender"
                  disabled={cargando}
                  onClick={() => manejarAccion(lab.nombre, 'start')}
                >
                  Encender
                </button>
                <button
                  className="btn btn-icono btn-apagar"
                  disabled={cargando}
                  onClick={() => manejarAccion(lab.nombre, 'stop')}
                >
                  Apagar
                </button>
                <button
                  className="btn btn-primario"
                  disabled={lab.estado !== 'running'}
                  onClick={() => abrirLab(lab.nombre)}
                >
                  Abrir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {vista === 'roadmap' && (
        <div className="roadmap">
          {ROADMAP.map((nodo, i) => {
            const labReal = labs.find((l) => l.nombre === nodo.nombre);
            const instalado = Boolean(labReal);
            const encendido = labReal?.estado === 'running';

            return (
              <div className="roadmap-fila" key={nodo.nombre}>
                <div className={`roadmap-nodo ${instalado ? 'nodo-instalado' : 'nodo-pendiente'}`}>
                  <span className="roadmap-nivel">Nivel {nodo.nivel}</span>
                  <h3 className="roadmap-nombre">{nodo.nombre}</h3>
                  <p className="roadmap-descripcion">{nodo.descripcion}</p>

                  {instalado ? (
                    <button
                      className="btn btn-primario"
                      disabled={!encendido}
                      onClick={() => abrirLab(nodo.nombre)}
                    >
                      {encendido ? 'Abrir laboratorio' : 'Enciéndelo desde Laboratorios'}
                    </button>
                  ) : (
                    <span className="roadmap-pendiente-texto">Aún no desplegado en esta Pi</span>
                  )}
                </div>
                {i < ROADMAP.length - 1 && <div className="roadmap-linea"></div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default App;