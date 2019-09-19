/* globals HTMLElement */

const groups = {}
let id = 0

Toggles.prototype.toggle = function (event) {
  this[this.active ? 'close' : 'open'](event)
}

Toggles.prototype.open = function (event) {
  if (this.active) return
  if (this.group && this.group.active && this.group.active !== this) {
    this.group.active.close()
    this.group.active = this
  }
  this.dom.toggle.classList.add(this.config.activeClass)
  this.dom.content.classList.add(this.config.activeContentClass)
  this.active = true
}

Toggles.prototype.close = function (event) {
  if (!this.active || (this.group && event && event.target === this.dom.toggle)) return
  this.dom.toggle.classList.remove(this.config.activeClass)
  this.dom.content.classList.remove(this.config.activeContentClass)
  this.active = false
  if (this.group && this.group.active === this) this.group.active = null
}

function Toggles (element, config = {}) {
  // Create config.
  this.config = Object.assign({
    toggleClass: 'toggle',
    activeClass: 'toggle--is-active',
    contentClass: 'toggle__content',
    activeContentClass: 'toggle__content--is-active'
  }, config || {})

  // Create initial DOM and state.
  this.dom = {}
  this.dom.toggle = element instanceof HTMLElement ? element : document.querySelector(element)
  this.dom.toggle.classList.add(this.config.toggleClass)
  this.id = this.dom.toggle.dataset.toggle
  this.group = null
  // If [data-toggle] does not exist, use sibling as content.
  this.dom.content = this.id ? document.querySelector(`[data-toggle-content="${this.id}"]`) : this.dom.toggle.nextElementSibling
  this.dom.content.classList.add(this.config.contentClass)

  // Set active toggle in group.
  this.active = Boolean(this.dom.toggle.dataset.active)

  // Check if this is part of a tab/accordion group.
  this.group = this.dom.toggle.parentElement.dataset.toggleGroup
  if (!this.group && this.dom.toggle.parentElement.querySelectorAll(`[data-toggle], ${this.config.toggleClass}`).length > 1) {
    this.group = this.dom.toggle.parentElement.dataset.toggleGroup = (id++).toString()
  }
  if (this.group) {
    this.group = groups[this.group] = groups[this.group] || {
      active: null,
      toggles: []
    }
    this.group.toggles.push(this)
    if (this.active) this.group.active = this
    if (!this.group.active) {
      this.group.active = this.group.toggles[0]
      if (!this.group.active.active) this.group.active.open()
    }
  }

  // Hide content if not active.
  this[this.active ? 'open' : 'close']()

  // Add event listener.
  this.dom.toggle.addEventListener('click', this.toggle.bind(this))
}

Toggles.init = function (selector = '[data-toggle]') {
  document.querySelectorAll(selector).forEach((el) => new Toggles(el))
}

export default Toggles
