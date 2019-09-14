module.exports = {
  server: {
    baseDir: 'build'
    // directory: true
    // index: 'index.html',
    // routes: {
    //   '/about': '/'
    // }
  },
  // startPath: 'examples/esm',
  // files: ['build'],
  // ignore: [],
  watchEvents: ['add', 'change', 'unlink'],
  watch: true,
  ui: false,
  ghostMode: {
    clicks: false,
    scroll: false,
    forms: {
      submit: false,
      inputs: false,
      toggles: false
    }
  },
  logLevel: 'info',
  logPrefix: 'DS',
  logConnections: false,
  logFileChanges: true,
  open: true,
  browser: 'default',
  reloadOnRestart: true,
  notify: {
    styles: {
      top: 'auto',
      bottom: 0,
      padding: '5px 15px',
      'border-radius': '6px 0 0 0',
      'background-color': 'rgba(0, 0, 0, .6)'
    }
  },
  scrollProportionally: false,
  scrollThrottle: 100
}
