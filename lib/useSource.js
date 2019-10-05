import { useState, useEffect } from 'react'
import AssetUtils from 'expo-asset-utils'

export default (code) => {
  const [source, setSource] = useState()

  useEffect(() => {
    ;(async () => {
      const { uri } = await AssetUtils.resolveAsync(code)
      const res = await fetch(uri)
      const html = await res.text()
      setSource(html)
    })()
  }, [code])

  return source
}
