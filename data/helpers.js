const path = require('path')

module.exports = {
  url (url, rootPath = '') {
    if (url.indexOf('http') === 0 || url.indexOf('//') === 0) return url
    else if (url.indexOf('/') === 0) return path.join(rootPath, url.slice(1))
    else if (url.indexOf('./') === 0) return path.join(rootPath, url.slice(2))
    return path.join(rootPath, url)
  },
  svg (url) {
    return url.split('/').slice(-1)[0].replace('.svg', '')
  },
  asset (url, alt) {
    // svg...
    if (url.indexOf('.svg') > -1) {
      return `<icon data-name="${url.split('/').slice(-1)[0].replace('.svg', '')}"></icon>`
    }
    // image...
    return `<img src="${url}" alt="${alt}" />`
  }
}
