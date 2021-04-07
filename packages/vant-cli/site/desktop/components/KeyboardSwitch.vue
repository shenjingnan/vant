<template>
  <div
    @click="$emit('switch-keyboard', !useKeyboard)"
    class="van-doc-keyboard-switch"
  >
    方向键导航：{{ useKeyboard ? '关' : '开' }}
  </div>
</template>

<script>
export default {
  name: 'VanDocKeyboardSwitch',

  props: {
    useKeyboard: Boolean,
  },

  emits: ['switch-keyboard'],
};
</script>

<style lang="less">
.van-doc-keyboard-switch {
  vertical-align: middle;
  position: relative;
  display: inline-block;
  padding: 0 12px;
  margin: 0 0 0 16px;
  color: #001938;
  background: #f7f8fa;
  font-size: 14px;
  line-height: 30px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  cursor: pointer;
  transition: 0.3s ease-in-out;
}
</style>
