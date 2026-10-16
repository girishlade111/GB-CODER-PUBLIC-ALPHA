export interface AboutTranslations {
  metaTitle: string;
  metaDescription: string;
  heroTag: string;
  heroTitle: string;
  heroDescription: string;
  ctaBtn: string;
  card1Title: string;
  card1Sub: string;
  card1Items: { title: string; desc: string }[];
  card2Title: string;
  card2Sub: string;
  card2Bullets: string[];
  card3Title: string;
  card3P1: string;
  card3P2: string;
  connectTitle: string;
  connectSub: string;
  openEditorBtn: string;
}

export const ABOUT_TRANSLATIONS: Record<string, AboutTranslations> = {
  en: {
    metaTitle: 'About GB Coder — Browser-First Web Development Studio | LadeStack',
    metaDescription: 'GB Coder is a free, browser-based code studio by Girish Lade: Monaco editing, live preview, WebContainer execution, and local-first projects. No signup required.',
    heroTag: 'Browser-First Development Studio',
    heroTitle: 'Code Smarter with Modern Browser Engineering',
    heroDescription: 'Write, preview, and build HTML, CSS, JavaScript, React, and Vue applications instantly. The modern way to build for the web.',
    ctaBtn: 'Start Coding Now',
    card1Title: 'Everything You Need to Build for the Web',
    card1Sub: 'A complete developer studio running in your browser memory.',
    card1Items: [
      {
        title: 'Write & Run Code',
        desc: 'Edit HTML, CSS, and JavaScript in a professional Monaco-based editor with TypeScript diagnostics.',
      },
      {
        title: 'Node.js & WebContainer',
        desc: 'Execute real Node.js packages and Vite dev servers directly inside your browser tab.',
      },
      {
        title: 'Instant Live Preview',
        desc: 'Inspect changes in real time with synchronized DOM rendering and detached preview windows.',
      },
      {
        title: 'Local-First Project Storage',
        desc: 'Keep your source code private and secure on your device with IndexedDB persistence.',
      },
    ],
    card2Title: 'Why Developers Choose GB Coder',
    card2Sub: 'Engineered for productivity, designed for speed and data sovereignty.',
    card2Bullets: [
      'Free to use with zero mandatory subscriptions.',
      'No account registration or login required to start coding.',
      'Instant live preview updating as you type.',
      'Local-first privacy: code stays in your browser IndexedDB.',
      'Export and import full project ZIP archives with SHA-256 integrity.',
      'Ad-free, focused developer interface.',
    ],
    card3Title: 'Built by Developers, for Developers',
    card3P1: 'GB Coder is created and maintained by Girish Lade, a software programmer, AI tools maker, and UI/UX engineer from Mumbai, India. The mission is to make web development faster, simpler, and accessible from any modern browser without complex local environments.',
    card3P2: 'Explore more developer projects and open-source tooling at ladestack.in.',
    connectTitle: 'Connect With the Creator',
    connectSub: 'Follow the development journey, report feedback, or collaborate.',
    openEditorBtn: 'Open Editor',
  },
  es: {
    metaTitle: 'Acerca de GB Coder — Estudio de Desarrollo en el Navegador | LadeStack',
    metaDescription: 'GB Coder es un estudio de código en el navegador creado por Girish Lade: editor Monaco, vista previa en tiempo real, WebContainer y persistencia local.',
    heroTag: 'Estudio de Desarrollo en el Navegador',
    heroTitle: 'Programa con Mayor Agilidad en la Web Moderna',
    heroDescription: 'Escribe, previsualiza y construye aplicaciones en HTML, CSS, JavaScript, React y Vue al instante. La forma moderna de desarrollar para la web.',
    ctaBtn: 'Empezar a Programar',
    card1Title: 'Todo lo Necesario para Desarrollar en la Web',
    card1Sub: 'Un estudio completo que se ejecuta en la memoria de tu navegador.',
    card1Items: [
      {
        title: 'Escribe y Ejecuta Código',
        desc: 'Edita HTML, CSS y JavaScript en un editor profesional Monaco con diagnósticos TypeScript.',
      },
      {
        title: 'Node.js y WebContainer',
        desc: 'Ejecuta paquetes npm reales y servidores Vite directamente en tu pestaña del navegador.',
      },
      {
        title: 'Vista Previa en Vivo',
        desc: 'Visualiza tus cambios en tiempo real con renderizado DOM sincronizado y ventanas externas.',
      },
      {
        title: 'Almacenamiento Local-First',
        desc: 'Conserva tu código de forma privada en tu dispositivo mediante IndexedDB.',
      },
    ],
    card2Title: 'Por Qué los Desarrolladores Eligen GB Coder',
    card2Sub: 'Diseñado para la máxima productividad, velocidad y soberanía de datos.',
    card2Bullets: [
      'Uso gratuito sin suscripciones obligatorias.',
      'Sin formularios de registro ni inicio de sesión para programar.',
      'Vista previa en tiempo real mientras escribes.',
      'Privacidad local-first: el código permanece en el navegador.',
      'Exportación e importación en ZIP con verificación SHA-256.',
      'Interfaz limpia y enfocada, sin publicidad.',
    ],
    card3Title: 'Creado por Desarrolladores, para Desarrolladores',
    card3P1: 'GB Coder es creado y mantenido por Girish Lade, programador de software, creador de herramientas de IA e ingeniero de UI/UX de Mumbai, India. La misión es hacer la programación web más rápida y accesible sin necesidad de entornos locales complejos.',
    card3P2: 'Descubre más proyectos y herramientas en ladestack.in.',
    connectTitle: 'Conecta con el Creador',
    connectSub: 'Sigue el avance del proyecto, envía sugerencias o colabora.',
    openEditorBtn: 'Abrir Editor',
  },
  nl: {
    metaTitle: 'Over GB Coder — Browser-First Ontwikkelstudio | LadeStack',
    metaDescription: 'GB Coder is een browser-gebaseerde codeerstudio van Girish Lade: Monaco Editor, live preview, WebContainer en veilige lokale opslag.',
    heroTag: 'Browser-First Ontwikkelstudio',
    heroTitle: 'Slimmer en Sneller Programmeren in de Browser',
    heroDescription: 'Schrijf, bekijk en bouw direct HTML-, CSS-, JavaScript-, React- en Vue-applicaties. De moderne manier van webontwikkeling.',
    ctaBtn: 'Begin met Coderen',
    card1Title: 'Alles Wat Je Nodig Hebt voor het Web',
    card1Sub: 'Een complete ontwikkelomgeving in je browsergeheugen.',
    card1Items: [
      {
        title: 'Code Schrijven & Uitvoeren',
        desc: 'Bewerk HTML, CSS en JavaScript in een professionele Monaco Editor.',
      },
      {
        title: 'Node.js & WebContainer',
        desc: 'Draai npm-pakketten en Vite-servers direct in je browsertabblad.',
      },
      {
        title: 'Directe Live Preview',
        desc: 'Zie wijzigingen onmiddellijk in een gesynchroniseerd weergavevenster.',
      },
      {
        title: 'Local-First Gegevensopslag',
        desc: 'Houd je broncode veilig en privé op je eigen apparaat via IndexedDB.',
      },
    ],
    card2Title: 'Waarom Ontwikkelaars voor GB Coder Kiezen',
    card2Sub: 'Gebouwd voor snelheid, gegevensprivacy en gebruiksgemak.',
    card2Bullets: [
      'Gratis te gebruiken zonder verplichte abonnementen.',
      'Geen accountregistratie nodig om te beginnen.',
      'Directe live preview tijdens het typen.',
      'Local-first privacy: code blijft in je browser.',
      'ZIP-export en -import met SHA-256 integriteitscontrole.',
      'Reclamevrije, gefocuste werkomgeving.',
    ],
    card3Title: 'Gebouwd door Ontwikkelaars, voor Ontwikkelaars',
    card3P1: 'GB Coder is gemaakt en wordt onderhouden door Girish Lade, softwareprogrammeur en UI/UX-engineer uit Mumbai, India. De missie is om webontwikkeling sneller en toegankelijker te maken zonder zware lokale software-installaties.',
    card3P2: 'Ontdek meer projecten op ladestack.in.',
    connectTitle: 'In Contact Komen',
    connectSub: 'Volg de ontwikkeling of deel je feedback.',
    openEditorBtn: 'Open Editor',
  },
  fr: {
    metaTitle: 'À Propos de GB Coder — Studio de Développement Web | LadeStack',
    metaDescription: 'GB Coder est un studio de code dans le navigateur créé par Girish Lade : éditeur Monaco, aperçu direct, exécution WebContainer et stockage local.',
    heroTag: 'Studio de Développement dans le Navigateur',
    heroTitle: 'Programmez Plus Efficacement dans le Navigateur',
    heroDescription: 'Écrivez, prévisualisez et concevez des applications HTML, CSS, JavaScript, React et Vue instantanément.',
    ctaBtn: 'Commencer à Coder',
    card1Title: 'Tout le Nécessaire pour Créer sur le Web',
    card1Sub: 'Un environnement développeur complet dans votre navigateur.',
    card1Items: [
      {
        title: 'Écrire et Exécuter du Code',
        desc: 'Éditez en HTML, CSS et JS avec la coloration et les diagnostics Monaco.',
      },
      {
        title: 'Node.js & WebContainer',
        desc: 'Exécutez des paquets npm et des serveurs Vite dans votre onglet.',
      },
      {
        title: 'Aperçu en Temps Réel',
        desc: 'Visualisez vos changements immédiatement avec synchronisation DOM.',
      },
      {
        title: 'Stockage Local-First',
        desc: 'Préservez la confidentialité de vos créations grâce à IndexedDB.',
      },
    ],
    card2Title: 'Pourquoi Choisir GB Coder',
    card2Sub: 'Conçu pour la productivité, la vitesse et la protection des données.',
    card2Bullets: [
      'Gratuit sans abonnement obligatoire.',
      'Aucune création de compte requise pour démarrer.',
      'Aperçu en direct mis à jour pendant la saisie.',
      'Confidentialité locale : le code ne quitte pas votre machine.',
      'Exportation et importation ZIP avec contrôle SHA-256.',
      'Interface sans publicité dédiée aux développeurs.',
    ],
    card3Title: 'Conçu par des Développeurs, pour des Développeurs',
    card3P1: 'GB Coder est développé et maintenu par Girish Lade, programmeur et ingénieur UI/UX basé à Mumbai, en Inde. Sa mission est de rendre le développement web accessible immédiatement depuis n’importe quel navigateur moderne.',
    card3P2: 'Découvrez d’autres projets sur ladestack.in.',
    connectTitle: 'Contacter le Créateur',
    connectSub: 'Suivez le projet, partagez vos retours ou collaborez.',
    openEditorBtn: 'Ouvrir l’Éditeur',
  },
  ja: {
    metaTitle: 'GB Coderについて — ブラウザファースト開発スタジオ | LadeStack',
    metaDescription: 'GB CoderはGirish Ladeによって開発されたブラウザ内蔵コードスタジオです。Monacoエディター、同期プレビュー、WebContainer、ローカル保存を搭載。',
    heroTag: 'ブラウザファースト開発スタジオ',
    heroTitle: 'モダンなブラウザ技術で、より快適なコーディングを',
    heroDescription: 'HTML、CSS、JavaScript、React、Vueアプリケーションを即座に作成・プレビュー。現代のWeb開発をより身近にするブラウザ内開発環境です。',
    ctaBtn: '今すぐコードを書く',
    card1Title: 'Web制作に必要なすべての機能を搭載',
    card1Sub: 'ブラウザメモリ内で稼働する完全な開発スタジオ。',
    card1Items: [
      {
        title: 'コードの記述と実行',
        desc: 'TypeScript型診断を備えたMonacoエディターで快適にコーディング。',
      },
      {
        title: 'Node.js & WebContainer',
        desc: 'ブラウザタブ内で本物のnpmパッケージとViteサーバーを稼働。',
      },
      {
        title: 'リアルタイム同期プレビュー',
        desc: '入力と同時に更新されるプレビューと別ウィンドウ表示に対応。',
      },
      {
        title: 'ローカルファースト永続化',
        desc: '端末内のIndexedDBにコードを安全に保存しプライバシーを保護。',
      },
    ],
    card2Title: 'GB Coderが選ばれる理由',
    card2Sub: '開発速度、データ保護、使いやすさを徹底的に追求。',
    card2Bullets: [
      '完全無料で利用可能、定期課金はありません。',
      'アカウント登録不要でアクセスした瞬間に使えます。',
      '入力と同時に同期されるリアルタイムプレビュー。',
      'ローカルファースト：コードはブラウザ内のみに保持。',
      'SHA-256ハッシュ検証付きのZIPエクスポート＆インポート。',
      '広告のない集中できる開発者インターフェース。',
    ],
    card3Title: '開発者による、開発者のためのツール',
    card3P1: 'GB Coderはインド・ムンバイ出身のプログラマー、AIツール開発者、UI/UXエンジニアであるGirish Ladeによって開発・保守されています。複雑な環境構築なしに、誰もがブラウザだけで即座にWeb開発を始められる環境を目指しています。',
    card3P2: '関連プロジェクトは ladestack.in にて公開しています。',
    connectTitle: '開発者とつながる',
    connectSub: '開発の進捗をフォローしたり、ご意見をお寄せください。',
    openEditorBtn: 'エディターを開く',
  },
  ko: {
    metaTitle: 'GB Coder 소개 — 브라우저 우선 개발 스튜디오 | LadeStack',
    metaDescription: 'GB Coder는 Girish Lade가 제작한 브라우저 기반 코드 스튜디오입니다. Monaco 에디터, 실시간 미리보기, WebContainer 및 로컬 저장소를 제공합니다.',
    heroTag: '브라우저 우선 개발 스튜디오',
    heroTitle: '모던 브라우저 기술로 더 스마트하게 코딩하세요',
    heroDescription: 'HTML, CSS, JavaScript, React, Vue 애플리케이션을 즉각 작성하고 확인하세요. 웹을 구축하는 가장 빠르고 현대적인 방법입니다.',
    ctaBtn: '지금 코딩 시작하기',
    card1Title: '웹 개발에 필요한 모든 핵심 기능',
    card1Sub: '브라우저 메모리 안에서 구동되는 완벽한 개발자 스튜디오.',
    card1Items: [
      {
        title: '코드 작성 및 실행',
        desc: 'TypeScript 진단 기능을 갖춘 Monaco 에디터에서 정밀하게 작업하세요.',
      },
      {
        title: 'Node.js & WebContainer',
        desc: '브라우저 탭에서 실제 npm 패키지와 Vite 서버를 직접 실행합니다.',
      },
      {
        title: '실시간 즉시 미리보기',
        desc: '동기화된 DOM 렌더링과 독립 팝아웃 창을 통해 실시간으로 확인하세요.',
      },
      {
        title: '로컬 우선 프로젝트 저장',
        desc: 'IndexedDB를 활용하여 모든 소스코드를 기기 내부에 안전하게 보관합니다.',
      },
    ],
    card2Title: 'GB Coder를 선택하는 이유',
    card2Sub: '개발 생산성, 속도, 데이터 주권을 최우선으로 설계했습니다.',
    card2Bullets: [
      '무료로 사용 가능하며 유료 구독이 없습니다.',
      '회원가입이나 로그인 절차 없이 즉시 코딩 가능.',
      '입력과 동시에 반영되는 실시간 미리보기.',
      '로컬 우선 프라이버시: 코드가 기기 외부로 전송되지 않음.',
      'SHA-256 무결성 검증을 거치는 ZIP 내보내기/가져오기.',
      '광고 없는 직관적인 개발자 인터페이스.',
    ],
    card3Title: '개발자를 위해 개발자가 만들었습니다',
    card3P1: 'GB Coder는 인도 뭄바이의 소프트웨어 프로그래머이자 AI 도구 제작자, UI/UX 엔지니어인 Girish Lade가 개발하고 유지관리합니다. 복잡한 로컬 설치 과정 없이 누구나 브라우저만으로 웹 개발을 시작할 수 있도록 돕는 것을 목표로 합니다.',
    card3P2: '더 많은 프로젝트는 ladestack.in 에서 확인하실 수 있습니다.',
    connectTitle: '제작자와 소통하기',
    connectSub: '개발 여정을 팔로우하거나 피드백을 전달해 주세요.',
    openEditorBtn: '에디터 열기',
  },
  zh: {
    metaTitle: '关于 GB Coder — 纯浏览器原生开发工作室 | LadeStack',
    metaDescription: 'GB Coder 是由 Girish Lade 打造的免费浏览器端代码开发工作室：内置 Monaco 编辑器、实时同步预览、WebContainer 原生运行与 IndexedDB 本地持久化。',
    heroTag: '纯浏览器原生开发工作室',
    heroTitle: '以现代浏览器工程技术，重塑高效编码体验',
    heroDescription: '无需安装复杂环境，即可在浏览器中即刻编写、预览并构建 HTML、CSS、JavaScript、React 与 Vue 现代应用。',
    ctaBtn: '立即开始编码',
    card1Title: '现代 Web 构建所需的完备工具链',
    card1Sub: '完全在本地浏览器内存中运转的轻量开发工作台。',
    card1Items: [
      {
        title: '编写与即刻运行代码',
        desc: '依托内置 Monaco 编辑器，享受 TypeScript 智能推导与实时诊断。',
      },
      {
        title: 'Node.js 与 WebContainer',
        desc: '在单个浏览器标签页内，直接调度真实的 npm 依赖与 Vite 开发服务。',
      },
      {
        title: '毫秒级实时动态预览',
        desc: '输入即渲染的双向同步引擎，支持独立弹窗与移动端扫码测试。',
      },
      {
        title: '本地优先（Local-First）存储',
        desc: '所有代码安全保存在设备本地 IndexedDB 数据库中，绝对私密。',
      },
    ],
    card2Title: '开发者青睐 GB Coder 的核心理由',
    card2Sub: '专为极速响应、开发专注度与数据自主权而深度定制。',
    card2Bullets: [
      '完全免费开放使用，无任何强制订阅与隐性收费。',
      '无需注册或登录账号，打开页面即刻投身开发。',
      '键盘键入与画面渲染严格毫秒级同步。',
      '本地优先隐私架构：源码永不向外部主机静默上传。',
      '支持带 SHA-256 完整性指纹的 ZIP 压缩包一键导入导出。',
      '纯粹专注、无任何商业广告打扰的清爽界面。',
    ],
    card3Title: '源于开发者，服务于开发者',
    card3P1: 'GB Coder 由来自印度孟买的软件工程师、AI 工具创作者及 UI/UX 设计师 Girish Lade 独立构想与持续维护。其核心愿景是彻底打破繁琐的本地开发环境桎梏，让每位开发者只要拥有现代浏览器，就能自由创造优秀的 Web 应用。',
    card3P2: '更多技术项目与开源工具，敬请访问 ladestack.in。',
    connectTitle: '与创作者保持联络',
    connectSub: '关注产品研发路线、提交技术反馈或探讨合作。',
    openEditorBtn: '打开编辑器',
  },
  ru: {
    metaTitle: 'О проекте GB Coder — Студия Разработки в Браузере | LadeStack',
    metaDescription: 'GB Coder — бесплатная браузерная среда от Girish Lade: редактор Monaco, живой предпросмотр, WebContainer и локальное хранилище без регистрации.',
    heroTag: 'Студия Разработки в Браузере',
    heroTitle: 'Современные Технологии для Быстрой Разработки',
    heroDescription: 'Создавайте, тестируйте и запускайте проекты на HTML, CSS, JavaScript, React и Vue прямо в браузере.',
    ctaBtn: 'Начать Кодить',
    card1Title: 'Все Необходимое для Создания Веб-Приложений',
    card1Sub: 'Полнофункциональная студия прямо в памяти вашего браузера.',
    card1Items: [
      {
        title: 'Редактирование и Запуск Кода',
        desc: 'Пишите код в редакторе Monaco с проверкой типов TypeScript.',
      },
      {
        title: 'Node.js и WebContainer',
        desc: 'Запускайте реальные npm-пакеты и серверы Vite внутри вкладки.',
      },
      {
        title: 'Живой Предпросмотр',
        desc: 'Мгновенное обновление DOM и отдельное окно предпросмотра.',
      },
      {
        title: 'Локальное Хранилище',
        desc: 'Надежное и приватное сохранение проектов в IndexedDB.',
      },
    ],
    card2Title: 'Почему Разработчики Выбирают GB Coder',
    card2Sub: 'Скорость, надежность и полная приватность исходного кода.',
    card2Bullets: [
      'Полностью бесплатно без обязательных подписок.',
      'Никакой регистрации или авторизации для старта.',
      'Живой предпросмотр изменений по мере ввода.',
      'Приватность Local-First: код хранится только в вашем браузере.',
      'Экспорт и импорт ZIP с проверкой хэша SHA-256.',
      'Чистый интерфейс без рекламы для максимальной концентрации.',
    ],
    card3Title: 'Создано Разработчиками для Разработчиков',
    card3P1: 'GB Coder создан и поддерживается Girish Lade — программистом, разработчиком инструментов ИИ и UI/UX инженером из Мумбаи (Индия). Миссия проекта — сделать веб-разработку доступной в любом браузере без установки тяжелых локальных программ.',
    card3P2: 'Узнайте больше о других проектах на ladestack.in.',
    connectTitle: 'Связаться с Создателем',
    connectSub: 'Следите за обновлениями или делитесь обратной связью.',
    openEditorBtn: 'Открыть Редактор',
  },
  pt: {
    metaTitle: 'Sobre o GB Coder — Estúdio de Desenvolvimento no Navegador | LadeStack',
    metaDescription: 'GB Coder é um estúdio de código no navegador criado por Girish Lade: editor Monaco, pré-visualização ao vivo, WebContainer e armazenamento local.',
    heroTag: 'Estúdio de Desenvolvimento no Navegador',
    heroTitle: 'Programação Ágil e Moderna no Navegador',
    heroDescription: 'Escreva, teste e construa aplicações em HTML, CSS, JavaScript, React e Vue instantaneamente.',
    ctaBtn: 'Começar a Codificar',
    card1Title: 'Tudo o que Você Precisa para Construir na Web',
    card1Sub: 'Um estúdio completo rodando na memória do seu navegador.',
    card1Items: [
      {
        title: 'Escrever e Executar Código',
        desc: 'Edite HTML, CSS e JavaScript no editor Monaco com suporte a TypeScript.',
      },
      {
        title: 'Node.js e WebContainer',
        desc: 'Execute pacotes npm e servidores Vite diretamente na aba do navegador.',
      },
      {
        title: 'Pré-Visualização em Tempo Real',
        desc: 'Acompanhe mudanças no DOM instantaneamente com janela desacoplada.',
      },
      {
        title: 'Armazenamento Local-First',
        desc: 'Seu código permanece privado e seguro no seu dispositivo com IndexedDB.',
      },
    ],
    card2Title: 'Por Que Escolher o GB Coder',
    card2Sub: 'Desenvolvido para máxima velocidade, foco e soberania de dados.',
    card2Bullets: [
      'Gratuito para usar sem assinaturas obrigatórias.',
      'Sem formulários de cadastro ou login para começar.',
      'Pré-visualização atualizada enquanto você digita.',
      'Privacidade Local-First: o código fica no seu navegador.',
      'Exportação e importação ZIP com integridade SHA-256.',
      'Interface limpa, rápida e sem anúncios.',
    ],
    card3Title: 'Feito por Desenvolvedores, para Desenvolvedores',
    card3P1: 'O GB Coder é criado e mantido por Girish Lade, programador, criador de ferramentas de IA e engenheiro de UI/UX de Mumbai, Índia. A missão é tornar o desenvolvimento web acessível e direto em qualquer navegador moderno.',
    card3P2: 'Conheça mais projetos em ladestack.in.',
    connectTitle: 'Conectar com o Criador',
    connectSub: 'Acompanhe as novidades ou envie sugestões.',
    openEditorBtn: 'Abrir Editor',
  },
};

export function getAboutContent(lang: string): AboutTranslations {
  return ABOUT_TRANSLATIONS[lang] || ABOUT_TRANSLATIONS.en;
}
