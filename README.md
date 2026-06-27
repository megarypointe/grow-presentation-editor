# Grow Presentation Editor

Standalone GitHub Pages editor for reordering the Grow presentation slides.

Live URL: https://walkthrough.growpage.org/

The editor loads and saves slideshow data through the Cloudflare Worker API at `https://grow-api.kennygpt.org/api/presentations`.
Each slideshow is presented at its seven-digit URL path, e.g. `https://walkthrough.growpage.org/9843754`.
