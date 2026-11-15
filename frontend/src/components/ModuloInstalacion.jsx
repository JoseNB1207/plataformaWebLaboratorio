// Componente: ModuloInstalacion
// Presenta la guía inicial obligatoria de preparación y configuración del entorno de trabajo
// (VirtualBox, Kali Linux, Burp Suite, FoxyProxy, etc.) dividida en misiones e instrucciones paso a paso.

import { useState, useMemo, useEffect } from "react";
import { MODULO_INSTALACION } from "../data/roadmapsData.js";
import { obtenerPasosCompletadosModulo, alternarPasoModulo } from "../data/progreso.js";

// Renderiza el texto de una instrucción reconociendo viñetas, bloques de código o comandos
// y párrafos regulares de texto para una presentación limpia y legible.
function renderizarTextoPaso(texto) {
  if (!texto) return null;
  const lineas = texto.split("\n");

  return lineas.map((linea, idx) => {
    const trimmed = linea.trim();
    if (!trimmed) return null;

    // Detectar viñetas o listas con guiones
    const matchBullet = trimmed.match(/^[•\-*]\s*(.*)/);
    if (matchBullet) {
      return (
        <div key={idx} className="rl-paso-bullet-item">
          <span className="rl-bullet-dot">▸</span>
          <span className="rl-bullet-texto">{matchBullet[1]}</span>
        </div>
      );
    }

    // Detectar comandos comunes de Linux o peticiones para aplicar estilo de código
    const esCodigo = /^\s*(GET|POST|PUT|DELETE)\s+\/|^\s*(sudo|apt|ping|curl|hydra|nmap|cat|ls|nc|bash|chmod|chown)\s/i.test(trimmed);
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

// Procesa el texto de la guía de instalación para separar el objetivo (Misión)
// de las instrucciones paso a paso individuales, omitiendo explicaciones secundarias.
function extraerDatosPaso(paso) {
  if (!paso || !paso.como) {
    return {
      objetivo: "",
      instrucciones: [{ num: 1, texto: paso?.titulo || "" }],
    };
  }

  const comoTexto = paso.como;

  // 1. Extraer el objetivo o misión principal
  const matchObj = comoTexto.match(/Objetivo:\s*([\s\S]*?)(?=\n\s*(?:Paso a paso|¿|Por qué|Como saber|En caso de|$))/i);
  const objetivo = matchObj ? matchObj[1].trim() : "";

  // 2. Extraer instrucciones numeradas del bloque "Paso a paso:"
  let instrucciones = [];
  const idxPasoAPaso = comoTexto.search(/Paso a paso:/i);
  if (idxPasoAPaso !== -1) {
    const subTexto = comoTexto.substring(idxPasoAPaso);
    const lineas = subTexto.split("\n");
    let itemActual = null;

    for (let i = 1; i < lineas.length; i++) {
      const lineaTrim = lineas[i].trim();
      // Detener al encontrar secciones accesorias
      if (lineaTrim.startsWith("¿") || /^(Por qué|Como saber|En caso de|Cómo saber)/i.test(lineaTrim)) break;

      const matchNum = lineaTrim.match(/^(\d+)\.\s+(.*)/);
      if (matchNum) {
        if (itemActual) instrucciones.push(itemActual);
        itemActual = { num: parseInt(matchNum[1], 10), texto: matchNum[2].trim() };
      } else if (itemActual && lineaTrim) {
        itemActual.texto += "\n" + lineaTrim;
      }
    }
    if (itemActual) instrucciones.push(itemActual);
  }

  // Si no hay lista numerada, se muestra el texto completo como un solo paso
  if (instrucciones.length === 0) {
    instrucciones = [{ num: 1, texto: comoTexto }];
  }

  return {
    objetivo,
    instrucciones,
  };
}

function ModuloInstalacion({ onVolver }) {
  // Datos estáticos del módulo de instalación inicial
  const modulo = MODULO_INSTALACION;

  // --- Estados locales del componente ---
  // Índice de la misión de instalación activa (0 a 12)
  const [pasoActualIdx, setPasoActualIdx] = useState(0);
  // Índice del subpaso actual dentro de la misión seleccionada
  const [subPasoIdx, setSubPasoIdx] = useState(0);
  // Contador para forzar actualización al modificar el progreso
  const [actualizador, setActualizador] = useState(0);
  // ID del bloque cuyo contenido fue copiado al portapapeles
  const [copiadoId, setCopiadoId] = useState(null);

  // Reiniciar al primer subpaso al cambiar de misión
  useEffect(() => {
    setSubPasoIdx(0);
  }, [pasoActualIdx]);

  // Lista de pasos completados guardados en localStorage
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pasosCompletados = useMemo(() =>
    obtenerPasosCompletadosModulo("INSTALACION", modulo.id),
    [modulo.id, actualizador]
  );

  // Alterna el estado de completado de un paso en el almacenamiento
  const togglePaso = (pasoIdx) => {
    alternarPasoModulo("INSTALACION", modulo.id, pasoIdx);
    setActualizador((prev) => prev + 1);
  };

  // Copia el comando o texto de referencia al portapapeles
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

  // Cálculos de progreso y datos de la misión en pantalla
  const totalPasos = modulo.pasos?.length || 0;
  const pasoActual = modulo.pasos?.[pasoActualIdx] || null;
  const pasoId = pasoActual ? `instalacion-p-${pasoActualIdx}` : null;
  const pasoCompletado = pasosCompletados.includes(pasoActualIdx);
  const copiado = copiadoId === pasoId;
  const porcentaje = totalPasos > 0 ? Math.round((pasosCompletados.length / totalPasos) * 100) : 0;

  // Extraer misión y subpasos independientes
  const datosPasoActual = useMemo(() => {
    return extraerDatosPaso(pasoActual);
  }, [pasoActual]);

  const totalSubPasos = datosPasoActual.instrucciones.length;
  const subPasoActual = datosPasoActual.instrucciones[subPasoIdx] || datosPasoActual.instrucciones[0];
  const esUltimoSubPaso = subPasoIdx === totalSubPasos - 1;

  // Navega al subpaso anterior
  const irSubPasoAnterior = () => {
    if (subPasoIdx > 0) {
      setSubPasoIdx((i) => i - 1);
    } else if (pasoActualIdx > 0) {
      const prevPaso = modulo.pasos?.[pasoActualIdx - 1];
      const prevDatos = extraerDatosPaso(prevPaso);
      setPasoActualIdx((p) => p - 1);
      setSubPasoIdx(Math.max(0, prevDatos.instrucciones.length - 1));
    }
  };

  // Avanza al siguiente subpaso
  const irSubPasoSiguiente = () => {
    if (subPasoIdx < totalSubPasos - 1) {
      setSubPasoIdx((i) => i + 1);
    }
  };

  // Marca la misión actual como resuelta y avanza a la siguiente
  const marcarYAvanzar = () => {
    if (!pasoCompletado) togglePaso(pasoActualIdx);
    if (pasoActualIdx < totalPasos - 1) {
      setPasoActualIdx((i) => i + 1);
      setSubPasoIdx(0);
    }
  };

  return (
    <div className="instalacion-vista pagina-fluida">

      {/* 1. SECCIÓN: Barra superior con botón de regreso */}
      <div className="instalacion-top-bar">
        {onVolver && (
          <button className="btn btn-secundario btn-volver" onClick={onVolver}>
            ← Volver
          </button>
        )}
      </div>

      {/* 2. SECCIÓN: Banner informativo inicial */}
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

      {/* 3. SECCIÓN: Barra de progreso de la instalación */}
      <div className="instalacion-progreso-bar-wrap">
        <div className="instalacion-progreso-info">
          <span>Progreso de instalación</span>
          <span><strong>{pasosCompletados.length}</strong> / {totalPasos} misiones ({porcentaje}%)</span>
        </div>
        <div className="instalacion-progreso-track">
          <div className="instalacion-progreso-fill" style={{ width: `${porcentaje}%` }} />
        </div>
      </div>

      {/* 4. SECCIÓN: Selector de misiones principales (1 a 13) */}
      <div className="instalacion-steps-nav">
        {modulo.pasos.map((paso, i) => {
          const hecho = pasosCompletados.includes(i);
          const esCurrent = i === pasoActualIdx;
          return (
            <button
              key={i}
              type="button"
              className={`instalacion-step-dot ${esCurrent ? "dot-current" : ""} ${hecho ? "dot-done" : ""}`}
              onClick={() => {
                setPasoActualIdx(i);
                setSubPasoIdx(0);
              }}
              title={`Misión ${i + 1}: ${paso.titulo}`}
            >
              {hecho ? "✓" : i + 1}
            </button>
          );
        })}
      </div>

      {/* 5. SECCIÓN: Panel del paso activo */}
      {pasoActual && (
        <div className={`instalacion-paso-panel ${pasoCompletado ? "paso-completado" : ""}`}>

          {/* Indicadores de subpasos de la misión actual */}
          <div className="rl-stepper-dots" style={{ marginBottom: "18px" }}>
            {datosPasoActual.instrucciones.map((_, i) => {
              const esCurrent = i === subPasoIdx;
              const hecho = i < subPasoIdx;
              return (
                <button
                  key={i}
                  type="button"
                  className={`rl-dot ${esCurrent ? "rl-dot--current" : ""} ${hecho ? "rl-dot--done" : ""}`}
                  onClick={() => setSubPasoIdx(i)}
                  title={`Paso ${i + 1}`}
                />
              );
            })}
          </div>

          {/* Cabecera con título del paso */}
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
              <span className="instalacion-paso-num">
                Misión {pasoActualIdx + 1} de {totalPasos} · Paso {subPasoIdx + 1} de {totalSubPasos}
              </span>
              <h2 className="instalacion-paso-titulo">{pasoActual.titulo}</h2>
            </div>
          </div>

          {/* Misión destacada */}
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
              <span className="rl-mision-texto">{datosPasoActual.objetivo}</span>
            </div>
          )}

          {/* Tarjeta del subpaso individual */}
          <div className="rl-paso-contenido-card">
            <div className="rl-paso-num-circulo">{subPasoActual.num}</div>
            <div className="rl-paso-texto-cuerpo">
              {renderizarTextoPaso(subPasoActual.texto)}
            </div>
          </div>

          {/* Consola con comandos o configuraciones de referencia */}
          {pasoActual.payload && esUltimoSubPaso && (
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

          {/* Controles de navegación */}
          <div className="rl-stepper-nav" style={{ marginTop: "24px" }}>
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
                className="btn btn-instalacion-next rl-btn-paso"
                onClick={irSubPasoSiguiente}
              >
                Siguiente paso →
              </button>
            ) : pasoActualIdx < totalPasos - 1 ? (
              <button
                type="button"
                className="btn btn-instalacion-next rl-btn-paso"
                onClick={marcarYAvanzar}
              >
                {pasoCompletado ? "Siguiente misión →" : "Completar y continuar →"}
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

      {/* 6. SECCIÓN: Mensaje de confirmación al completar el 100% */}
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