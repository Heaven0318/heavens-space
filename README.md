# Heaven's Space

Heaven's Space is the personal portfolio of Cedrick Yosh C. Pereyra, a student developer based in Manila. It brings together selected work, a short introduction, and a way to get in touch in an interactive, responsive website.

**Live website:** [heaven0318.github.io/heavens-space](https://heaven0318.github.io/heavens-space/)

## What you'll find

- **Work:** A filterable project gallery with individual project details and links to live projects.
- **About:** Background and interests of the developer behind the portfolio.
- **Contact:** A message form for collaborations, student projects, and other ideas.
- **Interactive design:** A visual site map, theme switcher, motion effects, and mobile navigation. The site respects reduced-motion preferences.

## Built with

The front end uses HTML, CSS, and vanilla JavaScript and is hosted on GitHub Pages. The contact form uses a Supabase Edge Function and database; an authenticated owner inbox provides access to submitted messages.

## Explore the code

| Path | Purpose |
| --- | --- |
| `index.html` | Main portfolio page and content |
| `css/style.css` | Layout, responsive styling, and themes |
| `js/main.js` | Navigation, project views, animations, and contact form behavior |
| `js/projects.js` | Project entries shown in the work section |
| `owner/` | Private owner inbox interface |
| `supabase/` | Contact form Edge Function and database migration |

To view the front end locally, open `index.html` in a browser. To add or edit a project, update the `projects` array in `js/projects.js`; keep each project's `slug` unique because it is used in the project URL. The contact form requires a configured Supabase project and its Edge Function to submit messages.

## Contact

For inquiries, use the [contact section](https://heaven0318.github.io/heavens-space/#contact) or email [cedrickyoshpereyra@gmail.com](mailto:cedrickyoshpereyra@gmail.com).
