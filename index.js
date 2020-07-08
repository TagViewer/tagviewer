const { remote: app, ipcRenderer, remote: { dialog } } = require('electron');
const fs = require('fs-extra');
const trash = require('trash');
const path = require('path');
const imageSize = require('image-size');

// #region Construct the application's menu
/**
 * Process application menu clicks
 * @param {object} item - passed by Electron when an item bound to this function is clicked.
*/
const menuClick = item => {
  [
    vm.newTagspaceDialog,
    vm.openTagspaceDialog,
    () => { if (store.getters.tagspaceIsOpen) vm.addMediaDialog(); },
    () => { vm.configureTagSpaceDialog(); },
    null,
    vm.replaceMedia,
    vm.deleteMedia,
    vm.viewMediaExternal,
    () => { if (vm.canGoToFirst) vm.goToFirstMedia(); },
    () => { if (vm.canGoBack) vm.goToPreviousMedia(); },
    () => { if (vm.haveMediaOptions) document.getElementById('media-number').select(); },
    () => { if (vm.canGoForward) vm.goToNextMedia(); },
    () => { if (vm.canGoToLast) vm.goToLastMedia(); },
    () => { if (vm.tagspaceIsOpen) vm.newFilterTextQuake(); },
    () => { if (vm.tagspaceIsOpen) vm.asideTab = 1; },
    () => { if (vm.tagspaceIsOpen) vm.editFilterTextQuake(); },
    () => { if (store.getters.filtersActive) store.dispatch('clearAllFilters'); },
    () => vm.settingsDialog(),
    () => app.shell.openShell(path.join(app.app.getPath('userData'), 'config.json')),
    () => vm.aboutDialog(),
    () => vm.helpDialog(),
    () => { if (vm.haveMediaOptions) vm.startSlideshow(); },
    () => { if (vm.haveMediaOptions) vm.startSlideshowFS(); },
    () => { if (vm.haveMediaOptions) vm.endSlideshow(); },
    () => { vm.isFullscreen = !vm.isFullscreen; },
    () => { if (!(vm.tagspaceIsOpen || !(config.offerPrevLocation ?? true) || cache.openDirectory === '' || fs.existsSync(path.join(cache.openDirectory, 'tagviewer.json')))) vm.openPreviousTagspace(); }
  ][parseInt(item.id, 10)]();
};
const mainMenu = new app.Menu();
const tagspaceMenu = new app.Menu();
tagspaceMenu.append(new app.MenuItem({
  click: menuClick,
  accelerator: 'CmdOrCtrl+N',
  label: 'New TagSpace...',
  id: '0'
}));
tagspaceMenu.append(new app.MenuItem({
  click: menuClick,
  accelerator: 'CmdOrCtrl+O',
  label: 'Open TagSpace...',
  id: '1'
}));
tagspaceMenu.append(new app.MenuItem({
  click: menuClick,
  accelerator: 'CmdOrCtrl+Shift+O',
  label: 'Open Previous TagSpace...',
  id: '25'
}));
tagspaceMenu.append(new app.MenuItem({
  click: menuClick,
  accelerator: 'CmdOrCtrl+I',
  label: 'Add Media...',
  id: '2'
}));
tagspaceMenu.append(new app.MenuItem({
  type: 'separator'
}));
tagspaceMenu.append(new app.MenuItem({
  click: menuClick,
  label: 'Configure TagSpace...',
  id: '3'
}));
mainMenu.append(new app.MenuItem({
  label: '&TagSpace',
  submenu: tagspaceMenu
}));
const mediaMenu = new app.Menu();
mediaMenu.append(new app.MenuItem({
  click: menuClick,
  accelerator: 'CmdOrCtrl+H',
  label: 'Replace Current Media...',
  id: '5'
}));
mediaMenu.append(new app.MenuItem({
  click: menuClick,
  accelerator: 'CmdOrCtrl+Backspace',
  label: 'Delete Current Media',
  id: '6'
}));
mediaMenu.append(new app.MenuItem({
  click: menuClick,
  accelerator: 'CmdOrCtrl+P',
  label: 'Open Current Media Externally',
  id: '7'
}));
mediaMenu.append(new app.MenuItem({
  type: 'separator'
}));
mediaMenu.append(new app.MenuItem({
  click: menuClick,
  accelerator: 'Home',
  label: 'Go to First Media',
  id: '8'
}));
mediaMenu.append(new app.MenuItem({
  click: menuClick,
  accelerator: 'Left',
  label: 'Go to Previous Media',
  id: '9'
}));
mediaMenu.append(new app.MenuItem({
  click: menuClick,
  accelerator: 'CmdOrCtrl+G',
  label: 'Go to...',
  id: '10'
}));
mediaMenu.append(new app.MenuItem({
  click: menuClick,
  accelerator: 'Right',
  label: 'Go to Next Media',
  id: '11'
}));
mediaMenu.append(new app.MenuItem({
  click: menuClick,
  accelerator: 'End',
  label: 'Go to Last Media',
  id: '12'
}));
mediaMenu.append(new app.MenuItem({
  type: 'separator'
}));
mediaMenu.append(new app.MenuItem({
  click: menuClick,
  accelerator: 'CmdOrCtrl+S',
  label: 'Start Slideshow',
  id: '21'
}));
mediaMenu.append(new app.MenuItem({
  click: menuClick,
  accelerator: 'CmdOrCtrl+Alt+S',
  label: 'Start Slideshow (Fullscreen)',
  id: '22'
}));
mediaMenu.append(new app.MenuItem({
  click: menuClick,
  accelerator: 'CmdOrCtrl+Shift+S',
  label: 'End Slideshow',
  id: '23'
}));
mainMenu.append(new app.MenuItem({
  label: '&Media',
  submenu: mediaMenu
}));
const filterMenu = new app.Menu();
filterMenu.append(new app.MenuItem({
  click: menuClick,
  accelerator: 'CmdOrCtrl+Shift+F',
  label: 'New Filter (Text)...',
  id: '13'
}));
filterMenu.append(new app.MenuItem({
  click: menuClick,
  accelerator: 'CmdOrCtrl+Alt+F',
  label: 'Edit Filter (UI)...',
  id: '14'
}));
filterMenu.append(new app.MenuItem({
  click: menuClick,
  accelerator: 'CmdOrCtrl+Alt+Shift+F',
  label: 'Edit Filter (Text)...',
  id: '15'
}));
filterMenu.append(new app.MenuItem({
  click: menuClick,
  accelerator: 'CmdOrCtrl+Alt+C',
  label: 'Clear all Filters',
  id: '16'
}));
mainMenu.append(new app.MenuItem({
  label: '&Filter',
  submenu: filterMenu
}));
const appMenu = new app.Menu();
appMenu.append(new app.MenuItem({
  role: 'togglefullscreen',
  accelerator: 'F11',
  label: 'Fullscreen'
}));
appMenu.append(new app.MenuItem({
  role: 'zoomIn',
  accelerator: 'CmdOrCtrl+Plus',
  label: 'Zoom In'
}));
appMenu.append(new app.MenuItem({
  role: 'zoomOut',
  accelerator: 'CmdOrCtrl+-',
  label: 'Zoom Out'
}));
appMenu.append(new app.MenuItem({
  role: 'resetZoom',
  accelerator: 'CmdOrCtrl+=',
  label: 'Reset Zoom'
}));
appMenu.append(new app.MenuItem({
  click: menuClick,
  accelerator: 'F11',
  label: 'Toggle Fullscreen',
  id: '24'
}));
appMenu.append(new app.MenuItem({
  role: 'close',
  accelerator: 'CmdOrCtrl+Q',
  label: 'Close'
}));
appMenu.append(new app.MenuItem({
  role: 'toggleDevTools',
  accelerator: 'CmdOrCtrl+Shift+I',
  label: 'Toggle DevTools'
}));
appMenu.append(new app.MenuItem({
  type: 'separator'
}));
appMenu.append(new app.MenuItem({
  click: menuClick,
  accelerator: 'CmdOrCtrl+,',
  label: 'Settings (UI)',
  id: '17'
}));
appMenu.append(new app.MenuItem({
  click: menuClick,
  accelerator: 'CmdOrCtrl+Shift+,',
  label: 'Settings (JSON)',
  id: '18'
}));
appMenu.append(new app.MenuItem({
  click: menuClick,
  label: 'About TagViewer',
  id: '19'
}));
appMenu.append(new app.MenuItem({
  click: menuClick,
  accelerator: 'CmdOrCtrl+Shift+/',
  label: 'Help',
  id: '20'
}));
mainMenu.append(new app.MenuItem({
  label: '&App',
  submenu: appMenu
}));
app.Menu.setApplicationMenu(mainMenu);
// #endregion

ipcRenderer.on('syncMetadata', () => {
  store.dispatch('syncMetadata');
  ipcRenderer.send('metadataSynced');
});

/**
 * Only run a function if it hasn't been run for wait milliseconds.
 * @param {function} func - The function to run.
 * @param {number} wait - How long to wait before executing the function.
 * @param {boolean=} immediate - Rising edge? (probably not)
 */
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

/**
 * Convert from hex to HSL
 * @param {string} H - the hex number to convert to HSL
 */
function hexToHSL (H) { // credit CSS Tricks
  let r = 0; let g = 0; let b = 0;
  if (H.length === 4) {
    r = `0x${H[1]}${H[1]}`;
    g = `0x${H[2]}${H[2]}`;
    b = `0x${H[3]}${H[3]}`;
  } else if (H.length === 7) {
    r = `0x${H[1]}${H[2]}`;
    g = `0x${H[3]}${H[4]}`;
    b = `0x${H[5]}${H[6]}`;
  }
  r /= 255;
  g /= 255;
  b /= 255;
  const cmin = Math.min(r, g, b);
  const cmax = Math.max(r, g, b);
  const delta = cmax - cmin;
  let h = 0;
  let s = 0;
  let l = 0;

  if (delta === 0) { h = 0; } else if (cmax === r) { h = ((g - b) / delta) % 6; } else if (cmax === g) { h = (b - r) / delta + 2; } else { h = (r - g) / delta + 4; }

  h = Math.round(h * 60);

  if (h < 0) { h += 360; }

  l = (cmax + cmin) / 2;
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return [h, s, l];
}
/**
 * Clamp the number (if n's below min, return min, and vice versa for max, otherwise return n)
 * @param {number} min - The minimum
 * @param {number} n - The number
 * @param {number} max - The maximum
 */
const clamp = (min, n, max) => Math.max(Math.min(n, max), min);
/**
 * Return a human file size (3GB, 2MB, etc) when given a number of bytes.
 * @param {number} bytes - The raw number of bytes
 * @param {boolean} si - If true, each level is 1000 of the previous (and use normal prefixes); if not, 1024 (and use kebi, mebi, gebi, etc prefixes)
 * @param {number} dp - Degree of precision; # of decimals
 */
function humanFileSize (bytes, si = false, dp = 1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return `${bytes} B`;
  }

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

  return `${bytes.toFixed(dp)} ${units[u]}`;
}

/**
 * The version, to be used wherever it's needed.
 * @type {string}
 * @constant
 */
const _version = '1.0.0';
document.title = `TagViewer ${_version}`;

let config = {}; let cache = {}; const safeMode = [false, false];
if (fs.existsSync(path.join(app.app.getPath('userData'), 'config.json'))) {
  try {
    config = fs.readJsonSync(path.join(app.app.getPath('userData'), 'config.json'));
  } catch (e) {
    dialog.showErrorBox('Error parsing config.json', `We've encountered an error while parsing the configuration file. If you've edited the file, please find the error and fix it. If not, this is an issue with TagViewer, that you should report on GitHub. Due to this error, changes to the configuration will not be saved until you either rectify the error or delete the configuration completely. The error is as follows: ${e.toString()}`);
    safeMode[0] = true;
  }
} else {
  fs.writeJson(path.join(app.app.getPath('userData'), 'config.json'), {});
}
if (fs.existsSync(path.join(app.app.getPath('userData'), 'cache.json'))) {
  try {
    cache = fs.readJsonSync(path.join(app.app.getPath('userData'), 'cache.json'));
  } catch (e) {
    dialog.showErrorBox('Error parsing cache.json', `We've encountered an error while parsing the cache file. If you've edited the file, please find the error and fix it. If not, this is an issue with TagViewer, that you should report on GitHub. Due to this error, changes to the cache will not be saved until you either rectify the error or delete the cache completely. The error is as follows: ${e.toString()}`);
    safeMode[1] = true;
  }
} else {
  fs.writeJson(path.join(app.app.getPath('userData'), 'config.json'), {});
}
if (!Object.prototype.hasOwnProperty.call(cache, 'openHistory')) cache.openHistory = [];

