export default `
<!DOCTYPE html>
<html>
  <head>
    <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'>
    <style>
      #editor { 
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        font-size: 16px;
      }
      .ace_scroller.ace_scroll-left {
        box-shadow: initial !important;
      }
    </style>
  </head>
  <body>
    <div id='editor'></div>
    <script src='https://cdn.jsdelivr.net/gh/ajaxorg/ace-builds@1.4.4/src-min/ace.js'></script>
    <script>
      const editor = ace.edit('editor', {
        cursorStyle: 'slim',
        useWorker: false
      })
      editor.setTheme('ace/theme/github')
      editor.session.setMode('ace/mode/javascript')

      document.addEventListener('message', ({ data }) => {
        editor.getSession().setValue(data)
      }, false)
    </script>
  </body>
</html>
`