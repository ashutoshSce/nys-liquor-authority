<template>
  <div
    v-if="initialised"
    class="table-wrapper"
  >
    <top-controls
      :template="template"
      :i18n="i18n"
      :length="length"
      v-model="search"
      :loading="loading"
      :info="body !== null && !body.fullRecordInfo"
      @update-length="length=$event"
      @export-data="exportData"
      @action="action"
      @reload="fetch()"
      @reset="resetPreferences"
      @request-full-info="forceInfo = true; fetch()"
      @update-visibility="fetch()"
      v-on="$listeners"
    />
    <div
      v-responsive
      class="table-responsive"
    >
      <table
        id="id"
        class="table is-fullwidth is-marginless"
        :class="template.style"
      >
        <table-header
          v-if="hasContent"
          ref="header"
          :template="template"
          :i18n="i18n"
          @sort-update="fetch"
          @select-page="selectPage"
        />
        <table-body
          :template="template"
          :body="body"
          :start="start"
          :i18n="i18n"
          ref="body"
          :expanded="expanded"
          v-if="hasContent"
          :selected="selected"
          :highlighted="highlighted"
          v-on="$listeners"
          @ajax="ajax"
          @update-selected="updateSelectedFlag"
        >
          <template
            v-for="column in template.columns"
            :slot="column.name"
            slot-scope="{ row, column }"
          >
            <slot
              v-if="column.meta.slot"
              :name="column.name"
              :column="column"
              :row="row"
              :loading="loading"
            >
              {{ row[column.name] }}
            </slot>
          </template>
        </table-body>
        <table-footer
          v-if="template.total && hasContent && body.fullRecordInfo"
          :template="template"
          :body="body"
          :i18n="i18n"
          :visible-columns="visibleColumns"
        >
          <template
            v-for="i in visibleColumns.length - 1"
            v-if="visibleColumns[i].meta.customTotal"
            :slot="`${visibleColumns[i].name}_custom_total`"
          >
            <slot
              :name="`${visibleColumns[i].name}_custom_total`"
              :total="body ? body.total : []"
              :column="visibleColumns[i]"
            >
              {{ `${visibleColumns[i].name}_custom_total` }}
            </slot>
          </template>
        </table-footer>
      </table>
      <overlay v-if="loading" />
    </div>
    <bottom-controls
      v-if="hasContent"
      class="bottom-controls"
      :body="body"
      :i18n="i18n"
      :loading="loading"
      :start="start"
      :length="length"
      :selected="selected"
      @jump-to="start = $event; fetch()"
    />
    <div
      v-if="isEmpty"
      class="has-text-centered no-records-found"
    >
      {{ i18n('No records were found') }}
    </div>
  </div>
</template>

<script>
import debounce from 'lodash/debounce';
import accounting from 'accounting-js';
import TopControls from './TopControls.vue';
import TableHeader from './TableHeader.vue';
import TableBody from './TableBody.vue';
import TableFooter from './TableFooter.vue';
import BottomControls from './BottomControls.vue';
import Overlay from './Overlay.vue';
import vResponsive from './responsive/vResponsive';

