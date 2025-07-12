// --- Variables Globales y Referencias a Elementos ---
let guideActive = false;
let recognition = null;
let isListening = false;
let currentField = null; // Para dictado de campos de formulario (en index.html o modal)
let waitingForConfirmation = false; // Para confirmaciones de borrar/mantener, etc.
let originalOnResult = null; // Para guardar el onresult principal durante confirmaciones
let currentVisitIdInModal = null; // *** NUEVA VARIABLE: ID de la visita actualmente en el modal ***

// Nuevas variables para manejo de errores de voz en móvil
let noSpeechCount = 0;
const maxNoSpeechAttempts = 3; // Cuántas veces intentamos reiniciar por "no-speech" antes de pausar
let speechDetectedInSession = false; // Para saber si hubo voz real en la sesión actual de reconocimiento

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Referencias a elementos del DOM (comunes a todas las páginas)
const btnMic = document.getElementById('btnMic');
const btnGuide = document.getElementById('btnGuide');
const btnLargeText = document.getElementById('btnLargeText');
const btnDarkMode = document.getElementById('btnDarkMode');
const btnReset = document.getElementById('btnReset');
const loadingOverlay = document.getElementById('loadingOverlay');

// Referencias para el menú de navegación colapsable (estarán en todas las páginas con header)
const hamburgerBtn = document.getElementById('hamburgerBtn');
const mainNavCollapse = document.getElementById('mainNavCollapse');
const closeNavBtn = document.getElementById('closeNavBtn');

// Referencias específicas de la página de Login (solo estarán presentes en index.html)
const userInput = document.getElementById('username');
const passInput = document.getElementById('password');
const btnLogin = document.getElementById('btnLogin');
const btnRecover = document.getElementById('btnRecover');
const loginForm = document.getElementById('loginForm'); 

// Referencia al botón de cerrar sesión (estará en todas las páginas con nav)
const logoutBtn = document.getElementById('logoutBtn');

// --- Variables y referencias específicas del Calendario/Programaciones ---
const programCardsContainer = document.getElementById('program-cards-container'); // Contenedor para las tarjetas de programación
// Referencias para los nuevos campos del modal de visitas
const visitDetailModal = document.getElementById('visitDetailModal');
const visitObservationsInput = document.getElementById('visitObservationsInput');
const visitStatusSelect = document.getElementById('visitStatusSelect');
const saveVisitChangesBtn = document.getElementById('saveVisitChangesBtn');


// --- Variables y referencias específicas de Técnicos ---
const technicianCardsContainer = document.getElementById('technician-cards-container'); // Contenedor para las tarjetas de técnicos

// --- Variables y referencias específicas de Tickets ---
const ticketCardsContainer = document.getElementById('ticket-cards-container'); // Contenedor para las tarjetas de tickets

// --- Variables y referencias específicas de Reportes ---
const reportSummaryGrid = document.getElementById('report-summary-grid'); // Contenedor para el resumen de reportes
const serviceChartCanvas = document.getElementById('serviceChart'); // Canvas para el gráfico de reportes

// --- Variables y referencias específicas de Configuración ---
const settingsForm = document.getElementById('settings-form'); // Formulario de configuración

// --- Variables y referencias específicas de Clientes ---
const clientCardsContainer = document.getElementById('client-cards-container'); // Contenedor para las tarjetas de clientes

// --- Variables y referencias específicas de Servicios ---
const serviceCardsContainer = document.getElementById('service-cards-container'); // Contenedor para las tarjetas de servicios


// Datos de ejemplo para las visitas técnicas (puedes cargar esto desde una API o DB)
const technicalVisits = [
    {
        id: 'v001',
        date: '2025-07-15', // Formato YYYY-MM-DD
        time: '10:00',
        reason: 'Instalación de fibra óptica',
        company: 'Cliente Alpha S.A.',
        address: 'Av. Los Pinos 123, Miraflores, Lima',
        gpsCoords: { lat: -12.1195, lng: -77.0357 }, // Ejemplo: Miraflores, Lima
        status: 'Pendiente',
        installationDate: '2025-07-15',
        technician: 'Juan Pérez',
        contacts: [{ name: 'Ana López', phone: '987654321' }],
        productsToInstall: [
            { name: 'Router WiFi 6', quantity: 1, type: 'Router' },
            { name: 'Cable de Fibra Óptica (50m)', quantity: 1, type: 'Cable' }
        ],
        notes: 'Cliente requiere alta velocidad para teletrabajo. Confirmar acceso al edificio.'
    },
    {
        id: 'v002',
        date: '2025-07-15',
        time: '14:30',
        reason: 'Mantenimiento de antena Starlink',
        company: 'Empresa Beta SAC',
        address: 'Calle Las Flores 456, Surco, Lima',
        gpsCoords: { lat: -12.1386, lng: -76.9961 }, // Ejemplo: Surco, Lima
        status: 'En Progreso',
        installationDate: '2024-03-10',
        technician: 'María García',
        contacts: [{ name: 'Pedro Salas', phone: '912345678' }],
        productsToInstall: [], // No se instalan productos en mantenimiento
        notes: 'Reporte de intermitencia. Revisar alineación y cableado.'
    },
    {
        id: 'v003',
        date: '2025-07-20',
        time: '09:00',
        reason: 'Reparación de red interna',
        company: 'Corporación Gamma',
        address: 'Jr. Unión 789, Cercado de Lima',
        gpsCoords: { lat: -12.0463, lng: -77.0428 }, // Ejemplo: Centro de Lima
        status: 'Completado',
        installationDate: '2023-11-20',
        technician: 'Carlos Ruiz',
        contacts: [{ name: 'Gerente General', phone: '998877665' }],
        productsToInstall: [{ name: 'Switch de 8 Puertos', quantity: 1, type: 'Switch' }],
        notes: 'Problema de conectividad resuelto. Se reemplazó router.'
    },
    {
        id: 'v004',
        date: '2025-07-22',
        time: '11:00',
        reason: 'Nueva instalación de Starlink',
        company: 'Tienda Delta E.I.R.L.',
        address: 'Av. La Marina 101, San Miguel, Lima',
        gpsCoords: { lat: -12.0799, lng: -77.0706 }, // Ejemplo: San Miguel, Lima
        status: 'Pendiente',
        installationDate: 'N/A',
        technician: 'Ana Torres',
        contacts: [{ name: 'Jefe de Tienda', phone: '955443322' }],
        productsToInstall: [
            { name: 'Antena Starlink V2', quantity: 1, type: 'Antena Starlink' },
            { name: 'Base de Montaje', quantity: 1, type: 'Accesorio' }
        ],
        notes: 'Instalación en azotea. Coordinar con seguridad del local.'
    },
    {
        id: 'v005',
        date: '2025-08-01', // Próximo mes
        time: '16:00',
        reason: 'Auditoría de infraestructura de red',
        company: 'Consultora Epsilon',
        address: 'Calle Los Robles 202, San Isidro, Lima',
        gpsCoords: { lat: -12.0963, lng: -77.0298 }, // Ejemplo: San Isidro, Lima
        status: 'Pendiente',
        installationDate: 'N/A',
        technician: 'Pedro Vargas',
        contacts: [{ name: 'Representante TI', phone: '944556677' }],
        productsToInstall: [],
        notes: 'Revisión anual de sistemas. Acceso a servidores necesario.'
    },
    {
        id: 'v006',
        date: '2025-07-12', // Hoy
        time: '09:00',
        reason: 'Revisión de cableado estructurado',
        company: 'Global Solutions',
        address: 'Av. Javier Prado Este 500, San Isidro, Lima',
        gpsCoords: { lat: -12.0906, lng: -77.0229 },
        status: 'Completado',
        installationDate: '2022-05-10',
        technician: 'Laura Mendoza',
        contacts: [{ name: 'Soporte Interno', phone: '933221100' }],
        productsToInstall: [{ name: 'Conectores RJ45', quantity: 20, type: 'Componente' }],
        notes: 'Se optimizó el cableado en 3er piso. Velocidad mejorada.'
    },
    {
        id: 'v007',
        date: '2025-07-12', // Hoy
        time: '16:00',
        reason: 'Soporte técnico remoto',
        company: 'Innovatech Corp',
        address: 'Remoto',
        gpsCoords: { lat: 0, lng: 0 }, // Sin coordenadas físicas
        status: 'Pendiente',
        installationDate: 'N/A',
        technician: 'Diego Castro',
        contacts: [{ name: 'Contacto Remoto', phone: '966778899' }],
        productsToInstall: [],
        notes: 'Asistencia para configuración de VPN. Llamar antes.'
    }
];

// Datos de ejemplo para los técnicos (ya definidos en la versión anterior)
const technicians = [
    {
        id: 't001',
        name: 'Ana García',
        specialty: 'Fibra Óptica y Redes',
        photo: 'https://placehold.co/120x120/7faed6/ffffff?text=AG',
        email: 'ana.garcia@preysop.com',
        phone: '987123456',
        bio: 'Especialista en instalación y mantenimiento de redes de fibra óptica. Con más de 5 años de experiencia en el sector.'
    },
    {
        id: 't002',
        name: 'Luis Fernández',
        specialty: 'Instalaciones Starlink',
        photo: 'https://placehold.co/120x120/487DA9/ffffff?text=LF',
        email: 'luis.fernandez@preysop.com',
        phone: '987654321',
        bio: 'Técnico certificado en la implementación y configuración de sistemas Starlink para clientes residenciales y empresariales.'
    },
    {
        id: 't003',
        name: 'Sofía Ramirez',
        specialty: 'Soporte de Redes y WiFi',
        photo: 'https://placehold.co/120x120/345c7c/ffffff?text=SR',
        email: 'sofia.ramirez@preysop.com',
        phone: '912345678',
        bio: 'Experta en diagnóstico y solución de problemas de conectividad, optimización de redes WiFi y seguridad informática básica.'
    },
    {
        id: 't004',
        name: 'Diego Castro',
        specialty: 'Telecomunicaciones Generales',
        photo: 'https://placehold.co/120x120/7faed6/ffffff?text=DC',
        email: 'diego.castro@preysop.com',
        phone: '998765432',
        bio: 'Amplio conocimiento en diversas tecnologías de telecomunicaciones, incluyendo cableado estructurado y sistemas de comunicación.'
    },
    {
        id: 't005',
        name: 'Elena Vargas',
        specialty: 'Configuración de Equipos',
        photo: 'https://placehold.co/120x120/487DA9/ffffff?text=EV',
        email: 'elena.vargas@preysop.com',
        phone: '955112233',
        bio: 'Dedicada a la configuración y puesta en marcha de routers, switches y otros dispositivos de red para un rendimiento óptimo.'
    },
    {
        id: 't006',
        name: 'Ricardo Soto',
        specialty: 'Mantenimiento Preventivo',
        photo: 'https://placehold.co/120x120/345c7c/ffffff?text=RS',
        email: 'ricardo.soto@preysop.com',
        phone: '977889900',
        bio: 'Enfocado en el mantenimiento preventivo y correctivo de infraestructuras de red para garantizar la continuidad del servicio.'
    },
    {
        id: 't007',
        name: 'Paula Torres',
        specialty: 'Soporte al Cliente',
        photo: 'https://placehold.co/120x120/7faed6/ffffff?text=PT',
        email: 'paula.torres@preysop.com',
        phone: '922334455',
        bio: 'Técnica con gran habilidad para la comunicación y resolución de problemas directamente con los clientes, brindando un excelente servicio.'
    },
    {
        id: 't008',
        name: 'Jorge Mendoza',
        specialty: 'Instalaciones de CCTV',
        photo: 'https://placehold.co/120x120/487DA9/ffffff?text=JM',
        email: 'jorge.mendoza@preysop.com',
        phone: '933445566',
        bio: 'Especialista en sistemas de videovigilancia y cámaras de seguridad IP, asegurando instalaciones robustas y funcionales.'
    },
    {
        id: 't009',
        name: 'Laura Quispe',
        specialty: 'Redes Inalámbricas Avanzadas',
        photo: 'https://placehold.co/120x120/345c7c/ffffff?text=LQ',
        email: 'laura.quispe@preysop.com',
        phone: '944556677',
        bio: 'Conocimiento en diseño e implementación de soluciones WiFi avanzadas para grandes espacios y entornos complejos.'
    },
    {
        id: 't010',
        name: 'Manuel Rojas',
        specialty: 'Sistemas de Cableado Estructurado',
        photo: 'https://placehold.co/120x120/7faed6/ffffff?text=MR',
        email: 'manuel.rojas@preysop.com',
        phone: '966778899',
        bio: 'Certificado en la instalación y certificación de cableado estructurado Cat6 y Cat7, garantizando la calidad de la infraestructura.'
    }
];

