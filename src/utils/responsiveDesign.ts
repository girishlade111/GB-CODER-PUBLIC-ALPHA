// Responsive Design Utilities for Console
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type Orientation = 'portrait' | 'landscape';
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface ResponsiveConfig {
  breakpoint: Breakpoint;
  width: number;
  height: number;
  orientation: Orientation;
  deviceType: DeviceType;
  isTouchDevice: boolean;
  pixelRatio: number;
}

export interface ResponsiveStyles {
  fontSize: number;
  lineHeight: number;
  padding: number;
  maxHeight: string;
  columns: number;
  showSidebar: boolean;
  compactMode: boolean;
}

// Breakpoint definitions (Tailwind-like)
const BREAKPOINTS: Record<Breakpoint, number> = {
  'xs': 0,
  'sm': 640,
  'md': 768,
  'lg': 1024,
  'xl': 1280,
  '2xl': 1536,
};

export class ResponsiveDesignService {
  private currentConfig: ResponsiveConfig;
  private listeners: Set<(config: ResponsiveConfig) => void> = new Set();
  private resizeObserver?: ResizeObserver;
  private mediaQueryLists: Map<Breakpoint, MediaQueryList> = new Map();

  constructor() {
    this.currentConfig = this.detectConfiguration();
    this.setupListeners();
  }

  /**
   * Detect current configuration
   */
  private detectConfiguration(): ResponsiveConfig {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const breakpoint = this.getBreakpoint(width);
    const orientation = width > height ? 'landscape' : 'portrait';
    const deviceType = this.detectDeviceType(width);
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const pixelRatio = window.devicePixelRatio || 1;

    return {
      breakpoint,
      width,
      height,
      orientation,
      deviceType,
      isTouchDevice,
      pixelRatio,
    };
  }

  /**
   * Get breakpoint from width
   */
  private getBreakpoint(width: number): Breakpoint {
    if (width >= BREAKPOINTS['2xl']) return '2xl';
    if (width >= BREAKPOINTS.xl) return 'xl';
    if (width >= BREAKPOINTS.lg) return 'lg';
    if (width >= BREAKPOINTS.md) return 'md';
    if (width >= BREAKPOINTS.sm) return 'sm';
    return 'xs';
  }

  /**
   * Detect device type
   */
  private detectDeviceType(width: number): DeviceType {
    if (width < BREAKPOINTS.md) return 'mobile';
    if (width < BREAKPOINTS.lg) return 'tablet';
    return 'desktop';
  }

  /**
   * Setup event listeners
   */
  private setupListeners(): void {
    // Window resize
    window.addEventListener('resize', this.handleResize.bind(this));

    // Orientation change
    window.addEventListener('orientationchange', this.handleOrientationChange.bind(this));

    // Media query listeners
    for (const [breakpoint, minWidth] of Object.entries(BREAKPOINTS)) {
      const mql = window.matchMedia(`(min-width: ${minWidth}px)`);
      this.mediaQueryLists.set(breakpoint as Breakpoint, mql);
      mql.addEventListener('change', this.handleMediaQueryChange.bind(this));
    }
  }

  /**
   * Handle resize
   */
  private handleResize(): void {
    const newConfig = this.detectConfiguration();
    
    if (this.hasConfigChanged(newConfig)) {
      this.currentConfig = newConfig;
      this.notifyListeners();
    }
  }

  /**
   * Handle orientation change
   */
  private handleOrientationChange(): void {
    setTimeout(() => {
      this.handleResize();
    }, 100);
  }

  /**
   * Handle media query change
   */
  private handleMediaQueryChange(): void {
    this.handleResize();
  }

  /**
   * Check if config changed
   */
  private hasConfigChanged(newConfig: ResponsiveConfig): boolean {
    return (
      newConfig.breakpoint !== this.currentConfig.breakpoint ||
      newConfig.orientation !== this.currentConfig.orientation ||
      newConfig.deviceType !== this.currentConfig.deviceType
    );
  }

  /**
   * Get current configuration
   */
  getConfig(): ResponsiveConfig {
    return { ...this.currentConfig };
  }

  /**
   * Get responsive styles
   */
  getResponsiveStyles(): ResponsiveStyles {
    const { breakpoint, deviceType, orientation } = this.currentConfig;

    // Base styles
    let styles: ResponsiveStyles = {
      fontSize: 14,
      lineHeight: 1.5,
      padding: 16,
      maxHeight: '400px',
      columns: 1,
      showSidebar: true,
      compactMode: false,
    };

    // Adjust for device type
    switch (deviceType) {
      case 'mobile':
        styles = {
          fontSize: 12,
          lineHeight: 1.4,
          padding: 8,
          maxHeight: '300px',
          columns: 1,
          showSidebar: false,
          compactMode: true,
        };
        break;

      case 'tablet':
        styles = {
          fontSize: 13,
          lineHeight: 1.45,
          padding: 12,
          maxHeight: '350px',
          columns: orientation === 'landscape' ? 2 : 1,
          showSidebar: orientation === 'landscape',
          compactMode: false,
        };
        break;

      case 'desktop':
        styles = {
          fontSize: 14,
          lineHeight: 1.5,
          padding: 16,
          maxHeight: '500px',
          columns: 2,
          showSidebar: true,
          compactMode: false,
        };
        break;
    }

    // Adjust for specific breakpoints
    if (breakpoint === 'xs') {
      styles.fontSize = Math.max(styles.fontSize - 2, 10);
      styles.padding = Math.max(styles.padding - 4, 4);
    } else if (breakpoint === '2xl') {
      styles.fontSize += 2;
      styles.padding += 4;
      styles.maxHeight = '600px';
    }

    return styles;
  }

