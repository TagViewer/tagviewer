const { ipcRenderer } = require('electron');

/**
 * Try to get key from object, but return fallback if not available.
 * @param {(object|array)} obj - The object (or arrays)
 * @param {(string|number)} key - The key (can be a number in the case of an array)
 * @param {any} fallback - Fallback value if the key is not present in the object.
 */
const fallbackRef = (obj, key, fallback) => Object.prototype.hasOwnProperty.call(obj, key) ? obj[key] : fallback;

const vm = new Vue({
  el: '#vue-container',
  data: {
    configObject: ipcRenderer.sendSync('getValue', 'configObject'),
    currentPage: 'Interface'
  },
  computed: {
    saveWidths: {
      get: function () {
        return !fallbackRef(this.configObject, 'noSaveWidths', false);
      },
      set: function (newVal) {
        this.configObject.noSaveWidths = !newVal;
      }
    },
    offerPrevLocation: {
      get: function () {
        return fallbackRef(this.configObject, 'offerPrevLocation', true);
      },
      set: function (newVal) {
        this.configObject.offerPrevLocation = newVal;
      }
    },
    resumeSessionOnRestart: {
      get: function () {
        return fallbackRef(this.configObject, 'resumeSessionOnRestart', false);
      },
      set: function (newVal) {
        this.configObject.resumeSessionOnRestart = newVal;
      }
    },
    slideshowInterval: {
      get: function () {
        return fallbackRef(this.configObject, 'slideshowInterval', 1000) * 0.001;
      },
      set: function (newVal) {
        this.configObject.slideshowInterval = newVal * 1000;
      }
    },
    endSlideshowOnFSExit: {
      get: function () {
        return fallbackRef(this.configObject, 'endSlideshowOnFSExit', true);
      },
      set: function (newVal) {
        this.configObject.endSlideshowOnFSExit = newVal;
      }
    },
    stopSlideshowAtEnd: {
      get: function () {
        return fallbackRef(this.configObject, 'stopSlideshowAtEnd', false);
      },
      set: function (newVal) {
        this.configObject.stopSlideshowAtEnd = newVal;
      }
    }
  },
  components: {
    'nav-sidebar': {
      data: () => ({
        pages: [
          'Interface',
          'General',
          'Slideshow'
        ]
      }),
      props: ['currentPage'],
      template: '<ul id="nav-sidebar"><li v-for="item in pages" @click="openSelf(item)" :data-active="item === currentPage">{{ item }}</li></ul>',
      methods: {
        openSelf: function (page) {
          this.$emit('update:currentPage', page);
        }
      }
    }
  }
});

window.onbeforeunload = function () {
  ipcRenderer.sendSync('storeValue', ['configObject', vm.configObject]);
};
