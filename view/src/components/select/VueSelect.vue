<template>
  <div
    v-click-outside="hideDropdown"
    :class="['dropdown', { 'is-active': dropdown }]"
  >
    <div class="dropdown-trigger">
      <fieldset
        :class="['control-input input', { 'is-danger': hasError }]"
        tabindex="0"
        :disabled="disabled"
        :readonly="readonly"
        @click="showDropdown"
        @keypress.enter="showDropdown"
        @focus="showDropdown"
      >
        <div class="select-value">
          <div class="field is-grouped is-grouped-multiline">
            <div
              v-if="multiple"
              class="control"
            >
              <tag
                v-for="(option, index) in selected"
                :key="index"
                :disabled="readonly || disabled"
                :label="optionLabel(option, label)"
                @remove="remove(option); $emit('remove', option)"
              />
            </div>
            <input
              v-if="dropdown"
              v-model="query"
              class="input select-input"
              type="text"
              :placeholder="i18n(placeholder)"
              @keydown.esc="hideDropdown"
              @keydown.down="keyDown"
              @keydown.up="keyUp"
              @keydown.tab="hideDropdown"
              @keydown.enter.prevent="hit()"
            >
          </div>
          <span v-if="!dropdown && !(multiple && hasSelection)">
            {{ hasSelection
              ? selected
              : (optionList.length > 0 ? i18n(placeholder) : i18n(labels.noOptions))
            }}
          </span>
          <span
            v-if="loading"
            class="is-loading"
          />
          <a
            v-if="!disableClear && !loading && hasSelection && !readonly && !disabled"
            class="delete is-small"
            @mousedown.prevent.self="clear"
          />
          <span
            class="icon is-small angle"
            :aria-hidden="dropdown"
          >
            <fa icon="angle-up" />
          </span>
        </div>
      </fieldset>
    </div>
    <div class="dropdown-menu">
      <div class="dropdown-content">
        <a
          v-for="(option, index) in filteredOptions"
          :key="index"
          class="dropdown-item"
          :class="{ 'is-active': position === index }"
          @mousemove="position = index"
          @click.prevent="hit()"
        >
          <span v-html="highlight(optionLabel(option, label))" />
          <span
            v-if="index === position && !disableClear"
            :class="[
              'label tag', isSelected(option) ? 'is-warning' : 'is-success'
            ]"
          >
            <span v-if="isSelected(option)">
              {{ i18n(labels.deselect) }}
            </span>
            <span v-else>
              {{ i18n(labels.select) }}
            </span>
          </span>
          <span
            v-else-if="isSelected(option)"
            class="icon is-small selected has-text-success"
          >
            <fa icon="check" />
          </span>
        </a>
        <a
          v-if="filteredOptions.length === 0"
          class="dropdown-item"
          @click="taggable ? $emit('add-tag', query) : null"
        >
          {{ i18n(labels.noResults) }}
          <span
            v-if="taggable"
            class="label tag is-info"
          >
            {{ i18n(labels.addTag) }}
          </span>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import debounce from 'lodash/debounce';
import vClickOutside from 'v-click-outside';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCheck, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import Tag from './Tag.vue';

library.add([faCheck, faAngleUp]);

