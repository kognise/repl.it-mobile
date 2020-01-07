import { useRef, useEffect } from 'react'

export default () => {
  const ref = useRef(true)
  useEffect(() => () => (ref.current = false), [])
  return ref
}
