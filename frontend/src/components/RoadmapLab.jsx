// Componente: RoadmapLab
// Gestiona y renderiza el itinerario formativo de un laboratorio específico (DVWA, Juice Shop).
// Permite explorar los módulos de aprendizaje, navegar interactivamente paso a paso por cada misión,
// verificar flags de seguridad y registrar el avance del usuario en el almacenamiento local.

import { useState, useMemo, useEffect } from 'react';
import { obtenerRoadmapLab } from '../data/labsInfo.js';
import {
  obtenerPasosCompletadosModulo,
  alternarPasoModulo,
  obtenerEstadisticasLab,
  esFlagPasoVerificada,
} from '../data/progreso.js';
import VerificadorFlag from './VerificadorFlag.jsx';

// Conjunto de íconos vectoriales SVG para representar visualmente cada módulo
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

// Determina el estado de progreso de un módulo ('completado', 'activo' o 'pendiente')
function estadoMod(resueltos, total, esActivo) {
  if (total > 0 && resueltos === total) return 'completado';
  if (esActivo) return 'activo';
  return 'pendiente';
}

// Procesa el texto de una instrucción y lo divide en elementos visuales:
// viñetas (bullets), comandos o peticiones en bloque de código y párrafos estándar.
function renderizarTextoPaso(texto, formatearPayload) {
  if (!texto) return null;
  const textoProcesado = formatearPayload(texto);
  const lineas = textoProcesado.split('\n');

  return lineas.map((linea, idx) => {
    const trimmed = linea.trim();
    if (!trimmed) return null;

    // Detectar si la línea es un ítem con viñeta (bullet)
    const matchBullet = trimmed.match(/^[•\-*]\s*(.*)/);
    if (matchBullet) {
      return (
        <div key={idx} className="rl-paso-bullet-item">
          <span className="rl-bullet-dot">▸</span>
          <span className="rl-bullet-texto">{matchBullet[1]}</span>
        </div>
      );
    }

    // Detectar comandos de consola, métodos HTTP o URLs para aplicar formato de código
    const esCodigo = /^\s*(GET|POST|PUT|DELETE)\s+\/|^\s*(ping|curl|sqlmap|hydra|nmap|cat|ls|nc|bash)\s/i.test(trimmed);
    if (esCodigo) {
      return (
        <div key={idx} className="rl-paso-codigo-destacado">
          <code>{trimmed}</code>
        </div>
      );
    }

    // Párrafo de texto regular
    return (
      <p key={idx} className="rl-paso-linea">
        {linea}
      </p>
    );
  });
}

// Analiza el contenido textual del campo "como" de un paso:
// 1. Extrae el objetivo principal de la misión.
// 2. Desglosa cada paso numerado (1., 2., 3., etc.) en una instrucción independiente.
// 3. Omite secciones explicativas adicionales (¿Por qué?, ¿Qué significa?, etc.).
function extraerDatosPaso(paso) {
  if (!paso || !paso.como) {
    return {
      objetivo: '',
      instrucciones: [{ num: 1, texto: paso?.titulo || '' }],
    };
  }

  const comoTexto = paso.como;

  // 1. Extraer objetivo/misión
  const matchObj = comoTexto.match(/Objetivo:\s*([\s\S]*?)(?=\n\s*(?:Paso a paso|¿|Por qué|Como saber|En caso de|$))/i);
  const objetivo = matchObj ? matchObj[1].trim() : '';

  // 2. Extraer lista numerada de instrucciones
  let instrucciones = [];
  const idxPasoAPaso = comoTexto.search(/Paso a paso:/i);
  if (idxPasoAPaso !== -1) {
    const subTexto = comoTexto.substring(idxPasoAPaso);
    const lineas = subTexto.split('\n');
    let itemActual = null;

    for (let i = 1; i < lineas.length; i++) {
      const lineaTrim = lineas[i].trim();
      // Detener si inicia una sección explicativa secundaria
      if (lineaTrim.startsWith('¿') || /^(Por qué|Como saber|En caso de|Cómo saber)/i.test(lineaTrim)) break;

      const matchNum = lineaTrim.match(/^(\d+)\.\s+(.*)/);
      if (matchNum) {
        if (itemActual) instrucciones.push(itemActual);
        itemActual = { num: parseInt(matchNum[1], 10), texto: matchNum[2].trim() };
      } else if (itemActual && lineaTrim) {
        itemActual.texto += '\n' + lineaTrim;
      }
    }
    if (itemActual) instrucciones.push(itemActual);
  }

  // Si no hay pasos numerados, se presenta el texto completo como un paso único
  if (instrucciones.length === 0) {
    instrucciones = [{ num: 1, texto: comoTexto }];
  }

  return {
    objetivo,
    instrucciones,
  };
}

