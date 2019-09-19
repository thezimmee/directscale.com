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
        copyAttrs: ['class', 'id'],
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
    initComponents(config, bundle)
  }

  //
  // Iterate through changed files.
  //
  bundle.changed.forEach(file => {
    // // Create the dom and plugins.
    // $ = cheerio.load(file.content, config.cheerio)
    // $.prototype.spaceless = processSpaceless
    // $.prototype.lorem = processLorem
    // $.prototype.loremParagraphs = processLoremParagraphs
    // $.prototype.loremWords = processLoremWords
    // $.prototype.loremSentences = processLoremSentences
    // $.prototype.unwrap = processUnwrap
    // $.prototype.markdown = processMarkdown

    // // Process components.
    // if (config.components) {
    //   if (config.components.selector) {
    //     $(config.components.selector).component(config, bundle)
    //   }
    //   if (Object.keys(_.components).length) {
    //     Object.keys(_.components).forEach(tag => {
    //       $(tag).component(config, bundle)
    //     })
    //   }
    // }

    // // Process built-in transforms.
    // if (config.markdown) $(config.markdown.selector).markdown()
    // if (config.lorem) {
    //   if (config.lorem.auto) $(config.lorem.auto).lorem()
    //   if (config.lorem.paragraphs) $(config.lorem.paragraphs).loremParagraphs()
    //   if (config.lorem.sentences) $(config.lorem.sentences).loremSentences()
    //   if (config.lorem.words) $(config.lorem.words).loremWords()
    // }
    // if (config.spaceless) $(config.spaceless).spaceless()
    // if (config.unwrap) $(config.unwrap).unwrap()

    // // Process custom transforms.
    // if (config.custom && config.custom.length) {
    //   config.custom.forEach(transform => {
    //     if (typeof transform === 'function') transform($)
    //   })
    // }

    // // Update file.content and return
    // file.content = $.html()
    // if (config.minify) {
    //   const minify = require('html-minifier').minify
    //   file.content = minify(file.content, config.minifier)
    // }
    file.content = parseHTML(file.content, { config, bundle })
    return file
  })

  return bundle
}

