/*! DirectScale.com.js | @author DirectScale | @reference https://directscale.com */

(function () {
  'use strict';

  class OffCanvasNav {
    constructor(options) {
      this.options = Object.assign({
        toggleSelector: '.hamburger',
        pageSelector: '.page',
        activeClass: 'off-canvas--is-open'
      }, options || {});
      this.dom = {
        toggle: document.querySelector(this.options.toggleSelector),
        page: document.querySelector(this.options.pageSelector)
      };
      this.dom.toggle.addEventListener('click', this.toggle.bind(this));
    }

    toggle() {
      this.dom.page.classList.toggle(this.options.activeClass);
    }

    open() {
      this.dom.page.classList.add(this.options.activeClass);
    }

    close() {
      this.dom.page.classList.remove(this.options.activeClass);
    }

    destroy() {
      this.toggle.removeEventListener('click', this.toggle);
    }

  }

  /* eslint-disable-next-line */

  var app = {
    nav: new OffCanvasNav()
  };

}());
//# sourceMappingURL=app.js.map
