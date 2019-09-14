const cheerio = require('cheerio')
const fs = require('fs-extra')
const path = require('path')
const ejs = require('ejs')
const merge = require('@brikcss/merge')
const log = require('loglevel')
const inlineElements = ['a', 'abbr', 'acronym', 'audio', 'b', 'bdi', 'bdo', 'big', 'br', 'button', 'canvas', 'cite', 'code', 'data', 'datalist', 'del', 'dfn', 'em', 'embed', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'label', 'map', 'mark', 'meter', 'noscript', 'object', 'output', 'picture', 'progress', 'q', 'ruby', 's', 'samp', 'script', 'select', 'slot', 'small', 'span', 'strong', 'sub', 'sup', 'svg', 'template', 'textarea', 'time', 'u', 'tt', 'var', 'video', 'wbr']
const _ = {
  components: {}
}
let md
let $
let lorem

module.exports = (bundle, bundler) => {
  //
  // Configuration.
  //
  const config = merge(
    {
      custom: [],
      components: {
        selector: 'component',
        paths: [],
        unwrap: true,
        ejs: {},
        map: {}
      },
      markdown: {
        selector: '[markdown]',
        options: {},
        init: initMarkdown
      },
      spaceless: '[spaceless]',
      lorem: {
        auto: 'lorem',
        paragraphs: '[lorem], [p], [paragraphs]',
        sentences: '[sentences], [s]',
        words: '[words], [w]',
        init: initLorem,
        options: {}
      },
      unwrap: 'unwrap, [unwrap]',
      cheerio: {
        decodeEntities: false
      },
      minify: ['production', 'test'].includes(process.env.NODE_ENV),
      minifier: {
        collapseInlineTagWhiteSpace: true,
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
        minifyURLs: true,
        processConditionalComments: true,
        removeComments: true,
        sortAttributes: true,
        sortClassName: true,
        trimCustomFragments: true,
        useShortDoctype: true
      }
    }, bundler.options || {})

  //
  // For effeciency, optimize certain plugins once.
  //
  if (config.markdown && typeof config.markdown.init === 'function') config.markdown.init(config.markdown.options)
  if (config.lorem && typeof config.lorem.init === 'function') lorem = config.lorem.init(config.lorem.options)
  if (config.components && ((config.components.paths && config.components.paths.length) || (config.components.map && Object.keys(config.components.map).length))) {
    initComponents(config.components)
  }

  //
  // Iterate through changed files.
  //
  bundle.changed.forEach(file => {
    // Create the dom and plugins.
    $ = cheerio.load(file.content, config.cheerio)
    $.prototype.spaceless = processSpaceless
    $.prototype.lorem = processLorem
    $.prototype.loremParagraphs = processLoremParagraphs
    $.prototype.loremWords = processLoremWords
    $.prototype.loremSentences = processLoremSentences
    $.prototype.unwrap = processUnwrap
    $.prototype.markdown = processMarkdown
    $.prototype.component = processComponent

    // Process components.
    if (config.components) {
      if (config.components.selector) {
        $(config.components.selector).component(config.components, bundle.data)
      }
      if (Object.keys(_.components).length) {
        Object.keys(_.components).forEach(tag => {
          $(tag).component(config.components, bundle.data)
        })
      }
    }

    // Process built-in transforms.
    if (config.markdown) $(config.markdown.selector).markdown()
    if (config.lorem) {
      if (config.lorem.auto) $(config.lorem.auto).lorem()
      if (config.lorem.paragraphs) $(config.lorem.paragraphs).loremParagraphs()
      if (config.lorem.sentences) $(config.lorem.sentences).loremSentences()
      if (config.lorem.words) $(config.lorem.words).loremWords()
    }
    if (config.spaceless) $(config.spaceless).spaceless()
    if (config.unwrap) $(config.unwrap).unwrap()

    // Process custom transforms.
    if (config.custom && config.custom.length) {
      config.custom.forEach(transform => {
        if (typeof transform === 'function') transform($)
      })
    }

    // Update file.content and return
    file.content = $.html()
    if (config.minify) {
      const minify = require('html-minifier').minify
      file.content = minify(file.content, config.minifier)
    }
    return file
  })

  return bundle
}

/**
 * Default initialization for lorem-ipsum module.
 *
 * @param {Object} [config={}]  lorem-ipsum module configuration.
 */
function initLorem (config = {}) {
  const LoremIpsum = require('lorem-ipsum').LoremIpsum
  lorem = new LoremIpsum(config)
  return lorem
}