function parseHTML (html, { config = {}, bundle = {} } = {}) {
  // Create the dom and plugins.
  const $ = cheerio.load(html, config.cheerio)

  // Process components.
  if (config.components) {
    $.prototype.component = processComponent
    if (config.components.selector) {
      $(config.components.selector).component($, config, bundle)
    }
    if (Object.keys(_.components).length) {
      Object.keys(_.components).forEach(tag => {
        $(tag).component($, config, bundle)
      })
    }
  }

  // Process built-in transforms.
  if (config.markdown) {
    $.prototype.markdown = processMarkdown
    $(config.markdown.selector).markdown($)
  }
  if (config.lorem) {
    if (config.lorem.auto) {
      $.prototype.lorem = processLorem
      $(config.lorem.auto).lorem($)
    }
    if (config.lorem.paragraphs) {
      $.prototype.loremParagraphs = processLoremParagraphs
      $(config.lorem.paragraphs).loremParagraphs($)
    }
    if (config.lorem.sentences) {
      $.prototype.loremSentences = processLoremSentences
      $(config.lorem.sentences).loremSentences($)
    }
    if (config.lorem.words) {
      $.prototype.loremWords = processLoremWords
      $(config.lorem.words).loremWords($)
    }
  }
  if (config.spaceless) {
    $.prototype.spaceless = processSpaceless
    $(config.spaceless).spaceless($)
  }
  if (config.unwrap) {
    $.prototype.unwrap = processUnwrap
    $(config.unwrap).unwrap($)
  }

  // Process custom transforms.
  if (config.custom && config.custom.length) {
    config.custom.forEach(transform => {
      if (typeof transform === 'function') transform($)
    })
  }

  // Update html and return
  html = $.html()
  if (config.minify) {
    const minify = require('html-minifier').minify
    html = minify(html, config.minifier)
  }
  return html
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
function processSpaceless ($) {
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
function processLoremNode ($, el, type = 'paragraphs', { value = 5, attr, wrap } = {}) {
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

function processLoremSentences ($) {
  this.each((i, el) => processLoremNode($, el, 'sentences', { value: 3 }))
}

function processLoremWords ($) {
  this.each((i, el) => processLoremNode($, el, 'words', { value: 8 }))
}

function processLoremParagraphs ($) {
  this.each((i, el) => processLoremNode($, el))
}

function processLorem ($) {
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
    processLoremNode($, el, config.type, { attr: config.attr })
  })
}

/**
 * Unwrap tag from content.
 */
function processUnwrap ($) {
  this.each((i, el) => {
    $(el).replaceWith($(el).html())
  })
}

/**
 * Process content inside a selector as markdown.
 */
function processMarkdown ($) {
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
function initComponents (config, bundle) {
  // Cache components in config.paths.
  if (!(config.components.paths instanceof Array)) config.components.paths = [config.components.paths]
  if (config.components.paths && config.components.paths.length) {
    config.components.paths.forEach(dir => readComponentsInDirectory(dir, bundle))
  }

  // Cache components in config.map.
  if (config.components.map && Object.keys(config.components.map).length) {
    Object.keys(config.components.map).forEach(tag => {
      _.components[tag] = fs.readFileSync(config.components.map[tag], 'utf8')
      addFileToWatcher(config.components.map[tag], bundle)
    })
  }
}

/**
* Recursively read components in a directory.
*/
function readComponentsInDirectory (dir, bundle, parent) {
  fs.readdirSync(dir).forEach(slug => {
    const dirPath = path.join(dir, slug)
    if (!fs.statSync(dirPath).isDirectory()) return
    const srcPath = fs.pathExistsSync(path.join(dirPath, 'index.ejs'))
      ? path.join(dirPath, 'index.ejs')
      : fs.pathExistsSync(path.join(dirPath, `${slug}.ejs`))
        ? path.join(dirPath, `${slug}.ejs`)
        : null
    if (srcPath) {
      _.components[(parent ? parent + '-' : '') + slug] = fs.readFileSync(srcPath, 'utf8')
      addFileToWatcher(srcPath, bundle)
    }
    readComponentsInDirectory(dirPath, bundle, slug)
  })
}

/*
* Add filepath to bundle watcher.
*/
function addFileToWatcher (filepath, bundle) {
  if (!bundle.options.watchFiles.includes(filepath)) {
    bundle.options.watchFiles.push(filepath)
  }
}

/*
* Process components.
*/
function processComponent ($, config, bundle) {
  this.each((i, el) => {
    const $el = $(el)
    const data = Object.assign({}, $el.data())
    // Convert attributes to their correct type, and dash-case to camelCase.
    Object.keys(data).forEach(key => {
      // Boolean types.
      if (data[key] === 'true' || data[key] === '') data[key] = true
      else if (data[key] === 'false') data[key] = false
      // Object/Array types.
      else if (
        (data[key][0] === '[' && data[key][data[key].length - 1] === ']') ||
        (data[key][0] === '{' && data[key][data[key].length - 1] === '}')
      ) data[key] = JSON.parse(data[key])
      // Number types.
      else if (!isNaN(+data[key])) data[key] = +data[key]
      // Convert dash-case to camelCase.
      if (key.indexOf('-') > -1) {
        data[key.replace(/-([a-z])/g, (m, w) => w.toUpperCase())] = data[key]
        delete data[key]
      }
    })

    // Get template source.
    let template
    if ($el.is(config.components.selector)) {
      if (!el.attribs.is) {
        console.warn('No [is] attribute on <component/>. Skipped.')
        return
      }
      template = _.components[el.attribs.is]
      if (!template && fs.pathExistsSync(el.attribs.is)) template = fs.readFileSync(el.attribs.is, 'utf8')
    } else {
      template = _.components[el.name]
    }
    if (!template) {
      console.warn(`Component not found for <${el.name}${el.attribs.is ? ` is="${el.attribs.is}" ` : ''}/>. Skipped.`)
      return
    }

    // Cache slotted children and render initial template content.
    template = parseHTML(ejs.render(template, Object.assign({}, bundle.data, data), config.components.ejs), { config, bundle })
    const $children = $el.children()
    $el.prepend(template)

    // Render slotted content.
    const defaultSlot = $el.find('slot:not([name])')
    $children.each((i, child) => {
      // If child has no named slot...
      if (!child.attribs.slot) {
        // If default slot doesn't exist, do nothing (remove content).
        if (!defaultSlot.length) {
          console.warn(`<${el.name}/> has no default <slot/>. Some content was removed.`)
          $(child).remove()
          return
        }
        // Otherwise append to defualt slot.
        defaultSlot.first().append(child)
      // If child has a named slot, use the named slot...
      } else {
        const slot = $el.find(`slot[name="${child.attribs.slot}"]`)
        // If named slot wasn't found, do nothing (remove child content).
        if (!slot.length) {
          console.warn(`<slot name="${child.attribs.slot}" /> not found in <${el.name} />. Some content was removed.`)
          $(child).remove()
          return
        }
        // Replace the existing slot with corresponding child content.
        slot.first().replaceWith(child)
      }
    })
    defaultSlot.first().replaceWith(defaultSlot.first().html())

    // Unwrap each remaining <slot />.
    $el.find('slot').each((i, slot) => {
      const $slot = $(slot)
      $slot.replaceWith($slot.html())
    })

    // Unwrap it.
    if (config.components.unwrap) {
      // Copy attributes down to first child.
      if (Object.keys(el.attribs).length) {
        Object.keys(el.attribs).forEach(attr => {
          const existingAttr = $el.children().first().attr(attr)
          $el.children().first().attr(attr, existingAttr ? [existingAttr, el.attribs[attr]].join(' ') : el.attribs[attr])
        })
      }
      $el.replaceWith($el.html())
    }
  })
}
