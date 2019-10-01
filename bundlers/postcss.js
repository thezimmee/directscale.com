const postcss = require('postcss')
const path = require('path')
const isProduction = ['production', 'stage', 'test'].includes(process.env.NODE_ENV)

module.exports = (bundle, bundler) => {
  // Grab any config file, if exists, and merge it with bundler options.
  const options = Object.assign(
    {
      map: !isProduction
    },
    bundler.config ? require(path.resolve(bundler.config)) : {},
    bundler.options || {}
  )

  // Use bundler.plugins or config file's plugins, not both. Bundler plugins takes precedence.
  if (options.plugins) {
    bundler.plugins = bundler.plugins || options.plugins
    delete options.plugins
  }

  // With bundler.import, auto add postcss-import and add the imported files to watchFiles.
  if (options.import) {
    // Make sure options.import is an Object since it will be passed to postcss-import.
    if (typeof options.import !== 'object' || options.import.constructor !== Object) {
      options.import = {}
    }
    // Make sure options.watchFiles is an Array so we can add postcss imports to it.
    if (!(bundle.options.watchFiles instanceof Array)) bundle.options.watchFiles = []
    // Merge import in config file with bundler's options.import.
    options.import = Object.assign(options.import, {
      load (filepath) {
        if (!bundle.options.watchFiles.includes(filepath)) bundle.options.watchFiles.push(filepath)
        return require('read-cache')(filepath, 'utf-8')
      }
    })
    // Add postcss-import as the first plugin.
    bundler.plugins.unshift(require('postcss-import')(options.import))
  }

  // Compile all files, update the file and return the bundlsses.
  const promises = []
  bundle.changed.forEach((file, i, map) => {
    promises.push(postcss(bundler.plugins)
      .process(file.content, Object.assign(options, { from: file.source.path }))
      .then(result => {
        file.content = result.css
        if (result.map) file.map = result.map
        return file
      }))
  })
  return Promise.all(promises).then(() => bundle)
}
