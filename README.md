# SebG-Web

Personal website for [@Sebasjgg27](https://github.com/Sebasjgg27).

## Sections

- **Hero** — Name, taglines, social links, location
- **About** — Bio, skills, hobbies
- **Dev** — Auto-updating GitHub repositories + live activity feed
- **Projects** — SwimTrack, Chronos Veritas, SebG-Web
- **Contact** — Social links footer

## Run locally

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000` in your browser. A local server is required for the GitHub API fetches and notification system to work.

## How to update

### Repositories
The Dev section fetches public repos from the GitHub API on load and every 5 minutes. New public repos appear automatically; forks and archived repos are hidden. To customize a description, add the repo name to `REPO_OVERRIDES` in `script.js`.

### Changelog / Notification badge
Edit `data/updates.json` and add a new entry:
```json
{
  "id": 2,
  "type": "release",
  "title": "What's new",
  "description": "Details here",
  "date": "2026-07-29",
  "unread": true
}
```
Visitors will see a red badge on the page. Clicking it shows the update and marks it read.

### Profile photo
Replace the images in `assets/` (`hero-320.webp`, `hero-640.webp`, and the `.jpg` variants) and the fallback `GOPR0862.JPG` in the root directory. The browser picks the smallest suitable version.

## Tech

- Pure HTML + CSS + vanilla JS
- Google Fonts: Inter + JetBrains Mono
- GitHub Repos + Events APIs for live data
- No frameworks, no build step
