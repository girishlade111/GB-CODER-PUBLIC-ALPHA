export interface HomeFeatureItem {
  title: string;
  desc: string;
}

export interface HomeTranslations {
  metaTitle: string;
  metaDescription: string;
  heroTag: string;
  heroTitle: string;
  heroDescription: string;
  ctaPrimary: string;
  ctaSecondary: string;
  architectureHeading: string;
  architectureSub: string;
  staticCardTitle: string;
  staticCardDesc: string;
  advancedCardTitle: string;
  advancedCardDesc: string;
  featuresHeading: string;
  featuresSub: string;
  features: HomeFeatureItem[];
  runtimeHeading: string;
  runtimeSub: string;
  runtimeP1: string;
  runtimeP2: string;
  ctaFinalHeading: string;
  ctaFinalSub: string;
  ctaFinalBtn: string;
}

export const HOME_TRANSLATIONS: Record<string, HomeTranslations> = {
  en: {
    metaTitle: 'GB Coder — In-Browser IDE & Code Studio | LadeStack',
    metaDescription: 'GB Coder is a powerful, browser-based IDE and code playground for HTML, CSS, JavaScript, React, and Vue. Instant live preview, WebContainer runtime, and full-stack capabilities. No signup required.',
    heroTag: 'Browser-First Development Studio',
    heroTitle: 'Build, Run, and Preview Code Instantly in Your Browser',
    heroDescription: 'From rapid HTML, CSS, and JavaScript prototyping to full-stack Node.js development with React and Vue starters. Powered by Monaco Editor, WebContainer execution, and zero-setup local persistence.',
    ctaPrimary: 'Start Coding Now',
    ctaSecondary: 'Explore Features',
    architectureHeading: 'Two Dedicated Editing Environments',
    architectureSub: 'Choose the exact level of power your current project requires.',
    staticCardTitle: 'Static & Multi-File Editor',
    staticCardDesc: 'Immediate visual feedback for HTML5, CSS3, and modern JavaScript. Perfect for quick UI experimentation, landing pages, component testing, and external CDN scripts without waiting for build steps.',
    advancedCardTitle: 'Advanced WebContainer IDE',
    advancedCardDesc: 'Full-stack Node.js environment running directly in browser memory. Run npm install, execute package scripts, boot Vite development servers, and work with full React and Vue starter architectures.',
    featuresHeading: 'Engineered for Performance, Privacy, and Precision',
    featuresSub: 'All operations execute locally in your browser with zero mandatory accounts or cloud locks.',
    features: [
      {
        title: 'Monaco Code Editor',
        desc: 'The same industry-grade editor behind VS Code with TypeScript diagnostics, syntax highlighting, autocomplete, and code folding.',
      },
      {
        title: 'Instant Live Preview',
        desc: 'Synchronized DOM rendering as you type with detached popout windows and mobile QR code testing for real-device inspection.',
      },
      {
        title: 'React & Vue Starters',
        desc: 'Jumpstart frontend development with single-file and multi-file project templates ready for immediate component prototyping.',
      },
      {
        title: 'WebContainer Micro-OS',
        desc: 'Execute Node.js runtimes, package managers, and development servers isolated securely inside your browser tab.',
      },
      {
        title: 'Local-First Persistence',
        desc: 'Workspaces are saved directly to IndexedDB on your machine, ensuring data privacy and instant recovery across browser sessions.',
      },
      {
        title: 'Tamper-Proof Backups',
        desc: 'Export projects to standard ZIP archives with integrity checks and restore full workspaces with complete file structure preservation.',
      },
    ],
    runtimeHeading: 'WebContainer Architecture & Browser Support',
    runtimeSub: 'Understanding the capabilities and boundaries of client-side operating systems.',
    runtimeP1: 'GB Coder leverages WebContainers to run genuine Node.js processes inside modern browsers that support SharedArrayBuffer and cross-origin isolation (COOP/COEP). On Chromium-based browsers (Chrome, Edge, Brave) and Firefox, development servers boot in milliseconds without remote servers.',
    runtimeP2: 'For lightweight prototyping or browsers where WebContainer headers are restricted, our Static Editor provides an instant fallback with zero dependencies, ensuring seamless coding on any modern browser.',
    ctaFinalHeading: 'Ready to Experience Browser-First Coding?',
    ctaFinalSub: 'No credit card, no sign-up form, and no server configuration required.',
    ctaFinalBtn: 'Launch GB Coder Studio',
  },
  es: {
    metaTitle: 'GB Coder — IDE y Estudio de Código en el Navegador | LadeStack',
    metaDescription: 'GB Coder es un potente IDE en el navegador para HTML, CSS, JavaScript, React y Vue. Vista previa instantánea, motor WebContainer y persistencia local sin registro.',
    heroTag: 'Estudio de Desarrollo en el Navegador',
    heroTitle: 'Crea, Ejecuta y Previsualiza Código Directamente en tu Navegador',
    heroDescription: 'Desde prototipos rápidos de HTML, CSS y JavaScript hasta desarrollo full-stack con Node.js, React y Vue. Impulsado por Monaco Editor, entorno WebContainer y persistencia local sin configuraciones.',
    ctaPrimary: 'Empezar a Programar',
    ctaSecondary: 'Explorar Funciones',
    architectureHeading: 'Dos Entornos de Desarrollo Específicos',
    architectureSub: 'Elige la potencia exacta que tu proyecto necesita en cada momento.',
    staticCardTitle: 'Editor Estático y Multifile',
    staticCardDesc: 'Retroalimentación visual instantánea para HTML5, CSS3 y JavaScript moderno. Ideal para maquetación web, pruebas de componentes e inyección de librerías CDN sin demoras de compilación.',
    advancedCardTitle: 'IDE Avanzado WebContainer',
    advancedCardDesc: 'Entorno Node.js completo ejecutado en la memoria del navegador. Ejecuta npm install, corre scripts de paquetes, levanta servidores Vite y programa con React y Vue de forma integral.',
    featuresHeading: 'Diseñado para Rendimiento, Privacidad y Precisión',
    featuresSub: 'Todo el procesamiento se realiza localmente en tu navegador sin cuentas obligatorias ni dependencias en la nube.',
    features: [
      {
        title: 'Editor de Código Monaco',
        desc: 'El mismo editor profesional de VS Code con autocompletado inteligente, diagnósticos de TypeScript, plegado de código y navegación fluida.',
      },
      {
        title: 'Vista Previa en Tiempo Real',
        desc: 'Renderizado DOM interactivo al escribir con ventana emergente desacoplada y previsualización móvil mediante código QR en dispositivos reales.',
      },
      {
        title: 'Plantillas React y Vue',
        desc: 'Inicia proyectos modernos con plantillas optimizadas para prototipar componentes tanto en archivos únicos como en arquitecturas completas.',
      },
      {
        title: 'Micro-SO WebContainer',
        desc: 'Ejecuta procesos de Node.js, gestores de paquetes npm y servidores de desarrollo con aislamiento seguro dentro de tu pestaña de navegador.',
      },
      {
        title: 'Persistencia Local-First',
        desc: 'Tus proyectos se guardan en IndexedDB dentro de tu dispositivo, garantizando máxima privacidad de datos y recuperación inmediata tras recargar.',
      },
      {
        title: 'Copias de Seguridad Fiables',
        desc: 'Exporta proyectos completos a archivos ZIP con verificación de integridad y restaura espacios de trabajo preservando toda la estructura de archivos.',
      },
    ],
    runtimeHeading: 'Arquitectura WebContainer y Compatibilidad',
    runtimeSub: 'Conoce el potencial y los límites técnicos del sistema operativo en el cliente.',
    runtimeP1: 'GB Coder aprovecha la tecnología WebContainers para ejecutar Node.js en navegadores con soporte para SharedArrayBuffer y aislamiento de origen cruzado (COOP/COEP). En navegadores basados en Chromium (Chrome, Edge, Brave) y Firefox, los servidores de desarrollo inician en milisegundos sin requerir servidores remotos.',
    runtimeP2: 'Para pruebas rápidas de interfaz o entornos donde las cabeceras de aislamiento no están disponibles, nuestro Editor Estático ofrece una alternativa inmediata sin dependencias, garantizando compatibilidad universal.',
    ctaFinalHeading: '¿Listo para programar en el navegador?',
    ctaFinalSub: 'Sin formularios de registro, sin tarjetas de crédito y sin configuración de servidores.',
    ctaFinalBtn: 'Abrir GB Coder Studio',
  },
  nl: {
    metaTitle: 'GB Coder — In-Browser IDE & Code Studio | LadeStack',
    metaDescription: 'GB Coder is een krachtige browser-IDE voor HTML, CSS, JavaScript, React en Vue. Directe live preview, WebContainer-runtime en lokale gegevensopslag zonder registratie.',
    heroTag: 'Browser-First Ontwikkelstudio',
    heroTitle: 'Bouw, Voer uit en Bekijk Code Direct in je Browser',
    heroDescription: 'Van snelle HTML-, CSS- en JavaScript-prototypes tot full-stack Node.js-projecten met React en Vue. Aangedreven door Monaco Editor, WebContainer-uitvoering en lokale opslag.',
    ctaPrimary: 'Begin met Coderen',
    ctaSecondary: 'Bekijk Functies',
    architectureHeading: 'Twee Gespecialiseerde Ontwikkelomgevingen',
    architectureSub: 'Kies precies het vermogen dat jouw huidige project nodig heeft.',
    staticCardTitle: 'Statische & Multi-Bestand Editor',
    staticCardDesc: 'Onmiddellijke visuele feedback voor HTML5, CSS3 en JavaScript. Ideaal voor snelle interface-experimenten en CDN-scripts zonder vertraging door compilatie.',
    advancedCardTitle: 'Geavanceerde WebContainer IDE',
    advancedCardDesc: 'Volwaardige Node.js-omgeving die direct in het browsergeheugen draait. Voer npm install uit, start Vite-ontwikkelservers en bouw complete React- en Vue-applicaties.',
    featuresHeading: 'Gebouwd voor Snelheid, Privacy en Betrouwbaarheid',
    featuresSub: 'Alle bewerkingen worden lokaal in je browser uitgevoerd zonder verplichte accounts of serverafhankelijkheid.',
    features: [
      {
        title: 'Monaco Code Editor',
        desc: 'De krachtige editor achter VS Code met TypeScript-intelligentie, syntaxiskleuring, codeaanvulling en foutopsporing.',
      },
      {
        title: 'Directe Live Preview',
        desc: 'Synchrone weergave tijdens het typen met een los venster en QR-codefunctionaliteit voor testen op mobiele apparaten.',
      },
      {
        title: 'React & Vue Starters',
        desc: 'Begin direct met vooraf geconfigureerde templates voor enkelvoudige en meervoudige componentstructuren.',
      },
      {
        title: 'WebContainer Micro-OS',
        desc: 'Draai Node.js-processen en pakketbeheerders veilig geïsoleerd binnen jouw browsertabblad.',
      },
      {
        title: 'Local-First Gegevensopslag',
        desc: 'Projecten worden opgeslagen in IndexedDB op jouw apparaat voor maximale privacy en continuïteit.',
      },
      {
        title: 'Betrouwbare Back-ups',
        desc: 'Exporteer projecten naar ZIP-archieven met integriteitscontrole en herstel werkruimtes naadloos.',
      },
    ],
    runtimeHeading: 'WebContainer-Architectuur & Browserondersteuning',
    runtimeSub: 'Begrijp de mogelijkheden en technische kaders van client-side uitvoeringsomgevingen.',
    runtimeP1: 'GB Coder maakt gebruik van WebContainers om echte Node.js-processen in de browser uit te voeren met SharedArrayBuffer en COOP/COEP-isolatie. In Chromium-browsers en Firefox starten ontwikkelservers binnen milliseconden.',
    runtimeP2: 'Voor snelle front-end taken biedt de Statische Editor een onmiddellijk alternatief zonder externe afhankelijkheden, waardoor je op vrijwel elk modern apparaat productief kunt werken.',
    ctaFinalHeading: 'Klaar om direct te coderen in de browser?',
    ctaFinalSub: 'Geen registratie, geen creditcard en geen installatie vereist.',
    ctaFinalBtn: 'Start GB Coder Studio',
  },
  fr: {
    metaTitle: 'GB Coder — IDE et Studio de Code dans le Navigateur | LadeStack',
    metaDescription: 'GB Coder est un IDE puissant dans le navigateur pour HTML, CSS, JavaScript, React et Vue. Aperçu en temps réel, moteur WebContainer et persistance locale sans inscription.',
    heroTag: 'Studio de Développement dans le Navigateur',
    heroTitle: 'Créez, Exécutez et Prévisualisez du Code Directement dans votre Navigateur',
    heroDescription: 'Du prototypage rapide HTML, CSS et JavaScript au développement full-stack Node.js avec React et Vue. Propulsé par Monaco Editor, l’environnement WebContainer et une persistance locale sécurisée.',
    ctaPrimary: 'Commencer à Coder',
    ctaSecondary: 'Découvrir les Fonctions',
    architectureHeading: 'Deux Environnements Dédiés',
    architectureSub: 'Choisissez le niveau de puissance parfaitement adapté à votre projet.',
    staticCardTitle: 'Éditeur Statique et Multi-Fichiers',
    staticCardDesc: 'Rendu visuel instantané pour HTML5, CSS3 et JavaScript moderne. Parfait pour expérimenter des interfaces, tester des scripts CDN et créer des maquettes sans attendre de compilation.',
    advancedCardTitle: 'IDE Avancé WebContainer',
    advancedCardDesc: 'Environnement Node.js complet s’exécutant dans la mémoire du navigateur. Lancez npm install, démarrez des serveurs Vite et développez des applications React et Vue complètes.',
    featuresHeading: 'Conçu pour la Performance, la Confidentialité et la Précision',
    featuresSub: 'Toutes les opérations s’exécutent localement dans votre navigateur, sans compte obligatoire ni dépendance cloud.',
    features: [
      {
        title: 'Éditeur de Code Monaco',
        desc: 'L’éditeur professionnel au cœur de VS Code avec autocomplétion TypeScript, coloration syntaxique, pliage de code et diagnostics.',
      },
      {
        title: 'Aperçu en Direct Synchronisé',
        desc: 'Mise à jour immédiate du DOM pendant la frappe avec fenêtre détachable et aperçu mobile par scan de QR code sur appareils réels.',
      },
      {
        title: 'Modèles React & Vue',
        desc: 'Démarrez vos interfaces avec des structures prêtes à l’emploi pour le prototypage mono-fichier ou multi-fichiers.',
      },
      {
        title: 'Micro-Système WebContainer',
        desc: 'Exécutez de vrais processus Node.js et des gestionnaires de paquets de manière sécurisée et isolée dans votre onglet.',
      },
      {
        title: 'Persistance Local-First',
        desc: 'Vos projets sont sauvegardés dans IndexedDB sur votre appareil pour une confidentialité totale et une restauration instantanée.',
      },
      {
        title: 'Sauvegardes et Export ZIP',
        desc: 'Exportez vos espaces de travail dans des archives ZIP vérifiées et restaurez vos projets en préservant l’arborescence complète.',
      },
    ],
    runtimeHeading: 'Architecture WebContainer et Compatibilité Navigateur',
    runtimeSub: 'Comprendre les capacités et les spécificités des environnements d’exécution côté client.',
    runtimeP1: 'GB Coder utilise la technologie WebContainers pour exécuter Node.js dans les navigateurs prenant en charge SharedArrayBuffer et l’isolation cross-origin (COOP/COEP). Sur Chromium (Chrome, Edge, Brave) et Firefox, les serveurs Vite démarrent en quelques millisecondes.',
    runtimeP2: 'Pour les sessions de prototypage léger ou les navigateurs sans prise en charge des en-têtes d’isolation, notre Éditeur Statique assure un fonctionnement immédiat sans configuration préalable.',
    ctaFinalHeading: 'Prêt à programmer dans votre navigateur ?',
    ctaFinalSub: 'Aucune inscription, aucune carte bancaire et aucune configuration de serveur.',
    ctaFinalBtn: 'Lancer GB Coder Studio',
  },
  ja: {
    metaTitle: 'GB Coder — ブラウザ内蔵IDE＆コード開発スタジオ | LadeStack',
    metaDescription: 'GB CoderはHTML、CSS、JavaScript、React、Vueに対応した高機能ブラウザ内蔵IDEです。即時ライブプレビュー、WebContainer実行環境、登録不要のローカルファースト永続化を提供します。',
    heroTag: 'ブラウザファースト開発スタジオ',
    heroTitle: 'ブラウザだけでコードを作成・実行・リアルタイムプレビュー',
    heroDescription: 'HTML/CSS/JSの即時プロトタイピングから、ReactやVueを用いたNode.jsフルスタック開発まで。Monaco Editor、WebContainer実行環境、セットアップ不要のローカル永続化を搭載。',
    ctaPrimary: '今すぐコードを書く',
    ctaSecondary: '機能を見る',
    architectureHeading: 'プロジェクトに応じた2つの編集モード',
    architectureSub: 'タスクの規模に合わせて最適な開発環境を選択できます。',
    staticCardTitle: 'スタティック＆マルチファイルエディター',
    staticCardDesc: 'HTML5、CSS3、モダンJavaScriptをビルド待機時間なしで即時レンダリング。UI検証やCDNライブラリの試行に最適です。',
    advancedCardTitle: 'アドバンスド WebContainer IDE',
    advancedCardDesc: 'ブラウザメモリ内で稼働する完全なNode.js環境。npm installの実行、Vite開発サーバーの起動、React/Vueの本格開発が可能です。',
    featuresHeading: '高速性・プライバシー・確実性を追求した設計',
    featuresSub: 'すべての処理がローカルブラウザ内で完結し、アカウント登録やクラウドへの依存は一切ありません。',
    features: [
      {
        title: 'Monaco Code Editor',
        desc: 'VS Codeと同等の高機能エディター。TypeScript型推論、構文強調、自動補完、エラー検出を標準装備。',
      },
      {
        title: '同期ライブプレビュー',
        desc: '入力と同時に更新されるプレビュー表示に加え、別ウィンドウ表示やQRコードによる実機モバイルテストに対応。',
      },
      {
        title: 'React・Vueスターター',
        desc: '単一ファイル構成から複数ファイル構成まで、主要フレームワークのテンプレートですぐに開発を開始できます。',
      },
      {
        title: 'WebContainer マイクロOS',
        desc: 'ブラウザタブ内で安全に隔離されたNode.jsランタイムとパッケージ管理を実行。',
      },
      {
        title: 'ローカルファースト永続化',
        desc: 'プロジェクトは端末内のIndexedDBに保存され、完全なデータプライバシーとブラウザ再読み込み時の復元を両立。',
      },
      {
        title: '高信頼ZIPバックアップ',
        desc: '完全性検証付きのZIPエクスポートにより、ファイル構造をそのまま安全に保存・復元できます。',
      },
    ],
    runtimeHeading: 'WebContainerアーキテクチャと対応ブラウザ',
    runtimeSub: 'クライアントサイドOSの動作要件と特性について。',
    runtimeP1: 'GB CoderはSharedArrayBufferおよびクロスオリジン分離（COOP/COEP）に対応した最新ブラウザ上でWebContainerを活用し、本格的なNode.js処理を実行します。Chromium系ブラウザ（Chrome、Edge、Brave）やFirefoxでは、開発サーバーが数ミリ秒で起動します。',
    runtimeP2: '軽量なUI検証や分離ヘッダーが制限されている環境でも、スタティックエディターが即座に動作し、あらゆるモダン環境でスムーズな開発体験を提供します。',
    ctaFinalHeading: 'ブラウザでの開発を体験してみませんか？',
    ctaFinalSub: '会員登録不要・クレジットカード不要・サーバー設定不要で今すぐ使えます。',
    ctaFinalBtn: 'GB Coder Studioを起動',
  },
  ko: {
    metaTitle: 'GB Coder — 브라우저 내장 IDE 및 코드 스튜디오 | LadeStack',
    metaDescription: 'GB Coder는 HTML, CSS, JavaScript, React, Vue를 지원하는 강력한 브라우저 기반 IDE입니다. 실시간 미리보기, WebContainer 런타임, 회원가입 없는 로컬 저장소를 제공합니다.',
    heroTag: '브라우저 우선 개발 스튜디오',
    heroTitle: '브라우저에서 직접 코드를 작성, 실행, 실시간 미리보기',
    heroDescription: 'HTML, CSS, JavaScript 빠른 프로토타이핑부터 React와 Vue를 활용한 풀스택 Node.js 개발까지. Monaco 에디터, WebContainer 실행 환경, 로컬 영구 저장을 지원합니다.',
    ctaPrimary: '지금 코딩 시작하기',
    ctaSecondary: '기능 살펴보기',
    architectureHeading: '두 가지 전문 개발 환경',
    architectureSub: '프로젝트 목적에 맞는 최적의 성능과 도구를 선택하세요.',
    staticCardTitle: '정적 및 멀티파일 에디터',
    staticCardDesc: 'HTML5, CSS3, 모던 자바스크립트를 빌드 지연 없이 즉시 렌더링합니다. 빠른 UI 프로토타이핑과 CDN 라이브러리 테스트에 적합합니다.',
    advancedCardTitle: '고급 WebContainer IDE',
    advancedCardDesc: '브라우저 메모리에서 구동되는 완벽한 Node.js 환경입니다. npm install 실행, Vite 개발 서버 구동, React 및 Vue 프로젝트를 지원합니다.',
    featuresHeading: '성능, 프라이버시, 안정성을 위한 설계',
    featuresSub: '모든 연산이 브라우저 내부에서 로컬로 실행되며 강제 계정이나 클라우드 종속이 없습니다.',
    features: [
      {
        title: 'Monaco 코드 에디터',
        desc: 'VS Code와 동일한 엔진으로 TypeScript 지능형 자동완성, 구문 강조, 코드 접기, 진단 기능을 제공합니다.',
      },
      {
        title: '실시간 반응형 미리보기',
        desc: '입력과 동시에 업데이트되는 DOM 미리보기, 독립 팝아웃 창, 모바일 QR 코드 실기기 테스트를 지원합니다.',
      },
      {
        title: 'React 및 Vue 스타터',
        desc: '단일 파일 및 다중 파일 프로젝트 템플릿을 통해 현대적인 컴포넌트 개발을 즉시 시작할 수 있습니다.',
      },
      {
        title: 'WebContainer 마이크로 OS',
        desc: '브라우저 탭 내에서 안전하게 격리된 Node.js 프로세스와 패키지 매니저를 구동합니다.',
      },
      {
        title: '로컬 우선(Local-First) 저장소',
        desc: '프로젝트 데이터가 기기 내 IndexedDB에 안전하게 보관되어 완벽한 개인정보 보호와 빠른 복원을 보장합니다.',
      },
      {
        title: '무결성 검증 ZIP 백업',
        desc: '프로젝트를 표준 ZIP 파일로 내보내고 무결성 검증을 거쳐 전체 파일 구조를 온전하게 복원할 수 있습니다.',
      },
    ],
    runtimeHeading: 'WebContainer 아키텍처 및 브라우저 호환성',
    runtimeSub: '클라이언트 사이드 실행 환경의 기능과 동작 사양을 확인하세요.',
    runtimeP1: 'GB Coder는 SharedArrayBuffer 및 교차 출처 격리(COOP/COEP)를 지원하는 브라우저에서 WebContainer를 통해 순수 Node.js를 실행합니다. Chromium 기반 브라우저(Chrome, Edge, Brave)와 Firefox에서 원격 서버 없이 개발 서버가 즉시 실행됩니다.',
    runtimeP2: '가벼운 마크업 작업이나 격리 헤더가 제한된 환경에서는 정적 에디터가 즉각적인 대안으로 작동하여 언제 어디서나 안정적인 코딩이 가능합니다.',
    ctaFinalHeading: '브라우저에서 새로운 코딩 환경을 만나보세요',
    ctaFinalSub: '회원가입, 신용카드 등록, 서버 설치 없이 즉시 사용할 수 있습니다.',
    ctaFinalBtn: 'GB Coder Studio 열기',
  },
  zh: {
    metaTitle: 'GB Coder — 纯浏览器IDE与云端代码工作台 | LadeStack',
    metaDescription: 'GB Coder 是一款功能强大的纯浏览器在线代码编辑器与IDE，支持HTML、CSS、JavaScript、React及Vue开发。具备实时预览、WebContainer全栈运行环境以及本地离线持久化存储，免注册即可畅享开发。',
    heroTag: '纯浏览器原生开发工作室',
    heroTitle: '无需安装环境，在浏览器中即刻编写、运行与预览代码',
    heroDescription: '从轻量级 HTML、CSS、JavaScript 原型设计，到基于 React 和 Vue 的全栈 Node.js 完整项目开发。内置 Monaco 编辑器、WebContainer 虚拟机引擎与无服务器本地持久化。',
    ctaPrimary: '立即开始编码',
    ctaSecondary: '了解核心功能',
    architectureHeading: '两种量身定制的开发工作区',
    architectureSub: '根据实际项目规模，自由切换轻量编辑与全功能环境。',
    staticCardTitle: '静态与多文件快速编辑器',
    staticCardDesc: '毫秒级反馈的 HTML5、CSS3 与现代 JavaScript 编写体验。适合页面布局试验、组件视觉调试及免编译构建的 CDN 脚本测试。',
    advancedCardTitle: '高级 WebContainer 完整 IDE',
    advancedCardDesc: '在浏览器内存中运行的原生 Node.js 运行时环境。支持执行 npm install、启动 Vite 开发服务，以及管理完整的 React 与 Vue 单页工程。',
    featuresHeading: '为极致性能、数据隐私与可靠性而构建',
    featuresSub: '所有代码与计算完全在本地浏览器端完成，无需注册账号，杜绝云端厂商锁定。',
    features: [
      {
        title: 'Monaco 代码编辑器',
        desc: '采用与 VS Code 相同的专业编辑器内核，提供 TypeScript 智能提示、语法高亮、自动补全与实时错误诊断。',
      },
      {
        title: '毫秒级实时动态预览',
        desc: '随打随看的双向渲染引擎，支持独立弹窗预览以及扫描二维码在真实移动端设备上进行同步调试。',
      },
      {
        title: 'React 与 Vue 快速模板',
        desc: '预置单文件组件与完整工程化脚手架，助您随时随地开展现代前端框架组件开发。',
      },
      {
        title: 'WebContainer 浏览器微系统',
        desc: '在沙箱标签页内直接执行 Node.js 脚本与 npm 包管理，无需在本地搭建任何开发依赖。',
      },
      {
        title: '本地优先（Local-First）存储',
        desc: '所有代码与工作区状态安全保存在设备 IndexedDB 中，保障私密性并在页面刷新后瞬间恢复。',
      },
      {
        title: '完整 ZIP 工程备份与导入',
        desc: '支持导出具备完整性校验的标准 ZIP 工程包，并可随时一键恢复所有目录与依赖配置。',
      },
    ],
    runtimeHeading: 'WebContainer 架构与浏览器兼容性说明',
    runtimeSub: '深入了解客户端微操作系统的运行机制与适用场景。',
    runtimeP1: 'GB Coder 深度结合 WebContainer 技术，在支持 SharedArrayBuffer 与跨源隔离（COOP/COEP）的现代浏览器中运行真实 Node.js 进程。在 Chromium 系列浏览器（Chrome、Edge、Brave）及 Firefox 上，开发服务器可实现秒级冷启动。',
    runtimeP2: '针对轻量排版试验或未开启隔离环境的场景，静态编辑器提供免依赖保底支持，确保在所有现代终端设备上都能稳定运行。',
    ctaFinalHeading: '准备好开启全新的浏览器编程体验了吗？',
    ctaFinalSub: '无需注册、无需信用卡、无需配置复杂服务器环境。',
    ctaFinalBtn: '启动 GB Coder 工作台',
  },
  ru: {
    metaTitle: 'GB Coder — Браузерная IDE и Студия Разработки | LadeStack',
    metaDescription: 'GB Coder — это функциональная среда разработки в браузере для HTML, CSS, JavaScript, React и Vue. Мгновенный предпросмотр, среда WebContainer и локальное хранилище без регистрации.',
    heroTag: 'Студия Разработки в Браузере',
    heroTitle: 'Создавайте, Запускайте и Тестируйте Код Прямо в Браузере',
    heroDescription: 'От быстрого прототипирования на HTML, CSS и JS до полностековой разработки на Node.js с шаблонами React и Vue. Работает на базе Monaco Editor, среды WebContainer и локального хранилища IndexedDB.',
    ctaPrimary: 'Начать Кодить',
    ctaSecondary: 'Все Возможности',
    architectureHeading: 'Два Специализированных Режима Работы',
    architectureSub: 'Выбирайте точный уровень производительности под задачи вашего проекта.',
    staticCardTitle: 'Статический и Многофайловый Редактор',
    staticCardDesc: 'Мгновенное отображение изменений для HTML5, CSS3 и JavaScript без ожидания сборки. Идеально для верстки, проверки компонентов и подключения CDN-библиотек.',
    advancedCardTitle: 'Продвинутая IDE WebContainer',
    advancedCardDesc: 'Полноценная среда Node.js прямо в оперативной памяти браузера. Выполняйте npm install, запускайте серверы разработки Vite и создавайте проекты на React и Vue.',
    featuresHeading: 'Скорость, Конфиденциальность и Надежность',
    featuresSub: 'Все процессы выполняются локально на вашем компьютере без обязательных учетных записей и облачных ограничений.',
    features: [
      {
        title: 'Редактор Monaco',
        desc: 'Профессиональный редактор кода от VS Code с подсказками TypeScript, подсветкой синтаксиса, автодополнением и свертыванием блоков.',
      },
      {
        title: 'Синхронный Живой Предпросмотр',
        desc: 'Обновление интерфейса в реальном времени при вводе текста, отдельное окно предпросмотра и тестирование на смартфонах через QR-код.',
      },
      {
        title: 'Шаблоны React и Vue',
        desc: 'Готовые стартовые наборы для создания однофайловых и многофайловых проектов на современных фреймворках.',
      },
      {
        title: 'Микро-ОС WebContainer',
        desc: 'Изолированный запуск процессов Node.js и пакетных менеджеров внутри вкладки браузера.',
      },
      {
        title: 'Локальное Хранилище Local-First',
        desc: 'Проекты сохраняются в IndexedDB на вашем устройстве, обеспечивая полную приватность данных и быстрое восстановление.',
      },
      {
        title: 'Надежное Резервное Копирование',
        desc: 'Экспорт проектов в стандартные ZIP-архивы с контролем целостности и полное восстановление структуры каталогов.',
      },
    ],
    runtimeHeading: 'Архитектура WebContainer и Совместимость с Браузерами',
    runtimeSub: 'Технические особенности выполнения кода на стороне клиента.',
    runtimeP1: 'GB Coder использует WebContainer для выполнения реальных процессов Node.js в браузерах с поддержкой SharedArrayBuffer и междоменной изоляции (COOP/COEP). В Chromium-браузерах (Chrome, Edge, Brave) и Firefox серверы разработки запускаются за миллисекунды.',
    runtimeP2: 'Для быстрого тестирования верстки или сред без заголовков изоляции статический редактор работает как надежное решение без внешних зависимостей.',
    ctaFinalHeading: 'Готовы попробовать разработку в браузере?',
    ctaFinalSub: 'Без регистрации, без кредитных карт и без установки программ.',
    ctaFinalBtn: 'Открыть GB Coder Studio',
  },
  pt: {
    metaTitle: 'GB Coder — IDE e Estúdio de Código no Navegador | LadeStack',
    metaDescription: 'GB Coder é uma IDE poderosa no navegador para HTML, CSS, JavaScript, React e Vue. Pré-visualização instantânea, ambiente WebContainer e persistência local sem cadastro.',
    heroTag: 'Estúdio de Desenvolvimento no Navegador',
    heroTitle: 'Construa, Execute e Visualize Código Diretamente no seu Navegador',
    heroDescription: 'Da prototipagem ágil em HTML, CSS e JavaScript ao desenvolvimento full-stack em Node.js com React e Vue. Equipado com Monaco Editor, execução WebContainer e armazenamento local seguro.',
    ctaPrimary: 'Começar a Codificar',
    ctaSecondary: 'Explorar Recursos',
    architectureHeading: 'Dois Ambientes de Desenvolvimento Especializados',
    architectureSub: 'Escolha a potência exata que o seu projeto exige a cada momento.',
    staticCardTitle: 'Editor Estático e Multi-Arquivos',
    staticCardDesc: 'Feedback visual instantâneo para HTML5, CSS3 e JavaScript moderno. Ideal para prototipar interfaces e testar bibliotecas CDN sem esperas de compilação.',
    advancedCardTitle: 'IDE Avançada WebContainer',
    advancedCardDesc: 'Ambiente Node.js completo executado diretamente na memória do navegador. Execute npm install, rode servidores de desenvolvimento Vite e crie projetos React e Vue.',
    featuresHeading: 'Desenvolvido para Desempenho, Privacidade e Precisão',
    featuresSub: 'Todas as operações são executadas localmente no seu navegador sem contas obrigatórias ou dependências de servidores na nuvem.',
    features: [
      {
        title: 'Editor de Código Monaco',
        desc: 'A mesma experiência de edição profissional do VS Code com TypeScript inteligente, destaque de sintaxe e autocompletar.',
      },
      {
        title: 'Pré-Visualização em Tempo Real',
        desc: 'Renderização do DOM conforme você digita, com suporte a janela destacada e testes móveis em aparelhos reais via QR code.',
      },
      {
        title: 'Modelos React & Vue',
        desc: 'Inicie rapidamente o desenvolvimento com estruturas de arquivos prontas para prototipagem de componentes modernos.',
      },
      {
        title: 'Micro-SO WebContainer',
        desc: 'Execute processos de Node.js e gerenciadores de pacotes npm de forma isolada e segura na sua aba de navegação.',
      },
      {
        title: 'Armazenamento Local-First',
        desc: 'Os projetos são gravados no IndexedDB do seu dispositivo, garantindo total privacidade e recuperação rápida de dados.',
      },
      {
        title: 'Backups Confiáveis em ZIP',
        desc: 'Exporte seus projetos para arquivos ZIP com validação de integridade e restaure seus ambientes preservando toda a estrutura.',
      },
    ],
    runtimeHeading: 'Arquitetura WebContainer e Compatibilidade',
    runtimeSub: 'Entenda os recursos e limites técnicos dos sistemas operacionais no cliente.',
    runtimeP1: 'O GB Coder utiliza WebContainers para rodar processos reais de Node.js em navegadores compatíveis com SharedArrayBuffer e isolamento de origem cruzada (COOP/COEP). Em navegadores Chromium (Chrome, Edge, Brave) e Firefox, servidores de desenvolvimento iniciam em milissegundos.',
    runtimeP2: 'Para testes rápidos de marcação visual ou dispositivos sem cabeçalhos de isolamento, o Editor Estático oferece uma alternativa imediata e sem dependências.',
    ctaFinalHeading: 'Pronto para programar no navegador?',
    ctaFinalSub: 'Sem formulários de cadastro, sem cartão de crédito e sem configuração de servidores.',
    ctaFinalBtn: 'Abrir GB Coder Studio',
  },
};

export function getHomeContent(lang: string): HomeTranslations {
  return HOME_TRANSLATIONS[lang] || HOME_TRANSLATIONS.en;
}
