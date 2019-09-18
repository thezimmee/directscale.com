module.exports = {
  site: require('./site'),
  testimonials: require('./testimonials'),
  solutions: require('./solutions'),
  sitemap: require('./sitemap'),
  nav: require('./nav'),
  $: {
    svg (url) {
      return url.split('/').slice(-1)[0].replace('.svg', '')
    }
  }
}
