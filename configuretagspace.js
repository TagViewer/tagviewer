const app = require('electron').remote;
const ipcRenderer = require('electron').ipcRenderer;
const fs = require('fs');
const path = require('path');
const imageSize = require('image-size');

const fallbackRef = (obj, key, fallback) => Object.prototype.hasOwnProperty.call(obj, key) ? obj[key] : fallback;
let config = {};
if (fs.existsSync('config.json')) {
  config = JSON.parse(fs.readFileSync('config.json'));
}
const creationdir = ipcRenderer.sendSync('getValue', 'creationdir');
// eslint-disable-next-line no-new
new Vue({
  el: '#vue-container',
  data: {
    tagList: fallbackRef(config, 'defaultTags', [['Favorite', '#fed330'], ['Low-Quality', '#26de81'], ['Important', '#fd9644']]),
    propList: fallbackRef(config, 'defaultProps', [['Description', 'String']]),
    tagspaceTitle: '',
    tagspaceDescription: '',
    tagviewerData: {}
  },
  components: {
    'listed-tag': {
      props: {
        name: String,
        color: { validator: string => ((/^#([\dabcdef]{3}|[\dabcdef]{6})$/).test(string)) },
        ckey: Number
      },
      template: '<li><label style="padding-left:0;" :for="nameInputId">Name:</label><input type="text" v-model.lazy="localName" :id="nameInputId" required><label :for="colorInputId">Color:</label><input required type="color" v-model.lazy="localColor" :id="colorInputId"><button type="button" @click="removeTag"><i class="material-icons">remove</i></button></li>',
      data: function () {
        return {
          localName: this.name,
          localColor: this.color
        };
      },
      computed: {
        nameInputId: function () {
          return `tagName${this.ckey}`;
        },
        colorInputId: function () {
          return `tagColor${this.ckey}`;
        }
      },
      watch: {
        localName: function () {
          this.$emit('update-name', this.ckey, this.localName);
        },
        localColor: function () {
          this.$emit('update-color', this.ckey, this.localColor);
        },
        name: function (val) {
          this.localName = val;
        },
        color: function (val) {
          this.localColor = val;
        }
      },
      methods: {
        removeTag: function () {
          this.$emit('remove-tag', this.ckey);
        }
      }
    },
    'listed-prop': {
      props: {
        name: String,
        type: {
          validator: function (string) {
            return ['String', 'Number', 'Boolean', 'Size', 'Resolution'].indexOf(string) !== -1;
          }
        },
        ckey: Number,
        disabled: Boolean
      },
      template: '<li><label style="padding-left:0" v-bind:for="nameInputId">Name:</label><input type="text" v-model.lazy="localName" v-bind:disabled="disabled" v-bind:id="nameInputId" required><label v-bind:for="typeInputId">Type:</label><select required v-model.lazy="localType" v-bind:disabled="disabled" :id="typeInputId"><option value="String">String</option><option value="Number">Number</option><option value="Boolean">Boolean (yes or no)</option></select><button type="button" @click="removeProp" :style="{visibility:disabled?\'hidden\':\'visible\'}" :disabled="disabled"><i class="material-icons">remove</i></button></li>',
      data: function () {
        return {
          localName: this.name,
          localType: this.type
        };
      },
      computed: {
        nameInputId: function () {
          return `propName${this.ckey}`;
        },
        typeInputId: function () {
          return `propType${this.ckey}`;
        }
      },
      watch: {
        localName: function (newValue) {
          this.$emit('update-name', this.ckey, newValue);
        },
        localType: function (newValue) {
          this.$emit('update-type', this.ckey, newValue);
        },
        name: function (newValue) {
          this.localName = newValue;
        },
        type: function (newValue) {
          this.localType = newValue;
        }
      },
      methods: {
        removeProp: function () {
          this.$emit('remove-prop', this.ckey);
        }
      }
    }
  },
  methods: {
    updateTagName: function (index, newValue) { this.tagList[index][0] = newValue; },
    updateTagColor: function (index, newValue) { this.tagList[index][1] = newValue; },
    removeTag: function (index) { this.$delete(this.tagList, index); },
    addTag: function () { this.tagList.push(['', '#000000']); setTimeout(() => document.querySelector('#tag-list > li:last-of-type > input:first-of-type').focus(), 50); },
    updatePropName: function (index, newValue) { this.propList[index][0] = newValue; },
    updatePropType: function (index, newValue) { this.propList[index][1] = newValue; },
    removeProp: function (index) { this.$delete(this.propList, index); },
    addProp: function () { this.propList.push(['', 'String']); setTimeout(() => document.querySelector('#prop-list > li:last-of-type > input:first-of-type').focus(), 50); },
    createTagspace: function () {
      this.tagviewerData = { title: this.tagspaceTitle, description: this.tagspaceDescription, tagList: this.tagList, deletedTags: [], propList: this.propList, files: [] };
      this.addImages();
    },
    addImages: function () {
      const fileList = app.dialog.showOpenDialogSync(app.getCurrentWindow(), {
        title: 'Add Media',
        filters: [{ name: 'Images', extensions: ['gif', 'png', 'jpg', 'jpeg', 'svg', 'webp'] }, { name: 'Videos', extensions: ['.flac', '.mp4', '.webm', '.wav'] }, { name: 'All Media', extensions: ['gif', 'png', 'jpg', 'jpeg', 'svg', 'webp', '.flac', '.mp4', '.webm', '.wav'] }],
        properties: ['openFile', 'multiSelections'],
        message: "Cancel if you don't want to add media at this stage."
      });
      if (fileList !== undefined) {
        for (const i in fileList) {
          const file = fileList[i];
          fs.copyFileSync(file, path.join(creationdir, i + path.extname(file))); // should this be synchronous?
          this.tagviewerData.files[i] = {
            _index: i,
            _path: i + path.extname(file),
            _origBasename: path.basename(file),
            tags: [],
            props: {},
            title: path.parse(file).name,
            size: fs.statSync(file).size,
            resolution: ((['.flac', '.mp4', '.webm', '.wav'].includes(path.extname(file))) ? [-1, -1] : (a => [a.width, a.height])(imageSize(file)))
          };
        }
      }
      this.tagviewerData.currentIndex = fileList !== undefined ? fileList.length : 0;
      fs.writeFile(path.join(creationdir, 'tagviewer.json'), JSON.stringify(this.tagviewerData, null, 2), () => ipcRenderer.send('doneCreating'));
    }
  }
});
