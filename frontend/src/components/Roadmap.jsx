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