// Chrome strings for the marketing interface layer: labels that belong to the
// product chrome rather than to product copy. Kept beside the other nine
// language modules so every localized surface stays in sync.
export interface UiTranslations {
  envLabel: string;
  envStatic: string;
  envContainer: string;
  explorerLabel: string;
  palettePlaceholder: string;
  marqueeLabel: string;
  insideStudio: string;
  insideStudioSub: string;
  featuredArticle: string;
  filterAll: string;
  groupLabel: string;
  groupEditor: string;
  groupEditorSub: string;
  groupRuntime: string;
  groupRuntimeSub: string;
  groupFramework: string;
  groupFrameworkSub: string;
  groupData: string;
  groupDataSub: string;
  allCapabilities: string;
  assistEyebrow: string;
  copy: string;
  copied: string;
}

export const UI_TRANSLATIONS: Record<string, UiTranslations> = {
  en: {
    envLabel: 'Editing environment',
    envStatic: 'Static Editor',
    envContainer: 'WebContainer IDE',
    explorerLabel: 'Explorer',
    palettePlaceholder: 'Search files, commands, docs',
    marqueeLabel: 'Built on',
    insideStudio: 'Inside the studio.',
    insideStudioSub:
      'The workspace you actually work in: a project tree, one keystroke to anything, and a preview that stays in step with your source.',
    featuredArticle: 'Featured guide',
    filterAll: 'All',
    groupLabel: 'Capability group',
    groupEditor: 'Editor & language services',
    groupEditorSub: 'The editing surface and the engines that understand your code.',
    groupRuntime: 'Runtime & terminal',
    groupRuntimeSub: 'Real processes, executed inside the browser tab.',
    groupFramework: 'Frameworks & workflows',
    groupFrameworkSub: 'Starters, templates and the loop from blank file to running app.',
    groupData: 'Storage, portability & privacy',
    groupDataSub: 'Where your work lives, and how it leaves and returns.',
    allCapabilities: 'Every capability, end to end',
    assistEyebrow: 'Built-in AI assistant',
    copy: 'Copy',
    copied: 'Copied',
  },
  es: {
    envLabel: 'Entorno de edición',
    envStatic: 'Editor estático',
    envContainer: 'IDE WebContainer',
    explorerLabel: 'Explorador',
    palettePlaceholder: 'Busca archivos, comandos, documentación',
    marqueeLabel: 'Construido con',
    insideStudio: 'Dentro del estudio.',
    insideStudioSub:
      'El espacio de trabajo real: un árbol de proyecto, una tecla para llegar a cualquier cosa y una vista previa que sigue al código.',
    featuredArticle: 'Guía destacada',
    filterAll: 'Todos',
    groupLabel: 'Grupo de capacidades',
    groupEditor: 'Editor y servicios de lenguaje',
    groupEditorSub: 'La superficie de edición y los motores que entienden tu código.',
    groupRuntime: 'Entorno de ejecución y terminal',
    groupRuntimeSub: 'Procesos reales ejecutados dentro de la pestaña del navegador.',
    groupFramework: 'Frameworks y flujos de trabajo',
    groupFrameworkSub: 'Plantillas, starters y el camino del archivo vacío a la app en marcha.',
    groupData: 'Almacenamiento, portabilidad y privacidad',
    groupDataSub: 'Dónde vive tu trabajo y cómo sale y vuelve.',
    allCapabilities: 'Todas las capacidades, de principio a fin',
    assistEyebrow: 'Asistente de IA integrado',
    copy: 'Copiar',
    copied: 'Copiado',
  },
  nl: {
    envLabel: 'Bewerkomgeving',
    envStatic: 'Statische editor',
    envContainer: 'WebContainer IDE',
    explorerLabel: 'Verkenner',
    palettePlaceholder: 'Zoek bestanden, commando’s, documentatie',
    marqueeLabel: 'Gebouwd op',
    insideStudio: 'Binnen de studio.',
    insideStudioSub:
      'De werksplek waar je echt in werkt: een projectboom, één toetscombinatie naar alles, en een preview die met je broncode meebeweegt.',
    featuredArticle: 'Uitgelichte gids',
    filterAll: 'Alles',
    groupLabel: 'Capabiliteitsgroep',
    groupEditor: 'Editor en taaldiensten',
    groupEditorSub: 'Het bewerkingsvlak en de motoren die je code begrijpen.',
    groupRuntime: 'Runtime en terminal',
    groupRuntimeSub: 'Echte processen, uitgevoerd in het browsertabblad.',
    groupFramework: 'Frameworks en workflows',
    groupFrameworkSub: 'Starters, sjablonen en de weg van leeg bestand naar werkende app.',
    groupData: 'Opslag, draagbaarheid en privacy',
    groupDataSub: 'Waar je werk woont, en hoe het vertrekt en terugkomt.',
    allCapabilities: 'Alle mogelijkheden, van begin tot eind',
    assistEyebrow: 'Ingebouwde AI-assistent',
    copy: 'Kopiëren',
    copied: 'Gekopieerd',
  },
  fr: {
    envLabel: 'Environnement d’édition',
    envStatic: 'Éditeur statique',
    envContainer: 'IDE WebContainer',
    explorerLabel: 'Explorateur',
    palettePlaceholder: 'Rechercher fichiers, commandes, documentation',
    marqueeLabel: 'Propulsé par',
    insideStudio: 'Dans le studio.',
    insideStudioSub:
      'L’espace de travail où vous travaillez vraiment : une arborescence de projet, un raccourci vers tout, et un aperçu qui suit votre source.',
    featuredArticle: 'Guide à la une',
    filterAll: 'Tous',
    groupLabel: 'Groupe de capacités',
    groupEditor: 'Éditeur et services linguistiques',
    groupEditorSub: 'La surface d’édition et les moteurs qui comprennent votre code.',
    groupRuntime: 'Exécution et terminal',
    groupRuntimeSub: 'De vrais processus, exécutés dans l’onglet du navigateur.',
    groupFramework: 'Frameworks et flux de travail',
    groupFrameworkSub: 'Starters, modèles et le chemin du fichier vide vers l’application.',
    groupData: 'Stockage, portabilité et confidentialité',
    groupDataSub: 'Où vit votre travail, et comment il part et revient.',
    allCapabilities: 'Toutes les capacités, de bout en bout',
    assistEyebrow: 'Assistant IA intégré',
    copy: 'Copier',
    copied: 'Copié',
  },
  ja: {
    envLabel: '編集環境',
    envStatic: '静的エディタ',
    envContainer: 'WebContainer IDE',
    explorerLabel: 'エクスプローラー',
    palettePlaceholder: 'ファイル・コマンド・ドキュメントを検索',
    marqueeLabel: '採用技術',
    insideStudio: 'スタジオの中身。',
    insideStudioSub:
      '実際に作業するワークスペース。プロジェクトツリー、ワンキー操作の検索、ソースと常に同期するプレビュー。',
    featuredArticle: '注目のガイド',
    filterAll: 'すべて',
    groupLabel: '機能グループ',
    groupEditor: 'エディタと言語サービス',
    groupEditorSub: '編集画面と、コードを理解するエンジン。',
    groupRuntime: 'ランタイムとターミナル',
    groupRuntimeSub: 'ブラウザタブ内で実行される本物のプロセス。',
    groupFramework: 'フレームワークとワークフロー',
    groupFrameworkSub: 'スターター、テンプレート、そして空のファイルから動くアプリまで。',
    groupData: '保存・移植・プライバシー',
    groupDataSub: '作業の保管場所と、出し入れの方法。',
    allCapabilities: 'すべての機能を、最初から最後まで',
    assistEyebrow: '組み込みAIアシスタント',
    copy: 'コピー',
    copied: 'コピーしました',
  },
  ko: {
    envLabel: '편집 환경',
    envStatic: '정적 에디터',
    envContainer: 'WebContainer IDE',
    explorerLabel: '탐색기',
    palettePlaceholder: '파일, 명령, 문서 검색',
    marqueeLabel: '구성 기술',
    insideStudio: '스튜디오 내부.',
    insideStudioSub:
      '실제로 일하는 작업 공간. 프로젝트 트리, 한 번의 입력으로 찾는 검색, 그리고 소스와 함께 움직이는 미리보기.',
    featuredArticle: '주요 가이드',
    filterAll: '전체',
    groupLabel: '기능 그룹',
    groupEditor: '에디터와 언어 서비스',
    groupEditorSub: '편집 화면과 코드를 이해하는 엔진.',
    groupRuntime: '런타임과 터미널',
    groupRuntimeSub: '브라우저 탭 안에서 실행되는 실제 프로세스.',
    groupFramework: '프레임워크와 워크플로',
    groupFrameworkSub: '스타터와 템플릿, 빈 파일에서 동작하는 앱까지의 흐름.',
    groupData: '저장, 이동, 개인정보',
    groupDataSub: '작업이 보관되는 곳과 그것이 나가고 돌아오는 방식.',
    allCapabilities: '처음부터 끝까지 모든 기능',
    assistEyebrow: '내장 AI 어시스턴트',
    copy: '복사',
    copied: '복사됨',
  },
  zh: {
    envLabel: '编辑环境',
    envStatic: '静态编辑器',
    envContainer: 'WebContainer IDE',
    explorerLabel: '资源管理器',
    palettePlaceholder: '搜索文件、命令与文档',
    marqueeLabel: '基于',
    insideStudio: '工作室内部。',
    insideStudioSub:
      '真正的工作空间：项目文件树、一次按键即可搜索，以及与源码同步的实时预览。',
    featuredArticle: '精选指南',
    filterAll: '全部',
    groupLabel: '能力分组',
    groupEditor: '编辑器与语言服务',
    groupEditorSub: '编辑界面，以及理解你代码的引擎。',
    groupRuntime: '运行时与终端',
    groupRuntimeSub: '在浏览器标签页内运行的真实进程。',
    groupFramework: '框架与工作流',
    groupFrameworkSub: '模板、脚手架，以及从空文件到可运行应用的完整路径。',
    groupData: '存储、迁移与隐私',
    groupDataSub: '你的工作存放在哪里，以及如何导出与恢复。',
    allCapabilities: '端到端的全部能力',
    assistEyebrow: '内置 AI 助手',
    copy: '复制',
    copied: '已复制',
  },
  ru: {
    envLabel: 'Среда редактирования',
    envStatic: 'Статический редактор',
    envContainer: 'IDE WebContainer',
    explorerLabel: 'Проводник',
    palettePlaceholder: 'Поиск файлов, команд, документации',
    marqueeLabel: 'Работает на',
    insideStudio: 'Внутри студии.',
    insideStudioSub:
      'Рабочее пространство, где вы действительно работаете: дерево проекта, один ярлык — и всё найдено, а предпросмотр идёт в ногу с исходниками.',
    featuredArticle: 'Избранное руководство',
    filterAll: 'Все',
    groupLabel: 'Группа возможностей',
    groupEditor: 'Редактор и языковые сервисы',
    groupEditorSub: 'Рабочая поверхность и движки, понимающие ваш код.',
    groupRuntime: 'Среда выполнения и терминал',
    groupRuntimeSub: 'Настоящие процессы, выполняемые во вкладке браузера.',
    groupFramework: 'Фреймворки и сценарии',
    groupFrameworkSub: 'Стартеры, шаблоны и путь от пустого файла к работающему приложению.',
    groupData: 'Хранение, переносимость и приватность',
    groupDataSub: 'Где живёт ваша работа и как она выходит и возвращается.',
    allCapabilities: 'Все возможности, от начала до конца',
    assistEyebrow: 'Встроенный ИИ-ассистент',
    copy: 'Копировать',
    copied: 'Скопировано',
  },
  pt: {
    envLabel: 'Ambiente de edição',
    envStatic: 'Editor estático',
    envContainer: 'IDE WebContainer',
    explorerLabel: 'Explorador',
    palettePlaceholder: 'Buscar arquivos, comandos, documentação',
    marqueeLabel: 'Construído com',
    insideStudio: 'Dentro do estúdio.',
    insideStudioSub:
      'O espaço de trabalho onde você realmente trabalha: uma árvore de projeto, um atalho para tudo e uma pré-visualização que acompanha o código.',
    featuredArticle: 'Guia em destaque',
    filterAll: 'Todos',
    groupLabel: 'Grupo de capacidades',
    groupEditor: 'Editor e serviços de linguagem',
    groupEditorSub: 'A superfície de edição e os motores que entendem o seu código.',
    groupRuntime: 'Runtime e terminal',
    groupRuntimeSub: 'Processos reais executados dentro da aba do navegador.',
    groupFramework: 'Frameworks e fluxos de trabalho',
    groupFrameworkSub: 'Starters, modelos e o caminho do arquivo vazio até o app funcionando.',
    groupData: 'Armazenamento, portabilidade e privacidade',
    groupDataSub: 'Onde o seu trabalho vive e como ele sai e volta.',
    allCapabilities: 'Todas as capacidades, de ponta a ponta',
    assistEyebrow: 'Assistente de IA integrado',
    copy: 'Copiar',
    copied: 'Copiado',
  },
};

export function getUi(lang: string): UiTranslations {
  return UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.en;
}
