import type {
  WorkbenchLayoutState,
  LayoutPresetId,
  ContainerId,
  ViewId,
  WorkbenchSettings,
  EditorGroupState,
} from './workbenchTypes.ts';
import { WORKBENCH_VIEWS, isViewAllowedInContainer } from './workbenchViewRegistry.ts';
import { readViewState } from '../vscodeWorkspaceStore.ts';

export const WORKBENCH_STORAGE_KEY = 'gb-coder-workbench-layout-v2';

export const DEFAULT_WORKBENCH_SETTINGS: WorkbenchSettings = {
  fontSize: 13,
  lineHeight: 20,
  wordWrap: false,
  minimap: true,
  tabSize: 2,
  terminalFontSize: 13,
  density: 'comfortable',
};

export const DEFAULT_VIEW_LOCATIONS: Record<ViewId, ContainerId> = {
  explorer: 'primary_sidebar',
  'code-assist': 'primary_sidebar',
  search: 'primary_sidebar',
  'source-control': 'primary_sidebar',
  packages: 'primary_sidebar',
  preview: 'secondary_sidebar',
  terminal: 'bottom_panel',
  problems: 'bottom_panel',
  output: 'bottom_panel',
  ports: 'bottom_panel',
};

export function createDefaultWorkbenchLayout(): WorkbenchLayoutState {
  // Check legacy view state for open tabs
  const legacyViewState = readViewState();
  const initialOpenPaths = legacyViewState.openPaths.length > 0 ? legacyViewState.openPaths : [];
  const initialActivePath = legacyViewState.activePath ?? initialOpenPaths[0] ?? null;

  return {
    version: 2,
    primarySidebar: {
      visible: true,
      width: 280,
      activeViewId: 'code-assist', // Default: GB Assist
    },
    secondarySidebar: {
      visible: true,
      width: 360,
      activeViewId: 'preview', // Default: Live Preview
    },
    bottomPanel: {
      visible: true,
      height: 240,
      activeViewId: 'terminal', // Default: Terminal
      isMaximized: false,
    },
    viewLocations: { ...DEFAULT_VIEW_LOCATIONS },
    editorLayout: {
      mode: 'single',
      splitDirection: 'vertical',
      splitRatio: 50,
      groups: [
        {
          id: 'group-1',
          openPaths: initialOpenPaths,
          activePath: initialActivePath,
        },
      ],
      activeGroupId: 'group-1',
    },
    currentPreset: 'DEFAULT',
    settings: { ...DEFAULT_WORKBENCH_SETTINGS },
    menuBar: { visible: true },
    activityBar: { visible: true },
    secondaryActivityBar: { visible: false },
    statusBar: { visible: true },
    primarySidebarPosition: 'left',
    panelAlignment: 'center',
    quickInputPosition: 'center',
    modes: {
      zenMode: false,
      centeredLayout: false,
    },
  };
}

export const WORKBENCH_PRESETS: Record<LayoutPresetId, (current: WorkbenchLayoutState) => WorkbenchLayoutState> = {
  DEFAULT: (current) => ({
    ...current,
    currentPreset: 'DEFAULT',
    primarySidebar: {
      ...current.primarySidebar,
      visible: true,
      width: 280,
      activeViewId: 'code-assist',
    },
    secondarySidebar: {
      ...current.secondarySidebar,
      visible: true,
      width: 360,
      activeViewId: 'preview',
    },
    bottomPanel: {
      ...current.bottomPanel,
      visible: true,
      height: 240,
      activeViewId: 'terminal',
      isMaximized: false,
    },
  }),
  FOCUS: (current) => ({
    ...current,
    currentPreset: 'FOCUS',
    primarySidebar: {
      ...current.primarySidebar,
      visible: false,
    },
    secondarySidebar: {
      ...current.secondarySidebar,
      visible: false,
    },
    bottomPanel: {
      ...current.bottomPanel,
      visible: false,
    },
  }),
  PREVIEW_FOCUSED: (current) => ({
    ...current,
    currentPreset: 'PREVIEW_FOCUSED',
    primarySidebar: {
      ...current.primarySidebar,
      visible: false,
    },
    secondarySidebar: {
      ...current.secondarySidebar,
      visible: true,
      width: 580,
      activeViewId: 'preview',
    },
    bottomPanel: {
      ...current.bottomPanel,
      visible: false,
    },
  }),
  AI_WORKFLOW: (current) => ({
    ...current,
    currentPreset: 'AI_WORKFLOW',
    primarySidebar: {
      ...current.primarySidebar,
      visible: true,
      width: 420,
      activeViewId: 'code-assist',
    },
    secondarySidebar: {
      ...current.secondarySidebar,
      visible: false,
    },
    bottomPanel: {
      ...current.bottomPanel,
      visible: false,
    },
  }),
  TERMINAL_FOCUSED: (current) => ({
    ...current,
    currentPreset: 'TERMINAL_FOCUSED',
    primarySidebar: {
      ...current.primarySidebar,
      visible: false,
    },
    secondarySidebar: {
      ...current.secondarySidebar,
      visible: false,
    },
    bottomPanel: {
      ...current.bottomPanel,
      visible: true,
      height: 440,
      activeViewId: 'terminal',
      isMaximized: false,
    },
  }),
};

