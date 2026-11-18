;(function () {
  var GITHUB_USER = 'Sebasjgg27'
  var UPDATES_URL = 'data/updates.json'
  var MAX_EVENTS = 8
  var REFRESH_MS = 300000

  var REPO_OVERRIDES = {
    SwimTrack: 'Swimming club platform — race times, meets, training zones, leaderboards.',
    'specialist-dance-mc': 'Dance gif on your screen when you hit diamonds, netherite, or a good enchant book.',
    'dumb-humanity': 'Offline, print-ready knowledge base for rebuilding civilization — 70 guides, tech tree, 6 languages.'
  }

  var LANG_CLASS = {
    HTML: 'html', JavaScript: 'js', TypeScript: 'ts', Python: 'py',
    Java: 'java', GDScript: 'gd', MDX: 'mdx'
  }

  var activityList = document.querySelector('#dev .event-list')
  var repoList = document.getElementById('repo-list')

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    })
  }

  function emptyState(text) {
    return '<li style="color:#555;font-size:0.85rem;">' + escapeHtml(text) + '</li>'
  }

  function retryState(text) {
    return '<li style="color:#555;font-size:0.85rem;">' + escapeHtml(text) +
      ' <button onclick="location.reload()" style="background:none;border:1px solid #555;color:#888;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:0.8rem;">Retry</button></li>'
  }

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

  function repoLink(repo) {
    return '<a href="https://github.com/' + repo + '" target="_blank" rel="noopener">' + repo + '</a>'
  }

  function getEventText(event) {
    var repo = escapeHtml(event.repo.name)
    var payload = event.payload
    switch (event.type) {
      case 'PushEvent':
        var branch = escapeHtml((payload.ref || 'refs/heads/main').replace('refs/heads/', ''))
        return 'Pushed to <strong>' + branch + '</strong> on ' + repoLink(repo)
      case 'CreateEvent':
        var refType = escapeHtml(payload.ref_type || '')
        var ref = escapeHtml(payload.ref || event.repo.name.split('/')[1])
        return 'Created ' + refType + ' <strong>' + ref + '</strong> in ' + repoLink(repo)
      case 'WatchEvent':
        return 'Starred ' + repoLink(repo)
      case 'IssuesEvent':
        var action = escapeHtml(payload.action || '')
        return action.charAt(0).toUpperCase() + action.slice(1) + ' issue ' + repoLink(repo)
      case 'ForkEvent':
        return 'Forked ' + repoLink(repo)
      default:
        return escapeHtml(event.type.replace('Event', '')) + ' on ' + repoLink(repo)
    }
  }

  function renderEvents(events) {
    if (!activityList) return
    activityList.innerHTML = ''
    var count = 0
    events.forEach(function (e) {
      if (count >= MAX_EVENTS) return
      var li = document.createElement('li')
      li.innerHTML =
        '<span class="event-icon">' + getEventIcon(e.type) + '</span>' +
        '<div>' + getEventText(e) + '<span class="event-date">' + formatDate(e.created_at) + '</span></div>'
      activityList.appendChild(li)
      count++
    })
    if (count === 0) activityList.innerHTML = emptyState('No recent public activity.')
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
          activityList.innerHTML = retryState('Could not load activity.')
        }
      })
  }

  function renderRepos(repos) {
    if (!repoList) return
    repoList.innerHTML = ''
    if (!repos.length) {
      repoList.innerHTML = emptyState('No public repositories yet.')
      return
    }
    repos.forEach(function (repo) {
      var lang = repo.language || ''
      var langClass = LANG_CLASS[lang] || 'other'
      var desc = REPO_OVERRIDES[repo.name] || repo.description || 'No description yet.'
      var li = document.createElement('li')
      li.innerHTML =
        '<a href="' + escapeHtml(repo.html_url) + '" target="_blank" rel="noopener">' + escapeHtml(repo.name) + '</a>' +
        '<p>' + escapeHtml(desc) + '</p>' +
        (lang ? '<span class="lang-dot ' + langClass + '"></span>' + escapeHtml(lang) : '')
      repoList.appendChild(li)
    })
  }

  function fetchRepos() {
    var url = 'https://api.github.com/users/' + GITHUB_USER + '/repos?sort=created&direction=desc&per_page=100'
    var cached = localStorage.getItem('gh_repos_cache')
    var cachedTime = localStorage.getItem('gh_repos_time')
    if (cached && cachedTime && (Date.now() - parseInt(cachedTime) < REFRESH_MS)) {
      try { renderRepos(JSON.parse(cached)); return } catch (e) {}
    }
    fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error('GitHub API error')
        return r.json()
      })
      .then(function (data) {
        if (!Array.isArray(data)) throw new Error('Bad response')
        var repos = data.filter(function (r) { return !r.fork && !r.archived })
        localStorage.setItem('gh_repos_cache', JSON.stringify(repos))
        localStorage.setItem('gh_repos_time', String(Date.now()))
        renderRepos(repos)
      })
      .catch(function () {
        if (repoList && repoList.children.length === 0) {
          repoList.innerHTML = retryState('Could not load repositories.')
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

  fetchRepos()
  fetchGitHub()
  loadUpdates()
  setInterval(function () { fetchRepos(); fetchGitHub() }, REFRESH_MS)
})()
