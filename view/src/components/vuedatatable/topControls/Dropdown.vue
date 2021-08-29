<template>
  <div
    v-click-outside="hide"
    class="dropdown is-active"
  >
    <div
      v-click-outside="attemptHide"
      class="dropdown-trigger"
      @click="visible = !visible"
    >
      <button class="button">
        <slot name="label" />
        <span
          class="icon is-small angle"
          :aria-hidden="!visible"
        >
          <fa icon="angle-down" />
        </span>
      </button>
    </div>
    <transition
      appear
      enter-active-class="fadeIn"
      leave-active-class="fadeOut"
    >
      <div
        v-if="visible"
        class="animated dropdown-menu menu-list"
        :style="widthStyle"
      >
        <div
          class="dropdown-content has-text-centered"
          :style="[widthStyle, heightStyle]"
        >
          <slot />
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import vClickOutside from 'v-click-outside';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';

library.add(faAngleDown);

export default {
  name: 'Dropdown',

  directives: {
    clickOutside: vClickOutside.directive,
  },

  props: {
    height: {
      type: Number,
      default: 16,
    },
    hidesManually: {
      type: Boolean,
      default: false,
    },
    width: {
      type: Number,
      default: 4.5,
    },
  },

  data: () => ({
    visible: false,
  }),

  computed: {
    heightStyle() {
      return {
        'max-height': `${this.height}em`,
      };
    },
    widthStyle() {
      return {
        'min-width': `${this.width}em`,
      };
    },
  },

  methods: {
    hide() {
      this.visible = false;
    },
    attemptHide() {
      if (!this.hidesManually) {
        this.hide();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.dropdown-content {
  overflow-y: auto;
}

.icon.angle {
  transition: transform 0.3s ease;

  &[aria-hidden="true"] {
    transform: rotate(180deg);
  }
}
</style>
