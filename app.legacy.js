/*! DirectScale.com.js | @author DirectScale | @reference https://directscale.com */

(function () {
  'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  var OffCanvasNav =
  /*#__PURE__*/
  function () {
    function OffCanvasNav(options) {
      _classCallCheck(this, OffCanvasNav);

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

    _createClass(OffCanvasNav, [{
      key: "toggle",
      value: function toggle() {
        this.dom.page.classList.toggle(this.options.activeClass);
      }
    }, {
      key: "open",
      value: function open() {
        this.dom.page.classList.add(this.options.activeClass);
      }
    }, {
      key: "close",
      value: function close() {
        this.dom.page.classList.remove(this.options.activeClass);
      }
    }, {
      key: "destroy",
      value: function destroy() {
        this.toggle.removeEventListener('click', this.toggle);
      }
    }]);

    return OffCanvasNav;
  }();

  /* eslint-disable-next-line */

  var app = {
    nav: new OffCanvasNav()
  };

}());
//# sourceMappingURL=app.legacy.js.map
