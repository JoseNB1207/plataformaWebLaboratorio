const CLAVE_PROGRESO = 'progreso_labs';

function leerProgreso() {
  try {
    const datos = localStorage.getItem(CLAVE_PROGRESO);
    return datos ? JSON.parse(datos) : {};
  } catch {
    return {};
  }
}

function guardarProgreso(progreso) {
  localStorage.setItem(CLAVE_PROGRESO, JSON.stringify(progreso));
}

export function obtenerRetosCompletados(nombreLab) {
  const progreso = leerProgreso();
  return progreso[nombreLab] || [];
}

export function alternarReto(nombreLab, indiceReto) {
  const progreso = leerProgreso();
  const completados = new Set(progreso[nombreLab] || []);

  if (completados.has(indiceReto)) {
    completados.delete(indiceReto);
  } else {
    completados.add(indiceReto);
  }

  progreso[nombreLab] = Array.from(completados);
  guardarProgreso(progreso);
  return progreso[nombreLab];
}