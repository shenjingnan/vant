import { withInstall } from '../utils';
import _VirtualList, { VirtualListProps } from './VirtualList';

export const VirtualList = withInstall(_VirtualList);
export default VirtualList;
export { virtualListProps } from './VirtualList';
export type { VirtualListProps };
export type {
  VirtualListInstance,
  VirtualListDirection,
  VirtualListThemeVars,
} from './types';

declare module 'vue' {
  export interface GlobalComponents {
    VanVirtualList: typeof VirtualList;
  }
}
