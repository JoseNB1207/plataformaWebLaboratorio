export async function obtenerLabs(ip) {
  const respuesta = await fetch(`http://${ip}:3001/labs`);
  const datos = await respuesta.json();
  return datos;
}

export async function accionLab(ip, nombre, accion) {
  const respuesta = await fetch(
    `http://${ip}:3001/labs/${encodeURIComponent(nombre)}/${accion}`,
    { method: 'POST' }
  );
  return respuesta.json();
}