const setInterfaceTheme = theme => {
  new Map(Object.assign(Object.entries({
    'default-light': {
      '--root-font': 'sans-serif',
      '--main-background-color': '#fff',
      '--secondary-background-color': '#f7f7f7',
      '--tertiary-background-color': '#7f7f7f',
      '--main-foreground-color': '#000',
      '--main-foreground-color_disabled': 'darkgrey',
      '--secondary-foreground-color': '#555', // used?
      '--icon-color': '#111',
      '--icon-color_disabled': 'darkgrey',
      '--icon-hover-shadow-string': '0 0 3px 2px #0004',
      '--link-color': '#3676e8',
      '--focus-color': '#f0af2f',
      '--error-color': '#ff5252'
    },
    'default-dark': {
      '--root-font': 'sans-serif',
      '--main-background-color': '#121212', // not true black!
      '--secondary-background-color': '#1a1a1a',
      '--tertiary-background-color': '#303030',
      '--main-foreground-color': '#fffffff7',
      '--main-foreground-color_disabled': '#ddddddf7',
      '--secondary-foreground-color': '#a6a6a6',
      '--icon-color': '#ffffff',
      '--icon-color_disabled': '#ddddddf7',
      '--icon-hover-shadow-string': '0 0 3px 2px #ffffffaa',
      '--link-color': '#96c6e0f7',
      '--focus-color': '#f0c37af7',
      '--error-color': '#f77e7e'
    }
  }[theme]), config.themeOverrides ?? {})).forEach((value, key) => document.documentElement.style.setProperty(key, value));
  try { document.getElementById('style-injector').remove(); } catch (e) { /* null check operator, where are you when I need you? */ }
  const styleInjector = document.createElement('STYLE');
  styleInjector.id = 'style-injector';
  styleInjector.appendChild(document.createTextNode({
    'default-light': '',
    'default-dark': 'body > div #top-bar > button { outline: 0; }'
  }[theme] + (config.themeInjections ?? '')));
  document.body.appendChild(styleInjector);
};

if (Object.prototype.hasOwnProperty.call(config, 'theme') && config.theme !== 'default-light') setInterfaceTheme(config.theme);

/**
 * An array in the format [type, options] describing a filter
 * @typedef filterArray
 * @type {array}
 * @member {string} - The type of the filter ('tag', 'tagColor', etc)
 * @member {object} - The options for the filter (dependent on the type)
 */
/**
 * Apply the filters to the array
 * @param {object[]} array - The array to apply the filters to
 * @param {filterArray[]} filters - The array of filters
 * @returns {object[]} - The filtered array
 * @function
 */
const applyFilters = (array, filters) => {
  for (const filter of filters) {
    const filterFn = generateFilter(filter);
    array = array.filter(el => filterFn(el));
  }
  return array;
};
/**
 * Generate a function from a filter
 * @param {filterArray} filter - The filter, in the format specified
 * @returns {function(object): boolean} - A function to test whether an item matches the filter
 * @function
 */
const generateFilter = filter => {
  switch (filter[0]) { // type
    case 'tag': // args: positive as Boolean, tag as String
      if (filter[1].positive) { // either positive (require tag)
        //          |-> the number prefix
        return n => n.tags.includes(filter[1].tag);
      } else { // or not (exclude tag)
        return n => !n.tags.includes(filter[1].tag);
      }
    case 'tagColor': // args: positive as Boolean, color as String in 6-digit lowercase hex format
      if (filter[1].positive) {
        return n => n.tags.map(el => store.state.tagviewerMeta.tagList[el][1]).includes(filter[1].color);
      } else {
        return n => !n.tags.map(el => store.state.tagviewerMeta.tagList[el][1]).includes(filter[1].color);
      }
    case 'propBoolean': // args: positive as Boolean for whether to need true or false, inclNoval for what do if it's not defined.
      if (filter[1].positive) {
        return n => (n.props[filter[1].prop] ?? !!filter[1].inclNoval);
      } else {
        return n => !(n.props[filter[1].prop] ?? !filter[1].inclNoval);
      }
    case 'propSize':
      if (filter[1].condition === '=') {
        return n => (n.size === parseInt(filter[1].val, 10));
      }
      if (filter[1].condition === '>') {
        return n => (n.size > parseInt(filter[1].val, 10));
      }
      if (filter[1].condition === '<') {
        return n => (n.size < parseInt(filter[1].val, 10));
      }
      if (filter[1].condition === '!=' || filter[1].condition === '≠') {
        return n => (n.size !== parseInt(filter[1].val, 10));
      }
      if (filter[1].condition === '<=' || filter[1].condition === '≤') {
        return n => (n.size <= parseInt(filter[1].val, 10));
      }
      if (filter[1].condition === '>=' || filter[1].condition === '≥') {
        return n => (n.size >= parseInt(filter[1].val, 10));
      }
      break;
    case 'propResolution':
      if (filter[1].condition === '=') {
        return n => ((n.resolution[0] !== -1 || filter[1].inclNoval) && n.resolution[0] === parseInt(filter[1].val[0], 10) && n.resolution[1] === parseInt(filter[1].val[1], 10));
      }
      if (filter[1].condition === '>') {
        return n => ((n.resolution[0] !== -1 || filter[1].inclNoval) && n.resolution[0] * n.resolution[1] > parseInt(filter[1].val[0], 10) * parseInt(filter[1].val[1], 10)); // use total pixels
      }
      if (filter[1].condition === '<') {
        return n => ((n.resolution[0] !== -1 || filter[1].inclNoval) && n.resolution[0] * n.resolution[1] < parseInt(filter[1].val[0], 10) * parseInt(filter[1].val[1], 10));
      }
      if (filter[1].condition === '!=' || filter[1].condition === '≠') {
        return n => ((n.resolution[0] !== -1 || filter[1].inclNoval) && n.resolution[0] * n.resolution[1] !== parseInt(filter[1].val[0], 10) * parseInt(filter[1].val[1], 10));
      }
      if (filter[1].condition === '<=' || filter[1].condition === '≤') {
        return n => ((n.resolution[0] !== -1 || filter[1].inclNoval) && n.resolution[0] * n.resolution[1] <= parseInt(filter[1].val[0], 10) * parseInt(filter[1].val[1], 10));
      }
      if (filter[1].condition === '>=' || filter[1].condition === '≥') {
        return n => ((n.resolution[0] !== -1 || filter[1].inclNoval) && n.resolution[0] * n.resolution[1] >= parseInt(filter[1].val[0], 10) * parseInt(filter[1].val[1], 10));
      }
      break;
    case 'propNumber': // args: condition as String representing comparison, prop as String for the prop, val as Number for the value (includes Size) (and this is also for numericals like Size, Dimension, and Duration since they're stored in one unit—bytes, millimeters, and seconds respectively)
      if (filter[1].condition === '=') {
        return n => ((n.props[filter[1].prop] ?? (filter[1].inclNoval ? filter[1].val : NaN)) === parseInt(filter[1].val, 10));
      }
      if (filter[1].condition === '>') {
        return n => ((n.props[filter[1].prop] ?? (filter[1].inclNoval ? filter[1].val + 1 : NaN)) > parseInt(filter[1].val, 10));
      }
      if (filter[1].condition === '<') {
        return n => ((n.props[filter[1].prop] ?? (filter[1].inclNoval ? filter[1].val - 1 : NaN)) < parseInt(filter[1].val, 10));
      }
      if (filter[1].condition === '!=' || filter[1].condition === '≠') {
        return n => ((n.props[filter[1].prop] ?? (filter[1].inclNoval ? NaN : parseInt(filter[1].val, 10))) !== parseInt(filter[1].val, 10));
      }
      if (filter[1].condition === '<=' || filter[1].condition === '≤') {
        return n => ((n.props[filter[1].prop] ?? (filter[1].inclNoval ? filter[1].val : NaN)) <= parseInt(filter[1].val, 10));
      }
      if (filter[1].condition === '>=' || filter[1].condition === '≥') {
        return n => ((n.props[filter[1].prop] ?? (filter[1].inclNoval ? filter[1].val : NaN)) >= parseInt(filter[1].val, 10));
      }
      break;
    case 'propString': // args: same but condition can only be = or !=, and val is a String (includes Title comparisons)
      if (!filter[1].caseSensitive) {
        if (filter[1].condition === '=') {
          return n => ((filter[1].prop === 'Title' ? n.title.toLowerCase() : (n.props[filter[1].prop] ?? (filter[1].inclNoval ? filter[1].val : NaN))).toLowerCase() === filter[1].val.toLowerCase());
        }
        if (filter[1].condition === '!=' || filter[1].condition === '≠') {
          return n => !((filter[1].prop === 'Title' ? n.title.toLowerCase() : (n.props[filter[1].prop] ?? (filter[1].inclNoval ? NaN : filter[1].val))) === filter[1].val.toLowerCase());
        }
        if (filter[1].condition === '{}' || filter[1].condition === 'includes') { // contains
          return n => ((filter[1].prop === 'Title' ? n.title.toLowerCase() : (n.props[filter[1].prop] ?? (filter[1].inclNoval ? filter[1].val : ''))).includes(filter[1].val.toLowerCase()));
        }
        if (filter[1].condition === '!{' || filter[1].condition === "doesn't include") { // doesn't contain
          return n => !((filter[1].prop === 'Title' ? n.title.toLowerCase() : (n.props[filter[1].prop] ?? (filter[1].inclNoval ? '' : filter[1].val))).includes(filter[1].val.toLowerCase()));
        }
      } else {
        if (filter[1].condition === '=' || filter[1].condition === 'is same as') {
          return n => ((filter[1].prop === 'Title' ? n.title : (n.props[filter[1].prop] ?? (filter[1].inclNoval ? filter[1].val : NaN))) === filter[1].val);
        }
        if (filter[1].condition === '!=' || filter[1].condition === 'is not same as') {
          return n => !((filter[1].prop === 'Title' ? n.title : (n.props[filter[1].prop] ?? (filter[1].inclNoval ? NaN : filter[1].val))) === filter[1].val);
        }
        if (filter[1].condition === '{}' || filter[1].condition === 'includes') { // contains
          return n => ((filter[1].prop === 'Title' ? n.title : (n.props[filter[1].prop] ?? (filter[1].inclNoval ? filter[1].val : ''))).includes(filter[1].val));
        }
        if (filter[1].condition === '!{' || filter[1].condition === "doesn't include") { // doesn't contain
          return n => !((filter[1].prop === 'Title' ? n.title : (n.props[filter[1].prop] ?? (filter[1].inclNoval ? '' : filter[1].val))).includes(filter[1].val));
        }
      }
      break;
    case 'propList': // supports inclusions and exclusions only so far
      if (filter[1].positive) { // no such thing as Noval for a list
        return n => ((n.props[filter[1].prop] ?? ([])).includes(filter[1].val));
      } else {
        return n => !((n.props[filter[1].prop] ?? ([])).includes(filter[1].val));
      }
  }
};
/**
 * Convert an array of filterArrays to a string to be used in the filter quake dialog.
 * @param {filterArray[]} filters - the array of filters
 * @returns {string} - the filters, stringified
 * @function
 */
const stringifyFilter = filters => {
  const ret = [];
  for (const filter of filters) {
    ret.push(`${(filter[1].positive ? '+' : '-') + { tag: 'tag', tagColor: 'color' }[filter[0]]}:${filter[1][{ tag: 'tag', tagColor: 'color' }[filter[0]]]}`); // TODO add properties
  }
  return ret.join(' ');
};
/**
 * Remove quotes if they are present and matching
 * @param {string} str - the string to check for quotes and remove if present and matching
 * @returns {string} - the string stripped of quotes
 * @function
 */
const removeQuotes = str => (str[0] === "'" && str.slice(-1) === "'") || (str[0] === '"' && str.slice(-1) === '"') ? str.slice(1, -1) : str;
/**
 * Convert the string filter to a filterArray
 * @param {string} param - the filter in string format
 * @returns {filterArray} - the filter in filterArray format
 * @throws {SyntaxError} If the syntax of the string is not correct
 * @throws {ReferenceError} If a referenced  tag, color, or prop is referenced as the wrong type or is nonexistent
 * @function
 */
