// Karma configuration for gamegauge-ui
// Ajoute un launcher "ChromeHeadlessNoSandbox" utilisable en CI (conteneurs/root).
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma'),
    ],
    client: {
      jasmine: {},
      clearContext: false, // laisse visible le rapport Jasmine Spec Runner dans le navigateur
    },
    jasmineHtmlReporter: {
      suppressAll: true, // supprime les traces dupliquées
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/gamegauge-ui'),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'text-summary' }, { type: 'lcovonly' }],
    },
    reporters: ['progress', 'kjhtml'],
    browsers: ['Chrome'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
      },
    },
    restartOnFileChange: true,
  });
};
