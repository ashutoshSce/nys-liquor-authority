<template>
  <div class="tags has-addons">
    <span class="tag is-link">
      {{ label }}
    </span>
    <a
      v-if="!disabled"
      class="tag is-delete"
      @click="$emit('remove')"
    />
  </div>
</template>

<script>
export default {
  name: 'Tag',

  props: {
    label: {
      type: String,
      required: true,
    },
    disabled: {
      type: Boolean,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
.tags {
  margin-right: 0.3em;

  &:last-child {
    margin-bottom: 0;
  }

  .tag {
    padding: 0.5em;
    height: 1.35em;
    font-size: 1em;
    margin: 0.075em 0 0.075em;

    &:not(body).is-delete {
      width: 1.4em;
    }
  }
}
</style>
