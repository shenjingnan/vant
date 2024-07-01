import { withInstall } from '../utils';
import _VirtualListItem from './VirtualListItem';

export const VirtualListItem = withInstall(_VirtualListItem);
export default VirtualListItem;
// export { virtualListProps } from './VirtualList';
// export type { VirtualListProps };
// export type {
//   VirtualListInstance,
//   VirtualListDirection,
//   VirtualListThemeVars,
// } from './types';

declare module 'vue' {
  export interface GlobalComponents {
    VanVirtualListItem: typeof VirtualListItem;
  }
}