// Datos de ejemplo para Tickets
const tickets = [
    {
        ticketNumber: 'TKT-001',
        subject: 'Problema de conexión a internet',
        creationDate: '2025-07-10',
        lastResponse: '2025-07-11',
        assignedTechnicianId: 't001', // Ana García
        status: 'En Progreso'
    },
    {
        ticketNumber: 'TKT-002',
        subject: 'Fallo en antena Starlink',
        creationDate: '2025-07-09',
        lastResponse: '2025-07-12',
        assignedTechnicianId: 't002', // Luis Fernández
        status: 'Pendiente'
    },
    {
        ticketNumber: 'TKT-003',
        subject: 'Configuración de nuevo router',
        creationDate: '2025-07-08',
        lastResponse: '2025-07-08',
        assignedTechnicianId: 't003', // Sofía Ramirez
        status: 'Completado'
    },
    {
        ticketNumber: 'TKT-004',
        subject: 'Cableado de red dañado',
        creationDate: '2025-07-07',
        lastResponse: '2025-07-07',
        assignedTechnicianId: 't006', // Ricardo Soto
        status: 'Cancelado'
    },
    {
        ticketNumber: 'TKT-005',
        subject: 'Lentitud en la red WiFi',
        creationDate: '2025-07-06',
        lastResponse: '2025-07-07',
        assignedTechnicianId: 't003', // Sofía Ramirez
        status: 'En Progreso'
    },
    {
        ticketNumber: 'TKT-006',
        subject: 'Instalación de cámara de seguridad',
        creationDate: '2025-07-05',
        lastResponse: '2025-07-05',
        assignedTechnicianId: 't008', // Jorge Mendoza
        status: 'Completado'
    },
    {
        ticketNumber: 'TKT-007',
        subject: 'Problema de acceso a servidor',
        creationDate: '2025-07-04',
        lastResponse: '2025-07-04',
        assignedTechnicianId: 't004', // Diego Castro
        status: 'Pendiente'
    },
    {
        ticketNumber: 'TKT-008',
        subject: 'Actualización de firmware de switch',
        creationDate: '2025-07-03',
        lastResponse: '2025-07-03',
        assignedTechnicianId: 't005', // Elena Vargas
        status: 'Completado'
    },
    {
        ticketNumber: 'TKT-009',
        subject: 'Soporte remoto para VPN',
        creationDate: '2025-07-02',
        lastResponse: '2025-07-02',
        assignedTechnicianId: 't007', // Paula Torres
        status: 'En Progreso'
    },
    {
        ticketNumber: 'TKT-010',
        subject: 'Revisión de cobertura WiFi en almacén',
        creationDate: '2025-07-01',
        lastResponse: '2025-07-01',
        assignedTechnicianId: 't009', // Laura Quispe
        status: 'Pendiente'
    },
    {
        ticketNumber: 'TKT-011',
        subject: 'Nueva instalación de Starlink en zona rural',
        creationDate: '2025-06-30',
        lastResponse: '2025-07-01',
        assignedTechnicianId: 't002', // Luis Fernández
        status: 'En Progreso'
    },
    {
        ticketNumber: 'TKT-012',
        subject: 'Auditoría de seguridad de red',
        creationDate: '2025-06-29',
        lastResponse: '2025-06-29',
        assignedTechnicianId: 't004', // Diego Castro
        status: 'Completado'
    },
    {
        ticketNumber: 'TKT-013',
        subject: 'Problema con línea telefónica IP',
        creationDate: '2025-06-28',
        lastResponse: '2025-06-28',
        assignedTechnicianId: 't001', // Ana García
        status: 'Pendiente'
    }
];

// Datos de ejemplo para Reportes
const reportsData = {
    totalServices: 1250,
    completedVisits: 850,
    pendingTickets: tickets.filter(t => t.status === 'Pendiente').length,
    inProgressTickets: tickets.filter(t => t.status === 'En Progreso').length,
    totalTickets: tickets.length,
    visitsByMonth: {
        'Ene': 80, 'Feb': 90, 'Mar': 110, 'Abr': 100, 'May': 120, 'Jun': 130,
        'Jul': technicalVisits.length // Usar el número real de visitas en julio
    },
    servicesByCategory: {
        "Instalación Starlink": 320,
        "Mantenimiento Fibra": 280,
        "Reparación Redes": 150,
        "Soporte Remoto": 300,
        "Venta Equipos": 200
    }
};

// Datos de ejemplo para Configuración
const settingsOptions = {
    language: 'es',
    notifications: true,
    theme: 'system', // 'light', 'dark', 'system'
    autoSave: true,
    defaultTechnician: 't001' // ID del técnico por defecto
};

// Datos de ejemplo para Clientes
const clients = [
    {
        id: 'c001',
        name: 'Innovatech Solutions S.A.C.',
        contactPerson: 'Gerente de TI',
        phone: '900111222',
        email: 'contacto@innovatech.com',
        address: 'Av. Principal 100, San Isidro, Lima',
        type: 'Empresarial',
        photo: 'https://placehold.co/100x100/487DA9/ffffff?text=IS'
    },
    {
        id: 'c002',
        name: 'Familia Rodríguez',
        contactPerson: 'Sra. Carmen Rodríguez',
        phone: '900333444',
        email: 'carmen.r@example.com',
        address: 'Calle Los Girasoles 25, Surco, Lima',
        type: 'Residencial',
        photo: 'https://placehold.co/100x100/7faed6/ffffff?text=FR'
    },
    {
        id: 'c003',
        name: 'Comercial Andina E.I.R.L.',
        contactPerson: 'Jefe de Operaciones',
        phone: '900555666',
        email: 'operaciones@andina.com',
        address: 'Jr. Comercio 300, Cercado de Lima',
        type: 'Comercial',
        photo: 'https://placehold.co/100x100/345c7c/ffffff?text=CA'
    },
    {
        id: 'c004',
        name: 'Dr. Alejandro Soto',
        contactPerson: 'Dr. Alejandro Soto',
        phone: '900777888',
        email: 'consultorio@example.com',
        address: 'Av. La Paz 500, Miraflores, Lima',
        type: 'Profesional',
        photo: 'https://placehold.co/100x100/487DA9/ffffff?text=AS'
    },
    {
        id: 'c005',
        name: 'Restaurante Sabor Peruano',
        contactPerson: 'Gerente General',
        phone: '900999000',
        email: 'gerencia@saborperuano.com',
        address: 'Av. Pardo 1100, Miraflores, Lima',
        type: 'Comercial',
        photo: 'https://placehold.co/100x100/7faed6/ffffff?text=RP'
    },
    {
        id: 'c006',
        name: 'Constructora del Sur S.A.',
        contactPerson: 'Ing. Civil',
        phone: '901122334',
        email: 'info@constructora.com',
        address: 'Calle Los Álamos 800, San Borja, Lima',
        type: 'Empresarial',
        photo: 'https://placehold.co/100x100/345c7c/ffffff?text=CS'
    },
    {
        id: 'c007',
        name: 'Sra. Patricia Gómez',
        contactPerson: 'Sra. Patricia Gómez',
        phone: '901445566',
        email: 'patricia.g@example.com',
        address: 'Jr. La Unión 123, Pueblo Libre, Lima',
        type: 'Residencial',
        photo: 'https://placehold.co/100x100/487DA9/ffffff?text=PG'
    },
    {
        id: 'c008',
        name: 'Estudio Contable Blanco',
        contactPerson: 'C.P. Juan Blanco',
        phone: '901778899',
        email: 'juan.b@estudioblanco.com',
        address: 'Av. Arenales 700, Lince, Lima',
        type: 'Profesional',
        photo: 'https://placehold.co/100x100/7faed6/ffffff?text=EB'
    },
    {
        id: 'c009',
        name: 'Tienda de Electrónica TechZone',
        contactPerson: 'Encargado de Tienda',
        phone: '902001122',
        email: 'ventas@techzone.com',
        address: 'Av. Benavides 1500, Miraflores, Lima',
        type: 'Comercial',
        photo: 'https://placehold.co/100x100/345c7c/ffffff?text=TZ'
    },
    {
        id: 'c010',
        name: 'Colegio San Marcos',
        contactPerson: 'Director',
        phone: '902334455',
        email: 'direccion@colegiosanmarcos.edu.pe',
        address: 'Calle Los Pinos 400, Jesús María, Lima',
        type: 'Educativo',
        photo: 'https://placehold.co/100x100/487DA9/ffffff?text=CSM'
    },
    {
        id: 'c011',
        name: 'Panadería La Espiga',
        contactPerson: 'Dueño',
        phone: '902667788',
        email: 'panaderia@laespiga.com',
        address: 'Av. Arequipa 1200, Lince, Lima',
        type: 'Comercial',
        photo: 'https://placehold.co/100x100/7faed6/ffffff?text=LE'
    },
    {
        id: 'c012',
        name: 'Centro Médico Vital',
        contactPerson: 'Administrador',
        phone: '902990011',
        email: 'admin@vital.com',
        address: 'Jr. Puno 500, Cercado de Lima',
        type: 'Salud',
        photo: 'https://placehold.co/100x100/345c7c/ffffff?text=CMV'
    },
    {
        id: 'c013',
        name: 'Sr. Roberto Núñez',
        contactPerson: 'Sr. Roberto Núñez',
        phone: '903112233',
        email: 'roberto.n@example.com',
        address: 'Pasaje Santa Rosa 70, Barranco, Lima',
        type: 'Residencial',
        photo: 'https://placehold.co/100x100/487DA9/ffffff?text=RN'
    },
    {
        id: 'c014',
        name: 'Agencia de Viajes Aventura',
        contactPerson: 'Gerente de Ventas',
        phone: '903445566',
        email: 'ventas@aventura.com',
        address: 'Av. Larco 900, Miraflores, Lima',
        type: 'Comercial',
        photo: 'https://placehold.co/100x100/7faed6/ffffff?text=AVA'
    },
    {
        id: 'c015',
        name: 'Imprenta Rápida Digital',
        contactPerson: 'Jefe de Producción',
        phone: '903778899',
        email: 'produccion@imprenta.com',
        address: 'Calle Los Artesanos 150, Chorrillos, Lima',
        type: 'Industrial',
        photo: 'https://placehold.co/100x100/345c7c/ffffff?text=IRD'
    },
    {
        id: 'c016',
        name: 'Gimnasio Fitness Total',
        contactPerson: 'Gerente de Operaciones',
        phone: '904001122',
        email: 'info@fitnesstotal.com',
        address: 'Av. Salaverry 2000, San Isidro, Lima',
        type: 'Servicios',
        photo: 'https://placehold.co/100x100/487DA9/ffffff?text=FT'
    },
    {
        id: 'c017',
        name: 'Sra. Elena Vásquez',
        contactPerson: 'Sra. Elena Vásquez',
        phone: '904334455',
        email: 'elena.v@example.com',
        address: 'Jr. Las Palmeras 30, La Molina, Lima',
        type: 'Residencial',
        photo: 'https://placehold.co/100x100/7faed6/ffffff?text=EV'
    },
    {
        id: 'c018',
        name: 'Distribuidora Global S.A.C.',
        contactPerson: 'Jefe de Logística',
        phone: '904667788',
        email: 'logistica@globaldist.com',
        address: 'Av. Argentina 800, Callao',
        type: 'Industrial',
        photo: 'https://placehold.co/100x100/345c7c/ffffff?text=DG'
    },
    {
        id: 'c019',
        name: 'Clínica Veterinaria Amigos',
        contactPerson: 'Dr. Médico Veterinario',
        phone: '904990011',
        email: 'vet@amigos.com',
        address: 'Calle Los Pinos 10, Santiago de Surco, Lima',
        type: 'Salud',
        photo: 'https://placehold.co/100x100/487DA9/ffffff?text=CVA'
    },
    {
        id: 'c020',
        name: 'Academia de Idiomas Lingua',
        contactPerson: 'Coordinador Académico',
        phone: '905112233',
        email: 'info@lingua.edu.pe',
        address: 'Av. Petit Thouars 200, Miraflores, Lima',
        type: 'Educativo',
        photo: 'https://placehold.co/100x100/7faed6/ffffff?text=AIL'
    }
];

