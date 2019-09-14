const cssStats = require('cssstats')
const getColors = require('get-css-colors')
const fs = require('fs-extra')
const path = require('path')

module.exports = (bundle, bundler) => {
  bundle.changed.forEach(file => {
    // Create report.
    const stats = cssStats(file.content) || {}
    const colors = getColors(file.content) || []
    const uniqueColors = [...new Set(colors)]
    stats.colors = {
      total: colors.length,
      unique: uniqueColors.length,
      list: uniqueColors
    }

    // Output JSON.
    if (typeof bundler.to === 'function') {
      bundler.to(stats, { file, bundle })
    } else {
      const date = new Date()
      bundler.to = path.parse(file.source.path)
      bundler.to.dir = path.join('.css-stats', bundler.to.dir)
      bundler.to.base = `${bundler.to.base}--${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}${date.getMinutes()}${date.getSeconds()}`
      fs.outputJson(path.join(bundler.to.dir, bundler.to.base), stats, { spaces: 2 })
    }
  })
  return bundle
}
