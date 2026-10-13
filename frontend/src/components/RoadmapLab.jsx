import { useState, useMemo, useEffect } from 'react';
import { obtenerRoadmapLab } from '../data/labsInfo.js';
import {
  obtenerPasosCompletadosModulo,
  alternarPasoModulo,
  obtenerEstadisticasLab,
} from '../data/progreso.js';

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

function RoadmapLab({ nombreLab, moduloInicialId, ip }) {
  const dataLab = obtenerRoadmapLab(nombreLab);
  const modulos = dataLab?.modulos || [];

  const [moduloActivoId, setModuloActivoId] = useState(() => moduloInicialId || modulos[0]?.id || null);
  const [pasoActualIdx, setPasoActualIdx] = useState(0);
  const [actualizador, setActualizador] = useState(0);
  const [copiadoId, setCopiadoId] = useState(null);

  useEffect(() => {
    if (moduloInicialId) setModuloActivoId(moduloInicialId);
  }, [moduloInicialId]);

  // Al cambiar de módulo, volver al paso 0
  useEffect(() => {
    setPasoActualIdx(0);
  }, [moduloActivoId]);

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

  const irPasoAnterior = () => setPasoActualIdx((i) => Math.max(0, i - 1));
  const irPasoSiguiente = () => setPasoActualIdx((i) => Math.min(totalPasos - 1, i + 1));

  const marcarYAvanzar = () => {
    if (!pasoCompletado) {
      togglePaso(moduloActivo.id, pasoActualIdx);
    }
    if (pasoActualIdx < totalPasos - 1) {
      setPasoActualIdx((i) => i + 1);
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

              {/* Indicadores de puntos */}
              <div className="rl-stepper-dots">
                {moduloActivo.pasos.map((_, i) => {
                  const hecho = pasosCompletadosActivo.includes(i);
                  const esCurrent = i === pasoActualIdx;
                  return (
                    <button
                      key={i}
                      type="button"
                      className={`rl-dot ${esCurrent ? 'rl-dot--current' : ''} ${hecho ? 'rl-dot--done' : ''}`}
                      onClick={() => setPasoActualIdx(i)}
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
                  <span className="rl-paso-num">Paso {pasoActualIdx + 1} de {totalPasos}</span>
                  <h4 className="rl-paso-titulo">{pasoActual.titulo}</h4>
                </div>

                {pasoActual.como && (
                  <div className="rl-paso-cuerpo-texto">
                    {pasoActual.como.split('\n\n').map((parrafo, pIdx) => (
                      <p key={pIdx} className="rl-paso-parrafo">{parrafo}</p>
                    ))}
                  </div>
                )}

                {pasoActual.payload && (
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

                {/* Navegación entre pasos */}
                <div className="rl-stepper-nav">
                  <button
                    type="button"
                    className="btn btn-secundario rl-btn-paso"
                    disabled={pasoActualIdx === 0}
                    onClick={irPasoAnterior}
                  >
                    ← Anterior
                  </button>

                  <div className="rl-stepper-contador">
                    {pasoActualIdx + 1} / {totalPasos}
                  </div>

                  {pasoActualIdx < totalPasos - 1 ? (
                    <button
                      type="button"
                      className="btn btn-primario rl-btn-paso"
                      onClick={marcarYAvanzar}
                    >
                      {pasoCompletado ? 'Siguiente →' : 'Completar y continuar →'}
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
