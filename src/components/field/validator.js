import Bouncer from '../../../node_modules/formbouncerjs/dist/bouncer.js'

// Initialize form validation.
function init () {
  const validator = new Bouncer('[data-validate]', {
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
  })

  if (document.querySelectorAll('[data-validate]').length) {
    document.addEventListener('bouncerShowError', function (event) {
      const field = event.target.parentElement
      if (field.classList.contains('field')) {
        field.classList.add('field--has-error')
      }
    })
    document.addEventListener('bouncerRemoveError', function (event) {
      const field = event.target.parentElement
      if (field.classList.contains('field')) {
        field.classList.remove('field--has-error')
      }
    })
  }

  return validator
}

export default init
