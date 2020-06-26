const ipcRenderer = require('electron').ipcRenderer;

function debounce (func, wait, immediate) { // credit david walsh
  var timeout;
  return function () {
    var context = this; var args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}
const debouncedStore = function () {
  debounce(() => ipcRenderer.send('storeValue', ['metaObject', this.metaObject]), 1000);
};

const vm = new Vue({
  el: '#vue-container',
  data: {
    metaObject: ipcRenderer.sendSync('getValue', 'metaObject')
  },
  components: {
    'listed-tag': {
      props: ['tag', 'index'],
      template: '<li><label style="padding-left:0;" :for="nameInputId">Name:</label><input type="text" v-model="name" :id="nameInputId" required><label :for="colorInputId">Color:</label><input required type="color" v-model.lazy="color" :id="colorInputId"><button type="button" @click="removeTag"><i class="material-icons">remove</i></button></li>',
      computed: {
        nameInputId: function () {
          return 'tagName' + this.index;
        },
        colorInputId: function () {
          return 'tagColor' + this.index;
        },
        name: {
          get: function () { return this.tag[0]; },
          set: function (newVal) { this.$emit('update-self', this.index, [newVal, this.tag[1]]); }
        },
        color: {
          get: function () { return this.tag[1]; },
          set: function (newVal) { this.$emit('update-self', this.index, [this.tag[0], newVal]); }
        }
      },
      methods: {
        removeTag: function () { this.$emit('remove-self', this.index); }
      }
    },
    'listed-prop': {
      props: ['prop', 'index'],
      template: '<li><label style="padding-left:0" :for="nameInputId">Name:</label><input type="text" v-model="name" :id="nameInputId" required><label :for="typeInputId">Type:</label><select required v-model="type" :id="typeInputId"><option value="String">String</option><option value="Number">Number</option><option value="Boolean">Boolean (yes or no)</option></select><button type="button" @click="removeProp"><i class="material-icons">remove</i></button></li>',
      computed: {
        nameInputId: function () {
          return 'propName' + this.index;
        },
        typeInputId: function () {
          return 'propType' + this.index;
        },
        name: {
          get: function () {
            return this.prop[0];
          },
          set: function (newVal) {
            this.$emit('update-self', this.index, [newVal, this.prop[1]]);
          }
        },
        type: {
          get: function () {
            return this.prop[1];
          },
          set: function (newVal) {
            this.$emit('update-self', this.index, [this.prop[0], newVal]);
          }
        }
      },
      methods: {
        removeProp: function () { this.$emit('remove-self', this.index); }
      }
    }
  },
  methods: {
    addTag: function () {
      this.$set(this.metaObject.tagList, this.metaObject.tagList.length, ['', '#000000']);
      this.sendChangesToParent();
    },
    addProp: function () {
      this.$set(this.metaObject.propList, this.metaObject.propList.length, ['', 'String']);
      this.sendChangesToParent();
    },
    updateTag: function (index, newVal) {
      this.$set(this.metaObject.tagList, index, newVal);
      this.sendChangesToParent();
    },
    updateProp: function (index, newVal) {
      this.$set(this.metaObject.propList, index, newVal);
      this.sendChangesToParent();
    },
    removeTag: function (index) {
      this.$set(this.metaObject, 'files', this.metaObject.files.map(el => { // FIXME: could cause a bottleneck if there are a ton of files &&/|| tags
        el.tags = el.tags.reduce((acc, n) => {
          if (n !== index) {
            acc.push(n > index ? n - 1 : n);
          }
          return acc;
        }, []);
        return el;
      }));
      this.$delete(this.metaObject.tagList, index);
      this.sendChangesToParent();
    },
    removeProp: function (index) {
      this.$delete(this.metaObject.propList, index);
      this.sendChangesToParent();
    },
    sendChangesToParent: function () {
      debouncedStore();
    }
  }
});

window.onbeforeunload = function () {
  ipcRenderer.send('storeValue', ['metaObject', vm.metaObject]);
};
