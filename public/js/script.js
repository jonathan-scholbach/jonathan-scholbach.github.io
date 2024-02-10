;(function (document) {
  var toggle = document.querySelector('.sidebar-toggle')
  var sidebar = document.querySelector('#sidebar')
  var checkbox = document.querySelector('#sidebar-checkbox')
  var toc = document.querySelector('.toc')

  function displayTOC() {
    const width = document.body.clientWidth
    toc.style.display = width > 1900 ? 'block' : 'none'
  }

  const resizeObserver = new ResizeObserver(() => {
    displayTOC()
  })

  resizeObserver.observe(document.body)

  document.addEventListener(
    'click',
    function (e) {
      var target = e.target

      if (
        !checkbox.checked ||
        sidebar.contains(target) ||
        target === checkbox ||
        target === toggle
      )
        return

      checkbox.checked = false
    },
    false
  )
})(document)
