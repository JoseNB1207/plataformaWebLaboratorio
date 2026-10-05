import { ROADMAP } from '../data/labsInfo.js';

function Roadmap({ labs, onAbrir }) {
  return (
    <div className="roadmap pagina-fluida">
      {ROADMAP.map((nodo, i) => {
        const labReal = labs.find((l) => l.nombre === nodo.nombre);
        const instalado = Boolean(labReal);
        const encendido = labReal?.estado === 'running';

        return (
          <div className="roadmap-fila" key={nodo.nombre}>
            <div className={`roadmap-nodo ${instalado ? 'nodo-instalado' : 'nodo-pendiente'}`}>
              <span className="roadmap-nivel">Nivel {nodo.nivel}</span>
              <h3 className="roadmap-nombre">{nodo.nombre}</h3>
              <p className="roadmap-descripcion">{nodo.descripcion}</p>

              {instalado ? (
                <button
                  className="btn btn-primario"
                  disabled={!encendido}
                  onClick={() => onAbrir(nodo.nombre)}
                >
                  {encendido ? 'Abrir laboratorio' : 'Enciéndelo desde Laboratorios'}
                </button>
              ) : (
                <span className="roadmap-pendiente-texto">Aún no desplegado en esta Pi</span>
              )}
            </div>
            {i < ROADMAP.length - 1 && <div className="roadmap-linea"></div>}
          </div>
        );
      })}
    </div>
  );
}

export default Roadmap;