// Datos de ejemplo para Servicios
const services = [
    {
        id: 's001',
        name: 'Instalación de Fibra Óptica',
        icon: 'fas fa-ethernet',
        description: 'Instalación profesional de redes de fibra óptica para hogares y empresas, garantizando alta velocidad y estabilidad.'
    },
    {
        id: 's002',
        name: 'Mantenimiento de Redes',
        icon: 'fas fa-tools',
        description: 'Servicio de mantenimiento preventivo y correctivo para infraestructuras de red, asegurando su óptimo funcionamiento.'
    },
    {
        id: 's003',
        name: 'Configuración de Routers y Switches',
        icon: 'fas fa-wifi',
        description: 'Configuración avanzada de equipos de red para maximizar el rendimiento y la seguridad de su conexión.'
    },
    {
        id: 's004',
        name: 'Soporte Técnico Remoto',
        icon: 'fas fa-headset',
        description: 'Asistencia técnica a distancia para resolver problemas de software, conectividad y configuración de dispositivos.'
    },
    {
        id: 's005',
        name: 'Instalación de Cámaras de Seguridad (CCTV)',
        icon: 'fas fa-video',
        description: 'Implementación de sistemas de videovigilancia IP para monitoreo y seguridad de propiedades.'
    },
    {
        id: 's006',
        name: 'Cableado Estructurado',
        icon: 'fas fa-network-wired',
        description: 'Diseño e instalación de sistemas de cableado estructurado para redes de voz, datos y video.'
    },
    {
        id: 's007',
        name: 'Auditoría de Seguridad de Redes',
        icon: 'fas fa-shield-alt',
        description: 'Evaluación exhaustiva de la seguridad de su red para identificar vulnerabilidades y proponer soluciones.'
    },
    {
        id: 's008',
        name: 'Venta y Asesoría de Equipos',
        icon: 'fas fa-laptop',
        description: 'Venta de equipos de telecomunicaciones (routers, antenas, switches) y asesoría para la mejor elección.'
    },
    {
        id: 's009',
        name: 'Optimización de Cobertura WiFi',
        icon: 'fas fa-signal',
        description: 'Mejora de la señal y cobertura WiFi en hogares y oficinas, eliminando zonas muertas y optimizando la velocidad.'
    },
    {
        id: 's010',
        name: 'Instalación de Antenas Starlink',
        icon: 'fas fa-satellite-dish',
        description: 'Servicio especializado en la instalación y configuración de antenas Starlink para conexión satelital de alta velocidad.'
    }
];


// --- Funciones de Utilidad de Accesibilidad ---

/**
 * Muestra texto en el área de subtítulos en vivo.
 * @param {string} text - Texto a mostrar.
 */
function showCaption(text) {
    const captions = document.getElementById('live-captions');
    if (captions) {
        captions.textContent = text;
    }
}

/**
 * Reproduce un archivo de audio pregrabado.
 * @param {string} path - Ruta al archivo de audio.
 * @param {string} captionText - Texto para mostrar en los subtítulos mientras se reproduce el audio.
 * @param {function} [onEnd=null] - Callback a ejecutar cuando el audio termina.
 */
function playAudio(path, captionText, onEnd = null) {
    const captions = document.getElementById('live-captions');
    if (captions) captions.textContent = captionText;

    const audio = new Audio(path);
    audio.onended = () => {
        if (captions) captions.textContent = '';
        if (typeof onEnd === "function") onEnd();
    };
    audio.onerror = (e) => {
        console.error("Error al reproducir audio:", e);
        showCaption("Error al reproducir audio.");
        if (typeof onEnd === "function") onEnd();
    };
    window.speechSynthesis.cancel(); // Detiene cualquier síntesis de voz
    audioContext.resume().then(() => {
        audio.play().catch(e => {
            console.error("No se pudo iniciar la reproducción del audio (posiblemente por autoplay policy):", e);
            speakText(captionText, false, onEnd); // Fallback a síntesis de voz
        });
    });
}

/**
 * Convierte texto a voz usando la API SpeechSynthesis.
 * @param {string} text - Texto a convertir a voz.
 * @param {boolean} [blockCaption=false] - Si es true, no actualiza los subtítulos palabra por palabra.
 * @param {function} [onEnd=null] - Callback a ejecutar cuando la síntesis de voz termina.
 */
function speakText(text, blockCaption = false, onEnd = null) {
    const captions = document.getElementById('live-captions');
    if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = "es-ES";
        // Puedes personalizar la voz aquí (descomenta y ajusta si es necesario)
        // utter.voice = window.speechSynthesis.getVoices().find(voice => voice.name === 'Google español');
        // utter.rate = 1; // 0.1 a 10 (1 es normal)
        // utter.pitch = 1; // 0 a 2 (1 es normal)

        utter.onstart = () => { /* No se actualiza aquí, se actualiza en onboundary */ };
        utter.onboundary = (event) => {
            if (!blockCaption && event.name === "word" && event.charIndex !== undefined) {
                let partial = text.substring(0, event.charIndex + (event.charLength || 0));
                if (captions) captions.textContent = partial;
            }
        };
        utter.onend = () => {
            if (!blockCaption && captions) { captions.textContent = ''; }
            if (typeof onEnd === "function") onEnd();
        };
        utter.onerror = (event) => {
            console.error("Error en SpeechSynthesisUtterance:", event.error);
            showCaption(`Error de voz: ${text}`);
            if (typeof onEnd === "function") onEnd();
        };

        window.speechSynthesis.cancel(); // Cancelar cualquier voz actual antes de hablar
        audioContext.resume().then(() => {
            window.speechSynthesis.speak(utter);
        }).catch(e => {
            console.error("Error al reanudar AudioContext para speakText:", e);
            showCaption("Error de audio: " + text);
            if (typeof onEnd === "function") onEnd();
        });
    } else {
        if (!blockCaption) { showCaption(text); }
        if (typeof onEnd === "function") onEnd();
    }
}

/**
 * Proporciona una guía de voz sobre cómo usar la página.
 * Se adapta al contenido del contenido de la página actual.
 */
function speakGuide() {
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        guideActive = false;
        showCaption("Guía detenida.");
        return;
    }
    guideActive = true;
    let text = "";
    if (document.body.id === 'login-page') {
        text = "Bienvenido a PreySop. Ingrese su usuario y contraseña para acceder. Puede recuperar su acceso si lo olvidó. Use el botón de micrófono para dictar sus datos. Presione Iniciar sesión para continuar. Puede activar modo oscuro, aumentar el tamaño del texto o restablecer accesibilidad con los botones flotantes. Diga 'comandos' para ver la lista de comandos. Diga 'desactivar guía' para cerrar esta guía.";
    } else if (document.body.id === 'dashboard-page') {
        text = "Bienvenido al panel principal de PreySop. Aquí puede ver un resumen de sus servicios, citas, técnicos e instalaciones Starlink. Puede navegar usando los comandos de voz o los botones. Diga 'comandos' para ver la lista de comandos disponibles. Diga 'cerrar sesión' para volver a la pantalla de inicio. Puede activar modo oscuro, aumentar el tamaño del texto o restablecer accesibilidad con los botones flotantes. También puede decir 'mostrar' u 'ocultar' seguido del nombre de una sección para alternar su visibilidad, por ejemplo, 'ocultar resumen general'. Para escuchar estadísticas específicas, diga 'cuántos' o 'cuántas' seguido del nombre de la estadística, por ejemplo, 'cuántas citas próximas'.";
    } else if (document.body.id === 'calendar-page') { // Guía específica para programaciones
        text = "Está en la sección de programaciones de visitas técnicas. Puede ver las programaciones organizadas por día. Haga clic en 'Ver Detalle' en cualquier programación para ver la información completa. Diga 'comandos' para ver las opciones. Diga 'cerrar sesión' para salir. Diga 'desactivar guía' para cerrar esta guía. También puede decir 'dictar observación', 'cambiar estado a pendiente', 'cambiar estado a en progreso', 'cambiar estado a completado', 'cambiar estado a cancelado' y 'guardar cambios' si el modal de detalles de visita está abierto.";
    } else if (document.body.id === 'technicians-page') { // Guía específica para técnicos
        text = "Está en la sección de técnicos. Aquí puede ver la lista de nuestros técnicos con su información de contacto y especialidades. Diga 'comandos' para ver las opciones. Diga 'cerrar sesión' para salir. Diga 'desactivar guía' para cerrar esta guía.";
    } else if (document.body.id === 'tickets-page') { // Guía específica para tickets
        text = "Está en la sección de tickets. Aquí puede ver una lista de todos los tickets, su estado y el técnico asignado. Diga 'comandos' para ver las opciones. Diga 'cerrar sesión' para salir. Diga 'desactivar guía' para cerrar esta guía.";
    } else if (document.body.id === 'reports-page') { // Guía específica para reportes
        text = "Está en la sección de reportes. Aquí puede ver estadísticas clave sobre atenciones y visitas. Diga 'comandos' para ver las opciones. Diga 'cerrar sesión' para salir. Diga 'desactivar guía' para cerrar esta guía.";
    } else if (document.body.id === 'settings-page') { // Guía específica para configuración
        text = "Está en la sección de configuración. Aquí puede ajustar las preferencias del sistema. Diga 'comandos' para ver las opciones. Diga 'cerrar sesión' para salir. Diga 'desactivar guía' para cerrar esta guía.";
    } else if (document.body.id === 'clients-page') { // Guía específica para clientes
        text = "Está en la sección de clientes. Aquí puede ver la lista de todos nuestros clientes. Diga 'comandos' para ver las opciones. Diga 'cerrar sesión' para salir. Diga 'desactivar guía' para cerrar esta guía.";
    } else if (document.body.id === 'services-page') { // Guía específica para servicios
        text = "Está en la sección de servicios. Aquí puede ver los diferentes servicios que ofrecemos. Diga 'comandos' para ver las opciones. Diga 'cerrar sesión' para salir. Diga 'desactivar guía' para cerrar esta guía.";
    }
    else { // Para otras páginas de módulos
        text = "Está en un módulo de PreySop. Puede usar los comandos de voz para navegar a otras secciones o interactuar con la página. Diga 'comandos' para ver las opciones. Diga 'cerrar sesión' para salir. Diga 'desactivar guía' para cerrar esta guía.";
    }
    
    speakText(text, false, () => { guideActive = false; });
}

/**
 * Resalta visualmente un campo o botón.
 * @param {string|null} field - ID del campo o tipo de botón a resaltar, o null para quitar resaltado.
 */
function highlightField(field) {
    // Quitar resaltado de todos los elementos interactivos
    document.querySelectorAll('.active-voice, .voice-highlight').forEach(el => {
        el.classList.remove('active-voice', 'voice-highlight');
    });

    // Aplicar resaltado específico
    if (field === "mic" && btnMic) btnMic.classList.add('voice-highlight');
    else if (field === "guia" && btnGuide) btnGuide.classList.add('voice-highlight');
    else if (field === "texto" && btnLargeText) btnLargeText.classList.add('voice-highlight');
    else if (field === "oscuro" && btnDarkMode) btnDarkMode.classList.add('voice-highlight');
    else if (field === "reset" && btnReset) btnReset.classList.add('voice-highlight');
    else if (field === "logout" && logoutBtn) logoutBtn.classList.add('voice-highlight');

    // Específicos para Login
    if (field === "usuario" && userInput) userInput.classList.add('active-voice');
    if (field === "contraseña" && passInput) passInput.classList.add('active-voice');
    if (field === "login" && btnLogin) btnLogin.classList.add('voice-highlight');
    if (field === "recover" && btnRecover) btnRecover.classList.add('voice-highlight');

    // Específicos para el modal de detalles de visita (calendar.html)
    if (field === "observaciones" && visitObservationsInput) visitObservationsInput.classList.add('active-voice');
    if (field === "estado" && visitStatusSelect) visitStatusSelect.classList.add('voice-highlight');
    if (field === "guardarCambiosVisita" && saveVisitChangesBtn) saveVisitChangesBtn.classList.add('voice-highlight');


    // Resaltar elementos de navegación
    if (field) {
        const navLinkElement = document.querySelector(`.nav-link[data-module="${field}"]`);
        if (navLinkElement) {
            navLinkElement.classList.add('voice-highlight');
        }
    }
}