  /**
   * Check if matches breakpoint
   */
  matches(breakpoint: Breakpoint): boolean {
    return this.currentConfig.width >= BREAKPOINTS[breakpoint];
  }

  /**
   * Check if mobile
   */
  isMobile(): boolean {
    return this.currentConfig.deviceType === 'mobile';
  }

  /**
   * Check if tablet
   */
  isTablet(): boolean {
    return this.currentConfig.deviceType === 'tablet';
  }

  /**
   * Check if desktop
   */
  isDesktop(): boolean {
    return this.currentConfig.deviceType === 'desktop';
  }

  /**
   * Check if touch device
   */
  isTouchDevice(): boolean {
    return this.currentConfig.isTouchDevice;
  }

  /**
   * Check if portrait
   */
  isPortrait(): boolean {
    return this.currentConfig.orientation === 'portrait';
  }

  /**
   * Check if landscape
   */
  isLandscape(): boolean {
    return this.currentConfig.orientation === 'landscape';
  }

  /**
   * Get CSS classes for current config
   */
  getResponsiveClasses(): string[] {
    const classes: string[] = [];
    const { breakpoint, deviceType, orientation, isTouchDevice } = this.currentConfig;

    classes.push(`breakpoint-${breakpoint}`);
    classes.push(`device-${deviceType}`);
    classes.push(`orientation-${orientation}`);
    
    if (isTouchDevice) {
      classes.push('touch-device');
    }

    return classes;
  }

  /**
   * Get container styles
   */
  getContainerStyles(): React.CSSProperties {
    const styles = this.getResponsiveStyles();

    return {
      fontSize: `${styles.fontSize}px`,
      lineHeight: styles.lineHeight,
      padding: `${styles.padding}px`,
      maxHeight: styles.maxHeight,
    };
  }

  /**
   * Get grid columns
   */
  getGridColumns(): number {
    return this.getResponsiveStyles().columns;
  }

  /**
   * Should show sidebar
   */
  shouldShowSidebar(): boolean {
    return this.getResponsiveStyles().showSidebar;
  }

  /**
   * Is compact mode
   */
  isCompactMode(): boolean {
    return this.getResponsiveStyles().compactMode;
  }

  /**
   * Get optimal font size
   */
  getOptimalFontSize(baseSize: number = 14): number {
    const { deviceType, pixelRatio } = this.currentConfig;

    let size = baseSize;

    // Adjust for device type
    if (deviceType === 'mobile') {
      size = baseSize * 0.85;
    } else if (deviceType === 'tablet') {
      size = baseSize * 0.95;
    }

    // Adjust for pixel ratio
    if (pixelRatio > 2) {
      size *= 1.1;
    }

    return Math.round(size);
  }

  /**
   * Get optimal line height
   */
  getOptimalLineHeight(): number {
    const { deviceType } = this.currentConfig;

    switch (deviceType) {
      case 'mobile':
        return 1.4;
      case 'tablet':
        return 1.45;
      default:
        return 1.5;
    }
  }

  /**
   * Get optimal padding
   */
  getOptimalPadding(basePadding: number = 16): number {
    const { deviceType } = this.currentConfig;

    switch (deviceType) {
      case 'mobile':
        return Math.max(basePadding * 0.5, 8);
      case 'tablet':
        return basePadding * 0.75;
      default:
        return basePadding;
    }
  }

  /**
   * Subscribe to config changes
   */
  subscribe(callback: (config: ResponsiveConfig) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify listeners
   */
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.currentConfig);
    }
  }

  /**
   * Get media query string
   */
  getMediaQuery(breakpoint: Breakpoint): string {
    return `(min-width: ${BREAKPOINTS[breakpoint]}px)`;
  }

  /**
   * Create responsive value
   */
  createResponsiveValue<T>(values: Partial<Record<Breakpoint, T>>, defaultValue: T): T {
    
    // Check from largest to smallest
    const breakpointOrder: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
    
    for (const bp of breakpointOrder) {
      if (this.matches(bp) && values[bp] !== undefined) {
        return values[bp]!;
      }
    }

    return defaultValue;
  }

  /**
   * Get viewport info
   */
  getViewportInfo(): {
    width: number;
    height: number;
    availableWidth: number;
    availableHeight: number;
    aspectRatio: number;
  } {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      availableWidth: window.screen.availWidth,
      availableHeight: window.screen.availHeight,
      aspectRatio: window.innerWidth / window.innerHeight,
    };
  }

  /**
   * Cleanup
   */
  destroy(): void {
    window.removeEventListener('resize', this.handleResize.bind(this));
    window.removeEventListener('orientationchange', this.handleOrientationChange.bind(this));

    for (const mql of this.mediaQueryLists.values()) {
      mql.removeEventListener('change', this.handleMediaQueryChange.bind(this));
    }

    this.listeners.clear();
  }
}

// Export singleton instance
export const responsiveDesignService = new ResponsiveDesignService();

// Export utility functions
export const useResponsive = () => {
  return {
    config: responsiveDesignService.getConfig(),
    styles: responsiveDesignService.getResponsiveStyles(),
    isMobile: responsiveDesignService.isMobile(),
    isTablet: responsiveDesignService.isTablet(),
    isDesktop: responsiveDesignService.isDesktop(),
    isTouchDevice: responsiveDesignService.isTouchDevice(),
    isPortrait: responsiveDesignService.isPortrait(),
    isLandscape: responsiveDesignService.isLandscape(),
    matches: (bp: Breakpoint) => responsiveDesignService.matches(bp),
  };
};
