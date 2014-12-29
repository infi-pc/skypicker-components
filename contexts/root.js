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
    scripts: [
      "/builds/datepicker.js",
      "/scripts/initDatepicker.js"
    ],
    styles: [
      "/styles/main.css",
      "/styles/modules/date-picker-skypicker.css"
    ],
    template: "basic.html",
    html: "templates/datepicker.html",
    cases: {
      skypicker: {
        styles: [
          "/styles/main.css",
          "/styles/modules/date-picker-skypicker.css"
        ]
      },
      whichairline: {
        styles: [
          "/styles/main.css",
          "/styles/modules/date-picker.css"
        ]
      },
      plain: {
        styles: [
          "/styles/main.css",
          "/styles/modules/date-picker-base.css"
        ]
      }
    }
  }
};
