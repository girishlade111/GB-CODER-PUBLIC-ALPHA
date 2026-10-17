import type { ViewDefinition, ViewId, ContainerId } from './workbenchTypes.ts';

export const WORKBENCH_VIEWS: Record<ViewId, ViewDefinition> = {
  explorer: {
    id: 'explorer',
    title: 'Explorer',
    iconName: 'Files',
    allowedContainers: ['primary_sidebar', 'secondary_sidebar'],
    defaultContainer: 'primary_sidebar',
  },
  'code-assist': {
    id: 'code-assist',
    title: 'GB Assist',
    iconName: 'Sparkles',
    allowedContainers: ['primary_sidebar', 'secondary_sidebar'],
    defaultContainer: 'primary_sidebar',
  },
  search: {
    id: 'search',
    title: 'Search',
    iconName: 'Search',
    allowedContainers: ['primary_sidebar', 'secondary_sidebar'],
    defaultContainer: 'primary_sidebar',
  },
  'source-control': {
    id: 'source-control',
    title: 'Source Control',
    iconName: 'GitBranch',
    allowedContainers: ['primary_sidebar', 'secondary_sidebar'],
    defaultContainer: 'primary_sidebar',
  },
  packages: {
    id: 'packages',
    title: 'Packages',
    iconName: 'Package',
    allowedContainers: ['primary_sidebar', 'secondary_sidebar'],
    defaultContainer: 'primary_sidebar',
  },
  preview: {
    id: 'preview',
    title: 'Live Preview',
    iconName: 'PlayCircle',
    allowedContainers: ['secondary_sidebar', 'primary_sidebar', 'editor_group'],
    defaultContainer: 'secondary_sidebar',
  },
  terminal: {
    id: 'terminal',
    title: 'Terminal',
    iconName: 'TerminalSquare',
    allowedContainers: ['bottom_panel', 'primary_sidebar', 'secondary_sidebar'],
    defaultContainer: 'bottom_panel',
  },
  problems: {
    id: 'problems',
    title: 'Problems',
    iconName: 'AlertTriangle',
    allowedContainers: ['bottom_panel', 'primary_sidebar', 'secondary_sidebar'],
    defaultContainer: 'bottom_panel',
  },
  output: {
    id: 'output',
    title: 'Output',
    iconName: 'FileText',
    allowedContainers: ['bottom_panel', 'primary_sidebar', 'secondary_sidebar'],
    defaultContainer: 'bottom_panel',
  },
  ports: {
    id: 'ports',
    title: 'Ports',
    iconName: 'Radio',
    allowedContainers: ['bottom_panel', 'primary_sidebar', 'secondary_sidebar'],
    defaultContainer: 'bottom_panel',
  },
};

export function getViewDefinition(viewId: ViewId): ViewDefinition {
  return WORKBENCH_VIEWS[viewId] || WORKBENCH_VIEWS.explorer;
}

export function isViewAllowedInContainer(viewId: ViewId, containerId: ContainerId): boolean {
  const def = WORKBENCH_VIEWS[viewId];
  if (!def) return false;
  return def.allowedContainers.includes(containerId);
}

export function getViewsForContainer(
  containerId: ContainerId,
  viewLocations: Record<ViewId, ContainerId>
): ViewId[] {
  return (Object.keys(viewLocations) as ViewId[]).filter(
    (viewId) => viewLocations[viewId] === containerId
  );
}
