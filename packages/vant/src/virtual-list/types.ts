import type { ComponentPublicInstance } from 'vue';
import type { VirtualListProps } from './VirtualList';

export type VirtualListDirection = 'up' | 'down';

export type VirtualListExpose = NonNullable<unknown>;

export type VirtualListInstance = ComponentPublicInstance<
  VirtualListProps,
  VirtualListExpose
>;

export type VirtualListThemeVars = {
  virtualListTextColor?: string;
  virtualListTextFontSize?: string;
  virtualListTextLineHeight?: number | string;
  virtualListLoadingIconSize?: string;
};
