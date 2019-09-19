/*! .rolluprc.js | @author Brikcss (https://github.com/brikcss) | @reference (https://rollupjs.org) */

// -------------------------------------------------------------------------------------------------
// Imports and setup.
//

// import replace from 'rollup-plugin-replace'
import configGen from '@brikcss/rollup-config-generator'

// -------------------------------------------------------------------------------------------------
// Generate and export rollup configuration.
//

export default configGen.create([
  {
    type: 'iife',
    input: 'src/app.js',
    output: {
      file: 'build/app.js'
    }
  }, {
    type: 'iife',
    input: 'src/pages/index.js',
    output: {
      file: 'build/index.js'
    }
  }, {
    type: 'iife',
    input: 'src/pages/product/index.js',
    output: {
      file: 'build/product/index.js'
    }
  }
])
