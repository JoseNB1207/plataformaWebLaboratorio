function FormularioIp({ inputIp, setInputIp, onGuardar, onVolver, esCambio }) {
  const manejarEnvio = (e) => {
    e.preventDefault();
    onGuardar();
  };

  return (
    <div className="pantalla-centrada">
      <div className="tarjeta-formulario-pro">
        {onVolver && (
          <button
            type="button"
            className="btn btn-secundario btn-volver-ip"
            onClick={onVolver}
          >
            ← Volver
          </button>
        )}

        <h1 className="formulario-titulo">
          {esCambio ? 'Cambiar IP de la Raspberry Pi' : 'Conectar con la Raspberry Pi'}
        </h1>
        <p className="formulario-subtitulo">
          Ingresa la dirección IP de tu Raspberry Pi para conectar la plataforma con tus laboratorios.
        </p>

        <form onSubmit={manejarEnvio} className="formulario-cuerpo">
          <input
            className="input-ip-simple"
            type="text"
            value={inputIp}
            onChange={(e) => setInputIp(e.target.value)}
            placeholder="Ejemplo: 192.168.1.100"
            autoFocus
            required
          />

          <button type="submit" className="btn btn-primario btn-conectar-pro">
            {esCambio ? 'Guardar y Continuar' : 'Conectar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default FormularioIp;