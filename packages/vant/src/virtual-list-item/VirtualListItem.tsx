import { watch, ref, defineComponent } from 'vue';

// Utils
import {createNamespace, getRootScrollTop, getScrollTop} from '../utils';
import { useExpose } from '../composables/use-expose';

import { VIRTUAL_LIST_KEY } from '../virtual-list/VirtualList';

// Composables
import {useParent, useRect} from '@vant/use';
import {useHeight} from "../composables/use-height";

const [name, bem] = createNamespace('virtual-list-item');

export default defineComponent({
  name,

  setup(_, { slots }) {
    const root = ref();
    const { parent, index } = useParent(VIRTUAL_LIST_KEY);
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

    const onscroll = () => {
      console.log('nemo onscroll')
    }

    useExpose({ height, getRect });

    return () => {
      return <div ref={root} class={[bem()]}>{slots.default ? slots?.default() : null}</div>;
    };
  },
});
