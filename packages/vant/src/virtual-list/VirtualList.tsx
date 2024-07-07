import {
  ref,
  computed,
  defineComponent,
  type SlotsType,
  type InjectionKey,
  type ExtractPropTypes, watch, nextTick,
} from 'vue';

// Utils
import {useChildren, useRect} from '@vant/use';
import {makeNumberProp, createNamespace, getScrollTop, makeArrayProp} from '../utils';
import {useExpose} from "../composables/use-expose";

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
    default: { start: number; end: number };
  }>,
  // TODO: 如果没一个都有单独

  setup(props, {slots}) {
    const { buffer, list } = props;
    const root = ref<Element>();
    const {linkChildren, children} = useChildren(VIRTUAL_LIST_KEY);


    // TODO: 根据当前scrollTop应该能够计算出应该要展示的位置

    // const scrollTop = ref(0)

    const setScrollTop = (value: number) => {
      // scrollTop.value = value;
      // check()
    }
    // const heights = computed(() => childrenList.value.reduce((prev: number[], cur) => {
    //   return [
    //     ...prev,
    //     cur.height,
    //   ]
    // }, []))

    function findIndex(heights: number[], matchHeight: number) {
      let total = 0;
      for (let index = 0; index < heights.length; index++) {
        total += heights[index];
        if (total >= matchHeight) {
          return index;
        }
      }
      return -1;
    }

    const sum = (nums: number[]) => {
      return nums.reduce((a, b) => a + b, 0);
    }

    const wrapperStyle = computed(() => {
      return {
        transform: `translate3d(0, ${-1 * scrollTop.value}px, 0)`,
      }
    })

    const childrenList = ref(
      list.map((item, index) => {
        return {
          payload: item,
          height: 0,
          index,
        }
      })
    )

    const heights = ref<number[]>([])

    const cacheChildHeight = (index: number, height: number) => {
      heights.value[index] = height
      // console.log(heights.value);
      childrenList.value[index].height = height;
    }

    // const listWithHeight = computed(() => {
      // 每当一个child展示之后就对这个列表进行更新
      // 为什么要存在这个列表的原因是因为只有这里才是完整的数据缓存
      // 其他计算的信息都是为了展示部分数据
    // })

    // // 100 应该计算上面有多少个buffer，此时就需要使用到children
    // const currentIndex = computed(() => findIndex(heights.value, scrollTop.value));
    // start 需要考虑 buffer 数量的缓存
    const start = ref(0);
    // computed(() => currentIndex.value - buffer > -1 ? currentIndex.value - buffer : 0)
    // end 应该要考虑当前视窗情况，然后算出最合适能填满视窗的数量，暂时假设是50，并且还要加上buffer
    const end = computed(() => start.value + 10 + buffer)
    // 隐藏的高度就是超过buffer的部分，那么start已经留出了buffer，那么就是小于start的都是隐藏的
    const hideHeight = ref(0)
    // const hideHeight = computed(() => {
    //   if (currentIndex.value - buffer <= 0) {
    //     return 0
    //   }
    //
    //   const index = currentIndex.value - buffer
    //   const res = sum(heights.value.slice(0, index))
    //   return res;
    // })

    // const style = computed(() => {
    //   return {
    //     // 这里的间距主要是为了提供隐藏的height的占位空间
    //     paddingTop: `${hideHeight.value}px`,
    //     // transform: `translate3d(0, ${hideHeight.value}px, 0)`,
    //   }
    // })
    // 我的前面有多少height
    // 当前height是多少
    // 我是否应该展示? 如果当前的top > height && top < self height
    // 如果 top > self height then hidden else display
    const calcHideHeight = (currentIndex: number) => {
      if (currentIndex - buffer <= 0) {
        return 0
      }

      const index = currentIndex - buffer
      const res = sum(heights.value.slice(0, index))
      return res;
    }

    // 在滚动期间什么都不做，直到滚动结束才进行计算，
    const check = (scrollTop: number) => {
      // 100 应该计算上面有多少个buffer，此时就需要使用到children
      const currentIndex = findIndex(heights.value, scrollTop + hideHeight.value);
      hideHeight.value = calcHideHeight(currentIndex);
      start.value = currentIndex - buffer > -1 ? currentIndex - buffer : 0
      // 隐藏的高度就是超过buffer的部分，那么start已经留出了buffer，那么就是小于start的都是隐藏的
    }

    let time = 0
    const onScroll = (event: Event) => {
      const target = event.target as HTMLDivElement;
      const now = Date.now()
      if (now - time > 20) {
        check(target.scrollTop)
        time = now
      }
    }

    linkChildren({ cacheChildHeight, } as any);

    useExpose({ setScrollTop });

    return () => {
      return (
        <div role="feed" class={bem()} ref={root} onScroll={onScroll}>
          <div class={bem('wrapper')}>
            {slots.default({start: start.value, end: end.value})}
          </div>
        </div>
      );
    };
  },
});