/**
 * Maneja las confirmaciones de voz (ej. "borrar" o "no").
 * @param {string} questionText - La pregunta que el sistema hará al usuario.
 * @param {function} onConfirm - Callback si el usuario dice "borrar" (o "sí"/"mantener").
 * @param {function} onCancel - Callback si el usuario dice "no" (o "restablecer").
 */
function waitForConfirmation(questionText, onConfirm, onCancel) {
    waitingForConfirmation = true;
    showCaption(questionText);
    window.speechSynthesis.cancel(); // Cancelar cualquier voz previa

    speakText(questionText, false, () => {
        // Este callback se ejecuta CUANDO LA PREGUNTA TERMINA DE HABLARSE.
        // Es el momento CRÍTICO para asegurar que el reconocimiento esté escuchando.

        // Guardamos el onresult principal para restaurarlo después
        if (!originalOnResult && recognition && recognition.onresult) {
            originalOnResult = recognition.onresult;
        }

        // Definimos un nuevo onresult temporal para capturar solo la confirmación
        if (recognition) {
            recognition.onresult = function(event) {
                if (event.results[0].isFinal) {
                    const confirmResp = event.results[0][0].transcript.trim().toLowerCase();
                    
                    // Restaurar el onresult original ANTES de llamar a cualquier callback
                    if (originalOnResult) {
                        recognition.onresult = originalOnResult;
                        originalOnResult = null;
                    }
                    waitingForConfirmation = false; // Ya tenemos una respuesta

                    // Modificado para ser más flexible con las respuestas
                    if (confirmResp.includes("borrar") || confirmResp.includes("sí") || confirmResp.includes("si") || confirmResp.includes("mantener")) { 
                        showCaption("Confirmado.");
                        // Aquí, el mensaje específico de "campo borrado" o "modo mantenido" lo decide onConfirm
                        speakText("De acuerdo.", false, onConfirm); 
                    } else if (confirmResp.includes("no") || confirmResp.includes("restablecer")) { 
                        showCaption("Cancelado.");
                        speakText("De acuerdo.", false, () => {
                            onCancel();
                            highlightField(null); // Deseleccionar el campo
                        }); 
                    } else {
                        showCaption("No se entendió. Por favor, diga la opción correcta.");
                        speakText("No se entendió. Por favor, diga la opción correcta.", false, () => {
                            waitForConfirmation(questionText, onConfirm, onCancel); 
                        });
                    }
                } else {
                    showCaption("Escuchando confirmación: " + event.results[0][0].transcript.trim());
                }
            };

            // Forzar la reanudación del reconocimiento aquí
            if (isListening) {
                audioContext.resume().then(() => {
                    recognition.start(); 
                    console.log("Reconocimiento reiniciado para confirmación.");
                }).catch(e => console.error("Error al reanudar AudioContext para confirmación después de hablar:", e));
            }
        }
    });
}

/**
 * Muestra el overlay de carga con un mensaje.
 * @param {string} message - Mensaje a mostrar en el overlay.
 */
function showLoadingOverlay(message = "Cargando...") {
    if (loadingOverlay) {
        loadingOverlay.querySelector('p').textContent = message;
        loadingOverlay.style.display = 'flex';
    }
}

/**
 * Oculta el overlay de carga.
 */
