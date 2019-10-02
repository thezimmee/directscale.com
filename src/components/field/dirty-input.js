function DirtyInput (input, options = {}) {
  options = Object.assign({
    addToParent: true,
    dirtyClass: 'field--is-dirty',
    event: 'blur'
  }, options)

  input.addEventListener(options.event, function (event) {
    if (event.target.value) {
      (options.addToParent ? input.parentElement : input).classList.add(options.dirtyClass)
    } else {
      (options.addToParent ? input.parentElement : input).classList.remove(options.dirtyClass)
    }
  })
}

DirtyInput.init = function (selector = '.field__input') {
  return document.querySelectorAll(selector).forEach(i => new DirtyInput(i))
}

export default DirtyInput
