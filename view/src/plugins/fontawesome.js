import Vue from 'vue';
import {
  library,
} from '@fortawesome/fontawesome-svg-core';
import {
  FontAwesomeIcon,
  FontAwesomeLayers,
} from '@fortawesome/vue-fontawesome';
import {
  faListAlt,
  faUpload,
} from '@fortawesome/free-solid-svg-icons';
import {
  faGithub,
} from '@fortawesome/free-brands-svg-icons';

library.add(faListAlt, faGithub, faUpload);

Vue.component('Fa', FontAwesomeIcon);
Vue.component('Fal', FontAwesomeLayers);
