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
