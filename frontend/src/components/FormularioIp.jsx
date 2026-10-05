function FormularioIp({ inputIp, setInputIp, onGuardar }) {
  return (
    <div className="pantalla-centrada">
      <div className="tarjeta-formulario">
        <h1 className="titulo">Laboratorio de Hacking Web</h1>
        <p className="subtitulo">Registra la IP de tu Raspberry Pi</p>
        <input
          className="input-ip"
          type="text"
          value={inputIp}
          onChange={(e) => setInputIp(e.target.value)}
          placeholder="192.168.2.200"
        />
        <button className="btn btn-primario" onClick={onGuardar}>
          Conectar
        </button>
      </div>
    </div>
  );
}

export default FormularioIp;