export default {
  name: 'VueSelect',

  directives: {
    clickOutside: vClickOutside.directive,
  },

  components: { Tag },

  props: {
    multiple: {
      type: Boolean,
      default: false,
    },
    source: {
      type: String,
      default: null,
    },
    options: {
      type: Array,
      default() {
        return [];
      },
    },
    trackBy: {
      type: String,
      default: 'id',
    },
    label: {
      type: String,
      default: 'name',
    },
    value: {
      type: null,
      default: null,
    },
    limit: {
      type: Number,
      default: 100,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    taggable: {
      type: Boolean,
      default: false,
    },
    disableClear: {
      type: Boolean,
      default: false,
    },
    hasError: {
      type: Boolean,
      default: false,
    },
    params: {
      type: Object,
      default: null,
    },
    pivotParams: {
      type: Object,
      default: null,
    },
    customParams: {
      type: Object,
      default: null,
    },
    placeholder: {
      type: String,
      default: 'Choose',
    },
    labels: {
      type: Object,
      default: () => ({
        select: 'select',
        deselect: 'deselect',
        noOptions: 'No options available',
        noResults: 'No search results found',
        addTag: 'Add option',
      }),
    },
    translated: {
      type: Boolean,
      default: false,
    },
    i18n: {
      type: Function,
      default(key) {
        return Object.keys(this.$options.methods).includes('__')
          ? this.__(key)
          : key;
      },
    },
    debounce: {
      type: Number,
      default: 300,
    },
  },

  data() {
    return {
      optionList: this.options,
      loading: false,
      query: '',
      dropdown: false,
      position: null,
      route: null,
    };
  },

  computed: {
    isServerSide() {
      return this.source !== null;
    },
    filteredOptions() {
      return this.query
        ? this.optionList.filter(
          (option) => this.optionLabel(option, this.label)
            .toLowerCase()
            .indexOf(this.query.toLowerCase()) >= 0,
        )
        : this.optionList;
    },
    hasSelection() {
      return (
        (this.multiple && this.value.length !== 0)
        || (!this.multiple && this.value !== null)
      );
    },
    selected() {
      if (this.optionList.length === 0) {
        return null;
      }

      if (!this.multiple) {
        const option = this.optionList.find(
          (option) => option[this.trackBy] === this.value,
        );

        return this.optionLabel(option, this.label);
      }

      return this.optionList.filter((option) => this.value.includes(option[this.trackBy]));
    },
  },

  watch: {
    options: {
      handler() {
        this.optionList = this.options;
      },
      deep: true,
    },
    query: {
      handler() {
        this.fetch();
      },
    },
    params: {
      handler() {
        this.fetch();
      },
      deep: true,
    },
    pivotParams: {
      handler() {
        this.fetch();
      },
      deep: true,
    },
    customParams: {
      handler() {
        this.fetch();
      },
      deep: true,
    },
  },

  created() {
    this.setRoute();
    this.fetch = debounce(this.fetch, this.debounce);
    this.fetch();
  },

  methods: {
    setRoute() {
      if (!this.isServerSide) {
        return;
      }

      this.route = typeof route === 'function' ? route(this.source) : this.source;
    },
    fetch() {
      if (!this.isServerSide) {
        return;
      }

      this.loading = true;

      axios
        .get(this.route, { params: this.getParams() })
        .then((response) => {
          this.processOptions(response);
          this.$emit('fetch', this.optionList);
          this.loading = false;
        })
        .catch((error) => this.handleError(error));
    },
    getParams() {
      return {
        params: this.params,
        pivotParams: this.pivotParams,
        customParams: this.customParams,
        query: this.query,
        value: this.value,
        limit: this.limit,
      };
    },
    processOptions({ data }) {
      this.optionList = data;

      if (!this.query && !this.valueIsMatched() && this.hasSelection) {
        this.clear();
      }
    },
    valueIsMatched() {
      if (!this.multiple) {
        return (
          this.optionList.filter((option) => option[this.trackBy] === this.value)
            .length > 0
        );
      }

      return (
        this.optionList.filter(
          (option) => this.value.filter((val) => val === option[this.trackBy]).length > 0,
        ).length > 0
      );
    },
    showDropdown() {
      if (this.optionList.length === 0 || this.readonly || this.disabled) {
        return;
      }

      this.dropdown = true;
      this.$nextTick(() => this.$el.querySelector('input').focus());
      this.position = 0;
    },
    hideDropdown() {
      this.query = '';
      this.dropdown = false;
      this.position = null;
    },
    hit() {
      if (this.filteredOptions.length === 0) {
        return;
      }

      const value = this.filteredOptions[this.position][this.trackBy];

      if (!this.multiple) {
        this.hideDropdown();
        if (this.value === value && !this.disableClear) {
          this.$emit('input', null);
          return;
        }

        this.$emit('input', value);
        return;
      }

      const newValue = this.value;
      const index = newValue.findIndex((option) => option === value);

      if (index >= 0) {
        newValue.splice(index, 1);
      } else {
        newValue.push(value);
      }

      this.query = '';
      this.$el.querySelector('input').focus();
      this.$emit('input', newValue);
    },
    clear() {
      this.$emit('input', this.multiple ? [] : null);
    },
    highlight(label) {
      return label.replace(new RegExp(`(${this.query})`, 'gi'), '<b>$1</b>');
    },
    remove(option) {
      const index = this.value.findIndex((val) => val === option[this.trackBy]);
      this.value.splice(index, 1);
    },
    isSelected(option) {
      return this.multiple
        ? this.value.findIndex((item) => item === option[this.trackBy]) >= 0
        : this.value !== null && this.value === option[this.trackBy];
    },
    keyDown() {
      if (
        this.filteredOptions.length === 0
        || this.loading
        || this.position === this.filteredOptions.length - 1
      ) {
        return;
      }

      this.position = this.position !== null ? ++this.position : 0;

      this.scroll();
    },
    keyUp() {
      if (this.loading || !this.position) {
        return;
      }

      this.position--;
      this.scroll();
    },
    scroll() {
      const dropdown = this.dropdownSelector();
      const option = this.optionSelector();

      if (option.offsetTop < dropdown.scrollTop) {
        dropdown.scrollTop -= dropdown.scrollTop - option.offsetTop;
        return;
      }

      const dropdownBottom = dropdown.scrollTop + dropdown.clientHeight;
      const optionBottom = option.offsetTop + option.clientHeight;

      if (optionBottom > dropdownBottom) {
        dropdown.scrollTop += optionBottom - dropdownBottom;
      }
    },
    dropdownSelector() {
      return this.$el.querySelector('.dropdown-content');
    },
    optionSelector() {
      return this.$el.querySelectorAll('.dropdown-item')[this.position];
    },
    optionLabel(option, label) {
      const optionLabel = label
        .split('.')
        .reduce((result, property) => result[property], option);

      return this.translated ? this.i18n(optionLabel) : optionLabel;
    },
  },
};
</script>

<style lang="scss" scoped>
.icon.angle {
  transition: transform 0.3s ease;

  &[aria-hidden="true"] {
    transform: rotate(180deg);
  }
}

.dropdown {
  width: 100%;

  .dropdown-trigger {
    width: 100%;

    fieldset {
      min-width: 1em;
    }

    .control-input {
      justify-content: flex-start;
      width: 100%;
      min-height: 2.25em;
      height: auto;
      align-items: baseline;
      padding: calc(0.375em - 1px) calc(0.625em - 1px);
      padding-top: calc(0.375em - 1px);
      padding-right: calc(0.625em - 1px);
      padding-bottom: calc(0.375em - 1px);
      padding-left: calc(0.625em - 1px);

      .select-value {
        max-width: calc(100% - 2.5em);
        overflow-x: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        text-align: left;

        .field.is-grouped.is-grouped-multiline {
          .select-input {
            border: 0;
            height: 1.4em;
            margin-top: 0.05em;
            box-shadow: unset;
            padding: 0;
            -webkit-box-shadow: unset;
            width: fit-content;
            background-color: inherit;
          }

          .control:last-child,
          .control:not(:last-child) {
            margin-bottom: 0;
            display: contents;

            .tags:not(:last-child) {
              margin-bottom: 0;
            }
          }
        }

        .angle {
          position: absolute;
          top: 0.55rem;
          right: 0.6rem;
        }

        .delete {
          position: absolute;
          right: 1.7rem;
          top: 0.55rem;
        }

        .is-loading {
          -webkit-animation: spinAround 0.5s infinite linear;
          animation: spinAround 0.5s infinite linear;
          border: 2px solid #dbdbdb;
          border-radius: 290486px;
          border-right-color: transparent;
          border-top-color: transparent;
          content: "";
          display: block;
          height: 1em;
          position: relative;
          width: 1em;
          position: absolute !important;
          right: 1.7rem;
          top: 0.55em;
          z-index: 4;
        }
      }
    }
  }

  .control {
    width: 100%;
  }

  .dropdown-menu {
    width: 100%;
    min-width: 1em;

    .dropdown-content::-webkit-scrollbar {
      display: none;
    }

    .dropdown-content {
      max-height: 13rem;
      overflow-y: auto;

      a.dropdown-item {
        text-overflow: ellipsis;
        overflow-x: hidden;
        padding-right: 2rem;

        .label.tag {
          position: absolute;
          padding: 0.3rem;
          height: 1.3rem;
          z-index: 1;
          right: 1rem;
        }

        .icon.selected {
          position: absolute;
          z-index: 1;
          right: 1rem;
        }
      }
    }
  }
}
</style>
