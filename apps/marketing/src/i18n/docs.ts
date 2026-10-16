export interface DocSection {
  id: string;
  title: string;
  description: string;
  subsections: {
    title: string;
    content: string;
    codeSnippet?: string;
    codeLang?: string;
  }[];
}

export interface DocsTranslations {
  metaTitle: string;
  metaDescription: string;
  heroTag: string;
  heroTitle: string;
  heroDescription: string;
  tableOfContentsTitle: string;
  sections: DocSection[];
  ctaHeading: string;
  ctaSub: string;
  ctaBtn: string;
}

export const DOCS_TRANSLATIONS: Record<string, DocsTranslations> = {
  en: {
    metaTitle: 'Documentation — GB Coder User Guide & Architecture | LadeStack',
    metaDescription: 'Complete documentation for GB Coder: getting started, static HTML/CSS/JS editing, WebContainer Node.js terminal, React and Vue starters, IndexedDB backups, and troubleshooting.',
    heroTag: 'Reference & Guides',
    heroTitle: 'GB Coder Developer Documentation',
    heroDescription: 'Learn how to build, test, and export web applications in your browser. Detailed guides covering editor workflows, terminal commands, storage persistence, and browser compatibility.',
    tableOfContentsTitle: 'Table of Contents',
    sections: [
      {
        id: 'getting-started',
        title: '1. Getting Started',
        description: 'GB Coder runs entirely inside your browser without remote compute or account creation.',
        subsections: [
          {
            title: 'System Requirements & Browser Support',
            content: 'GB Coder is built for modern standards-compliant web browsers. For Static HTML/CSS/JS prototyping, any browser supporting ES2020 and IndexedDB works. For the Advanced WebContainer IDE, your browser must support SharedArrayBuffer and cross-origin isolation (COOP/COEP headers). Chromium-based browsers (Google Chrome, Microsoft Edge, Brave, Opera) and Mozilla Firefox provide full WebContainer support.',
          },
          {
            title: 'Launching Your First Workspace',
            content: 'Navigate to /app/projects to open the Projects Dashboard. From there, click "New Project" to choose between a Static HTML/CSS/JS sandbox, a React 18 template, a Vue 3 template, or a full WebContainer Node.js environment. Your project is created immediately in local memory.',
          },
        ],
      },
      {
        id: 'static-workflow',
        title: '2. Static HTML/CSS/JS Workflow',
        description: 'Instant feedback without compilation steps or local tooling.',
        subsections: [
          {
            title: 'Three-Panel Prototyping',
            content: 'The Static Editor organizes your workspace into HTML, CSS, and JavaScript panes with a real-time preview iframe below or beside them. Every keystroke evaluates in a debounced sandbox, updating the DOM instantly while preserving scroll position.',
            codeSnippet: `<!-- index.html -->
<div class="card">
  <h1 id="headline">Hello GB Coder</h1>
  <button id="counterBtn">Clicks: 0</button>
</div>

<script>
  let count = 0;
  const btn = document.getElementById('counterBtn');
  btn.addEventListener('click', () => {
    count++;
    btn.textContent = \`Clicks: \${count}\`;
  });
</script>`,
            codeLang: 'html',
          },
          {
            title: 'Injecting External Libraries via CDN',
            content: 'You can include popular libraries such as Tailwind CSS, Bootstrap, Lucide icons, or Lodash by referencing their official CDN distributions directly in the HTML head or using the External Libraries Manager.',
            codeSnippet: `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>`,
            codeLang: 'html',
          },
        ],
      },
      {
        id: 'templates-starters',
        title: '3. Project Creation & Template Gallery',
        description: 'Preconfigured starter architectures for frontend development.',
        subsections: [
          {
            title: 'Selecting a Starter Template',
            content: 'The Template Gallery provides optimized structures for landing pages, multi-page static websites, component prototypes, and responsive dashboards. When selected, the template assets are initialized into an isolated IndexedDB record.',
          },
          {
            title: 'Multi-File Static Organization',
            content: 'Beyond simple single-file experiments, GB Coder supports multi-file project trees. You can create subdirectories, split CSS into modules, and import ES modules using native browser import syntax.',
          },
        ],
      },
      {
        id: 'react-vue',
        title: '4. React and Vue Starters',
        description: 'Component-driven workflows directly in your browser.',
        subsections: [
          {
            title: 'React 18 Component Prototyping',
            content: 'GB Coder supports React 18 with JSX and TypeScript. In the Advanced IDE, Vite compiles JSX on the fly. In the Static Editor, React components can also be run via Babel standalone or pre-bundled CDN modules.',
            codeSnippet: `import React, { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold">React Counter: {count}</h2>
      <button 
        onClick={() => setCount(c => c + 1)}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Increment
      </button>
    </div>
  );
}`,
            codeLang: 'tsx',
          },
          {
            title: 'Vue 3 Single-File Components (.vue)',
            content: 'Vue starters support template, script setup, and scoped style blocks. The compiler transforms your SFC into reactive JavaScript and renders it in the live preview window with full reactivity.',
          },
        ],
      },
      {
        id: 'webcontainer-terminal',
        title: '5. Advanced IDE & WebContainer Terminal',
        description: 'Run real Node.js packages and development servers inside your browser tab.',
        subsections: [
          {
            title: 'The xterm.js Terminal Shell',
            content: 'The Advanced IDE includes an interactive shell powered by WebContainers and xterm.js. You can execute standard POSIX shell commands, run node scripts, install npm dependencies, and inspect files using standard terminal utilities.',
            codeSnippet: `# Install dependencies
npm install

# Run the local development server
npm run dev

# Check Node.js runtime version
node -v`,
            codeLang: 'bash',
          },
          {
            title: 'Port Forwarding to Live Preview',
            content: 'When Vite or Express listens on a port (e.g. 5173 or 3000), WebContainers automatically captures the server event and maps the stream directly to the integrated preview iframe. No external network requests leave your computer.',
          },
        ],
      },
      {
        id: 'storage-persistence',
        title: '6. Browser Storage, Privacy & Offline Capability',
        description: 'How GB Coder keeps your code private, secure, and resilient.',
        subsections: [
          {
            title: 'IndexedDB Storage Architecture',
            content: 'Every project file, folder hierarchy, and editor preference is stored in IndexedDB under the database name gb-coder-projects-db. Because data is stored in the browser origin, your proprietary code is never sent to external servers.',
          },
          {
            title: 'Offline Continuity & Storage Limits',
            content: 'Once loaded, GB Coder continues to run without active internet access. Browsers typically allocate up to several gigabytes of IndexedDB storage based on available disk space. We recommend taking regular ZIP backups of mission-critical projects.',
          },
        ],
      },
      {
        id: 'backup-restore',
        title: '7. Importing, Exporting & Tamper-Proof Backups',
        description: 'Complete data portability with zero vendor lock-in.',
        subsections: [
          {
            title: 'Exporting ZIP Archives with Integrity Hashes',
            content: 'From the project toolbar, select Export to download a standard ZIP archive containing your full project structure. GB Coder computes a SHA-256 hash across the archive files, ensuring your backup is exact and verifiable.',
          },
          {
            title: 'Importing Projects & Safety Validation',
            content: 'To restore a backup, drag and drop the ZIP archive into the Projects Dashboard or click Import Project. The import engine scans the file tree, rejects malicious path traversals (such as ../), and reconstructs the workspace in IndexedDB.',
          },
        ],
      },
      {
        id: 'workspace-search',
        title: '8. Workspace Search & Keyboard Navigation',
        description: 'Speed up navigation and code manipulation across your files.',
        subsections: [
          {
            title: 'Keyboard Shortcuts',
            content: 'Use standard VS Code shortcuts: Ctrl+S (Cmd+S) to save, Ctrl+P (Cmd+P) to switch files, Ctrl+F (Cmd+F) for find and replace, and Ctrl+` (Cmd+`) to toggle the terminal shell.',
          },
          {
            title: 'Global Project Search',
            content: 'The Workspace Search panel lets you search across all files in your project with case matching, whole-word filtering, and regular expressions.',
          },
        ],
      },
      {
        id: 'troubleshooting',
        title: '9. Troubleshooting & Browser Compatibility',
        description: 'Diagnosing common issues with browser environments and runtime headers.',
        subsections: [
          {
            title: 'WebContainer Disabled or Not Supported',
            content: 'If the WebContainer option is disabled, verify that your browser supports SharedArrayBuffer and that you are accessing GB Coder over HTTPS. Some browser extensions (such as aggressive ad blockers or script modifiers) can strip the COOP/COEP headers required for cross-origin isolation.',
          },
          {
            title: 'Clearing Browser Cache & Service Worker Reset',
            content: 'If you encounter stale assets after an update, perform a hard refresh (Ctrl+Shift+R or Cmd+Shift+R). GB Coder includes an automatic migration guard that cleans up outdated root-scope Service Workers.',
          },
        ],
      },
    ],
    ctaHeading: 'Ready to Put These Features Into Practice?',
    ctaSub: 'Open the Projects Dashboard and create your first workspace in seconds.',
    ctaBtn: 'Launch GB Coder Studio',
  },
  es: {
    metaTitle: 'Documentación — Guía de Usuario y Arquitectura | GB Coder',
    metaDescription: 'Documentación completa de GB Coder: primeros pasos, editor estático HTML/CSS/JS, terminal WebContainer Node.js, plantillas React y Vue, copias de seguridad y resolución de problemas.',
    heroTag: 'Manual y Referencia',
    heroTitle: 'Documentación para Desarrolladores GB Coder',
    heroDescription: 'Aprende a crear, ejecutar y exportar aplicaciones web en tu navegador. Guías detalladas sobre flujos de trabajo, terminal, persistencia local y compatibilidad técnica.',
    tableOfContentsTitle: 'Tabla de Contenidos',
    sections: [
      {
        id: 'getting-started',
        title: '1. Primeros Pasos',
        description: 'GB Coder se ejecuta íntegramente en el navegador sin necesidad de servidores remotos ni cuentas.',
        subsections: [
          {
            title: 'Requisitos del Sistema y Navegadores',
            content: 'GB Coder está diseñado para navegadores web modernos. Para el editor estático HTML/CSS/JS cualquier navegador con soporte ES2020 e IndexedDB es suficiente. Para el IDE avanzado WebContainer se requiere compatibilidad con SharedArrayBuffer y aislamiento de origen cruzado (COOP/COEP). Navegadores basados en Chromium (Chrome, Edge, Brave) y Firefox ofrecen compatibilidad completa.',
          },
          {
            title: 'Creación del Primer Espacio de Trabajo',
            content: 'Accede a /app/projects para entrar al panel de proyectos. Haz clic en "Nuevo Proyecto" y selecciona entre un entorno estático HTML/CSS/JS, una plantilla de React o Vue, o una arquitectura completa con Node.js.',
          },
        ],
      },
      {
        id: 'static-workflow',
        title: '2. Flujo de Trabajo Estático HTML/CSS/JS',
        description: 'Comentarios visuales instantáneos sin tiempos de compilación.',
        subsections: [
          {
            title: 'Prototipado en Tres Paneles',
            content: 'El editor estático divide el espacio de trabajo en paneles de HTML, CSS y JavaScript con una ventana de vista previa interactiva. Cada cambio se evalúa con control de frecuencia para actualizar el DOM en tiempo real.',
            codeSnippet: `<!-- index.html -->
<div class="card">
  <h1 id="headline">Hola GB Coder</h1>
  <button id="counterBtn">Clics: 0</button>
</div>

<script>
  let count = 0;
  const btn = document.getElementById('counterBtn');
  btn.addEventListener('click', () => {
    count++;
    btn.textContent = \`Clics: \${count}\`;
  });
</script>`,
            codeLang: 'html',
          },
          {
            title: 'Inyección de Librerías Externas vía CDN',
            content: 'Puedes incluir librerías populares como Tailwind CSS, Bootstrap o React directamente en el encabezado HTML o mediante el gestor de librerías externas.',
            codeSnippet: `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>`,
            codeLang: 'html',
          },
        ],
      },
      {
        id: 'templates-starters',
        title: '3. Plantillas de Proyectos y Galería',
        description: 'Estructuras preconfiguradas para iniciar el desarrollo rápidamente.',
        subsections: [
          {
            title: 'Selección de Plantillas',
            content: 'La galería incluye estructuras optimizadas para landing pages, prototipos de componentes y paneles de administración. Los archivos se inicializan en IndexedDB de forma aislada.',
          },
          {
            title: 'Organización Multifile',
            content: 'GB Coder permite organizar proyectos con múltiples archivos, subdirectorios y módulos ES nativos con referencias relativas limpias.',
          },
        ],
      },
      {
        id: 'react-vue',
        title: '4. Entornos React y Vue',
        description: 'Desarrollo basado en componentes directamente en el navegador.',
        subsections: [
          {
            title: 'Prototipado con React 18',
            content: 'Compatibilidad con React 18 y sintaxis JSX/TSX. En el IDE avanzado Vite compila los componentes al vuelo, ofreciendo recarga rápida sin recargar la página completa.',
            codeSnippet: `import React, { useState } from 'react';

export default function Contador() {
  const [clicks, setClicks] = useState(0);
  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold">Contador React: {clicks}</h2>
      <button 
        onClick={() => setClicks(c => c + 1)}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Aumentar
      </button>
    </div>
  );
}`,
            codeLang: 'tsx',
          },
          {
            title: 'Componentes Únicos en Vue 3 (.vue)',
            content: 'Las plantillas de Vue admiten bloques template, script setup y style. El compilador en el navegador transforma el archivo .vue en código reactivo al instante.',
          },
        ],
      },
      {
        id: 'webcontainer-terminal',
        title: '5. IDE Avanzado y Terminal WebContainer',
        description: 'Ejecuta paquetes Node.js y servidores locales dentro de tu pestaña.',
        subsections: [
          {
            title: 'Terminal Interactiva xterm.js',
            content: 'El IDE avanzado integra una shell xterm.js donde puedes ejecutar comandos POSIX habituales, correr scripts de Node.js e instalar dependencias de npm.',
            codeSnippet: `# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Ver versión de Node.js
node -v`,
            codeLang: 'bash',
          },
          {
            title: 'Reenvío de Puertos a la Vista Previa',
            content: 'Cuando Vite o Express escucha en un puerto local, WebContainers captura el evento y lo canaliza directamente al iframe de vista previa interna sin salir del navegador.',
          },
        ],
      },
      {
        id: 'storage-persistence',
        title: '6. Almacenamiento Local, Privacidad y Modo Offline',
        description: 'Seguridad y soberanía total sobre tu código fuente.',
        subsections: [
          {
            title: 'Arquitectura con IndexedDB',
            content: 'Cada archivo y carpeta se guarda en la base de datos IndexedDB local gb-coder-projects-db. El código nunca viaja a servidores remotos no autorizados.',
          },
          {
            title: 'Funcionamiento sin Conexión',
            content: 'Una vez cargado, GB Coder continúa funcionando sin conexión a internet. Los navegadores asignan varios gigabytes según el espacio en disco disponible.',
          },
        ],
      },
      {
        id: 'backup-restore',
        title: '7. Copias de Seguridad y Exportación ZIP',
        description: 'Portabilidad sin dependencias propietarias.',
        subsections: [
          {
            title: 'Exportación ZIP con Hash SHA-256',
            content: 'Descarga proyectos completos en formato ZIP estándar con cálculo automático de hash de integridad para verificar la autenticidad del archivo.',
          },
          {
            title: 'Restauración e Importación Segura',
            content: 'Arrastra y suelta el archivo ZIP en el panel de proyectos para restaurar el entorno completo tras una validación preventiva de seguridad en las rutas.',
          },
        ],
      },
      {
        id: 'workspace-search',
        title: '8. Búsqueda Global y Atajos de Teclado',
        description: 'Navegación ágil por el código y herramientas de edición.',
        subsections: [
          {
            title: 'Atajos de Teclado Principales',
            content: 'Usa los atajos habituales de VS Code: Ctrl+S para guardar, Ctrl+P para cambiar de archivo, Ctrl+F para buscar y Ctrl+` para alternar la terminal.',
          },
          {
            title: 'Búsqueda Global en Archivos',
            content: 'Busca y reemplaza cadenas de texto en todos los archivos del proyecto con soporte para expresiones regulares y coincidencia exacta.',
          },
        ],
      },
      {
        id: 'troubleshooting',
        title: '9. Resolución de Problemas y Compatibilidad',
        description: 'Diagnóstico de problemas frecuentes en entornos web.',
        subsections: [
          {
            title: 'WebContainer Desactivado o No Soportado',
            content: 'Si la opción WebContainer no está disponible, comprueba que el navegador admita SharedArrayBuffer y que accedas mediante HTTPS con cabeceras COOP/COEP válidas.',
          },
          {
            title: 'Reinicio de Caché y Service Worker',
            content: 'Si observas archivos obsoletos tras una actualización, realiza una recarga forzada (Ctrl+F5 o Ctrl+Shift+R). GB Coder limpia automáticamente versiones antiguas.',
          },
        ],
      },
    ],
    ctaHeading: '¿Listo para poner en práctica estas herramientas?',
    ctaSub: 'Abre el panel de proyectos y comienza a programar en segundos.',
    ctaBtn: 'Abrir GB Coder Studio',
  },
  nl: {
    metaTitle: 'Documentatie — GB Coder Handleiding & Architectuur | LadeStack',
    metaDescription: 'Volledige documentatie voor GB Coder: aan de slag, statische editor, WebContainer Node.js terminal, React- en Vue-templates, back-ups en probleemoplossing.',
    heroTag: 'Gidsen & Naslagwerk',
    heroTitle: 'GB Coder Ontwikkelaarsdocumentatie',
    heroDescription: 'Leer hoe je webapplicaties bouwt, test en exporteert direct in je browser. Uitgebreide gidsen over editorworkflows, terminalopdrachten en browserondersteuning.',
    tableOfContentsTitle: 'Inhoudsopgave',
    sections: [
      {
        id: 'getting-started',
        title: '1. Aan de Slag',
        description: 'GB Coder draait volledig in je browser zonder externe servers of accounts.',
        subsections: [
          {
            title: 'Systeemvereisten & Browsers',
            content: 'Voor de Statische Editor is elke moderne browser met IndexedDB-ondersteuning geschikt. Voor de Geavanceerde WebContainer IDE is SharedArrayBuffer en COOP/COEP-isolatie vereist (Chrome, Edge, Brave, Firefox).',
          },
          {
            title: 'Je Eerste Project Starten',
            content: 'Ga naar /app/projects en klik op "New Project" om direct een statisch project, React-template of WebContainer-omgeving te openen.',
          },
        ],
      },
      {
        id: 'static-workflow',
        title: '2. Statische HTML/CSS/JS Workflow',
        description: 'Direct visueel resultaat zonder compilatiestappen.',
        subsections: [
          {
            title: 'Drie-Panelen Ontwerp',
            content: 'Schrijf HTML, style met CSS en programmeer in JavaScript. De interne preview wordt synchroon bijgewerkt.',
            codeSnippet: `<!-- index.html -->
<div class="card">
  <h1>Hallo GB Coder</h1>
  <button id="btn">Kliks: 0</button>
</div>
<script>
  let n = 0;
  document.getElementById('btn').onclick = () => { n++; document.getElementById('btn').textContent = \`Kliks: \${n}\`; };
</script>`,
            codeLang: 'html',
          },
          {
            title: 'CDN-Bibliotheken Toevoegen',
            content: 'Voeg eenvoudig Tailwind CSS, Bootstrap of iconensets toe via betrouwbare CDN-links.',
            codeSnippet: `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />`,
            codeLang: 'html',
          },
        ],
      },
      {
        id: 'templates-starters',
        title: '3. Templates & Projectcreatie',
        description: 'Vooraf geconfigureerde starters voor moderne webontwikkeling.',
        subsections: [
          {
            title: 'Een Starter Kiezen',
            content: 'Kies uit templates voor landingspagina’s, dashboardinterfaces en componentprototypes.',
          },
          {
            title: 'Structuur met Meerdere Bestanden',
            content: 'Ondersteunt submappen, gescheiden stijlbladen en ES-modules.',
          },
        ],
      },
      {
        id: 'react-vue',
        title: '4. React en Vue Ontwikkeling',
        description: 'Componentgedreven bouwen in de browser.',
        subsections: [
          {
            title: 'React 18 Componenten',
            content: 'Bouw React-interfaces met volledige JSX- en TypeScript-ondersteuning.',
            codeSnippet: `import React, { useState } from 'react';
export default function App() {
  const [c, setC] = useState(0);
  return <button onClick={() => setC(c + 1)}>Clicks: {c}</button>;
}`,
            codeLang: 'tsx',
          },
          {
            title: 'Vue 3 Single-File Components',
            content: 'Schrijf .vue-bestanden met template, script setup en scoped styles met directe in-browser compilatie.',
          },
        ],
      },
      {
        id: 'webcontainer-terminal',
        title: '5. WebContainer IDE & Terminal',
        description: 'Draai echte Node.js-opdrachten en Vite-servers.',
        subsections: [
          {
            title: 'De xterm.js Terminal',
            content: 'Voer npm install uit en start ontwikkelservers rechtstreeks in je browsertabblad.',
            codeSnippet: `npm install
npm run dev`,
            codeLang: 'bash',
          },
          {
            title: 'Poortkoppeling naar Preview',
            content: 'Lokale poorten worden automatisch gekoppeld aan de interne voorvertoning.',
          },
        ],
      },
      {
        id: 'storage-persistence',
        title: '6. Lokale Opslag & Privacy',
        description: 'Veilige lokale gegevensopslag in IndexedDB.',
        subsections: [
          {
            title: 'IndexedDB Architectuur',
            content: 'Alle bestanden blijven lokaal opgeslagen in gb-coder-projects-db.',
          },
          {
            title: 'Offline Werken',
            content: 'Blijf productief zonder internetverbinding.',
          },
        ],
      },
      {
        id: 'backup-restore',
        title: '7. Back-ups & ZIP Exporteren',
        description: 'Eenvoudig exporteren en herstellen van projecten.',
        subsections: [
          {
            title: 'ZIP met SHA-256 Hash',
            content: 'Exporteer complete projecten naar ZIP-archieven met integriteitscontrole.',
          },
          {
            title: 'Veilig Importeren',
            content: 'Sleep ZIP-bestanden naar het dashboard om projecten te herstellen.',
          },
        ],
      },
      {
        id: 'workspace-search',
        title: '8. Zoeken & Sneltoetsen',
        description: 'Sneller navigeren door je bestanden.',
        subsections: [
          {
            title: 'Sneltoetsen',
            content: 'Gebruik Ctrl+S om op te slaan, Ctrl+P voor snelle bestandswisseling en Ctrl+` voor de terminal.',
          },
          {
            title: 'Projectbrede Zoekfunctie',
            content: 'Zoek en vervang in alle bestanden tegelijk.',
          },
        ],
      },
      {
        id: 'troubleshooting',
        title: '9. Probleemoplossing & Compatibiliteit',
        description: 'Oplossingen voor veelvoorkomende situaties.',
        subsections: [
          {
            title: 'WebContainer Uitgeschakeld',
            content: 'Controleer of SharedArrayBuffer beschikbaar is en of COOP/COEP-headers actief zijn.',
          },
          {
            title: 'Cache Verversen',
            content: 'Gebruik Ctrl+Shift+R voor een geforceerde herlaadbeurt bij verouderde assets.',
          },
        ],
      },
    ],
    ctaHeading: 'Direct aan de slag met GB Coder?',
    ctaSub: 'Open het dashboard en begin binnen enkele seconden met bouwen.',
    ctaBtn: 'Start GB Coder Studio',
  },
  fr: {
    metaTitle: 'Documentation — Guide Développeur & Architecture | GB Coder',
    metaDescription: 'Documentation complète de GB Coder : prise en main, éditeur HTML/CSS/JS, terminal WebContainer Node.js, modèles React et Vue, sauvegardes IndexedDB et dépannage.',
    heroTag: 'Guides & Références',
    heroTitle: 'Documentation Développeur GB Coder',
    heroDescription: 'Découvrez comment concevoir, exécuter et exporter vos applications web dans le navigateur. Guides détaillés sur les flux de travail, le terminal et la persistance locale.',
    tableOfContentsTitle: 'Table des Matières',
    sections: [
      {
        id: 'getting-started',
        title: '1. Prise en Main',
        description: 'GB Coder s’exécute entièrement dans votre navigateur sans serveur distant.',
        subsections: [
          {
            title: 'Prérequis Système et Navigateurs',
            content: 'L’éditeur statique fonctionne sur tout navigateur moderne prenant en charge IndexedDB et ES2020. L’IDE avancé WebContainer nécessite SharedArrayBuffer et l’isolation cross-origin (Chrome, Edge, Brave, Firefox).',
          },
          {
            title: 'Créer votre Premier Espace de Travail',
            content: 'Rendez-vous sur /app/projects pour accéder au tableau de bord et lancer un nouveau projet statique, React, Vue ou WebContainer.',
          },
        ],
      },
      {
        id: 'static-workflow',
        title: '2. Prototypage Statique HTML/CSS/JS',
        description: 'Rendu instantané sans étape de compilation.',
        subsections: [
          {
            title: 'Édition en Trois Volets',
            content: 'Écrivez du HTML, appliquez du CSS et programmez en JavaScript avec mise à jour immédiate de l’aperçu.',
            codeSnippet: `<!-- index.html -->
<div class="card">
  <h1>Bonjour GB Coder</h1>
  <button id="btn">Clics : 0</button>
</div>
<script>
  let n = 0;
  document.getElementById('btn').onclick = () => { n++; document.getElementById('btn').textContent = \`Clics : \${n}\`; };
</script>`,
            codeLang: 'html',
          },
          {
            title: 'Ajout de Bibliothèques CDN',
            content: 'Intégrez facilement Tailwind CSS, Bootstrap ou des bibliothèques d’icônes via des liens CDN fiables.',
            codeSnippet: `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />`,
            codeLang: 'html',
          },
        ],
      },
      {
        id: 'templates-starters',
        title: '3. Modèles de Projets et Galerie',
        description: 'Structures prêtes à l’emploi pour démarrer rapidement.',
        subsections: [
          {
            title: 'Sélectionner un Modèle',
            content: 'Choisissez parmi des modèles de pages d’accueil, de tableaux de bord ou de composants réutilisables.',
          },
          {
            title: 'Organisation Multi-Fichiers',
            content: 'Structurez vos projets en plusieurs fichiers avec sous-dossiers et modules ES natifs.',
          },
        ],
      },
      {
        id: 'react-vue',
        title: '4. Développement React et Vue',
        description: 'Création de composants interactifs dans le navigateur.',
        subsections: [
          {
            title: 'Composants React 18',
            content: 'Développez des interfaces avec JSX, TypeScript et rechargement fluide.',
            codeSnippet: `import React, { useState } from 'react';
export default function App() {
  const [c, setC] = useState(0);
  return <button onClick={() => setC(c + 1)}>Compteur : {c}</button>;
}`,
            codeLang: 'tsx',
          },
          {
            title: 'Composants Vue 3 (.vue)',
            content: 'Rédigez des fichiers .vue complets avec template, script setup et styles scopés.',
          },
        ],
      },
      {
        id: 'webcontainer-terminal',
        title: '5. IDE Avancé et Terminal WebContainer',
        description: 'Exécutez de vraies commandes Node.js et des serveurs Vite.',
        subsections: [
          {
            title: 'Terminal xterm.js Interactif',
            content: 'Lancez npm install et gérez vos scripts de développement directement dans votre onglet.',
            codeSnippet: `npm install
npm run dev`,
            codeLang: 'bash',
          },
          {
            title: 'Redirection de Port vers l’Aperçu',
            content: 'Les ports locaux de vos serveurs de développement sont automatiquement mappés vers l’aperçu.',
          },
        ],
      },
      {
        id: 'storage-persistence',
        title: '6. Stockage Local et Confidentialité',
        description: 'Vos données restent protégées dans IndexedDB.',
        subsections: [
          {
            title: 'Architecture IndexedDB',
            content: 'L’ensemble de vos fichiers est stocké en local dans la base gb-coder-projects-db.',
          },
          {
            title: 'Continuité Hors Ligne',
            content: 'Continuez à coder même sans connexion internet active.',
          },
        ],
      },
      {
        id: 'backup-restore',
        title: '7. Sauvegardes et Export ZIP',
        description: 'Exportez et restaurez vos projets en toute simplicité.',
        subsections: [
          {
            title: 'Export ZIP avec Hash SHA-256',
            content: 'Téléchargez vos projets au format ZIP avec contrôle d’intégrité automatisé.',
          },
          {
            title: 'Importation Sécurisée',
            content: 'Glissez-déposez une archive ZIP pour restaurer votre espace de travail.',
          },
        ],
      },
      {
        id: 'workspace-search',
        title: '8. Recherche Globale et Raccourcis',
        description: 'Naviguez efficacement dans vos projets.',
        subsections: [
          {
            title: 'Raccourcis Clavier',
            content: 'Ctrl+S pour sauvegarder, Ctrl+P pour changer de fichier et Ctrl+` pour le terminal.',
          },
          {
            title: 'Recherche Multi-Fichiers',
            content: 'Recherchez et remplacez du texte sur l’ensemble de votre code.',
          },
        ],
      },
      {
        id: 'troubleshooting',
        title: '9. Dépannage et Compatibilité',
        description: 'Résolution des problèmes courants.',
        subsections: [
          {
            title: 'WebContainer Désactivé',
            content: 'Vérifiez la présence des en-têtes d’isolation COOP/COEP et le support de SharedArrayBuffer.',
          },
          {
            title: 'Nettoyage du Cache',
            content: 'Effectuez un rechargement forcé (Ctrl+Shift+R) pour actualiser les fichiers statiques.',
          },
        ],
      },
    ],
    ctaHeading: 'Prêt à programmer avec GB Coder ?',
    ctaSub: 'Ouvrez le tableau de bord et commencez à coder en quelques secondes.',
    ctaBtn: 'Lancer GB Coder Studio',
  },
  ja: {
    metaTitle: 'ドキュメント — GB Coder 利用ガイド＆アーキテクチャ | LadeStack',
    metaDescription: 'GB Coderの公式開発ドキュメント：基本操作、静的HTML/CSS/JS編集、WebContainer Node.jsターミナル、React/Vueスターター、IndexedDBバックアップとトラブルシューティング。',
    heroTag: '公式ガイド・リファレンス',
    heroTitle: 'GB Coder 開発者向けドキュメント',
    heroDescription: 'ブラウザ上でのWebアプリ構築、テスト、エクスポート手順を網羅。エディターの使い方、ターミナル操作、ローカル永続化、ブラウザ互換性について解説します。',
    tableOfContentsTitle: '目次',
    sections: [
      {
        id: 'getting-started',
        title: '1. はじめに',
        description: 'GB Coderは外部サーバーへの依存やアカウント登録なしで動作します。',
        subsections: [
          {
            title: '動作要件と対応ブラウザ',
            content: '静的エディターはIndexedDBとES2020に対応した全モダンブラウザで動作します。WebContainer環境ではSharedArrayBufferとクロスオリジン分離（COOP/COEP）が必要です（Chrome、Edge、Brave、Firefox対応）。',
          },
          {
            title: '新規ワークスペースの作成',
            content: '/app/projects を開き、「New Project」ボタンから静的プロジェクト、React、Vue、またはWebContainer環境を選択してください。',
          },
        ],
      },
      {
        id: 'static-workflow',
        title: '2. 静的HTML/CSS/JS開発フロー',
        description: 'ビルド待機時間なしで即座に動作確認が可能です。',
        subsections: [
          {
            title: '3ペイン分割エディターの活用',
            content: 'HTML、CSS、JavaScriptをそれぞれ独立した領域で編集し、下部または右側のプレビュー画面にリアルタイムで反映されます。',
            codeSnippet: `<!-- index.html -->
<div class="card">
  <h1>GB Coderへようこそ</h1>
  <button id="counter">クリック数: 0</button>
</div>
<script>
  let n = 0;
  document.getElementById('counter').onclick = () => {
    n++;
    document.getElementById('counter').textContent = \`クリック数: \${n}\`;
  };
</script>`,
            codeLang: 'html',
          },
          {
            title: '外部CDNライブラリの読み込み',
            content: 'Tailwind CSS、Bootstrap、React CDNなどをHTMLヘッダー内に直接指定して読み込むことができます。',
            codeSnippet: `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />`,
            codeLang: 'html',
          },
        ],
      },
      {
        id: 'templates-starters',
        title: '3. テンプレートギャラリーとプロジェクト作成',
        description: '事前構成されたスターターで素早く開発を立ち上げ。',
        subsections: [
          {
            title: 'スターターテンプレートの選択',
            content: 'ランディングページ、UIコンポーネント試作、ダッシュボードなど多彩なテンプレートを用意しています。',
          },
          {
            title: '複数ファイル構成プロジェクト',
            content: 'サブディレクトリの作成やCSSモジュール分割、ネイティブESモジュールインポートに対応。',
          },
        ],
      },
      {
        id: 'react-vue',
        title: '4. React・Vue開発環境',
        description: 'ブラウザ完結のコンポーネント開発。',
        subsections: [
          {
            title: 'React 18 コンポーネント開発',
            content: 'JSXおよびTypeScriptに対応し、高速なリロードで快適に開発できます。',
            codeSnippet: `import React, { useState } from 'react';
export default function App() {
  const [val, setVal] = useState(0);
  return <button onClick={() => setVal(val + 1)}>カウント: {val}</button>;
}`,
            codeLang: 'tsx',
          },
          {
            title: 'Vue 3 単一ファイルコンポーネント (.vue)',
            content: 'template、script setup、scoped styleを含む.vueファイルをブラウザ内部で即時コンパイルします。',
          },
        ],
      },
      {
        id: 'webcontainer-terminal',
        title: '5. WebContainer IDEとターミナル',
        description: 'ブラウザタブ内で稼働する完全なNode.js環境。',
        subsections: [
          {
            title: 'xterm.js ターミナル操作',
            content: 'npm installやpackage.jsonスクリプトの実行をブラウザ上で直接行えます。',
            codeSnippet: `npm install
npm run dev`,
            codeLang: 'bash',
          },
          {
            title: 'プレビューへの自動ポート接続',
            content: '開発サーバーが起動すると、自動的に内蔵プレビューiframeにマッピングされます。',
          },
        ],
      },
      {
        id: 'storage-persistence',
        title: '6. ローカル保存・プライバシー・オフライン',
        description: 'IndexedDBによる確実なデータ保護。',
        subsections: [
          {
            title: 'IndexedDB ストレージアーキテクチャ',
            content: '全ファイルと設定は端末内のIndexedDBデータベースに保存され、外部送信されません。',
          },
          {
            title: 'オフラインでの継続作業',
            content: '一度読み込んだ後は、インターネット接続が切断されてもそのまま編集を継続できます。',
          },
        ],
      },
      {
        id: 'backup-restore',
        title: '7. ZIPバックアップと復元',
        description: 'ベンダーロックインのない完全なデータ可搬性。',
        subsections: [
          {
            title: 'SHA-256検証付きZIPエクスポート',
            content: 'プロジェクト全体を標準ZIP形式でダウンロードし、改ざんや破損を防ぐハッシュを記録します。',
          },
          {
            title: 'プロジェクトの安全なインポート',
            content: 'ZIPファイルをダッシュボードへドラッグ＆ドロップするだけで即座に復元できます。',
          },
        ],
      },
      {
        id: 'workspace-search',
        title: '8. プロジェクト内検索とショートカット',
        description: '軽快な操作性を支える機能群。',
        subsections: [
          {
            title: '主なキーボードショートカット',
            content: 'Ctrl+Sで保存、Ctrl+Pでファイル切り替え、Ctrl+`でターミナル表示切り替えが可能です。',
          },
          {
            title: '全ファイル対象のグローバル検索',
            content: '正規表現や大文字・小文字を区別した高速な検索・置換を行えます。',
          },
        ],
      },
      {
        id: 'troubleshooting',
        title: '9. トラブルシューティングと互換性',
        description: 'よくある問題と解決手順。',
        subsections: [
          {
            title: 'WebContainerが有効にならない場合',
            content: 'HTTPS接続であること、およびCOOP/COEPヘッダーが正しく適用されているか確認してください。',
          },
          {
            title: 'キャッシュの更新とService Worker',
            content: '古い画面が表示される場合はCtrl+Shift+Rで強制再読み込みを行ってください。',
          },
        ],
      },
    ],
    ctaHeading: '今すぐGB Coderで開発をはじめましょう',
    ctaSub: 'プロジェクトダッシュボードを開き、数秒で開発を開始できます。',
    ctaBtn: 'GB Coder Studioを起動',
  },
  ko: {
    metaTitle: '문서 — GB Coder 사용자 가이드 및 아키텍처 | LadeStack',
    metaDescription: 'GB Coder 개발자 가이드: 시작하기, 정적 HTML/CSS/JS 워크플로우, WebContainer Node.js 터미널, React 및 Vue 스타터, IndexedDB 백업 및 문제 해결.',
    heroTag: '가이드 및 레퍼런스',
    heroTitle: 'GB Coder 개발자 문서',
    heroDescription: '브라우저에서 웹 애플리케이션을 빌드, 실행, 내보내는 모든 방법을 안내합니다. 에디터 워크플로우, 터미널 명령어, 로컬 저장소 및 브라우저 호환성을 확인하세요.',
    tableOfContentsTitle: '목차',
    sections: [
      {
        id: 'getting-started',
        title: '1. 시작하기',
        description: 'GB Coder는 원격 서버나 가입 절차 없이 브라우저 내부에서 온전히 실행됩니다.',
        subsections: [
          {
            title: '시스템 요구사항 및 브라우저',
            content: '정적 에디터는 IndexedDB를 지원하는 모든 최신 브라우저에서 구동됩니다. 고급 WebContainer 환경은 SharedArrayBuffer와 교차 출처 격리(COOP/COEP)를 지원하는 Chrome, Edge, Brave, Firefox를 권장합니다.',
          },
          {
            title: '첫 프로젝트 생성하기',
            content: '/app/projects 로 이동하여 대시보드에서 "New Project"를 클릭하고 원하는 개발 환경을 선택하세요.',
          },
        ],
      },
      {
        id: 'static-workflow',
        title: '2. 정적 HTML/CSS/JS 워크플로우',
        description: '빌드 지연 없이 즉각적인 화면 결과를 확인합니다.',
        subsections: [
          {
            title: '3분할 에디터 활용',
            content: 'HTML, CSS, JavaScript를 분리된 패널에서 입력하면 실시간으로 미리보기 창에 반영됩니다.',
            codeSnippet: `<!-- index.html -->
<div class="card">
  <h1>GB Coder 시작하기</h1>
  <button id="btn">클릭 수: 0</button>
</div>
<script>
  let n = 0;
  document.getElementById('btn').onclick = () => { n++; document.getElementById('btn').textContent = \`클릭 수: \${n}\`; };
</script>`,
            codeLang: 'html',
          },
          {
            title: '외부 CDN 라이브러리 추가',
            content: 'Tailwind CSS, Bootstrap 등을 HTML 헤더에 직접 링크하여 손쉽게 사용할 수 있습니다.',
            codeSnippet: `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />`,
            codeLang: 'html',
          },
        ],
      },
      {
        id: 'templates-starters',
        title: '3. 템플릿 갤러리 및 프로젝트 구성',
        description: '실전에 바로 투입 가능한 모던 웹 스타터.',
        subsections: [
          {
            title: '스타터 템플릿 선택',
            content: '랜딩 페이지, 대시보드, 유틸리티 앱 템플릿을 통해 빠르게 개발을 시작할 수 있습니다.',
          },
          {
            title: '다중 파일 프로젝트 관리',
            content: '하위 폴더 생성, 스타일시트 분리, 표준 ES 모듈 import를 완벽하게 지원합니다.',
          },
        ],
      },
      {
        id: 'react-vue',
        title: '4. React 및 Vue 스타터',
        description: '컴포넌트 중심의 모던 프론트엔드 개발.',
        subsections: [
          {
            title: 'React 18 컴포넌트 개발',
            content: 'JSX 및 TypeScript를 지원하여 빠른 반응형 컴포넌트 작성이 가능합니다.',
            codeSnippet: `import React, { useState } from 'react';
export default function App() {
  const [n, setN] = useState(0);
  return <button onClick={() => setN(n + 1)}>클릭: {n}</button>;
}`,
            codeLang: 'tsx',
          },
          {
            title: 'Vue 3 Single-File Components (.vue)',
            content: 'template, script setup, scoped style을 포함하는 .vue 파일을 브라우저에서 즉시 컴파일합니다.',
          },
        ],
      },
      {
        id: 'webcontainer-terminal',
        title: '5. WebContainer IDE 및 터미널',
        description: '브라우저에서 실행되는 완벽한 Node.js 런타임.',
        subsections: [
          {
            title: 'xterm.js 터미널 활용',
            content: 'npm install 및 package 스크립트를 브라우저 터미널에서 직접 실행하세요.',
            codeSnippet: `npm install
npm run dev`,
            codeLang: 'bash',
          },
          {
            title: '실시간 미리보기 포트 포워딩',
            content: '개발 서버가 구동되면 내장 미리보기 화면으로 자동 연결됩니다.',
          },
        ],
      },
      {
        id: 'storage-persistence',
        title: '6. 로컬 저장소 및 프라이버시',
        description: 'IndexedDB를 통한 안전한 데이터 보존.',
        subsections: [
          {
            title: 'IndexedDB 아키텍처',
            content: '모든 파일과 설정은 사용자의 로컬 브라우저 IndexedDB에만 보관됩니다.',
          },
          {
            title: '오프라인 환경 지원',
            content: '네트워크 연결이 끊겨도 로컬 저장소를 통해 계속해서 작업할 수 있습니다.',
          },
        ],
      },
      {
        id: 'backup-restore',
        title: '7. ZIP 백업 및 프로젝트 복원',
        description: '자유로운 데이터 이동성과 무결성 검증.',
        subsections: [
          {
            title: 'SHA-256 검증 포함 ZIP 내보내기',
            content: '프로젝트 전체를 표준 ZIP 파일로 다운로드하며 해시 무결성을 함께 기록합니다.',
          },
          {
            title: '안전한 프로젝트 가져오기',
            content: 'ZIP 파일을 드래그 앤 드롭하여 기존 작업 공간을 온전히 복원할 수 있습니다.',
          },
        ],
      },
      {
        id: 'workspace-search',
        title: '8. 전역 검색 및 단축키',
        description: '효율적인 작업 흐름을 위한 단축키 안내.',
        subsections: [
          {
            title: '주요 단축키',
            content: 'Ctrl+S(저장), Ctrl+P(파일 전환), Ctrl+`(터미널 열기/닫기)를 지원합니다.',
          },
          {
            title: '프로젝트 전역 파일 검색',
            content: '정규식과 대소문자 구분을 지원하여 원하는 코드를 즉시 찾고 바꿀 수 있습니다.',
          },
        ],
      },
      {
        id: 'troubleshooting',
        title: '9. 문제 해결 및 호환성',
        description: '자주 발생하는 상황별 대처 방법.',
        subsections: [
          {
            title: 'WebContainer 비활성화 시',
            content: 'HTTPS 접속 여부 및 COOP/COEP 헤더가 정상적으로 제공되는지 확인하세요.',
          },
          {
            title: '캐시 초기화 안내',
            content: '이전 버전의 스크립트가 남아 있는 경우 Ctrl+Shift+R로 강력 새로고침을 실행하세요.',
          },
        ],
      },
    ],
    ctaHeading: '지금 직접 경험해보세요',
    ctaSub: '프로젝트 대시보드를 열고 바로 코딩을 시작할 수 있습니다.',
    ctaBtn: 'GB Coder Studio 열기',
  },
  zh: {
    metaTitle: '开发文档 — GB Coder 使用指南与核心架构 | LadeStack',
    metaDescription: 'GB Coder 官方技术文档：快速入门、静态 HTML/CSS/JS 开发、WebContainer 浏览器端 Node.js 终端、React 与 Vue 脚手架、IndexedDB 本地备份与疑难解答。',
    heroTag: '开发者指南与技术参考',
    heroTitle: 'GB Coder 开发者技术文档',
    heroDescription: '全面掌握如何在纯浏览器环境中构建、运行与导出现代 Web 应用。包含编辑模式、终端常用指令、本地持久化与浏览器兼容性等详尽说明。',
    tableOfContentsTitle: '文档目录导航',
    sections: [
      {
        id: 'getting-started',
        title: '1. 快速入门与环境准备',
        description: 'GB Coder 完全在本地浏览器进程中运行，无需云端环境即可开发。',
        subsections: [
          {
            title: '系统要求与浏览器兼容性',
            content: '静态原型编辑器适用于所有支持 IndexedDB 与 ES2020 的现代浏览器。若需使用高级 WebContainer IDE，浏览器必须支持 SharedArrayBuffer 与跨源隔离策略（COOP/COEP）。推荐使用 Chromium 核心浏览器（Google Chrome、Microsoft Edge、Brave）或 Mozilla Firefox。',
          },
          {
            title: '创建您的第一个开发工作区',
            content: '访问 /app/projects 进入项目看板，点击“新建项目”即可在静态原型、React 18、Vue 3 或全栈 Node.js 模板中按需选择，工作区将在本地内存中秒级初始化。',
          },
        ],
      },
      {
        id: 'static-workflow',
        title: '2. 静态 HTML、CSS 与 JS 极速原型流',
        description: '无需繁琐的编译构建，实时呈现页面改动。',
        subsections: [
          {
            title: '三栏经典工作区布局',
            content: '静态编辑器将代码划分为 HTML、CSS 与 JavaScript 三个独立视窗，并配备实时渲染预览沙箱。每次键入均带有防抖计算，实时更新 DOM 并保持页面滚动条位置。',
            codeSnippet: `<!-- index.html -->
<div class="card">
  <h1 id="title">欢迎使用 GB Coder</h1>
  <button id="counterBtn">点击次数：0</button>
</div>

<script>
  let count = 0;
  const btn = document.getElementById('counterBtn');
  btn.addEventListener('click', () => {
    count++;
    btn.textContent = \`点击次数：\${count}\`;
  });
</script>`,
            codeLang: 'html',
          },
          {
            title: '通过 CDN 引入外部三方库',
            content: '您可以在 HTML 头部直接引入常用 CDN 资源（如 Tailwind CSS、Bootstrap 样式或 React CDN），也可以使用内置的外部依赖管理器一键添加。',
            codeSnippet: `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />`,
            codeLang: 'html',
          },
        ],
      },
      {
        id: 'templates-starters',
        title: '3. 项目模版中心与脚手架结构',
        description: '专为现代前端工程化打造的开箱即用模版。',
        subsections: [
          {
            title: '挑选标准项目模版',
            content: '模版库提供了经过优化的落地页、组件演示及交互仪表盘初始架构。选择模版后将自动复制到独立的 IndexedDB 本地沙箱。',
          },
          {
            title: '多文件目录组织方式',
            content: '支持创建层级子目录、拆分独立 CSS 样式文件，并使用原生 ES Modules 的 import 相对路径语法引入其他 JS 逻辑。',
          },
        ],
      },
      {
        id: 'react-vue',
        title: '4. React 与 Vue 前端框架开发',
        description: '在浏览器端体验现代组件化开发。',
        subsections: [
          {
            title: 'React 18 组件原型开发',
            content: '高级 IDE 支持原生 JSX/TSX 语法，配合 Vite 实现毫秒级热模块重载，编写代码如同在本地 VS Code 一样顺畅。',
            codeSnippet: `import React, { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold">计数器: {count}</h2>
      <button 
        onClick={() => setCount(c => c + 1)}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
      >
        增加点击
      </button>
    </div>
  );
}`,
            codeLang: 'tsx',
          },
          {
            title: 'Vue 3 单文件组件 (.vue) 支持',
            content: 'Vue 模版原生支持 template、script setup 以及 scoped 样式区块，内置浏览器端单文件编译引擎，确保响应式状态精准运行。',
          },
        ],
      },
      {
        id: 'webcontainer-terminal',
        title: '5. 高级 WebContainer IDE 与交互式终端',
        description: '直接在浏览器标签页内执行真实的 Node.js 包与服务。',
        subsections: [
          {
            title: 'xterm.js 全功能终端交互',
            content: '高级 IDE 内置 xterm.js 虚拟终端，支持标准的 POSIX 命令调度、查看目录文件，以及执行常规的 package.json 构建命令。',
            codeSnippet: `# 安装依赖包
npm install

# 启动本地开发服务
npm run dev

# 打印当前 Node.js 版本
node -v`,
            codeLang: 'bash',
          },
          {
            title: '端口监听与内置预览自动对接',
            content: '当 Vite 或其他 Node 服务监听端口时，WebContainer 会自动捕获并无缝重定向至内置预览 iframe，所有流量完全在本地闭环。',
          },
        ],
      },
      {
        id: 'storage-persistence',
        title: '6. 本地优先存储、数据隐私与离线运行',
        description: '深度保障源代码绝对安全与本地数据主权。',
        subsections: [
          {
            title: 'IndexedDB 本地数据库存储',
            content: '项目的所有文件和改动均持久化保存在本地浏览器的 gb-coder-projects-db 数据库中，绝对不会在后台将代码上传至远端服务器。',
          },
          {
            title: '离线可用性与容量保障',
            content: '应用加载完成后即可在完全无网络的环境下顺畅编码。现代浏览器为同源 IndexedDB 提供了数 GB 的充足存储配额。',
          },
        ],
      },
      {
        id: 'backup-restore',
        title: '7. ZIP 归档导出与完整性校验恢复',
        description: '拒绝平台锁定，实现数据的完全自由迁移。',
        subsections: [
          {
            title: '带 SHA-256 哈希校验的 ZIP 导出',
            content: '通过工具栏一键导出通用标准 ZIP 压缩包，自动计算校验指纹，确保文件在转移与归档过程中零损坏。',
          },
          {
            title: '项目安全导入与解压恢复',
            content: '只需将 ZIP 压缩包拖入项目看板即可瞬间复原。导入引擎具备路径安全扫描机制，防止非法相对路径穿透。',
          },
        ],
      },
      {
        id: 'workspace-search',
        title: '8. 全局文件检索与常用快捷键',
        description: '大幅提升日常项目管理与编码效率。',
        subsections: [
          {
            title: '经典 VS Code 键盘快捷键',
            content: '支持 Ctrl+S (保存)、Ctrl+P (快速文件跳转)、Ctrl+F (局部查找替换) 以及 Ctrl+\` (展开/收起终端)。',
          },
          {
            title: '跨文件全局文本检索',
            content: '全局搜索面板支持正则表达式与全词精确匹配，助您瞬间定位多文件项目中的任意关键函数。',
          },
        ],
      },
      {
        id: 'troubleshooting',
        title: '9. 常见问题排查与浏览器兼容指南',
        description: '应对各种系统环境下的常见疑难问题。',
        subsections: [
          {
            title: 'WebContainer 按钮呈禁用状态',
            content: '请确认是否处于 HTTPS 访问环境，且浏览器未被第三方脚本拦截 COOP/COEP 跨源隔离头。部分激进的广告拦截插件可能会干扰这些安全头。',
          },
          {
            title: '清除浏览器陈旧缓存与 Service Worker',
            content: '如遇到版本更新后页面样式陈旧，请执行强制刷新（Ctrl+F5 或 Ctrl+Shift+R），系统会自动注销历史残留的 Service Worker。',
          },
        ],
      },
    ],
    ctaHeading: '准备好开启全新的浏览器编程体验了吗？',
    ctaSub: '打开项目看板，只需数秒即可开启您的首个工作区。',
    ctaBtn: '启动 GB Coder 工作台',
  },
  ru: {
    metaTitle: 'Документация — Руководство Пользователя и Архитектура | GB Coder',
    metaDescription: 'Полная документация по GB Coder: быстрый старт, статический редактор HTML/CSS/JS, терминал WebContainer Node.js, шаблоны React и Vue, бэкапы IndexedDB и решение проблем.',
    heroTag: 'Руководства и Справка',
    heroTitle: 'Документация Разработчика GB Coder',
    heroDescription: 'Узнайте, как создавать, тестировать и экспортировать веб-приложения прямо в браузере. Подробные инструкции по терминалу, хранилищу и поддержке браузеров.',
    tableOfContentsTitle: 'Содержание',
    sections: [
      {
        id: 'getting-started',
        title: '1. Начало Работы',
        description: 'GB Coder работает полностью в вашем браузере без удаленных серверов и учетных записей.',
        subsections: [
          {
            title: 'Системные Требования и Браузеры',
            content: 'Статический редактор работает в любом современном браузере с поддержкой IndexedDB и ES2020. Для WebContainer IDE требуется SharedArrayBuffer и изоляция COOP/COEP (Chrome, Edge, Brave, Firefox).',
          },
          {
            title: 'Создание Первого Проекта',
            content: 'Перейдите на страницу /app/projects и нажмите «Новый проект», чтобы выбрать статическую среду, шаблон React или среду WebContainer.',
          },
        ],
      },
      {
        id: 'static-workflow',
        title: '2. Статический Редактор HTML/CSS/JS',
        description: 'Мгновенное отображение изменений без сборки.',
        subsections: [
          {
            title: 'Работа в Трех Панелях',
            content: 'Редактируйте HTML, CSS и JavaScript в отдельных окнах с живым предпросмотром.',
            codeSnippet: `<!-- index.html -->
<div class="card">
  <h1>Привет, GB Coder</h1>
  <button id="btn">Кликов: 0</button>
</div>
<script>
  let n = 0;
  document.getElementById('btn').onclick = () => { n++; document.getElementById('btn').textContent = \`Кликов: \${n}\`; };
</script>`,
            codeLang: 'html',
          },
          {
            title: 'Подключение CDN-Библиотек',
            content: 'Подключайте Tailwind CSS, Bootstrap или React прямо через CDN-ссылки.',
            codeSnippet: `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />`,
            codeLang: 'html',
          },
        ],
      },
      {
        id: 'templates-starters',
        title: '3. Каталог Шаблонов',
        description: 'Готовые стартовые наборы для веб-разработки.',
        subsections: [
          {
            title: 'Выбор Шаблона',
            content: 'Шаблоны для лендингов, панелей управления и прототипов компонентов.',
          },
          {
            title: 'Многофайловая Структура',
            content: 'Поддержка подпапок, модулей CSS и импортов ES Modules.',
          },
        ],
      },
      {
        id: 'react-vue',
        title: '4. Разработка на React и Vue',
        description: 'Компонентная разработка в браузере.',
        subsections: [
          {
            title: 'Компоненты React 18',
            content: 'Поддержка JSX и TypeScript с быстрой перезагрузкой компонентов.',
            codeSnippet: `import React, { useState } from 'react';
export default function App() {
  const [c, setC] = useState(0);
  return <button onClick={() => setC(c + 1)}>Кликов: {c}</button>;
}`,
            codeLang: 'tsx',
          },
          {
            title: 'Однофайловые Компоненты Vue 3 (.vue)',
            content: 'Редактируйте файлы .vue с template, script setup и стилями с мгновенной браузерной компиляцией.',
          },
        ],
      },
      {
        id: 'webcontainer-terminal',
        title: '5. IDE WebContainer и Терминал',
        description: 'Полноценная среда Node.js и серверы Vite внутри браузера.',
        subsections: [
          {
            title: 'Терминал xterm.js',
            content: 'Выполняйте npm install и команды package.json прямо во вкладке браузера.',
            codeSnippet: `npm install
npm run dev`,
            codeLang: 'bash',
          },
          {
            title: 'Проброс Портов в Предпросмотр',
            content: 'Серверы разработки автоматически подключаются ко встроенному окну предпросмотра.',
          },
        ],
      },
      {
        id: 'storage-persistence',
        title: '6. Локальное Хранилище и Приватность',
        description: 'Ваш код остается в безопасности в базе данных IndexedDB.',
        subsections: [
          {
            title: 'Архитектура IndexedDB',
            content: 'Файлы сохраняются в локальной базе данных gb-coder-projects-db.',
          },
          {
            title: 'Работа без Интернета',
            content: 'Продолжайте писать код даже при отсутствии сетевого подключения.',
          },
        ],
      },
      {
        id: 'backup-restore',
        title: '7. Бэкапы и Экспорт ZIP',
        description: 'Удобный экспорт и восстановление проектов.',
        subsections: [
          {
            title: 'Экспорт ZIP с Хэшем SHA-256',
            content: 'Скачивайте полные проекты в виде ZIP-архивов с проверкой контрольной суммы.',
          },
          {
            title: 'Безопасный Импорт',
            content: 'Перетащите ZIP-файл в панель проектов для быстрого восстановления.',
          },
        ],
      },
      {
        id: 'workspace-search',
        title: '8. Поиск по Проекту и Горячие Клавиши',
        description: 'Ускорение повседневной работы с кодом.',
        subsections: [
          {
            title: 'Горячие Клавиши',
            content: 'Ctrl+S для сохранения, Ctrl+P для переключения файлов, Ctrl+` для терминала.',
          },
          {
            title: 'Глобальный Поиск',
            content: 'Быстрый поиск и замена по всем файлам проекта с поддержкой regex.',
          },
        ],
      },
      {
        id: 'troubleshooting',
        title: '9. Решение Проблем и Совместимость',
        description: 'Устранение частых затруднений.',
        subsections: [
          {
            title: 'Кнопка WebContainer Неактивна',
            content: 'Убедитесь, что сайт открыт по HTTPS и активны заголовки изоляции COOP/COEP.',
          },
          {
            title: 'Сброс Кэша Браузера',
            content: 'Используйте Ctrl+Shift+R для принудительного обновления устаревших файлов.',
          },
        ],
      },
    ],
    ctaHeading: 'Готовы начать разработку в GB Coder?',
    ctaSub: 'Откройте панель проектов и создайте рабочую область за пару секунд.',
    ctaBtn: 'Открыть GB Coder Studio',
  },
  pt: {
    metaTitle: 'Documentação — Guia do Usuário e Arquitetura | GB Coder',
    metaDescription: 'Documentação completa do GB Coder: primeiros passos, editor HTML/CSS/JS, terminal WebContainer Node.js, modelos React e Vue, backups IndexedDB e solução de problemas.',
    heroTag: 'Guias e Referências',
    heroTitle: 'Documentação para Desenvolvedores GB Coder',
    heroDescription: 'Aprenda a criar, testar e exportar aplicações web no seu navegador. Guias detalhados sobre fluxos de edição, terminal, persistência e compatibilidade.',
    tableOfContentsTitle: 'Índice de Conteúdos',
    sections: [
      {
        id: 'getting-started',
        title: '1. Primeiros Passos',
        description: 'O GB Coder roda totalmente no seu navegador sem servidores remotos.',
        subsections: [
          {
            title: 'Requisitos de Sistema e Navegadores',
            content: 'O editor estático funciona em qualquer navegador moderno com IndexedDB e ES2020. A IDE avançada WebContainer requer SharedArrayBuffer e isolamento COOP/COEP (Chrome, Edge, Brave, Firefox).',
          },
          {
            title: 'Criando seu Primeiro Projeto',
            content: 'Acesse /app/projects para abrir o painel e selecione entre projetos estáticos, React, Vue ou ambiente WebContainer completo.',
          },
        ],
      },
      {
        id: 'static-workflow',
        title: '2. Prototipagem Estática HTML/CSS/JS',
        description: 'Feedback visual imediato sem processos de compilação.',
        subsections: [
          {
            title: 'Edição em Três Painéis',
            content: 'Escreva HTML, aplique CSS e programe em JavaScript com atualização do DOM em tempo real.',
            codeSnippet: `<!-- index.html -->
<div class="card">
  <h1>Olá GB Coder</h1>
  <button id="btn">Cliques: 0</button>
</div>
<script>
  let n = 0;
  document.getElementById('btn').onclick = () => { n++; document.getElementById('btn').textContent = \`Cliques: \${n}\`; };
</script>`,
            codeLang: 'html',
          },
          {
            title: 'Inclusão de Bibliotecas CDN',
            content: 'Inclua Tailwind CSS, Bootstrap ou React diretamente pelos links de CDN.',
            codeSnippet: `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />`,
            codeLang: 'html',
          },
        ],
      },
      {
        id: 'templates-starters',
        title: '3. Modelos e Galeria de Projetos',
        description: 'Estruturas prontas para agilizar o desenvolvimento.',
        subsections: [
          {
            title: 'Escolhendo um Modelo',
            content: 'Modelos para landing pages, protótipos de componentes e painéis administrativos.',
          },
          {
            title: 'Estrutura Multi-Arquivos',
            content: 'Suporte a pastas internas, estilos modulares e módulos ES nativos.',
          },
        ],
      },
      {
        id: 'react-vue',
        title: '4. Desenvolvimento com React e Vue',
        description: 'Desenvolvimento baseado em componentes no navegador.',
        subsections: [
          {
            title: 'Componentes React 18',
            content: 'Crie componentes com JSX, TypeScript e recarregamento instantâneo.',
            codeSnippet: `import React, { useState } from 'react';
export default function App() {
  const [c, setC] = useState(0);
  return <button onClick={() => setC(c + 1)}>Cliques: {c}</button>;
}`,
            codeLang: 'tsx',
          },
          {
            title: 'Componentes Vue 3 (.vue)',
            content: 'Escreva arquivos .vue completos com template, script setup e estilos encapsulados.',
          },
        ],
      },
      {
        id: 'webcontainer-terminal',
        title: '5. IDE Avançada e Terminal WebContainer',
        description: 'Ambiente Node.js real e servidores de desenvolvimento na sua aba.',
        subsections: [
          {
            title: 'Terminal xterm.js Interativo',
            content: 'Execute npm install e scripts do package.json diretamente no navegador.',
            codeSnippet: `npm install
npm run dev`,
            codeLang: 'bash',
          },
          {
            title: 'Encaminhamento de Porta para o Preview',
            content: 'Servidores locais conectam-se automaticamente à janela de pré-visualização interna.',
          },
        ],
      },
      {
        id: 'storage-persistence',
        title: '6. Armazenamento Local e Privacidade',
        description: 'Seus dados protegidos no IndexedDB do seu dispositivo.',
        subsections: [
          {
            title: 'Arquitetura IndexedDB',
            content: 'Todos os arquivos são gravados no banco local gb-coder-projects-db.',
          },
          {
            title: 'Continuidade Offline',
            content: 'Continue programando normalmente mesmo sem acesso à internet.',
          },
        ],
      },
      {
        id: 'backup-restore',
        title: '7. Backups e Exportação ZIP',
        description: 'Portabilidade e segurança sem dependências proprietárias.',
        subsections: [
          {
            title: 'Exportação ZIP com Hash SHA-256',
            content: 'Baixe seus projetos em arquivos ZIP padronizados com controle de integridade.',
          },
          {
            title: 'Importação Segura',
            content: 'Arraste arquivos ZIP para o painel de projetos para restaurá-los.',
          },
        ],
      },
      {
        id: 'workspace-search',
        title: '8. Busca no Projeto e Atalhos',
        description: 'Agilidade para navegar e editar seus arquivos.',
        subsections: [
          {
            title: 'Principais Atalhos de Teclado',
            content: 'Ctrl+S para salvar, Ctrl+P para trocar de arquivo e Ctrl+` para o terminal.',
          },
          {
            title: 'Busca Global em Múltiplos Arquivos',
            content: 'Pesquise e substitua termos com suporte a expressões regulares.',
          },
        ],
      },
      {
        id: 'troubleshooting',
        title: '9. Resolução de Problemas e Compatibilidade',
        description: 'Diagnóstico rápido de problemas comuns.',
        subsections: [
          {
            title: 'WebContainer Desativado',
            content: 'Verifique se você está em HTTPS e se os cabeçalhos COOP/COEP estão ativos.',
          },
          {
            title: 'Limpeza de Cache',
            content: 'Pressione Ctrl+Shift+R para forçar a atualização de arquivos estáticos.',
          },
        ],
      },
    ],
    ctaHeading: 'Pronto para usar esses recursos no GB Coder?',
    ctaSub: 'Abra o painel de projetos e inicie seu ambiente em poucos segundos.',
    ctaBtn: 'Abrir GB Coder Studio',
  },
};

export function getDocsContent(lang: string): DocsTranslations {
  return DOCS_TRANSLATIONS[lang] || DOCS_TRANSLATIONS.en;
}
