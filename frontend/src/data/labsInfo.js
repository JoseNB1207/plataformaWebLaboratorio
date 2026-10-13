import { ROADMAP_MODULOS, obtenerRoadmapLab } from './roadmapsData.js';

export { ROADMAP_MODULOS, obtenerRoadmapLab };

// Configuración real de rutas y puertos en la Raspberry Pi
export const CONFIG_LABS = {
  DVWA: {
    puerto: 80,
    ruta: '/dvwa/',
    descripcionCorta: 'Servidor PHP/MySQL en /dvwa/ de la Raspberry Pi',
  },
  'OWASP Juice Shop': {
    puerto: 3000,
    ruta: '/',
    rutaAlternativa: '/juice-shop/',
    descripcionCorta: 'Aplicación Node.js en puerto 3000 de la Raspberry Pi',
  },
};

export function obtenerPuertoLab(nombreLab, labObj) {
  if (labObj?.puerto) return labObj.puerto;
  if (labObj?.port) return labObj.port;
  return CONFIG_LABS[nombreLab]?.puerto ?? 80;
}

export function obtenerUrlLab(ip, nombreLab, labObj) {
  const conf = CONFIG_LABS[nombreLab];
  const puerto = obtenerPuertoLab(nombreLab, labObj);
  const ruta = conf?.ruta || '/';

  // Si el puerto es el 80 estándar, no concatenamos el número de puerto en la URL
  if (puerto === 80) {
    return `http://${ip}${ruta}`;
  }

  return `http://${ip}:${puerto}${ruta}`;
}

export const ROADMAP = [
  {
    nombre: 'DVWA',
    nivel: 1,
    puerto: 80,
    ruta: '/dvwa/',
    categoria: 'OWASP Top 10 Clásico',
    descripcion: 'Vulnerabilidades en PHP/MySQL alojadas en /dvwa/ de la Raspberry Pi con niveles de dificultad ajustables.',
    modulosCount: ROADMAP_MODULOS.DVWA?.modulos?.length || 8,
  },
  {
    nombre: 'OWASP Juice Shop',
    nivel: 1,
    puerto: 3000,
    ruta: '/',
    categoria: 'SPA Moderna & API REST',
    descripcion: 'Tienda en Angular y Node.js desplegada en el puerto 3000 de la Raspberry Pi con más de 100 retos.',
    modulosCount: ROADMAP_MODULOS['OWASP Juice Shop']?.modulos?.length || 5,
  },
];

export const LAB_INFO = {
  DVWA: {
    descripcion: 'Aplicación PHP con vulnerabilidades del OWASP Top 10 alojada en /dvwa/ de la Raspberry Pi.',
  },
  'OWASP Juice Shop': {
    descripcion: 'Tienda moderna en Node.js y Angular alojada en el puerto 3000 de la Raspberry Pi con retos dinámicos.',
  },
};