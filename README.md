# SebG-Web

Personal website for [@Sebasjgg27](https://github.com/Sebasjgg27).

## Sections

- **Hero** — Name, taglines, social links, location
- **About** — Bio, skills, hobbies
- **Dev** — Live GitHub activity feed (pushes, stars, forks)
- **Projects** — SwimTrack, Chronos Veritas, SebG-Web
- **Social** — Threads embed, Steam mini-profile, Instagram link
- **Contact** — Social links footer

## Run locally

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000` in your browser. A local server is required for the GitHub API fetch and notification system to work.

## How to update

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
Replace `GOPR0862.JPG` in the root directory with your own image.

## Tech

- Pure HTML + CSS + vanilla JS
- Google Fonts: Inter + JetBrains Mono
- GitHub Events API for live activity
- Threads embed + Steam mini-profile embed
- No frameworks, no build step
