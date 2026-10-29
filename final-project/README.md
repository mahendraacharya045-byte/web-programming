# Bapsang: Korean Home Recipes (final project)

A responsive, four-page recipe website built with plain HTML, CSS and JavaScript. Light theme only.

## Pages
| File | Purpose |
|---|---|
| `index.html` | Home: hero, three featured recipes, tool overview |
| `recipes.html` | Eight recipes with search, filters, servings, timers, favorites, shopping list, print |
| `about.html` | Project goal, how it is built, credits |
| `contact.html` | Contact form with client-side validation (demo only, nothing is sent) |
| `style.css` | All styling |
| `script.js` | All behavior (each feature runs only on the page that needs it) |

## Features
- Responsive layout (phone, tablet, desktop) and a collapsible mobile menu
- Live search by recipe name or ingredient, plus category filters
- Servings scaler that rewrites every ingredient amount
- Step timers with on-screen countdown, beep and vibration
- Ingredient checklist and "Copy shopping list" (unticked items only)
- Favorites saved in the browser (`localStorage`)
- Print a single recipe
- Dish photos loaded from Wikipedia at view time (not stored in the project). The cartoon illustration is shown if a photo cannot load
- Accessibility: semantic landmarks, skip link, keyboard operable controls, visible focus, labeled form with an error summary, 4.5:1 contrast

## Run it on your computer
```bash
cd bapsang-site
python3 -m http.server 8000
```
Open http://localhost:8000

## Open it from other devices on the same network
```bash
python3 -m http.server 8000 --bind 0.0.0.0
```
Find your IP (`hostname -I` on Linux, `ipconfig` on Windows) and open `http://YOUR-IP:8000` on the other device. If it does not load, allow port 8000 in your firewall (`sudo ufw allow 8000` on Ubuntu).

## Publish it online (free)
Push the folder to a GitHub repository, then enable **Settings > Pages** and choose the main branch. GitHub gives you a public link.

## Credits
Photos come from Wikipedia articles and belong to their photographers under free licences. Each photo links to its source article.
