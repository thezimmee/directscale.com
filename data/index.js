module.exports = {
  site: require('./site'),
  testimonials: require('./testimonials'),
  solutions: require('./solutions'),
  sitemap: require('./sitemap'),
  nav: require('./nav'),
  pricing: require('./pricing'),
  partners: require('./partners'),
  $: {
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
}
