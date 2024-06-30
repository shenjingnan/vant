<script setup lang="ts">
import VanVirtualList from '..';
const items = Array.from({ length: 20 }, (_, index) => index);
</script>

<template>
  <van-virtual-list
    class="list"
    style="height: 500px; overflow-y: scroll"
    :item-height="100"
  >
    <template #default="{ start, end }">
      <div class="item" :key="item" v-for="item in items.slice(start, end)">
        item: {{ item }} 999
      </div>
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
