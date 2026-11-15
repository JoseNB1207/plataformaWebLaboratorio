// Componente: VerificadorFlag
// Permite al estudiante validar las evidencias o flags obtenidas durante la práctica
// de cada misión, mostrando pistas de ubicación y retroalimentación inmediata sobre la respuesta.

import { useState, useRef, useEffect } from 'react';
import { verificarFlagPaso, esFlagPasoVerificada, revocarFlagPaso } from '../data/progreso.js';
import './VerificadorFlag.css';

function VerificadorFlag({
  nombreLab,
  moduloId,
  pasoIdx,
  flagCorrecta,
  flagsAceptadas = [],
  dondeEncontrarla,
  quePoner,
  objetivoFlag,
  onVerificado,
}) {
  // --- Estados locales del componente ---
  // Valor actual ingresado por el usuario en el campo de texto
  const [entrada, setEntrada] = useState('');
  // Mensaje de retroalimentación en caso de respuesta incorrecta
  const [errorMsg, setErrorMsg] = useState(null);
  // Referencia al input para control de foco
  const inputRef = useRef(null);

  // Estado de validación del paso actual consultado en localStorage
  const yaVerificada = esFlagPasoVerificada(nombreLab, moduloId, pasoIdx);
  const [estaVerificada, setEstaVerificada] = useState(yaVerificada);

  // Actualizar el estado si el usuario cambia de módulo o de paso
  useEffect(() => {
    setEstaVerificada(esFlagPasoVerificada(nombreLab, moduloId, pasoIdx));
    setEntrada('');
    setErrorMsg(null);
  }, [nombreLab, moduloId, pasoIdx]);

  // Ejecuta la validación de la respuesta contra la flag esperada
  const intentarVerificar = () => {
    const textoAValidar = entrada.trim();
    if (!textoAValidar) return;

    // Comprobar la respuesta utilizando la función de persistencia
    const ok = verificarFlagPaso(nombreLab, moduloId, pasoIdx, textoAValidar, flagCorrecta, flagsAceptadas);
    if (ok) {
      setEstaVerificada(true);
      setErrorMsg(null);
      onVerificado?.();
    } else {
      setErrorMsg('Respuesta incorrecta. Revisa la pista e inténtalo de nuevo.');
    }
  };

  // Permite enviar la respuesta al presionar la tecla Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      intentarVerificar();
    }
  };

  // Restablece el paso al estado no verificado
  const reiniciarPaso = () => {
    revocarFlagPaso(nombreLab, moduloId, pasoIdx);
    setEstaVerificada(false);
    setEntrada('');
    setErrorMsg(null);
    onVerificado?.();
  };

  // Pista orientativa para guiar al estudiante sobre dónde localizar la evidencia
  const textoPista = dondeEncontrarla || 'Localiza la evidencia en tu entorno e ingresa el resultado.';

  // VISTA 1: El paso ya ha sido validado satisfactoriamente
  if (estaVerificada) {
    return (
      <div className="vf-min-box vf-min-box--ok">
        <div className="vf-min-ok-info">
          <span className="vf-min-ok-check">✓</span>
          <span className="vf-min-ok-txt">Paso validado</span>
        </div>
        <button
          type="button"
          className="vf-min-btn-reiniciar"
          onClick={reiniciarPaso}
          title="Reiniciar validación"
        >
          Reiniciar
        </button>
      </div>
    );
  }

  // VISTA 2: Formulario activo para ingresar y validar la flag
  return (
    <div className="vf-min-box">
      {/* Pista orientativa */}
      <div className="vf-min-pista">
        <span className="vf-min-pista-label">Pista:</span>
        <span className="vf-min-pista-txt">{textoPista}</span>
      </div>

      {/* Campo de entrada y botón de validación */}
      <div className="vf-min-form">
        <input
          ref={inputRef}
          type="text"
          className={`vf-min-input ${errorMsg ? 'vf-min-input--error' : ''}`}
          placeholder="Ingresa la flag o evidencia..."
          value={entrada}
          onChange={(e) => {
            setEntrada(e.target.value);
            if (errorMsg) setErrorMsg(null);
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck={false}
        />

        <button
          type="button"
          className="btn btn-primario vf-min-btn-validar"
          onClick={intentarVerificar}
          disabled={!entrada.trim()}
        >
          Validar
        </button>
      </div>

      {/* Mensaje de error discreto */}
      {errorMsg && (
        <span className="vf-min-error-txt">{errorMsg}</span>
      )}
    </div>
  );
}

export default VerificadorFlag;