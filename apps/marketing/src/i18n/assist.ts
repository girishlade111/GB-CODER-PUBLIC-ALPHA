const COPY = {
  en: {
    title: "A thinking partner, in your workspace.",
    description:
      "Ask a question, understand an error, or plan your next change with GB Assist. Connect your own provider and model.",
    note: "AI requires provider configuration. Selected code and prompts are sent to that provider.",
    review: "Review proposed file changes before applying them.",
    localNote:
      "Projects stay in your browser. Optional AI assistance uses your configured provider.",
    prompt: "Help me understand this component.",
    proposal: "Proposed change",
    reviewLabel: "Review before applying",
  },
  es: {
    title: "Un compañero para pensar, en tu espacio.",
    description:
      "Pregunta, entiende errores o planifica cambios con GB Assist. Conecta tu proveedor y modelo.",
    note: "La IA requiere configuración. El código seleccionado y los mensajes se envían al proveedor.",
    review: "Revisa los cambios propuestos antes de aplicarlos.",
    localNote:
      "Los proyectos se guardan en tu navegador. La IA opcional usa tu proveedor configurado.",
    prompt: "Ayúdame a entender este componente.",
    proposal: "Cambio propuesto",
    reviewLabel: "Revisar antes de aplicar",
  },
  nl: {
    title: "Een denkpartner in je werkruimte.",
    description:
      "Stel vragen, begrijp fouten of plan wijzigingen met GB Assist. Verbind je eigen provider en model.",
    note: "AI vereist configuratie. Geselecteerde code en prompts gaan naar die provider.",
    review: "Controleer voorgestelde wijzigingen voordat je ze toepast.",
    localNote:
      "Projecten blijven in je browser. Optionele AI gebruikt je ingestelde provider.",
    prompt: "Help me deze component begrijpen.",
    proposal: "Voorgestelde wijziging",
    reviewLabel: "Controleren vóór toepassen",
  },
  fr: {
    title: "Un partenaire de réflexion, dans votre espace.",
    description:
      "Posez une question, comprenez une erreur ou planifiez avec GB Assist. Connectez votre fournisseur et votre modèle.",
    note: "L’IA nécessite une configuration. Le code sélectionné et les requêtes sont envoyés au fournisseur.",
    review: "Examinez les modifications avant de les appliquer.",
    localNote:
      "Les projets restent dans votre navigateur. L’IA facultative utilise votre fournisseur configuré.",
    prompt: "Aide-moi à comprendre ce composant.",
    proposal: "Modification proposée",
    reviewLabel: "Examiner avant d’appliquer",
  },
  ja: {
    title: "ワークスペースに、考えるパートナーを。",
    description:
      "GB Assistで質問やエラーの理解、変更の計画を。自分のプロバイダーとモデルを接続できます。",
    note: "AIには設定が必要です。選択したコードと入力はプロバイダーに送信されます。",
    review: "提案された変更を確認してから適用できます。",
    localNote:
      "プロジェクトはブラウザーに保存。任意のAI支援は設定したプロバイダーを利用します。",
    prompt: "このコンポーネントを説明してください。",
    proposal: "変更の提案",
    reviewLabel: "適用前に確認",
  },
  ko: {
    title: "작업 공간 속 생각 파트너.",
    description:
      "GB Assist로 질문하고 오류를 이해하고 변경을 계획하세요. 원하는 제공업체와 모델을 연결하세요.",
    note: "AI는 설정이 필요합니다. 선택한 코드와 요청은 제공업체로 전송됩니다.",
    review: "제안된 변경 사항을 검토한 후 적용하세요.",
    localNote:
      "프로젝트는 브라우저에 저장됩니다. 선택적 AI는 설정한 제공업체를 사용합니다.",
    prompt: "이 컴포넌트를 설명해 주세요.",
    proposal: "제안된 변경",
    reviewLabel: "적용 전 검토",
  },
  zh: {
    title: "工作区里的思考伙伴。",
    description:
      "用 GB Assist 提问、理解错误或规划更改。连接你自己的提供商和模型。",
    note: "AI 需要配置。选定的代码和提示会发送给该提供商。",
    review: "应用前先检查建议的文件更改。",
    localNote: "项目保存在浏览器中。可选 AI 使用你配置的提供商。",
    prompt: "帮我理解这个组件。",
    proposal: "建议更改",
    reviewLabel: "应用前审查",
  },
  ru: {
    title: "Партнёр для размышлений в рабочем пространстве.",
    description:
      "Задавайте вопросы, разбирайте ошибки и планируйте с GB Assist. Подключите своего провайдера и модель.",
    note: "ИИ требует настройки. Выбранный код и запросы отправляются провайдеру.",
    review: "Проверяйте изменения файлов перед применением.",
    localNote:
      "Проекты остаются в браузере. Необязательный ИИ использует настроенного провайдера.",
    prompt: "Помоги понять этот компонент.",
    proposal: "Предложенное изменение",
    reviewLabel: "Проверить перед применением",
  },
  pt: {
    title: "Um parceiro para pensar, no teu espaço.",
    description:
      "Pergunta, compreende erros ou planeia alterações com GB Assist. Liga o teu fornecedor e modelo.",
    note: "A IA requer configuração. O código selecionado e os pedidos são enviados ao fornecedor.",
    review: "Revê as alterações propostas antes de as aplicar.",
    localNote:
      "Os projetos ficam no navegador. A IA opcional usa o fornecedor configurado.",
    prompt: "Ajuda-me a compreender este componente.",
    proposal: "Alteração proposta",
    reviewLabel: "Rever antes de aplicar",
  },
};
export const getAssistContent = (lang: string) =>
  COPY[lang as keyof typeof COPY] || COPY.en;
