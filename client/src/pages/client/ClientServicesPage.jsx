// client/src/pages/client/ClientServicesPage.jsx
import { useState, useRef } from 'react';
import MainLayout from '../../components/MainLayout';
import api from '../../api/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faNetworkWired, 
  faVideo, 
  faLaptopCode, 
  faClipboardCheck,
  faCartPlus,
  faBriefcase,
  faTrashCan,
  faPlus,
  faMinus,
  faCheck,
  faXmark,
  faSearch,
  faPaperPlane,
  faServer,
  faBatteryFull,
  faWifi,
  faHardDrive,
  faMicrochip,
  faDesktop,
  faFileInvoice,
  faArrowRight,
  faArrowLeft,
  faPlug,
  faKeyboard,
  faPrint,
  faChevronLeft,
  faChevronRight,
  faDatabase,
  faFan,
  faMemory,
  faBolt,
  faLayerGroup,
  faLaptop,
  faShieldHalved,
  faCloudArrowUp,
  faBuilding,
  faGlobe,
  faIdCard
} from '@fortawesome/free-solid-svg-icons';

export default function ClientServicesPage() {
  // Paso 1: null (2 tarjetas principales) | 'services' | 'store'
  const [activeSection, setActiveSection] = useState(null);

  // Paso 2 (dentro de 'services'): null (4 áreas) | 'redes' | 'seguridad' | 'software' | 'auditoria'
  const [selectedServiceArea, setSelectedServiceArea] = useState(null);

  // Paso 2 (dentro de 'store'): null (3 categorías) | 'A' | 'B' | 'C'
  const [selectedGroup, setSelectedGroup] = useState(null);

  // ================= ESTADO SECCIÓN 1: SERVICIOS Y PROYECTOS (3 PASOS) =================
  const [selectedSubServices, setSelectedSubServices] = useState([]);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceDetails, setServiceDetails] = useState('');
  const [sendingService, setSendingService] = useState(false);
  const [successDialog, setSuccessDialog] = useState(null);

  // Paso 2: 4 Áreas limpias de Servicios y Proyectos
  const serviceAreas = [
    {
      id: 'redes',
      tag: 'Conectividad y Oficina',
      title: 'Redes e Internet Empresarial',
      subtitle: 'Puntos de red cableados, ampliación de Wi-Fi, orden de gabinetes y enlaces entre oficinas.',
      icon: faNetworkWired
    },
    {
      id: 'seguridad',
      tag: 'Protección Física y Energía',
      title: 'Seguridad y Respaldo Eléctrico',
      subtitle: 'Cámaras de vigilancia con acceso móvil, control de acceso y respaldo UPS contra apagones.',
      icon: faShieldHalved
    },
    {
      id: 'software',
      tag: 'Digitalización y Nube',
      title: 'Web, Software y Licencias',
      subtitle: 'Páginas web corporativas, sistemas a medida, copias en la nube y licencias Microsoft 365.',
      icon: faLaptopCode
    },
    {
      id: 'auditoria',
      tag: 'Diagnóstico y Planificación',
      title: 'Consultoría y Auditoría IT',
      subtitle: 'Inventario de equipos, mudanza tecnológica de oficinas y optimización de servidores.',
      icon: faClipboardCheck
    }
  ];

  // Paso 3: Servicios puntuales dentro de cada área (en lenguaje cotidiano)
  const subServicesByArea = {
    redes: [
      {
        id: 'net-1',
        title: 'Instalación de Puntos de Red Cableados',
        description: 'Cableado estructurado limpio y certificado para computadoras, impresoras y teléfonos de oficina.',
        benefit: 'Conexión rápida y sin caídas',
        icon: faNetworkWired
      },
      {
        id: 'net-2',
        title: 'Ampliación y Mejora de Señal Wi-Fi',
        description: 'Eliminación de zonas sin cobertura Wi-Fi en oficinas, salas de reuniones o almacenes.',
        benefit: 'Cobertura estable en toda la sede',
        icon: faWifi
      },
      {
        id: 'net-3',
        title: 'Saneamiento y Orden de Gabinetes (Racks)',
        description: 'Organización de cables, etiquetado de puertos y mejora de ventilación para prevenir fallas.',
        benefit: 'Mantenimiento más rápido y seguro',
        icon: faLayerGroup
      },
      {
        id: 'net-4',
        title: 'Conexión Segura entre Sucursales / Teletrabajo',
        description: 'Configuración de acceso remoto (VPN) para trabajar desde casa o unir dos sedes de su empresa.',
        benefit: 'Acceso protegido a sus archivos',
        icon: faGlobe
      }
    ],
    seguridad: [
      {
        id: 'sec-1',
        title: 'Instalación de Cámaras de Seguridad (CCTV)',
        description: 'Cámaras de alta definición con grabación continua y visualización en vivo desde su teléfono celular.',
        benefit: 'Monitoreo 24/7 desde cualquier lugar',
        icon: faVideo
      },
      {
        id: 'sec-2',
        title: 'Control de Acceso y Asistencia',
        description: 'Lectores biométricos, tarjetas o cerraduras electromagnéticas para controlar entradas de personal.',
        benefit: 'Seguridad y registro de horarios',
        icon: faIdCard
      },
      {
        id: 'sec-3',
        title: 'Respaldo Eléctrico contra Apagones (UPS / Inversores)',
        description: 'Instalación y cálculo de respaldo energético para que sus equipos e internet sigan operando sin luz.',
        benefit: 'Protección ante cortes y bajones',
        icon: faBolt
      }
    ],
    software: [
      {
        id: 'dev-1',
        title: 'Diseño de Página Web Corporativa',
        description: 'Sitio web profesional, moderno y adaptado a celulares para presentar los servicios de su empresa.',
        benefit: 'Presencia digital profesional',
        icon: faGlobe
      },
      {
        id: 'dev-2',
        title: 'Desarrollo de Sistemas y Automatización a Medida',
        description: 'Creación de herramientas internas, portales o integración entre sus sistemas administrativos.',
        benefit: 'Ahorro de tiempo en tareas manuales',
        icon: faLaptopCode
      },
      {
        id: 'dev-3',
        title: 'Licenciamiento Oficial (Microsoft 365 / Windows / Antivirus)',
        description: 'Correos corporativos con dominio propio (@suempresa.com), paquetes Office y protección empresarial.',
        benefit: '100% legal, seguro y con soporte',
        icon: faShieldHalved
      },
      {
        id: 'dev-4',
        title: 'Respaldo Automático en la Nube',
        description: 'Copias de seguridad automáticas diarias de sus documentos y bases de datos importantes.',
        benefit: 'Información protegida ante pérdida o robo',
        icon: faCloudArrowUp
      }
    ],
    auditoria: [
      {
        id: 'aud-1',
        title: 'Inventario y Diagnóstico Completo de Equipos',
        description: 'Revisión física y técnica de todas las computadoras de la empresa con informe de estado y mejoras.',
        benefit: 'Control total de sus activos',
        icon: faClipboardCheck
      },
      {
        id: 'aud-2',
        title: 'Mudanza o Apertura de Nueva Oficina',
        description: 'Desmontaje, traslado, instalación de red y puesta en marcha de todos sus puestos de trabajo.',
        benefit: 'Traslado ordenado sin detener operaciones',
        icon: faBuilding
      },
      {
        id: 'aud-3',
        title: 'Optimización y Mantenimiento de Servidores',
        description: 'Limpieza profunda, revisión de almacenamiento y respaldo preventivo de su servidor central.',
        benefit: 'Mayor velocidad y vida útil',
        icon: faServer
      }
    ]
  };

  const handleSelectServiceArea = (areaId) => {
    setSelectedServiceArea(areaId);
    setSelectedSubServices([]);
  };

  const toggleSubService = (subService) => {
    setSelectedSubServices(prev => {
      const exists = prev.find(s => s.id === subService.id);
      if (exists) {
        return prev.filter(s => s.id !== subService.id);
      }
      return [...prev, subService];
    });
  };

  const handleOpenServiceRequestModal = (singleService = null) => {
    if (singleService) {
      setSelectedSubServices(prev =>
        prev.some(s => s.id === singleService.id) ? prev : [...prev, singleService]
      );
    }
    setIsServiceModalOpen(true);
  };

  const handleRequestServicesSubmit = async (e) => {
    e.preventDefault();
    if (selectedSubServices.length === 0) return;

    try {
      setSendingService(true);
      const areaTitle = serviceAreas.find(a => a.id === selectedServiceArea)?.title || 'Servicios Especializados';
      const listSummary = selectedSubServices.map(s => `- ${s.title}`).join('\n');

      await api.post('/tickets', {
        subject: `[Proyecto / Servicio] ${areaTitle} (${selectedSubServices.length} seleccionados)`,
        description: `Servicios solicitados:\n${listSummary}\n\nComentarios del cliente: ${serviceDetails || 'Solicito evaluación técnica y presupuesto.'}`,
        ticket_type: 'requirement',
        priority: 'medium'
      }).catch(() => {});

      setSuccessDialog({
        badge: 'Requerimiento Registrado',
        title: '¡Solicitud de Servicio Enviada!',
        message: 'Un especialista de SAMANDTECH revisará su requerimiento y se pondrá en contacto con usted a la brevedad.'
      });
      setSelectedSubServices([]);
      setServiceDetails('');
      setIsServiceModalOpen(false);
    } finally {
      setSendingService(false);
    }
  };

  // ================= ESTADO SECCIÓN 2: CATÁLOGO DE HARDWARE (3 PASOS) =================
  const [selectedArticleId, setSelectedArticleId] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const carouselRef = useRef(null);

  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartNotes, setCartNotes] = useState('');
  const [sendingQuote, setSendingQuote] = useState(false);

  const [isCustomPartOpen, setIsCustomPartOpen] = useState(false);
  const [customPartForm, setCustomPartForm] = useState({
    equipmentModel: '',
    partType: '',
    serialOrNotes: ''
  });
  const [sendingCustomPart, setSendingCustomPart] = useState(false);

  const hardwareGroups = [
    {
      id: 'A',
      tag: 'Uso Diario y Oficina',
      title: 'Computadoras y Laptops',
      subtitle: 'Cargadores, baterías, pantallas, memoria RAM, discos rápidos, teclados y mouse.',
      icon: faLaptop
    },
    {
      id: 'B',
      tag: 'Conectividad y Protección',
      title: 'Redes, Energía e Impresión',
      subtitle: 'Baterías UPS contra apagones, routers Wi-Fi, cámaras de seguridad e impresoras.',
      icon: faWifi
    },
    {
      id: 'C',
      tag: 'Infraestructura Central',
      title: 'Servidores y Centro de Datos',
      subtitle: 'Servidores empresariales, discos de alta capacidad, fuentes de poder y gabinetes rack.',
      icon: faServer
    }
  ];

  const lenovoCategoriesByGroup = {
    A: [
      { id: 'A-BAT', label: 'BATERÍA Y CARGADOR', icon: faPlug },
      { id: 'A-SSD', label: 'DISCOS RÁPIDOS (SSD)', icon: faHardDrive },
      { id: 'A-RAM', label: 'MEMORIA RAM', icon: faMemory },
      { id: 'A-LCD', label: 'PANTALLAS Y MONITORES', icon: faDesktop },
      { id: 'A-KEY', label: 'TECLADOS Y MOUSE', icon: faKeyboard },
      { id: 'A-BRD', label: 'PIEZAS INTERNAS', icon: faMicrochip }
    ],
    B: [
      { id: 'B-UPS', label: 'BATERÍAS UPS Y ENERGÍA', icon: faBatteryFull },
      { id: 'B-NET', label: 'ROUTERS Y WI-FI', icon: faWifi },
      { id: 'B-SEC', label: 'CÁMARAS DE SEGURIDAD', icon: faVideo },
      { id: 'B-PRT', label: 'IMPRESORAS Y TÓNER', icon: faPrint }
    ],
    C: [
      { id: 'C-SRV', label: 'SERVIDORES COMPLETOS', icon: faServer },
      { id: 'C-SAS', label: 'DISCOS PARA SERVIDOR', icon: faDatabase },
      { id: 'C-ECC', label: 'MEMORIA DE SERVIDOR', icon: faMemory },
      { id: 'C-PSU', label: 'FUENTES DE PODER', icon: faBolt },
      { id: 'C-RCK', label: 'RACKS Y GABINETES', icon: faLayerGroup },
      { id: 'C-FAN', label: 'VENTILACIÓN', icon: faFan }
    ]
  };

  const catalogItems = [
    // GRUPO A
    {
      id: 'prod-a1',
      group: 'A',
      articleId: 'A-BAT',
      name: 'Cargador / Adaptador de Corriente para Laptop',
      specs: 'Cargador original o certificado con protección contra bajones de voltaje. Disponible en USB-C y punta tradicional.',
      status: 'Disponible',
      icon: faPlug
    },
    {
      id: 'prod-a2',
      group: 'A',
      articleId: 'A-BAT',
      name: 'Batería de Reemplazo para Laptop',
      specs: 'Batería nueva de larga duración para recuperar la autonomía de su portátil sin estar conectada.',
      status: 'Según modelo de laptop',
      icon: faBatteryFull
    },
    {
      id: 'prod-a3',
      group: 'A',
      articleId: 'A-SSD',
      name: 'Disco Sólido Rápido (SSD) 480GB / 1TB',
      specs: 'Acelera hasta 5 veces el encendido y velocidad de computadoras lentas. Incluye instalación y respaldo.',
      status: 'Instalación incluida',
      icon: faHardDrive
    },
    {
      id: 'prod-a4',
      group: 'A',
      articleId: 'A-RAM',
      name: 'Ampliación de Memoria RAM (8GB / 16GB)',
      specs: 'Permite abrir múltiples programas y pestañas al mismo tiempo sin que la computadora se trabe.',
      status: 'Disponible',
      icon: faMemory
    },
    {
      id: 'prod-a5',
      group: 'A',
      articleId: 'A-LCD',
      name: 'Monitor de Escritorio 24" Full HD / Pantalla de Laptop',
      specs: 'Pantalla amplia con descanso visual para oficina o reemplazo de pantalla rota para portátil.',
      status: 'Disponible',
      icon: faDesktop
    },
    {
      id: 'prod-a6',
      group: 'A',
      articleId: 'A-KEY',
      name: 'Teclado de Repuesto / Combo Teclado y Mouse Inalámbrico',
      specs: 'Teclado interno en español para laptop o kit inalámbrico ergonómico para escritorio.',
      status: 'Disponible',
      icon: faKeyboard
    },

    // GRUPO B
    {
      id: 'prod-b1',
      group: 'B',
      articleId: 'B-UPS',
      name: 'Batería de Respaldo UPS (1000VA / 1500VA)',
      specs: 'Mantiene encendidas sus computadoras y el internet durante cortes de luz y protege contra picos eléctricos.',
      status: 'Entrega inmediata',
      icon: faBatteryFull
    },
    {
      id: 'prod-b2',
      group: 'B',
      articleId: 'B-NET',
      name: 'Router Wi-Fi Empresarial de Largo Alcance / Switch de Red',
      specs: 'Elimina zonas sin señal Wi-Fi en la oficina y conecta múltiples equipos con máxima estabilidad.',
      status: 'Disponible',
      icon: faWifi
    },
    {
      id: 'prod-b3',
      group: 'B',
      articleId: 'B-SEC',
      name: 'Kit de 4 u 8 Cámaras de Seguridad HD + Grabador',
      specs: 'Vea las cámaras de su negocio en vivo desde su teléfono celular las 24 horas.',
      status: 'Incluye configuración',
      icon: faVideo
    },
    {
      id: 'prod-b4',
      group: 'B',
      articleId: 'B-PRT',
      name: 'Impresora Multifuncional Láser de Oficina + Tóner',
      specs: 'Imprime, escanea y copia rápido desde cualquier computadora conectada a la red.',
      status: 'Disponible',
      icon: faPrint
    },

    // GRUPO C
    {
      id: 'prod-c1',
      group: 'C',
      articleId: 'C-SRV',
      name: 'Servidor Empresarial (Tipo Torre o Rack)',
      specs: 'Equipo central de alto rendimiento para sistemas administrativos, bases de datos y archivos compartidos.',
      status: 'A medida',
      icon: faServer
    },
    {
      id: 'prod-c2',
      group: 'C',
      articleId: 'C-SAS',
      name: 'Disco Duro Especial para Servidor (SAS / Enterprise)',
      specs: 'Discos diseñados para trabajar 24/7 sin interrupciones, compatibles con Dell, HPE y Lenovo.',
      status: 'Disponible',
      icon: faDatabase
    },
    {
      id: 'prod-c3',
      group: 'C',
      articleId: 'C-ECC',
      name: 'Memoria RAM Especial para Servidor (ECC)',
      specs: 'Memoria de alta confiabilidad con corrección automática de errores para servidores.',
      status: 'Disponible',
      icon: faMemory
    },
    {
      id: 'prod-c4',
      group: 'C',
      articleId: 'C-PSU',
      name: 'Fuente de Poder Redundante para Servidor',
      specs: 'Fuente de respaldo intercambiable en caliente para evitar que el servidor se apague si falla una fuente.',
      status: 'Según modelo',
      icon: faBolt
    },
    {
      id: 'prod-c5',
      group: 'C',
      articleId: 'C-RCK',
      name: 'Gabinete Rack Cerrado + Regletas y Bandejas',
      specs: 'Armario metálico con llave y ventilación para organizar servidores, switches y routers.',
      status: 'Disponible',
      icon: faLayerGroup
    }
  ];

  const handleSelectGroup = (groupId) => {
    setSelectedGroup(groupId);
    setSelectedArticleId('ALL');
    setSearchTerm('');
  };

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -240 : 240,
        behavior: 'smooth'
      });
    }
  };

  const currentAreaInfo = serviceAreas.find(a => a.id === selectedServiceArea);
  const currentSubServices = selectedServiceArea ? (subServicesByArea[selectedServiceArea] || []) : [];

  const currentGroupInfo = hardwareGroups.find(g => g.id === selectedGroup);
  const currentGroupCategories = selectedGroup ? (lenovoCategoriesByGroup[selectedGroup] || []) : [];

  const filteredProducts = catalogItems.filter(item => {
    const matchesGroup = item.group === selectedGroup;
    const matchesArticle = selectedArticleId === 'ALL' || item.articleId === selectedArticleId;
    const matchesSearch = searchTerm === '' ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.specs.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGroup && matchesArticle && matchesSearch;
  });

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const totalItemsInCart = cart.reduce((acc, item) => acc + item.qty, 0);

  const handleSendQuoteRequest = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    try {
      setSendingQuote(true);
      const summary = cart.map(c => `- ${c.qty}x ${c.name}`).join('\n');

      await api.post('/tickets', {
        subject: `[Solicitud de Cotización] ${totalItemsInCart} equipos/piezas`,
        description: `Equipos seleccionados para cotización:\n${summary}\n\nNotas del cliente: ${cartNotes || 'Ninguna'}`,
        ticket_type: 'requirement',
        priority: 'medium'
      }).catch(() => {});

      setSuccessDialog({
        badge: 'Orden de Cotización',
        title: '¡Solicitud de Cotización Enviada!',
        message: 'Nuestro departamento comercial ha recibido su listado y le enviará los precios y disponibilidad a la brevedad.'
      });
      setCart([]);
      setCartNotes('');
      setIsCartOpen(false);
    } finally {
      setSendingQuote(false);
    }
  };

  const handleSendCustomPart = async (e) => {
    e.preventDefault();
    try {
      setSendingCustomPart(true);
      await api.post('/tickets', {
        subject: `[Cotización Pieza Específica] ${customPartForm.partType} - ${customPartForm.equipmentModel}`,
        description: `Equipo: ${customPartForm.equipmentModel}\nPieza buscada: ${customPartForm.partType}\nSerial / Notas: ${customPartForm.serialOrNotes || 'No especificado'}`,
        ticket_type: 'requirement',
        priority: 'medium'
      }).catch(() => {});

      setSuccessDialog({
        badge: 'Búsqueda por Modelo / Serial',
        title: '¡Consulta de Repuesto Registrada!',
        message: 'Verificaremos la compatibilidad exacta para su equipo y le enviaremos la cotización formal.'
      });
      setCustomPartForm({ equipmentModel: '', partType: '', serialOrNotes: '' });
      setIsCustomPartOpen(false);
    } finally {
      setSendingCustomPart(false);
    }
  };

  return (
    <MainLayout title="Servicios Adicionales y Equipamiento">
      <div className="max-w-5xl mx-auto">

        {/* ================= PASO 1: 2 TARJETAS PRINCIPALES EN EL MEDIO ================= */}
        {activeSection === null && (
          <div className="min-h-[calc(100vh-190px)] flex flex-col justify-center space-y-8 py-4">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#00877D]">
                SAMANDTECH • Soluciones Integrales
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                ¿Qué desea solicitar hoy?
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Seleccione si necesita contratar un proyecto o instalación técnica, o si desea cotizar equipos y repuestos para su empresa.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
              {/* TARJETA 1: SERVICIOS Y PROYECTOS */}
              <button
                type="button"
                onClick={() => {
                  setActiveSection('services');
                  setSelectedServiceArea(null);
                }}
                className="group text-left bg-white p-8 rounded-2xl border border-slate-200 hover:border-[#00877D] transition-all shadow-sm hover:shadow-lg flex flex-col justify-between gap-8"
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 text-[#1E293B] group-hover:bg-[#00877D] group-hover:text-white flex items-center justify-center text-2xl transition-colors">
                    <FontAwesomeIcon icon={faBriefcase} />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-[#00877D] transition-colors">
                      Servicios y Proyectos Especializados
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Instalación de redes Wi-Fi, cámaras de seguridad, desarrollo de páginas web, licencias y revisión técnica de su oficina.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-[#1E293B] group-hover:text-[#00877D]">
                  <span>Ver Áreas de Servicio</span>
                  <FontAwesomeIcon icon={faArrowRight} className="transition-transform group-hover:translate-x-1" />
                </div>
              </button>

              {/* TARJETA 2: EQUIPOS Y REPUESTOS */}
              <button
                type="button"
                onClick={() => {
                  setActiveSection('store');
                  setSelectedGroup(null);
                }}
                className="group text-left bg-white p-8 rounded-2xl border border-slate-200 hover:border-[#00877D] transition-all shadow-sm hover:shadow-lg flex flex-col justify-between gap-8"
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 text-[#1E293B] group-hover:bg-[#00877D] group-hover:text-white flex items-center justify-center text-2xl transition-colors">
                    <FontAwesomeIcon icon={faServer} />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-[#00877D] transition-colors">
                      Suministro de Hardware y Piezas
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Cotice repuestos para computadoras y laptops, baterías UPS contra apagones, routers, impresoras o componentes para servidores.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-[#1E293B] group-hover:text-[#00877D]">
                  <span>Explorar Equipos y Piezas</span>
                  <FontAwesomeIcon icon={faArrowRight} className="transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ================= PASO 2 (SERVICIOS): 4 ÁREAS LIMPIAS ================= */}
        {activeSection === 'services' && selectedServiceArea === null && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveSection(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-[#1E293B] text-slate-700 hover:text-white text-xs font-bold transition-colors flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3" />
                <span>Volver</span>
              </button>
              <span className="text-xs font-bold text-slate-500">
                Proyectos e Instalaciones a Medida
              </span>
            </div>

            <div className="text-center max-w-xl mx-auto pt-2 pb-1 space-y-1.5">
              <h2 className="text-xl font-black text-slate-900">
                ¿En qué área necesita apoyo o mejora?
              </h2>
              <p className="text-xs text-slate-600">
                Seleccione una de las 4 áreas para ver los servicios específicos que podemos realizar en su empresa.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {serviceAreas.map(area => (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => handleSelectServiceArea(area.id)}
                  className="group text-left bg-white p-7 rounded-2xl border border-slate-200 hover:border-[#00877D] transition-all shadow-xs hover:shadow-md flex flex-col justify-between gap-6"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-[#00877D]/10 text-[#00877D] group-hover:bg-[#00877D] group-hover:text-white flex items-center justify-center text-xl transition-colors">
                      <FontAwesomeIcon icon={area.icon} />
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-[#00877D]">
                        {area.tag}
                      </span>
                      <h3 className="text-lg font-black text-slate-900">
                        {area.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {area.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800 group-hover:text-[#00877D]">
                    <span>Ver servicios de esta área</span>
                    <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ================= PASO 3 (SERVICIOS): DESGLOSE Y SELECCIÓN MÚLTIPLE ================= */}
        {activeSection === 'services' && selectedServiceArea !== null && (
          <div className="space-y-6">
            {/* Barra superior con botón volver y resumen de seleccionados */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedServiceArea(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-[#1E293B] text-slate-700 hover:text-white text-xs font-bold transition-colors flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3" />
                <span>Cambiar Área de Servicio</span>
              </button>

              <button
                type="button"
                disabled={selectedSubServices.length === 0}
                onClick={() => setIsServiceModalOpen(true)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
                  selectedSubServices.length > 0
                    ? 'bg-[#00877D] hover:bg-[#00736A] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <FontAwesomeIcon icon={faCheck} />
                <span>Solicitar Servicios Seleccionados ({selectedSubServices.length})</span>
              </button>
            </div>

            {/* Encabezado limpio del área */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 border-l-4 border-l-[#00877D]">
              <span className="text-[11px] font-bold text-[#00877D] uppercase tracking-wider">
                {currentAreaInfo?.tag}
              </span>
              <h2 className="text-lg font-black text-slate-900 mt-0.5">
                {currentAreaInfo?.title}
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Puede marcar uno o varios servicios de la lista para solicitar una visita de evaluación o presupuesto.
              </p>
            </div>

            {/* Tarjetas luminosas de servicios puntuales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {currentSubServices.map(sub => {
                const isSelected = selectedSubServices.some(s => s.id === sub.id);
                return (
                  <div 
                    key={sub.id}
                    className={`bg-white rounded-2xl p-6 border transition-all shadow-xs flex flex-col justify-between gap-5 ${
                      isSelected ? 'border-[#00877D] ring-2 ring-[#00877D]/15' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base ${
                          isSelected ? 'bg-[#00877D] text-white' : 'bg-slate-100 text-[#00877D]'
                        }`}>
                          <FontAwesomeIcon icon={sub.icon} />
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                          {sub.benefit}
                        </span>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <h3 className="text-sm font-extrabold text-slate-900">
                          {sub.title}
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {sub.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => toggleSubService(sub)}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 border ${
                          isSelected
                            ? 'bg-[#00877D]/10 text-[#00877D] border-[#00877D]'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <FontAwesomeIcon icon={isSelected ? faCheck : faPlus} />
                        <span>{isSelected ? 'Seleccionado' : 'Marcar en mi lista'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenServiceRequestModal(sub)}
                        className="py-2.5 px-4 rounded-xl bg-[#1E293B] hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                      >
                        Pedir ahora
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= PASO 2 (HARDWARE): 3 TARJETAS DE CATEGORÍA ================= */}
        {activeSection === 'store' && selectedGroup === null && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setActiveSection(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-[#1E293B] text-slate-700 hover:text-white text-xs font-bold transition-colors flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3" />
                <span>Volver</span>
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCustomPartOpen(true)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold transition-colors"
                >
                  + Buscar pieza por modelo exacto
                </button>

                {totalItemsInCart > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(true)}
                    className="px-4 py-2 rounded-xl bg-[#00877D] text-white text-xs font-bold flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faFileInvoice} />
                    <span>Mi Cotización ({totalItemsInCart})</span>
                  </button>
                )}
              </div>
            </div>

            <div className="text-center max-w-xl mx-auto pt-4 pb-2 space-y-1.5">
              <h2 className="text-xl font-black text-slate-900">
                ¿Para qué tipo de equipo busca piezas o suministro?
              </h2>
              <p className="text-xs text-slate-600">
                Elija una de las 3 categorías para ver los artículos disponibles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {hardwareGroups.map(group => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => handleSelectGroup(group.id)}
                  className="group text-left bg-white p-7 rounded-2xl border border-slate-200 hover:border-[#00877D] transition-all shadow-xs hover:shadow-md flex flex-col justify-between gap-6"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-[#00877D]/10 text-[#00877D] group-hover:bg-[#00877D] group-hover:text-white flex items-center justify-center text-xl transition-colors">
                      <FontAwesomeIcon icon={group.icon} />
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-[#00877D]">
                        {group.tag}
                      </span>
                      <h3 className="text-lg font-black text-slate-900">
                        {group.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {group.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800 group-hover:text-[#00877D]">
                    <span>Ver artículos</span>
                    <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ================= PASO 3 (HARDWARE): DESGLOSE LIMPIO ESTILO LENOVO ================= */}
        {activeSection === 'store' && selectedGroup !== null && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedGroup(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-[#1E293B] text-slate-700 hover:text-white text-xs font-bold transition-colors flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3" />
                <span>Cambiar Categoría de Equipo</span>
              </button>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCustomPartOpen(true)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold transition-colors"
                >
                  + Pedir pieza por modelo exacto
                </button>

                <button
                  type="button"
                  onClick={() => setIsCartOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#00877D] hover:bg-[#00736A] text-white text-xs font-bold flex items-center gap-2 transition-colors"
                >
                  <FontAwesomeIcon icon={faFileInvoice} />
                  <span>Lista a Cotizar</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/20 text-white font-bold text-[11px]">
                    {totalItemsInCart}
                  </span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[11px] font-bold text-[#00877D] uppercase tracking-wider">
                    {currentGroupInfo?.title}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Seleccione el tipo de artículo que necesita
                  </h3>
                </div>

                {selectedArticleId !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => setSelectedArticleId('ALL')}
                    className="text-xs font-bold text-[#00877D] hover:underline self-start sm:self-auto"
                  >
                    Mostrar todos
                  </button>
                )}
              </div>

              <div className="relative flex items-center">
                <button
                  type="button"
                  onClick={() => scrollCarousel('left')}
                  className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-400 flex items-center justify-center shrink-0 shadow-2xs"
                  aria-label="Anterior"
                >
                  <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
                </button>

                <div 
                  ref={carouselRef}
                  className="flex-1 flex items-stretch gap-3 overflow-x-auto px-3 py-1 scroll-smooth no-scrollbar"
                >
                  {currentGroupCategories.map(cat => {
                    const isSelected = selectedArticleId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedArticleId(isSelected ? 'ALL' : cat.id)}
                        className={`min-w-[135px] flex-1 p-4 rounded-xl border transition-all flex flex-col items-center justify-center text-center gap-3 relative ${
                          isSelected
                            ? 'bg-[#00877D]/5 border-[#00877D]'
                            : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute bottom-0 left-4 right-4 h-1 bg-[#00877D] rounded-t-full" />
                        )}

                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-colors ${
                          isSelected
                            ? 'bg-[#00877D] text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          <FontAwesomeIcon icon={cat.icon} />
                        </div>

                        <span className={`text-[11px] font-extrabold uppercase leading-tight ${
                          isSelected ? 'text-[#00877D]' : 'text-slate-800'
                        }`}>
                          {cat.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => scrollCarousel('right')}
                  className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-400 flex items-center justify-center shrink-0 shadow-2xs"
                  aria-label="Siguiente"
                >
                  <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3" />
                </button>
              </div>

              <div className="relative">
                <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-3.5 text-slate-400 text-xs" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Escriba aquí lo que busca (Ej: cargador, batería, disco rápido, impresora)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#00877D]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map(product => (
                <div 
                  key={product.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-[#00877D]/60 transition-all shadow-xs flex flex-col justify-between gap-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#00877D] flex items-center justify-center text-base">
                        <FontAwesomeIcon icon={product.icon} />
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                        {product.status}
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {product.specs}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => addToCart(product)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#1E293B] hover:bg-[#00877D] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <FontAwesomeIcon icon={faCartPlus} />
                    <span>Agregar a mi cotización</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ================= MODAL SOLICITAR SERVICIOS SELECCIONADOS ================= */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white">
            <div className="bg-[#1E293B] text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#11C6EA]">
                  {currentAreaInfo?.title}
                </span>
                <h3 className="text-base font-extrabold">Confirmar Solicitud de Servicio</h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsServiceModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <form onSubmit={handleRequestServicesSubmit} className="p-6 space-y-4">
              <div>
                <span className="block text-xs font-bold text-slate-700 mb-2">
                  Servicios seleccionados ({selectedSubServices.length}):
                </span>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedSubServices.map(s => (
                    <div key={s.id} className="bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{s.title}</span>
                      <button
                        type="button"
                        onClick={() => toggleSubService(s)}
                        className="text-slate-400 hover:text-red-500"
                        title="Quitar"
                      >
                        <FontAwesomeIcon icon={faTrashCan} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ¿Algún detalle adicional sobre su oficina o requerimiento? (Opcional)
                </label>
                <textarea
                  rows="3"
                  value={serviceDetails}
                  onChange={(e) => setServiceDetails(e.target.value)}
                  placeholder="Ej: Somos aproximadamente 15 personas en la oficina y nos gustaría coordinar una visita..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#00877D]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-50"
                >
                  Seguir viendo
                </button>
                <button
                  type="submit"
                  disabled={sendingService || selectedSubServices.length === 0}
                  className="px-5 py-2 rounded-xl bg-[#00877D] text-white text-xs font-bold flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faPaperPlane} />
                  {sendingService ? 'Enviando...' : 'Enviar Solicitud'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL COTIZAR PIEZA EXACTA POR MODELO ================= */}
      {isCustomPartOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white">
            <div className="bg-[#1E293B] text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#11C6EA]">
                  Búsqueda Personalizada
                </span>
                <h3 className="text-base font-extrabold">Pedir Pieza por Modelo de Equipo</h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsCustomPartOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <form onSubmit={handleSendCustomPart} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Marca y Modelo de su Equipo *
                </label>
                <input
                  type="text"
                  required
                  value={customPartForm.equipmentModel}
                  onChange={(e) => setCustomPartForm({ ...customPartForm, equipmentModel: e.target.value })}
                  placeholder="Ej: Laptop Lenovo ThinkPad / HP ProBook / Servidor Dell"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#00877D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ¿Qué pieza o repuesto necesita? *
                </label>
                <input
                  type="text"
                  required
                  value={customPartForm.partType}
                  onChange={(e) => setCustomPartForm({ ...customPartForm, partType: e.target.value })}
                  placeholder="Ej: Cargador original, batería, pantalla, disco..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#00877D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Número de serie (si lo tiene a mano) o detalles adicionales
                </label>
                <textarea
                  rows="2"
                  value={customPartForm.serialOrNotes}
                  onChange={(e) => setCustomPartForm({ ...customPartForm, serialOrNotes: e.target.value })}
                  placeholder="Opcional: escriba el serial que aparece debajo del equipo..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#00877D]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCustomPartOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={sendingCustomPart}
                  className="px-5 py-2 rounded-xl bg-[#00877D] text-white text-xs font-bold flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faPaperPlane} />
                  {sendingCustomPart ? 'Enviando...' : 'Solicitar Cotización'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL LISTA DE COTIZACIÓN ================= */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white">
            <div className="bg-[#1E293B] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FontAwesomeIcon icon={faFileInvoice} className="text-[#11C6EA]" />
                <h3 className="text-base font-extrabold">Equipos Seleccionados para Cotizar</h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <form onSubmit={handleSendQuoteRequest} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-8">
                  Aún no ha agregado artículos a su lista.
                </p>
              ) : (
                <>
                  <div className="space-y-2.5">
                    {cart.map(item => (
                      <div key={item.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-[#00877D] flex items-center justify-center text-sm shrink-0">
                            <FontAwesomeIcon icon={item.icon} />
                          </div>
                          <h4 className="text-xs font-extrabold text-slate-900">{item.name}</h4>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, -1)}
                            className="w-6 h-6 rounded-md bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 flex items-center justify-center text-[10px]"
                          >
                            <FontAwesomeIcon icon={faMinus} />
                          </button>
                          <span className="text-xs font-bold w-6 text-center">{item.qty}</span>
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, 1)}
                            className="w-6 h-6 rounded-md bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 flex items-center justify-center text-[10px]"
                          >
                            <FontAwesomeIcon icon={faPlus} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="w-6 h-6 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center text-xs ml-1"
                          >
                            <FontAwesomeIcon icon={faTrashCan} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      ¿Algún comentario adicional? (Opcional)
                    </label>
                    <textarea
                      rows="2"
                      value={cartNotes}
                      onChange={(e) => setCartNotes(e.target.value)}
                      placeholder="Ej: Necesitamos instalación en la oficina principal..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#00877D]"
                    />
                  </div>

                  <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsCartOpen(false)}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-50"
                    >
                      Seguir viendo
                    </button>
                    <button
                      type="submit"
                      disabled={sendingQuote}
                      className="px-5 py-2 rounded-xl bg-[#00877D] hover:bg-[#00736A] text-white text-xs font-bold flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faPaperPlane} />
                      {sendingQuote ? 'Enviando...' : 'Pedir Cotización'}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
        {/* ================= MODAL CORPORATIVO DE CONFIRMACIÓN ================= */}
      {successDialog && (
        <div
          onClick={() => setSuccessDialog(null)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="bg-[#1E293B] px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#00877D] to-[#11C6EA] flex items-center justify-center text-slate-950 font-black text-xs">
                  S
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#11C6EA]">
                  {successDialog.badge}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSuccessDialog(null)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#00877D]/10 border border-[#00877D]/20 text-[#00877D] flex items-center justify-center text-2xl mx-auto">
                <FontAwesomeIcon icon={faCheck} />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-slate-900">
                  {successDialog.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                  {successDialog.message}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSuccessDialog(null)}
                  className="w-full py-2.5 px-5 rounded-xl bg-[#00877D] hover:bg-[#00736A] text-white text-xs font-bold tracking-wide transition-colors shadow-xs"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </MainLayout>
  );
}