function hideLoadingOverlay() {
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

/**
 * Muestra un spinner de carga en un botón.
 * @param {HTMLElement} buttonElement - El elemento del botón.
 */
function showButtonLoading(buttonElement) {
    if (buttonElement) {
        buttonElement.classList.add('loading');
        buttonElement.disabled = true; // Deshabilitar el botón mientras carga
        // Si el botón ya tiene un icono, lo ocultamos y mostramos un spinner genérico
        const existingIcon = buttonElement.querySelector('i');
        if (existingIcon) {
            existingIcon.style.display = 'none';
        }
        const spinner = document.createElement('i');
        spinner.className = 'fas fa-spinner fa-spin';
        buttonElement.prepend(spinner); // Añadir el spinner al inicio del botón
    }
}

/**
 * Oculta el spinner de carga de un botón.
 * @param {HTMLElement} buttonElement - El elemento del botón.
 */
function hideButtonLoading(buttonElement) {
    if (buttonElement) {
        buttonElement.classList.remove('loading');
        buttonElement.disabled = false; // Habilitar el botón
        const spinner = buttonElement.querySelector('.fa-spinner');
        if (spinner) {
            spinner.remove(); // Eliminar el spinner
        }
        const existingIcon = buttonElement.querySelector('i');
        if (existingIcon) {
            existingIcon.style.display = ''; // Mostrar el icono original
        }
    }
}


/**
 * Lógica para navegar a otros módulos con animación de carga y audio.
 * @param {string} url - La URL del módulo. Esta URL debe ser relativa a la ubicación actual del archivo HTML.
 * Por ejemplo, si estás en 'modulos/dashboard.html' y quieres ir a 'modulos/clients.html',
 * la URL sería 'clients.html'. Si quieres ir a 'index.html', sería '../index.html'.
 * @param {string} moduleName - Nombre del módulo para el mensaje de carga y audio.
 */
function navigateToModule(url, moduleName) {
    showLoadingOverlay(`Cargando ${moduleName}...`); // Esto muestra el overlay de carga
    // Detener el reconocimiento de voz si está activo antes de la redirección
    if (isListening && recognition) {
        recognition.stop();
        isListening = false;
        if (btnMic) btnMic.classList.remove('listening');
        highlightField(null);
    }
    // Ocultar el menú de navegación si está abierto (para móviles)
    if (mainNavCollapse && mainNavCollapse.classList.contains('active')) {
        mainNavCollapse.classList.remove('active');
        document.body.classList.remove('no-scroll'); // Re-habilitar scroll
    }

    // Reproducir audio antes de la navegación
    speakText(`Ingresando a ${moduleName}.`, false, () => {
        // Asegurar que la redirección ocurra después de un breve retraso para ver el overlay
        setTimeout(() => {
            window.location.href = url; // La redirección ocurre 0.5 segundos después de que el audio termina
        }, 500); 
    });
}


// --- Lógica del Reconocimiento de Voz (Inicialización y Eventos) ---
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.lang = "es-ES";
    recognition.continuous = true;
    recognition.interimResults = true;

    if (btnMic) {
        btnMic.addEventListener('click', () => {
            if (isListening) {
                isListening = false;
                recognition.stop();
                btnMic.classList.remove('listening');
                highlightField(null);
                showCaption("Dictado por voz desactivado.");
                window.speechSynthesis.cancel();
                currentField = null;
                waitingForConfirmation = false;
                originalOnResult = null;
                noSpeechCount = 0; // Resetear contador al desactivar manualmente
                speechDetectedInSession = false;
            } else {
                if (window.speechSynthesis.speaking) {
                    showCaption("Por favor, espere a que termine la guía o desactívela.");
                    speakText("Por favor, espere a que termine la guía o desactívela.");
                    return;
                }
                isListening = true;
                btnMic.classList.add('listening');
                highlightField("mic");
                showCaption("Activando reconocimiento de voz..."); 

                noSpeechCount = 0; // Resetear contador al activar
                speechDetectedInSession = false; // Resetear al iniciar nueva sesión

                audioContext.resume().then(() => {
                    recognition.start();
                    speakText("Reconocimiento de voz activado.");
                }).catch(e => console.error("Error al resumir AudioContext en btnMic click:", e));
            }
        });
    }

    // Evento que se dispara cuando el reconocimiento de voz ha comenzado a escuchar audio.
    recognition.onaudiostart = function() {
        console.log("Audio capturado por el reconocimiento.");
        if (isListening) {
            showCaption("Escuchando. Diga 'comandos' para ayuda, o lo que desea realizar.");
        }
    };

    // Evento que se dispara cuando se detecta voz.
    recognition.onspeechstart = function() {
        console.log("Voz detectada.");
        speechDetectedInSession = true; // Se detectó voz en esta sesión
        noSpeechCount = 0; // Resetear el contador de no-speech si se detecta voz
    };

    // Evento que se dispara cuando la voz ha dejado de ser detectada.
    recognition.onspeechend = function() {
        console.log("Fin de la detección de voz.");
    };

    // Este es el onresult PRINCIPAL que maneja TODOS los comandos de voz.
    recognition.onresult = function(event) {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript; 
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }

        showCaption("Escuchando: " + interimTranscript + (finalTranscript ? ` (Final: ${finalTranscript})` : ''));

        if (finalTranscript) {
            const transcript = finalTranscript.trim();
            const lower = transcript.toLowerCase();

            console.log("Final Transcript:", transcript); 
            console.log("Lower Transcript:", lower); 
            console.log("Current Field:", currentField); 

            // Si estamos esperando una confirmación, el onresult temporal de waitForConfirmation
            // ya está activo. No procesamos aquí.
            if (waitingForConfirmation) {
                console.log("Ignorando comando en onresult principal, esperando confirmación.");
                return;
            }

            // Detener cualquier síntesis de voz activa antes de procesar un nuevo comando.
            window.speechSynthesis.cancel(); 
            noSpeechCount = 0; 
            speechDetectedInSession = true; 

            // --- Lógica de Comandos Generalizada ---
            let commandHandled = false;

            // Comandos específicos de Login (solo si estamos en la página de login)
            if (document.body.id === 'login-page') {
                if (currentField === "usuario") {
                    if (userInput) {
                        userInput.value = transcript;
                        userInput.focus();
                    }
                    highlightField("usuario");
                    showCaption(`Usuario establecido: "${transcript}".`);
                    speakText(`Usuario establecido: "${transcript}".`);
                    currentField = null; 
                    commandHandled = true;
                } else if (currentField === "contraseña") {
                    if (passInput) {
                        passInput.value = transcript;
                        passInput.focus();
                    }
                    highlightField("contraseña");
                    showCaption(`Contraseña establecida.`);
                    speakText(`Contraseña establecida.`);
                    currentField = null; 
                    commandHandled = true;
                } else if (lower === "usuario") {
                    if (userInput && userInput.value) {
                        waitForConfirmation(
                            `El campo usuario ya tiene: "${userInput.value}". ¿Desea borrarlo para dictar uno nuevo? Diga "borrar" o "no".`,
                            () => { 
                                if (userInput) userInput.value = "";
                                if (userInput) userInput.focus();
                                highlightField("usuario");
                                showCaption("Campo usuario borrado. Diga el nombre de usuario.");
                                speakText("Campo usuario borrado. Diga el nombre de usuario.");
                                currentField = "usuario"; 
                            },
                            () => { 
                                showCaption("Contenido de usuario mantenido.");
                            }
                        );
                    } else {
                        currentField = "usuario";
                        if (userInput) userInput.focus();
                        highlightField("usuario");
                        speakText("Por favor, diga el nombre de usuario.");
                        showCaption("Campo usuario activado. Diga el nombre de usuario.");
                    }
                    commandHandled = true;
                } else if (lower === "contraseña") {
                    if (passInput && passInput.value) {
                        waitForConfirmation(
                            "El campo contraseña ya tiene un valor. ¿Desea borrarlo para dictar uno nuevo? Diga 'borrar' o 'no'.",
                            () => { 
                                if (passInput) passInput.value = "";
                                if (passInput) passInput.focus();
                                highlightField("contraseña");
                                showCaption("Campo contraseña borrado. Diga la contraseña.");
                                speakText("Campo contraseña borrado. Diga la contraseña.");
                                currentField = "contraseña"; 
                            },
                            () => { 
                                showCaption("Contenido de contraseña mantenido.");
                            }
                        );
                    } else {
                        currentField = "contraseña";
                        if (passInput) passInput.focus();
                        highlightField("contraseña");
                        speakText("Por favor, diga la contraseña.");
                        showCaption("Campo contraseña activado. Diga la contraseña.");
                    }
                    commandHandled = true;
                } else if (lower.includes("iniciar sesión") && loginForm) { 
                    highlightField("login");
                    if (btnLogin) btnLogin.focus(); 
                    showCaption("Botón Iniciar sesión activado.");
                    if (btnLogin) showButtonLoading(btnLogin); 
                    speakText("Iniciando sesión.", false, () => {
                        loginForm.dispatchEvent(new Event('submit')); 
                    });
                    commandHandled = true;
                } else if ((lower.includes("recuperar acceso") || lower.includes("olvidé mi contraseña")) && btnRecover) {
                    highlightField("recover");
                    btnRecover.focus();
                    showCaption("Botón Recuperar acceso activado.");
                    speakText("Botón Recuperar acceso activado.", false, () => {
                        setTimeout(() => { btnRecover.click(); }, 500);
                    });
                    commandHandled = true;
                }
            } 
            
            // Comandos de Navegación (comunes a todas las páginas con nav)
            if (!commandHandled) {
                // Abrir el menú de navegación con voz
                if (lower.includes("abrir menú") || lower.includes("abrir menu") || lower.includes("abrir navegación") || lower.includes("abrir navegacion")) {
                    if (mainNavCollapse && !mainNavCollapse.classList.contains('active')) {
                        mainNavCollapse.classList.add('active');
                        document.body.classList.add('no-scroll');
                        speakText("Menú de navegación abierto.");
                    } else {
                        speakText("El menú de navegación ya está abierto.");
                    }
                    commandHandled = true;
                } else if (lower.includes("cerrar menú") || lower.includes("cerrar menu") || lower.includes("cerrar navegación") || lower.includes("cerrar navegacion")) {
                    if (mainNavCollapse && mainNavCollapse.classList.contains('active')) {
                        mainNavCollapse.classList.remove('active');
                        document.body.classList.remove('no-scroll');
                        speakText("Menú de navegación cerrado.");
                    } else {
                        speakText("El menú de navegación ya está cerrado.");
                    }
                    commandHandled = true;
                }
                // Comandos para navegar a módulos
                let targetUrl = '';
                let moduleDisplayName = '';

                if (lower.includes("ir a inicio") || lower.includes("ir a home")) {
                    highlightField("home");
                    if (document.body.id !== 'login-page') {
                        targetUrl = 'dashboard.html'; 
                        moduleDisplayName = 'el panel principal';
                    } else {
                        targetUrl = 'index.html'; 
                        moduleDisplayName = 'la página de inicio';
                    }
                    commandHandled = true;
                } else if (lower.includes("ir a servicios")) {
                    highlightField("services");
                    targetUrl = 'services.html';
                    moduleDisplayName = 'servicios';
                    commandHandled = true;
                } else if (lower.includes("ir a clientes")) {
                    highlightField("clients");
                    targetUrl = 'clients.html';
                    moduleDisplayName = 'clientes';
                    commandHandled = true;
                } else if (lower.includes("ir a técnicos") || lower.includes("ir a tecnicos")) {
                    highlightField("technicians");
                    targetUrl = 'technicians.html';
                    moduleDisplayName = 'técnicos';
                    commandHandled = true;
                } else if (lower.includes("ir a tickets")) {
                    highlightField("tickets");
                    targetUrl = 'tickets.html';
                    moduleDisplayName = 'tickets';
                    commandHandled = true;
                } else if (lower.includes("ir a reportes")) {
                    highlightField("reports");
                    targetUrl = 'reports.html';
                    moduleDisplayName = 'reportes';
                    commandHandled = true;
                } else if (lower.includes("ir a programaciones") || lower.includes("ir a calendario")) { 
                    highlightField("calendar");
                    targetUrl = 'calendar.html';
                    moduleDisplayName = 'programaciones';
                    commandHandled = true;
                }
                 else if (lower.includes("ir a configuración") || lower.includes("ir a configuracion")) {
                    highlightField("settings");
                    targetUrl = 'settings.html';
                    moduleDisplayName = 'configuración';
                    commandHandled = true;
                } else if ((lower.includes("cerrar sesión") || lower.includes("salir")) && logoutBtn) {
                    highlightField("logout");
                    targetUrl = '../index.html'; 
                    moduleDisplayName = 'cerrando sesión';
                    commandHandled = true;
                }

                if (commandHandled && targetUrl) {
                    navigateToModule(targetUrl, moduleDisplayName);
                }
            }

            // Comandos Específicos del Dashboard (solo si estamos en el dashboard)
            if (document.body.id === 'dashboard-page' && !commandHandled) {
                // Comandos para leer estadísticas
                if (lower.includes("cuántos servicios") || lower.includes("total servicios")) {
                    const value = document.getElementById('total-services')?.textContent || '0';
                    speakText(`Hay ${value} servicios en total.`);
                    commandHandled = true;
                } else if (lower.includes("cuántas citas") || lower.includes("citas próximas")) {
                    const value = document.getElementById('upcoming-appointments')?.textContent || '0';
                    speakText(`Hay ${value} citas próximas.`);
                    commandHandled = true;
                } else if (lower.includes("cuántos técnicos") || lower.includes("técnicos activos") || lower.includes("cuantos tecnicos")) {
                    const value = document.getElementById('active-technicians')?.textContent || '0';
                    speakText(`Hay ${value} técnicos activos.`);
                    commandHandled = true;
                } else if (lower.includes("cuántas instalaciones starlink") || lower.includes("instalaciones starlink")) {
                    const value = document.getElementById('starlink-installs')?.textContent || '0';
                    speakText(`Hay ${value} instalaciones de Starlink.`);
                    commandHandled = true;
                }
                // Comandos para ocultar/mostrar secciones
                else if (lower.includes("ocultar resumen general") || lower.includes("ocultar resumen")) {
                    toggleSectionVisibility('overview', 'hide');
                    speakText("Sección de resumen general oculta.");
                    commandHandled = true;
                } else if (lower.includes("mostrar resumen general") || lower.includes("mostrar resumen")) {
                    toggleSectionVisibility('overview', 'show');
                    speakText("Sección de resumen general mostrada.");
                    commandHandled = true;
                } else if (lower.includes("ocultar estadísticas de servicios") || lower.includes("ocultar estadísticas")) {
                    toggleSectionVisibility('charts', 'hide');
                    speakText("Sección de estadísticas de servicios oculta.");
                    commandHandled = true;
                } else if (lower.includes("mostrar estadísticas de servicios") || lower.includes("mostrar estadísticas")) {
                    toggleSectionVisibility('charts', 'show');
                    speakText("Sección de estadísticas de servicios mostrada.");
                    commandHandled = true;
                } else if (lower.includes("ocultar actividad reciente") || lower.includes("ocultar actividad")) {
                    toggleSectionVisibility('recent-activity', 'hide');
                    speakText("Sección de actividad reciente oculta.");
                    commandHandled = true;
                } else if (lower.includes("mostrar actividad reciente") || lower.includes("mostrar actividad")) {
                    toggleSectionVisibility('recent-activity', 'show');
                    speakText("Sección de actividad reciente mostrada.");
                    commandHandled = true;
                }
            }

            // Comandos Específicos del Calendario/Programaciones (solo si estamos en calendar.html y modal abierto)
            const isVisitModalOpen = visitDetailModal && visitDetailModal.classList.contains('show');
            if (document.body.id === 'calendar-page' && isVisitModalOpen && !commandHandled) {
                if (lower.includes("dictar observación") || lower.includes("dictar nota")) {
                    currentField = "visitObservations";
                    if (visitObservationsInput) visitObservationsInput.focus();
                    highlightField("observaciones");
                    speakText("Por favor, diga la observación.");
                    showCaption("Campo observaciones activado. Diga la observación.");
                    commandHandled = true;
                } else if (currentField === "visitObservations") {
                    if (visitObservationsInput) visitObservationsInput.value = transcript;
                    highlightField("observaciones");
                    showCaption(`Observación establecida: "${transcript}".`);
                    speakText(`Observación establecida: "${transcript}".`);
                    currentField = null;
                    commandHandled = true;
                } else if (lower.includes("cambiar estado a ")) {
                    const statusMatch = lower.match(/cambiar estado a (.+)/);
                    if (statusMatch && statusMatch[1]) {
                        let newStatus = statusMatch[1].trim();
                        // Normalizar el estado para que coincida con las opciones del select
                        if (newStatus.includes("en progreso")) newStatus = "En Progreso";
                        else if (newStatus.includes("completado")) newStatus = "Completado";
                        else if (newStatus.includes("cancelado")) newStatus = "Cancelado";
                        else if (newStatus.includes("pendiente")) newStatus = "Pendiente";
                        
                        // Verificar si el estado es válido
                        const validStatuses = ["Pendiente", "En Progreso", "Completado", "Cancelado"];
                        if (validStatuses.includes(newStatus) && visitStatusSelect) {
                            visitStatusSelect.value = newStatus;
                            highlightField("estado");
                            showCaption(`Estado cambiado a: ${newStatus}.`);
                            speakText(`Estado cambiado a ${newStatus}.`);
                        } else {
                            showCaption(`Estado "${newStatus}" no reconocido. Intente con: Pendiente, En Progreso, Completado o Cancelado.`);
                            speakText(`Estado "${newStatus}" no reconocido. Intente con: Pendiente, En Progreso, Completado o Cancelado.`);
                        }
                    } else {
                        showCaption("Por favor, diga 'cambiar estado a' seguido del estado deseado.");
                        speakText("Por favor, diga 'cambiar estado a' seguido del estado deseado.");
                    }
                    commandHandled = true;
                } else if (lower.includes("guardar cambios") && saveVisitChangesBtn) {
                    highlightField("guardarCambiosVisita");
                    saveVisitChangesBtn.click(); // Trigger the click event on the save button
                    commandHandled = true;
                }
            }


            // Comandos de Accesibilidad Globales (siempre disponibles)
            if (!commandHandled) {
                if (lower.includes("desactivar guía") || lower.includes("cerrar guía")) {
                    guideActive = false;
                    window.speechSynthesis.cancel();
                    showCaption("Guía desactivada.");
                    speakText("Guía desactivada.", false);
                    commandHandled = true;
                } else if (lower.includes("modo oscuro") && btnDarkMode) {
                    highlightField("oscuro");
                    btnDarkMode.focus();
                    toggleDarkMode();
                    waitForConfirmation(
                        "Botón Modo oscuro activado. ¿Desea mantener el modo oscuro o restablecerlo? Diga 'mantener' o 'restablecer'.",
                        () => { speakText("Modo oscuro mantenido.", false); },
                        () => { toggleDarkMode(); speakText("Modo oscuro restablecido.", false); }
                    );
                    commandHandled = true;
                } else if ((lower.includes("aumentar texto") || lower.includes("texto grande")) && btnLargeText) {
                    highlightField("texto");
                    btnLargeText.focus();
                    toggleLargeText();
                    waitForConfirmation(
                        "Botón Aumentar texto activado. ¿Desea mantener el texto grande o restablecerlo? Diga 'mantener' o 'restablecer'.",
                        () => { speakText("Tamaño de texto mantenido.", false); },
                        () => { toggleLargeText(); speakText("Tamaño de texto restablecido.", false); }
                    );
                    commandHandled = true;
                } else if ((lower.includes("restablecer accesibilidad") || lower.includes("resetear accesibilidad")) && btnReset) {
                    highlightField("reset");
                    btnReset.focus();
                    showCaption("Botón Restablecer accesibilidad activado.");
                    speakText("Restableciendo accesibilidad.", false, () => {
                        setTimeout(() => { resetAccessibility(); }, 500);
                    });
                    commandHandled = true;
                } else if ((lower.includes("guía") || lower.includes("ayuda")) && btnGuide) {
                    highlightField("guia");
                    btnGuide.focus();
                    showCaption("Botón Guía activado.");
                    speakGuide();
                    commandHandled = true;
                } else if (lower.includes("desactivar micrófono") || lower.includes("cerrar micrófono")) {
                    isListening = false;
                    recognition.stop();
                    if (btnMic) btnMic.classList.remove('listening');
                    highlightField(null);
                    showCaption("Dictado por voz desactivado.");
                    speakText("Dictado por voz desactivado.");
                    commandHandled = true;
                } else if (lower.includes("comandos") || lower.includes("lista de comandos")) {
                    let comandos = "Puede decir: ";
                    if (document.body.id === 'login-page') {
                        comandos += "usuario, contraseña, iniciar sesión, recuperar acceso. ";
                    }
                    comandos += "Abrir menú, cerrar menú. Ir a inicio, ir a servicios, ir a clientes, ir a técnicos, ir a tickets, ir a reportes, ir a programaciones, ir a configuración, cerrar sesión. ";
                    if (document.body.id === 'dashboard-page') {
                        comandos += "También: cuántos servicios, cuántas citas, cuántos técnicos, cuántas instalaciones Starlink. Mostrar resumen, ocultar resumen. Mostrar estadísticas, ocultar estadísticas. Mostrar actividad, ocultar actividad. ";
                    }
                    if (document.body.id === 'calendar-page') {
                        comandos += "También: ver agenda de hoy. Dictar observación, cambiar estado a pendiente, cambiar estado a en progreso, cambiar estado a completado, cambiar estado a cancelado, guardar cambios. ";
                    }
                    if (document.body.id === 'tickets-page') {
                        comandos += "También: ver tickets. ";
                    }
                    if (document.body.id === 'reports-page') {
                        comandos += "También: ver reportes. ";
                    }
                    if (document.body.id === 'settings-page') {
                        comandos += "También: guardar configuración, cambiar idioma a español o inglés, activar o desactivar notificaciones, establecer tema claro, oscuro o sistema, activar o desactivar guardado automático, asignar técnico por defecto y el nombre del técnico. ";
                    }
                    if (document.body.id === 'clients-page') {
                        comandos += "También: ver clientes, listar clientes. ";
                    }
                    if (document.body.id === 'services-page') {
                        comandos += "También: ver servicios, listar servicios. ";
                    }
                    comandos += "Además: modo oscuro, aumentar texto, restablecer accesibilidad, guía, desactivar micrófono.";
                    showCaption("Comandos disponibles: " + comandos);
                    speakText("Comandos disponibles: " + comandos, false);
                    commandHandled = true;
                } 
                
                if (!commandHandled) {
                    showCaption("No existe el comando indicado. Diga 'comandos' para ver la lista.");
                    speakText("No existe el comando indicado. Diga 'comandos' para ver la lista.", false);
                }
            }
        }
    };

    recognition.onend = function(event) {
        console.log("Reconocimiento terminó (onend). isListening:", isListening, "speechDetectedInSession:", speechDetectedInSession, "event.error:", event ? event.error : 'N/A');
        if (isListening) {
            // Si el reconocimiento terminó y no fue por un error específico o por detección de voz
            // y no estamos en una confirmación activa, intentamos reiniciar.
            if (!speechDetectedInSession && !waitingForConfirmation) {
                noSpeechCount++;
                console.log(`No se detectó voz. Intentos restantes: ${maxNoSpeechAttempts - noSpeechCount}`);
                if (noSpeechCount >= maxNoSpeechAttempts) {
                    showCaption("No se detectó voz por un tiempo. Micrófono pausado. Active manualmente.");
                    speakText("No se detectó voz por un tiempo. Micrófono pausado. Active manualmente.");
                    isListening = false;
                    if (btnMic) btnMic.classList.remove('listening');
                    highlightField(null);
                    noSpeechCount = 0; // Resetear para el próximo inicio manual
                    speechDetectedInSession = false;
                    return; // No reiniciar automáticamente
                } else {
                    showCaption("No se detectó voz. Reanudando micrófono...");
                    // No hablar aquí, solo mostrar caption
                }
            } else {
                noSpeechCount = 0; // Resetear si hubo voz o si terminó por un comando
                speechDetectedInSession = false; // Resetear para la próxima sesión
            }

            // Reanudar el reconocimiento después de un breve retraso
            // Solo si isListening sigue siendo true (no se desactivó por maxNoSpeechAttempts)
            if (isListening) {
                setTimeout(() => {
                    audioContext.resume().then(() => {
                        recognition.start();
                    }).catch(e => console.error("Error al reanudar AudioContext en onend:", e));
                }, 500); // Pequeño retraso para evitar ciclos rápidos
            }
        } else {
            // Si isListening es false, el usuario lo desactivó manualmente o se detuvo por un error grave
            if (btnMic) btnMic.classList.remove('listening');
            highlightField(null);
            showCaption("Dictado por voz desactivado.");
        }
    };

    recognition.onerror = function(event) {
        console.error("Error de reconocimiento de voz:", event.error);
        if (waitingForConfirmation) {
            console.warn("Error de reconocimiento durante confirmación, la lógica de confirmación lo reintentará.");
            // No reiniciar aquí, la lógica de confirmación se encarga
            return; 
        }

        if (event.error === 'no-speech') {
            // El onend ya maneja la lógica de no-speech, así que aquí solo logueamos
            console.log("Error 'no-speech' detectado. El onend se encargará.");
        } else if (event.error === 'not-allowed') {
            showCaption("Permiso de micrófono denegado. Por favor, actívelo en la configuración del navegador.");
            speakText("Permiso de micrófono denegado. Por favor, actívelo en la configuración del navegador.");
            isListening = false;
            if (btnMic) {
                btnMic.classList.remove('listening');
                btnMic.disabled = true; // Deshabilitar el botón si no hay permiso
            }
            highlightField(null);
        } else if (event.error === 'aborted') {
            // Aborted puede ocurrir por varias razones, a menudo es seguro reintentar
            if (isListening) {
                showCaption("Reconocimiento de voz pausado. Reanudando..."); // Solo caption
                setTimeout(() => {
                    audioContext.resume().then(() => {
                        recognition.start();
                    }).catch(e => console.error("Error al reanudar AudioContext en onerror (abort):", e));
                }, 500);
            }
        } else {
            showCaption("Error de reconocimiento de voz: " + event.error + ". Reanudando..."); // Solo caption
            speakText("Error de reconocimiento de voz: " + event.error + ". Reanudando...");
            if (isListening) {
                setTimeout(() => {
                    audioContext.resume().then(() => {
                        recognition.start();
                    }).catch(e => console.error("Error al reanudar AudioContext en onerror (otro error):", e));
                }, 1000);
            }
        }
    };

} else {
    // Si la API de reconocimiento de voz no es soportada
    if (btnMic) {
        btnMic.disabled = true;
        btnMic.title = "Dictado no soportado en este navegador";
    }
    showCaption("Dictado por voz no soportado en este navegador.");
    console.warn("SpeechRecognition API no soportada en este navegador.");
}

