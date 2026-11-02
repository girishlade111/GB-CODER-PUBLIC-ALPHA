/**
 * GB Coder — Advanced IDE Workbench Types (Phase 2)
 *
 * Strict TypeScript models for dockable containers, view registration,
 * editor groups, layout presets, and user workbench settings.
 */

export type ContainerId =
  | 'primary_sidebar'
  | 'secondary_sidebar'
  | 'bottom_panel'
  | 'editor_group';

export type ViewId =
  | 'explorer'
  | 'search'
  | 'code-assist'
  | 'packages'
  | 'source-control'
  | 'preview'
  | 'terminal'
  | 'problems'
  | 'output'
  | 'ports';

export interface ViewDefinition {
  id: ViewId;
  title: string;
  iconName: string;
  allowedContainers: ContainerId[];
  defaultContainer: ContainerId;
  canClose?: boolean;
}

export type LayoutPresetId =
  | 'DEFAULT'
  | 'FOCUS'
  | 'PREVIEW_FOCUSED'
  | 'AI_WORKFLOW'
  | 'TERMINAL_FOCUSED';

export type EditorSplitDirection = 'vertical' | 'horizontal';

export interface EditorGroupState {
  id: string;
  openPaths: string[];
  activePath: string | null;
}

export interface EditorLayoutState {
  mode: 'single' | 'split';
  splitDirection: EditorSplitDirection;
  splitRatio: number; // percentage (e.g. 50)
  groups: [EditorGroupState, EditorGroupState?];
  activeGroupId: string;
}

export interface WorkbenchSettings {
  fontSize: number;
  lineHeight: number;
  wordWrap: boolean;
  minimap: boolean;
  tabSize: number;
  terminalFontSize: number;
  density: 'compact' | 'comfortable';
}

export type PrimarySidebarPosition = 'left' | 'right';
export type PanelAlignment = 'left' | 'right' | 'center' | 'justify';
export type QuickInputPosition = 'top' | 'center';

export interface WorkbenchModes {
  zenMode: boolean;
  centeredLayout: boolean;
}

export interface WorkbenchLayoutState {
  version: 2;
  primarySidebar: {
    visible: boolean;
    width: number;
    activeViewId: ViewId;
  };
  secondarySidebar: {
    visible: boolean;
    width: number;
    activeViewId: ViewId;
  };
  bottomPanel: {
    visible: boolean;
    height: number;
    activeViewId: ViewId;
    isMaximized: boolean;
  };
  viewLocations: Record<ViewId, ContainerId>;
  editorLayout: EditorLayoutState;
  currentPreset: LayoutPresetId;
  settings: WorkbenchSettings;

  // Customize Layout (Google Antigravity & VS Code parity)
  menuBar?: {
    visible: boolean;
  };
  activityBar?: {
    visible: boolean;
  };
  secondaryActivityBar?: {
    visible: boolean;
  };
  statusBar?: {
    visible: boolean;
  };
  primarySidebarPosition?: PrimarySidebarPosition;
  panelAlignment?: PanelAlignment;
  quickInputPosition?: QuickInputPosition;
  modes?: WorkbenchModes;
}
