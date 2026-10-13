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