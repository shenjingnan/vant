import {
  ref,
  computed,
  defineComponent,
  type SlotsType,
  type InjectionKey,
  type ExtractPropTypes,
} from 'vue';

// Utils
import { makeNumberProp, createNamespace } from '../utils';

const [name, bem] = createNamespace('virtual-list');

export const virtualListProps = {
  itemHeight: makeNumberProp(0),
};

export type VirtualListProps = ExtractPropTypes<typeof virtualListProps>;

export type VirtualListProvide = {
  props: VirtualListProps;
};

export const VIRTUAL_LIST_KEY: InjectionKey<VirtualListProps> = Symbol(name);

export default defineComponent({
  name,

  props: virtualListProps,

  slots: Object as SlotsType<{
    default: { start: number; end: number };
  }>,

  setup(props, { slots }) {
    const windowHeight = 500;
    const { itemHeight } = props;
    const visiableCount = windowHeight / itemHeight;
    const startOffset = ref(0);
    const hideIndex = computed(() => {
      return Math.floor(startOffset.value / itemHeight) - 1;
    });
    const paddingTop = computed(() => {
      return (hideIndex.value + 1) * itemHeight;
    });

    const style = computed(() => {
      return {
        transform: `translate3d(0, ${paddingTop.value}px, 0)`,
      };
    });

    const renderDefault = () => {
      const start = hideIndex.value + 1;
      const end = start + visiableCount + 1;
      return slots.default({ start, end });
    };

    const onScroll = (event: Event) => {
      const target = event.target as HTMLDivElement;
      startOffset.value = target.scrollTop;
    };

    return () => {
      return (
        <div role="feed" class={bem()} onScroll={onScroll}>
          <div style={style.value} class={bem('wrapper')}>
            {renderDefault()}
          </div>
        </div>
      );
    };
  },
});
