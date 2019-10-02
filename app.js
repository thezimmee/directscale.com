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

  var getSiblings = ((el, selector) => {
    return Array.prototype.filter.call(el.parentNode.children, sibling => {
      return sibling !== el && (!selector || sibling.matches(selector));
    });
  });

  /* globals HTMLElement */
  var groups = {};
  var id = 0;

  Toggles.prototype.toggle = function (event) {
    this[this.active ? 'close' : 'open'](event);
  };

  Toggles.prototype.open = function (event) {
    // Don't do anything if it's already active or disabled.
    if (this.active || this.disabled) return; // Disable to prevent anything while animating.

    this.disabled = true; // Update active toggle if it's in a group.

    if (this.group && this.group.active && this.group.active !== this) {
      this.group.active.close();
      this.group.active = this;
    } // Add animate in class.


    this.dom.toggle.classList.add(this.config.animateInClass);
    this.dom.content.classList.add(this.config.animateInClass); // Activate.

    setTimeout(() => {
      this.dom.toggle.classList.add(this.config.activeClass);
      this.dom.content.classList.add(this.config.activeClass);
      this.active = true;
    }, 20); // Remove animate in class.

    setTimeout(() => {
      this.dom.toggle.classList.remove(this.config.animateInClass);
      this.dom.content.classList.remove(this.config.animateInClass);
      this.disabled = false;
    }, this.config.animation + 20);
  };

  Toggles.prototype.close = function (event) {
    // Don't do anything if it's already inactive or disabled.
    if (this.disabled || !this.active || this.group && event && event.target === this.dom.toggle) return; // Disable to prevent anything while animating.

    this.disabled = true; // Add animate out class.

    this.dom.toggle.classList.add(this.config.animateOutClass);
    this.dom.content.classList.add(this.config.animateOutClass); // Inactivate.

    setTimeout(() => {
      this.dom.toggle.classList.remove(this.config.activeClass);
      this.dom.content.classList.remove(this.config.activeClass);
      this.active = false;
      if (this.group && this.group.active === this) this.group.active = null;
    }, 20); // Remove animate out class.

    setTimeout(() => {
      this.dom.toggle.classList.remove(this.config.animateOutClass);
      this.dom.content.classList.remove(this.config.animateOutClass);
      this.disabled = false;
    }, this.config.animation + 20);
  };

  function Toggles(element) {
    var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    // Create config.
    this.config = Object.assign({
      animation: 400,
      toggleClass: 'toggle',
      contentClass: 'toggle__content',
      groupClass: 'toggle--grouped',
      activeClass: 'toggle--is-active',
      animateInClass: 'toggle--in',
      animateOutClass: 'toggle--out'
    }, config || {}); // Create initial DOM and state.

    this.dom = {};
    this.dom.toggle = element instanceof HTMLElement ? element : document.querySelector(element);
    this.dom.toggle.classList.add(this.config.toggleClass);
    this.id = this.dom.toggle.dataset.toggle;
    this.group = null; // If [data-toggle] does not exist, use sibling as content.

    this.dom.content = this.id ? document.querySelector("[data-toggle-content=\"".concat(this.id, "\"]")) : this.dom.toggle.nextElementSibling;
    this.dom.content.classList.add(this.config.contentClass);
    this.dom.closeButtons = this.id ? document.querySelectorAll("[data-toggle-close=\"".concat(this.id, "\"]")) : [];
    this.dom.openButtons = this.id ? document.querySelectorAll("[data-toggle-open=\"".concat(this.id, "\"]")) : []; // Set active toggle in group.

    this.active = Boolean(this.dom.toggle.dataset.active); // Get animation duration from content element.

    if (typeof this.config.animation !== 'number') this.config.animation = 0;

    if (this.dom.content.dataset.toggleAnimation) {
      this.config.animation = parseInt(this.dom.content.dataset.toggleAnimation, 10);
    } // Set disabled state to prevent clicking during animation.


    this.disabled = false; // Check if this is part of a tab/accordion group.

    this.group = this.dom.toggle.parentElement.dataset.toggleGroup;

    if (!this.group && getSiblings(this.dom.toggle, '[data-toggle]').length) {
      this.group = this.dom.toggle.parentElement.dataset.toggleGroup = (id++).toString();
    }

    if (this.group) {
      this.dom.toggle.classList.add(this.config.groupClass);
      this.group = groups[this.group] = groups[this.group] || {
        active: null,
        toggles: []
      };
      this.group.toggles.push(this);
      if (this.active) this.group.active = this;

      if (!this.group.active) {
        this.group.active = this.group.toggles[0];
        if (!this.group.active.active) this.group.active.open();
      }
    } // Hide content if not active.


    this[this.active ? 'open' : 'close'](); // Add event listeners.

    this.dom.toggle.addEventListener('click', this.toggle.bind(this));

    if (this.dom.closeButtons && this.dom.closeButtons.length) {
      this.dom.closeButtons.forEach(button => button.addEventListener('click', this.close.bind(this)));
    }

    if (this.dom.openButtons && this.dom.openButtons.length) {
      this.dom.openButtons.forEach(button => button.addEventListener('click', this.open.bind(this)));
    }
  }

  Toggles.init = function () {
    var selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '[data-toggle]';
    var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    document.querySelectorAll(selector).forEach(el => new Toggles(el, config));
  };

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var bouncer = createCommonjsModule(function (module, exports) {
    /*!
     * formbouncerjs v1.4.6
     * A lightweight form validation script that augments native HTML5 form validation elements and attributes.
     * (c) 2019 Chris Ferdinandi
     * MIT License
     * http://github.com/cferdinandi/bouncer
     */
    (function (root, factory) {
      {
        module.exports = factory(root);
      }
    })(typeof commonjsGlobal !== 'undefined' ? commonjsGlobal : typeof window !== 'undefined' ? window : commonjsGlobal, function (window) {
      // Variables
      //

      var defaults = {
        // Classes & IDs
        fieldClass: 'error',
        errorClass: 'error-message',
        fieldPrefix: 'bouncer-field_',
        errorPrefix: 'bouncer-error_',
        // Patterns
        patterns: {
          email: /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*(\.\w{2,})+$/,
          url: /^(?:(?:https?|HTTPS?|ftp|FTP):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-zA-Z\u00a1-\uffff0-9]-*)*[a-zA-Z\u00a1-\uffff0-9]+)(?:\.(?:[a-zA-Z\u00a1-\uffff0-9]-*)*[a-zA-Z\u00a1-\uffff0-9]+)*(?:\.(?:[a-zA-Z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/,
          number: /^(?:[-+]?[0-9]*[.,]?[0-9]+)$/,
          color: /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/,
          date: /(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-9])|(?:(?!02)(?:0[1-9]|1[0-2])-(?:30))|(?:(?:0[13578]|1[02])-31))/,
          time: /^(?:(0[0-9]|1[0-9]|2[0-3])(:[0-5][0-9]))$/,
          month: /^(?:(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2])))$/
        },
        // Custom Validations
        customValidations: {},
        // Messages
        messageAfterField: true,
        messageCustom: 'data-bouncer-message',
        messageTarget: 'data-bouncer-target',
        messages: {
          missingValue: {
            checkbox: 'This field is required.',
            radio: 'Please select a value.',
            select: 'Please select a value.',
            'select-multiple': 'Please select at least one value.',
            default: 'Please fill out this field.'
          },
          patternMismatch: {
            email: 'Please enter a valid email address.',
            url: 'Please enter a URL.',
            number: 'Please enter a number',
            color: 'Please match the following format: #rrggbb',
            date: 'Please use the YYYY-MM-DD format',
            time: 'Please use the 24-hour time format. Ex. 23:00',
            month: 'Please use the YYYY-MM format',
            default: 'Please match the requested format.'
          },
          outOfRange: {
            over: 'Please select a value that is no more than {max}.',
            under: 'Please select a value that is no less than {min}.'
          },
          wrongLength: {
            over: 'Please shorten this text to no more than {maxLength} characters. You are currently using {length} characters.',
            under: 'Please lengthen this text to {minLength} characters or more. You are currently using {length} characters.'
          },
          fallback: 'There was an error with this field.'
        },
        // Form Submission
        disableSubmit: false,
        // Custom Events
        emitEvents: true
      }; //
      // Methods
      //

      /**
       * A wrapper for Array.prototype.forEach() for non-arrays
       * @param  {Array-like} arr      The array-like object
       * @param  {Function}   callback The callback to run
       */

      var forEach = function forEach(arr, callback) {
        Array.prototype.forEach.call(arr, callback);
      };
      /**
       * Merge two or more objects together.
       * @param   {Object}   objects  The objects to merge together
       * @returns {Object}            Merged values of defaults and options
       */


      var extend = function extend() {
        var merged = {};
        forEach(arguments, function (obj) {
          for (var key in obj) {
            if (!obj.hasOwnProperty(key)) return;

            if (Object.prototype.toString.call(obj[key]) === '[object Object]') {
              merged[key] = extend(merged[key], obj[key]);
            } else {
              merged[key] = obj[key];
            } // merged[key] = obj[key];

          }
        });
        return merged;
      };
      /**
       * Emit a custom event
       * @param  {String} type    The event type
       * @param  {Object} options The settings object
       * @param  {Node}   anchor  The anchor element
       * @param  {Node}   toggle  The toggle element
       */


      var emitEvent = function emitEvent(elem, type, details) {
        if (typeof window.CustomEvent !== 'function') return;
        var event = new CustomEvent(type, {
          bubbles: true,
          detail: details || {}
        });
        elem.dispatchEvent(event);
      };
      /**
       * Add the `novalidate` attribute to all forms
       * @param {Boolean} remove  If true, remove the `novalidate` attribute
       */


      var addNoValidate = function addNoValidate(selector) {
        forEach(document.querySelectorAll(selector), function (form) {
          form.setAttribute('novalidate', true);
        });
      };
      /**
       * Remove the `novalidate` attribute to all forms
       */


      var removeNoValidate = function removeNoValidate(selector) {
        forEach(document.querySelectorAll(selector), function (form) {
          form.removeAttribute('novalidate');
        });
      };
      /**
       * Check if a required field is missing its value
       * @param  {Node} field The field to check
       * @return {Boolean}       It true, field is missing it's value
       */


      var missingValue = function missingValue(field) {
        // If not required, bail
        if (!field.hasAttribute('required')) return false; // Handle checkboxes

        if (field.type === 'checkbox') {
          return !field.checked;
        } // Get the field value length


        var length = field.value.length; // Handle radio buttons

        if (field.type === 'radio') {
          length = Array.prototype.filter.call(field.form.querySelectorAll('[name="' + escapeCharacters(field.name) + '"]'), function (btn) {
            return btn.checked;
          }).length;
        } // Check for value


        return length < 1;
      };
      /**
       * Check if field value doesn't match a patter.
       * @param  {Node}   field    The field to check
       * @param  {Object} settings The plugin settings
       * @see https://www.w3.org/TR/html51/sec-forms.html#the-pattern-attribute
       * @return {Boolean}         If true, there's a pattern mismatch
       */


      var patternMismatch = function patternMismatch(field, settings) {
        // Check if there's a pattern to match
        var pattern = field.getAttribute('pattern');
        pattern = pattern ? new RegExp('^(?:' + pattern + ')$') : settings.patterns[field.type];
        if (!pattern || !field.value || field.value.length < 1) return false; // Validate the pattern

        return field.value.match(pattern) ? false : true;
      };
      /**
       * Check if field value is out-of-range
       * @param  {Node}    field    The field to check
       * @return {String}           Returns 'over', 'under', or false
       */


      var outOfRange = function outOfRange(field) {
        // Make sure field has value
        if (!field.value || field.value.length < 1) return false; // Check for range

        var max = field.getAttribute('max');
        var min = field.getAttribute('min'); // Check validity

        var num = parseFloat(field.value);
        if (max && num > max) return 'over';
        if (min && num < min) return 'under';
        return false;
      };
      /**
       * Check if the field value is too long or too short
       * @param  {Node}   field    The field to check
       * @return {String}           Returns 'over', 'under', or false
       */


      var wrongLength = function wrongLength(field) {
        // Make sure field has value
        if (!field.value || field.value.length < 1) return false; // Check for min/max length

        var max = field.getAttribute('maxlength');
        var min = field.getAttribute('minlength'); // Check validity

        var length = field.value.length;
        if (max && length > max) return 'over';
        if (min && length < min) return 'under';
        return false;
      };
      /**
       * Test for standard field validations
       * @param  {Node}   field    The field to test
       * @param  {Object} settings The plugin settings
       * @return {Object}          The tests and their results
       */


      var runValidations = function runValidations(field, settings) {
        return {
          missingValue: missingValue(field),
          patternMismatch: patternMismatch(field, settings),
          outOfRange: outOfRange(field),
          wrongLength: wrongLength(field)
        };
      };
      /**
       * Run any provided custom validations
       * @param  {Node}   field       The field to test
       * @param  {Object} errors      The existing errors
       * @param  {Object} validations The custom validations to run
       * @param  {Object} settings    The plugin settings
       * @return {Object}             The tests and their results
       */


      var customValidations = function customValidations(field, errors, validations, settings) {
        for (var test in validations) {
          if (validations.hasOwnProperty(test)) {
            errors[test] = validations[test](field, settings);
          }
        }

        return errors;
      };
      /**
       * Check if a field has any errors
       * @param  {Object}  errors The validation test results
       * @return {Boolean}        Returns true if there are errors
       */


      var hasErrors = function hasErrors(errors) {
        for (var type in errors) {
          if (errors[type]) return true;
        }

        return false;
      };
      /**
       * Check a field for errors
       * @param  {Node} field      The field to test
       * @param  {Object} settings The plugin settings
       * @return {Object}          The field validity and errors
       */


      var getErrors = function getErrors(field, settings) {
        // Get standard validation errors
        var errors = runValidations(field, settings); // Check for custom validations

        errors = customValidations(field, errors, settings.customValidations, settings);
        return {
          valid: !hasErrors(errors),
          errors: errors
        };
      };
      /**
       * Escape special characters for use with querySelector
       * @author Mathias Bynens
       * @link https://github.com/mathiasbynens/CSS.escape
       * @param {String} id The anchor ID to escape
       */


      var escapeCharacters = function escapeCharacters(id) {
        var string = String(id);
        var length = string.length;
        var index = -1;
        var codeUnit;
        var result = '';
        var firstCodeUnit = string.charCodeAt(0);

        while (++index < length) {
          codeUnit = string.charCodeAt(index); // Note: there’s no need to special-case astral symbols, surrogate
          // pairs, or lone surrogates.
          // If the character is NULL (U+0000), then throw an
          // `InvalidCharacterError` exception and terminate these steps.

          if (codeUnit === 0x0000) {
            throw new InvalidCharacterError('Invalid character: the input contains U+0000.');
          }

          if ( // If the character is in the range [\1-\1F] (U+0001 to U+001F) or is
          // U+007F, […]
          codeUnit >= 0x0001 && codeUnit <= 0x001F || codeUnit == 0x007F || // If the character is the first character and is in the range [0-9]
          // (U+0030 to U+0039), […]
          index === 0 && codeUnit >= 0x0030 && codeUnit <= 0x0039 || // If the character is the second character and is in the range [0-9]
          // (U+0030 to U+0039) and the first character is a `-` (U+002D), […]
          index === 1 && codeUnit >= 0x0030 && codeUnit <= 0x0039 && firstCodeUnit === 0x002D) {
            // http://dev.w3.org/csswg/cssom/#escape-a-character-as-code-point
            result += '\\' + codeUnit.toString(16) + ' ';
            continue;
          } // If the character is not handled by one of the above rules and is
          // greater than or equal to U+0080, is `-` (U+002D) or `_` (U+005F), or
          // is in one of the ranges [0-9] (U+0030 to U+0039), [A-Z] (U+0041 to
          // U+005A), or [a-z] (U+0061 to U+007A), […]


          if (codeUnit >= 0x0080 || codeUnit === 0x002D || codeUnit === 0x005F || codeUnit >= 0x0030 && codeUnit <= 0x0039 || codeUnit >= 0x0041 && codeUnit <= 0x005A || codeUnit >= 0x0061 && codeUnit <= 0x007A) {
            // the character itself
            result += string.charAt(index);
            continue;
          } // Otherwise, the escaped character.
          // http://dev.w3.org/csswg/cssom/#escape-a-character


          result += '\\' + string.charAt(index);
        } // Return sanitized hash


        return result;
      };
      /**
       * Get or create an ID for a field
       * @param  {Node}    field    The field
       * @param  {Object}  settings The plugin settings
       * @param  {Boolean} create   If true, create an ID if there isn't one
       * @return {String}           The field ID
       */


      var getFieldID = function getFieldID(field, settings, create) {
        var id = field.name ? field.name : field.id;

        if (!id && create) {
          id = settings.fieldPrefix + Math.floor(Math.random() * 999);
          field.id = id;
        }

        if (field.type === 'checkbox') {
          id += '_' + (field.value || field.id);
        }

        return id;
      };
      /**
       * Special handling for radio buttons and checkboxes wrapped in labels.
       * @param  {Node} field The field with the error
       * @return {Node}       The field to show the error on
       */


      var getErrorField = function getErrorField(field) {
        // If the field is a radio button, get the last item in the radio group
        // @todo if location is before, get first item
        if (field.type === 'radio' && field.name) {
          var group = field.form.querySelectorAll('[name="' + escapeCharacters(field.name) + '"]');
          field = group[group.length - 1];
        } // Get the associated label for radio button or checkbox


        if (field.type === 'radio' || field.type === 'checkbox') {
          var label = field.closest('label') || field.form.querySelector('[for="' + field.id + '"]');
          field = label || field;
        }

        return field;
      };
      /**
       * Get the location for a field's error message
       * @param  {Node}   field    The field
       * @param  {Node}   target   The target for error message
       * @param  {Object} settings The plugin settings
       * @return {Node}            The error location
       */


      var getErrorLocation = function getErrorLocation(field, target, settings) {
        // Check for a custom error message
        var selector = field.getAttribute(settings.messageTarget);

        if (selector) {
          var location = field.form.querySelector(selector);

          if (location) {
            // @bugfix by @HaroldPutman
            // https://github.com/cferdinandi/bouncer/pull/28
            return location.firstChild || location.appendChild(document.createTextNode(''));
          }
        } // If the message should come after the field


        if (settings.messageAfterField) {
          // If there's no next sibling, create one
          if (!target.nextSibling) {
            target.parentNode.appendChild(document.createTextNode(''));
          }

          return target.nextSibling;
        } // If it should come before


        return target;
      };
      /**
       * Create a validation error message node
       * @param  {Node} field      The field
       * @param  {Object} settings The plugin settings
       * @return {Node}            The error message node
       */


      var createError = function createError(field, settings) {
        // Create the error message
        var error = document.createElement('div');
        error.className = settings.errorClass;
        error.id = settings.errorPrefix + getFieldID(field, settings, true); // If the field is a radio button or checkbox, grab the last field label

        var fieldTarget = getErrorField(field); // Inject the error message into the DOM

        var location = getErrorLocation(field, fieldTarget, settings);
        location.parentNode.insertBefore(error, location);
        return error;
      };
      /**
       * Get the error message test
       * @param  {Node}            field    The field to get an error message for
       * @param  {Object}          errors   The errors on the field
       * @param  {Object}          settings The plugin settings
       * @return {String|Function}          The error message
       */


      var getErrorMessage = function getErrorMessage(field, errors, settings) {
        // Variables
        var messages = settings.messages; // Missing value error

        if (errors.missingValue) {
          return messages.missingValue[field.type] || messages.missingValue.default;
        } // Numbers that are out of range


        if (errors.outOfRange) {
          return messages.outOfRange[errors.outOfRange].replace('{max}', field.getAttribute('max')).replace('{min}', field.getAttribute('min')).replace('{length}', field.value.length);
        } // Values that are too long or short


        if (errors.wrongLength) {
          return messages.wrongLength[errors.wrongLength].replace('{maxLength}', field.getAttribute('maxlength')).replace('{minLength}', field.getAttribute('minlength')).replace('{length}', field.value.length);
        } // Pattern mismatch error


        if (errors.patternMismatch) {
          var custom = field.getAttribute(settings.messageCustom);
          if (custom) return custom;
          return messages.patternMismatch[field.type] || messages.patternMismatch.default;
        } // Custom validations


        for (var test in settings.customValidations) {
          if (settings.customValidations.hasOwnProperty(test)) {
            if (errors[test] && messages[test]) return messages[test];
          }
        } // Fallback error message


        return messages.fallback;
      };
      /**
       * Add error attributes to a field
       * @param  {Node}   field    The field with the error message
       * @param  {Node}   error    The error message
       * @param  {Object} settings The plugin settings
       */


      var addErrorAttributes = function addErrorAttributes(field, error, settings) {
        field.classList.add(settings.fieldClass);
        field.setAttribute('aria-describedby', error.id);
        field.setAttribute('aria-invalid', true);
      };
      /**
       * Show error attributes on a field or radio/checkbox group
       * @param  {Node}   field    The field with the error message
       * @param  {Node}   error    The error message
       * @param  {Object} settings The plugin settings
       */


      var showErrorAttributes = function showErrorAttributes(field, error, settings) {
        // If field is a radio button, add attributes to every button in the group
        if (field.type === 'radio' && field.name) {
          Array.prototype.forEach.call(document.querySelectorAll('[name="' + field.name + '"]'), function (button) {
            addErrorAttributes(button, error, settings);
          });
        } // Otherwise, add an error class and aria attribute to the field


        addErrorAttributes(field, error, settings);
      };
      /**
       * Show an error message in the DOM
       * @param  {Node} field      The field to show an error message for
       * @param  {Object}          errors   The errors on the field
       * @param  {Object}          settings The plugin settings
       */


      var showError = function showError(field, errors, settings) {
        // Get/create an error message
        var error = field.form.querySelector('#' + escapeCharacters(settings.errorPrefix + getFieldID(field, settings))) || createError(field, settings);
        var msg = getErrorMessage(field, errors, settings);
        error.textContent = typeof msg === 'function' ? msg(field, settings) : msg; // Add error attributes

        showErrorAttributes(field, error, settings); // Emit custom event

        if (settings.emitEvents) {
          emitEvent(field, 'bouncerShowError', {
            errors: errors
          });
        }
      };
      /**
       * Remove error attributes from a field
       * @param  {Node}   field    The field with the error message
       * @param  {Node}   error    The error message
       * @param  {Object} settings The plugin settings
       */


      var removeAttributes = function removeAttributes(field, settings) {
        field.classList.remove(settings.fieldClass);
        field.removeAttribute('aria-describedby');
        field.removeAttribute('aria-invalid');
      };
      /**
       * Remove error attributes from the field or radio group
       * @param  {Node}   field    The field with the error message
       * @param  {Node}   error    The error message
       * @param  {Object} settings The plugin settings
       */


      var removeErrorAttributes = function removeErrorAttributes(field, settings) {
        // If field is a radio button, remove attributes from every button in the group
        if (field.type === 'radio' && field.name) {
          Array.prototype.forEach.call(document.querySelectorAll('[name="' + field.name + '"]'), function (button) {
            removeAttributes(button, settings);
          });
          return;
        } // Otherwise, add an error class and aria attribute to the field


        removeAttributes(field, settings);
      };
      /**
       * Remove an error message from the DOM
       * @param  {Node} field      The field with the error message
       * @param  {Object} settings The plugin settings
       */


      var removeError = function removeError(field, settings) {
        // Get the error message for this field
        var error = field.form.querySelector('#' + escapeCharacters(settings.errorPrefix + getFieldID(field, settings)));
        if (!error) return; // Remove the error

        error.parentNode.removeChild(error); // Remove error and a11y from the field

        removeErrorAttributes(field, settings); // Emit custom event

        if (settings.emitEvents) {
          emitEvent(field, 'bouncerRemoveError');
        }
      };
      /**
       * Remove errors from all fields
       * @param  {String} selector The selector for the form
       * @param  {Object} settings The plugin settings
       */


      var removeAllErrors = function removeAllErrors(selector, settings) {
        forEach(document.querySelectorAll(selector), function (form) {
          forEach(form.querySelectorAll('input, select, textarea'), function (field) {
            removeError(field, settings);
          });
        });
      };
      /**
       * The plugin constructor
       * @param {String} selector The selector to use for forms to be validated
       * @param {Object} options  User settings [optional]
       */


      var Constructor = function Constructor(selector, options) {
        //
        // Variables
        //
        var publicAPIs = {};
        var settings; //
        // Methods
        //

        /**
         * Validate a field
         * @param  {Node} field     The field to validate
         * @param  {Object} options Validation options
         * @return {Object}         The validity state and errors
         */

        publicAPIs.validate = function (field, options) {
          // Don't validate submits, buttons, file and reset inputs, and disabled and readonly fields
          if (field.disabled || field.readOnly || field.type === 'reset' || field.type === 'submit' || field.type === 'button') return; // Local settings

          var _settings = extend(settings, options || {}); // Check for errors


          var isValid = getErrors(field, _settings); // If valid, remove any error messages

          if (isValid.valid) {
            removeError(field, _settings);
            return;
          } // Otherwise, show an error message


          showError(field, isValid.errors, _settings);
          return isValid;
        };
        /**
         * Validate all fields in a form or section
         * @param  {Node} target The form or section to validate fields in
         * @return {Array}       An array of fields with errors
         */


        publicAPIs.validateAll = function (target) {
          return Array.prototype.filter.call(target.querySelectorAll('input, select, textarea'), function (field) {
            var validate = publicAPIs.validate(field);
            return validate && !validate.valid;
          });
        };
        /**
         * Run a validation on field blur
         */


        var blurHandler = function blurHandler(event) {
          // Only run if the field is in a form to be validated
          if (!event.target.form || !event.target.form.matches(selector)) return; // Validate the field

          publicAPIs.validate(event.target);
        };
        /**
         * Run a validation on a fields with errors when the value changes
         */


        var inputHandler = function inputHandler(event) {
          // Only run if the field is in a form to be validated
          if (!event.target.form || !event.target.form.matches(selector)) return; // Only run on fields with errors

          if (!event.target.classList.contains(settings.fieldClass)) return; // Validate the field

          publicAPIs.validate(event.target);
        };
        /**
         * Validate an entire form when it's submitted
         */


        var submitHandler = function submitHandler(event) {
          // Only run on matching elements
          if (!event.target.matches(selector)) return; // Prevent form submission

          event.preventDefault(); // Validate each field

          var errors = publicAPIs.validateAll(event.target); // If there are errors, focus on the first one

          if (errors.length > 0) {
            errors[0].focus();
            emitEvent(event.target, 'bouncerFormInvalid', {
              errors: errors
            });
            return;
          } // Otherwise, submit if not disabled


          if (!settings.disableSubmit) {
            event.target.submit();
          } // Emit custom event


          if (settings.emitEvents) {
            emitEvent(event.target, 'bouncerFormValid');
          }
        };
        /**
         * Destroy the current plugin instantiation
         */


        publicAPIs.destroy = function () {
          // Remove event listeners
          document.removeEventListener('blur', blurHandler, true);
          document.removeEventListener('input', inputHandler, false);
          document.removeEventListener('click', inputHandler, false);
          document.removeEventListener('submit', submitHandler, false); // Remove all errors

          removeAllErrors(selector, settings); // Remove novalidate attribute

          removeNoValidate(selector); // Emit custom event

          if (settings.emitEvents) {
            emitEvent(document, 'bouncerDestroyed', {
              settings: settings
            });
          } // Reset settings


          settings = null;
        };
        /**
         * Instantiate a new instance of the plugin
         */


        var init = function init() {
          // Create settings
          settings = extend(defaults, options || {}); // Add novalidate attribute

          addNoValidate(selector); // Event Listeners

          document.addEventListener('blur', blurHandler, true);
          document.addEventListener('input', inputHandler, false);
          document.addEventListener('click', inputHandler, false);
          document.addEventListener('submit', submitHandler, false); // Emit custom event

          if (settings.emitEvents) {
            emitEvent(document, 'bouncerInitialized', {
              settings: settings
            });
          }
        }; //
        // Inits & Event Listeners
        //


        init();
        return publicAPIs;
      }; //
      // Return the constructor
      //


      return Constructor;
    });
  });

  function init() {
    var validator = new bouncer('[data-validate]', {
      fieldClass: 'field',
      errorClass: 'field__error-message',
      fieldPrefix: 'validator-field__',
      errorPrefix: 'validator-error__',
      messageAfterField: false,
      disableSubmit: true,
      // Error messages by error type
      messages: {
        missingValue: {
          checkbox: 'Required',
          radio: 'Please select a value.',
          select: 'Please select a value.',
          'select-multiple': 'Please select at least one value.',
          default: 'Required'
        },
        patternMismatch: {
          email: 'Please enter a valid email address.',
          url: 'Please enter a URL.',
          number: 'Please enter a valid number.',
          color: 'Please enter a color in `#rrggbb` format.',
          date: 'Please enter a date in `YYYY-MM-DD` format',
          time: 'Please use the 24-hour time format. Ex. 23:00',
          month: 'Please use the YYYY-MM format',
          default: 'Please match the requested format.'
        },
        outOfRange: {
          over: 'Please select a value no more than {max}.',
          under: 'Please select a value no less than {min}.'
        },
        wrongLength: {
          over: 'Please limit your input to {maxLength} characters. You have entered {length} characters.',
          under: 'Please enter {minLength} characters or more. You have entered {length} characters.'
        }
      }
    });

    if (document.querySelectorAll('[data-validate]').length) {
      document.addEventListener('bouncerShowError', function (event) {
        var field = event.target.parentElement;

        if (field.classList.contains('field')) {
          field.classList.add('field--has-error');
        }
      });
      document.addEventListener('bouncerRemoveError', function (event) {
        var field = event.target.parentElement;

        if (field.classList.contains('field')) {
          field.classList.remove('field--has-error');
        }
      });
    }

    return validator;
  }

  function DirtyInput(input) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    options = Object.assign({
      addToParent: true,
      dirtyClass: 'field--is-dirty',
      event: 'blur'
    }, options);
    input.addEventListener(options.event, function (event) {
      if (event.target.value) {
        (options.addToParent ? input.parentElement : input).classList.add(options.dirtyClass);
      } else {
        (options.addToParent ? input.parentElement : input).classList.remove(options.dirtyClass);
      }
    });
  }

  DirtyInput.init = function () {
    var selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '.field__input';
    return document.querySelectorAll(selector).forEach(i => new DirtyInput(i));
  };

  /* eslint-disable-next-line */

  var app = {
    nav: new OffCanvasNav()
  }; // Initialize Toggles.

  Toggles.init(); // Initialize form validation.

  app.validator = init();
  DirtyInput.init();

}());
//# sourceMappingURL=app.js.map
