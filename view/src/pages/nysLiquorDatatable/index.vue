<template>
  <div>
    <div class="columns">
      <div class="column is-3-desktop is-8-tablet is-12-mobile">
        <vue-select-filter
          class="box"
          title="License Type"
          multiple
          :source="'api/v1/liquor-license-type'"
          v-model="filters.license_type"
        />
      </div>
      <div class="column is-3-desktop is-8-tablet is-12-mobile">
        <vue-select-filter
          class="box"
          title="License Status"
          multiple
          :options="licenseStatuses"
          v-model="filters.license_status"
        />
      </div>
      <div class="column is-3-desktop is-8-tablet is-12-mobile">
        <date-interval-filter
          class="box"
          title="Filing Date"
          @update="intervals.filing_date.min = $event.min; intervals.filing_date.max = $event.max;"
        />
      </div>
      <div class="column is-3-desktop is-8-tablet is-12-mobile">
        <date-interval-filter
          class="box"
          title="Effective Date"
          @update="intervals.effective_date.min = $event.min; intervals.effective_date.max = $event.max;"
        />
      </div>
    </div>
    <div>
      <div class="column is-3-desktop is-8-tablet is-12-mobile">
        <date-interval-filter
          class="box"
          title="Expiration Date"
          @update="intervals.expiration_date.min = $event.min; intervals.expiration_date.max = $event.max;"
        />
      </div>
    </div>
    <vue-table
      class="box is-paddingless raises-on-hover is-rounded"
      :path="path"
      :filters="filters"
      :intervals="intervals"
      :id="'nys-liquor'"
    >
      <span
        slot="type"
        slot-scope="{ row }"
        :class="[
          'tag is-table-tag',
          row.isRead ? 'is-success' : 'is-warning'
        ]"
      >
        {{ row.type }}
      </span>
    </vue-table>
  </div>
</template>

<script>
import { library } from '@fortawesome/fontawesome-svg-core';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import VueTable from '../../components/vuedatatable/VueTable.vue';
import VueSelectFilter from '../../components/select/VueSelectFilter.vue';
import DateIntervalFilter from '../../components/bulma/DateIntervalFilter.vue';

library.add(faEye);

export default {
  name: 'NysLiquorDatatable',

  components: { DateIntervalFilter, VueSelectFilter, VueTable },

  data() {
    return {
      path: '/template.json',
      licenseStatus: [],
      licenseTypes: [],
      filters: {
        license_status: [],
        license_type: [],
      },
      intervals: {
        filing_date: {
          min: null,
          max: null,
          dbDateFormat: 'Y-m-d',
        },
        effective_date: {
          min: null,
          max: null,
          dbDateFormat: 'Y-m-d',
        },
        expiration_date: {
          min: null,
          max: null,
          dbDateFormat: 'Y-m-d',
        },
      },
    };
  },

  created() {
    this.licenseStatuses = [
      { name: 'License is Active', id: 'active' },
      { name: 'License is Inactive', id: 'inactive' },
      { name: 'Expired', id: 'expired' },
      { name: 'Pending', id: 'pending' },
      { name: 'Operating Under Sapa', id: 'operating_under_spa' },
    ];
  },
};
</script>
