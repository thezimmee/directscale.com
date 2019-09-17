/* globals HTMLElement */

import debounce from '../debounce/index.js'
import { deserialize } from '../attrs/index.js'

Slider.prototype = {
  defaults: {
    // Options:
    autoplay: 6000,
    start: 0,
    infinite: true,
    vertical: false,
    dots: true,
    nextHtml: '<svg viewBox="0 0 24 24"><path d="M7.41 8.58L12 13.17l4.59-4.59L18 10l-6 6-6-6 1.41-1.42z"/></svg>',
    previousHtml: '<svg viewBox="0 0 24 24"><path d="M7.41 8.58L12 13.17l4.59-4.59L18 10l-6 6-6-6 1.41-1.42z"/></svg>',
    // Classes:
    rootClass: 'slider',
    verticalClass: 'slider--vertical',
    stageClass: 'slider__stage',
    sliderClass: 'slider__slides',
    slideClass: 'slider__slide',
    previousClass: 'slider__previous',
    nextClass: 'slider__next',
    dotsClass: 'slider__dots',
    dotClass: 'slider__dot',
    playToggleClass: 'play-toggle',
    playingClass: 'play-toggle--playing',
    activeSlideClass: 'slider__slide--is-active',
    activeDotClass: 'slider__dot--is-active'
  },
  buildDom: function (element) {
    var slider = this
    slider.dom = {}

    // Assign root element.
    slider.dom.slider = element instanceof HTMLElement ? element : document.querySelector(element)
    element = slider.dom.slider
    slider.options = Object.assign(slider.options, deserialize(Object.assign({}, element.dataset)))
    element.classList.add(slider.options.rootClass)

    // Check for existing dom elements (if not found, they will be created later).
    slider.dom.slider = element.querySelector('.' + slider.options.sliderClass)
    slider.dom.slides = (slider.dom.slider || element).children
    slider.dom.stage = element.querySelector('.' + slider.options.stageClass)
    slider.dom.next = element.querySelector('.' + slider.options.nextClass)
    slider.dom.previous = element.querySelector('.' + slider.options.previousClass)
    slider.dom.dots = element.querySelector('.' + slider.options.dotsClass)

    // Create dom.slider element.
    if (!slider.dom.slider) {
      slider.dom.slider = document.createElement('div')
      slider.dom.slider.classList.add(slider.options.sliderClass)
    }

    // Ensure slides are inside of dom.slider.
    const appendToSlider = slider.dom.slider.children.length
    Array.from(slider.dom.slides).forEach(function (slide) {
      slide.classList.add(slider.options.slideClass)
      if (appendToSlider) slider.dom.slider.appendChild(slide)
    })

    // Create stage, which is useful for styling.
    if (!slider.dom.stage) {
      slider.dom.stage = document.createElement('div')
      slider.dom.stage.classList.add(slider.options.stageClass)
      element.appendChild(slider.dom.stage)
    }

    // Append slides inside of the stage.
    if (!slider.dom.stage.querySelector('.' + slider.options.sliderClass)) {
      slider.dom.stage.appendChild(slider.dom.slider)
    }

    // Check if it's vertical.
    if (slider.options.vertical) {
      element.classList.add(slider.options.verticalClass)
    }

    // Add previous control.
    if (!slider.dom.previous) {
      slider.dom.previous = document.createElement('a')
      slider.dom.previous.classList.add(slider.options.previousClass)
      slider.dom.previous.innerHTML = slider.options.previousHtml
      element.appendChild(slider.dom.previous)
    }

    // Add next control.
    if (!slider.dom.next) {
      slider.dom.next = document.createElement('a')
      slider.dom.next.classList.add(slider.options.nextClass)
      slider.dom.next.innerHTML = slider.options.nextHtml
      element.appendChild(slider.dom.next)
    }

    // Add dot controls.
    if (slider.options.dots && !slider.options.vertical) {
      if (!slider.dom.dots) {
        slider.dom.dots = document.createElement('div')
        slider.dom.dots.classList.add(slider.options.dotsClass)
        element.appendChild(slider.dom.dots)
      }
      if (!slider.dom.dots.children.length) {
        Array.from(slider.dom.slides).forEach(function (slide, i) {
          var dot = document.createElement('a')
          dot.classList.add(slider.options.dotClass)
          dot.dataset.sliderSlide = i
          dot.addEventListener('click', function (event) {
            return slider.goTo(i)
          })
          slider.dom.dots.appendChild(dot)
        })
      }
    }
  },
  refresh: function () {
    var slider = this
    var maxSlide
    slider.max.index = slider.dom.slides.length - 1
    maxSlide = slider.dom.slides[slider.max.index]
    slider.max.offset = maxSlide[slider.offsetProp] + maxSlide[slider.sizeProp] - slider.dom.stage[slider.sizeProp]
    Array.from(slider.dom.slides).forEach(function (slide) {
      slide.dataset.sliderOffset = slide[slider.offsetProp] + slider.offset
    })
    slider.goTo(slider.index)
  },
  goTo: function (slide) {
    var slider = this

    // Convert slide to the slide's index number.
    if (slide === undefined || slide === 'next') {
      slide = slider._nextSlide()
    } else if (slide === 'previous' || slide === 'prev') {
      slide = slider._previousSlide()
    }

    // Deactivate current slide.
    slider.dom.slides[slider.index].classList.remove(slider.options.activeSlideClass)
    if (slider.options.dots && slider.dom.dots) slider.dom.dots.children[slider.index].classList.remove(slider.options.activeDotClass)

    // Activate new slide.
    slider.dom.slides[slide].classList.add(slider.options.activeSlideClass)
    if (slider.options.dots && slider.dom.dots) slider.dom.dots.children[slide].classList.add(slider.options.activeDotClass)

    // Set offset. Cap it to the size of all slides minus the size of the stage.
    slider.offset = parseInt(slider.dom.slides[slide].dataset.sliderOffset, 10)
    if (!slider.options.infinite && slider.offset >= slider.max.offset) {
      if (!slider.max.maxed) slider.index = slide
      slider.max.maxed = true
      slider.offset = slider.max.offset
    } else {
      slider.max.maxed = false
      slider.index = slide
    }

    // Disable next/previous as needed.
    if (!slider.options.infinite) {
      if (slider.index === slider.dom.slides.length - 1 || slider.max.maxed) {
        slider.dom.next.setAttribute('disabled', true)
      } else {
        slider.dom.next.removeAttribute('disabled')
      }
      if (slider.index === 0) {
        slider.dom.previous.setAttribute('disabled', true)
      } else {
        slider.dom.previous.removeAttribute('disabled')
      }
    }

    // Update the stage's margin.
    slider.dom.slider.style[slider.options.vertical ? 'marginTop' : 'marginLeft'] = '-' + slider.offset + 'px'

    // Reset timer.
    if (slider.timer) {
      slider.pause()
      slider.play()
    }
  },
  play: function () {
    var slider = this
    if (slider.timer || typeof slider.options.autoplay !== 'number') return
    slider.timer = setInterval(function () {
      slider.goTo()
    }, slider.options.autoplay)
  },
  pause: function () {
    var slider = this
    clearInterval(slider.timer)
    slider.timer = null
  },
  init: function (element) {
    var slider = this
    // Build the dom.
    slider.buildDom(element)
    // Add events.
    slider._addListeners()
    // Refresh the offsets.
    slider.refresh()
    // Kick it off.
    slider.goTo(slider.options.start)
    if (slider.options.autoplay) slider.play()
  },
  destroy: function () {
    this._removeListeners()
  },
  _previousSlide: function () {
    return this.index <= 0
      ? (this.options.infinite ? this.dom.slides.length - 1 : 0)
      : this.index - 1
  },
  _nextSlide: function () {
    return this.index >= this.max.index
      ? (this.options.infinite ? 0 : this.max.index)
      : this.index + 1
  },
  _addListeners: function () {
    var slider = this
    // Previous control click.
    slider._addEvent('previous', 'click', function (event) {
      if (slider.dom.previous.hasAttribute('disabled')) return
      return slider.goTo('previous')
    })
    // Next control click.
    slider._addEvent('next', 'click', function (event) {
      if (slider.dom.next.hasAttribute('disabled')) return
      return slider.goTo('next')
    })
    // Add autoplay events.
    slider._addEvent('slider', 'mouseenter', function () {
      slider.pause()
    })
    slider._addEvent('slider', 'mouseleave', function () {
      slider.play()
    })
    // Add window resize.
    slider._events['window.resize'] = debounce(function () {
      slider.refresh()
    }, 100)
    window.addEventListener('resize', slider._events['window.resize'])
  },
  _removeListeners: function () {
    var slider = this
    // Remove window resize.
    window.removeEventListener('resize', slider._events['window.resize'])
    delete slider._events['window.resize']
    // Remove other cached events.
    Object.keys(slider._events).forEach(function (id) {
      var key = id.split('.')
      slider.dom[key[0]].removeEventListener(key[1], slider._events[id])
      delete slider._events[id]
    })
  },
  _addEvent: function (name, event, fn) {
    var slider = this
    var id = [name, event].join('.')
    if (!slider._events[id]) slider._events[id] = fn
    slider.dom[name].addEventListener(event, fn)
  },
  _removeEvent: function (name, event) {
    var slider = this
    var id = [name, event].join('.')
    if (slider._events[id]) {
      slider.dom[name].removeEventListener(event, slider._events[id])
      delete slider._events[id]
    }
  }
}

/**
 * Slider constructor.
 */
function Slider (element, options) {
  // Set options.
  this.options = Object.assign({}, this.defaults, options || {})
  if (typeof this.options.autoplay !== 'number') this.options.autoplay = false

  // Set up initial state.
  this.index = 0
  this.offset = 0
  this.timer = null
  this.offsetProp = 'offsetLeft'
  this.sizeProp = 'offsetWidth'
  if (this.options.vertical) {
    this.offsetProp = 'offsetTop'
    this.sizeProp = 'offsetHeight'
  }
  this.max = {
    index: 0,
    slide: null,
    offset: 0,
    maxed: false
  }
  this._events = {}

  // Initialize this slider.
  this.init(element)
}

export default Slider
