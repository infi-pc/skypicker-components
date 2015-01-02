module.exports = {
  search: {
    libs: [
      "/scripts/es5-shim.min.js",
      "/scripts/es5-sham.min.js",
      "/scripts/eventListener.polyfill.js",
      "/scripts/console.polyfill.js",
      "/scripts/jquery-2.1.1.js",
      "/scripts/react-0.12.1/build/react-with-addons.js",
      "/scripts/moment-with-locales.js",

      //"/scripts/bundle.js", //TODO require
      //"/scripts/main.js"  //TODO add to init
    ],
    baseTemplate: "base.jsx",
    cases: {
      "date skypicker": {
        styles: [
          "/styles/main.css",
          "/styles/modules/skypicker.css"
        ],
        scripts: [
          "/builds/datepicker.js"
        ],
        template: "templates/datepicker.jsx"
      },
      "date whichairline": {
        styles: [
          "/styles/main.css",
          "/styles/modules/whichairline.css"
        ],
        scripts: [
          "/builds/datepicker.js"
        ],
        template: "templates/datepicker.jsx"
      },
      "place skypicker": {
        styles: [
          "/styles/main.css",
          "/styles/modules/skypicker.css"
        ],
        scripts: [
          "/builds/placepicker.js"
        ],
        template: "templates/placepicker.jsx"
      },
      "place whichairline": {
        styles: [
          "/styles/main.css",
          "/styles/modules/whichairline.css"
        ],
        scripts: [
          "/builds/placepicker.js"
        ],
        template: "templates/placepicker.jsx"
      }
    }
  }
};
