function deserialize (data = {}) {
  Object.keys(data).forEach(key => {
    // Boolean types.
    if (data[key] === 'true' || data[key] === '') data[key] = true
    else if (data[key] === 'false') data[key] = false
    // Object/Array types.
    else if (
      (data[key][0] === '[' && data[key][data[key].length - 1] === ']') ||
      (data[key][0] === '{' && data[key][data[key].length - 1] === '}')
    ) data[key] = JSON.parse(data[key])
    // Number types.
    else if (!isNaN(+data[key])) data[key] = +data[key]
    // Convert dash-case to camelCase.
    if (key.indexOf('-') > -1) {
      data[key.replace(/-([a-z])/g, (m, w) => w.toUpperCase())] = data[key]
      delete data[key]
    }
  })

  return data
}

function serialize (data) {
  Object.keys(data).forEach(key => {
    // Object/Array types.
    if (typeof data[key] === 'object') data[key] = JSON.stringify(data[key])
    // Boolean|Number types.
    else data[key] = String(data[key])
    // Convert camelCase keys to dash-case.
    const newKey = key.replace(/([A-Z])/g, (g) => -g[0].toLowerCase())
    if (newKey !== key) {
      data[newKey] = data[key]
      delete data[key]
    }
  })

  return data
}

export { serialize, deserialize }
