<template>
  <span
    :class="{ 'is-clickable has-text-info': column.meta.clickable }"
    @click="column.meta.clickable ? $emit('clicked') : null"
  >
    <slot
      v-if="hiddenControls"
      name="hidden-controls"
    />
    <span
      v-if="column.meta.boolean"
      class="tag is-table-tag icon is-small"
      :class="value ? 'is-success' : 'is-danger'"
    >
      <fa :icon="value ? 'check' : 'times'" />
    </span>
    <span v-else-if="column.meta.icon && value">
      <fa :icon="value" />
    </span>
    <slot
      v-else-if="column.meta.slot"
      :name="column.name"
    />
    <span v-else-if="column.meta.translatable">
      {{ i18n(value) }}
    </span>
    <span v-else-if="column.meta.escapable">
      {{ value }}
    </span>
    <span
      v-else
      v-html="value"
    />
  </span>
</template>

<script>
export default {
  name: 'TableCell',

  props: {
    column: {
      type: Object,
      required: true,
    },
    value: {
      type: null,
      required: true,
    },
    i18n: {
      type: Function,
      required: true,
    },
    hiddenControls: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style lang="scss" scoped>
.is-clickable {
  cursor: pointer;
}

.tag.is-table-tag {
  font-size: 0.8rem;
  font-weight: bold;
  height: 1.4em;
  -webkit-box-shadow: 0 1px 1px rgba(10, 10, 10, 0.2);
  box-shadow: 0 1px 1px rgba(10, 10, 10, 0.2);
}
</style>
