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
  'OWASP WebGoat': ':8080/WebGoat/',
  bWAPP: ':8081/',
  PyGoat: ':8083/',
};

const ROADMAP = [
  { nombre: 'DVWA', nivel: 1, descripcion: 'Vulnerabilidades clásicas con niveles de dificultad ajustables.' },
  { nombre: 'OWASP Juice Shop', nivel: 1, descripcion: 'Más de 100 retos gamificados sobre una SPA moderna.' },
  { nombre: 'OWASP WebGoat', nivel: 2, descripcion: 'Lecciones guiadas paso a paso: inyección SQL, XXE, deserialización insegura.' },
  { nombre: 'bWAPP', nivel: 2, descripcion: 'Más de 100 vulnerabilidades distintas, cobertura amplia del OWASP Top 10.' },
  { nombre: 'PyGoat', nivel: 2, descripcion: 'Vulnerabilidades del OWASP Top 10 en una aplicación Django, con retos guiados.' },
  { nombre: 'crAPI', nivel: 3, descripcion: 'Vulnerabilidades específicas de APIs REST modernas: auth rota, IDOR.' },
  { nombre: 'NodeGoat', nivel: 3, descripcion: 'Vulnerabilidades propias del ecosistema Node.js/Express.' },
  { nombre: 'Hackazon', nivel: 3, descripcion: 'Simulación de una tienda e-commerce completa.' },
];



function Landing({ onIrALabs, onIrARoadmap }) {
  const vistaPrevia = ROADMAP.slice(0, 4);

  return (
    <div className="landing">
      <div className="landing-fondo"></div>

      <div className="landing-hero">
        <h1 className="landing-titulo">
          Tu propio laboratorio de hacking web, siempre encendido.
        </h1>
        <p className="landing-descripcion">
          Convierte una Raspberry Pi en un servidor de aplicaciones
          vulnerables y controla cada laboratorio desde el navegador:
          enciéndelo, apágalo y ábrelo sin tocar una terminal.
        </p>

        <div className="landing-terminal">
          <div className="terminal-barra">
            <span className="terminal-punto punto-rojo"></span>
            <span className="terminal-punto punto-amarillo"></span>
            <span className="terminal-punto punto-verde"></span>
          </div>
          <div className="terminal-cuerpo">
            <p><span className="terminal-prompt">$</span> curl http://aprendehackingweb</p>
            <p className="terminal-json">{'lABORATORIOS COMO DVWA,'}</p>
            <p className="terminal-json">{'JuiceShop'}</p>
            <p><span className="terminal-prompt">$</span> <span className="terminal-cursor">_</span></p>
          </div>
        </div>

        <div className="landing-accesos">
          <button className="btn btn-primario btn-landing" onClick={onIrALabs}>
            Ver mis laboratorios
          </button>
          <button className="btn btn-secundario btn-landing" onClick={onIrARoadmap}>
            Ver el roadmap
          </button>
        </div>
      </div>

      <div className="landing-flujo">
        <div className="paso">
          <span className="paso-num">1</span>
          <h3>Tu Pi aloja los laboratorios</h3>
          <p>Juice Shop, DVWA y los que agregues corren en contenedores Docker, siempre disponibles.</p>
        </div>
        <div className="paso-linea"></div>
        <div className="paso">
          <span className="paso-num">2</span>
          <h3>El agente traduce las órdenes</h3>
          <p>Un servicio en la propia Pi recibe cada acción y la ejecuta directo sobre Docker.</p>
        </div>
        <div className="paso-linea"></div>
        <div className="paso">
          <span className="paso-num">3</span>
          <h3>Tú controlas todo desde aquí</h3>
          <p>Enciende, apaga y abre cada laboratorio con un clic, desde cualquier navegador.</p>
        </div>
      </div>

      <div className="landing-labs">
        <div className="landing-labs-encabezado">
          <h2>Laboratorios del proyecto</h2>
          <button className="link-roadmap" onClick={onIrARoadmap}>
            Ver el roadmap completo
          </button>
        </div>
        <div className="landing-labs-grid">
          {vistaPrevia.map((lab) => (
            <div className="mini-lab" key={lab.nombre}>
              <span className="mini-lab-nivel">Nivel {lab.nivel}</span>
              <h3>{lab.nombre}</h3>
              <p>{lab.descripcion}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="landing-cta-final">
        <button className="btn btn-primario btn-landing" onClick={onIrALabs}>
          Entrar a mis laboratorios
        </button>
      </div>
    </div>
  );
}

function App() {
  const [vista, setVista] = useState('labs');
  const [ip, setIp] = useState(null);
  const [inputIp, setInputIp] = useState('');
  const [labs, setLabs] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

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



  const irA = (nuevaVista) => {
  setVista(nuevaVista);
  setMenuAbierto(false);
};

const irAlHome = () => {
  setEnLanding(true);
  setMenuAbierto(false);
};

const cambiarIp = () => {
  localStorage.removeItem('ip_pi');
  setIp(null);
  setMenuAbierto(false);
};

  const abrirLab = (nombre) => {
    window.open(`http://${ip}${RUTAS_LAB[nombre] || '/'}`, '_blank');
  };

 
  // Pantalla 1: formulario de IP
  const [enLanding, setEnLanding] = useState(true);

// ...

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
  <div className="encabezado-fila">
    <div>
      <h1 className="titulo">Laboratorios de Hacking Web</h1>
      <p className="ip-conectada">
        <span className="punto-estado"></span>
        Conectado a {ip}
      </p>
    </div>

    <button
      className="btn-hamburguesa"
      onClick={() => setMenuAbierto((abierto) => !abierto)}
      aria-label="Abrir menú"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>
  </div>

  {menuAbierto && (
    <div className="menu-desplegable">
      <button className="menu-item" onClick={irAlHome}>
        Inicio
      </button>
      <button
        className={`menu-item ${vista === 'labs' ? 'menu-item-activo' : ''}`}
        onClick={() => irA('labs')}
      >
        Laboratorios
      </button>
      <button
        className={`menu-item ${vista === 'roadmap' ? 'menu-item-activo' : ''}`}
        onClick={() => irA('roadmap')}
      >
        Roadmap
      </button>
      <div className="menu-separador"></div>
      <button className="menu-item menu-item-secundario" onClick={cambiarIp}>
        Cambiar IP de la Pi
      </button>
    </div>
  )}
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