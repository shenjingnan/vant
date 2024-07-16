import {
  ref,
  computed,
  defineComponent,
  type SlotsType,
  type InjectionKey,
  type ExtractPropTypes, watch, nextTick, cloneVNode,
} from 'vue';

// Utils
import {doubleRaf, useChildren, useRect} from '@vant/use';
import {makeNumberProp, createNamespace, getScrollTop, makeArrayProp} from '../utils';
import {useExpose} from "../composables/use-expose";
import {throttle} from '../lazyload/vue-lazyload/util';

const [name, bem] = createNamespace('virtual-list');

export const virtualListProps = {
  itemHeight: makeNumberProp(0),
  buffer: makeNumberProp(10),
  list: makeArrayProp<unknown>(),
};

export type VirtualListProps = ExtractPropTypes<typeof virtualListProps>;

export type VirtualListProvide = {
  props: VirtualListProps;
};

export const VIRTUAL_LIST_KEY: InjectionKey<VirtualListProvide> = Symbol(name);

export default defineComponent({
  name,

  props: virtualListProps,

  slots: Object as SlotsType<{
    default: { item: any, index: number };
  }>,

  setup(props, {slots}) {
    const {buffer, list, itemHeight} = props;
    const root = ref<Element>();
    const {linkChildren, children} = useChildren(VIRTUAL_LIST_KEY);

    const gap = 6 + buffer;
    const start = ref(0)
    const end = ref(gap);

    // TODO: 上拉加载更多
    // 判断当前底部是否还有剩余buffer

    const heights = ref<number[]>([])
    const top = ref(0)

    const findIndex = (heights: number[], matchHeight: number) => {
      let prevHeight = 0;
      const index = heights.findIndex((height) => {
        if (prevHeight + height > matchHeight) {
          return true;
        }
        prevHeight += height;
        return false;
      });
      return {
        index,
        prevHeight,
      }
    }
    const onScroll = (event: Event) => {
      const target = event.target as HTMLDivElement;
      const scrollTop = target.scrollTop > 0 ? target.scrollTop : 0;

      const matched = findIndex(heights.value, scrollTop);
      const _start = matched.index;
      start.value = _start;
      top.value = matched.prevHeight;
      end.value = _start + gap;
    }

    const childReady = (index: number, height: number) => {
      heights.value[index] = height;
    }

    linkChildren({ childReady });

    const style = computed(() => {
      return {
        minHeight: `${list.length * itemHeight}px`,
      }
    })

    const style2 = computed(() => {
      return {
        transform: `translate3d(0, ${top.value}px, 0)`,
      }
    })

    return () => {
      return (
        <div role="feed" class={bem()} ref={root} onScroll={onScroll}>
          <div style={style.value}>
            <div style={style2.value}>
              {{
                default: () => {
                  return list.slice(start.value, end.value)
                    .map((item: any, index) => {
                      const vnode = slots.default({ item, index });
                      return cloneVNode(vnode[0], { key: item.index || index, index: item.index, item: item });
                    })
                }
              }}
            </div>
          </div>
        </div>
      );
    }
  }
});