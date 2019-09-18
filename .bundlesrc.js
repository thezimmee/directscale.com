const bs = require('browser-sync')
const server = bs.has('bundles') ? bs.get('bundles') : bs.create('bundles')
const postcssConfig = require('./.postcssrc.js')
const browserSyncConfig = require('./.browsersyncrc.js')
const data = require('./data')
const SVGO = require('svgo')
const svgo = new SVGO({
  plugins: [{
    cleanupAttrs: true
  }, {
    removeDoctype: true
  }, {
    removeXMLProcInst: true
  }, {
    removeComments: true
  }, {
    removeMetadata: true
  }, {
    removeTitle: true
  }, {
    removeDesc: true
  }, {
    removeUselessDefs: true
  }, {
    removeEditorsNSData: true
  }, {
    removeEmptyAttrs: true
  }, {
    removeHiddenElems: true
  }, {
    removeEmptyText: true
  }, {
    removeEmptyContainers: true
  }, {
    removeViewBox: true
  }, {
    cleanupEnableBackground: true
  }, {
    convertStyleToAttrs: false
  }, {
    convertColors: false
  }, {
    convertPathData: true
  }, {
    convertTransform: true
  }, {
    removeUnknownsAndDefaults: true
  }, {
    removeNonInheritableGroupAttrs: true
  }, {
    removeUselessStrokeAndFill: true
  }, {
    removeUnusedNS: true
  }, {
    cleanupIDs: true
  }, {
    cleanupNumericValues: true
  }, {
    moveElemsAttrsToGroup: true
  }, {
    moveGroupAttrsToElems: true
  }, {
    collapseGroups: true
  }, {
    removeRasterImages: true
  }, {
    mergePaths: true
  }, {
    convertShapeToPath: true
  }, {
    sortAttrs: true
  }, {
    removeDimensions: true
  }, {
    removeAttrs: { attrs: '(stroke|fill|version|xmlns|id)' }
  }]
})

module.exports = {
  bundles: [
    {
      id: 'pages',
      input: ['src/index.html'],
      bundlers: [
        {
          run: '@bundles/bundles-ejs',
          options: {
            root: 'src'
          }
        },
        {
          run: './bundlers/html.js',
          options: {
            components: {
              paths: ['src/components'],
              ejs: {
                root: 'src'
              }
            }
          }
        },
        {
          run: '@bundles/bundles-output',
          options: {
            to: 'build',
            root: 'src',
            incremental: false
          }
        }
      ]
    }, {
      id: 'styles',
      input: 'src/app.css',
      bundlers: [
        {
          run: './bundlers/postcss.js',
          options: postcssConfig
        // }, {
        //   run: './bundlers/css-stats.js'
        }, {
          run: '@bundles/bundles-output',
          options: {
            to: 'build/css',
            root: 'src/css'
          }
        }
      ]
    }, {
      id: 'assets',
      input: [
        // 'src/archive/**/*',
        // 'src/{.htaccess,browserconfig.xml,favicon.ico,humans.txt,robots.txt,site.webmanifest}',
        // 'src/*.png',
        'src/assets/images/*',
        'src/assets/fonts/montserrat/',
        'src/assets/svg/icon-pattern.svg'
        // 'src/assets/**/*'
      ],
      bundlers: [
        {
          run: '@bundles/bundles-output',
          options: {
            to: 'build',
            root: 'src'
          }
        }
      ]
    }, {
      id: 'svg',
      input: ['src/assets/svg/*.svg', '!src/assets/svg/*.min.svg'],
      options: {
        glob: {
          ignore: ['src/assets/svg/*.min.svg']
        }
      },
      bundlers: [
        {
          run: function (bundle, bundler) {
            const promises = []
            bundle.changed.forEach(file => {
              promises.push(svgo.optimize(file.content).then(result => {
                file.content = result.data
              }))
            })

            return Promise.all(promises).then(() => bundle)
          }
        }, {
          run: '@bundles/bundles-output',
          options: {
            to: function (file, bundler) {
              return file.source.path.replace('.svg', '.min.svg')
            }
          }
        }
      ]
    }
  ],
  options: {
    loglevel: 'info'
  },
  on: {
    afterBundle (Bundles) {
      // Don't do anything if the bundle is not being watched.
      if (!Bundles.watching) return
      // Initialize it if it hasn't been yet.
      if (!server.active) {
        server.init(browserSyncConfig)
      } else {
        server.reload()
      }
    }
  },
  data
}
