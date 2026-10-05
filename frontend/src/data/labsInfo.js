export const ROADMAP = [
  { nombre: 'DVWA', nivel: 1, descripcion: 'Vulnerabilidades clásicas con niveles de dificultad ajustables.' },
  { nombre: 'OWASP Juice Shop', nivel: 1, descripcion: 'Más de 100 retos gamificados sobre una SPA moderna.' },
];

export const RUTAS_LAB = {
  DVWA: '/dvwa/',
  'OWASP Juice Shop': ':3000/',
};

export const LAB_INFO = {
  DVWA: {
    descripcion: 'Aplicación PHP con vulnerabilidades clásicas del OWASP Top 10, con niveles de dificultad ajustables (Low, Medium, High, Impossible).',
    guia: [
      'Abre el laboratorio con el botón de abajo.',
      'Inicia sesión con usuario admin y contraseña password.',
      'Ve a "DVWA Security" y elige el nivel de dificultad (empieza en Low).',
      'Explora el menú lateral: cada opción es una categoría de vulnerabilidad distinta.',
    ],
    retos: [
      'Extrae usuarios de la base de datos con una inyección SQL en "SQL Injection"',
      'Ejecuta un XSS reflejado en el módulo "XSS (Reflected)"',
      'Almacena un XSS persistente en "XSS (Stored)" y haz que se ejecute solo',
      'Sube un archivo malicioso a través de "File Upload"',
      'Lee un archivo del servidor usando "File Inclusion" (LFI)',
      'Evade la validación del lado del cliente en "Command Injection"',
    ],
  },
  'OWASP Juice Shop': {
    descripcion: 'Tienda online moderna (Angular/Node.js) con más de 100 retos gamificados, desde inyecciones hasta lógica de negocio rota.',
    guia: [
      'Abre el laboratorio con el botón de abajo.',
      'No necesitas iniciar sesión para empezar a explorar.',
      'Busca el ícono de la puntuación (scoreboard) — suele ser uno de los primeros retos encontrarlo.',
      'Cada reto resuelto se marca automáticamente en el scoreboard.',
    ],
    retos: [
      'Encuentra la página oculta del scoreboard sin que te la digan',
      'Inicia sesión como administrador sin conocer su contraseña (SQLi)',
      'Compra un producto por menos de su precio real manipulando la petición',
      'Encuentra una review de producto que revele información sensible',
      'Accede al panel de administración sin credenciales válidas',
      'Resuelve un desafío de la categoría "XSS" del propio menú de puntuación',
    ],
  },
};