/**
 * Default initialization method for markdown-it.
 *
 * @param {Object} config  Configuration for markdown-it.
 * @return {Function}  markdown-it.
 */
function initMarkdown (config) {
  config = Object.assign({
    prefix: '<pre class="hljs"><code>',
    suffix: '</code></pre>',
    options: {},
    plugins: []
  }, config)
  // Add highlighting, unless it's explicitly set to false.
  if (config.options.highlight === undefined) {
    config.options.highlight = (string, language) => {
      const hljs = require('highlight.js')
      if (language && hljs.getLanguage(language)) {
        try {
          return `${config.markdown.prefix}${hljs.highlight(language, string, true).value}${config.markdown.suffix}`
        } catch (error) { log.info(error) }
      }
      return `${config.markdown.prefix}${md.utils.escapeHtml(string)}${config.markdown.suffix}`
    }
  }
  md = require('markdown-it')(config.options)
  // Initialize plugins.
  if (config.plugins && config.plugins.length) {
    config.plugins.forEach(plugin => {
      const type = trueType(plugin)
      if (type === 'string') {
        plugin = require(plugin)
      } else if (type === 'object') {
        plugin = [plugin.name, ...plugin.options]
      } else if (type === 'array' && typeof plugin[0] === 'string') {
        plugin[0] = require(plugin[0])
      }
      md.use(...plugin)
    })
  }
  // Return markdown-it.
  return md
}

/**
 * Test whether a character is whitespace.
 *
 * @param {String} char  The character to test.
 * @return {Boolean}  True if whitespace, False otherwise.
 */
function isWhitespace (char) {
  return [' ', '\t', '\n'].includes(char)
}

/**
 * Check true value of a value.
 *
 * @param {any} value  Any variable.
 * @return {String}  Lowercase string of variable type.
 */
function trueType (value) {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
}

/**
 * Delete attributes from a dom element.
 *
 * @param {String|String[]} el  The dom element.
 * @param {Array} attrs  One or more attributes to remove.
 */
function deleteAttrs (el, attrs) {
  if (typeof attrs === 'string') attrs = [attrs]
  Object.keys(el.attribs).forEach(attr => {
    if (attrs.includes(attr)) delete el.attribs[attr]
  })
}

/**
 * Trim the left, right, or both sides of a String.
 *
 * @param {string} string  String to trim.
 * @param {string} [mode]  Can be 'left', 'right', or 'all'.
 * @param {boolean} preserve  Whether to preserve a single space.
 * @return {string}  Trimmed string.
 */
function trimString (string, mode, preserve) {
  string = string.split(/\s+/g)
  if (preserve) return string.join(' ')
  if (string[0] === '' && (mode === 'left' || mode === 'all')) {
    string = string.slice(1)
  }
  if (string[string.length - 1] === '' && (mode === 'right' || mode === 'all')) {
    string = string.slice(0, -1)
  }
  string = string.join(' ')
  // string = string.slice(string.data[0] === '' ? 1 : 0).join(' ')
  return string
}

/**
 * Check if a node is an inline element.
 *
 * @param {element} node  DOM node to check.
 * @return {boolean}  Whether node is an inline element.
 */
function isInlineElement (node) {
  return inlineElements.includes(node.name)
}

/**
 * Recursive function to trim spaces from all children of a given node.
 *
 * @param {element} node  DOM node.
 * @param {boolean} preserve  Whether to preserve a single space.
 * @param {boolean} trimSiblings  Whether to trim the node's siblings. Typically should be false for
 *     the root node, all child sibling elements will have this set to true.
 */
function trimNode (node, preserve, trimSiblings) {
  // Don't trim a <pre> tag.
  if (node.name === 'pre') return

  // Trim the first and last child.
  if (node.children && node.children.length) {
    // Trim beginning of first child and end of last child.
    const first = node.children[0]
    const last = node.children.length > 1 ? node.children[node.children.length - 1] : null
    if (first && first.data) first.data = trimString(first.data, 'left', preserve)
    if (last && last.data) last.data = trimString(last.data, 'right', preserve)

    // Trim immediate siblings as well, so long as it's not the root parent.
    if (trimSiblings && (node.type === 'tag' || node.type === 'comment')) {
      if (node.prev && node.prev.data) node.prev.data = trimString(node.prev.data, 'right', preserve || isInlineElement(node))
      if (node.next && node.next.data) node.next.data = trimString(node.next.data, 'left', preserve || isInlineElement(node))
    }

    // Recursively trim all children.
    node.children.forEach(child => trimNode(child, preserve, true))
  }
}

