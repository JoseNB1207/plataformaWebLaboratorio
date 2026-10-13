// Cliente API para comunicarse con el agente de control en la Raspberry Pi (puerto 3001)

export async function obtenerLabs(ip) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 segundos de timeout

  try {
    const respuesta = await fetch(`http://${ip}:3001/labs`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!respuesta.ok) return [];
    return await respuesta.json();
  } catch {
    return [];
  }
}

export async function accionLab(ip, nombre, accion) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const respuesta = await fetch(
      `http://${ip}:3001/labs/${encodeURIComponent(nombre)}/${accion}`,
      { method: 'POST', signal: controller.signal }
    );
    clearTimeout(timeoutId);
    return await respuesta.json();
  } catch (error) {
    return { error: 'No se pudo conectar con el agente en el puerto 3001' };
  }
}