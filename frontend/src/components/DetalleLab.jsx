import { LAB_INFO } from '../data/labsInfo.js';
import { obtenerRetosCompletados, alternarReto } from '../data/progreso.js';
import { useState } from 'react';

function DetalleLab({ nombreLab, labs, cargando, onVolver, onAccion, onAbrir }) {
  const lab = labs.find((l) => l.nombre === nombreLab);
  const info = LAB_INFO[nombreLab] || {};
  const retos = info.retos || [];

  const [completados, setCompletados] = useState(() => obtenerRetosCompletados(nombreLab));

  const marcarReto = (indice) => {
    const nuevos = alternarReto(nombreLab, indice);
    setCompletados(nuevos);
  };

  const totalCompletados = completados.length;
  const totalRetos = retos.length;
  const porcentaje = totalRetos > 0 ? Math.round((totalCompletados / totalRetos) * 100) : 0;
  const completoAlCien = totalRetos > 0 && totalCompletados === totalRetos;

  return (
    <div className="detalle-lab pagina-fluida">
      <button className="btn btn-secundario btn-volver" onClick={onVolver}>
        ← Volver a laboratorios
      </button>

      <div className="detalle-grid">
        <div className="detalle-col-info">
          <span className="etiqueta-comentario">// laboratorio seleccionado</span>
          <h2 className="detalle-titulo">{nombreLab}</h2>
          <span
            className={`badge-estado ${
              lab?.estado === 'running' ? 'badge-running' : 'badge-exited'
            }`}
          >
            {lab?.estado === 'running' ? 'Encendido' : 'Apagado'}
          </span>

          <div className="detalle-acciones">
            <button
              className="btn btn-icono btn-encender"
              disabled={cargando}
              onClick={() => onAccion(nombreLab, 'start')}
            >
              Encender
            </button>
            <button
              className="btn btn-icono btn-apagar"
              disabled={cargando}
              onClick={() => onAccion(nombreLab, 'stop')}
            >
              Apagar
            </button>
            <button
              className="btn btn-primario"
              disabled={lab?.estado !== 'running'}
              onClick={() => onAbrir(nombreLab)}
            >
              Abrir laboratorio
            </button>
          </div>
        </div>

        <div className="detalle-col-guia">
          <p className="detalle-descripcion">{info.descripcion || 'Sin descripción disponible.'}</p>

          <span className="etiqueta-comentario">// guía para empezar</span>
          <div className="terminal-guia">
            {(info.guia || []).map((paso, i) => (
              <p key={i}>
                <span className="terminal-prompt">$</span> {paso}
              </p>
            ))}
          </div>

          {totalRetos > 0 && (
            <div className="progreso-seccion">
              <div className="progreso-encabezado">
                <span className="etiqueta-comentario">// retos</span>
                <span className={`progreso-contador ${completoAlCien ? 'progreso-completo' : ''}`}>
                  {totalCompletados}/{totalRetos} {completoAlCien ? '🏆 Completado' : ''}
                </span>
              </div>

              <div className="barra-progreso">
                <div
                  className="barra-progreso-relleno"
                  style={{ width: `${porcentaje}%` }}
                ></div>
              </div>

              <ul className="lista-retos">
                {retos.map((reto, i) => (
                  <li
                    key={i}
                    className={`reto-item ${completados.includes(i) ? 'reto-completado' : ''}`}
                    onClick={() => marcarReto(i)}
                  >
                    <span className="reto-checkbox">
                      {completados.includes(i) ? '✓' : ''}
                    </span>
                    <span className="reto-texto">{reto}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DetalleLab;