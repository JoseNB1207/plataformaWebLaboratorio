import RoadmapLab from './RoadmapLab.jsx';

function DetalleLab({
  nombreLab,
  moduloInicialId,
  ip,
  onVolver,
  onAbrir,
}) {
  return (
    <div className="detalle-lab pagina-fluida">
      <div className="detalle-barra-superior">
        <button className="btn btn-secundario btn-volver" onClick={onVolver}>
          ← Volver a laboratorios
        </button>
      </div>

      {/* Cabecera del Laboratorio */}
      <div className="detalle-banner-control">
        <div className="banner-control-info">
          <div className="banner-top-tags">
            <span className="badge-estado badge-running">
              Disponible
            </span>
          </div>

          <h2 className="detalle-titulo">{nombreLab}</h2>
        </div>

        <div className="banner-control-acciones">
          <button
            className="btn btn-primario btn-abrir-destacado"
            onClick={() => onAbrir(nombreLab)}
          >
            Abrir laboratorio ↗
          </button>
        </div>
      </div>

      {/* Itinerario de Módulos */}
      <RoadmapLab
        nombreLab={nombreLab}
        moduloInicialId={moduloInicialId}
        ip={ip}
      />
    </div>
  );
}

export default DetalleLab;