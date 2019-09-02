export default `
<script>
  const __replit_mobile_send_message__ = (error, parts) => {
    const message = JSON.stringify([ error, parts.join(' ') ])
    window.ReactNativeWebView.postMessage(message)
  }

  const __replit_mobile_timings__ = {}
  window.console = {
    assert: (assertion, ...parts) => {
      if (!assertion) {
        __replit_mobile_send_message__(true, [ 'Assertion failed:', ...parts ])
      }
    },
    clear: () => {},
    dir: (...parts) => __replit_mobile_send_message__(false, parts),
    error: (...parts) => __replit_mobile_send_message__(true, parts),
    info: (...parts) => __replit_mobile_send_message__(false, parts),
    log: (...parts) => __replit_mobile_send_message__(false, parts),
    time: (label = 'default') => {
      if (label in __replit_mobile_timings__) {
        console.warn(\`Timer '\${label}' already exists\`)
      } else {
        __replit_mobile_timings__[label] = Date.now()
      }
    },
    timeEnd: (label = 'default') => {
      if (label in __replit_mobile_timings__) {
        const difference = Date.now() - __replit_mobile_timings__[label]
        delete __replit_mobile_timings__[label]
        __replit_mobile_send_message__(false, [ \`\${label}: \${difference}ms\` ])
      }
    },
    trace: (label = 'Trace') => {
      const error = new Error()
      __replit_mobile_send_message__(false, [ \`\${label}: \${error.stack}\` ])
    },
    warn: (...parts) => __replit_mobile_send_message__(true, parts)
  }
</script>
`
