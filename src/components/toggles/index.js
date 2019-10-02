/* globals HTMLElement */
import getSiblings from '../get-siblings/index.js'

const groups = {}
let id = 0

Toggles.prototype.toggle = function (event) {
  this[this.active ? 'close' : 'open'](event)
}

Toggles.prototype.open = function (event) {
  // Don't do anything if it's already active or disabled.
  if (this.active || this.disabled) return
  // Disable to prevent anything while animating.
  this.disabled = true
  // Update active toggle if it's in a group.
  if (this.group && this.group.active && this.group.active !== this) {
    this.group.active.close()
    this.group.active = this
  }
  // Add animate in class.
  this.dom.toggle.classList.add(this.config.animateInClass)
  this.dom.content.classList.add(this.config.animateInClass)
  // Activate.
  setTimeout(() => {
    this.dom.toggle.classList.add(this.config.activeClass)
    this.dom.content.classList.add(this.config.activeClass)
    this.active = true
  }, 20)
  // Remove animate in class.
  setTimeout(() => {
    this.dom.toggle.classList.remove(this.config.animateInClass)
    this.dom.content.classList.remove(this.config.animateInClass)
    this.disabled = false
  }, this.config.animation + 20)
}

Toggles.prototype.close = function (event) {
  // Don't do anything if it's already inactive or disabled.
  if (this.disabled || !this.active || (this.group && event && event.target === this.dom.toggle)) return
  // Disable to prevent anything while animating.
  this.disabled = true
  // Add animate out class.
  this.dom.toggle.classList.add(this.config.animateOutClass)
  this.dom.content.classList.add(this.config.animateOutClass)
  // Inactivate.
  setTimeout(() => {
    this.dom.toggle.classList.remove(this.config.activeClass)
    this.dom.content.classList.remove(this.config.activeClass)
    this.active = false
    if (this.group && this.group.active === this) this.group.active = null
  }, 20)
  // Remove animate out class.
  setTimeout(() => {
    this.dom.toggle.classList.remove(this.config.animateOutClass)
    this.dom.content.classList.remove(this.config.animateOutClass)
    this.disabled = false
  }, this.config.animation + 20)
}

function Toggles (element, config = {}) {
  // Create config.
  this.config = Object.assign({
    animation: 400,
    toggleClass: 'toggle',
    contentClass: 'toggle__content',
    groupClass: 'toggle--grouped',
    activeClass: 'toggle--is-active',
    animateInClass: 'toggle--in',
    animateOutClass: 'toggle--out'
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
  this.dom.closeButtons = this.id ? document.querySelectorAll(`[data-toggle-close="${this.id}"]`) : []
  this.dom.openButtons = this.id ? document.querySelectorAll(`[data-toggle-open="${this.id}"]`) : []

  // Set active toggle in group.
  this.active = Boolean(this.dom.toggle.dataset.active)

  // Get animation duration from content element.
  if (typeof this.config.animation !== 'number') this.config.animation = 0
  if (this.dom.content.dataset.toggleAnimation) {
    this.config.animation = parseInt(this.dom.content.dataset.toggleAnimation, 10)
  }

  // Set disabled state to prevent clicking during animation.
  this.disabled = false

  // Check if this is part of a tab/accordion group.
  this.group = this.dom.toggle.parentElement.dataset.toggleGroup
  if (!this.group && getSiblings(this.dom.toggle, '[data-toggle]').length) {
    this.group = this.dom.toggle.parentElement.dataset.toggleGroup = (id++).toString()
  }
  if (this.group) {
    this.dom.toggle.classList.add(this.config.groupClass)
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

  // Add event listeners.
  this.dom.toggle.addEventListener('click', this.toggle.bind(this))
  if (this.dom.closeButtons && this.dom.closeButtons.length) {
    this.dom.closeButtons.forEach(button => button.addEventListener('click', this.close.bind(this)))
  }
  if (this.dom.openButtons && this.dom.openButtons.length) {
    this.dom.openButtons.forEach(button => button.addEventListener('click', this.open.bind(this)))
  }
}

Toggles.init = function (selector = '[data-toggle]', config = {}) {
  document.querySelectorAll(selector).forEach((el) => new Toggles(el, config))
}

export default Toggles
