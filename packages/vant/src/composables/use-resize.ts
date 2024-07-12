import { inBrowser } from '../utils';
import {Ref, onDeactivated, onBeforeUnmount, unref} from 'vue';
import { onMountedOrActivated } from '@vant/use';

// @Experimental
export function useResize(
  targetRef: Ref<HTMLElement | undefined>,
  onChange: (rect: { width: number; height: number }) => void,
) {

  // compatibility: https://caniuse.com/#feat=mutationobserver
  if (!inBrowser || !window.MutationObserver) {
    return;
  }

  let observer: MutationObserver | undefined;

  const observe = () => {
    const target = unref(targetRef) as HTMLElement;
    const observer = new MutationObserver(() => {
      onChange({
        width: target.offsetWidth,
        height: target.offsetHeight,
      });
    });
    if (target) {
      observer.observe(target, {
        childList: true,
        attributes: true,
        subtree: true,
      });
    }
  };

  const unobserve = () => {
    const target = unref(targetRef);
    if (target) {
      observer?.disconnect();
    }
  };

  onDeactivated(unobserve);
  onBeforeUnmount(unobserve);
  onMountedOrActivated(observe);
}
