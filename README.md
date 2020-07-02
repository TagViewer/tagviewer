# TagViewer
![Version badge](https://img.shields.io/github/package-json/v/tagviewer/tagviewer/main) ![Latest release](https://img.shields.io/github/v/release/tagviewer/tagviewer?sort=semver) ![Commits since latest release](https://img.shields.io/github/commits-since/tagviewer/tagviewer/latest/main?sort=semver)     
TagViewer is a simple program that allows viewing of media within a TagSpace, and rich filtering of that media with tags and properties that are stored by the program. You can also sort by values of properties or presence of tags, as well as show the media in a slideshow.
#### You should use TagViewer if:

 - You have a large repository of media that can be categorized in multiple ways
 - You don't want to commit to one sorting hierarchy
 - You find yourself looking through multiple directories for media that are in the same logical category
 - You want to be able to store properties of the media
#### You should not use TagViewer if:
 - Your media has one fixed system of sorting that you are satisfied with / there is only one way to sort it
 - The directory hierarchy you already have works well for you
 - Extra metadata isn't important or necessary for your use case
 - You don't like Node/Electron apps
## License
![License badge](https://img.shields.io/badge/license-GPL%20v3.0-blue)    
TagViewer Copyright © 2020  Matt Fellenz
This program comes with ABSOLUTELY NO WARRANTY; read the license for more details. This is free software, and you are welcome to redistribute it under certain conditions, as outlined in the license.

TagViewer is licensed under the GNU General Public License 3.0. For more information, view [the license](https://www.gnu.org/licenses/gpl-3.0.en.html) here.
## Documentation / User Guide
TagViewer is designed to be intuitive by default but also allow meaningful configuration. Read the documentation [here](https://tagviewer.gitbook.io/tagviewer), which includes a Beginner's Guide and Step-by-Step Tutorial to get started, complete documentation of the functionality for more advanced users, and a configuration guide.
## Hacking
Contributions are welcome in the form of issues and pull requests. Some relevant information:
- TagViewer is written in Vue with a Vuex store, on top of Electron.
- To start the program in a development environment, simply run `npm run startdev` for a development environment or `npm start` for production.
- The metadata is stored in JSON, as is the cache and configuration (though these are stored in TagViewer's install directory).
- JavaScript is linted with ESLint Semistandard, using the rules in the `.eslintrc` file. This means that I use semicolons, because things get hairy if you don't. The only change I've made to the `.eslintrc` is to not use parens surrounding single arguments for arrow functions.
- HTML is linted with LintHTML, simply to check for proper syntax (as opposed to id/class/attribute consistency).
- CSS is written in Less. While Sass and Less both has their merits, I don't use any of Sass's 'programming' features like conditionals and loops, its agenda against brackets is just confusing and reminiscent of Python, and Less's documentation is more intelligible, so for those reasons and more I use Less.
- In addition, Less is linted with StyleLint, using the included `.stylelintrc.json`. It deviates from `stylelint-config-standard` only in a few ways, which you can see for yourself in its configuration, the main change being that there is no space after colons in declarations.
- As a general rule, the HTML, CSS, and JavaScript for a page all have the same name (`index.html`, `index.css` compiled from `index.less`, and `index.js`, for example). Therefore, the startup script is named `main.js`.
- I use two spaces to indent, and if you don't like that, I don't know what to tell you.

Pull requests should only make the minimum change required to fix the issue they address (whether that is a bug, enhancement, or something else).

## Credits
We appreciate Google's Material Icons as they play a prominent role in the user interface.