function RoadmapLab({ nombreLab, moduloInicialId, ip }) {
  // Carga de datos del laboratorio seleccionado
  const dataLab = obtenerRoadmapLab(nombreLab);
  const modulos = dataLab?.modulos || [];

  // Estados del componente
  // ID del módulo actualmente seleccionado
  const [moduloActivoId, setModuloActivoId] = useState(() => moduloInicialId || modulos[0]?.id || null);
  // Índice de la misión actual dentro del módulo (0 a N-1)
  const [pasoActualIdx, setPasoActualIdx] = useState(0);
  // Índice del subpaso individual actual dentro de la misión
  const [subPasoIdx, setSubPasoIdx] = useState(0);
  // Contador para forzar la actualización al cambiar datos en localStorage
  const [actualizador, setActualizador] = useState(0);
  // ID del elemento copiado recientemente al portapapeles
  const [copiadoId, setCopiadoId] = useState(null);

  // Sincronizar si cambia el módulo inicial desde las propiedades
  useEffect(() => {
    if (moduloInicialId) setModuloActivoId(moduloInicialId);
  }, [moduloInicialId]);

  // Al cambiar de módulo, reiniciar al primer paso y subpaso
  useEffect(() => {
    setPasoActualIdx(0);
    setSubPasoIdx(0);
  }, [moduloActivoId]);

  // Al cambiar de misión, reiniciar al primer subpaso
  useEffect(() => {
    setSubPasoIdx(0);
  }, [pasoActualIdx]);

  // Cálculo de estadísticas globales del laboratorio
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stats = useMemo(() => obtenerEstadisticasLab(nombreLab, modulos), [nombreLab, modulos, actualizador]);

  // Referencia al objeto del módulo activo
  const moduloActivo = useMemo(
    () => modulos.find((m) => m.id === moduloActivoId) || modulos[0] || null,
    [modulos, moduloActivoId]
  );

  // Lista de índices de pasos completados en el módulo activo
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pasosCompletadosActivo = useMemo(() => {
    if (!moduloActivo) return [];
    return obtenerPasosCompletadosModulo(nombreLab, moduloActivo.id);
  }, [nombreLab, moduloActivo, actualizador]);

  // Alterna el estado de completado de un paso en localStorage
  const togglePaso = (moduloId, pasoIdx) => {
    alternarPasoModulo(nombreLab, moduloId, pasoIdx);
    setActualizador((prev) => prev + 1);
  };

  // Reemplaza las variables comodín de IP con la IP real configurada
  const formatearPayload = (texto) => {
    if (!texto) return '';
    const ipVisual = ip || 'IP_PI';
    return texto.replace(/<IP_LAB>/g, ipVisual).replace(/<IP_PI>/g, ipVisual);
  };

  // Copia comandos o payloads al portapapeles del sistema
  const copiarPayload = async (e, texto, id) => {
    e.stopPropagation();
    const textoFinal = formatearPayload(texto);
    try {
      await navigator.clipboard.writeText(textoFinal);
      setCopiadoId(id);
      setTimeout(() => setCopiadoId(null), 2000);
    } catch {
      // Alternativa con textarea en caso de permisos restringidos del navegador
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

  // Índices y navegación entre módulos adyacentes
  const indiceActual = modulos.findIndex((m) => m.id === moduloActivo?.id);
  const moduloAnterior = indiceActual > 0 ? modulos[indiceActual - 1] : null;
  const moduloSiguiente = indiceActual < modulos.length - 1 ? modulos[indiceActual + 1] : null;
  const totalPasos = moduloActivo?.pasos?.length || 0;
  const porcentaje = totalPasos > 0 ? Math.round((pasosCompletadosActivo.length / totalPasos) * 100) : 0;

  // Datos del paso y subpaso en pantalla
  const pasoActual = moduloActivo?.pasos?.[pasoActualIdx] || null;
  const pasoId = pasoActual ? `${moduloActivo.id}-p-${pasoActualIdx}` : null;
  const pasoCompletado = pasosCompletadosActivo.includes(pasoActualIdx);
  const copiado = copiadoId === pasoId;

  // Comprueba si la flag de este paso ya fue validada
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const flagPasoOk = useMemo(() =>
    moduloActivo ? esFlagPasoVerificada(nombreLab, moduloActivo.id, pasoActualIdx) : false,
    [nombreLab, moduloActivo, pasoActualIdx, actualizador]
  );

  // Desglose del paso en objetivo e instrucciones independientes
  const datosPasoActual = useMemo(() => {
    return extraerDatosPaso(pasoActual);
  }, [pasoActual]);

  const totalSubPasos = datosPasoActual.instrucciones.length;
  const subPasoActual = datosPasoActual.instrucciones[subPasoIdx] || datosPasoActual.instrucciones[0];
  const esUltimoSubPaso = subPasoIdx === totalSubPasos - 1;

  // Navega al subpaso anterior (o a la misión previa si está al inicio)
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

  // Avanza al siguiente subpaso de la misión actual
  const irSubPasoSiguiente = () => {
    if (subPasoIdx < totalSubPasos - 1) {
      setSubPasoIdx((i) => i + 1);
    }
  };

  // Marca la misión como completada y pasa a la siguiente
  const marcarYAvanzarObjetivo = () => {
    if (!pasoCompletado) {
      togglePaso(moduloActivo.id, pasoActualIdx);
    }
    if (pasoActualIdx < totalPasos - 1) {
      setPasoActualIdx((i) => i + 1);
      setSubPasoIdx(0);
    }
  };

  // Mensaje de respaldo en caso de no encontrar datos del laboratorio
  if (!dataLab || modulos.length === 0) {
    return (
      <div className="roadmap-vacio">
        <p>No hay módulos definidos para este laboratorio.</p>
      </div>
    );
  }

  return (
    <div className="roadmap-lab-container">

      {/* 1. SECCIÓN: Barra de progreso general del laboratorio */}
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

      {/* 2. SECCIÓN: Título de los módulos */}
      <div className="rl-itinerario-header">
        <h3 className="rl-itinerario-titulo">Módulos de Aprendizaje</h3>
      </div>

      {/* 3. SECCIÓN: Cuadrícula de tarjetas de módulos */}
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

      {/* 4. SECCIÓN: Panel interactivo del módulo activo */}
      {moduloActivo && (
        <div className="rl-panel-activo">

          {/* Encabezado del módulo seleccionado */}
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

          {/* Visualizador interactivo de pasos (Stepper) */}
          {pasoActual && (
            <div className="rl-stepper">

              {/* Selector de misiones principales (si el módulo contiene más de una) */}
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

              {/* Indicadores de puntos (dots) por cada subpaso de la misión */}
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

                {/* Cabecera del paso con checkbox y título */}
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

                {/* Caja de Misión destacada */}
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

                {/* Contenedor del contenido del subpaso actual */}
                <div className="rl-paso-contenido-card">
                  <div className="rl-paso-num-circulo">{subPasoActual.num}</div>
                  <div className="rl-paso-texto-cuerpo">
                    {renderizarTextoPaso(subPasoActual.texto, formatearPayload)}
                  </div>
                </div>

                {/* Bloque de snippet/payload (se muestra solo en el último subpaso) */}
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

                {/* Verificador de flag (habilitado solo en el último subpaso) */}
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

                {/* Controles de navegación entre pasos */}
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

          {/* 5. SECCIÓN: Navegación entre módulos anterior y siguiente */}
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
