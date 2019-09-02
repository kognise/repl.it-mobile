export default `
<!DOCTYPE html>
<html>
  <head>
    <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'>
    <link href='https://fonts.googleapis.com/css?family=Inconsolata' rel='stylesheet'>
    <style>
      #editor { 
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        font-size: 18px;
        font-family: Inconsolata, monospace;
      }
      .ace_scroller.ace_scroll-left {
        box-shadow: initial !important;
      }
    </style>
  </head>
  <body>
    <div id='editor'></div>

    <script>
      let loaded = false
      let loadedData = null

      function load(data) {
        const editor = ace.edit('editor', {
          cursorStyle: 'slim',
          useWorker: false
        })
        const modeList = ace.require('ace/ext/modelist')

        let listening = false
        const { code, path, dark, canWrite, softWrapping, indentSize, softTabs } = JSON.parse(data)
        const mode = modeList.getModeForPath(path).mode
        editor.setTheme(dark ? 'ace/theme/dracula' : 'ace/theme/github')
        editor.session.setMode(mode)
        editor.session.setUseWrapMode(softWrapping)
        editor.session.setValue(code)
        editor.session.setUseSoftTabs(softTabs)
        editor.session.setTabSize(indentSize)

        if (!canWrite) {
          editor.setOptions({
            readOnly: true,
            highlightActiveLine: false,
            highlightGutterLine: false
          })
          editor.renderer.$cursorLayer.element.style.opacity = 0
          editor.textInput.getElement().tabIndex = -1
          editor.textInput.getElement().disabled = true
          editor.commands.commmandKeyBinding = {}
        }

        let lastBounce = Date.now()
        function update() {
          const now = Date.now()
          if (now - lastBounce > 100) {
            window.ReactNativeWebView.postMessage(editor.session.getValue())
            lastBounce = now
          }
        }
        editor.container.addEventListener('keyup', update)
        editor.container.addEventListener('change', update)
      }

      document.addEventListener('message', ({ data }) => {
        if (loaded) {
          load(data)
        } else {
          loadedData = data
        }
      })
    </script>

    <script src='https://cdn.jsdelivr.net/gh/ajaxorg/ace-builds@1.4.5/src-min/ace.js'></script>
    <script src='https://cdn.jsdelivr.net/gh/ajaxorg/ace-builds@1.4.5/src-min/ext-modelist.js'></script>
    <script>
      loaded = true
      if (loadedData) {
        load(loadedData)
      }
    </script>
  </body>
</html>
`
