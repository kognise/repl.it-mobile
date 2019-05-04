function add(object, path) {
  const split = path.split('/')
  if (split.length === 1) {
    object[split[0]] = { type: 'file' }
  } else if (split[0] in object) {
    const { content } = object[split[0]]
    add(content, split.slice(1).join('/'))
  } else {
    const content = {}
    object[split[0]] = { type: 'folder', content }
    add(content, split.slice(1).join('/'))
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