// --- Funciones de Accesibilidad Globales (Modo Oscuro, Texto Grande, Reset) ---
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}
function toggleLargeText() {
    document.body.classList.toggle('large-text');
    localStorage.setItem('largeText', document.body.classList.contains('large-text'));
}
function resetAccessibility() {
    document.body.classList.remove('dark-mode');
    document.body.classList.remove('large-text');
    localStorage.removeItem('darkMode');
    localStorage.removeItem('largeText');
    if (btnMic) {
        btnMic.disabled = false;
        btnMic.title = "Activar dictado por voz";
    }
    showCaption("Accesibilidad restablecida a valores predeterminados.");
    speakText("Accesibilidad restablecida a valores predeterminados.");
}


// --- Lógica Específica de la Página de Login (index.html) ---
// Solo se ejecuta si el body tiene el ID 'login-page'
if (document.body.id === 'login-page') {
    if (loginForm) { 
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const usuarioInputVal = userInput ? userInput.value.trim() : '';
            const passwordInputVal = passInput ? passInput.value.trim() : '';

            showButtonLoading(btnLogin); 

            if (usuarioInputVal === 'admin' && passwordInputVal === 'admin') {
                navigateToModule('modulos/dashboard.html', 'el panel principal'); 
            } else {
                hideButtonLoading(btnLogin); 
                showCaption("Usuario o contraseña incorrectos.");
                speakText("Usuario o contraseña incorrectos.");
            }
        });
    }
}


// --- Lógica Específica del Dashboard (dashboard.html) ---
// Solo se ejecuta si el body tiene el ID 'dashboard-page'
if (document.body.id === 'dashboard-page') {
    // Datos de ejemplo para el dashboard (reutiliza reportsData para consistencia)
    const dashboardData = {
        totalServices: reportsData.totalServices,
        upcomingAppointments: reportsData.pendingTickets + reportsData.inProgressTickets, // Citas pendientes y en progreso
        activeTechnicians: technicians.length,
        starlinkInstalls: reportsData.servicesByCategory["Instalación Starlink"],
        serviceCategories: reportsData.servicesByCategory,
        recentActivity: [
            "Nueva instalación de Starlink para Cliente A. (Hace 2h)",
            "Mantenimiento de fibra óptica en Zona B. (Hace 5h)",
            "Cita programada con Cliente C para el 15/07. (Ayer)",
            "Reparación de red en oficina de Cliente D. (Hace 2 días)",
            "Venta de antena Starlink a Cliente E. (Hace 3 días)"
        ]
    };

    /**
     * Inicializa los datos y gráficos del dashboard.
     */
    function initializeDashboard() {
        document.getElementById('total-services').textContent = dashboardData.totalServices;
        document.getElementById('upcoming-appointments').textContent = dashboardData.upcomingAppointments;
        document.getElementById('active-technicians').textContent = dashboardData.activeTechnicians;
        document.getElementById('starlink-installs').textContent = dashboardData.starlinkInstalls;

        // Cargar actividad reciente
        const activityList = document.getElementById('activity-list');
        if (activityList) {
            activityList.innerHTML = ''; // Limpiar lista existente
            dashboardData.recentActivity.forEach(activity => {
                const li = document.createElement('li');
                li.className = 'list-group-item';
                li.textContent = activity;
                activityList.appendChild(li);
            });
        }

        // Inicializar el gráfico de servicios
        const ctx = document.getElementById('serviceChart');
        if (ctx) {
            new Chart(ctx, {
                type: 'bar', // Puedes cambiar a 'pie', 'line', etc.
                data: {
                    labels: Object.keys(dashboardData.serviceCategories),
                    datasets: [{
                        label: 'Número de Servicios',
                        data: Object.values(dashboardData.serviceCategories),
                        backgroundColor: [
                            'rgba(72, 125, 169, 0.8)', // main-blue
                            'rgba(127, 174, 214, 0.8)', // main-blue-light
                            'rgba(52, 92, 124, 0.8)', // main-blue-dark
                            'rgba(150, 200, 250, 0.8)',
                            'rgba(90, 140, 180, 0.8)'
                        ],
                        borderColor: [
                            'rgba(72, 125, 169, 1)',
                            'rgba(127, 174, 214, 1)',
                            'rgba(52, 92, 124, 1)',
                            'rgba(150, 200, 250, 1)',
                            'rgba(90, 140, 180, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    plugins: {
                        legend: {
                            display: false // Oculta la leyenda si solo hay un dataset
                        },
                        title: {
                            display: true,
                            text: 'Servicios por Categoría'
                        }
                    }
                }
            });
        }
    }

    /**
     * Alterna la visibilidad de una sección del dashboard.
     * @param {string} sectionId - El ID de la sección a alternar (e.g., 'overview', 'charts').
     * @param {string} [action='toggle'] - 'show', 'hide', o 'toggle'.
     */
    function toggleSectionVisibility(sectionId, action = 'toggle') {
        const section = document.getElementById(sectionId);
        if (!section) return;

        const toggleButton = section.querySelector('.toggle-section-btn');
        const isHidden = section.classList.contains('hidden-section');

        if (action === 'show' && isHidden) {
            section.classList.remove('hidden-section');
            if (toggleButton) {
                toggleButton.classList.remove('active');
                toggleButton.querySelector('i').className = 'fas fa-eye-slash'; // Ojo tachado
                toggleButton.setAttribute('aria-label', `Ocultar sección de ${sectionId.replace('-', ' ')}`);
            }
        } else if (action === 'hide' && !isHidden) {
            section.classList.add('hidden-section');
            if (toggleButton) {
                toggleButton.classList.add('active');
                toggleButton.querySelector('i').className = 'fas fa-eye'; // Ojo abierto
                toggleButton.setAttribute('aria-label', `Mostrar sección de ${sectionId.replace('-', ' ')}`);
            }
        } else if (action === 'toggle') {
            section.classList.toggle('hidden-section');
            if (toggleButton) {
                const newHiddenState = section.classList.contains('hidden-section');
                toggleButton.classList.toggle('active', newHiddenState);
                toggleButton.querySelector('i').className = newHiddenState ? 'fas fa-eye' : 'fas fa-eye-slash';
                toggleButton.setAttribute('aria-label', `${newHiddenState ? 'Mostrar' : 'Ocultar'} sección de ${sectionId.replace('-', ' ')}`);
            }
        }
    }

    // Añadir event listeners a los botones de toggle de sección
    document.querySelectorAll('.toggle-section-btn').forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.dataset.targetId;
            toggleSectionVisibility(targetId);
        });
    });
}