export function loadWorkbenchLayout(): WorkbenchLayoutState {
  if (typeof window === 'undefined') {
    return createDefaultWorkbenchLayout();
  }

  try {
    const raw = window.localStorage.getItem(WORKBENCH_STORAGE_KEY);
    if (!raw) return createDefaultWorkbenchLayout();

    const parsed = JSON.parse(raw) as Partial<WorkbenchLayoutState>;
    if (parsed.version !== 2) {
      return createDefaultWorkbenchLayout();
    }

    const defaults = createDefaultWorkbenchLayout();

    // Reconcile view locations: ensure valid containers
    const viewLocations: Record<ViewId, ContainerId> = { ...defaults.viewLocations };
    if (parsed.viewLocations && typeof parsed.viewLocations === 'object') {
      for (const [key, container] of Object.entries(parsed.viewLocations)) {
        const viewId = key as ViewId;
        const targetContainer = container as ContainerId;
        if (WORKBENCH_VIEWS[viewId] && isViewAllowedInContainer(viewId, targetContainer)) {
          viewLocations[viewId] = targetContainer;
        }
      }
    }

    return {
      version: 2,
      primarySidebar: {
        visible: typeof parsed.primarySidebar?.visible === 'boolean' ? parsed.primarySidebar.visible : defaults.primarySidebar.visible,
        width: typeof parsed.primarySidebar?.width === 'number' && parsed.primarySidebar.width >= 180 && parsed.primarySidebar.width <= 600
          ? parsed.primarySidebar.width
          : defaults.primarySidebar.width,
        activeViewId: (parsed.primarySidebar?.activeViewId && WORKBENCH_VIEWS[parsed.primarySidebar.activeViewId])
          ? parsed.primarySidebar.activeViewId
          : defaults.primarySidebar.activeViewId,
      },
      secondarySidebar: {
        visible: typeof parsed.secondarySidebar?.visible === 'boolean' ? parsed.secondarySidebar.visible : defaults.secondarySidebar.visible,
        width: typeof parsed.secondarySidebar?.width === 'number' && parsed.secondarySidebar.width >= 220 && parsed.secondarySidebar.width <= 800
          ? parsed.secondarySidebar.width
          : defaults.secondarySidebar.width,
        activeViewId: (parsed.secondarySidebar?.activeViewId && WORKBENCH_VIEWS[parsed.secondarySidebar.activeViewId])
          ? parsed.secondarySidebar.activeViewId
          : defaults.secondarySidebar.activeViewId,
      },
      bottomPanel: {
        visible: typeof parsed.bottomPanel?.visible === 'boolean' ? parsed.bottomPanel.visible : defaults.bottomPanel.visible,
        height: typeof parsed.bottomPanel?.height === 'number' && parsed.bottomPanel.height >= 96 && parsed.bottomPanel.height <= 800
          ? parsed.bottomPanel.height
          : defaults.bottomPanel.height,
        activeViewId: (parsed.bottomPanel?.activeViewId && WORKBENCH_VIEWS[parsed.bottomPanel.activeViewId])
          ? parsed.bottomPanel.activeViewId
          : defaults.bottomPanel.activeViewId,
        isMaximized: Boolean(parsed.bottomPanel?.isMaximized),
      },
      viewLocations,
      editorLayout: {
        mode: parsed.editorLayout?.mode === 'split' ? 'split' : 'single',
        splitDirection: parsed.editorLayout?.splitDirection === 'horizontal' ? 'horizontal' : 'vertical',
        splitRatio: typeof parsed.editorLayout?.splitRatio === 'number' ? parsed.editorLayout.splitRatio : 50,
        groups: Array.isArray(parsed.editorLayout?.groups) && parsed.editorLayout!.groups.length > 0
          ? (parsed.editorLayout!.groups as [EditorGroupState, EditorGroupState?])
          : defaults.editorLayout.groups,
        activeGroupId: parsed.editorLayout?.activeGroupId ?? 'group-1',
      },
      currentPreset: (parsed.currentPreset && WORKBENCH_PRESETS[parsed.currentPreset])
        ? parsed.currentPreset
        : 'DEFAULT',
      settings: {
        ...DEFAULT_WORKBENCH_SETTINGS,
        ...(parsed.settings || {}),
      },
      menuBar: {
        visible: typeof parsed.menuBar?.visible === 'boolean' ? parsed.menuBar.visible : true,
      },
      activityBar: {
        visible: typeof parsed.activityBar?.visible === 'boolean' ? parsed.activityBar.visible : true,
      },
      secondaryActivityBar: {
        visible: typeof parsed.secondaryActivityBar?.visible === 'boolean' ? parsed.secondaryActivityBar.visible : false,
      },
      statusBar: {
        visible: typeof parsed.statusBar?.visible === 'boolean' ? parsed.statusBar.visible : true,
      },
      primarySidebarPosition: parsed.primarySidebarPosition === 'right' ? 'right' : 'left',
      panelAlignment: ['left', 'right', 'center', 'justify'].includes(parsed.panelAlignment) ? parsed.panelAlignment : 'center',
      quickInputPosition: parsed.quickInputPosition === 'top' ? 'top' : 'center',
      modes: {
        zenMode: Boolean(parsed.modes?.zenMode),
        centeredLayout: Boolean(parsed.modes?.centeredLayout),
      },
    };
  } catch (error) {
    console.warn('[Workbench] Failed to load persisted workbench layout, falling back to default:', error);
    return createDefaultWorkbenchLayout();
  }
}

export function saveWorkbenchLayout(state: WorkbenchLayoutState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(WORKBENCH_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('[Workbench] Failed to persist workbench layout:', error);
  }
}
