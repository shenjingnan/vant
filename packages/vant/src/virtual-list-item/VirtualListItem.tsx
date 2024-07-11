import {ref, defineComponent, onMounted, nextTick, computed} from 'vue';

// Utils
import {createNamespace, getRootScrollTop, getScrollTop} from '../utils';
import { useExpose } from '../composables/use-expose';

import { VIRTUAL_LIST_KEY } from '../virtual-list/VirtualList';

// Composables
import {useParent, useRect} from '@vant/use';
import {useHeight} from "../composables/use-height";
import {useVisibilityChange} from "../composables/use-visibility-change";
import {vi} from "vitest";

const [name, bem] = createNamespace('virtual-list-item');

export default defineComponent({
  name,

  props: {
    index: Number,
  },

  setup(props, { slots }) {
    const root = ref();
    const { index } = props;
    const { parent, index: displayIndex } = useParent(VIRTUAL_LIST_KEY);
    const height = useHeight(root)

    if (!parent) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(
          '[Vant] <VirutalListItem> must be a child component of <VirtualList>.',
        );
      }
      return;
    }

    // watch(height, () => {
    //   const rect = useRect(root)
    //   console.log(rect)
    // })

    const getRect = (
      scrollParent: Window | Element,
      scrollParentRect: { top: number },
    ) => {
      const rect = { top: 0, height: 0 }
      const rootRect = useRect(root);
      rect.height = rootRect.height;

      if (scrollParent === window || scrollParent === document.body) {
        rect.top = rootRect.top + getRootScrollTop()
      } else {
        rect.top = rootRect.top + getScrollTop(scrollParent) - scrollParentRect.top
      }

      // console.log(rect)
      return rect;
    };

    useVisibilityChange(root, (visible: boolean) => {
      if (visible) {
        // parent.visibleItem(index);
      }
    })

    // const top = ref(0)

    // const style = computed(() => ({
    //   transform: `translate3d(0, ${top.value}px, 0)`,
    //   position: 'absolute',
    //   'will-change': 'transform',
    //   width: '100%',
    // }))

    onMounted(() => {
      nextTick(() => {
        parent.childReady(index, height.value);
        // top.value = parent.getTopByIndex(index);
      })
    });

    useExpose({ height, getRect });

    return () => {
      return <div ref={root} class={[bem()]}>{slots.default ? slots?.default() : null}</div>;
    };
  },
});
