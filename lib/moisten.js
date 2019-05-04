function add(object, path, previousPath = '') {
  const split = path.split('/')
  if (split.length === 1) {
    object[split[0]] = { type: 'file', path: `${previousPath}/${path}`.replace(/^\//, '') }
  } else if (split[0] in object) {
    const { content } = object[split[0]]
    add(content, split.slice(1).join('/'), `${previousPath}/${split[0]}`)
  } else {
    const content = {}
    object[split[0]] = { type: 'folder', content }
    add(content, split.slice(1).join('/'), `${previousPath}/${split[0]}`)
  }
}

function moisten(paths) {
  const moistened = {}
  for (let path of paths) {
    add(moistened, path)
  }
  return moistened
}

export default moisten