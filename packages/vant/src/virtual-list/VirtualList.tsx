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
import {makeNumberProp, createNamespace, getScrollTop} from '../utils';

const [name, bem] = createNamespace('virtual-list');

export const virtualListProps = {
  itemHeight: makeNumberProp(0),
  bufferCount: makeNumberProp(1),
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

  setup(props, {slots}) {
    const {linkChildren, children} = useChildren(VIRTUAL_LIST_KEY);

    // watch(children, (newChildren) => {
    //   let heightTotal = 0;
    //   newChildren.forEach((child) => {
    //     heightTotal += child.height.value ?? 0
    //   })
    //   console.log(heightTotal)
    // })
    // 我要拿到的padidngTop是已经隐藏的height
    // 实际上只要拿到当前即将隐藏的height就可以了
    // 因为原先的height已经缓存了

    const {bufferCount, itemHeight} = props;
    const root = ref<Element>()
    const windowHeight = computed(() => root.value?.clientHeight ?? 0);
    const visiableCount = computed(() => windowHeight.value / itemHeight)
    const startOffset = ref(0);
    const hideIndex = computed(() => {
      const index = topChildren.value.size - bufferCount
      return index >= 0 ? index : 0;
    })
    // const hideIndex = computed(() => {
    //   return Math.floor(startOffset.value / itemHeight) - 1;
    // });
    // const paddingTop = ref(0);
    const paddingTop = computed(() => {
      return childrenHeight.value.slice(0, -1 * bufferCount).reduce((a, b) => a + b, 0)
      // return (hideIndex.value + 1) * itemHeight;
    });

    const style = computed(() => {
      // console.log('nemo style', paddingTop.value)
      return {
        transform: `translate3d(0, ${paddingTop.value}px, 0)`,
      };
    });

    const start = computed(() => {
      return hideIndex.value;
    })
    const end = computed(() => Math.ceil(start.value + 8) + bufferCount);

    const renderDefault = () => {
      // const start = hideIndex.value + 1;
      // console.log(start)
      // const end = Math.ceil(start + 8) + bufferCount;
      return slots.default({start: start.value, end: end.value});
    };

    const hideHeight = ref(0);
    const prevHeight = ref(0);
    const topChildren = ref<Map<number, number>>(new Map())
    const childrenHeight = computed(() => {
      return [...topChildren.value.values()]
    })
    const topTotalHeight = computed(() => {
      return [...topChildren.value.values()].reduce((a, b) => a + b, 0);
    });

    let index = 0;
    let timer = null

    let time = 0
    // 使用一个数组缓存已经消失的child的高度
    let prevOffset = 0
    const onScroll = (event: Event) => {

      const target = event.target as HTMLDivElement;
      startOffset.value = target.scrollTop;
      const offset = target.scrollTop - prevOffset;
      prevOffset = target.scrollTop;
      console.log('和上一次偏移相差：', offset, target.scrollTop)
        // , '\n', 'prev', prevOffset, 'current', target.scrollTop

      // const scrollTop = getScrollTop(root.value as Element);
      // prevHeight.value += scrollTop - hideHeight.value;
      const childIndex = index > bufferCount ? bufferCount : index
      const curChild = children[childIndex]
      const height = curChild.height.value;
      // console.log('scrollTop', scrollTop);
      // console.log(target.scrollTop)
      // console.log(scrollTop)
      // console.log(target.scrollTop, height)
      const {size} = topChildren.value;
      const height3 = childrenHeight.value.slice(-1 * bufferCount)
      const last3Height = height3.reduce((a, b) => a + b, 0)
      // console.log(target.scrollTop, last3Height, height)
      // console.log(target.scrollTop, height)
      const top = target.scrollTop - last3Height;
      console.log(target.scrollTop);
      // console.log('nemo onscroll', `index: ${index}`, {
      //   'target.scrollTop': target.scrollTop,
      //   top,
      //   height,
      //   last3Height,
      //   height3: JSON.stringify(height3),
      //   childrenHeight: JSON.stringify(childrenHeight.value)
      // })
      // TODO: top 这个值可能会跳过几个偏移量
      // TODO: top 这个值我们要确定的时候可能他已经跳过了n个div
      // console.log(currentChild.getRect(root.value, useRect(root)))
      if (top - height >= 0 && top - height <= 0.5) {
        const currentTime = Date.now()
        if (!topChildren.value.has(index) && (time === 0 || currentTime - time > 100)) {
          time = currentTime
          topChildren.value.set(index++, height);
        }
        // console.log('childrenHeight len:', childrenHeight.value.length)
        // if (childrenHeight.value.length > 3) {
        // }
      }
      // hideIndex++ will change paddingTop
      // topIndex++
      // if topIndex >= 3 do hideIndex++
      // if (target.scrollTop >= height) {
      // //   hideHeight.value = scrollTop;
      // //   console.log('set paddingtop', hideHeight.value, hideIndex.value)
      // } else if (target.scrollTop === 0) {
      //   hideIndex.value--
      // }
      // console.log(target.scrollTop, height, hideIndex.value)
      // console.log(prevHeight.value, height)
      // if (prevHeight.value >= height) {
      //   hideHeight.value += height;
      //   hideIndex.value++
      //   start.value = hideIndex.value + 1;
      //   // console.log(start, end)
      // } else {
      //   if (hideIndex.value > -1) {
      //     hideHeight.value -= height;
      //     hideIndex.value--
      //   }
      // }

      // console.log({ scrollTop, prevHeight: prevHeight.value, height, hideHeight: hideHeight.value, hideIndex: hideIndex.value })
      // 每次隐藏的时候hideHeight ++
      // children[0].getRect(root.value, useRect(root))
    };

    linkChildren({} as VirtualListProvide);

    return () => {
      return (
        <div style={style} ref={root} role="feed" class={bem()} onScroll={onScroll}>
          <div class={bem('wrapper')}>
            {slots.default({start: start.value, end: end.value})}
          </div>
        </div>
      );
    };
  },
});