/**
 * Make child elements spaceless.
 */
function processSpaceless () {
  this.each((i, el) => {
    const preserve = isInlineElement(el) || ['inline', 'preserve'].includes(el.attribs.spaceless)
    trimNode(el, preserve)
    deleteAttrs(el, 'spaceless')
  })
}

/**
 * Replace a single node with placeholder text.
 *
 * @param {node} el  Element to populate.
 * @param {string} [type='paragraphs']  Type of lorem text. Can be 'paragraphs', 'sentences', or 'words'.
 * @param {number} [arg3.value=5]  Number of paragraphs/sentences/words to populate with.
 */
function processLoremNode (el, type = 'paragraphs', { value = 5, attr, wrap } = {}) {
  // Setup.
  const elAttrs = el.attribs
  const attrs = [type, type[0], `lorem-${type}`]
  const method = `generate${type[0].toUpperCase() + type.slice(1)}`
  if (type === 'paragraphs') attrs.unshift('lorem')
  if (!attr) attr = attrs.find(a => !!elAttrs[a])
  if (attr) value = elAttrs[attr]
  // Determine whether to wrap content.
  if (attrs.wrap) wrap = attrs.wrap
  else if (type === 'paragraphs') wrap = 'p'
  // Update the content.
  let content = lorem[method](parseInt(value, 10))
  if (wrap) content = `<${wrap}>${content.split('\n').join('</p><p>')}</${wrap}>`
  deleteAttrs(el, [...attrs, 'wrap'])
  $(el)[el.name === 'lorem' ? 'replaceWith' : 'html'](content)
}

function processLoremSentences () {
  this.each((i, el) => processLoremNode(el, 'sentences', { value: 3 }))
}

function processLoremWords () {
  this.each((i, el) => processLoremNode(el, 'words', { value: 8 }))
}

function processLoremParagraphs () {
  this.each((i, el) => processLoremNode(el))
}

function processLorem () {
  const types = {
    paragraphs: ['p', 'paragraphs', 'lorem'],
    words: ['w', 'words', 'lorem-words'],
    sentences: ['s', 'sentences', 'lorem-sentences']
  }
  this.each((i, el) => {
    let config = { type: 'paragraphs' }
    Object.keys(types).find(type => {
      return types[type].find(attr => {
        if (el.attribs[attr]) {
          config = { type, attr }
          return true
        }
      })
    })
    processLoremNode(el, config.type, { attr: config.attr })
  })
}

/**
 * Unwrap tag from content.
 */
function processUnwrap () {
  this.each((i, el) => {
    $(el).replaceWith($(el).html())
  })
}

/**
 * Process content inside a selector as markdown.
 */
