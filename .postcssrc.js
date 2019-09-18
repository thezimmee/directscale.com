const isProd = ['production', 'test', 'ci'].includes(process.env.NODE_ENV)
// const cssFunctions = require('./src/css/globals.cssfn.js')

module.exports = {
  // This configures the postcss bundler to handle postcss-import.
  import: {
    path: ['src/components', 'src/views']
  },
  plugins: [
    // postcss-import is handled automatically by the postcss bundler.
    // require('postcss-import')(),
    require('postcss-mixins')({
      // mixins: {}, // Object dictionary of function mixins.
      // mixinsDir: 'data/css/mixins', // Directory to autoload mixins from.
      // mixinsFiles: 'src/modules/**/*.mixin.{js,css}' // Mixin file(s) (glob supported).
      // silent: false, // Remove unknown mixins without throwing an error.
    }),
    // require('postcss-functions')({
    //   functions: cssFunctions,
    //   glob: '{src,data}/**/*.cssfn.js'
    // }),
    require('postcss-css-variables')({ preserve: true }),
    require('postcss-nested-ancestors')(),
    require('postcss-nested')({
      // bubble: [],
      // unwrap: [],
      // preserveEmpty: false
    }),
    require('postcss-custom-media')({
      preserve: false
      // importFrom: 'data/css/media-queries.js'
    }),
    require('postcss-pxtorem')({
      rootValue: 24,
      propList: ['*'],
      selectorBlackList: [/^html$/, /^body$/]
    }),
    require('postcss-calc')({
      preserve: false,
      warnWhenCannotResolve: false,
      selectors: false,
      mediaQueries: false
    }),
    require('@fullhuman/postcss-purgecss')({
      content: ['build/**/index.html', 'build/app.js', 'build/index.js'],
      whitelist: [],
      whitelistPatterns: [/(.*)--is(.*)/g]
    }),
    require('autoprefixer')(),
    isProd ? require('cssnano')({ preset: 'default' }) : require('postcss-reporter')()
  ]
}
