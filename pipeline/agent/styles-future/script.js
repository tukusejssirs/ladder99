window.onload = function () {
  document.getElementById('pathText').value = getParameterByName('path')
  document.getElementById('fromText').value = getParameterByName('from')
  document.getElementById('countText').value = getParameterByName('count')

  // // autorefresh - this works but resets page position
  // setTimeout(() => window.location.reload(), 2000)

  // highlight the current tab
  const tabname = window.location.pathname.slice(1) // probe|current|sample
  document.getElementById('tab-' + tabname).classList.add('selected')

  // restore to last vertical position
  const scrollTop = localStorage.getItem('scrollTop')
  if (scrollTop != null) {
    const table = document.getElementById('main-table')
    table.scrollTop = parseInt(scrollTop)
  }
  // if (document.cookie.includes(window.location.href)) {
  //   if (document.cookie.match(/scrollTop=([^;]+)(;|$)/) != null) {
  //     var arr = document.cookie.match(/scrollTop=([^;]+)(;|$)/)
  //     document.documentElement.scrollTop = parseInt(arr[1])
  //     document.body.scrollTop = parseInt(arr[1])
  //   }
  // }
}

window.onbeforeunload = function () {
  // var scrollPos
  // if (typeof window.pageYOffset != 'undefined') {
  //   scrollPos = window.pageYOffset
  // } else if (
  //   typeof document.compatMode != 'undefined' &&
  //   document.compatMode != 'BackCompat'
  // ) {
  //   scrollPos = document.documentElement.scrollTop
  // } else if (typeof document.body != 'undefined') {
  //   scrollPos = document.body.scrollTop
  // }
  // document.cookie = 'scrollTop=' + scrollTop + 'URL=' + window.location.href
  const table = document.getElementById('main-table')
  const scrollTop = table != null ? table.scrollTop : 0
  localStorage.setItem('scrollTop', String(scrollTop))
}

function fetchData() {
  var p = document.getElementById('pathText').value
  var f = document.getElementById('fromText').value
  var c = document.getElementById('countText').value
  let base = '../probe'
  let params = []
  if (p) {
    params.push('path=' + p)
    base = '../current'
  }
  if (f) {
    params.push('from=' + f)
    base = '../sample'
  }
  if (c) {
    params.push('count=' + c)
    base = '../sample'
  }
  const query = base + (params.length === 0) ? '' : '?' + params.join('&')
  console.log(base, params, query)
  window.location = query
}

function getParameterByName(name) {
  var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search)
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '))
}