// --- Lógica Específica de la Vista de Programaciones (calendar.html) ---
// Solo se ejecuta si el body tiene el ID 'calendar-page'
if (document.body.id === 'calendar-page') {
    /**
     * Renders the daily program cards.
     */
    function renderDailyProgramCards() {
        if (!programCardsContainer) return;

        programCardsContainer.innerHTML = ''; // Limpiar el contenedor existente

        // Agrupar visitas por fecha
        const visitsByDate = technicalVisits.reduce((acc, visit) => {
            const date = visit.date;
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(visit);
            return acc;
        }, {});

        // Ordenar las fechas cronológicamente
        const sortedDates = Object.keys(visitsByDate).sort((a, b) => new Date(a) - new Date(b));

        if (sortedDates.length === 0) {
            programCardsContainer.innerHTML = `
                <div class="col-12 text-center text-muted p-5">
                    <p class="fs-4">No hay visitas programadas.</p>
                </div>
            `;
            return;
        }

        sortedDates.forEach(dateString => {
            const date = new Date(dateString + 'T00:00:00'); // Añadir T00:00:00 para evitar problemas de zona horaria
            const formattedDate = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            const visitsForDate = visitsByDate[dateString].sort((a, b) => a.time.localeCompare(b.time)); // Ordenar por hora

            const card = document.createElement('div');
            card.className = 'program-card'; // Clase para la tarjeta de día
            card.innerHTML = `
                <h3 class="program-card-header">${formattedDate}</h3>
                <ul class="list-group program-list">
                    <!-- Las programaciones se cargarán aquí -->
                </ul>
            `;

            const programList = card.querySelector('.program-list');
            visitsForDate.forEach(visit => {
                const li = document.createElement('li');
                li.className = 'list-group-item';
                li.innerHTML = `
                    <div>
                        <h5 class="program-item-title">${visit.time} - ${visit.reason}</h5>
                        <p class="program-item-meta"><strong>Empresa:</strong> ${visit.company}</p>
                        <p class="program-item-meta"><strong>Técnico:</strong> ${visit.technician}</p>
                        <span class="badge status-badge status-${visit.status.toLowerCase().replace(/\s/g, '-')}">${visit.status}</span>
                    </div>
                    <button class="btn program-item-details-btn" data-visit-id="${visit.id}" aria-label="Ver detalles de la visita">
                        Ver Detalle <i class="fas fa-info-circle"></i>
                    </button>
                `;
                li.querySelector('.program-item-details-btn').addEventListener('click', () => showVisitDetails(visit.id));
                programList.appendChild(li);
            });

            programCardsContainer.appendChild(card);
        });
    }

    /**
     * Shows the detailed information of a technical visit in a modal.
     * @param {string} visitId - The ID of the visit to display.
     */
    function showVisitDetails(visitId) {
        const visit = technicalVisits.find(v => v.id === visitId);
        if (!visit) {
            console.error('Visita no encontrada:', visitId);
            return;
        }

        currentVisitIdInModal = visitId; // *** Guardar el ID de la visita actual ***

        const modalTitle = document.getElementById('visitDetailModalLabel');
        const modalBody = document.getElementById('visitDetailModalBody'); // Contenedor principal del body
        const btnMap = document.getElementById('btnViewMap');
        
        // Referencias a los nuevos campos dentro del modal
        const obsInput = document.getElementById('visitObservationsInput');
        const statusSelect = document.getElementById('visitStatusSelect');
        const saveBtn = document.getElementById('saveVisitChangesBtn');


        if (modalTitle && modalBody && btnMap && obsInput && statusSelect && saveBtn) {
            modalTitle.textContent = `Detalles de Visita: ${visit.reason}`;
            
            let contactsHtml = '';
            if (visit.contacts && visit.contacts.length > 0) {
                contactsHtml = `<p class="mb-1"><strong>Contactos:</strong></p><ul class="products-list">`; 
                visit.contacts.forEach(contact => {
                    contactsHtml += `<li>${contact.name} - ${contact.phone}</li>`;
                });
                contactsHtml += `</ul>`;
            } else {
                contactsHtml = `<p><strong>Contactos:</strong> No especificados.</p>`;
            }

            let productsHtml = '';
            if (visit.productsToInstall && visit.productsToInstall.length > 0) {
                productsHtml = `<p class="mb-1"><strong>Productos a Instalar:</strong></p><ul class="products-list">`;
                visit.productsToInstall.forEach(product => {
                    productsHtml += `<li><strong>${product.name}</strong> (${product.type}) - Cantidad: ${product.quantity}</li>`;
                });
                productsHtml += `</ul>`;
            } else {
                productsHtml = `<p><strong>Productos a Instalar:</strong> Ninguno.</p>`;
            }

            // Contenido HTML principal del modal (excluyendo los campos de observación/estado que ya están en el HTML)
            const mainDetailsHtml = `
                <p><strong>Empresa:</strong> ${visit.company}</p>
                <p><strong>Motivo:</strong> ${visit.reason}</p>
                <p><strong>Fecha y Hora:</strong> ${new Date(visit.date + 'T' + visit.time).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                <p><strong>Estado Actual:</strong> <span class="badge status-badge status-${visit.status.toLowerCase().replace(/\s/g, '-')}">${visit.status}</span></p>
                <p><strong>Técnico Asignado:</strong> ${visit.technician}</p>
                ${contactsHtml}
                <p><strong>Dirección:</strong> ${visit.address}</p>
                <p><strong>Fecha de Instalación:</strong> ${visit.installationDate || 'No aplica'}</p>
                ${productsHtml}
                <p><strong>Coordenadas GPS:</strong> ${visit.gpsCoords.lat}, ${visit.gpsCoords.lng}</p>
            `;
            // Insertar los detalles principales antes de los campos de observación/estado
            modalBody.querySelector('.mb-3').insertAdjacentHTML('beforebegin', mainDetailsHtml);


            // Llenar los campos de observación y estado
            obsInput.value = visit.notes || '';
            statusSelect.value = visit.status;

            if (visit.gpsCoords && (visit.gpsCoords.lat !== 0 || visit.gpsCoords.lng !== 0)) { 
                btnMap.style.display = 'flex'; 
                btnMap.onclick = () => simulateMap(visit.gpsCoords);
            } else {
                btnMap.style.display = 'none';
            }

            // Añadir event listener al botón de guardar cambios
            saveBtn.onclick = () => saveVisitChanges(visitId);

            const bsModal = new bootstrap.Modal(visitDetailModal);
            bsModal.show();

            // Limpiar los detalles principales al ocultar el modal para evitar duplicados
            visitDetailModal.addEventListener('hidden.bs.modal', () => {
                const elementsToRemove = modalBody.querySelectorAll('p:not(.mb-1), ul.products-list, span.status-badge');
                elementsToRemove.forEach(el => {
                    // Asegurarse de no eliminar los campos de input y select
                    if (el !== obsInput.parentNode && el !== statusSelect.parentNode) {
                        el.remove();
                    }
                });
                currentVisitIdInModal = null; // Limpiar el ID de la visita
                currentField = null; // Limpiar cualquier campo de dictado activo
            }, { once: true }); // Ejecutar solo una vez
        }
    }

    /**
     * Saves the changes (observations and status) for a specific visit.
     * @param {string} visitId - The ID of the visit to update.
     */
    function saveVisitChanges(visitId) {
        const visit = technicalVisits.find(v => v.id === visitId);
        if (!visit) {
            console.error('Visita no encontrada para guardar cambios:', visitId);
            showCaption("Error: Visita no encontrada para guardar cambios.");
            speakText("Error: Visita no encontrada para guardar cambios.");
            return;
        }

        const newObservations = visitObservationsInput ? visitObservationsInput.value.trim() : '';
        const newStatus = visitStatusSelect ? visitStatusSelect.value : visit.status;

        // Mostrar carga en el botón de guardar
        showButtonLoading(saveVisitChangesBtn);

        // Simular guardado en el "backend" (actualizar el array local)
        setTimeout(() => {
            visit.notes = newObservations;
            visit.status = newStatus;

            hideButtonLoading(saveVisitChangesBtn); // Ocultar carga
            
            // Re-renderizar las tarjetas para reflejar el cambio de estado
            renderDailyProgramCards(); 

            // Ocultar el modal
            const bsModal = bootstrap.Modal.getInstance(visitDetailModal);
            if (bsModal) {
                bsModal.hide();
            }

            showCaption("Cambios guardados exitosamente.");
            speakText("Cambios guardados exitosamente.");
            console.log(`Visita ${visitId} actualizada: Observaciones "${newObservations}", Estado "${newStatus}"`);
        }, 1000); // Simular un retraso de 1 segundo para el guardado
    }


    /**
     * Simulates viewing the GPS coordinates on a map.
     * In a real application, this would open a map service (e.g., Google Maps).
     * @param {object} coords - Object with lat and lng properties.
     */
    function simulateMap(coords) {
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
        console.log("Attempting to open map:", mapUrl); // Log para depuración
        showCaption(`Abriendo mapa para: ${coords.lat}, ${coords.lng}`);
        window.open(mapUrl, '_blank'); // Abrir inmediatamente
    }

    // Renderizar las tarjetas de programación al cargar la página de calendario
    renderDailyProgramCards();

    // Asegurarse de que el modal se inicialice con Bootstrap JS
    // Esto se hace automáticamente con el bundle, pero si tuvieras un problema,
    // podrías añadir new bootstrap.Modal(document.getElementById('visitDetailModal'));
    // al final de DOMContentLoaded para inicializarlo explícitamente.
}

// --- Lógica Específica de la Vista de Técnicos (technicians.html) ---
// Solo se ejecuta si el body tiene el ID 'technicians-page'
if (document.body.id === 'technicians-page') {
    /**
     * Renders the technician cards.
     */
    function renderTechnicians() {
        if (!technicianCardsContainer) return;

        technicianCardsContainer.innerHTML = ''; // Limpiar el contenedor existente

        if (technicians.length === 0) {
            technicianCardsContainer.innerHTML = `
                <div class="col-12 text-center text-muted p-5">
                    <p class="fs-4">No hay técnicos registrados.</p>
                </div>
            `;
            return;
        }

        technicians.forEach(tech => {
            const card = document.createElement('div');
            card.className = 'technician-card';
            card.innerHTML = `
                <img src="${tech.photo}" alt="Foto de ${tech.name}" class="technician-photo">
                <h3 class="technician-name">${tech.name}</h3>
                <p class="technician-specialty">${tech.specialty}</p>
                <div class="technician-contact-info">
                    <p><i class="fas fa-envelope"></i> ${tech.email}</p>
                    <p><i class="fas fa-phone"></i> ${tech.phone}</p>
                </div>
                <p class="technician-bio">${tech.bio}</p>
            `;
            technicianCardsContainer.appendChild(card);
        });
    }

    // Renderizar los técnicos al cargar la página
    renderTechnicians();
}

// --- Lógica Específica de la Vista de Tickets (tickets.html) ---
// Solo se ejecuta si el body tiene el ID 'tickets-page'
if (document.body.id === 'tickets-page') {
    /**
     * Renders the ticket cards.
     */
    function renderTickets() {
        if (!ticketCardsContainer) return;

        ticketCardsContainer.innerHTML = ''; // Limpiar el contenedor existente

        if (tickets.length === 0) {
            ticketCardsContainer.innerHTML = `
                <div class="col-12 text-center text-muted p-5">
                    <p class="fs-4">No hay tickets registrados.</p>
                </div>
            `;
            return;
        }

        tickets.forEach(ticket => {
            const assignedTech = technicians.find(tech => tech.id === ticket.assignedTechnicianId);
            const techName = assignedTech ? assignedTech.name : 'No asignado';

            const card = document.createElement('div');
            card.className = 'ticket-card';
            card.innerHTML = `
                <h3 class="ticket-number">Ticket #${ticket.ticketNumber}</h3>
                <p class="ticket-subject">${ticket.subject}</p>
                <p class="ticket-meta"><strong>Creado:</strong> ${ticket.creationDate}</p>
                <p class="ticket-meta"><strong>Última Respuesta:</strong> ${ticket.lastResponse}</p>
                <p class="ticket-meta"><strong>Técnico Asignado:</strong> ${techName}</p>
                <span class="badge status-badge status-${ticket.status.toLowerCase().replace(/\s/g, '-')}">${ticket.status}</span>
            `;
            ticketCardsContainer.appendChild(card);
        });
    }

    // Renderizar los tickets al cargar la página
    renderTickets();
}

