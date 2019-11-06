export default (ref) => {
  return new Promise((resolve) => {
    if (ref.current) return resolve()
    const interval = setInterval(() => {
      if (ref.current) {
        clearInterval(interval)
        resolve()
      }
    }, 500)
  })
}