function processMarkdown () {
  this.each((i, el) => {
    const attrs = el.attribs
    const $el = $(el)
    let content = $el.html()
    const src = attrs.markdown || attrs.src
    // If attr is not a filepath, use 'renderInline' method if either attr is 'true', 'inline', or
    // 'renderInline', or if the first character of the content is whitespace.
    let method = 'render'
    if (src && fs.pathExistsSync(src)) {
      content += '\n' + fs.readFileSync(src, 'utf8')
    } else if (attrs.inline || !isWhitespace(content[0])) {
      method = 'renderInline'
    }
    // We need to remove whitespace at the beginning of lines so markdown parses correctly. So we'll
    // look for the first non-whitespace character on each line and use the one with the least
    // amount of whitespace and indent the rest of the lines relative to that line.
    const startSpace = content.substr(0, content.search(/[^\s//]/) - 1)
    const indents = content.match(/^[ \t]+(?=\S)/gm)
    const indentsLength = indents ? Math.min.apply(Math, indents.map(function (indent) {
      return indent.length
    })) : 0
    // Parse the markdown content.
    content = md[method](content.replace(new RegExp('^[ \\t]{' + indentsLength + '}', 'gm'), ''))
    content = content.split('\n').map((line, i) => {
      if (line !== '') line = (i === 0 ? startSpace : ' '.repeat(indentsLength)) + line
      return line
    }).join('\n')
    // Remove the markdown attribute and add the compiled markdown to the html.
    deleteAttrs(el, ['markdown', 'src', 'inline'])
    $el[el.name === 'md' || el.name === 'markdown' ? 'replaceWith' : 'html'](content)
  })
}

/*
* Initialize components and cache templates. This allows user to create local
* components in one of three ways:
*
* 1. <my-component></my-component>
* 2. <component is="my-component"></component>
* 3. <component is="src/components/my-component/my-component.ejs"></component>
*
* --- FEATURES ---
*
* EJS:
* A component is a simple EJS file, so all EJS features are included.
*
* ATTRIBUTES AS DATA:
* Attributes are parsed and normalized and passed as data to the EJS component.
* For example,
* <component num="10" bool="false" disabled my-obj='{"one": 1}' arr="[1, 2]" />
* is normalized and passed as:
* { num: 10, bool: false, disabled: true, my-obj: { one: 1 }, arr: [1, 2] }.
*
* SLOTTED TEMPLATES:
* A component that has a <slot name="content">...</slot> allows user to extend
* components with custom content. When you create a component instance (see
* above), children elements that have [slot] attributes are inserted into the
* corresponding <slot/> of the component's instance. Any number of <slot/>
* elements can be inserted in a component, just be sure they each have a
* different [name] attribute.
*/
function initComponents (config) {
  // Cache components in config.paths.
  if (!(config.paths instanceof Array)) config.paths = [config.paths]
  if (config.paths && config.paths.length) {
    config.paths.forEach(p => {
      fs.readdirSync(p).forEach(slug => {
        const dir = path.join(p, slug)
        if (!fs.statSync(dir).isDirectory()) return
        const template = fs.pathExistsSync(path.join(dir, 'index.ejs'))
          ? fs.readFileSync(path.join(dir, 'index.ejs'), 'utf8')
          : fs.pathExistsSync(path.join(dir, `${slug}.ejs`))
            ? fs.readFileSync(path.join(dir, `${slug}.ejs`), 'utf8')
            : null
        if (!template) return
        _.components[slug] = template
      })
    })
  }

  // Cache components in config.map.
  if (config.map && Object.keys(config.map).length) {
    Object.keys(config.map).forEach(tag => {
      _.components[tag] = fs.readFileSync(config.map[tag], 'utf8')
    })
  }
}

/*
* Process components.
*/
function processComponent (config, data) {
  this.each((i, el) => {
    const attrs = Object.assign({}, el.attribs)
    const $el = $(el)
    // Convert attributes to their correct type, and dash-case to camelCase.
    Object.keys(attrs).forEach(key => {
      // Boolean types.
      if (attrs[key] === 'true' || attrs[key] === '') attrs[key] = true
      else if (attrs[key] === 'false') attrs[key] = false
      // Object/Array types.
      else if (
        (attrs[key][0] === '[' && attrs[key][attrs[key].length - 1] === ']') ||
        (attrs[key][0] === '{' && attrs[key][attrs[key].length - 1] === '}')
      ) attrs[key] = JSON.parse(attrs[key])
      // Number types.
      else if (!isNaN(+attrs[key])) attrs[key] = +attrs[key]
      // Convert dash-case to camelCase.
      if (key.indexOf('-') > -1) {
        attrs[key.replace(/-([a-z])/g, (m, w) => w.toUpperCase())] = attrs[key]
        delete attrs[key]
      }
    })
    // Get template source.
    let template
    if ($el.is(config.selector)) {
      if (!attrs.is) {
        console.warn('No [is] attribute on <component/>. Skipped.')
        return
      }
      template = _.components[attrs.is]
      if (!template && fs.pathExistsSync(attrs.is)) template = fs.readFileSync(attrs.is, 'utf8')
    } else {
      template = _.components[el.name]
    }
    if (!template) {
      console.warn(`Component not found for <${el.name}${attrs.is ? ` is="${attrs.is}" ` : ''}/>. Skipped.`)
      return
    }
    // Cache slotted children and render initial template content.
    const $children = $el.children()
    $el.prepend(ejs.render(template, Object.assign({}, data, attrs), config.ejs))
    if (config.unwrap && attrs.class) {
      $el.children().first().addClass(attrs.class)
    }
    // Render slotted content.
    $children.each((i, $child) => {
      if (!$child.attribs.slot) return
      const $slot = $el.find(`slot[name=${$child.attribs.slot}]`)
      if (!$slot.length) return
      $slot.first().replaceWith($child)
    })
    // Unwrap it.
    if (config.unwrap) $el.replaceWith($el.html())
  })
}
