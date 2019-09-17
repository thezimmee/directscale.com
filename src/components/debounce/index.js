function debounce (callback, wait, immediate) {
  if (wait === undefined) wait = 100
  var timeout
  return function () {
    var context = this; var args = arguments
    var later = function () {
      timeout = null
      if (!immediate) callback.apply(context, args)
    }
    var callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) callback.apply(context, args)
  }
}

export default debounce
