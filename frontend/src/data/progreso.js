const CLAVE_PROGRESO = 'progreso_labs';
const CLAVE_PASOS = 'progreso_pasos_modulos';

function leerJSON(clave) {
  try {
    const datos = localStorage.getItem(clave);
    return datos ? JSON.parse(datos) : {};
  } catch {
    return {};
  }
}

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