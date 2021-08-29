<template>
  <thead>
    <tr :class="['has-background-light', template.style]">
      <th
        v-if="template.selectable"
        :class="['vue-table-header', template.align]"
      >
        <label class="checkbox">
          <input
            v-model="pageSelected"
            type="checkbox"
            @change="$emit('select-page', pageSelected)"
          >
        </label>
      </th>
      <th
        v-if="template.crtNo"
        :class="['vue-table-header', template.align]"
      >
        {{ i18n(template.labels.crtNo) }}
      </th>
      <th
        v-for="column in template.columns"
        v-if="column.meta.visible && !column.meta.hidden && !column.meta.rogue"
        :key="column.label"
        :class="[
          'vue-table-header',
          column.align
            ? template.aligns[column.align]
            : template.align
        ]"
      >
        <span
          v-if="column.meta.sortable"
          class="is-clickable"
          @click="toggleSort($event, column)"
        >
          {{ i18n(column.label) }}
        </span>
        <span v-else>
          {{ i18n(column.label) }}
        </span>
        <span class="table-header-controls">
          <span
            v-if="column.tooltip"
            v-tooltip="i18n(column.tooltip)"
            class="icon is-small has-text-info"
          >
            <fa
              icon="info"
              size="xs"
            />
          </span>
          <span
            v-if="column.meta.sortable"
            class="sorter"
            @click="toggleSort($event, column)"
          >
            <span class="icon is-small">
              <fa
                :icon="sortIcon(column.meta.sort)"
                size="xs"
              />
            </span>
          </span>
          <a
            v-if="column.meta.sort"
            class="delete is-small"
            @click="clearColumnSort(column)"
          />
        </span>
      </th>
      <th
        v-if="template.actions"
        :class="['vue-table-header', template.align]"
      >
        {{ i18n(template.labels.actions) }}
      </th>
    </tr>
  </thead>
</template>

<script>
import { VTooltip } from 'v-tooltip';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faSort,
  faSortUp,
  faSortDown,
  faPlus,
  faFileExcel,
  faInfo,
} from '@fortawesome/free-solid-svg-icons';

library.add(faSort, faSortUp, faSortDown, faPlus, faFileExcel, faInfo);

export default {
  name: 'TableHeader',

  directives: { tooltip: VTooltip },

  props: {
    template: {
      type: Object,
      required: true,
    },
    i18n: {
      type: Function,
      required: true,
    },
  },

  data() {
    return {
      pageSelected: false,
    };
  },

  methods: {
    sortIcon(sort) {
      if (!sort) {
        return faSort;
      }

      return sort === 'ASC' ? faSortUp : faSortDown;
    },
    toggleSort(event, { meta }) {
      const { sort } = meta;

      if (!event.shiftKey) {
        this.clearSort();
      }

      meta.sort = sort === 'ASC' ? 'DESC' : 'ASC';
      this.template.sort = true;
      this.$emit('sort-update');
    },
    clearColumnSort({ meta }) {
      meta.sort = null;

      if (!this.template.columns.find((column) => column.meta.sort !== null)) {
        this.template.sort = false;
      }

      this.$emit('sort-update');
    },
    clearSort() {
      this.template.columns.forEach(({ meta }) => {
        meta.sort = null;
      });
    },
    updateSelectedFlag(state) {
      this.pageSelected = state;
    },
  },
};
</script>

<style lang="scss" scoped>
th.vue-table-header {
  white-space: nowrap;
  align-content: center;

  .is-clickable {
    cursor: pointer;
  }

  .table-header-controls {
    .sorter {
      cursor: pointer;
      opacity: 0.5;

      &:hover {
        opacity: 1;
      }
    }
  }
}
</style>
