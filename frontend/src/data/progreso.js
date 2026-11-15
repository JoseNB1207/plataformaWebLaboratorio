// Módulo de Persistencia de Progreso
// Gestiona el almacenamiento local (localStorage) del progreso del usuario
// en los laboratorios de ciberseguridad, incluyendo retos completados, pasos de módulos y validación de flags.

// Claves utilizadas en localStorage
const CLAVE_PROGRESO = 'progreso_labs';
const CLAVE_PASOS = 'progreso_pasos_modulos';
const CLAVE_FLAGS = 'progreso_flags_verificadas';

// Lee y parsea de forma segura un objeto JSON desde localStorage
function leerJSON(clave) {
  try {
    const datos = localStorage.getItem(clave);
    return datos ? JSON.parse(datos) : {};
  } catch {
    return {};
  }
}

// Serializa y guarda un valor en localStorage
function guardarJSON(clave, valor) {
  localStorage.setItem(clave, JSON.stringify(valor));
}

// --- Retos clásicos del lab ---
export function obtenerRetosCompletados(nombreLab) {
  const progreso = leerJSON(CLAVE_PROGRESO);
  return progreso[nombreLab] || [];
}

export function alternarReto(nombreLab, indiceReto) {
  const progreso = leerJSON(CLAVE_PROGRESO);
  const completados = new Set(progreso[nombreLab] || []);

  if (completados.has(indiceReto)) {
    completados.delete(indiceReto);
  } else {
    completados.add(indiceReto);
  }

  progreso[nombreLab] = Array.from(completados);
  guardarJSON(CLAVE_PROGRESO, progreso);
  return progreso[nombreLab];
}

// --- Pasos por Módulo del Roadmap ---
export function obtenerPasosCompletadosModulo(nombreLab, moduloId) {
  const progreso = leerJSON(CLAVE_PASOS);
  const claveModulo = `${nombreLab}::${moduloId}`;
  return progreso[claveModulo] || [];
}

export function alternarPasoModulo(nombreLab, moduloId, pasoIndex) {
  const progreso = leerJSON(CLAVE_PASOS);
  const claveModulo = `${nombreLab}::${moduloId}`;
  const completados = new Set(progreso[claveModulo] || []);

  if (completados.has(pasoIndex)) {
    completados.delete(pasoIndex);
  } else {
    completados.add(pasoIndex);
  }

  progreso[claveModulo] = Array.from(completados);
  guardarJSON(CLAVE_PASOS, progreso);
  return progreso[claveModulo];
}

export function marcarTodosPasosModulo(nombreLab, moduloId, totalPasos, marcarTodos) {
  const progreso = leerJSON(CLAVE_PASOS);
  const claveModulo = `${nombreLab}::${moduloId}`;

  if (marcarTodos) {
    progreso[claveModulo] = Array.from({ length: totalPasos }, (_, i) => i);
  } else {
    progreso[claveModulo] = [];
  }

  guardarJSON(CLAVE_PASOS, progreso);
  return progreso[claveModulo];
}

export function obtenerEstadisticasLab(nombreLab, modulos) {
  if (!modulos || modulos.length === 0) {
    return { totalPasos: 0, pasosCompletados: 0, modulosCompletados: 0, porcentaje: 0 };
  }

  let totalPasos = 0;
  let pasosCompletados = 0;
  let modulosCompletados = 0;

  modulos.forEach((mod) => {
    const totalModulo = mod.pasos?.length || 0;
    totalPasos += totalModulo;

    const resueltos = obtenerPasosCompletadosModulo(nombreLab, mod.id).length;
    pasosCompletados += resueltos;

    if (totalModulo > 0 && resueltos >= totalModulo) {
      modulosCompletados += 1;
    }
  });

  const porcentaje = totalPasos > 0 ? Math.round((pasosCompletados / totalPasos) * 100) : 0;

  return {
    totalPasos,
    pasosCompletados,
    modulosCompletados,
    totalModulos: modulos.length,
    porcentaje,
  };
}

