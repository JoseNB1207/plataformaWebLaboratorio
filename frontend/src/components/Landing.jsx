import { ROADMAP } from '../data/labsInfo.js';

function Landing({ onIrALabs, onIrARoadmap }) {
  const vistaPrevia = ROADMAP.slice(0, 4);

  return (
    <div className="landing">
      <div className="landing-fondo"></div>

      <div className="landing-hero">
        <span className="landing-logo">// lab.web.hacking</span>
        <h1 className="landing-titulo">
          Tu propio laboratorio de hacking web, siempre encendido.
        </h1>
        <p className="landing-descripcion">
          Convierte una Raspberry Pi en un servidor de aplicaciones
          vulnerables y controla cada laboratorio desde el navegador:
          enciéndelo, apágalo y ábrelo sin tocar una terminal.
        </p>

        <div className="landing-terminal">
          <div className="terminal-barra">
            <span className="terminal-punto punto-rojo"></span>
            <span className="terminal-punto punto-amarillo"></span>
            <span className="terminal-punto punto-verde"></span>
          </div>
          <div className="terminal-cuerpo">
            <p><span className="terminal-prompt">$</span> curl http://192.168.2.200:3001/labs</p>
            <p className="terminal-json">{'[{"nombre":"DVWA","estado":"running"},'}</p>
            <p className="terminal-json">{' {"nombre":"OWASP Juice Shop","estado":"running"}]'}</p>
            <p><span className="terminal-prompt">$</span> <span className="terminal-cursor">_</span></p>
          </div>
        </div>

        <div className="landing-accesos">
          <button className="btn btn-primario btn-landing" onClick={onIrALabs}>
            Ver mis laboratorios
          </button>
          <button className="btn btn-secundario btn-landing" onClick={onIrARoadmap}>
            Ver el roadmap
          </button>
        </div>
      </div>

      <div className="landing-flujo">
        <div className="paso">
          <span className="paso-num">1</span>
          <h3>Tu Pi aloja los laboratorios</h3>
          <p>Juice Shop, DVWA y los que agregues corren en contenedores Docker, siempre disponibles.</p>
        </div>
        <div className="paso-linea"></div>
        <div className="paso">
          <span className="paso-num">2</span>
          <h3>El agente traduce las órdenes</h3>
          <p>Un servicio en la propia Pi recibe cada acción y la ejecuta directo sobre Docker.</p>
        </div>
        <div className="paso-linea"></div>
        <div className="paso">
          <span className="paso-num">3</span>
          <h3>Tú controlas todo desde aquí</h3>
          <p>Enciende, apaga y abre cada laboratorio con un clic, desde cualquier navegador.</p>
        </div>
      </div>

      <div className="landing-labs">
        <div className="landing-labs-encabezado">
          <h2>Laboratorios del proyecto</h2>
          <button className="link-roadmap" onClick={onIrARoadmap}>
            Ver el roadmap completo
          </button>
        </div>
        <div className="landing-labs-grid">
          {vistaPrevia.map((lab) => (
            <div className="mini-lab" key={lab.nombre}>
              <span className="mini-lab-nivel">Nivel {lab.nivel}</span>
              <h3>{lab.nombre}</h3>
              <p>{lab.descripcion}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="landing-cta-final">
        <button className="btn btn-primario btn-landing" onClick={onIrALabs}>
          Entrar a mis laboratorios
        </button>
      </div>
    </div>
  );
}

export default Landing;