import immutable from 'object-path-immutable'

const add = (object, path, previousPath = '') => {
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

export const moisten = (paths) => {
  const moistened = {}
  for (let path of paths) {
    add(moistened, path)
  }
  return moistened
}

export const setAtPath = (files, path, type) => {
  const newPath = path.replace(/^\//, '')
  const object = type === 'folder' ? { type, content: {} } : { type, path: newPath }

  return immutable
    .wrap(files)
    .set(newPath.split('/'), object)
    .value()
}
