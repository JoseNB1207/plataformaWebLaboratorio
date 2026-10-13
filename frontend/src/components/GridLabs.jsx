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