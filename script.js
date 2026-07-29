;(function () {
  var GITHUB_USER = 'Sebasjgg27'
  var UPDATES_URL = 'data/updates.json'
  var MAX_EVENTS = 8
  var REFRESH_MS = 120000

  var activityList = document.querySelector('#dev .event-list')
  var devSection = document.getElementById('dev')

  function formatDate(dateStr) {
    var d = new Date(dateStr)
    var now = new Date()
    var diff = (now - d) / (1000 * 60 * 60 * 24)
    if (diff < 1) return 'Today'
    if (diff < 2) return 'Yesterday'
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  function getEventIcon(type) {
    switch (type) {
      case 'PushEvent': return "\uD83D\uDCE6"
      case 'CreateEvent': return "\uD83D\uDE80"
      case 'WatchEvent': return "\u2B50"
      case 'IssuesEvent': return "\uD83D\uDCA1"
      case 'ForkEvent': return "\uD83C\uDF2D\uFE0F"
      case 'PullRequestEvent': return "\uD83D\uDD04"
      default: return "\u25B6\uFE0F"
    }
  }

  function getEventText(event) {
    var repo = event.repo.name
    var payload = event.payload
    switch (event.type) {
      case 'PushEvent':
        var branch = (payload.ref || 'refs/heads/main').replace('refs/heads/', '')
        return 'Pushed to <strong>' + branch + '</strong> on <a href="https://github.com/' + repo + '" target="_blank" rel="noopener">' + repo + '</a>'
      case 'CreateEvent':
        return 'Created ' + payload.ref_type + ' <strong>' + (payload.ref || repo.split('/')[1]) + '</strong> in <a href="https://github.com/' + repo + '" target="_blank" rel="noopener">' + repo + '</a>'
      case 'WatchEvent':
        return 'Starred <a href="https://github.com/' + repo + '" target="_blank" rel="noopener">' + repo + '</a>'
      case 'IssuesEvent':
        return payload.action.charAt(0).toUpperCase() + payload.action.slice(1) + ' issue <a href="https://github.com/' + repo + '" target="_blank" rel="noopener">' + repo + '</a>'
      case 'ForkEvent':
        return 'Forked <a href="https://github.com/' + repo + '" target="_blank" rel="noopener">' + repo + '</a>'
      default:
        return event.type.replace('Event', '') + ' on <a href="https://github.com/' + repo + '" target="_blank" rel="noopener">' + repo + '</a>'
    }
  }

  function renderEvents(events) {
    if (!activityList) return
    activityList.innerHTML = ''
    var count = 0
    events.forEach(function (e) {
      if (count >= MAX_EVENTS) return
      var icon = getEventIcon(e.type)
      var text = getEventText(e)
      var date = formatDate(e.created_at)
      var li = document.createElement('li')
      li.innerHTML =
        '<span class="event-icon">' + icon + '</span>' +
        '<div>' + text + '<span class="event-date">' + date + '</span></div>'
      activityList.appendChild(li)
      count++
    })
    if (count === 0) {
      activityList.innerHTML = '<li style="color: #555; font-size: 0.85rem;">No recent public activity.</li>'
    }
  }

  function fetchGitHub() {
    var url = 'https://api.github.com/users/' + GITHUB_USER + '/events/public'
    var cached = localStorage.getItem('gh_events_cache')
    var cachedTime = localStorage.getItem('gh_events_time')
    if (cached && cachedTime && (Date.now() - parseInt(cachedTime) < REFRESH_MS)) {
      try { renderEvents(JSON.parse(cached)); return } catch (e) {}
    }
    fetch(url)
      .then(function (r) { return r.json() })
      .then(function (data) {
        if (Array.isArray(data)) {
          localStorage.setItem('gh_events_cache', JSON.stringify(data))
          localStorage.setItem('gh_events_time', String(Date.now()))
          renderEvents(data)
        }
      })
      .catch(function () {
        if (activityList && activityList.children.length === 0) {
          activityList.innerHTML = '<li style="color: #555; font-size: 0.85rem;">Could not load activity. <button onclick="location.reload()" style="background:none;border:1px solid #555;color:#888;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:0.8rem;">Retry</button></li>'
        }
      })
  }

  function loadUpdates() {
    fetch(UPDATES_URL)
      .then(function (r) { return r.json() })
      .then(function (updates) {
        var seen = localStorage.getItem('seen_updates')
        var seenIds = seen ? seen.split(',').map(Number) : []
        var hasNew = false
        updates.forEach(function (u) {
          if (u.unread && seenIds.indexOf(u.id) === -1) {
            hasNew = true
          }
        })
        if (!hasNew) return
        var badge = document.createElement('span')
        badge.className = 'update-badge'
        badge.textContent = '!'
        badge.style.cssText =
          'position:fixed;top:0.6rem;right:1rem;background:#ff3300;color:#fff;' +
          'width:20px;height:20px;border-radius:50%;display:flex;align-items:center;' +
          'justify-content:center;font-size:0.75rem;font-weight:800;z-index:200;' +
          'cursor:pointer;font-family:Inter,sans-serif;'
        badge.title = 'New updates available'
        badge.addEventListener('click', function () {
          var updatesStr = updates.map(function (u) {
            return u.title + ' (' + u.date + ')\n' + (u.description || '')
          }).join('\n\n')
          alert('Updates:\n\n' + updatesStr)
          var allIds = updates.map(function (u) { return u.id })
          localStorage.setItem('seen_updates', allIds.join(','))
          badge.remove()
        })
        document.body.appendChild(badge)
      })
      .catch(function () {})
  }

  fetchGitHub()
  loadUpdates()
  setInterval(fetchGitHub, REFRESH_MS)
})()
