<template>
  <tfoot>
    <tr>
      <td v-if="template.crtNo" />
      <td v-if="template.selectable" />
      <td
        v-if="
          template.columns[0].meta.visible
            && !template.columns[0].meta.hidden
        "
        class="has-text-centered is-bold"
      >
        {{ i18n("Total") }}
      </td>
      <td
        v-for="i in visibleColumns.length - 1"
        v-if="
          visibleColumns[i].meta.visible
            && !visibleColumns[i].meta.hidden
            && !visibleColumns[i].meta.rogue
        "
        :key="i"
        :class="[
          'is-bold',
          { 'is-money' : visibleColumns[i].money },
          visibleColumns[i].align
            ? template.aligns[visibleColumns[i].align]
            : template.align
        ]"
      >
        <span v-if="visibleColumns[i].meta.total">
          {{
            visibleColumns[i].money
              ? body.total[visibleColumns[i].name]
              : numberFormat(body.total[visibleColumns[i].name])
          }}
        </span>
        <slot
          v-else-if="visibleColumns[i].meta.customTotal"
          :name="`${visibleColumns[i].name}_custom_total`"
        >
          {{ `${visibleColumns[i].name}_custom_total` }}
        </slot>
      </td>
      <td v-if="template.actions" />
    </tr>
  </tfoot>
</template>

<script>
export default {
  name: 'TableFooter',

  props: {
    template: {
      type: Object,
      required: true,
    },
    body: {
      type: Object,
      required: true,
    },
    i18n: {
      type: Function,
      required: true,
    },
    visibleColumns: {
      type: Array,
      required: true,
    },
  },

  methods: {
    numberFormat(value) {
      const x = value.toString().split('.');
      let x1 = x[0];
      const x2 = x.length > 1 ? `.${x[1]}` : '';
      const rgx = /(\d+)(\d{3})/;

      while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1,$2');
      }

      return x1 + x2;
    },
  },
};
</script>

<style scoped>
.is-money {
  font-family: monospace;
}
</style>
