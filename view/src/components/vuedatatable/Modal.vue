<template>
  <modal
    :show="show"
    v-on="$listeners"
  >
    <div class="box">
      <h5
        class="subtitle is-5"
      >
        {{ i18n(message || "Are you sure that you want to perform this action?") }}
      </h5>
      <hr>
      <div class="level">
        <div class="level-left" />
        <div class="level-right">
          <div class="level-item">
            <button
              class="button is-outlined"
              @click="$emit('close')"
            >
              {{ i18n("Cancel") }}
            </button>
            <button
              class="button is-danger has-margin-left-small"
              @click="$emit('commit')"
            >
              {{ i18n("Yes") }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </modal>
</template>

<script>
import Modal from '../bulma/Modal.vue';

export default {
  components: { Modal },

  props: {
    show: {
      type: Boolean,
      required: true,
    },
    message: {
      type: String,
      default: null,
    },
    i18n: {
      type: Function,
      required: true,
    },
  },

  mounted() {
    document.addEventListener('keydown', this.commitOnShiftEnter);
  },

  beforeDestroy() {
    document.removeEventListener('keydown', this.commitOnShiftEnter);
  },

  methods: {
    commitOnShiftEnter(e) {
      if (this.show && e.keyCode === 13 && e.shiftKey) {
        this.$emit('commit');
      }
    },
  },
};
</script>
