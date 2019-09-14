/*! .lintstagedrc.js | @author brikcss <https://github.com/brikcss> | @reference <https://github.com/okonet/lint-staged> */

module.exports = {
  'build/*.js': [
    'npx node-minify --compressor uglify-es --input *.js --output $1.js',
    'git add'
  ],
  'src/!(*.min).js': ['standard --fix', 'git add'],
  '!(*.min).css': ['prettier --parser css --write', 'git add'],
  '*.json': ['prettier --parser json --write', 'git add'],
  '*.{yml,yaml}': ['prettier --parser yaml --write', 'git add'],
  '*.md': ['prettier --parser markdown --write', 'git add'],
  '*.html': ['prettier --parser html --write', 'git add']
}
