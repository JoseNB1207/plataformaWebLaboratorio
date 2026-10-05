function NavBar({ ip, vista, irA, irAlHome, cambiarIp }) {
  return (
    <nav className="navbar">
      <button className="navbar-logo" onClick={irAlHome}>
        <span className="navbar-logo-icono">//</span> lab.web.hacking
      </button>

      <div className="navbar-links">
        <button
          className={`navbar-link ${vista === 'labs' ? 'navbar-link-activo' : ''}`}
          onClick={() => irA('labs')}
        >
          Laboratorios
        </button>
        <button
          className={`navbar-link ${vista === 'roadmap' ? 'navbar-link-activo' : ''}`}
          onClick={() => irA('roadmap')}
        >
          Roadmap
        </button>
      </div>

      <div className="navbar-ip">
        <span className="punto-estado"></span>
        <span className="navbar-ip-texto">{ip}</span>
        <button className="navbar-ip-cambiar" onClick={cambiarIp}>
          Cambiar
        </button>
      </div>
    </nav>
  );
}

export default NavBar;