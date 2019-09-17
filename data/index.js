module.exports = {
  site: require('./site'),
  testimonials: require('./testimonials'),
  nav: require('./nav'),
  $: {
    svg (url) {
      return url.split('/').slice(-1)[0].replace('.svg', '')
    }
  }
}