export default {
  name: 'VueTable',

  components: {
    TopControls,
    TableHeader,
    TableBody,
    TableFooter,
    Overlay,
    BottomControls,
  },

  directives: {
    responsive: vResponsive,
  },

  props: {
    id: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    filters: {
      type: Object,
      default: null,
    },
    params: {
      type: Object,
      default: null,
    },
    intervals: {
      type: Object,
      default: null,
    },
    i18n: {
      type: Function,
      default(key) {
        return this.$options.methods
          && Object.keys(this.$options.methods).includes('__')
          ? this.__(key)
          : key;
      },
    },
  },

  data() {
    return {
      loading: false,
      initialised: false,
      template: null,
      search: '',
      start: null,
      body: null,
      length: null,
      expanded: [],
      forceInfo: false,
      selected: [],
      highlighted: [],
    };
  },

  computed: {
    preferencesKey() {
      return `VueTable_${this.id}_preferences`;
    },
    preferences() {
      if (!this.initialised) {
        return null;
      }
      return {
        global: {
          length: this.length,
          search: this.search,
          start: this.start,
        },
        template: {
          sort: this.template.sort,
          style: this.template.style,
        },
        columns: this.template.columns.reduce((collector, column) => {
          collector.push({
            sort: column.meta.sort,
            visible: column.meta.visible,
          });
          return collector;
        }, []),
      };
    },
    isEmpty() {
      return this.body && !this.body.count;
    },
    hasContent() {
      return this.body && this.body.count;
    },
    visibleColumns() {
      return this.template.columns.filter(({ meta }) => !meta.rogue);
    },
  },

  watch: {
    search: {
      handler() {
        this.filterUpdate();
      },
    },
    filters: {
      handler() {
        this.filterUpdate();
      },
      deep: true,
    },
    params: {
      handler() {
        this.filterUpdate();
      },
      deep: true,
    },
    intervals: {
      handler() {
        this.filterUpdate();
      },
      deep: true,
    },
    length: {
      handler() {
        this.filterUpdate();
      },
    },
    preferences: {
      handler() {
        if (this.hasContent) {
          this.savePreferences();
        }
      },
      deep: true,
    },
  },

  created() {
    this.init();
  },

  methods: {
    init() {
      axios
        .get(this.path)
        .then(({ data }) => {
          this.template = data.template;
          this.start = 0;
          [this.length] = this.template.lengthMenu;
          this.fetch = debounce(this.fetch, this.template.debounce);
          this.setPreferences();

          this.$nextTick(() => {
            this.initialised = true;
            this.$emit('initialised');
          });

          this.fetch();
        })
        .catch((error) => {
          const { status, data } = error.response;

          if (status === 555) {
            this.$toastr.error(data.message);
            return;
          }

          this.handleError(error);
        });
    },
    setPreferences() {
      const preferences = this.userPreferences();

      if (preferences) {
        this.setUserPreferences(preferences);
      }
    },
    userPreferences() {
      if (localStorage.getItem(this.preferencesKey) === null) {
        return null;
      }

      const preferences = JSON.parse(localStorage.getItem(this.preferencesKey));

      if (preferences.columns.length !== this.template.columns.length) {
        localStorage.removeItem(this.preferencesKey);
        return null;
      }

      return preferences;
    },
    setUserPreferences(prefs) {
      Object.keys(prefs.global).forEach((key) => {
        this.$set(this, key, prefs.global[key]);
      });
      Object.keys(prefs.template).forEach((key) => {
        if (this.template[key] !== undefined) {
          this.$set(this.template, key, prefs.template[key]);
        }
      });
      prefs.columns.forEach((column, index) => {
        Object.keys(column).forEach((key) => {
          this.$set(this.template.columns[index].meta, key, column[key]);
        });
      });
    },
    savePreferences() {
      localStorage.setItem(
        this.preferencesKey,
        JSON.stringify(this.preferences),
      );
    },
    resetPreferences() {
      localStorage.removeItem(this.preferencesKey);
      this.search = '';
      this.init();
    },
    fetch() {
      this.loading = true;
      this.expanded = [];

      axios[this.template.method.toLowerCase()](
        this.template.readPath,
        this.readRequest(),
      )
        .then(({ data }) => {
          this.loading = false;
          this.forceInfo = false;

          if (data.data.length === 0 && this.start > 0) {
            this.start = 0;
            this.fetch();
            return;
          }

          this.body = this.template.money ? this.processMoney(data) : data;

          this.$nextTick(() => this.updateSelectedFlag());

          this.$emit('draw');
        })
        .catch((error) => {
          this.handleError(error);
          this.loading = false;
        });
    },
    readRequest(method = null) {
      const params = {
        columns: this.requestColumns(),
        meta: {
          start: this.start,
          length: this.length,
          sort: this.template.sort,
          total: this.template.total,
          enum: this.template.enum,
          date: this.template.date,
          translatable: this.template.translatable,
          actions: this.template.actions,
          forceInfo: this.forceInfo,
        },
        search: this.search,
        appends: this.template.appends,
        filters: this.filters,
        intervals: this.intervals,
        params: this.params,
        selected: this.selected,
        comparisonOperator: this.template.comparisonOperator,
      };

      method = method || this.template.method;

      return method === 'GET' ? { params } : params;
    },
    requestColumns() {
      return this.template.columns.reduce((columns, column) => {
        columns.push({
          name: column.name,
          data: column.data,
          meta: {
            searchable: column.meta.searchable,
            sortable: column.meta.sortable,
            sort: column.meta.sort,
            total: column.meta.total,
            date: column.meta.date,
            translatable: column.meta.translatable,
            nullLast: column.meta.nullLast,
            rogue: column.meta.rogue,
            notExportable: column.meta.notExportable,
            array: column.meta.array,
            visible: column.meta.visible,
          },
          enum: column.enum,
        });
        return columns;
      }, []);
    },
    processMoney(body) {
      this.template.columns
        .filter((column) => column.money)
        .forEach((column) => {
          let money = body.data.map((row) => parseFloat(row[column.name]) || 0);
          money = accounting.formatColumn(money, column.money);

          body.data = body.data.map((row, index) => {
            row[column.name] = money[index];
            return row;
          });

          if (this.template.total && body.total.hasOwnProperty(column.name)) {
            body.total[column.name] = accounting.formatMoney(
              body.total[column.name],
              column.money,
            );
          }
        });

      return body;
    },
    exportData(path) {
      axios[this.template.method.toLowerCase()](
        path,
        this.exportRequest(),
      ).then((data) => {
        const params = data.data.split('exportExcel=1');
        if (params[1] !== undefined) {
          window.open((path + params[1]).replace('exportExcel=1', 'exportExcel=2'));
        }
      }).catch((error) => {
        const { status, data } = error.response;

        if (status === 555) {
          this.$toastr.error(data.message);
          return;
        }

        this.handleError(error);
      });
    },
    exportRequest() {
      const params = {
        name: this.id,
        columns: this.requestColumns(),
        meta: {
          start: 0,
          length: this.body.filtered,
          sort: this.template.sort,
          enum: this.template.enum,
          date: this.template.date,
          translatable: this.template.translatable,
          total: false,
        },
        search: this.search,
        appends: this.template.appends,
        filters: this.filters,
        intervals: this.intervals,
        params: this.params,
        comparisonOperator: this.template.comparisonOperator,
      };

      return this.template.method === 'GET' ? { params } : params;
    },
    ajax(method, path, postEvent) {
      axios[method.toLowerCase()](path)
        .then(({ data }) => {
          this.$toastr.success(data.message);
          this.fetch();

          if (postEvent) {
            this.$emit(postEvent);
          }
        })
        .catch((error) => this.handleError(error));
    },
    action(method, path, postEvent) {
      this.loading = true;

      axios[method.toLowerCase()](path, this.readRequest(method))
        .then(() => {
          this.loading = false;

          if (postEvent) {
            this.$emit(postEvent);
          }
        })
        .catch((error) => this.handleError(error));
    },
    filterUpdate() {
      if (!this.initialised) {
        return;
      }

      this.start = 0;
      this.fetch();
    },
    selectPage(state) {
      this.$refs.body.selectPage(state);
    },
    updateSelectedFlag() {
      if (!this.$refs.header) {
        return;
      }

      const selected = this.body.data.filter(
        (row) => this.selected.findIndex((id) => id === row.dtRowId) === -1,
      ).length === 0;

      this.$refs.header.updateSelectedFlag(selected);
    },
    highlight(id) {
      const index = this.body.data.findIndex(({ dtRowId }) => dtRowId === id);

      if (index >= 0) {
        this.highlighted.push(index);
      }
    },
    clearHighlighted() {
      this.highlighted = [];
    },
  },
};
</script>

<style lang="scss">
.table-wrapper {
  &.is-rounded {
    border-radius: 0.5em;

    .top-controls {
      border-radius: 0.5em 0.5em 0 0;
    }

    .bottom-controls {
      border-radius: 0 0 0.5em 0.5em;
    }
  }

  .table-responsive {
    position: relative;
    display: block;
    width: 100%;
    min-height: 0.01%;
    overflow-x: auto;

    .table {
      font-size: 0.95em;

      td,
      th {
        vertical-align: middle;
      }
    }
  }

  .no-records-found {
    padding: 1em;
  }
}
</style>
