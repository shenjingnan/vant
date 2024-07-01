<script setup lang="ts">
import VanVirtualList from '..';
import VanVirtualListItem from '../../virtual-list-item';
const items = Array.from({ length: 2000 }, (_, index) => ({
  index: index,
  style: {
    height: Math.floor(Math.random() * (150 - 80 + 1)) + 80 + 'px'
  }
}));
</script>

<template>
  <van-virtual-list
    class="list"
    style="height: 500px; overflow-y: scroll"
    :item-height="100"
  >
    <template #default="{ start, end }">
      <van-virtual-list-item
          class="item"
          :style="item.style"
          :key="item.index"
          v-for="item in items.slice(start, end)"
      >
        item: {{ item.index }}
        start: {{ start }}
        <br>
        {{ item.style }}
      </van-virtual-list-item>
    </template>
  </van-virtual-list>
</template>

<style lang="less">
.list {
  height: 500px;
  overflow-y: scroll;
  border: 1px solid;
  box-sizing: border-box;
}
.item {
  height: 100px;
  border-bottom: 1px solid;
  box-sizing: border-box;
}
</style>