const convertFilter = param => {
  if (!(['+', '-'].includes(param[0]))) throw new SyntaxError('A filter was specified without a sign (+ or -).');
  const positive = param[0] === '+';
  switch (param.substring(1, param.indexOf(':'))) {
    case 'tag':
      if (Object.prototype.hasOwnProperty.call(store.getters.tagLookup, param.substring(param.indexOf(':') + 1))) throw new ReferenceError('The tag specified does not exist in this TagSpace. You may need to check your spelling.');
      return ['tag', { positive, tag: removeQuotes(param.substring(param.indexOf(':') + 1)), color: store.getters.tagLookup[param.substring(param.indexOf(':') + 1)] }];
    case 'color':
      if (!Array.prototype.map.call(store.getters.tagviewerMeta.tagList, el => el[1]).includes(param.substring(param.indexOf(':') + 1))) throw new ReferenceError('The color specified does not belong to any tags in this TagSpace. Check that it matches exactly.');
      return ['tagColor', { positive, color: param.substring(param.indexOf(':') + 1) }];
    case 'prop':
    { let arglist = param.substring(param.indexOf(':') + 1).split(/<|>|=|<=|>=|!=|!{|{}/);
      const propEntry = ['Title', 'Size', 'Resolution'].includes(arglist[0]) ? [arglist[0], { Title: 'String', Size: 'Size', Resolution: 'Resolution' }[arglist[0]]] : store.state.tagviewerMeta.propList.find(n => n[0] === arglist[0]);
      if (typeof propEntry === 'undefined') throw new ReferenceError('The property specified does not exist in this TagSpace. You may need to check your spelling.');
      if (propEntry[1] === 'Boolean') {
        if (arglist.length > 1) throw new SyntaxError('A boolean property filter should not have a comparison.');
        return ['propBoolean', { prop: arglist[0], positive, inclNoval: true }];
      } else {
        arglist.splice(1, 0, (param.substring(param.indexOf(':') + 1).match(/<|>|=|<=|>=|!=|!{|{}/)[0]));
        if (arglist.length < 2) throw new SyntaxError('A property comparison was specified without a comparison operator ( <, >, =, <=, >=, !=, {}, or !{ ) present');
        if (arglist.length > 2) arglist = [arglist[0], arglist[1], arglist.slice(2).join('')]; // if occurs, there's probably a comparison operator within the string
        arglist[2] = removeQuotes(arglist[2]); // does nothing if there are no quotes.
        if ((propEntry[1] === 'Number' && ['{}', '!{'].includes(arglist[1])) || (propEntry[1] === 'String' && ['<', '>', '>=', '<='].includes(arglist[1]))) throw new TypeError(`The comparison operator specified ("${arglist[1]}") does not match the type of the property specified ("${arglist[0]}" of type ${propEntry[1]}).`);
        const computeOpposite = op => ({ '>': '<=', '<': '>=', '>=': '<', '<=': '>', '{}': '!{', '!{': '{}' }[op]);
        const splitAt = (index, x) => [x.slice(0, index), x.slice(index)];
        const fixType = (val, type) => (({
          String: n => n.toString(),
          Number: n => parseInt(n, 10),
          Size: n =>
            (([n, e]) =>
              parseFloat(n) **
              (10 * { b: 0, kb: 3, mb: 6, gb: 9, tb: 12 }[e.toLowerCase()])
            )(
              splitAt(
                n.slice(-2, -1).toLowerCase() !== n.slice(-2, -1).toUpperCase() ? -2 : -1, n
              )
            ),
          Resolution: n => n.split('x').map(n => parseInt(n, 10))
        }[type])(val));
        return [`prop${propEntry[1]}`, { prop: arglist[0], condition: positive ? arglist[1] : computeOpposite(arglist[1]), val: fixType(arglist[2], propEntry[1]), inclNoval: true }]; // need to add inclNoval support
      }
    }
  }
};
/**
 * Split the full filter string into individual filter strings by spaces, respecting spaces in quotes.
 * @param {string} str - the full filter string
 * @returns {{err:boolean,value:string}} - the string split into individual filter strings
 * @function
 */
const parseFilter = str => {
  const params = str.split(/\s(?=[+-])(?![+-][A-Za-z0-9~!@#$%^&*()_=`{}[\]\\|;,.<>/?']+["])(?![+-][A-Za-z0-9~!@#$%^&*()_=`{}[\]\\|;,.<>/?"]+['])/); // all this just to allow + and - within a quoted string...
  let ret = [];
  try {
    ret = Array.prototype.map.call(params, el => convertFilter(el));
  } catch (e) {
    return { err: true, value: e.toString() };
  }
  return { err: false, value: ret };
};
/**
 * Similar to {@link sortUsing}, but only returns a number that represents how to sort the two items, used by Array.prototype.sort.
 * @param {object} a - the first item to compare
 * @param {object} b - the second item to compare
 * @param {string} by - the name of a property to compare with
 * @param {string} method - how to compare (A-Z or Z-A for string properties, for example)
 * @returns {number} - the number to sort the items with Array.prototype.sort.
 * @function
 */
const secondarySort = (a, b, by, method) => {
  if (by === '' || method === '' || !vm.sortMethod2Options.includes(method)) { by = 'Title'; method = 'az'; }
  switch (by) {
    case 'Title':
      if (method === 'az') return a.title.localeCompare(b.title);
      if (method === 'za') return b.title.localeCompare(a.title);
      break;
    case 'Size':
      if (method === '19') return a.size - b.size;
      if (method === '91') return b.size - a.size;
      break;
    case 'Resolution':
      if (method === '19') {
        return !(a.resolution !== [-1, -1] || b.resolution !== [-1, -1]) || (a.resolution[0] === b.resolution[0] && a.resolution[1] === b.resolution[1])
          ? a.title.localeCompare(b.title) // compare their titles (tertiary sort)
          : !(a.resolution !== [-1, -1] && b.resolution !== [-1, -1]) // if one has it but the other doesn't
            ? b.resolution !== [-1, -1] - a.resolution !== [-1, -1] // put the one with it first.
            : a.resolution[0] * a.resolution[1] - b.resolution[0] * b.resolution[1]; // otherwise compare total pixels
      }
      if (method === '91') {
        return !(a.resolution !== [-1, -1] || b.resolution !== [-1, -1]) || (a.resolution[0] === b.resolution[0] && a.resolution[1] === b.resolution[1])
          ? a.title.localeCompare(b.title) // compare their titles (tertiary sort)
          : !(a.resolution !== [-1, -1] && b.resolution !== [-1, -1])
            ? a.resolution !== [-1, -1] - b.resolution !== [-1, -1]
            : b.resolution[0] * b.resolution[1] - a.resolution[0] * a.resolution[1];
      }
      break;
    default:
      if (method === 'az') { // a, A, b, B, ... z, Z, noval
        return !(Object.prototype.hasOwnProperty.call(a.props, by) || Object.prototype.hasOwnProperty.call(b.props, by)) || a.props[by] === b.props[by] // if they both don't have the property OR if their value for the property is equal...
          ? a.title.localeCompare(b.title) // compare their titles (tertiary sort)
          : !(Object.prototype.hasOwnProperty.call(a.props, by) && Object.prototype.hasOwnProperty.call(b.props, by)) // otherwise, if one of them has the property but the other doesn't...
            ? Object.prototype.hasOwnProperty.call(b.props, by) - Object.prototype.hasOwnProperty.call(a.props, by) // put the one with the property first
            : a.props[by].localeCompare(b.props[by]); // otherwise just compare the values.
      }
      if (method === 'za') { // z, Z, y, Y, ..., a, A, noval
        return !(Object.prototype.hasOwnProperty.call(a.props, by) || Object.prototype.hasOwnProperty.call(b.props, by)) || a.props[by] === b.props[by]
          ? a.title.localeCompare(b.title) // tertiary sort
          : !(Object.prototype.hasOwnProperty.call(a.props, by) && Object.prototype.hasOwnProperty.call(b.props, by))
            ? Object.prototype.hasOwnProperty.call(b.props, by) - Object.prototype.hasOwnProperty.call(a.props, by)
            : b.props[by].localeCompare(a.props[by]);
      }
      if (method === '19') { // small, big, noval
        return !(Object.prototype.hasOwnProperty.call(a.props, by) || Object.prototype.hasOwnProperty.call(b.props, by)) || a.props[by] === b.props[by]
          ? a.title.localeCompare(b.title) // tertiary sort
          : !(Object.prototype.hasOwnProperty.call(a.props, by) && Object.prototype.hasOwnProperty.call(b.props, by))
            ? Object.prototype.hasOwnProperty.call(b.props, by) - Object.prototype.hasOwnProperty.call(a.props, by)
            : a.props[by] - b.props[by];
      }
      if (method === '91') { // big, small, noval
        return !(Object.prototype.hasOwnProperty.call(a.props, by) || Object.prototype.hasOwnProperty.call(b.props, by)) || a.props[by] === b.props[by]
          ? a.title.localeCompare(b.title) // tertiary sort
          : !(Object.prototype.hasOwnProperty.call(a.props, by) && Object.prototype.hasOwnProperty.call(b.props, by))
            ? Object.prototype.hasOwnProperty.call(b.props, by) - Object.prototype.hasOwnProperty.call(a.props, by)
            : b.props[by] - a.props[by];
      }
      if (method === 't') { // true, false, noval
        return !(Object.prototype.hasOwnProperty.call(a.props, by) || Object.prototype.hasOwnProperty.call(b.props, by)) || a.props[by] === b.props[by]
          ? a.title.localeCompare(b.title) // tertiary sort
          : !(Object.prototype.hasOwnProperty.call(a.props, by) && Object.prototype.hasOwnProperty.call(b.props, by))
            ? Object.prototype.hasOwnProperty.call(b.props, by) - Object.prototype.hasOwnProperty.call(a.props, by)
            : b.props[by] - a.props[by];
      }
      if (method === 'f') { // false, true, noval
        return !(Object.prototype.hasOwnProperty.call(a.props, by) || Object.prototype.hasOwnProperty.call(b.props, by)) || a.props[by] === b.props[by]
          ? a.title.localeCompare(b.title) // tertiary sort
          : !(Object.prototype.hasOwnProperty.call(a.props, by) && Object.prototype.hasOwnProperty.call(b.props, by))
            ? Object.prototype.hasOwnProperty.call(b.props, by) - Object.prototype.hasOwnProperty.call(a.props, by)
            : a.props[by] - b.props[by];
      }
  }
};
/**
 * Sorts the array using the two properties and methods specified.
 * @param {object[]} arr - the array to sort
 * @param {string} by - what property to use to sort it
 * @param {string} method - how to compare (a-z or z-a for string properties, for example)
 * @param {string} by2 - the second property if the property matches between two items
 * @param {string} method2 - how to compare
 * @returns {object[]} - the sorted array
 * @function
 */
const sortUsing = (arr, by, method, by2, method2) => {
  switch (by) {
    case 'Title':
      if (method === 'az') return arr.concat().sort((a, b) => a.title.localeCompare(b.title)); // no secondary sort because titles can't be the same (or at least shouldn't be, may need to implement a check.)
      if (method === 'za') return arr.concat().sort((a, b) => b.title.localeCompare(a.title));
      break;
    case 'Size':
      if (method === '19') return arr.concat().sort((a, b) => a.size === b.size ? secondarySort(a, b, by2, method2) : a.size - b.size);
      if (method === '91') return arr.concat().sort((a, b) => b.size === a.size ? secondarySort(b, a, by2, method2) : b.size - a.size);
      break;
    case 'Resolution':
      if (method === '19') {
        return arr.concat().sort((a, b) =>
          !(a.resolution !== [-1, -1] || b.resolution !== [-1, -1]) || (a.resolution[0] === b.resolution[0] && a.resolution[1] === b.resolution[1]) // if no resolution info is present, the array will be [-1, -1]. Use that instead of hasOwnProperty to check for presence.
            ? secondarySort(a, b, by2, method2) // if they both don't have it or if they're the same, use secondarySort
            : !(a.resolution !== [-1, -1] && b.resolution !== [-1, -1]) // if one has it but the other doesn't
              ? b.resolution !== [-1, -1] - a.resolution !== [-1, -1] // put the one with it first.
              : a.resolution[0] * a.resolution[1] - b.resolution[0] * b.resolution[1] // otherwise compare total pixels
        );
      }
      if (method === '91') {
        return arr.concat().sort((a, b) => // same as above, but big goes before small
          !(a.resolution !== [-1, -1] || b.resolution !== [-1, -1]) || (a.resolution[0] === b.resolution[0] && a.resolution[1] === b.resolution[1])
            ? secondarySort(b, a, by2, method2)
            : !(a.resolution !== [-1, -1] && b.resolution !== [-1, -1])
              ? a.resolution !== [-1, -1] - b.resolution !== [-1, -1]
              : b.resolution[0] * b.resolution[1] - a.resolution[0] * a.resolution[1]
        );
      }
      break;
    default:
      if (method === 'az') { // a, A, b, B, ... z, Z, noval
        return arr.concat().sort((a, b) => // concat with no args copies the array.
          !(Object.prototype.hasOwnProperty.call(a.props, by) || Object.prototype.hasOwnProperty.call(b.props, by)) || a.props[by] === b.props[by] // if they both don't have the property OR if their value for the property is equal...
            ? secondarySort(a, b, by2, method2) // compare using specified method or title
            : !(Object.prototype.hasOwnProperty.call(a.props, by) && Object.prototype.hasOwnProperty.call(b.props, by)) // otherwise, if one of them has the property but the other doesn't...
              ? Object.prototype.hasOwnProperty.call(b.props, by) - Object.prototype.hasOwnProperty.call(a.props, by) // put the one with the property first
              : a.props[by].localeCompare(b.props[by]) // otherwise just compare the values.
        );
      }
      if (method === 'za') { // z, Z, y, Y, ..., a, A, noval
        return arr.concat().sort((b, a) => // switch order to easily reverse comparison! (see above for expl)
          !(Object.prototype.hasOwnProperty.call(a.props, by) || Object.prototype.hasOwnProperty.call(b.props, by)) || a.props[by] === b.props[by]
            ? secondarySort(b, a, by2, method2)
            : !(Object.prototype.hasOwnProperty.call(a.props, by) && Object.prototype.hasOwnProperty.call(b.props, by))
              ? Object.prototype.hasOwnProperty.call(a.props, by) - Object.prototype.hasOwnProperty.call(b.props, by) // order must be switched since the items without the property should still come after those with the property
              : a.props[by].localeCompare(b.props[by])
        );
      }
      if (method === '19') { // small, big, noval
        return arr.concat().sort((a, b) => // see above for expl
          !(Object.prototype.hasOwnProperty.call(a.props, by) || Object.prototype.hasOwnProperty.call(b.props, by)) || a.props[by] === b.props[by]
            ? secondarySort(a, b, by2, method2)
            : !(Object.prototype.hasOwnProperty.call(a.props, by) && Object.prototype.hasOwnProperty.call(b.props, by))
              ? Object.prototype.hasOwnProperty.call(b.props, by) - Object.prototype.hasOwnProperty.call(a.props, by)
              : a.props[by] - b.props[by]
        );
      }
      if (method === '91') { // big, small, noval
        return arr.concat().sort((b, a) => // same trick (see above for expl)
          !(Object.prototype.hasOwnProperty.call(a.props, by) || Object.prototype.hasOwnProperty.call(b.props, by)) || a.props[by] === b.props[by]
            ? secondarySort(b, a, by2, method2)
            : !(Object.prototype.hasOwnProperty.call(a.props, by) && Object.prototype.hasOwnProperty.call(b.props, by))
              ? Object.prototype.hasOwnProperty.call(a.props, by) - Object.prototype.hasOwnProperty.call(b.props, by) // as above, order must be switched since the items without the property should still come after those with the property
              : a.props[by] - b.props[by]
        );
      }
      if (method === 't') { // true, false, noval
        return arr.concat().sort((a, b) => // see above for expl
          !(Object.prototype.hasOwnProperty.call(a.props, by) || Object.prototype.hasOwnProperty.call(b.props, by)) || a.props[by] === b.props[by]
            ? secondarySort(a, b, by2, method2)
            : !(Object.prototype.hasOwnProperty.call(a.props, by) && Object.prototype.hasOwnProperty.call(b.props, by))
              ? Object.prototype.hasOwnProperty.call(b.props, by) - Object.prototype.hasOwnProperty.call(a.props, by)
              : b.props[by] - a.props[by]
        );
      }
      if (method === 'f') { // false, true, noval
        return arr.concat().sort((b, a) => // same trick (see above for expl)
          !(Object.prototype.hasOwnProperty.call(a.props, by) || Object.prototype.hasOwnProperty.call(b.props, by)) || a.props[by] === b.props[by]
            ? secondarySort(b, a, by2, method2)
            : !(Object.prototype.hasOwnProperty.call(a.props, by) && Object.prototype.hasOwnProperty.call(b.props, by))
              ? Object.prototype.hasOwnProperty.call(a.props, by) - Object.prototype.hasOwnProperty.call(b.props, by) // as above, order must be switched since the items without the property should still come after those with the property
              : b.props[by] - a.props[by]
        );
      }
  }
};

fs.ensureDirSync(app.app.getPath('userData')); // is this necessary? I guess it's good to ensure it.

/**
 * Syncs the metadata for the TagSpace, waiting in the case of rapid requests.
 * @type {function}
 * @constant
 * @function
 */
const debouncedSync = debounce(() => { store.dispatch('syncMetadata').then(() => { app.app.showExitPrompt = false; vm.showExitPrompt = false; }); }, 2000);
/**
 * Syncs TagViewer's cache, waiting in the case of rapid requests.
 * @type {function}
 * @constant
 * @function
 */
const debouncedCacheSync = debounce(() => { if (!safeMode[0]) fs.writeJSON(path.join(app.app.getPath('userData'), 'cache.json'), cache, { spaces: 2 }); }, 1400);
/**
 * Syncs TagViewer's config, waiting in the case of rapid requests.
 * @type {function}
 * @constant
 * @function
 */
const debouncedConfigSync = debounce(() => { if (!safeMode[1]) fs.writeJSON(path.join(app.app.getPath('userData'), 'config.json'), config, { spaces: 2 }); }, 1400);

if (Object.prototype.hasOwnProperty.call(config, 'navWidth')) {
  ((a, w) => {
    a.style.width = `${w > 24 ? w : 0}px`; // the 24 and 12 must reflect the current padding!
    a.style.paddingLeft = a.style.paddingRight = `${w > 24 ? 12 : Math.max(w / 2, 2)}px`;
    a.style.color = w > 24 ? '' : `rgba(0,0,0,${Math.max((w - 10) * 0.05, 0)})`;
  })(document.getElementById('nav'), config.navWidth);
}
interact('#nav').resizable({
  edges: { right: true, left: false, top: false, bottom: false },
  listeners: {
    move (event) {
      if (!(config.noSaveWidths ?? (false))) {
        config.navWidth = Math.round(event.rect.width);
        debouncedConfigSync();
      }
      event.target.style.width = `${event.rect.width > 24 ? event.rect.width : 0}px`; // the 24 and 12 must reflect the current padding!
      event.target.style.paddingLeft = event.target.style.paddingRight = `${event.rect.width > 24 ? 12 : Math.max(event.rect.width / 2, 2)}px`;
      event.target.style.color = event.rect.width > 24 ? '' : `rgba(0,0,0,${Math.max((event.rect.width - 10) * 0.05, 0)})`;
    }
  },
  modifiers: [
    interact.modifiers.restrict({
      restriction: 'parent'
    })
  ]
});
if (Object.prototype.hasOwnProperty.call(config, 'filtersWidth')) {
  ((a, w) => {
    a.style.width = `${w > 24 ? w : 0}px`; // the 24 and 12 must reflect the current padding!
    // a.style.paddingLeft = a.style.paddingRight = (w > 24 ? 12 : Math.max(w / 2, 2)) + 'px';
    a.style.color = w > 24 ? '' : `rgba(0,0,0,${Math.max((w - 10) * 0.05, 0)})`;
    if (a.children[1].children[0].tagName === 'UL') {
      a.children[1].children[0].style.gridTemplateColumns = w > 290 ? 'auto 1fr' : 'auto';
      a.children[1].children[0].style.rowGap = w > 290 ? '6px' : '0';
    }
  })(document.getElementById('filters-props'), config.filtersWidth);
}
interact('#filters-props').resizable({
  edges: { right: false, left: true, top: false, bottom: false },
  listeners: {
    move (event) {
      if (!(config.noSaveWidths ?? (false))) {
        config.filtersWidth = Math.round(event.rect.width);
        debouncedConfigSync();
      }
      event.target.style.width = `${event.rect.width > 24 ? event.rect.width : 0}px`; // the 24 and 12 must reflect the current padding!
      // event.target.style.paddingLeft = event.target.style.paddingRight = (event.rect.width > 24 ? 12 : Math.max(event.rect.width / 2, 2)) + 'px';
      event.target.style.color = event.rect.width > 24 ? '' : `rgba(0,0,0,${Math.max((event.rect.width - 10) * 0.05, 0)})`;
      if (event.target.children[1].children[0].tagName === 'UL') {
        event.target.children[1].children[0].style.gridTemplateColumns = event.rect.width > 290 ? 'auto 1fr' : 'auto';
        event.target.children[1].children[0].style.rowGap = event.rect.width > 290 ? '6px' : '0';
      }
    }
  },
  modifiers: [
    interact.modifiers.restrict({
      restriction: 'parent'
    })
  ]
});

/**
 * A copy of the current index of the media within the files array in tagviewerMeta
 * @type {number}
 */
let currentIndex = 1;
/**
 * A copy of the current mediaNumber
 * @type {number}
 */
let mediaNumberCopy = 1;
/**
 * Circumvents the mediaNumber translation function when the mediaNumber actually changes
 * @type {boolean}
 */
let mediaNumberActuallyChanged = false;

Vue.use(Vuex);
const store = new Vuex.Store({
  state: {
    tagviewerMeta: {},
    openDirectory: '',
    mediaNumber: 1,
    currentFilters: [],
    itemProperties: []
  },
  getters: {
    filtersActive: state => state.currentFilters.length > 0,
    numOfFiles: (state, getters) => getters.currentFilesJSON.length,
    currentFiles: (state, getters) => getters.currentFilesJSON.map(n => n._path), // the files that match the current filter ([] if no match or no filter or no open directory, [all files...] if no filter with open directory)
    currentFilesJSON: (state, getters) => {
      if (getters.tagspaceIsOpen) {
        if (state.tagviewerMeta === {}) { // should never be the case.
          console.error('tagspaceIsOpen without tagviewerMeta.'); // store.commit('loadMetadata'); // needs to be a mutation since it's synchronous (the next instruction depends on its value.)
        }
        if (vm.sortBy !== 'Intrinsic' && vm.sortMethod !== '' && vm.sortMethodOptions.map(n => n.value).includes(vm.sortMethod)) {
          const newValue = sortUsing(applyFilters(state.tagviewerMeta.files, state.currentFilters), vm.sortBy, vm.sortMethod, vm.sortBy2, vm.sortMethod2);
          if (currentIndex !== null && newValue.some(el => el._index === currentIndex) && !mediaNumberActuallyChanged) store.dispatch('changeMediaNumberNoDeps', { abs: true, newVal: newValue.findIndex(el => el._index === currentIndex) + 1, currentFileJSON: newValue.length === 0 ? null : newValue[clamp(1, mediaNumberCopy, newValue.length) - 1], numOfFiles: newValue.length });
          mediaNumberActuallyChanged = false;
          return newValue;
        } else {
          const newValue = applyFilters(state.tagviewerMeta.files, state.currentFilters);
          if (currentIndex !== null && newValue.some(el => el._index === currentIndex) && !mediaNumberActuallyChanged) store.dispatch('changeMediaNumberNoDeps', { abs: true, newVal: newValue.findIndex(el => el._index === currentIndex) + 1, currentFileJSON: newValue.length === 0 ? null : newValue[clamp(1, mediaNumberCopy, newValue.length) - 1], numOfFiles: newValue.length });
          mediaNumberActuallyChanged = false;
          return newValue;
        }
      } else {
        return []; // no files if no open directory
      }
    },
    currentFileJSON: (state, getters) => {
      const newValue = Object.prototype.hasOwnProperty.call(getters.currentFilesJSON, state.mediaNumber - 1) ? getters.currentFilesJSON[state.mediaNumber - 1] : null;
      currentIndex = newValue !== null && Object.prototype.hasOwnProperty.call(newValue, '_index') ? newValue._index : null;
      return newValue;
    },
    tagspaceIsOpen: state => state.openDirectory !== '',
    mediaIsOpen: (state, getters) => getters.tagspaceIsOpen && (getters.mediaPath !== '' || getters.filtersActive || state.tagviewerMeta.files.length === 0),
    haveMediaOptions: (state, getters) => getters.mediaIsOpen && (getters.numOfFiles > 1 || getters.filtersActive),
    mediaPath: (state, getters) => {
      if (getters.tagspaceIsOpen && Array.prototype.hasOwnProperty.call(getters.currentFiles, state.mediaNumber - 1)) {
        if (state.mediaNumber > 0 && state.mediaNumber <= getters.numOfFiles) store.commit('clampMediaNumber', getters.numOfFiles); // shouldn't have to do this!
        return path.join(state.openDirectory, getters.currentFiles[state.mediaNumber - 1]);
      } else {
        return '';
      }
    },
    mediaViewerType: (state, getters) => {
      if (getters.mediaIsOpen) {
        if (getters.currentFileJSON !== null) {
          if (['.flac', '.mp4', '.webm', '.wav'].includes(path.extname(getters.mediaPath))) {
            return 'video-viewer';
          } else {
            return 'image-viewer';
          }
        } else {
          return 'no-media';
        }
      } else {
        return '';
      }
    },
    itemTags: (state, getters) => {
      if (getters.currentFileJSON !== null) {
        return Array.prototype.map.call(getters.currentFileJSON.tags, n => state.tagviewerMeta.tagList[n]);
      } else {
        return [];
      }
    },
    offeredItemTags: (state, getters) => { try { return Array.prototype.filter.call(state.tagviewerMeta.tagList, el => !getters.itemTags.some(n => el[0] === n[0])); /* quack quack */ } catch (e) { return []; } }
  },
  actions: {
    tagDeleted: (context, payload) => context.commit('tagDeleted', payload),
    updateMetadata: (context, payload) => context.commit('updateMetadata', payload),
    addMedia: (context, payload) => context.commit('addMedia', payload),
    removeMedia: (context, index) => context.commit('removeMedia', { index, numOfFiles: context.getters.numOfFiles, mediaPath: context.getters.mediaPath }),
    syncMetadata: context => fs.writeJSON(path.join(context.state.openDirectory, 'tagviewer.json'), context.state.tagviewerMeta, { spaces: 2 }), // returns a Promise
    changeMediaNumber: (context, { newVal, abs }) => { context.commit('changeMediaNumber', { newVal: newVal, abs: abs, numOfFiles: context.getters.numOfFiles }); },
    changeWorkingDirectory: (context, payload) => context.commit('changeWorkingDirectory', payload),
    clampMediaNumber: context => context.commit('clampMediaNumber', context.getters.numOfFiles),
    addFilter: (context, payload) => context.commit('addFilter', payload),
    removeFilter: (context, payload) => context.commit('removeFilter', payload),
    removeAllFilters: context => context.commit('removeAllFilters'),
    updatePropMenu: context => context.commit('updatePropMenu', { mediaIsOpen: context.getters.mediaIsOpen, currentFileJSON: context.getters.currentFileJSON, mediaPath: context.getters.mediaPath }),
    changeProperty: (context, { propName, newValue }) => context.commit('changeProperty', { propName, newValue, currentRealIndex: context.getters.currentFileJSON._index }),
    removeTag: (context, payload) => context.commit('removeTag', { index: payload, currentRealIndex: context.getters.currentFileJSON._index }),
    addTag: (context, payload) => context.commit('addTag', { tag: payload, currentRealIndex: context.getters.currentFileJSON._index }),
    replaceFilter: (context, payload) => context.commit('replaceFilter', payload),
    changeMediaNumberNoDeps: (context, payload) => context.commit('changeMediaNumberNoDeps', payload) // for compatibility when currentFilesJSON is undefined.
  },
  mutations: {
    updateMetadata: function (state, newMeta) {
      state.tagviewerMeta = newMeta;
      app.app.showExitPrompt = true;
      vm.showExitPrompt = true;
      debouncedSync();
      store.dispatch('updatePropMenu');
    },
    loadMetadata: function (state) { // should be called as-is since it needs to be synchronous.
      state.tagviewerMeta = fs.readJSONSync(path.join(state.openDirectory, 'tagviewer.json'));
    },
    clampMediaNumber: function (state, payload) { // if commit-ing directly, pass the number of files through the payload
      if (state.mediaNumber < 1 || state.mediaNumber > payload) {
        state.mediaNumber = clamp(1, state.mediaNumber, payload);
        store.dispatch('updatePropMenu');
      } /* else {
        state.mediaNumber = clamp(1, state.mediaNumber, payload);
      } */ // nothing required, I believe
    },
    removeMedia: function (state, { index, mediaPath, numOfFiles }) { // payload is index, but note that it's the actual index (not the mediaNumber)
      if (state.tagviewerMeta.files[index]._path === path.basename(mediaPath)) {
        if (numOfFiles > 1) {
          if (state.mediaNumber !== 1) { // if it is 1, we'll stay there because it will become the next media due to how the array works.
            state.mediaNumber -= 1; // go to previous media (it could be next but not if we're at the last media.)
          }
        } else {
          dialog.showMessageBox(app.getCurrentWindow(), {
            title: 'No remaining media',
            message: "You've deleted the only media in this TagSpace. However, the TagSpace still exists, and you're still able to add more media to it.",
            buttons: 'Okay',
            cancelId: 0,
            defaultId: 0,
            type: 'info'
          });
        }
      }
      trash(path.join(state.openDirectory, state.tagviewerMeta.files[index]._path)).then(() => { // delete image non-permanently
        state.tagviewerMeta.files.splice(index, 1); // remove from files array.
      });
      state.tagviewerMeta.currentIndex -= 1;
    },
    changeMediaNumber: function (state, { newVal, abs, numOfFiles }) { // if commit-ing directly, pass the number of files in the payload
      if (abs) {
        state.mediaNumber = clamp(1, newVal, numOfFiles);
      } else {
        state.mediaNumber += newVal;
        state.mediaNumber = clamp(1, state.mediaNumber, numOfFiles);
      }
      currentIndex = state.mediaNumber;
      mediaNumberCopy = state.mediaNumber;
      store.dispatch('updatePropMenu');
    },
    changeMediaNumberNoDeps: function (state, { newVal, abs, currentFileJSON, numOfFiles }) {
      state.mediaNumber = clamp(1, abs ? newVal : (state.mediaNumber + newVal), numOfFiles);
      mediaNumberCopy = state.mediaNumber;
      if (currentFileJSON !== null) {
        state.itemProperties = [ // a no-dependencies version of updatePropMenu
          ['Title', currentFileJSON.title, 'String'],
          ['Size', humanFileSize(currentFileJSON.size, true, 1), false],
          ['Resolution', (['.flac', '.mp4', '.webm', '.wav'].includes(path.extname(currentFileJSON._path))) ? 'Resolution is currently not supported for videos.' : currentFileJSON.resolution.join('x'), false],
          ...(state.tagviewerMeta.propList.map(n => {
            const ret = [];
            ret[0] = n[0];
            ret[1] = (currentFileJSON.props[n[0]] ?? (null)); // it becomes [...[name, value, type]]
            ret[2] = n[1];
            return ret;
          }))
        ];
      } else {
        state.itemProperties = [];
      }
    },
    updatePropMenu: function (state, { mediaIsOpen, currentFileJSON, mediaPath }) {
      if (mediaIsOpen && currentFileJSON !== null) {
        state.itemProperties = [
          ['Title', currentFileJSON.title, 'String'],
          ['Size', humanFileSize(currentFileJSON.size, true, 1), false],
          ['Resolution', (['.flac', '.mp4', '.webm', '.wav'].includes(path.extname(mediaPath))) ? 'Resolution is currently not supported for videos.' : currentFileJSON.resolution.join('x'), false],
          ...(state.tagviewerMeta.propList.map(n => {
            const ret = [];
            ret[0] = n[0];
            ret[1] = (currentFileJSON.props[n[0]] ?? (null)); // it becomes [...[name, value, type]]
            ret[2] = n[1];
            return ret;
          }))
        ];
      } else {
        state.itemProperties = [];
      }
    },
    changeProperty: function (state, { propName, newValue, currentRealIndex }) {
      if (propName === 'Title') {
        state.tagviewerMeta.files[currentRealIndex].title = newValue;
      } else {
        if (newValue === null) {
          delete state.tagviewerMeta.files[currentRealIndex].props[propName];
        } else {
          state.tagviewerMeta.files[currentRealIndex].props[propName] = newValue;
        }
      }
      app.app.showExitPrompt = true;
      vm.showExitPrompt = true;
      debouncedSync(); // not really used for debouncing, but more for a responsive delay before writing to metadata.
      store.dispatch('updatePropMenu');
    },
    changeWorkingDirectory: function (state, { newDir }) {
      // eslint-disable-next-line brace-style
      if (state.openDirectory !== '') { store.dispatch('syncMetadata').then(() => { // to make sure data isn't lost from previous sessions.
        state.openDirectory = newDir; // store a copy in OS-specific format
        store.commit('loadMetadata');
        if (cache.openHistory.includes(newDir)) { // remove it if it exists, then add it. (we don't want duplicates)
          cache.openHistory.splice(cache.openHistory.indexOf(newDir), 1);
        }
        cache.openHistory.unshift(newDir);
        cache.openDirectory = newDir;
        debouncedCacheSync();
        document.title = `TagViewer ${_version}\u2002\u2013\u2002${state.tagviewerMeta.title}`;
        store.dispatch('changeMediaNumber', { newVal: 1, abs: true }); // always
      }); } else { // eslint-disable-line brace-style
        state.openDirectory = newDir; // store a copy in OS-specific format
        store.commit('loadMetadata');
        if (cache.openHistory.includes(newDir)) { // remove it if it exists, then add it. (we don't want duplicates)
          cache.openHistory.splice(cache.openHistory.indexOf(newDir), 1);
        }
        cache.openHistory.unshift(newDir);
        cache.openDirectory = newDir;
        debouncedCacheSync();
        document.title = `TagViewer ${_version}\u2002\u2013\u2002${state.tagviewerMeta.title}`;
        store.dispatch('changeMediaNumber', { newVal: 1, abs: true }); // always
      }
      mediaNumberActuallyChanged = true;
      vm.mediaNumber = 1;
    },
    addMedia: function (state, [object, index]) {
      console.assert(state.tagviewerMeta.currentIndex === index);
      Vue.set(state.tagviewerMeta.files, state.tagviewerMeta.currentIndex, object);
      Vue.set(state.tagviewerMeta, 'currentIndex', state.tagviewerMeta.currentIndex + 1);
    },
    addFilter: function (state, filter) {
      state.currentFilters.push(filter);
      store.dispatch('clampMediaNumber');
    },
    removeFilter: function (state, index) {
      state.currentFilters.splice(index, 1);
      store.dispatch('updatePropMenu');
    },
    removeAllFilters: function (state) {
      state.currentFilters.splice(0); // empty
      store.dispatch('updatePropMenu');
    },
    removeTag: function (state, { index, currentRealIndex }) {
      state.tagviewerMeta.files[currentRealIndex].tags.splice(index, 1);
      store.dispatch('updatePropMenu');
      app.app.showExitPrompt = true;
      vm.showExitPrompt = true;
      debouncedSync();
    },
    addTag: function (state, { tag, currentRealIndex }) {
      state.tagviewerMeta.files[currentRealIndex].tags.push(state.tagviewerMeta.tagList.indexOf(tag));
      store.dispatch('updatePropMenu');
      app.app.showExitPrompt = true;
      vm.showExitPrompt = true;
      debouncedSync();
    },
    replaceFilter: function (state, newFilter) {
      state.currentFilters = newFilter;
    }
  }
});
const vm = new Vue({
  store: store,
  el: '#vue-container',
  data: {
    offeringPreviousLocation: (config.offerPrevLocation ?? (true)) && Object.prototype.hasOwnProperty.call(cache, 'openDirectory') && fs.existsSync(path.join(cache.openDirectory, 'tagviewer.json')),
    asideTab: 1,
    tentativeFilterText: '',
    autocompleteFilterText: '',
    errorText: '',
    filterQuake: false,
    showExitPrompt: app.app.showExitPrompt,
    sortBy: 'Intrinsic',
    sortMethod: '',
    sortBy2: '',
    sortMethod2: '',
    slideshowInterval: null,
    isFullscreen: false,
    tagSearchString: null,
    colorSearchString: null,
    propSearchString: null,
    filterListCollapsed: [false, false, false]
  },
  watch: {
    filterQuake: function (active) {
      const filterQuakeEl = document.getElementById('filter-quake');
      if (active) {
        filterQuakeEl.children[1].select();
        document.body.children[0].addEventListener('click', function (e) {
          if (!e.path.includes(filterQuakeEl)) {
            e.preventDefault();
            vm.filterQuake = false;
          }
        });
        filterQuakeEl.children[1].addEventListener('input', function () {
          let processed = vm.tentativeFilterText.split(/\s(?=[+-])(?![+-][A-Za-z0-9~!@#$%^&*()_=`{}[\]\\|;,.<>/?']+["])(?![+-][A-Za-z0-9~!@#$%^&*()_=`{}[\]\\|;,.<>/?"]+['])/).slice(-1)[0];
          let options = [];
          if (processed.includes('+') || processed.includes('-')) {
            processed = processed.slice(1);
            if (!processed.includes(':')) { // if so, we're autocompleting a filter type (tag, tagColor, prop)
              options = ['tag:', 'tagColor:#', 'prop:'].filter(n => n.startsWith(processed)); // get the options that start with what's already written
              if (options.length !== 0) { // if there are any
                vm.autocompleteFilterText = options[0].slice(processed.length); // remove the part that is already written
              } else {
                vm.autocompleteFilterText = ''; // otherwise there's nothing to autocomplete
              }
            } else { // if not, we need to know if this is a property filter or a tag/tagColor filter.
              if (processed.slice(0, 4) === 'prop') { // property filter
                processed = processed.slice(5); // remove 'prop:'
                if (!processed.match(/<|>|=|<=|>=|!=|!{|{}/)) { // suggest properties
                  options = [['Title'], ['Size'], ['Resolution'], ...store.state.tagviewerMeta.propList].filter(n => n[0].startsWith(processed));
                  if (options.length !== 0) { // same as above
                    vm.autocompleteFilterText = options[0][0].slice(processed.length);
                  } else {
                    vm.autocompleteFilterText = '';
                  }
                } else { // they're typing the value, leave them alone.
                  vm.autocompleteFilterText = '';
                }
              } else { // tag/tagColor filter
                if (processed.startsWith('tag:')) {
                  processed = processed.slice(4); // remove 'tag:'
                  options = store.state.tagviewerMeta.tagList.filter(n => n[0].startsWith(processed));
                  if (options.length !== 0) {
                    vm.autocompleteFilterText = options[0][0].slice(processed.length);
                  } else {
                    vm.autocompleteFilterText = '';
                  }
                } else if (processed.startsWith('tagColor:')) {
                  processed = processed.slice(9);
                  options = store.state.tagviewerMeta.tagList.filter(n => n[1].startsWith(processed));
                  if (options.length !== 0) {
                    vm.autocompleteFilterText = options[0][1].slice(processed.length);
                  } else {
                    vm.autocompleteFilterText = '';
                  }
                } else { // don't know what they're doing, leave them alone.
                  vm.autocompleteFilterText = '';
                }
              }
            }
          } else { // they have nothing, do nothing.
            vm.autocompleteFilterText = '';
          }
          if (vm.errorText) vm.errorText = ''; // empty strings are falsy ;)
        });
        filterQuakeEl.children[1].addEventListener('keydown', function (e) {
          if (e.key === 'Escape') vm.filterQuake = false;
          if (e.key === 'Enter') {
            const result = parseFilter(vm.tentativeFilterText);
            if (result.err) { vm.errorText = result.value; } else {
              store.dispatch('replaceFilter', result.value);
              vm.filterQuake = false;
            }
          }
          if (e.key === 'ArrowRight') {
            if (vm.autocompleteFilterText !== '' && this.selectionEnd === this.value.length) {
              e.preventDefault();
              vm.tentativeFilterText += vm.autocompleteFilterText;
              vm.autocompleteFilterText = '';
            }
          }
          if (e.key === 'Tab') {
            if (vm.autocompleteFilterText !== '') {
              e.preventDefault();
              vm.tentativeFilterText += vm.autocompleteFilterText;
              vm.autocompleteFilterText = '';
            }
          }
        });
      } else {
        setTimeout(() => (vm.errorText = ''), 300);
        document.body.children[1].removeEventListener('click', function (e) {
          if (!e.path.includes(filterQuakeEl)) {
            e.preventDefault();
            vm.filterQuake = false;
          }
        });
        filterQuakeEl.children[1].removeEventListener('input', function () {
          let processed = vm.tentativeFilterText.split(/\s(?=[+-])(?![+-][A-Za-z0-9~!@#$%^&*()_=`{}[\]\\|;,.<>/?']+["])(?![+-][A-Za-z0-9~!@#$%^&*()_=`{}[\]\\|;,.<>/?"]+['])/).slice(-1)[0];
          let options = [];
          if (processed.includes('+') || processed.includes('-')) {
            processed = processed.slice(1);
            if (!processed.includes(':')) { // if so, we're autocompleting a filter type (tag, tagColor, prop)
              options = ['tag:', 'tagColor:#', 'prop:'].filter(n => n.startsWith(processed)); // get the options that start with what's already written
              if (options.length !== 0) { // if there are any
                vm.autocompleteFilterText = options[0].slice(processed.length); // remove the part that is already written
              } else {
                vm.autocompleteFilterText = ''; // otherwise there's nothing to autocomplete
              }
            } else { // if not, we need to know if this is a property filter or a tag/tagColor filter.
              if (processed.slice(0, 4) === 'prop') { // property filter
                processed = processed.slice(5); // remove 'prop:'
                if (!processed.match(/<|>|=|<=|>=|!=|!{|{}/)) { // suggest properties
                  options = [['Title'], ['Size'], ['Resolution'], ...store.state.tagviewerMeta.propList].filter(n => n[0].startsWith(processed));
                  if (options.length !== 0) { // same as above
                    vm.autocompleteFilterText = options[0][0].slice(processed.length);
                  } else {
                    vm.autocompleteFilterText = '';
                  }
                } else { // they're typing the value, leave them alone.
                  vm.autocompleteFilterText = '';
                }
              } else { // tag/tagColor filter
                if (processed.startsWith('tag:')) {
                  processed = processed.slice(4); // remove 'tag:'
                  options = store.state.tagviewerMeta.tagList.filter(n => n[0].startsWith(processed));
                  if (options.length !== 0) {
                    vm.autocompleteFilterText = options[0][0].slice(processed.length);
                  } else {
                    vm.autocompleteFilterText = '';
                  }
                } else if (processed.startsWith('tagColor:')) {
                  processed = processed.slice(9);
                  options = store.state.tagviewerMeta.tagList.filter(n => n[1].startsWith(processed));
                  if (options.length !== 0) {
                    vm.autocompleteFilterText = options[0][1].slice(processed.length);
                  } else {
                    vm.autocompleteFilterText = '';
                  }
                } else { // don't know what they're doing, leave them alone.
                  vm.autocompleteFilterText = '';
                }
              }
            }
          } else { // they have nothing, do nothing.
            vm.autocompleteFilterText = '';
          }
          if (vm.errorText) vm.errorText = ''; // empty strings are falsy ;)
        });
        filterQuakeEl.children[1].removeEventListener('keydown', function (e) {
          if (e.key === 'Escape') vm.filterQuake = false;
          if (e.key === 'Enter') {
            const result = parseFilter(vm.tentativeFilterText);
            if (result.err) { vm.errorText = result.value; } else {
              store.dispatch('replaceFilter', result.value);
              vm.filterQuake = false;
            }
          }
        });
        filterQuakeEl.children[1].removeEventListener('keydown', function (e) {
          if (e.key === 'Escape') vm.filterQuake = false;
          if (e.key === 'Enter') {
            const result = parseFilter(vm.tentativeFilterText);
            if (result.err) { vm.errorText = result.value; } else {
              store.dispatch('replaceFilter', result.value);
              vm.filterQuake = false;
            }
          }
          if (e.key === 'ArrowRight') {
            if (vm.autocompleteFilterText !== '' && this.selectionEnd === this.value.length) {
              e.preventDefault();
              vm.tentativeFilterText += vm.autocompleteFilterText;
              vm.autocompleteFilterText = '';
            }
          }
          if (e.key === 'Tab') {
            if (vm.autocompleteFilterText !== '') {
              e.preventDefault();
              vm.tentativeFilterText += vm.autocompleteFilterText;
              vm.autocompleteFilterText = '';
            }
          }
        });
      }
    },
    isFullscreen: function (isFS) {
      if (isFS) document.addEventListener('keydown', function handler (e) { if (e.key === 'Escape') { vm.isFullscreen = false; document.removeEventListener('keypress', handler); } });
      if (!isFS && (config.endSlideshowOnFSExit ?? (true))) vm.endSlideshow();
      window.document.body.classList.toggle('fullscreen', isFS);
      app.getCurrentWindow().setFullScreen(isFS);
      app.getCurrentWindow().focus();
    }
  },
  components: {
    'media-entry': {
      props: { name: String, ckey: Number },
      template: '<li :aria-current="this.$store.state.mediaNumber - 1 === ckey" @click="openFile">{{ name }}</li>',
      methods: {
        openFile: function () {
          this.$emit('open-file', this.ckey);
        }
      }
    },
    'image-viewer': {
      props: { source: String },
      template: '<img :src="source">'
    },
    'video-viewer': {
      props: { source: String },
      template: '<video><source :src="source"></source></video>'
    },
    'no-media': {
      props: [],
      template: '<h2>There is no media {{ message }}.</h2>',
      computed: {
        message: function () {
          return this.$store.state.currentFilters.length > 0 ? 'that matches that filter' : 'in this TagSpace';
        }
      }
    },
    'prop-entry': {
      props: ['prop'], // property in form [name, value || null, type]
      template: '<li :data-nobreak="prop[2]===\'Boolean\'"><span>{{ prop[0] }}: </span><input :placeholder="prop[0] === \'Title\' ? \'Title cannot be blank.\' : \'No value (start typing to set)\'" :type="inputType" v-model="localValue" :disabled="prop[2] === false"></li>',
      watch: {
        prop: function (newVal) {
          if (this.prop[2] === 'Boolean') this.$el.children[1].indeterminate = newVal[1] === null;
          this.localValue = newVal[1];
        }
      /*  localValue: function (newVal) {
          if (typeof newVal !== 'undefined' && newVal !== null && newVal !== this.prop[1]) this.$emit('change-self', this.prop[0], this.prop[2] === 'Number' ? parseInt(newVal, 10) : this.prop[2] === 'Boolean' ? (!!newVal) : newVal);
        } */
      },
      mounted: function () {
        if (this.prop[2] === 'Boolean') {
          const that = this;
          this.$el.children[1].addEventListener('dblclick', function (e) { // include a way to undefine a boolean's value.
            e.preventDefault();
            that.$emit('change-self', that.prop[0], null);
          });
        }
      },
      computed: {
        inputType: function () { // Prop types: ["String","Number","Boolean"]
          if (this.prop[2] === false) {
            return 'text';
          } else {
            return ({
              String: 'text',
              Number: 'number',
              Boolean: 'checkbox'
            })[this.prop[2]];
          }
        },
        localValue: {
          get: function () { return this.prop[1]; },
          set: function (newVal) {
            if (newVal === '' && this.prop[0] !== 'Title') {
              this.$emit('change-self', this.prop[0], null);
            } else if (typeof newVal !== 'undefined' && newVal !== null && newVal !== this.prop[1] && !(this.prop[0] === 'Title' && newVal === '')) {
              this.$emit('change-self', this.prop[0], this.prop[2] === 'Number' ? parseInt(newVal, 10) : this.prop[2] === 'Boolean' ? (!!newVal) : newVal);
            }
          }
        }
      }
    },
    'tag-entry': {
      props: ['tag', 'index'],
      template: '<div><i class="material-icons" :style="{color:tag[1]}">local_offer</i><span>{{ tag[0] }}</span><button @click="removeSelf"><i class="material-icons">remove</i></button></div>',
      methods: {
        removeSelf: function () {
          this.$emit('remove-self', this.index);
        }
      }
    },
    'tag-option': {
      props: ['tag'],
      template: '<div :style="css"><button @click="addSelf"><i class="material-icons">add_circle</i></button><span>{{ tag[0] }}</span></div>',
      methods: {
        addSelf: function () {
          this.$emit('add-self', this.tag);
        }
      },
      computed: {
        css: function () {
          return {
            '--tag-color': this.tag[1]
          };
        }
      }
    },
    'filter-chip': {
      props: ['filter', 'index', 'type'],
      template: '<div :style="css" :data-type="type"><i class="material-icons">{{ icon }}</i><span>{{ content }}</span><button @click="removeSelf"><i class="material-icons">remove</i></button></div>',
      methods: {
        removeSelf: function () {
          this.$emit('remove-self', this.index);
        }
      },
      computed: {
        content: function () {
          switch (this.type) {
            case 'tag':
              return `Tag: ${store.state.tagviewerMeta.tagList[this.filter[1].tag][0]}`;
            case 'tagColor':
              return `Color: ${this.filter[1].color}`;
            case 'propBoolean':
              return `Prop: ${this.filter[1].prop} is ${this.filter[1].positive.toString()}`;
            case 'propString':
              return `Prop: ${this.filter[1].prop} ${this.filter[1].condition} "${this.filter[1].val}"`;
            case 'propNumber':
              return `Prop: ${this.filter[1].prop} ${this.filter[1].condition} ${this.filter[1].val}`;
            case 'propResolution':
              return `Prop: Resolution ${this.filter[1].condition} ${this.filter[1].val.join('\u00d7')}`;
            case 'propSize':
              return `Prop: Size ${this.filter[1].condition} ${humanFileSize(this.filter[1].val, true, 1)}`;
          }
        },
        icon: function () {
          switch (this.type) {
            case 'tag':
            case 'tagColor':
            case 'propBoolean':
              return this.filter[1].positive ? 'add_circle' : 'remove_circle';
            case 'propString':
            case 'propNumber':
            case 'propSize':
            case 'propResolution':
              return 'album'; // idk, this one looks kind of interesting and I think the symbol in the middle (if you can stop looking at it as a record) can represent "indeterminate" fairly well.
          }
        },
        css: function () {
          switch (this.type) {
            case 'tag':
              return {
                '--color': this.filter[1].color
              };
            case 'tagColor':
              return {
                '--color': this.filter[1].color,
                '--icon-color': hexToHSL(this.filter[1].color)[2] > 50 ? '#111' : '#fff',
                '--icon-focus-color': ((h, p) => (h - 8 < p[0] && (h + 8) % 360 > p[0]) ? `hsl(${(p[0] + 180) % 360}deg, ${p[1]}%, ${p[2]}%)` : 'var(--focus-color)')(hexToHSL(this.filter[1].color)[0], hexToHSL(window.getComputedStyle(document.documentElement).getPropertyValue('--focus-color').trim()))
              };
            default:
              return {};
          }
        }
      }
    },
    'filter-option': {
      props: ['filter', 'type'],
      template: '<div :style="css"><button @click="addPositive"><i class="material-icons">add_circle</i></button><button @click="addNegative"><i class="material-icons">remove_circle</i></button><span>{{ content }}</span></div>',
      computed: {
        content: function () {
          return this.filter[0];
        },
        css: function () {
          return {
            '--tag-color': this.filter[1]
          }; // color
        }
      },
      methods: {
        addPositive: function () {
          this.$emit('add-self', this.filter, this.type, true);
        },
        addNegative: function () {
          this.$emit('add-self', this.filter, this.type, false);
        }
      }
    },
    'filter-option-prop': {
      props: ['filter'],
      template:
`<div>
  <button @click="addSelf"><i class="material-icons">add_circle</i></button>
  <button v-if="filter[1] === 'Boolean'" @click="addSelfNegative"><i class="material-icons">remove_circle</i></button>
  <span>{{ filter[0] }}</span>
  <select v-if="filter[1] !== 'Boolean'" v-model="comparisonType">
    <option v-for="option of comparisonContent" :value="option">{{option}}</option>
  </select>
  <input v-if="filter[1] !== 'Boolean'" :type="inputType" v-model="value" @keydown.enter="addSelf">
  <span v-if="filter[1] === 'Resolution'">&times;</span>
  <input v-if="filter[1] === 'Resolution'" v-model="value2" type="number" @keydown.enter="addSelf">
  <select v-if="filter[1] === 'Size'" v-model="value2">
    <option value="0">B</option>
    <option value="3">kB</option>
    <option value="6">MB</option>
    <option value="9">GB</option>
    <option value="12">TB</option>
  </select>
  <input v-if="filter[1] !== 'Size' && filter[0] !== 'Title'" v-model="inclNoval" type="checkbox" title="Include items that have no value for this property?">
  <input v-if="filter[1] === 'String'" v-model="caseSensitive" type="checkbox" title="Should the capitalization have to match exactly?">
</div>`,
      data: function () {
        return {
          value: this.filter[1] === 'Boolean' ? false : '',
          value2: null,
          comparisonType: null,
          inclNoval: false,
          caseSensitive: false
        };
      },
      computed: {
        inputType: function () {
          return { String: 'text', Number: 'number', Boolean: 'hidden', Size: 'number', Resolution: 'number' }[this.filter[1]];
        },
        comparisonContent: function () {
          return { String: ['=', '≠', '{}', '!{'], Number: ['>', '<', '=', '≠', '≥', '≤'], Size: ['>', '<', '=', '≠', '≥', '≤'], Resolution: ['>', '<', '=', '≠', '≥', '≤'], Boolean: [] }[this.filter[1]];
        }
      },
      methods: {
        addSelf: function () {
          if (this.filter[1] !== 'String' && this.value === '') { // doesn't include boolean (can't not have a `value`)
            this.$el.children[3].focus();
          } else if (this.filter[1] !== 'Boolean' && this.comparisonType === null) {
            this.$el.children[2].focus();
          } else if (this.filter[1] === 'Resolution' && (this.value2 === '' || this.value2 === null)) {
            this.$el.children[5].focus();
          } else if (this.filter[1] === 'Size') {
            this.$emit('add-self', ['propSize', { condition: this.comparisonType, val: this.value * (10 ** parseInt(this.value2, 10)) }]);
          } else if (this.filter[1] === 'Resolution') {
            this.$emit('add-self', ['propResolution', { condition: this.comparisonType, val: [this.value, this.value2], inclNoval: this.inclNoval }]);
          } else {
            this.$emit('add-self', [`prop${this.filter[1]}`, this.filter[1] === 'Boolean' ? { positive: true, prop: this.filter[0], inclNoval: this.inclNoval } : { prop: this.filter[0], condition: this.comparisonType, val: this.value, inclNoval: this.inclNoval, caseSensitive: this.caseSensitive }]);
          }
        },
        addSelfNegative: function () { // only for boolean
          this.$emit('add-self', ['propBoolean', { positive: false, prop: this.filter[0], inclNoval: this.inclNoval }]);
        }
      }
    }
  },
  computed: {
    canGoToFirst: function () { return this.$store.getters.haveMediaOptions && this.$store.state.mediaNumber > 1; },
    canGoBack: function () { return this.$store.getters.haveMediaOptions && this.$store.state.mediaNumber > 1; },
    canGoForward: function () { return this.$store.getters.haveMediaOptions && this.$store.state.mediaNumber < this.$store.getters.numOfFiles; },
    canGoToLast: function () { return this.$store.getters.haveMediaOptions && this.$store.state.mediaNumber < this.$store.getters.numOfFiles; },
    sortByOptions: function () {
      return ['Intrinsic', 'Title', 'Size', 'Resolution', ...this.$store.state.tagviewerMeta.propList.map(n => n[0])];
    },
    sortMethodOptions: function () {
      if (this.sortBy === 'Title') {
        return [{ name: 'A\u2013Z', value: 'az' }, { name: 'Z\u2013A', value: 'za' }];
      } else if (this.sortBy === 'Size') {
        return [{ name: '1\u20139', value: '19' }, { name: '9\u20131', value: '91' }];
      } else if (this.sortBy === 'Resolution') {
        return [{ name: '\u25fb\u2013\u2b1c', value: '19' }, { name: '\u2b1c\u2013\u25fb', value: '91' }];
      } else if (this.sortBy === 'Intrinsic') {
        return [];
      } else {
        return {
          String: [{ name: 'A\u2013Z', value: 'az' }, { name: 'Z\u2013A', value: 'za' }],
          Number: [{ name: '1\u20139', value: '19' }, { name: '9\u20131', value: '91' }], // small to large, large to small
          Boolean: [{ name: 'True, false', value: 't' }, { name: 'False, true', value: 'f' }] // true, false = true first, then false, and vice versa
        }[Object.fromEntries(this.$store.state.tagviewerMeta.propList)[this.sortBy]];
      }
    },
    sortBy2Options: function () {
      if (this.sortBy !== 'Intrinsic' && this.sortBy !== 'Title' && this.sortMethodOptions.map(n => n.value).includes(this.sortMethod)) {
        const newArr = ['Title', 'Size', 'Resolution', ...this.$store.state.tagviewerMeta.propList.map(n => n[0])]; // same as sortByOptions but don't include the already selected option.
        newArr.splice(newArr.indexOf(this.sortBy), 1);
        return newArr;
      } else {
        return [];
      }
    },
    sortMethod2Options: function () { // same as sortMethodOptions
      if (this.sortBy2 === 'Title') {
        return [{ name: 'A\u2013Z', value: 'az' }, { name: 'Z\u2013A', value: 'za' }];
      } else if (this.sortBy2 === 'Size') {
        return [{ name: '1\u20139', value: '19' }, { name: '9\u20131', value: '91' }];
      } else if (this.sortBy === 'Resolution') {
        return [{ name: '\u25fb\u2013\u2b1c', value: '19' }, { name: '\u2b1c\u2013\u25fb', value: '91' }];
      } else if (this.sortBy2 === '') {
        return [];
      } else {
        return {
          String: [{ name: 'A\u2013Z', value: 'az' }, { name: 'Z\u2013A', value: 'za' }],
          Number: [{ name: '1\u20139', value: '19' }, { name: '9\u20131', value: '91' }], // small to large, large to small
          Boolean: [{ name: 'True, false', value: 't' }, { name: 'False, true', value: 'f' }] // true, false = true first, then false, and vice versa
        }[Object.fromEntries(this.$store.state.tagviewerMeta.propList)[this.sortBy2]];
      }
    },
    ...Vuex.mapGetters([
      'filtersActive',
      'tagspaceIsOpen',
      'mediaIsOpen',
      'haveMediaOptions',
      'mediaPath',
      'mediaViewerType',
      'currentFilesJSON',
      'currentFiles',
      'currentFileJSON',
      'itemTags',
      'offeredItemTags'
    ]),
    ...Vuex.mapState([
      'itemProperties',
      'currentFilters'
    ]),
    allAvailTags: function () { // TODO full compat filter with the colors (can't add include/exclude tag if its color is already included (redundant), and can't include/exclude tag if its color is already excluded (not possible). However you can exclude a tag when its color is included.) This will require a rewrite of how the available filters are represented (positive and negative would need to be separate.)
      const checkArray = Array.prototype.map.call( // get the tag names
        Array.prototype.filter.call( // only include filters that are for tags ^
          this.$store.state.currentFilters,
          el => el[0] === 'tag'),
        el => el[1].tag
      );
      return Array.prototype.filter.call( // only include the available tags (those that haven't yet been added)
        this.$store.state.tagviewerMeta.tagList,
        (el, i) => !checkArray.includes(i)
      );
    },
    canSearchTags: function () {
      return this.allAvailTags.length > 3;
    },
    shownTags: function () {
      return this.tagSearchString !== null ? this.allAvailTags.filter(el => el[0].toLowerCase().includes(this.tagSearchString.toLowerCase())) : this.allAvailTags;
    },
    allAvailColors: function () {
      const checkArray = Array.prototype.map.call(
        Array.prototype.filter.call(
          this.$store.state.currentFilters,
          el => el[0] === 'tagColor'),
        el => el[1].color
      );
      return Array.prototype.map.call(
        Array.prototype.filter.call(
          [...new Set(Array.prototype.map.call(
            this.$store.state.tagviewerMeta.tagList,
            el => el[1]
          ))], // unique only (proven fastest in Node)
          el => !checkArray.includes(el)
        ),
        el => [el, el] // to be compatible
      );
    },
    canSearchColors: function () {
      return this.allAvailColors.length > 3;
    },
    shownColors: function () {
      return this.colorSearchString !== null ? this.allAvailColors.filter(el => el[0].includes(this.colorSearchString)) : this.allAvailColors;
    },
    allAvailProps: function () { // does this need to be filtered? maybe the user wants to add two filters for the same property (eg, 3 < x < 5)
      /* const checkArray = Array.prototype.map.call(
        Array.prototype.filter.call(
          this.$store.state.currentFilters,
          el => el[0].startsWith('prop')
        ),
        el => [el[1].prop, el[0].substring(4)] // accomodate properties with the same name but different types
      );
      return Array.prototype.filter.call(
        Array.prototype.concat.call(this.$store.state.tagviewerMeta.propList, [['Title', 'String']]),
        el => !checkArray.includes(el[0])
      ); */
      return Array.prototype.concat.call([['Title', 'String'], ['Size', 'Size'], ['Resolution', 'Resolution']], this.$store.state.tagviewerMeta.propList);
    },
    canSearchProps: function () {
      return this.allAvailProps.length > 5;
    },
    shownProps: function () {
      return this.propSearchString !== null ? this.allAvailProps.filter(el => el[0].toLowerCase().includes(this.propSearchString.toLowerCase())) : this.allAvailProps;
    },
    mediaNumber: {
      get: function () {
        return this.$store.state.mediaNumber;
      },
      set: function (newVal) {
        mediaNumberActuallyChanged = true;
        this.$store.dispatch('changeMediaNumber', { newVal, abs: true }); // ;) ;) ;)
      }
    }
  },
  methods: {
    openTagspaceDialog: function () {
      let openeddir = dialog.showOpenDialogSync(app.getCurrentWindow(), {
        title: 'Open a TagSpace',
        buttonLabel: 'Open',
        properties: ['openDirectory']
      });
      if (typeof openeddir !== 'undefined') {
        openeddir = openeddir[0]; // an array is returned when successful, but undefined will be returned if none are selected.
        if (fs.existsSync(path.join(openeddir, 'tagviewer.json'))) {
          let error = false;
          try { JSON.parse(fs.readFileSync(path.join(openeddir, 'tagviewer.json'))); } catch (e) {
            error = true;
            if (e instanceof SyntaxError) {
              dialog.showMessageBox(app.getCurrentWindow(), {
                type: 'error',
                message: "TagViewer's metadata file in this directory has syntax errors. Unless you've edited this file, you should report this error on GitHub by clicking the Report button.",
                title: 'Malformed metadata file!',
                buttons: ['Report', "Don't Report"],
                defaultId: 1,
                cancelId: 1
              }).then(response => {
                if (response.response === 0) app.shell.openExternal('https://github.com/TagViewer/tagviewer/issues/new');
              });
            }
          } finally {
            if (!error) {
              this.$store.dispatch('changeWorkingDirectory', { newDir: openeddir });
            }
          }
        } else {
          dialog.showMessageBox(app.getCurrentWindow(), {
            type: 'error',
            message: 'The directory you selected is not a TagSpace. Perhaps you meant to create a new TagSpace?',
            title: 'Not a TagSpace!',
            buttons: ['Okay'],
            defaultId: 0
          });
        }
      }
    },
    newTagspaceDialog: function () {
      let creationdir = dialog.showOpenDialogSync(app.getCurrentWindow(), {
        title: 'New TagSpace (using selected folder)',
        properties: ['openDirectory', 'createDirectory'],
        buttonLabel: 'Use',
        message: 'The directory you select should be empty and will be used exclusively for TagViewer.'
      });
      if (typeof creationdir !== 'undefined') {
        creationdir = creationdir[0];
        ipcRenderer.sendSync('storeValue', ['creationdir', creationdir]);
        if (fs.readdirSync(creationdir).length > 0 && (config.showDirWarning ?? (true))) {
          dialog.showMessageBox(app.getCurrentWindow(), {
            type: 'warning',
            message: `The directory you selected ("${creationdir}) is not empty. If you meant to create a new TagSpace within this directory, create the folder within the New TagSpace dialog and use that. If you have photos in this folder that you want to convert to a TagSpace, create a TagSpace in another directory and add the photos when prompted. Select Okay to delete all contents of the directory, or Cancel.`,
            buttons: ['Cancel', 'Okay'],
            defaultId: 0,
            cancelId: 0,
            checkboxChecked: false,
            checkboxLabel: "Don't show this warning again."
          }).then(response => {
            config.showDirWarning = !response.checked;
            if (response.response === 1) {
              fs.removeSync(creationdir); fs.mkdirSync(creationdir); // simpler way to delete the contents.
              let creationWizard = new app.BrowserWindow({
                width: 620,
                height: 560,
                minHeight: 350,
                minWidth: 435,
                icon: path.join(__dirname, 'icons', 'png', '64x64.png'),
                parent: app.getCurrentWindow(),
                modal: true,
                webPreferences: {
                  enableRemoteModule: true,
                  nodeIntegration: true,
                  devTools: true
                },
                backgroundColor: '#fff'
              });
              creationWizard.removeMenu();
              creationWizard.loadFile('configuretagspace.html');
              ipcRenderer.once('doneCreating', () => { creationWizard.close(); this.$store.dispatch('changeWorkingDirectory', { newDir: creationdir }); creationWizard = null; });
            }
          });
        } else {
          let creationWizard = new app.BrowserWindow({
            width: 620,
            height: 560,
            minHeight: 350,
            minWidth: 435,
            icon: path.join(__dirname, 'icons', 'png', '64x64.png'),
            parent: app.getCurrentWindow(),
            modal: true,
            webPreferences: {
              enableRemoteModule: true,
              nodeIntegration: true,
              devTools: true
            },
            backgroundColor: '#fff'
          });
          creationWizard.removeMenu();
          creationWizard.loadFile('configuretagspace.html');
          ipcRenderer.once('doneCreating', () => { creationWizard.close(); this.$store.dispatch('changeWorkingDirectory', { newDir: creationdir }); creationWizard = null; });
        }
      }
    },
    addMediaDialog: function () {
      // We're relying that the tagviewerMeta data is correct, but there's no reason it won't be (I hope). It would be excessive to read it here as well.
      const fileList = app.dialog.showOpenDialogSync(app.getCurrentWindow(), {
        title: 'Add Media',
        filters: [{ name: 'Images', extensions: ['gif', 'png', 'jpg', 'jpeg', 'svg', 'webp'] }, { name: 'Videos', extensions: ['.flac', '.mp4', '.webm', '.wav'] }, { name: 'All Media', extensions: ['gif', 'png', 'jpg', 'jpeg', 'svg', 'webp', '.flac', '.mp4', '.webm', '.wav'] }],
        properties: ['openFile', 'multiSelections'],
        message: "Select the media you'd like to add."
      });
      if (fileList !== undefined) {
        for (const i in fileList) {
          const file = fileList[i];
          fs.copyFileSync(file, path.join(this.$store.state.openDirectory, (parseInt(this.$store.state.tagviewerMeta.currentIndex, 10)) + path.extname(file))); // should this be synchronous?
          this.$store.dispatch('addMedia', [{
            // the currentIndex is updated within the addMedia mutation called by the homonymous action.
            _path: (this.$store.state.tagviewerMeta.currentIndex) + path.extname(file),
            _origBasename: path.basename(file),
            tags: [],
            props: {},
            title: path.parse(file).name,
            size: fs.statSync(file).size,
            resolution: ((['.flac', '.mp4', '.webm', '.wav'].includes(path.extname(this.$store.getters.mediaPath))) // TODO: add duration for videos.
              ? [-1, -1] : (a => [a.width, a.height])(imageSize(file))
            )
          }, (parseInt(this.$store.state.tagviewerMeta.currentIndex, 10))]); // for verification
        }
      }
      app.app.showExitPrompt = true;
      vm.showExitPrompt = true;
      debouncedSync();
      store.dispatch('updatePropMenu');
    },
    goToFirstMedia: function () { mediaNumberActuallyChanged = true; this.$store.dispatch('changeMediaNumber', { newVal: 1, abs: true }); },
    goToPreviousMedia: function () { mediaNumberActuallyChanged = true; this.$store.dispatch('changeMediaNumber', { newVal: -1, abs: false }); },
    goToNextMedia: function () { mediaNumberActuallyChanged = true; this.$store.dispatch('changeMediaNumber', { newVal: 1, abs: false }); },
    goToLastMedia: function () { mediaNumberActuallyChanged = true; this.$store.dispatch('changeMediaNumber', { newVal: this.$store.getters.numOfFiles, abs: true }); },
    viewMediaExternal: function () { app.shell.openPath(this.$store.getters.mediaPath); },
    deleteMedia: function () {
      if (!Object.prototype.hasOwnProperty.call(this.$store.getters.currentFileJSON, '_index')) console.error('_index not found in current file.');
      if ((cache.showDeleteWarning ?? (true))) {
        dialog.showMessageBox(app.getCurrentWindow(), {
          title: 'Deletion Confirmation',
          message: `Would you really like to delete the current media? This is revokable (the media file will be moved to ${process.platform === 'win32' ? 'the Recycle Bin' : process.platform === 'linux' ? 'the Wastebasket' : 'Trash'}) but the metadata (tags and properties) will be lost permanently for this media. Note: TagViewer will not delete the original media file.`,
          buttons: ['Cancel', 'Delete'],
          cancelId: 0,
          defaultId: 0,
          checkboxChecked: false,
          checkboxLabel: "Don't show this warning again.",
          type: 'warning'
        }).then(({ response, checkboxChecked }) => {
          cache.showDeleteWarning = !checkboxChecked;
          if (response === 1) {
            this.$store.dispatch('removeMedia', this.$store.getters.currentFileJSON._index);
            app.app.showExitPrompt = true;
            vm.showExitPrompt = true;
            debouncedSync();
            this.$store.dispatch('updatePropMenu');
          }
        });
      } else {
        this.$store.dispatch('removeMedia', this.$store.getters.currentFileJSON._index);
        app.app.showExitPrompt = true;
        vm.showExitPrompt = true;
        debouncedSync();
        this.$store.dispatch('updatePropMenu');
      }
    },
    replaceMedia: function () {
      if (!Object.prototype.hasOwnProperty.call(this.$store.getters.currentFileJSON, '_index')) console.error('_index not found in current file.');
      let replacement = dialog.showOpenDialogSync(app.getCurrentWindow(), {
        title: 'Select Replacement',
        buttonLabel: 'Replace',
        message: 'Select the media that will replace the current media. If you cancel no action will be taken.',
        properties: ['openFile'],
        filters: [{ name: 'Images', extensions: ['gif', 'png', 'jpg', 'jpeg', 'svg', 'webp'] }, { name: 'Videos', extensions: ['.flac', '.mp4', '.webm', '.wav'] }, { name: 'All Media', extensions: ['gif', 'png', 'jpg', 'jpeg', 'svg', 'webp', '.flac', '.mp4', '.webm', '.wav'] }]
      });
      if (replacement.length > 1) {
        dialog.showMessageBox(app.getCurrentWindow(), {
          title: 'Only One Selection',
          message: 'Please only select one file.',
          buttons: ['Okay'],
          defaultId: 0,
          cancelId: 0,
          type: 'warning'
        });
      } else {
        replacement = replacement[0];
        Promise.all([fs.remove(this.$store.getters.mediaPath), fs.copyFile(replacement, path.join(this.$store.state.openDirectory, this.$store.getters.currentFileJSON._index + path.parse(replacement).ext))]).then(() => {
          this.$store.state.tagviewerMeta.files[this.$store.getters.currentFileJSON._index].size = fs.statSync(replacement).size;
          this.$store.state.tagviewerMeta.files[this.$store.getters.currentFileJSON._index].resolution = (a => [a.width, a.height])(imageSize(replacement));
          this.$store.state.tagviewerMeta.files[this.$store.getters.currentFileJSON._index].title = path.parse(replacement).name;
          this.$store.state.tagviewerMeta.files[this.$store.getters.currentFileJSON._index]._origBasename = path.basename(replacement);
          this.$store.state.tagviewerMeta.files[this.$store.getters.currentFileJSON._index]._path = this.$store.getters.currentFileJSON._index + path.parse(replacement).ext;
        });
      }
    },
    newFilterTextQuake: function () {
      this.tentativeFilterText = '';
      this.filterQuake = true;
    },
    editFilterTextQuake: function () {
      this.tentativeFilterText = stringifyFilter(this.currentFilters);
      this.filterQuake = true;
    },
    configureTagSpaceDialog: function () {
      let configDialog = new app.BrowserWindow({
        title: 'TagSpace Configuration',
        width: 620,
        height: 560,
        minHeight: 350,
        minWidth: 435,
        icon: path.join(__dirname, 'icons', 'png', '64x64.png'),
        parent: app.getCurrentWindow(),
        modal: true,
        webPreferences: {
          enableRemoteModule: true,
          nodeIntegration: true,
          devTools: true
        },
        backgroundColor: '#fff'
      });
      configDialog.loadFile('tagspaceconfig.html');
      ipcRenderer.send('storeValue', ['metaObject', this.$store.state.tagviewerMeta]);
      configDialog.once('closed', function () {
        store.dispatch('updateMetadata', ipcRenderer.sendSync('getValue', 'metaObject'));
        configDialog = null;
      });
    },
    settingsDialog: function () {
      let settingsDialog = new app.BrowserWindow({
        width: 620,
        height: 560,
        minHeight: 350,
        minWidth: 435,
        parent: app.getCurrentWindow(),
        icon: path.join(__dirname, 'icons', 'png', '64x64.png'),
        webPreferences: {
          enableRemoteModule: true,
          nodeIntegration: true,
          devTools: true
        }
      });
      ipcRenderer.sendSync('storeValue', ['configObject', config]);
      settingsDialog.loadFile('settings.html');
      settingsDialog.once('closed', function () {
        config = ipcRenderer.sendSync('getValue', 'configObject');
        debouncedConfigSync();
        settingsDialog = null;
      });
    },
    aboutDialog: function () {
      const aboutDialog = new app.BrowserWindow({
        width: 1000,
        height: 700,
        icon: path.join(__dirname, 'icons', 'png', '64x64.png'),
        webPreferences: {
          enableRemoteModule: false,
          nodeIntegration: false
        }
      });
      aboutDialog.setMenu(new app.Menu());
      aboutDialog.loadFile('about.html');
    },
    helpDialog: function () {
      let helpDialog = new app.BrowserWindow({
        width: 620,
        height: 560,
        icon: path.join(__dirname, 'icons', 'png', '64x64.png'),
        webPreferences: {
          enableRemoteModule: false,
          nodeIntegration: false
        }
      });
      helpDialog.setMenu(new app.Menu());
      helpDialog.loadFile('help.html');
      helpDialog.on('closed', () => { helpDialog = null; });
    },
    openPreviousTagspace: function () {
      this.$store.dispatch('changeWorkingDirectory', { newDir: cache.openDirectory });
    },
    openSelf: function (index) {
      mediaNumberActuallyChanged = true;
      this.$store.dispatch('changeMediaNumber', { newVal: index + 1, abs: true });
    },
    changeProperty: function (propName, newValue) {
      this.$store.dispatch('changeProperty', { propName, newValue });
    },
    addFilter: function (filter, type, positive) {
      switch (type) {
        case 'tag':
          this.$store.dispatch('addFilter', ['tag', { tag: this.$store.state.tagviewerMeta.tagList.indexOf(filter), color: filter[1], positive }]);
          break;
        case 'color':
          this.$store.dispatch('addFilter', ['tagColor', { color: filter[1], positive }]);
          break;
      }
    },
    addPremadeFilter: function (filter) { // for an already written filter, to add as-is
      this.$store.dispatch('addFilter', filter);
    },
    removeFilter: function (index) {
      this.$store.dispatch('removeFilter', index);
    },
    removeAllFilters: function () {
      this.$store.dispatch('removeAllFilters');
    },
    removeTag: function (index) {
      this.$store.dispatch('removeTag', index);
    },
    addTag: function (tag) {
      this.$store.dispatch('addTag', tag);
    },
    startSlideshow: function () {
      this.slideshowInterval = this.slideshowInterval === null ? window.setInterval(function () {
        if (vm.canGoForward) vm.goToNextMedia(); else if (!(config.stopSlideshowAtEnd ?? (false))) vm.goToFirstMedia(); else vm.endSlideshow();
      }, (config.slideshowInterval ?? (1000))) : this.slideshowInterval;
    },
    startSlideshowFS: function () {
      this.isFullscreen = true;
      this.startSlideshow();
    },
    endSlideshow: function () {
      if (this.slideshowInterval !== null) { window.clearInterval(this.slideshowInterval); this.slideshowInterval = null; }
    },
    invertColors: function () {
      if ((config.theme ?? ('default-light')) === 'default-light') config.theme = 'default-dark'; else config.theme = 'default-light';
      setInterfaceTheme(config.theme);
      debouncedConfigSync();
    }
  }
});

if (Object.prototype.hasOwnProperty.call(cache, 'openDirectory') && fs.existsSync(path.join(cache.openDirectory, 'tagviewer.json')) && (config.resumeSessionOnRestart ?? (false))) vm.openPreviousTagspace();

ipcRenderer.on('tagDeleted', function (e, index) {
  store.dispatch('tagDeleted', index);
});

window.onbeforeunload = function () {
  fs.writeJSON(path.join(app.app.getPath('userData'), 'cache.json'), cache);
  fs.writeJSON(path.join(app.app.getPath('userData'), 'config.json'), config);
};

document.body.classList.remove('before-content-load');
