import {ref, defineComponent, onMounted, nextTick, watch} from 'vue';

// Utils
import {createNamespace, getRootScrollTop, getScrollTop, makeNumberProp} from '../utils';
import { useExpose } from '../composables/use-expose';

import { VIRTUAL_LIST_KEY } from '../virtual-list/VirtualList';

// Composables
import {useParent, useRect} from '@vant/use';
import {useHeight} from "../composables/use-height";
import {useVisibilityChange} from "../composables/use-visibility-change";
import {useResize} from "../composables/use-resize";

const [name, bem] = createNamespace('virtual-list-item');

export default defineComponent({
  name,

  props: {
    index: makeNumberProp(-1),
    item: Object,
  },

  setup(props, { slots }) {
    const root = ref();
    const { item, index } = props;
    const { parent } = useParent(VIRTUAL_LIST_KEY);
    const height = useHeight(root)

    if (!parent) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(
          '[Vant] <VirutalListItem> must be a child component of <VirtualList>.',
        );
      }
      return;
    }

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

      return rect;
    };

    useVisibilityChange(root, (visible: boolean) => {
      if (visible) {
        // parent.visibleItem(index);
      }
    })

    watch(height, (newHeight) => {
      console.log('newHeight', newHeight)
    })

    useResize(root, ({ height  }) => {
      console.log('nemo resize item', height)
      parent.updateChildHeight(index, height);
    });

    onMounted(() => {
      nextTick(() => {
        parent.updateChildHeight(index, height?.value ?? 0);
      })
    });


    useExpose({ height, getRect });

    return () => {
      return <div ref={root} class={[bem()]}>{slots.default ? slots?.default({ item }) : null}</div>;
    };
  },
});
