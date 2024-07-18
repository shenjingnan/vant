<script setup lang="ts">
import { ref } from 'vue'
import VanVirtualList from '..';
import VanVirtualListItem from '../../virtual-list-item';
import VanImage from '../../image';
import { cdnURL } from '../../../docs/site';

const heights = [100, 110, 120, 130, 140, 150, 160]
console.log('总高度:', heights.reduce((a, b) => a + b, 0))
const image = cdnURL('cat.jpeg');
const items = Array.from({length: 1e4 }, (_, index) => {
  let height = Math.floor(Math.random() * (120 - 80) + 80)
  if (heights[index]) height = heights[index]
  return {
    index: index,
    height,
    style: {
      // height: height + 'px'
    }
  }
});

const root = ref()
const y = ref(0)
const val = ref(40)

const add = () => {
  y.value += val.value
  root.value.setScrollTop(y.value)
}

</script>

<template>
  <!-- TODO: 基础使用 -->
  <!-- TODO: 图片懒加载 -->
  <!-- TODO: 极限高度场景 -->
  <div style="width: 100%;height: 200px;background-color:#cfcfcf;"></div>
  current: {{ y }}
  <br>
  <input v-model="val" type="text">
  <button @click="add">add</button>
  <van-virtual-list
      ref="root"
      class="list"
      style="height: 500px; overflow-y: scroll"
      :item-height="100"
      :list="items"
  >
    <template #default="{ item }">
      item: {{ item.index }} <br> {{ item.style }}
      <van-image :src="image" />
    </template>
  </van-virtual-list>
</template>

<style lang="less">
.list {
  height: 500px;
  overflow-y: scroll;
  border: 1px solid;
  box-sizing: border-box;
  position: relative; will-change: transform; direction: ltr;
}

.item {
  //height: 100px;
  border-bottom: 1px solid;
  box-sizing: border-box;
}
</style>
