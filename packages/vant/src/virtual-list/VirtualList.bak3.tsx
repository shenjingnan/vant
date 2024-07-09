import {
  ref,
  computed,
  defineComponent,
  type SlotsType,
  type InjectionKey,
  type ExtractPropTypes, watch, nextTick,
} from 'vue';

// Utils
import {doubleRaf, useChildren, useRect} from '@vant/use';
import {makeNumberProp, createNamespace, getScrollTop, makeArrayProp} from '../utils';
import {useExpose} from "../composables/use-expose";
import { throttle } from '../lazyload/vue-lazyload/util';


const [name, bem] = createNamespace('virtual-list');

export const virtualListProps = {
  itemHeight: makeNumberProp(0),
  buffer: makeNumberProp(1),
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
    default: { start: number; end: number; isScrolling: boolean };
  }>,
  // TODO: 如果没一个都有单独

  setup(props, {slots}) {
    const { buffer, list } = props;
    const root = ref<Element>();
    const {linkChildren, children} = useChildren(VIRTUAL_LIST_KEY);


    // TODO: 根据当前scrollTop应该能够计算出应该要展示的位置

    // const scrollTop = ref(0)

    const setScrollTop = throttle((value: number) => {
      scrollTop.value = value;
      // check()
    }, 100)
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
        minHeight: `${list.length * 100}px`,
        // transform: `translate3d(0, ${-1 * scrollTop.value}px, 0)`,
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
    // const start = ref(0);
    // computed(() => currentIndex.value - buffer > -1 ? currentIndex.value - buffer : 0)
    // end 应该要考虑当前视窗情况，然后算出最合适能填满视窗的数量，暂时假设是50，并且还要加上buffer
    // const end = computed(() => start.value + 10 + buffer)
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

    const style = computed(() => {
      return {
        // 这里的间距主要是为了提供隐藏的height的占位空间
        // paddingTop: `${hideHeight.value}px`,
        // transform: `translate3d(0, ${hideHeight.value}px, 0)`,
      }
    })
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
    }

    const scrollTop = ref(0)
    const start = ref(0)
    const end = ref(10)

    let isScrolling = ref(false)
    let stopScrollTimeout: any;
    const onScroll = (event: Event) => {
      const target = event.target as HTMLDivElement;
      const scrollTop = target.scrollTop;
      const _start = Math.floor(target.scrollTop / 100)
      if (_start - buffer < 0) {
        start.value = _start;
      } else {
        start.value = _start - buffer;
      }
      end.value = _start + 10
      console.log('top', start, end)
      isScrolling.value = true

      if (stopScrollTimeout) {
        clearTimeout(stopScrollTimeout)
      }
      // scrollTop.value = target.scrollTop
      stopScrollTimeout = setTimeout(() => {
        setScrollTop(target.scrollTop);
      // doubleRaf(() => {
        console.log('stopScrollTimeout', scrollTop.value)
        // nextTick(() => {
        //   start.value = Math.floor(target.scrollTop / 100)
        // })
        // console.log('start.value', start.value)
        // check(target.scrollTop)
      // })
      }, 100)
      
      // 什么时候清理掉？
      // 什么时候前移startIndex
      // 肯定不是立刻前移
      // 根据一个滚动向量对buffer进行动态调节
      // 只有停下来的时候才会清理startIndex和removeHideNode
      // 只要在滚动，就要判断当前进入窗口的最小最大index是多少，(min|max)Index + buffer = [start buffer][window items][end buffer]
      // 如何判断谁在当前视窗里
      // 当前视窗和startIndex是弱关系，因为startIndex会延迟调整
    }

    // 当前视窗中最小最大的可视index范围
    const range = ref([Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER])

    const noticeItemVisible = (index: number) => {
      const [min, max] = range.value;
      range.value = [Math.min(min, index), Math.max(max, index)];
    }

    const getTopByIndex = (index: number) => {
      // return childInfoMap.get(index)?.top ?? 0
    }

    linkChildren({
      cacheChildHeight,
      noticeItemVisible,
      getTopByIndex,
    } as any);

    // 需要判断是否已经填充满
    // [prev height] index[self height]
    // Y 是隐藏高度的节点之和，要排除buffer

    const showRange = computed(() => {
      let start = Math.floor(scrollTop.value / 100)
      const before = start
      if (start - buffer > 0) {
        start -= buffer;
      }
      console.log(before, start)

      // if (start === Number.MAX_SAFE_INTEGER) start = 0
      // if (end === Number.MIN_SAFE_INTEGER) end = 10
      // start -= buffer
      // end += buffer
      // if (start < 0) start = 0
      // if (end > list.length) end = list.length-1
      // console.log(start, end)
      return {
        start,
      }
    })

    const windowStyle = computed(() => {
      return {
        display: "flex", flexDirection: "column",
        transform: `translate3d(0, ${scrollTop.value}px, 0)`,
      }
    })

    useExpose({ setScrollTop });
    // 为什么需要有这个窗体的高度，是因为我要在滚动之后延迟计算窗体内应该展示哪些item
    // 如果没有这个窗体，那么有可能就会出现滚动不够的情况

    return () => {
      // console.log(showRange.value)
      return (
        <div role="feed" class={bem()} ref={root} onScroll={onScroll}>
          <div style={wrapperStyle.value} class={bem('wrapper')}>
            <div style={windowStyle.value}>
              {slots.default({start: start.value, end: end.value})}
            </div>
          </div>
        </div>
      );
    };
  },
});