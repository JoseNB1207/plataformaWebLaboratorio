import { LAB_INFO } from '../data/labsInfo.js';
import { obtenerRetosCompletados } from '../data/progreso.js';

function GridLabs({ labs, onSeleccionar }) {
  return (
    <div className="grid-labs pagina-fluida">
      {labs.map((lab) => {
        const retos = LAB_INFO[lab.nombre]?.retos || [];
        const completados = obtenerRetosCompletados(lab.nombre);
        const tieneProgreso = retos.length > 0;
        const completoAlCien = tieneProgreso && completados.length === retos.length;

        return (
          <button
            key={lab.nombre}
            className="cuadro-lab"
            onClick={() => onSeleccionar(lab.nombre)}
          >
            {tieneProgreso && (
              <span className={`cuadro-lab-progreso ${completoAlCien ? 'progreso-completo' : ''}`}>
                {completados.length}/{retos.length} {completoAlCien ? '🏆' : ''}
              </span>
            )}
            <h2 className="cuadro-lab-nombre">{lab.nombre}</h2>
            <p className="cuadro-lab-mini">
              {(LAB_INFO[lab.nombre]?.descripcion || '').slice(0, 60)}
              {(LAB_INFO[lab.nombre]?.descripcion || '').length > 60 ? '…' : ''}
            </p>
          </button>
        );
      })}
    </div>
  );
}

export default GridLabs;