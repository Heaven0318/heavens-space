# Heaven's Space — Editing Guide

This site intentionally uses plain HTML, CSS, and JavaScript. You do not need a framework or build command.

## Start the site

From this folder, run:

```text
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Where to edit things

- `index.html` — page structure and personal copy.
- `css/style.css` — colors, spacing, typography, responsive layout, and animations.
- `js/projects.js` — all project information. Copy an existing project object to add another one.
- `js/main.js` — interactions such as theme switching, filtering, contact validation, and project views.

## Add a project

Only publish real projects in `js/projects.js`. The archive currently keeps the Earrings Project and renders four non-clickable Coming Soon cards separately in `comingSoonCard()` in `js/main.js`. These placeholders have no URLs, technologies, or detail pages. Adjust their count in `renderProjects()` as you add real work. Empty category filters also display placeholders; placeholders are not assigned invented categories.

Open `js/projects.js` and copy one object inside the `projects` array. Change the `title`, `slug`, `category`, `description`, and the project details. The `slug` becomes the project link, for example `#project=my-new-project`.

Supported category words are:

- `web development`
- `web design`
- `personal`
- `school`

Use more than one category word when a project belongs in multiple filters.

## Change social links

The social links are in the footer of `index.html`. Replace the `href` value when a new profile becomes available.

## Connect the contact form

The form currently validates the email but does not pretend to send anything. When you choose a service, add its secure endpoint inside `setupContactForm()` in `js/main.js`. Keep API keys and private credentials on a server or serverless function, never in this frontend file.

## Theme and motion

Theme colors and animation timing are CSS variables near the top of `css/style.css`. The site automatically respects `prefers-reduced-motion`.