// --- Lógica Específica de la Vista de Reportes (reports.html) ---
// Solo se ejecuta si el body tiene el ID 'reports-page'
if (document.body.id === 'reports-page') {
    /**
     * Initializes the reports data and charts.
     */
    function initializeReports() {
        if (!reportSummaryGrid) return;

        // Renderizar el resumen de reportes
        reportSummaryGrid.innerHTML = `
            <div class="report-summary-card">
                <h4>Total de Servicios</h4>
                <p class="value">${reportsData.totalServices}</p>
            </div>
            <div class="report-summary-card">
                <h4>Visitas Completadas</h4>
                <p class="value">${reportsData.completedVisitas}</p>
            </div>
            <div class="report-summary-card">
                <h4>Tickets Pendientes</h4>
                <p class="value">${reportsData.pendingTickets}</p>
            </div>
            <div class="report-summary-card">
                <h4>Tickets en Progreso</h4>
                <p class="value">${reportsData.inProgressTickets}</p>
            </div>
            <div class="report-summary-card">
                <h4>Total de Tickets</h4>
                <p class="value">${reportsData.totalTickets}</p>
            </div>
        `;

        // Inicializar el gráfico de visitas mensuales
        if (serviceChartCanvas) {
            new Chart(serviceChartCanvas, {
                type: 'line',
                data: {
                    labels: Object.keys(reportsData.visitsByMonth),
                    datasets: [{
                        label: 'Número de Visitas',
                        data: Object.values(reportsData.visitsByMonth),
                        backgroundColor: 'rgba(72, 125, 169, 0.5)',
                        borderColor: 'rgba(72, 125, 169, 1)',
                        borderWidth: 2,
                        tension: 0.3,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Visitas Técnicas por Mes'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Cantidad de Visitas'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Mes'
                            }
                        }
                    }
                }
            });
        }
    }

    // Inicializar reportes al cargar la página
    initializeReports();
}

// --- Lógica Específica de la Vista de Configuración (settings.html) ---
// Solo se ejecuta si el body tiene el ID 'settings-page'
if (document.body.id === 'settings-page') {
    /**
     * Renders the settings form with current options.
     */
    function renderSettings() {
        if (!settingsForm) return;

        // Cargar configuración guardada al inicio
        const savedSettings = localStorage.getItem('appSettings');
        if (savedSettings) {
            Object.assign(settingsOptions, JSON.parse(savedSettings));
        }

        settingsForm.innerHTML = `
            <div class="form-group mb-4">
                <label for="languageSelect" class="form-label">Idioma:</label>
                <select class="form-select" id="languageSelect">
                    <option value="es" ${settingsOptions.language === 'es' ? 'selected' : ''}>Español</option>
                    <option value="en" ${settingsOptions.language === 'en' ? 'selected' : ''}>English</option>
                </select>
            </div>

            <div class="form-group mb-4">
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="notificationsToggle" ${settingsOptions.notifications ? 'checked' : ''}>
                    <label class="form-check-label" for="notificationsToggle">Recibir Notificaciones</label>
                </div>
            </div>

            <div class="form-group mb-4">
                <label for="themeSelect" class="form-label">Tema de la Interfaz:</label>
                <select class="form-select" id="themeSelect">
                    <option value="system" ${settingsOptions.theme === 'system' ? 'selected' : ''}>Sistema (Automático)</option>
                    <option value="light" ${settingsOptions.theme === 'light' ? 'selected' : ''}>Claro</option>
                    <option value="dark" ${settingsOptions.theme === 'dark' ? 'selected' : ''}>Oscuro</option>
                </select>
            </div>

            <div class="form-group mb-4">
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="autoSaveToggle" ${settingsOptions.autoSave ? 'checked' : ''}>
                    <label class="form-check-label" for="autoSaveToggle">Guardado Automático</label>
                </div>
            </div>

            <div class="form-group mb-4">
                <label for="defaultTechnicianSelect" class="form-label">Técnico por Defecto para Asignaciones:</label>
                <select class="form-select" id="defaultTechnicianSelect">
                    <option value="">-- Seleccionar --</option>
                    ${technicians.map(tech => `<option value="${tech.id}" ${settingsOptions.defaultTechnician === tech.id ? 'selected' : ''}>${tech.name}</option>`).join('')}
                </select>
            </div>

            <button type="submit" class="btn btn-primary btn-save-settings" id="save-settings-btn">
                Guardar Configuración <i class="fas fa-save"></i>
            </button>
        `;

        // Añadir event listener para guardar la configuración
        settingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const saveBtn = document.getElementById('save-settings-btn');
            showButtonLoading(saveBtn); // Mostrar carga en el botón de guardar

            settingsOptions.language = document.getElementById('languageSelect').value;
            settingsOptions.notifications = document.getElementById('notificationsToggle').checked;
            settingsOptions.theme = document.getElementById('themeSelect').value;
            settingsOptions.autoSave = document.getElementById('autoSaveToggle').checked;
            settingsOptions.defaultTechnician = document.getElementById('defaultTechnicianSelect').value;

            // Aquí podrías enviar esto a un backend o guardarlo en localStorage
            localStorage.setItem('appSettings', JSON.stringify(settingsOptions));
            
            // Simular un pequeño retraso para la animación de carga
            setTimeout(() => {
                hideButtonLoading(saveBtn); // Ocultar carga
                showCaption("Configuración guardada exitosamente.");
                speakText("Configuración guardada exitosamente.");

                // Aplicar el tema si se cambió
                if (settingsOptions.theme === 'dark') {
                    document.body.classList.add('dark-mode');
                } else if (settingsOptions.theme === 'light') {
                    document.body.classList.remove('dark-mode');
                } else { // system
                    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                        document.body.classList.add('dark-mode');
                    } else {
                        document.body.classList.remove('dark-mode');
                    }
                }
            }, 1000); // 1 segundo de simulación de guardado
        });
    }

    // Renderizar la configuración al cargar la página
    renderSettings();
}

// --- Lógica Específica de la Vista de Clientes (clients.html) ---
// Solo se ejecuta si el body tiene el ID 'clients-page'
if (document.body.id === 'clients-page') {
    /**
     * Renders the client cards.
     */
    function renderClients() {
        if (!clientCardsContainer) return;

        clientCardsContainer.innerHTML = ''; // Limpiar el contenedor existente

        if (clients.length === 0) {
            clientCardsContainer.innerHTML = `
                <div class="col-12 text-center text-muted p-5">
                    <p class="fs-4">No hay clientes registrados.</p>
                </div>
            `;
            return;
        }

        clients.forEach(client => {
            const card = document.createElement('div');
            card.className = 'client-card';
            card.innerHTML = `
                <img src="${client.photo}" alt="Foto de ${client.name}" class="client-photo">
                <h3 class="client-name">${client.name}</h3>
                <p class="client-meta"><i class="fas fa-user"></i> ${client.contactPerson}</p>
                <p class="client-meta"><i class="fas fa-phone"></i> ${client.phone}</p>
                <p class="client-meta"><i class="fas fa-envelope"></i> ${client.email}</p>
                <p class="client-meta"><i class="fas fa-map-marker-alt"></i> ${client.address}</p>
                <span class="badge bg-info text-dark">${client.type}</span>
            `;
            clientCardsContainer.appendChild(card);
        });
    }

    // Renderizar los clientes al cargar la página
    renderClients();
}

// --- Lógica Específica de la Vista de Servicios (services.html) ---
// Solo se ejecuta si el body tiene el ID 'services-page'
if (document.body.id === 'services-page') {
    /**
     * Renders the service cards.
     */
    function renderServices() {
        if (!serviceCardsContainer) return;

        serviceCardsContainer.innerHTML = ''; // Limpiar el contenedor existente

        if (services.length === 0) {
            serviceCardsContainer.innerHTML = `
                <div class="col-12 text-center text-muted p-5">
                    <p class="fs-4">No hay servicios registrados.</p>
                </div>
            `;
            return;
        }

        services.forEach(service => {
            const card = document.createElement('div');
            card.className = 'service-card';
            card.innerHTML = `
                <i class="${service.icon} service-icon"></i>
                <h3 class="service-title">${service.name}</h3>
                <p class="service-description">${service.description}</p>
            `;
            serviceCardsContainer.appendChild(card);
        });
    }

    // Renderizar los servicios al cargar la página
    renderServices();
}


// --- Inicialización al cargar el DOM (Común a todas las páginas) ---
window.addEventListener('DOMContentLoaded', () => {
    // Aplicar preferencias de accesibilidad guardadas
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        if (parsedSettings.theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else if (parsedSettings.theme === 'light') {
            document.body.classList.remove('dark-mode');
        } else { // system
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
        }
        if (parsedSettings.largeText) { // Asumiendo que largeText también se guarda en settingsOptions
            document.body.classList.add('large-text');
        }
    } else {
        // Fallback si no hay settings guardados, usar localStorage directo para darkMode/largeText
        if (localStorage.getItem('darkMode') === 'true') document.body.classList.add('dark-mode');
        if (localStorage.getItem('largeText') === 'true') document.body.classList.add('large-text');
    }


    // Asignar IDs al body para diferenciar la lógica JavaScript
    const path = window.location.pathname;
    if (path.includes('index.html') || path === '/') {
        document.body.id = 'login-page';
    } else if (path.includes('dashboard.html')) {
        document.body.id = 'dashboard-page';
    } else if (path.includes('calendar.html')) { // ID para la página de programaciones
        document.body.id = 'calendar-page';
    } else if (path.includes('technicians.html')) { // ID para la página de técnicos
        document.body.id = 'technicians-page';
    } else if (path.includes('tickets.html')) { // Nuevo ID para la página de tickets
        document.body.id = 'tickets-page';
    } else if (path.includes('reports.html')) { // Nuevo ID para la página de reportes
        document.body.id = 'reports-page';
    } else if (path.includes('settings.html')) { // Nuevo ID para la página de configuración
        document.body.id = 'settings-page';
    } else if (path.includes('clients.html')) { // Nuevo ID para la página de clientes
        document.body.id = 'clients-page';
    } else if (path.includes('services.html')) { // Nuevo ID para la página de servicios
        document.body.id = 'services-page';
    }
    else {
        document.body.id = 'module-page'; // Para cualquier otra página de módulo
    }

    // Inicializar el dashboard si es la página de dashboard
    if (document.body.id === 'dashboard-page') {
        initializeDashboard();
    }
    // Inicializar los clientes si es la página de clientes
    if (document.body.id === 'clients-page') {
        renderClients();
    }
    // Inicializar los servicios si es la página de servicios
    if (document.body.id === 'services-page') {
        renderServices();
    }


    // Lógica para el menú de navegación colapsable
    if (hamburgerBtn && mainNavCollapse && closeNavBtn) {
        hamburgerBtn.addEventListener('click', () => {
            mainNavCollapse.classList.add('active');
            document.body.classList.add('no-scroll'); // Evitar scroll de fondo
        });
        closeNavBtn.addEventListener('click', () => {
            mainNavCollapse.classList.remove('active');
            document.body.classList.remove('no-scroll');
        });
    }

    // Event Listener para el botón de cerrar sesión (si existe en la página actual)
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Determinar la ruta base para la navegación de cerrar sesión
            // Si la página actual está en 'modulos/', la ruta base es '../' para salir de 'modulos'
            const currentPath = window.location.pathname;
            let logoutUrl = 'index.html'; // Por defecto, si estamos en la raíz
            if (currentPath.includes('/modulos/')) {
                logoutUrl = '../index.html'; // Si estamos en un subdirectorio 'modulos/'
            }
            navigateToModule(logoutUrl, 'cerrando sesión'); 
        });
    }
});

// Estilo para evitar scroll cuando el menú móvil está abierto
document.head.insertAdjacentHTML('beforeend', `<style>
    body.no-scroll { overflow: hidden; }
</style>`);