export function marcarPasoModuloCompletado(nombreLab, moduloId, pasoIdx) {
  const progreso = leerJSON(CLAVE_PASOS);
  const claveModulo = `${nombreLab}::${moduloId}`;
  const completados = new Set(progreso[claveModulo] || []);
  completados.add(pasoIdx);
  progreso[claveModulo] = Array.from(completados);
  guardarJSON(CLAVE_PASOS, progreso);
  return progreso[claveModulo];
}

export function desmarcarPasoModulo(nombreLab, moduloId, pasoIdx) {
  const progreso = leerJSON(CLAVE_PASOS);
  const claveModulo = `${nombreLab}::${moduloId}`;
  const completados = new Set(progreso[claveModulo] || []);
  completados.delete(pasoIdx);
  progreso[claveModulo] = Array.from(completados);
  guardarJSON(CLAVE_PASOS, progreso);
  return progreso[claveModulo];
}

// --- Verificación de Flags por PASO ---
const CLAVE_FLAGS_PASOS = 'flags_verificadas_pasos';

export function esFlagPasoVerificada(nombreLab, moduloId, pasoIdx) {
  const flags = leerJSON(CLAVE_FLAGS_PASOS);
  return flags[`${nombreLab}::${moduloId}::${pasoIdx}`] === true;
}

export function verificarFlagPaso(nombreLab, moduloId, pasoIdx, flagIngresada, flagCorrecta, flagsAceptadas = []) {
  const normalizar = (s) => (s || '').trim().toLowerCase();
  const ingresada = normalizar(flagIngresada);
  if (!ingresada) return false;

  const candidatas = [flagCorrecta, ...(Array.isArray(flagsAceptadas) ? flagsAceptadas : [])]
    .filter(Boolean)
    .map(normalizar);

  // Extraer también lo que está dentro de FLAG{...}
  const matchCanonico = (flagCorrecta || '').match(/flag\{([^}]+)\}/i);
  if (matchCanonico) {
    candidatas.push(normalizar(matchCanonico[1]));
  }

  const matchIngresado = ingresada.match(/flag\{([^}]+)\}/i);
  const textoSinEnvoltorio = matchIngresado ? normalizar(matchIngresado[1]) : ingresada;

  // Validación estándar por coincidencia directa
  let esValida = candidatas.some((c) => {
    if (c === ingresada || c === textoSinEnvoltorio) return true;
    const matchC = c.match(/flag\{([^}]+)\}/i);
    if (matchC && (normalizar(matchC[1]) === ingresada || normalizar(matchC[1]) === textoSinEnvoltorio)) return true;
    return false;
  });

  // Validaciones semánticas específicas si el estudiante ingresó la línea capturada completa
  if (!esValida) {
    // Caso DVWA - Brute Force - Paso 2 (Capturar petición de autenticación con Burp):
    // El estudiante puede ingresar la solicitud GET completa o los parámetros interceptados
    if (moduloId === 'dvwa-brute-force' && pasoIdx === 1) {
      if (
        ingresada.includes('vulnerabilities/brute') ||
        (ingresada.includes('username') && ingresada.includes('password')) ||
        (ingresada.startsWith('get ') && ingresada.includes('username'))
      ) {
        esValida = true;
      }
    }

    // Caso Juice Shop - SQLi - Paso 1 (Interceptar login):
    if (moduloId === 'juice-sqli' && pasoIdx === 0) {
      if (ingresada.includes('/rest/user/login') || (ingresada.startsWith('post ') && ingresada.includes('login'))) {
        esValida = true;
      }
    }
  }

  if (esValida) {
    const flags = leerJSON(CLAVE_FLAGS_PASOS);
    flags[`${nombreLab}::${moduloId}::${pasoIdx}`] = true;
    guardarJSON(CLAVE_FLAGS_PASOS, flags);
    // Garantizar que el paso queda marcado como completado
    marcarPasoModuloCompletado(nombreLab, moduloId, pasoIdx);
    return true;
  }
  return false;
}

export function revocarFlagPaso(nombreLab, moduloId, pasoIdx) {
  const flags = leerJSON(CLAVE_FLAGS_PASOS);
  delete flags[`${nombreLab}::${moduloId}::${pasoIdx}`];
  guardarJSON(CLAVE_FLAGS_PASOS, flags);
  desmarcarPasoModulo(nombreLab, moduloId, pasoIdx);
}