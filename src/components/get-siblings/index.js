export default (el, selector) => {
  return Array.prototype.filter.call(el.parentNode.children, (sibling) => {
    return sibling !== el && (!selector || sibling.matches(selector))
  })
}
